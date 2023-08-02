import {
	PermissionFlagsBits,
	SlashCommandBuilder,
	GuildEmoji,
	ApplicationCommandOptionChoiceData,
	EmbedBuilder,
	inlineCode,
} from "discord.js";
import {AutoCompleteCommand} from "types";
import {Colours} from "../../utility.js";

export const emoji: AutoCompleteCommand = {
	data: new SlashCommandBuilder()
		.setName("emoji")
		.setDescription("Manage emoji between the discord networks system.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("get")
				.setDescription("Get the raw format of an emoji from the emoji server.")
				.addStringOption((option) =>
					option
						.setName("name")
						.setDescription("The name of the emoji.")
						.setRequired(true)
						.setAutocomplete(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("set")
				.setDescription("Upload an emoji to a specific server.")
				.addStringOption((option) =>
					option
						.setName("id")
						.setDescription("The id of the emoji.")
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("server")
						.setDescription("The id of the server to upload the emoji.")
						.setRequired(true)
						.setChoices(
							{name: "The Slimy Swamp", value: "1109899305168420884"},
							{name: "Emoji Server", value: "1122162791088926831"},
						),
				),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	usage: ["messages:number of messages to delete"],
	examples: ["messages:50"],
	async autocomplete(interaction, client) {
		const focusedValue = interaction.options.getFocused(true).value;
		const emojis = (
			await client.guilds.fetch("1122162791088926831")
		).emojis.cache.map(
			(emoji: GuildEmoji) =>
				({
					name: emoji.name,
					value: emoji.name,
				} as ApplicationCommandOptionChoiceData),
		);

		const filtered = emojis.filter((emoji) =>
			emoji.name.startsWith(focusedValue),
		);

		return interaction.respond(filtered.slice(0, 25));
	},
	async execute(interaction, client) {
		const emojiGuild = await client.guilds.fetch("1122162791088926831");
		const emojiGuildEmojis = emojiGuild.emojis.cache;

		switch (interaction.options.getSubcommand()) {
			case "get":
				const emoji = emojiGuildEmojis.find(
					(emoji) => emoji.name === interaction.options.getString("name"),
				);

				if (!emoji)
					return interaction.reply({
						content: "That emoji does not exist!",
						ephemeral: true,
					});

				const embed = new EmbedBuilder()
					.setDescription(`Formatted emoji: ${inlineCode(emoji.toString())}`)
					.setColor(Colours.Transparent);

				return interaction.reply({
					embeds: [embed],
				});
			case "set":
				const emojiToSet = client.emojis.cache.get(
					interaction.options.getString("id") as string,
				);

				if (!emojiToSet)
					return interaction.reply({
						content: "That emoji id is invalid!",
						ephemeral: true,
					});

				const guildToSet = await client.guilds.fetch(
					interaction.options.getString("server") as string,
				);

				if (!guildToSet) {
					return await interaction.reply({
						content: "That guild id is invalid!",
						ephemeral: true,
					});
				}

				if (
					guildToSet.emojis.cache.find(
						(emoji) => emoji.name === emojiToSet.name,
					)
				) {
					return interaction.reply({
						content: "There is already an emoji with that name in that server!",
						ephemeral: true,
					});
				}

				const newEmoji = await guildToSet.emojis.create({
					attachment: emojiToSet.url,
					name: emojiToSet.name as string,
				});

				if (newEmoji) {
					return interaction.reply({
						content: "Your new emoji has been created!",
					});
				} else {
					return interaction.reply({
						content: "There was an error trying to create your emoji!",
						ephemeral: true,
					});
				}
			default:
				return;
		}
	},
};
