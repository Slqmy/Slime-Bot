import {ClientEvent, MongooseDocument} from "types";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";

export const roleDelete: ClientEvent<"roleDelete"> = {
	async execute(_client, role) {
		const {guild} = role;

		const guildData = (await GuildDataSchema.findOne({
			id: guild.id,
		})) as MongooseDocument<IGuildDataSchema>;

		const {settings} = guildData;

		settings?.youtube?.channels.forEach((channel) => {
			if (channel.pingRoleID === role.id) delete channel.pingRoleID;
		});

		settings?.starboard?.channels.forEach((channel) => {
			if (channel.pingRoleID === role.id) delete channel.pingRoleID;
		});

		await GuildDataSchema.updateOne({id: guild.id}, guildData);
	},
};
