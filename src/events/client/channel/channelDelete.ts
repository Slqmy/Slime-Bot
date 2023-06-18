import {Event} from "types";
import {GuildChannel} from "discord.js";
import GuildDataSchema from "../../../schemas/GuildDataSchema.js";

export const channelDelete: Event<"channelDelete"> = {
	async execute(_client, channel) {
		if (channel instanceof GuildChannel) {
			const {guild} = channel;

			const guildData = await GuildDataSchema.findOne({id: guild.id});

			// Starboard channel deletion check.
			if (guildData?.settings?.starboard?.channels.length) {
				guildData.settings?.starboard.channels.forEach(
					(starboardChannel, index) => {
						if (starboardChannel.channelID === channel.id) {
							guildData.settings?.starboard?.channels.splice(index, 1);
						}
					},
				);

				await guildData.save();
			}

			// YouTube notification poster Discord channel deletion check.
			if (guildData?.settings?.youtube?.channels.length) {
				guildData.settings?.youtube.channels.forEach(
					(channelSettings, index) => {
						if (channelSettings.discordChannelID === channel.id) {
							guildData.settings?.youtube?.channels.splice(index, 1);
						}
					},
				);
			}

			// Counting channel deletion check.
			if (guildData?.settings?.counting?.channels.length) {
				guildData.settings?.counting.channels.forEach(
					(countingChannel, index) => {
						if (countingChannel.channelID === channel.id) {
							guildData.settings?.counting?.channels.splice(index, 1);
						}
					},
				);
			}
		}
	},
};
