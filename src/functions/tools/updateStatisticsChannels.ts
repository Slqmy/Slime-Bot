import {updateStatisticsChannel} from "../../utility.js";
import GuildDataSchema from "../../schemas/GuildDataSchema.js";
import {BotClient} from "types";
import {VoiceChannel} from "discord.js";

export default (client: BotClient) => {
	client.updateStatisticsChannels = async () => {
		const guilds = await GuildDataSchema.find();

		for (const guild of guilds) {
			if (Object.keys(guild.statisticsChannels ?? {}).length) {
				for (const key in guild.statisticsChannels) {
					const channel = (await client.channels.fetch(key)) as VoiceChannel;

					updateStatisticsChannel(channel, client);
				}
			}
		}
	};
};
