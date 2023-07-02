import {Button} from "types";
import {LevelLeaderboardMessage} from "../../../utility.js";

export const leaderboardForward: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();

		await interaction.message.edit(
			await new LevelLeaderboardMessage().create(
				interaction,
				(page) => page + 1,
			),
		);
	},
};
