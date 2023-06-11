import {Event} from "types";
import {GuildChannel} from "discord.js";
import GuildSettingsSchema from "../../../schemas/GuildSettingsSchema.js";

export const channelDelete: Event<"channelDelete"> = {
	async execute(_client, channel) {
		if (channel instanceof GuildChannel) {
			const {guild} = channel;

			const guildSettings = await GuildSettingsSchema.findOne({id: guild.id});

			// Starboard channel deletion check.
			if (guildSettings?.starboard?.channels.length) {
				guildSettings.starboard.channels.forEach((starboardChannel, index) => {
					if (starboardChannel.channelID === channel.id) {
						guildSettings.starboard?.channels.splice(index, 1);
					}
				});

				await guildSettings.save();
			}

			// YouTube notification poster Discord channel deletion check.
			if (guildSettings?.youtube?.channels.length) {
				guildSettings.youtube.channels.forEach((channelSettings, index) => {
					if (channelSettings.discordChannelID === channel.id) {
						guildSettings.youtube?.channels.splice(index, 1);
					}
				});
			}

			// Counting channel deletion check.
			if (guildSettings?.counting?.channels.length) {
				guildSettings.counting.channels.forEach((countingChannel, index) => {
					if (countingChannel.channelID === channel.id) {
						guildSettings.counting?.channels.splice(index, 1);
					}
				});
			}
		}
	},
};
