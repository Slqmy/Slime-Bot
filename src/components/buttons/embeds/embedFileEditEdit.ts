import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputStyle,
	TextInputBuilder,
} from "discord.js";
import {Button} from "types";

export const embedFileEditEdit: Button = {
	async execute(interaction) {
		interaction.showModal(
			new ModalBuilder()
				.setTitle("Edit File")
				.setCustomId("embedFileEditEdit")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel("File Link")
							.setCustomId("link")
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder("File Link"),
					),
				),
		);
	},
};
