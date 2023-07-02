import {EmbedBuilder} from "discord.js";

export default {
	data: {
		name: "embedHelp",
	},
	async execute(interaction) {
		await interaction.reply({
			embeds: [new EmbedBuilder().setTitle("Work in progress")],
		});
	},
};
