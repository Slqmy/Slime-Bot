import {Command} from "types";
import {SlashCommandBuilder} from "discord.js";

export const settings: Command = {
	data: new SlashCommandBuilder()
		.setName("settings")
		.setDescription("📄 Access the server settings."),
	usage: ["", "category:settings category"],
	examples: ["category:🎥 YouTube"],
	async execute(interaction, client) {},
};
