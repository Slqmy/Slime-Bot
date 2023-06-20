import {ClientEvent, MongooseDocument} from "types";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";

export const emojiDelete: ClientEvent<"emojiDelete"> = {
	async execute(_client, emoji) {
		const {guild} = emoji;

		const guildData = (await GuildDataSchema.findOne({
			id: emoji.guild.id,
		})) as MongooseDocument<IGuildDataSchema>;

		const {settings} = guildData;

		settings?.starboard?.channels.forEach((starboardChannel, index) => {
			if (starboardChannel.emoji === emoji.id) {
				settings?.starboard?.channels.splice(index, 1);
			}
		});

		await GuildDataSchema.updateOne({id: guild.id}, guildData);
	},
};
