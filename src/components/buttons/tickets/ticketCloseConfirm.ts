import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	TextChannel,
} from "discord.js";
import {Button} from "types";
import {Colours, Emojis} from "../../../utility.js";

export const ticketCloseConfirm: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();
		const channel = interaction.channel as TextChannel;

		const closedTickedCategoryChannelID = /(?<=-)\d+$/.exec(
			channel.topic as string,
		)?.[0];

		if (closedTickedCategoryChannelID !== channel.parentId) {
			await channel.setParent(closedTickedCategoryChannelID as string, {
				lockPermissions: false,
			});
		}

		await channel.send({
			embeds: [
				{
					description: `Ticket closed by <@${interaction.user.id}>.\n\n${Emojis.Warning} Note: *renaming the channel may take a while!*`,
					color: Colors.Yellow,
				},
			],
		});

		await channel.send({
			embeds: [
				{
					description:
						"📑 Save transcript\n🔓 Reopen ticket\n⛔ Delete ticket\n🚪 Leave channel",
					color: Colours.Default,
				},
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setLabel("Transcript")
						.setEmoji("📑")
						.setCustomId("ticketTranscriptSave")
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setLabel("Open")
						.setEmoji("🔓")
						.setCustomId("ticketReopen")
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setLabel("Delete")
						.setEmoji("⛔")
						.setCustomId("ticketDelete")
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setLabel("Leave")
						.setEmoji("🚪")
						.setCustomId("ticketLeave")
						.setStyle(ButtonStyle.Secondary),
				),
			],
		});

		await interaction.message.delete();

		await channel.setName(channel.name.replace("ticket", "closed"));
	},
};
