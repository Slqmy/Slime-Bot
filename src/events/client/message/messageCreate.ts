import {Colours, PunctuationRegExp, URLRegExp} from "../../../utility.js";
import {evaluate, isComplex, isResultSet} from "mathjs";
import Decimal from "decimal.js";
import {Event} from "types";
import GuildSettingsSchema from "../../../schemas/GuildSettingsSchema.js";
import UserDataSchema from "../../../schemas/UserDataSchema.js";
import mongoose from "mongoose";

export const messageCreate: Event<"messageCreate"> = {
	async execute(_client, message) {
		const {guild, author, content, attachments, channel} = message;

		if (guild) {
			const guildSettings = await GuildSettingsSchema.findOne({id: guild.id});

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

				if (!userData) {
					userData = new UserDataSchema({
						_id: new mongoose.Types.ObjectId(),
						id: author.id,
						experience: {
							[guild.id]: 0,
						},
					});
				}

				userData.experience[guild.id] ??= 0;

				const userExperience = userData.experience[guild.id];
				// Use an inverse function to calculate the user level.
				const userLevel = new Decimal(-1.5)
					.plus(new Decimal(userExperience).plus(56.25).sqrt().dividedBy(5))
					.floor()
					.toNumber();

				let randomNumber = Math.random() * 10;

				// eslint-disable-next-line no-unused-expressions
				randomNumber >= 5 ? (randomNumber = Math.random()) : null;

				let earnedExperience: Decimal | number = new Decimal(5)
					.plus(content.match(PunctuationRegExp)?.length ?? 0)
					.plus(new Decimal(content.length).dividedBy(10))
					// TODO: Get a better sentence end regex.
					.plus(
						2 * (content.match(/[^ \r\n][^!?.\r\n]+[\w!?.]+/g)?.length ?? 0),
					)
					.plus(3 * (content.match(/\n\s*/g)?.length ?? 0))
					.plus(4 * (content.match(/\s+\n\s*\n\s+/g)?.length ?? 0))
					// TODO: Get a better word end regex.
					.plus(new Decimal(0.1).times(content.split(/ +/g).length ?? 0))
					.plus(content.match(URLRegExp)?.length ?? 0)
					.plus(3 * attachments.size)
					.plus(randomNumber);

				earnedExperience = (
					earnedExperience.greaterThan(50)
						? new Decimal(5)
						: earnedExperience.lessThan(5)
						? new Decimal(5)
						: earnedExperience
				)
					.round()
					.toNumber();

				userData.experience[guild.id] += earnedExperience;

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
								description: `Congratulation, <@${author.id}>, You have reached level ${newUserLevel}!`,
								color: Colours.Transparent,
							},
						],
					});
				}

				// Not sure why, but Document.save() doesn't work here.
				await UserDataSchema.updateOne({id: author.id}, userData);
			}
		}
	},
};
