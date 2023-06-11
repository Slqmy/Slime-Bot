import {Colours, createErrorMessage} from "../../utility.js";
import {Command} from "types";
import {SlashCommandBuilder} from "discord.js";
import guildSettingsSchema from "../../schemas/guildSettingsSchema.js";

export const count: Command = {
	data: new SlashCommandBuilder()
		.setName("count")
		.setDescription("🔢 Get the current count!"),
	usage: ["count"],
	async execute(interaction) {
		const {guild} = interaction;

		const guildSettings = await guildSettingsSchema.findOne({id: guild?.id});

		if (!guild || !guildSettings) {
			await interaction.reply(
				createErrorMessage("You have to be in a guild to do this!"),
			);
		} else if (!guildSettings.counting?.channels.length) {
			await interaction.reply(
				createErrorMessage(
					"This guild does not have any counting channels set up!",
				),
			);
		} else {
			const {channels} = guildSettings.counting;

			await interaction.reply({
				embeds: [
					{
						title: "🔢 Counting Channels",
						description: `${channels.map(
							(channel) => `<#${channel.channelID}> - \`${channel.count}\``,
						)}`,
						color: Colours.Transparent,
					},
				],
			});
		}
	},
};
