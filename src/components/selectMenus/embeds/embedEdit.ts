import {
	EmbedFileMessageBuilder,
	EmbedEmbedMessageBuilder,
	EmbedComponentMessageBuilder,
} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {SelectMenu} from "types";

export const embedEdit: SelectMenu = {
	async execute(interaction, client) {
		const embed = interaction.message.embeds[0].data;

		const match = (
			/(?<= - Editing )\w+(?=s$)/.exec(embed.title as string) as RegExpExecArray
		)[0];

		const id = (/\d+/.exec(embed.description as string) as RegExpExecArray)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id,
		});

		let embedMessage;

		switch (match) {
			case "file":
				embedMessage = new EmbedFileMessageBuilder(
					embedProfile,
					parseInt(interaction.values[0]),
					client,
				);
				break;
			case "embed":
				embedMessage = new EmbedEmbedMessageBuilder(
					embedProfile,
					parseInt(interaction.values[0]),
					client,
				);
				break;
			case "component":
				embedMessage = new EmbedComponentMessageBuilder(
					embedProfile,
					parseInt(interaction.values[0]),
					client,
				);
				break;
		}

		await interaction.deferUpdate();
		await interaction.message.edit(embedMessage);
	},
};
