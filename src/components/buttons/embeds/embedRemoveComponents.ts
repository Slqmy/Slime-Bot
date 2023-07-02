import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {capitaliseFirstLetter} from "../../../utility.js";
import {Button} from "types";

export const embedRemoveComponents: Button = {
	async execute(interaction) {
		const match = capitaliseFirstLetter(
			(
				/(?<= - Editing )\w+(?=s$)/.exec(
					interaction.message.embeds[0].data.title as string,
				) as RegExpExecArray
			)[0],
		);

		await interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedRemoveComponents")
				.setTitle(`Remove ${match}`)
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
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
