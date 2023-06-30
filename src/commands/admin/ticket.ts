import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Colors,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js";
import {AutoCompleteCommand} from "types";
import {
	Colours,
	Emojis,
	ErrorMessage,
	SuccessMessage,
	TextChannelTypes,
} from "../../utility.js";

export const ticket: AutoCompleteCommand = {
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
						.addChannelTypes(...TextChannelTypes)
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
							"🎫 The category where closed tickets will be archived. Specify none to not move closed tickets.",
						)
						.addChannelTypes(ChannelType.GuildCategory),
				)
				.addStringOption((option) =>
					option
						.setName("panel-title")
						.setDescription("💬 The title of the ticket panel"),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("close")
				.setDescription("🔒 Close a ticket.")
				.addChannelOption((option) =>
					option
						.setName("ticket-channel")
						.setDescription("💬 The ticket channel to close.")
						.addChannelTypes(...TextChannelTypes),
				)
				.addStringOption((option) =>
					option
						.setName("reason")
						.setDescription("📄 The reason for the ticket to be closed.")
						.setAutocomplete(true),
				),
		)
		.addSubcommandGroup((subcommandGroup) =>
			subcommandGroup
				.setName("user")
				.setDescription("👤 Add or remove users to and from a ticket.")
				.addSubcommand((subCommand) =>
					subCommand
						.setName("add")
						.setDescription("👤 Add a user to a ticket")
						.addUserOption((option) =>
							option
								.setName("user")
								.setDescription("👤 The user to add to the ticket")
								.setRequired(true),
						)
						.addChannelOption((option) =>
							option
								.setName("ticket-chanel")
								.setDescription(
									"💬 The ticket channel to add the user to. Don't specify a channel to use the current channel.",
								)
								.addChannelTypes(...TextChannelTypes),
						),
				)
				.addSubcommand((subCommand) =>
					subCommand
						.setName("remove")
						.setDescription("👤 Remove a user from a ticket")
						.addUserOption((option) =>
							option
								.setName("user")
								.setDescription("👤 The user to remove from the ticket")
								.setRequired(true),
						)
						.addChannelOption((option) =>
							option
								.setName("ticket-chanel")
								.setDescription(
									"💬 The ticket channel to remove the user from. Don't specify a channel to use the current channel.",
								)
								.addChannelTypes(...TextChannelTypes),
						),
				),
		),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused(true).value;
		const suggestedOptionsArray = [
			"✅ Problem resolved",
			"❌ Problem not resolved",
			"❌ Problem unresolvable",
			"❌ Invalid problem",
			"😶 Inactivity",
			"📰 Spam ticket",
		];

		return interaction.respond(
			suggestedOptionsArray
				.filter((option) => new RegExp(focusedValue, "i").test(option))
				.map((option) => ({name: option, value: option})),
		);
	},
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
				break;
			case "close":
				const ticketChannel =
					options.getChannel("ticket-channel") ?? interaction.channel;

				const reason = options.getString("reason");

				if (!(ticketChannel instanceof TextChannel)) {
					return interaction.reply(
						new ErrorMessage(
							"You must be in a valid `text channel` to do this!",
						),
					);
				}

				const closedTickedCategoryChannelID = /(?<=-)\d+$/.exec(
					ticketChannel.topic as string,
				)?.[0];

				if (closedTickedCategoryChannelID !== ticketChannel.parentId) {
					await ticketChannel.setParent(
						closedTickedCategoryChannelID as string,
						{
							lockPermissions: false,
						},
					);
				}

				await ticketChannel.send({
					embeds: [
						{
							description: `Ticket closed by <@${interaction.user.id}>.${
								reason
									? `\n\n${Emojis.QuestionMark} Reason: \`${reason}\`.`
									: ""
							}\n\n${
								Emojis.Warning
							} Note: *renaming the channel may take a while!*`,
							color: Colors.Yellow,
						},
					],
				});

				await ticketChannel.send({
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

				await interaction.reply(
					new SuccessMessage("Successfully closed the ticket!", true),
				);

				await ticketChannel.setName(
					ticketChannel.name.replace("ticket", "closed"),
				);

				break;
			case "add":
				const addUser = options.getUser("user", true);
				const addChannel =
					options.getChannel("ticket-channel") ?? interaction.channel;

				if (!(addChannel instanceof TextChannel)) {
					return interaction.reply(
						new ErrorMessage(
							"You must be in a valid `text channel` to do this!",
						),
					);
				}

				await addChannel.permissionOverwrites.create(addUser, {
					ViewChannel: true,
				});

				await interaction.reply(
					new SuccessMessage(
						`Successfully added user <@${addUser.id}> to the channel!`,
					),
				);
				break;
			case "remove":
				const removeUser = options.getUser("user", true);
				const removeChannel =
					options.getChannel("ticket-channel") ?? interaction.channel;

				if (!(removeChannel instanceof TextChannel)) {
					return interaction.reply(
						new ErrorMessage(
							"You must be in a valid `text channel` to do this!",
						),
					);
				}

				await removeChannel.permissionOverwrites.create(removeUser, {
					ViewChannel: false,
				});

				await interaction.reply(
					new SuccessMessage(
						`Successfully removed user <@${removeUser.id}> from the channel!`,
					),
				);
				break;
		}
	},
};
