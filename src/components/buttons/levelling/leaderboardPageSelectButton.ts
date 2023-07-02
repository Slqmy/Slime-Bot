import {Button} from "types";
import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

export const leaderboardPageSelectButton: Button = {
	async execute(interaction) {
		await interaction.showModal(
			new ModalBuilder()
				.setTitle("Select Page")
				.setCustomId("leaderboardPageSelectModal")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel("Page")
							.setCustomId("page")
							.setPlaceholder("Leaderboard page...")
							.setRequired(true)
							.setStyle(TextInputStyle.Short),
					),
				),
		);
	},
};
