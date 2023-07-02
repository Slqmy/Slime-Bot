import {ErrorMessage, LevelLeaderboardMessage} from "../../utility.js";
import {Command} from "types";
import GuildDataSchema from "../../schemas/GuildDataSchema.js";
import {SlashCommandBuilder} from "discord.js";

export const leaderboard: Command = {
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("🏆 View the users with the top level in the server!")
		.addNumberOption((option) =>
			option
				.setName("page")
				.setDescription("📄 The page of the leaderboard to view."),
		),
	async execute(interaction) {
		await interaction.deferReply();

		const guildData = await GuildDataSchema.findOne({id: interaction.guildId});

		if (!guildData) {
			return interaction.editReply(
				new ErrorMessage("You need to be in a guild to run this command!"),
			);
		}

		return interaction.editReply(
			await new LevelLeaderboardMessage().create(interaction),
		);
	},
};
