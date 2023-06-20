import {ClientEvent, MongooseDocument} from "types";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";
import {GuildChannel} from "discord.js";

export const channelDelete: ClientEvent<"channelDelete"> = {
	async execute(_client, channel) {
		if (channel instanceof GuildChannel) {
			const {guild} = channel;

			const guildData = (await GuildDataSchema.findOne({
				id: guild.id,
			})) as MongooseDocument<IGuildDataSchema>;

			const {settings} = guildData;

			// Starboard channel deletion check.
			settings?.starboard?.channels.forEach((starboardChannel, index) => {
				if (starboardChannel.channelID === channel.id) {
					settings?.starboard?.channels.splice(index, 1);
				}
			});

			// YouTube notification poster Discord channel deletion check.
			settings?.youtube?.channels.forEach((channelSettings, index) => {
				if (channelSettings.discordChannelID === channel.id) {
					settings?.youtube?.channels.splice(index, 1);
				}
			});

			// Counting channel deletion check.
			settings?.counting?.channels.forEach((countingChannel, index) => {
				if (countingChannel.channelID === channel.id) {
					settings?.counting?.channels.splice(index, 1);
				}
			});

			await GuildDataSchema.updateOne({id: guild.id}, guildData);
		}
	},
};
