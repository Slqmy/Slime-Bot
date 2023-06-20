import {ClientEvent, MongooseDocument} from "types";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";
import {getExpressionValue, invertObject} from "../../../utility.js";

export const messageDelete: ClientEvent<"messageDelete"> = {
	async execute(_client, message) {
		const {guildId, channel} = message;

		if (guildId) {
			const guildData = (await GuildDataSchema.findOne({
				id: guildId,
			})) as MongooseDocument<IGuildDataSchema>;

			const {settings} = guildData;

			// Checking if a starboard message has been deleted.
			settings?.starboard?.channels.forEach((starboardChannel) => {
				if (starboardChannel.starredMessageIDs) {
					// Normally - original message ID: starboard channel message ID.
					// After inverting - starboard channel message ID: original message ID.
					const invertedStarredMessageIDs = invertObject(
						starboardChannel.starredMessageIDs,
					);

					// Get the ID of the original message based on the ID of the starboard channel message. (If the message ID is one of the message IDs saved in saved in the starboard channel)
					const originalMessageID = invertedStarredMessageIDs[message.id];

					if (
						originalMessageID // A message in the starboard channel is deleting.
					) {
						// Delete the normal key - value pair of the original message ID - the starboard channel message ID.
						// This is because this value doesn't have to be stored anymore, as the message in the starboard channel was deleted.
						delete starboardChannel.starredMessageIDs[originalMessageID];
					}
				}
			});

			// Checking if a message in a counting channel has been deleted.
			if (
				message.content &&
				settings?.counting?.channels.filter(
					(countingChannel) => countingChannel.channelID === message.channelId,
				).length
			) {
				const expressionValue = getExpressionValue(message.content);

				if (!isNaN(expressionValue)) {
					// A for loop is needed here instead of forEach() because channel.send is asynchronous.
					for await (const countingChannel of settings.counting.channels) {
						if (expressionValue === countingChannel.count) {
							await channel.send({
								content: `<@${message.author?.id}> » ${expressionValue}`,
								allowedMentions: {
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
