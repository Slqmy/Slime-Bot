import {ClientEvent} from "types";
import GuildDataSchema from "../../../schemas/GuildDataSchema.js";
import mongoose from "mongoose";

export const guildCreate: ClientEvent<"guildCreate"> = {
	async execute(_client, guild) {
		await new GuildDataSchema({
			_id: new mongoose.Types.ObjectId(),
			id: guild.id,
		}).save();
	},
};
