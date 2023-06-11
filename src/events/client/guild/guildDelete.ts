import {Event} from "types";
import guildSettingsSchema from "../../../schemas/guildSettingsSchema.js";

export const guildDelete: Event<"guildDelete"> = {
	execute: async (_client, guild) =>
		guildSettingsSchema.deleteOne({id: guild.id}),
};
