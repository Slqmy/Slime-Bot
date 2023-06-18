import {Event} from "types";
import GuildDataSchema from "../../../schemas/GuildDataSchema.js";

export const guildDelete: Event<"guildDelete"> = {
	execute: async (_client, guild) =>
		await GuildDataSchema.deleteOne({id: guild.id}),
};
