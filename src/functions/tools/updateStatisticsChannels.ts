import GuildDataSchema from "../../schemas/GuildDataSchema.js";
import {BotClient} from "types";

export default (client: BotClient) => {
	client.updateStatisticsChannels = async () => {
		if (channelID) {
		} else {
			const guilds = await GuildDataSchema.find();

			for (const guild of guilds) {
			}
		}
	};
};
