import {Colours} from "../../utility.js";
import {Command} from "types";
import {SlashCommandBuilder} from "discord.js";

export const ping: Command = {
	data: new SlashCommandBuilder().setName("ping").setDescription("🏓 Pong!"),
	async execute(interaction, client) {
		const message = await interaction.deferReply({
			fetchReply: true,
		});

		await interaction.editReply({
			embeds: [
				{
					title: "🏓 Pong!",
					color: Colours.Default,
					description: `🤖 **API Latency**: \`${
						client.ws.ping
					}\`\n\n👤 **Client Ping**: \`${
						message.createdTimestamp - interaction.createdTimestamp
					}\``,
				},
			],
		});
	},
};
