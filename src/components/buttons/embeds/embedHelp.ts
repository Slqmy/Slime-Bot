import {Button} from "types";

export const embedHelp: Button = {
	async execute(interaction) {
		await interaction.reply({
			embeds: [{title: "Work in progress!"}],
		});
	},
};
