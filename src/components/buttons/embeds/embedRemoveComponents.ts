import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {capitaliseFirst} from "../../../functions.js";

export default {
	data: {
		name: "embedRemoveComponents",
	},
	async execute(interaction) {
		const match = capitaliseFirst(
			interaction.message.embeds[0].data.title.match(
				/(?<= - Editing )\w+(?=s$)/,
			)[0],
		);

		await interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedRemoveComponents")
				.setTitle(`Remove ${match}`)
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setLabel("Name")
							.setCustomId("name")
							.setPlaceholder(
								`${match} ${
									match === "Embed" ? "title" : "name"
								} or index, remove multiple by separating ${
									match === "Embed" ? "titles" : "names"
								} or indexes with commas.`,
							)
							.setStyle(TextInputStyle.Paragraph),
					),
				),
		);
	},
};
