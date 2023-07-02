import {APIEmbedFooter} from "discord.js";
import {EmbedMessageBuilder, addNumberSuffix} from "../../../utility.js";
import {Button} from "types";

export const embedBack: Button = {
	async execute(interaction, client) {
		await interaction.deferUpdate();

		const count = (
			/\d+/.exec(
				(interaction.message.embeds[0].data.footer as APIEmbedFooter).text,
			) as RegExpExecArray
		)[0];

		await interaction.message.edit(
			await new EmbedMessageBuilder().create(
				interaction,
				client,
				count,
				`Currently editing your \`${count}${addNumberSuffix(
					count,
				)}\` embed builder! Select what you would like to \n> do with it below.`,
			),
		);
	},
};
