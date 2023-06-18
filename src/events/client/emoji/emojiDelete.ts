import {Event} from "types";
import GuildDataSchema from "../../../schemas/GuildDataSchema.js";

export const emojiDelete: Event<"emojiDelete"> = {
	async execute(_client, emoji) {
		const guildData = await GuildDataSchema.findOne({
			id: emoji.guild.id,
		});

		if (guildData?.settings?.starboard?.channels.length) {
			guildData.settings?.starboard?.channels.forEach(
				(starboardChannel, index) => {
					if (starboardChannel.emoji === emoji.id) {
						guildData.settings?.starboard?.channels.splice(index, 1);
					}
				},
			);

			await guildData.save();
		}
	},
};
