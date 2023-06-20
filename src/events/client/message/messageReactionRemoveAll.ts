import {APIEmbed, TextChannel} from "discord.js";
import {ClientEvent, MongooseDocument} from "types";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";

export const messageReactionRemoveAll: ClientEvent<"messageReactionRemoveAll"> =
	{
		async execute(client, message, reactions) {
			const {guild} = message;

			if (guild) {
				const guildData = (await GuildDataSchema.findOne({
					id: guild.id,
				})) as MongooseDocument<IGuildDataSchema>;

				// Checking if the message that all reactions have been removed from was a starboard message.
				// If it was, then the starboard message is updated.

				// It has to be done like this, as emitting the "messageReactionRemove" client event won't work.
				// This is because the " reactions" parameter actually represents the *removed* reactions, not the updated ones.
				// So if the event were to be emitted, then the message wouldn't be updated, as the count of the reactions is technically still the same.

				// This *should* work for the poll system however, because the message reactions are counted in the PollMessage class.
				if (!guildData.settings?.starboard?.disabled) {
					for (const channel of guildData.settings?.starboard?.channels ?? []) {
						const starredMessageID = channel.starredMessageIDs?.[message.id];

						// Message sent in starboard channel.
						if (starredMessageID) {
							// The assertion is safe as we know that the channel exists (starboard data is deleted from the database when the starboard channel is deleted)
							// The bot also checks that the channel is a text channel when the user inputs the ID/link, therefore the channel has to be an instance of the TextChannel type.
							// channel.channelID has to be a string since the input requires that.
							const starboardChannel = (await guild.channels.fetch(
								channel.channelID,
							)) as TextChannel;

							const starredMessage = await starboardChannel.messages.fetch(
								starredMessageID,
							);

							const {title} = starredMessage.embeds[0].data;

							// Assertion necessary because the embed needs to be edited.
							// Updating the reaction count.
							(starredMessage.embeds[0].data as APIEmbed).title = (
								title as string
							).replace(/> \d+/, "> 0");

							await starredMessage.edit({
								embeds: starredMessage.embeds,
							});
						}
					}
				}
			}

			// I don't know why, but TypeScript thinks that type 'never' is needed here.
			// It just doesn't work otherwise...
			for (const reaction of reactions) {
				client.emit("messageReactionRemove" as never, reaction[1]);
			}
		},
	};
