import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js";
import {AutocompleteCommand} from "types";
import {Colours, Emojis, SuccessMessage} from "../../utility.js";

export const ticket: AutocompleteCommand = {
	data: new SlashCommandBuilder()
		.setName("ticket")
		.setDescription("🎫 Manage the ticket system.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addSubcommandGroup((subcommandGroup) => subcommandGroup.setName("user").setDescription("👤 Add or remove users to and from a ticket.").addSubcommand((subCommand) => subCommand.setName("add").setDescription("👤 Add a user to a ticket").addUseroption((option) => option.setName("user").setDescription("👤 The user to add to the ticket").setRequired(true).setAutocomplete(true)).addChannelOption((option) => option.setName("ticket-chanel").setDescription("💬 The ticket channel to add the user to. Don't specify a channel to use the current channel.").setRequired(true).setAutocomplete(true).addChannelTypes(
							ChannelType.GuildText,
							ChannelType.GuildAnnouncement,
							ChannelType.AnnouncementThread,
							ChannelType.PublicThread,
							ChannelType.PrivateThread,
						))).addSubcommand((subCommand) => subCommand.setName("remove").setDescription("👤 Remove a user from a ticket").addUseroption((option) => option.setName("user").setDescription("👤 The user to remove from the ticket").setRequired(true).setAutocomplete(true)).addChannelOption((option) => option.setName("ticket-chanel").setDescription("💬 The ticket channel to remove the user from. Don't specify a channel to use the current channel.").setRequired(true).setAutocomplete(true).addChannelTypes(
							ChannelType.GuildText,
							ChannelType.GuildAnnouncement,
							ChannelType.AnnouncementThread,
							ChannelType.PublicThread,
							ChannelType.PrivateThread,
						))))
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
				.addChannelOption((option) =>
					option
						.setName("closed-ticket-category")
						.setDescription(
							"🎫 The category where closed tickets will be archived. Specify none to delete closed tickets.",
						),
				)
				.addStringOption((option) =>
					option
						.setName("panel-title")
						.setDescription("💬 The title of the ticket panel"),
				),
		),
 async autocomplete(interaction) {},
	async execute(interaction) {
		const {options} = interaction;

		switch (options.getSubcommand()) {
			case "create":
				const panelTitle = options.getString("panel-title") ?? "Create Ticket";

				const panelChannel = options.getChannel(
					"panel-channel",
					true,
				) as TextChannel;

				const ticketCategoryChannel = options.getChannel(
					"ticket-category",
					true,
				);

				const closedTickedCategoryChannel = options.getChannel(
					"closed-ticket-category",
				);

				await panelChannel.send({
					embeds: [
						{
							title: `${Emojis.Envelope} ${panelTitle}`,
							color: Colours.Default,
							description: `To create a ticket, click the button below.\n- This will create a private text channel.\n- Explain the problem you are having and be patient.\n\n${Emojis.Wumpus} Someone will help you soon!`,
							footer: {
								text: `Ticket ID: ${ticketCategoryChannel.id}${
									closedTickedCategoryChannel
										? `-${closedTickedCategoryChannel.id}`
										: ""
								}`,
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
