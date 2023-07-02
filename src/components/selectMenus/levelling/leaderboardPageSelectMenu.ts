import {SelectMenu} from "types";
import {LevelLeaderboardMessage} from "../../../utility.js";

export const leaderboardPageSelectMenu: SelectMenu = {
	async execute(interaction) {
		await interaction.deferUpdate();

		await interaction.message.edit(
			await new LevelLeaderboardMessage().create(interaction, () =>
				parseInt(interaction.values[0]),
			),
		);
	},
};
