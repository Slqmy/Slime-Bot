import GuildDataSchema from "schemas/GuildDataSchema";
import {BotClient} from "types";

export default (client: BotClient) => {
	client.updateStatisticsChannels = async (channelID?) => {
		if (channelID) {
		} else {
			const guilds = await GuildDataSchema.find();

			for (const guild of guilds) {
			}
		}
	};
};
