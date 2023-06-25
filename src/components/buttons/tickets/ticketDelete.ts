import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	TextChannel,
} from "discord.js";
import {Button} from "types";

export const ticketDelete: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();

		const channel = interaction.channel as TextChannel;
		const topic = channel.topic as string;

		await channel.send({
			embeds: [
				{
					description: `The ticket will be deleted <t:${Math.round(
						(Date.now() + 120000) / 1000,
					)}:R>.`,
					color: Colors.Red,
				},
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setLabel("Cancel")
						.setCustomId("ticketDeleteCancel")
						.setStyle(ButtonStyle.Primary),
				),
			],
		});

		const timeoutID = setTimeout(async () => await channel.delete(), 120000);

		await channel.setTopic(
			`${topic}\n**Ticket Channel Deletion Timeout ID:** ${timeoutID}`,
		);
	},
};
