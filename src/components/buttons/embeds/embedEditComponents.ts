import {EmbedComponentMessageBuilder} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";

export const embedEditComponents: Button = {
	async execute(interaction) {
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
			new EmbedComponentMessageBuilder(embedProfile, null, interaction),
		);
	},
};
