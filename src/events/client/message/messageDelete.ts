import {evaluate, isComplex, isResultSet} from "mathjs";
import {Event} from "types";
import GuildDataSchema from "../../../schemas/GuildDataSchema.js";
import {invertObject} from "../../../utility.js";

export const messageDelete: Event<"messageDelete"> = {
	async execute(_client, message) {
		const {guildId, channel} = message;

		if (guildId) {
			const guildData = await GuildDataSchema.findOne({id: guildId});

			if (guildData?.settings?.starboard?.channels.length) {
				guildData.settings?.starboard.channels.forEach(
					(starboardChannel, index) => {
						if (starboardChannel.starredMessageIDs) {
							// Normally - original message ID: starboard channel message ID.
							// After inverting - starboard channel message ID: original message ID.
							const invertedStarredMessageIDs = invertObject(
								starboardChannel.starredMessageIDs,
							);

							// Get the ID of the original message based on the ID of the starboard channel message.
							const originalMessageID = invertedStarredMessageIDs[message.id];

							if (
								originalMessageID // A starred message is deleted.
							) {
								// Delete the normal key - value pair of the original message ID - the starboard channel message ID.
								// It has to be done this weird way because I couldn't get it to work properly any other way.
								delete starboardChannel.starredMessageIDs[originalMessageID];

								// TypeScript would not shut up about guildData.settings?.starboard possibly being null even though that is impossible, so there is an if check here.
								if (guildData.settings?.starboard) {
									guildData.settings.starboard.channels[index] =
										starboardChannel;
								}
							}
						}
					},
				);

				await guildData.save();
			}

			if (message.content && guildData?.settings?.counting?.channels.length) {
				for (const countingChannel of guildData.settings.counting.channels) {
					if (countingChannel.channelID === message.channelId) {
						let evaluatedExpression;

						try {
							evaluatedExpression = evaluate(message.content);
						} catch (_error) {
							return;
						}

						const expressionValue = isComplex(evaluatedExpression)
							? evaluatedExpression.re
							: isResultSet(evaluatedExpression)
							? evaluatedExpression.entries[
									evaluatedExpression.entries.length - 1
							  ]
							: evaluatedExpression;

						if (expressionValue === countingChannel.count) {
							await channel.send({
								content: `<@${message.author?.id}> » ${expressionValue}`,
								allowedMentions: {
									parse: [],
									users: [],
								},
							});
						}
					}
				}
			}
		}
	},
};
