import {EmbedsMessageBuilder} from "../../../utility.js";
import {Button} from "types";
import {APIEmbedFooter} from "discord.js";

export const embedBackBack: Button = {
	async execute(interaction, client) {
		await interaction.deferUpdate();

		const count = parseInt(
			(
				/\d+/.exec(
					(interaction.message.embeds[0].data.footer as APIEmbedFooter).text,
				) as RegExpExecArray
			)[0],
		);

		await interaction.message.edit(
			await new EmbedsMessageBuilder().create(
				interaction,
				client,
				() => count / 25,
			),
		);
	},
};
