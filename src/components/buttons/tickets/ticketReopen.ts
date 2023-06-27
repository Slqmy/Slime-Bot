import {
	CategoryChannel,
	Guild,
	PermissionFlagsBits,
	TextChannel,
} from "discord.js";
import {Button} from "types";
import {Emojis, SuccessMessage} from "../../../utility.js";

export const ticketReopen: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();

		const guild = interaction.guild as Guild;
		const channel = interaction.channel as TextChannel;

		const ticketCategoryChannelID = (
			/^\d+/.exec((channel.topic as string).slice(15)) as RegExpExecArray
		)[0];

		if (ticketCategoryChannelID !== channel.parentId) {
			await channel.setParent(ticketCategoryChannelID, {
				lockPermissions: false,
			});

			const ticketCategoryChannel = (await guild.channels.fetch(
				ticketCategoryChannelID,
			)) as CategoryChannel;
		}

		await interaction.message.delete();

		await channel.send(
			new SuccessMessage(`Successfully re-opened the ticket!\n\n${Emojis.Warning}Note: *renaming the channel may take a while!*`),
		);

		await channel.setName(channel.name.replace("closed", "ticket"));
	},
};
