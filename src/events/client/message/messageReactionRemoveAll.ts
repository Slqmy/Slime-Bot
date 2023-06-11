import {APIEmbed, TextChannel} from "discord.js";
import {Event} from "types";
import guildSettingsSchema from "../../../schemas/guildSettingsSchema.js";

export const messageReactionRemoveAll: Event<"messageReactionRemoveAll"> = {
	async execute(client, message, reactions) {
		const {guild} = message;

		if (guild) {
			const guildSettings = await guildSettingsSchema.findOne({id: guild.id});

			const starboardChannels = guildSettings?.starboard?.channels;

			if (starboardChannels?.length) {
				for (const channel of starboardChannels) {
					const starredMessageID = channel.starredMessageIDs[message.id] as
						| string
						| undefined;

					// Message sent in starboard channel.
					if (starredMessageID) {
						// The assertion is safe as we know that the channel exists (starboard data is deleted from the database when the starboard channel is deleted)
						// The bot also checks that the channel is a text channel when the user inputs the ID/link, therefore the channel has to be an instance of the TextChannel type.
						// channel.channelID has to be a string since the input requires that.
						const starboardChannel = (await guild.channels.fetch(
							channel.channelID as string,
						)) as TextChannel;

						const starredMessage = await starboardChannel.messages.fetch(
							starredMessageID,
						);

						const {title} = starredMessage.embeds[0].data;

						// Assertion necessary because the embed needs to be edited.
						// Updating the reaction count.
						(starredMessage.embeds[0].data as APIEmbed).title = title?.replace(
							/> \d+/,
							"> 0",
						);

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
