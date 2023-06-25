import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CategoryChannel,
	ChannelType,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js";
import {Command} from "types";
import {Colours, Emojis, SuccessMessage} from "../../utility.js";

export const ticket: Command = {
	data: new SlashCommandBuilder()
		.setName("ticket")
		.setDescription("🎫 Manage the ticket system.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("create")
				.setDescription(
					"💬 Create a new ticket category and send a ticket panel.",
				)
				.addChannelOption((option) =>
					option
						.setName("panel-channel")
						.setDescription("📄 The channel to send the ticket panel in.")
						.addChannelTypes(
							ChannelType.GuildText,
							ChannelType.GuildAnnouncement,
							ChannelType.AnnouncementThread,
							ChannelType.PublicThread,
							ChannelType.PrivateThread,
						)
						.setRequired(true),
				)
				.addChannelOption((option) =>
					option
						.setName("ticket-category")
						.setDescription(
							"🎫 The ticket category where ticket channels will be created.",
						)
						.addChannelTypes(ChannelType.GuildCategory)
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("panel-title")
						.setDescription("The title of the ticket panel"),
				),
		),
	async execute(interaction) {
		const {options} = interaction;

		switch (options.getSubcommand()) {
			case "create":
				const panelChannel = options.getChannel(
					"panel-channel",
					true,
				) as TextChannel;

				const ticketCategoryChannel = options.getChannel(
					"ticket-category",
					true,
				) as CategoryChannel;

				const panelTitle = options.getString("panel-title") ?? "Create Ticket";

				await panelChannel.send({
					embeds: [
						{
							title: `${Emojis.Envelope} ${panelTitle}`,
							color: Colours.Default,
							description: `To create a ticket, click the button below.\n- This will create a private text channel.\n- Explain the problem you are having and be patient.\n\nSomeone will help you soon!`,
							footer: {
								text: `Ticket ID: ${ticketCategoryChannel.id}`,
							},
						},
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().setComponents(
							new ButtonBuilder()
								.setEmoji("📩")
								.setCustomId("ticketCreate")
								.setStyle(ButtonStyle.Secondary)
								.setLabel("Create Ticket"),
						),
					],
				});

				await interaction.reply(
					new SuccessMessage(
						`Successfully sent the ticket panel in <#${panelChannel.id}>!`,
						true,
					),
				);
		}
	},
};