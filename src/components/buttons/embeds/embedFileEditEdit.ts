import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputStyle,
	TextInputBuilder,
} from "discord.js";

export default {
	data: {
		name: "embedFileEditEdit",
	},
	async execute(interaction) {
		interaction.showModal(
			new ModalBuilder()
				.setTitle("Edit File")
				.setCustomId("embedFileEditEdit")
				.addComponents(
					new ActionRowBuilder().addComponents(
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
