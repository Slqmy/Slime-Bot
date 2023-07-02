import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {Button} from "types";

export const embedFileRemove: Button = {
	async execute(interaction) {
		interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedFileRemove")
				.setTitle("Remove File")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel("Name")
							.setCustomId("name")
							.setPlaceholder(
								"File names, remove multiple by separating names with commas. ",
							)
							.setStyle(TextInputStyle.Paragraph),
					),
				),
		);
	},
};
