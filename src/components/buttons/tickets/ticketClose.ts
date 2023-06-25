import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	TextChannel,
} from "discord.js";
import {Button} from "types";
import {QueryMessage} from "../../../utility.js";

export const ticketClose: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();

		await (interaction.channel as TextChannel).send({
			embeds: [
				{
					...new QueryMessage(
						"Are you sure you would like to close the ticket?",
					).embeds[0],
				},
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setLabel("Close")
						.setStyle(ButtonStyle.Danger)
						.setCustomId("ticketCloseConfirm"),
					new ButtonBuilder()
						.setLabel("Cancel")
						.setStyle(ButtonStyle.Secondary)
						.setCustomId("ticketCloseCancel"),
				),
			],
		});
	},
};
