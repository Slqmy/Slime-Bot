import {Event} from "types";
import GuildDataSchema from "../../../schemas/GuildDataSchema.js";
import mongoose from "mongoose";

export const guildCreate: Event<"guildCreate"> = {
	async execute(_client, guild) {
		const guildSettings = new GuildDataSchema({
			_id: new mongoose.Types.ObjectId(),
			id: guild.id,
		});

		await guildSettings.save();
	},
};
