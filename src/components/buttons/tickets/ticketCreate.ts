import {
	APIEmbedFooter,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CategoryChannel,
	Guild,
	PermissionFlagsBits,
} from "discord.js";
import {Button} from "types";
import {
	Colours,
	Emojis,
	RegExpCharactersRegExp,
	SuccessMessage,
	toKebabCase,
} from "../../../utility.js";

export const ticketCreate: Button = {
	async execute(interaction, client) {
		const {message} = interaction;

		// This button can only be present in guilds.
		const guild = interaction.guild as Guild;

		const {embeds} = message;
		const embed = embeds[0];

		const footer = embed.footer as APIEmbedFooter;

		const openTicketCategoryChannelID =
			// Use RegExp here instead of String#slice as I don't know if channel IDs will always be a fixed length. (and there may be another ID in the embed footer)
			(/^\d+/.exec(footer.text.slice(11)) as RegExpExecArray)[0];

		const closedTickedCategoryChannelID = (
			/\d+$/.exec(footer.text) as RegExpExecArray
		)[0];

		const ticketType = (embed.title as string).slice(
			Emojis.Envelope.length + 1,
		);

		let ticketName = `ticket-${
			ticketType === "Create Ticket" ? "" : `${toKebabCase(ticketType)}-`
		}`;

		const ticketChannels = [...(await guild.channels.fetch()).values()].filter(
			(channel) =>
				channel &&
				(channel.parentId === openTicketCategoryChannelID ||
					channel.parentId === closedTickedCategoryChannelID) &&
				RegExp(
					`${ticketName.replace(RegExpCharactersRegExp, "\\$&")}\\d{3}`,
				).test(channel.name),
		);

		let ticketsNumber = 0;

		ticketChannels.forEach((channel) => {
			const ticketChannelNumber = parseInt(
				(channel?.name.match(/\d+$/) as RegExpMatchArray)[0] ?? "0",
			);

			if (ticketChannelNumber > ticketsNumber) {
				ticketsNumber = ticketChannelNumber;
			}
		});

		ticketName = `${ticketName}${(ticketsNumber + 1)
			.toString()
			.padStart(3, "0")}`;

		const openTicketCategoryChannel = (await guild.channels.fetch(
			openTicketCategoryChannelID,
		)) as CategoryChannel;

		const ticketChannel = await guild.channels.create({
			name: ticketName,
			parent: openTicketCategoryChannelID,
			topic: footer.text.replace("Ticket ID:", "**Ticket ID:**"),
			permissionOverwrites: [
				{
					id: (interaction.guild as Guild).roles.everyone,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: interaction.user.id,
					allow: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: client.user.id,
					allow: [PermissionFlagsBits.ViewChannel],
				},
				...openTicketCategoryChannel.permissionOverwrites.cache.values(),
			],
		});

		const ticketMessage = await ticketChannel.send({
			embeds: [
				{
					title: ticketName,
					color: Colours.Default,
					description: `${Emojis.Wumpus} Thank you for creating a ticket! We will help you as soon as possible.\n- Please explain the problem you are having below.\n- Include as many details as possible.\n- Be patient, someone will help you soon.`,
				},
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setCustomId("ticketClose")
						.setStyle(ButtonStyle.Secondary)
						.setEmoji("🔒")
						.setLabel("Close Ticket"),
				),
			],
		});

		await ticketMessage.pin();

		await interaction.reply(
			new SuccessMessage(
				`Successfully created the ticket in <#${ticketChannel.id}>`,
				true,
			),
		);
	},
};
