import {Event, MongooseDocument} from "types";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";

export const roleDelete: Event<"roleDelete"> = {
	async execute(_client, role) {
		const {guild} = role;

		const guildData = (await GuildDataSchema.findOne({
			id: guild.id,
		})) as MongooseDocument<IGuildDataSchema>;

		for (const channel of guildData.settings?.youtube?.channels ?? []) {
			if (channel.pingRoleID === role.id) delete channel.pingRoleID;
		}

		for (const channel of guildData.settings?.starboard?.channels ?? []) {
			if (channel.pingRoleID === role.id) delete channel.pingRoleID;
		}

		await guildData.save();
	},
};
