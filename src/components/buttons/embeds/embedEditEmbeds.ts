import {EmbedEmbedMessageBuilder} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";

export const embedEditEmbeds: Button = {
	async execute(interaction, client) {
		interaction.deferUpdate();
		const count = (
			/\d+/.exec(
				interaction.message.embeds[0].data.description as string,
			) as RegExpExecArray
		)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		interaction.message.edit(
			new EmbedEmbedMessageBuilder(embedProfile, null, client),
		);
	},
};
