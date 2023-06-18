import {Colours, PunctuationRegExp, URLRegExp} from "../../../utility.js";
import {evaluate, isComplex, isResultSet} from "mathjs";
import Decimal from "decimal.js";
import {Event} from "types";
import GuildDataSchema from "../../../schemas/GuildDataSchema.js";
import UserDataSchema from "../../../schemas/UserDataSchema.js";
import mongoose from "mongoose";

export const messageCreate: Event<"messageCreate"> = {
	async execute(_client, message) {
		const {guild, author, content, attachments, channel} = message;

		if (guild) {
			const guildSettings = await GuildDataSchema.findOne({id: guild.id});

			if (guildSettings?.counting?.channels.length) {
				guildSettings.counting.channels.forEach((countingChannel, index) => {
					if (message.channelId === countingChannel.channelID && !author.bot) {
						const count = countingChannel.count ?? 0;

						let evaluatedExpression;

						try {
							evaluatedExpression = evaluate(message.content);
						} catch (_error) {
							message.delete().catch(console.error);
						}

						const expressionValue = isComplex(evaluatedExpression)
							? evaluatedExpression.re
							: isResultSet(evaluatedExpression)
							? evaluatedExpression.entries[
									evaluatedExpression.entries.length - 1
							  ]
							: evaluatedExpression;

						if (
							author.id !== countingChannel.latestCountAuthorID &&
							expressionValue === count + 1 &&
							guildSettings.counting
						) {
							guildSettings.counting.channels[index].count = count + 1;
							guildSettings.counting.channels[index].latestCountAuthorID =
								author.id;
						} else message.delete().catch(console.error);
					}
				});

				await guildSettings.save();
			}

			if (!author.bot) {
				let userData = await UserDataSchema.findOne({id: author.id});

				if (
					Date.now() -
						(userData?.experience?.[guild.id]?.lastMessageTimestamp ?? 0) >
					(guildSettings?.levels?.coolDown ?? 20000)
				) {
					if (!userData) {
						userData = new UserDataSchema({
							_id: new mongoose.Types.ObjectId(),
							id: author.id,
							experience: {
								[guild.id]: {
									experience: 0,
								},
							},
						});

						await userData.save();
					}

					userData.experience ??= {};

					userData.experience[guild.id] ??= {
						experience: 0,
					};

					userData.experience[guild.id].lastMessageTimestamp =
						message.createdTimestamp;

					const userExperience = userData.experience[guild.id].experience;

					// Use an inverse function to calculate the user level.
					const userLevel = new Decimal(-1.5)
						.plus(new Decimal(userExperience).plus(56.25).sqrt().dividedBy(5))
						.floor()
						.toNumber();

					const minRandomXP = guildSettings?.levels?.minRandomXP ?? 5;
					const maxRandomXP = guildSettings?.levels?.maxRandomXP ?? 5;

					const randomNumber = new Decimal(minRandomXP).plus(
						new Decimal(maxRandomXP).minus(minRandomXP).times(Math.random()),
					);

					// eslint-disable-next-line no-unused-expressions

					// 1XP per punctuation.
					let earnedExperience: Decimal | number = new Decimal(
						new Decimal(guildSettings?.levels?.punctuationBonus ?? 1).times(
							content.match(PunctuationRegExp)?.length ?? 0,
						),
					)
						// 0.1 XP per character.
						.plus(
							new Decimal(guildSettings?.levels?.characterBonus ?? 0.1).times(
								content.length,
							),
						)
						// TODO: Get a better sentence end regex.
						// 2 XP per sentence.
						.plus(
							new Decimal(guildSettings?.levels?.sentenceBonus ?? 2).times(
								content.match(/[^ \r\n][^!?.\r\n]+[\w!?.]+/g)?.length ?? 0,
							),
						)
						// 3 XP per newline.
						.plus(
							new Decimal(guildSettings?.levels?.lineBonus ?? 3).times(
								content.match(/\n\s*/g)?.length ?? 0,
							),
						)
						// 4 XP per two newlines in a row.
						.plus(
							new Decimal(guildSettings?.levels?.paragraphBonus ?? 4).times(
								content.match(/\s+\n\s*\n\s+/g)?.length ?? 0,
							),
						)
						// TODO: Get a better word end regex.
						// 0.1 XP per word.
						.plus(
							new Decimal(guildSettings?.levels?.wordBonus ?? 0.1).times(
								content.split(/ +/g).length ?? 0,
							),
						)
						// 1 XP per link.
						.plus(
							new Decimal(guildSettings?.levels?.linkBonus ?? 1).times(
								content.match(URLRegExp)?.length ?? 0,
							),
						)
						// 3 XP per attachment.
						.plus(
							new Decimal(guildSettings?.levels?.attachmentBonus ?? 3).times(
								attachments.size,
							),
						)
						.plus(randomNumber);

					// Min 5 XP, Max 50 XP.
					earnedExperience = (
						earnedExperience.greaterThan(
							guildSettings?.levels?.maxMessageXP ?? 50,
						)
							? new Decimal(guildSettings?.levels?.maxMessageXP ?? 50)
							: earnedExperience.lessThan(
									guildSettings?.levels?.minMessageXP ?? 5,
							  )
							? new Decimal(guildSettings?.levels?.minMessageXP ?? 5)
							: earnedExperience
					)
						.round()
						.toNumber();

					userData.experience[guild.id].experience += earnedExperience;

					// Use the inverse function again to calculate the new user level.
					const newUserLevel = new Decimal(-1.5)
						.plus(
							new Decimal(userExperience + earnedExperience)
								.plus(56.25)
								.sqrt()
								.dividedBy(5),
						)
						.floor()
						.toNumber();

					if (newUserLevel !== userLevel) {
						await channel.send({
							embeds: [
								{
									description: `Congratulations, <@${author.id}>, You have reached level ${newUserLevel}!`,
									color: Colours.Transparent,
								},
							],
						});
					}

					// Not sure why, but Document.save() doesn't work here.
					await UserDataSchema.updateOne({id: author.id}, userData);
				}
			}
		}
	},
};
