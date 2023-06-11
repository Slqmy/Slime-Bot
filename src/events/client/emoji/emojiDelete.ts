import {Event} from "types";
import GuildSettingsSchema from "../../../schemas/GuildSettingsSchema.js";

export const emojiDelete: Event<"emojiDelete"> = {
	async execute(_client, emoji) {
		const guildSettings = await GuildSettingsSchema.findOne({
			id: emoji.guild.id,
		});

		if (guildSettings?.starboard?.channels.length) {
			guildSettings.starboard?.channels.forEach((starboardChannel, index) => {
				if (starboardChannel.emojiID === emoji.id) {
					guildSettings.starboard?.channels.splice(index, 1);
				}
			});

			await guildSettings.save();
		}
	},
};
