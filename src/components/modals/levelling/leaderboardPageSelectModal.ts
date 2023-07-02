import {Message} from "discord.js";
import {Modal} from "types";
import {LevelLeaderboardMessage} from "../../../utility.js";

export const leaderboardPageSelectModal: Modal = {
	async execute(interaction) {
		await interaction.deferUpdate();

		await (interaction.message as Message).edit(
			await new LevelLeaderboardMessage().create(interaction, (page) =>
				parseInt(interaction.fields.getTextInputValue("page")),
			),
		);
	},
};
