import {Colours, ErrorMessage} from "../../utility.js";
import {Command} from "types";
import GuildSettingsSchema from "../../schemas/GuildSettingsSchema.js";
import {SlashCommandBuilder} from "discord.js";

export const count: Command = {
	data: new SlashCommandBuilder()
		.setName("count")
		.setDescription("🔢 Get the current count!"),
	usage: ["count"],
	async execute(interaction) {
		const {guild} = interaction;

		const guildSettings = await GuildSettingsSchema.findOne({id: guild?.id});

		if (!guild || !guildSettings) {
			await interaction.reply(
				new ErrorMessage("You have to be in a guild to do this!"),
			);
		} else if (!guildSettings.counting?.channels.length) {
			await interaction.reply(
				new ErrorMessage(
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
