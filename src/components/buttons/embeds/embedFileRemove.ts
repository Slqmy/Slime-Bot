import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

export default {
	data: {
		name: "embedFileRemove",
	},
	async execute(interaction) {
		interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedFileRemove")
				.setTitle("Remove File")
				.addComponents(
					new ActionRowBuilder().addComponents(
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
