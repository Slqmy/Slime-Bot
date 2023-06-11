import {Event} from "types";
import GuildSettingsSchema from "../../../schemas/GuildSettingsSchema.js";

export const guildDelete: Event<"guildDelete"> = {
	execute: async (_client, guild) =>
		GuildSettingsSchema.deleteOne({id: guild.id}),
};
