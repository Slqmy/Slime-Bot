import {Colours, PunctuationRegExp, URLRegExp} from "../../../utility.js";
import {evaluate, isComplex, isResultSet} from "mathjs";
import Decimal from "decimal.js";
import {Event} from "types";
import GuildDataSchema from "../../../schemas/GuildDataSchema.js";

export const messageCreate: Event<"messageCreate"> = {
	async execute(_client, message) {
		const {guildId, author, content, attachments, channel} = message;

		const guildData = await GuildDataSchema.findOne({id: guildId});

		if (guildData) {
			if (guildData?.settings?.counting?.channels.length) {
				guildData.settings?.counting.channels.forEach(
					(countingChannel, index) => {
						if (
							message.channelId === countingChannel.channelID &&
							!author.bot
						) {
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
								guildData.settings?.counting
							) {
								guildData.settings.counting.channels[index].count = count + 1;
								guildData.settings.counting.channels[
									index
								].latestCountAuthorID = author.id;
							} else message.delete().catch(console.error);
						}
					},
				);

				await guildData.save();
			}

			if (!author.bot) {
				guildData.userExperienceData ??= {};
				guildData.userExperienceData[author.id] ??= {
					experience: 0,
					lastMessageTimestamp: message.createdTimestamp,
				};

				const userData = guildData.userExperienceData[author.id];

				if (
					Date.now() - (userData?.lastMessageTimestamp ?? 0) >
					(guildData.settings?.levelling?.coolDown ?? 20000)
				) {
					const userExperience = userData.experience;

					// Use an inverse function to calculate the user level.
					const userLevel = new Decimal(-1.5)
						.plus(new Decimal(userExperience).plus(56.25).sqrt().dividedBy(5))
						.floor()
						.toNumber();

					const minRandomXP = guildData.settings?.levelling?.minRandomXP ?? 5;
					const maxRandomXP = guildData.settings?.levelling?.maxRandomXP ?? 10;

					const randomNumber = new Decimal(minRandomXP).plus(
						new Decimal(maxRandomXP).minus(minRandomXP).times(Math.random()),
					);

					// eslint-disable-next-line no-unused-expressions

					// 1XP per punctuation.
					let earnedExperience: Decimal | number = new Decimal(
						new Decimal(
							guildData.settings?.levelling?.punctuationBonus ?? 1,
						).times(content.match(PunctuationRegExp)?.length ?? 0),
					)
						// 0.1 XP per character.
						.plus(
							new Decimal(
								guildData.settings?.levelling?.characterBonus ?? 0.1,
							).times(content.length),
						)
						// TODO: Get a better sentence end regex.
						// 2 XP per sentence.
						.plus(
							new Decimal(
								guildData.settings?.levelling?.sentenceBonus ?? 2,
							).times(
								content.match(/[^ \r\n][^!?.\r\n]+[\w!?.]+/g)?.length ?? 0,
							),
						)
						// 3 XP per newline.
						.plus(
							new Decimal(guildData.settings?.levelling?.lineBonus ?? 3).times(
								content.match(/\n\s*/g)?.length ?? 0,
							),
						)
						// 4 XP per two newlines in a row.
						.plus(
							new Decimal(
								guildData.settings?.levelling?.paragraphBonus ?? 4,
							).times(content.match(/\s+\n\s*\n\s+/g)?.length ?? 0),
						)
						// TODO: Get a better word end regex.
						// 0.1 XP per word.
						.plus(
							new Decimal(
								guildData.settings?.levelling?.wordBonus ?? 0.1,
							).times(content.split(/ +/g).length ?? 0),
						)
						// 1 XP per link.
						.plus(
							new Decimal(guildData.settings?.levelling?.linkBonus ?? 1).times(
								content.match(URLRegExp)?.length ?? 0,
							),
						)
						// 3 XP per attachment.
						.plus(
							new Decimal(
								guildData.settings?.levelling?.attachmentBonus ?? 3,
							).times(attachments.size),
						)
						.plus(randomNumber);

					// Min 5 XP, Max 50 XP.
					earnedExperience = (
						earnedExperience.greaterThan(
							guildData.settings?.levelling?.maxMessageXP ?? 50,
						)
							? new Decimal(guildData.settings?.levelling?.maxMessageXP ?? 50)
							: earnedExperience.lessThan(
									guildData.settings?.levelling?.minMessageXP ?? 5,
							  )
							? new Decimal(guildData.settings?.levelling?.minMessageXP ?? 5)
							: earnedExperience
					)
						.round()
						.toNumber();

					guildData.userExperienceData[author.id].experience +=
						earnedExperience;

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

					await guildData.save();
				}
			}
		}
	},
};
