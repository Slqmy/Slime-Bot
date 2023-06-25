import {TextChannel} from "discord.js";
import {Button} from "types";

export const ticketLeave: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();

		const channel = interaction.channel as TextChannel;
		const {user} = interaction;

		await channel.permissionOverwrites.edit(user, {ViewChannel: false});
	},
};
