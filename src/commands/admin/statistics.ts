import {
	ChannelType,
	GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../schemas/GuildDataSchema.js";
import {Command, MongooseDocument} from "types";
import {
	DefaultStatisticsChannelNames,
	ErrorMessage,
	SuccessMessage,
	updateStatisticsChannel,
} from "../../utility.js";

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
										value: "minecraftServerUptime",
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
				const statisticType = options.getString(
					"type",
					true,
				) as keyof typeof DefaultStatisticsChannelNames;

				const minecraftChannel = options.getChannel("minecraft-server-channel");

				if (
					!minecraftChannel &&
					[
						"totalJoinedMinecraftPlayers",
						"onlineMinecraftPlayers",
						"minecraftServerUptime",
					].includes(statisticType)
				) {
					return interaction.reply(
						new ErrorMessage(
							"Please provide a Minecraft server channel to use this statistic type!",
						),
					);
				}

				const statisticsChannel = await guild.channels.create({
					name: DefaultStatisticsChannelNames[statisticType],
					type: ChannelType.GuildVoice,
					permissionOverwrites: [
						{id: guild.roles.everyone, deny: [PermissionFlagsBits.Connect]},
						{
							id: (guild.members.me as GuildMember).id,
							allow: [PermissionFlagsBits.ManageChannels],
						},
					],
				});

				const guildData = (await GuildDataSchema.findOne({
					id: guild.id,
				})) as MongooseDocument<IGuildDataSchema>;

				guildData.statisticsChannels ??= {};

				guildData.statisticsChannels[statisticsChannel.id] = {
					type: statisticType,
				};

				if (minecraftChannel) {
					guildData.statisticsChannels[statisticsChannel.id].extraData = {
						minecraftServerChannelID: minecraftChannel.id,
					};
				}

				await GuildDataSchema.updateOne(
					{id: guild.id},
					{statisticsChannels: guildData.statisticsChannels},
				);

				updateStatisticsChannel(statisticsChannel, client);

				await interaction.reply(
					new SuccessMessage(
						`Successfully created the statistics channel in <#${statisticsChannel.id}>.`,
					),
				);

				break;
		}
	},
};
