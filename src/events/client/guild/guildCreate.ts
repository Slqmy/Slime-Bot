import {Event} from "types";
import GuildSettingsSchema from "../../../schemas/GuildSettingsSchema.js";
import mongoose from "mongoose";

export const guildCreate: Event<"guildCreate"> = {
	async execute(_client, guild) {
		const guildSettings = new GuildSettingsSchema({
			_id: new mongoose.Types.ObjectId(),
			id: guild.id,
		});

		await guildSettings.save();
	},
};
