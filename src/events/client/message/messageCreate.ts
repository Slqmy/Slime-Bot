import {ClientEvent, MongooseDocument} from "types";
import {
	Colours,
	Emojis,
	NewLineRegExp,
	ParagraphRegExp,
	PunctuationRegExp,
	SentenceRegExp,
	URLRegExp,
	WordRegExp,
	experienceToLevel,
	getExpressionValue,
	limitNumber,
} from "../../../utility.js";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";
import Decimal from "decimal.js";

export const messageCreate: ClientEvent<"messageCreate"> = {
	async execute(_client, message) {
		const {guildId} = message;

		if (guildId) {
			const guildData = (await GuildDataSchema.findOne({
				id: guildId,
			})) as MongooseDocument<IGuildDataSchema>;

			const {author} = message;

			if (!author.bot) {
				const {content, channel} = message;
				const {settings} = guildData;

				// Updating counting channel count.
				const expressionValue = getExpressionValue(content);

				if (!isNaN(expressionValue)) {
					settings?.counting?.channels.forEach((countingChannel) => {
						if (channel.id === countingChannel.channelID) {
							const count = countingChannel.count ?? 0;

							if (
								author.id !== countingChannel.latestCountAuthorID &&
								expressionValue === count + 1 &&
								// TypeScript thinks that guildData.settings.counting could be null, even though that's impossible here.
								settings?.counting
							) {
								countingChannel.count = count + 1;
								countingChannel.latestCountAuthorID = author.id;
							} else message.delete().catch(console.error);
						}
					});
				}

				guildData.userExperienceData ??= {};
				const {userExperienceData} = guildData;

				userExperienceData[author.id] ??= {experience: 0};
				const userData = userExperienceData[author.id];

				if (
					message.createdTimestamp - (userData?.lastMessageTimestamp ?? 0) >
					(settings?.levelling?.coolDown ?? 20000)
				) {
					const {attachments} = message;

					userData.lastMessageTimestamp = message.createdTimestamp;
					const {experience} = userData;

					// Use the inverse function to calculate the user level.
					const userLevel = experienceToLevel(experience);

					const minRandomXP = settings?.levelling?.minRandomXP ?? 5;
					const maxRandomXP = settings?.levelling?.maxRandomXP ?? 10;

					const randomNumber = new Decimal(minRandomXP).plus(
						new Decimal(maxRandomXP).minus(minRandomXP).times(Math.random()),
					);

					// eslint-disable-next-line no-unused-expressions

					// 1XP per punctuation.
					let earnedExperience: Decimal | number = new Decimal(
						new Decimal(
							settings?.levelling?.punctuationBonus ?? 1,
							// Do not use RegExp.exec() here, as it behaves weird with regular expressions with global flags.
						).times(content.match(PunctuationRegExp)?.length ?? 0),
					)
						// 0.1 XP per character.
						.plus(
							new Decimal(settings?.levelling?.characterBonus ?? 0.1).times(
								content.length,
							),
						)
						// 2 XP per sentence.
						.plus(
							new Decimal(settings?.levelling?.sentenceBonus ?? 2).times(
								content.match(SentenceRegExp)?.length ?? 0,
							),
						)
						// 3 XP per newline.
						.plus(
							new Decimal(settings?.levelling?.lineBonus ?? 3).times(
								content.match(NewLineRegExp)?.length ?? 0,
							),
						)
						// 4 XP per two newlines in a row.
						.plus(
							new Decimal(settings?.levelling?.paragraphBonus ?? 4).times(
								content.match(ParagraphRegExp)?.length ?? 0,
							),
						)
						// 0.1 XP per word.
						.plus(
							new Decimal(settings?.levelling?.wordBonus ?? 0.1).times(
								content.split(WordRegExp).length ?? 0,
							),
						)
						// 1 XP per link.
						.plus(
							new Decimal(settings?.levelling?.linkBonus ?? 1).times(
								// Do not use RegExp.exec() here, as it behaves weird with regular expressions with global flags.
								content.match(URLRegExp)?.length ?? 0,
							),
						)
						// 3 XP per attachment.
						.plus(
							new Decimal(settings?.levelling?.attachmentBonus ?? 3).times(
								attachments.size,
							),
						)
						.plus(randomNumber);

					// Min 5 XP, Max 50 XP.
					earnedExperience = Math.round(limitNumber(earnedExperience, 5, 50));

					userData.experience += earnedExperience;

					// Use the inverse function again to calculate the new user level.
					const newUserLevel = experienceToLevel(experience + earnedExperience);

					if (newUserLevel !== userLevel) {
						await channel.send({
							embeds: [
								{
									description: `${Emojis.Slime} Congratulations, <@${author.id}>, You have reached level ${newUserLevel}!`,
									color: Colours.Transparent,
								},
							],
						});
					}
				}

				await GuildDataSchema.updateOne({id: guildId}, guildData);
			}
		}
	},
};
