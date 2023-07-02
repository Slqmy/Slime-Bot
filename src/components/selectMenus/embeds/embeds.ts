import {SelectMenu} from "types";
import {EmbedMessageBuilder, addNumberSuffix} from "../../../utility.js";

export const embeds: SelectMenu = {
	async execute(interaction, client) {
		const count = interaction.values[0];

		await interaction.message.edit(
			await new EmbedMessageBuilder().create(
				interaction,
				client,
				count,
				`Currently editing your \`${count}${addNumberSuffix(
					count,
				)}\` embed! Select what you would like to do with it below.`,
			),
		);

		await interaction.deferUpdate();
	},
};
