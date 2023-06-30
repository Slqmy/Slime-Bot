import {
	ChannelType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import {Command} from "types";
import {ErrorMessage} from "utility";

export const statistics: Command = {
	data: new SlashCommandBuilder()
		.setName("statistics")
		.setDescription("📊 Manage statistics channels.")
		.addSubcommandGroup((subcommandGroup) =>
			subcommandGroup
				.setName("channel")
				.setDescription("📊 Manage the statistics channels of the server.")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("create")
						.setDescription("💬 Create a new statistics channel.")
						.addStringOption((option) =>
							option
								.setName("type")
								.setDescription("💬 The type of statistics channel to create.")
								.setRequired(true)
								.addChoices(
									{
										name: "👤 Total non-bot members",
										value: "totalDiscordMembers",
									},
									{
										name: "🟢 Online non-bot members (Discord)",
										value: "onlineDiscordMembers",
									},
									{
										name: "👤 Total players joined (Minecraft)",
										value: "totalJoinedMinecraftPlayers",
									},
									{
										name: "🟢 Online players (Minecraft)",
										value: "onlineMinecraftPlayers",
									},
									{
										name: "🟢 Server uptime",
										value: "serverUptime",
									},
								),
						)
						.addChannelOption((option) =>
							option
								.setName("minecraft-server-channel")
								.setDescription(
									"💬 The channel in the topic of which the server information is stored (if required).",
								)
								.addChannelTypes(ChannelType.GuildText),
						),
				),
		),
	async execute(interaction, client) {
		const {options, guild} = interaction;

		if (!guild) {
			return interaction.reply(
				new ErrorMessage("You must be in a guild to do this!"),
			);
		}

		switch (options.getSubcommand()) {
			case "create":
				const statisticType = options.getString("type", true);

				const statisticsChannel = await guild.channels.create({
					name: "",
					type: ChannelType.GuildVoice,
					permissionOverwrites: [
						{id: guild.roles.everyone, deny: [PermissionFlagsBits.Connect]},
					],
				});

				break;
		}
	},
};
