import {EmbedFileMessageBuilder} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";

export const embedEditFiles: Button = {
	async execute(interaction, client) {
		const count = parseInt(
			(
				/\d+/.exec(
					interaction.message.embeds[0].data.description as string,
				) as RegExpExecArray
			)[0],
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		await interaction.deferUpdate();

		await interaction.message.edit(
			new EmbedFileMessageBuilder(embedProfile, null, client),
		);
	},
};
