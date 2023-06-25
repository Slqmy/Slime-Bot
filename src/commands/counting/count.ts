import {Colours, Emojis, ErrorMessage} from "../../utility.js";
import {Command} from "types";
import GuildDataSchema from "../../schemas/GuildDataSchema.js";
import {SlashCommandBuilder} from "discord.js";

export const count: Command = {
	data: new SlashCommandBuilder()
		.setName("count")
		.setDescription("🔢 Get the current count!"),
	async execute(interaction) {
		const {guild} = interaction;

		const guildData = await GuildDataSchema.findOne({id: guild?.id});

		if (!guildData) {
			await interaction.reply(
				new ErrorMessage("You have to be in a guild to do this!"),
			);
		} else if (!guildData.settings?.counting?.channels.length) {
			await interaction.reply(
				new ErrorMessage(
					"This guild does not have any counting channels set up!",
				),
			);
		} else {
			const {channels} = guildData.settings.counting;

			await interaction.reply({
				embeds: [
					{
						title: "🔢 Counting Channels",
						description: `${channels.map(
							(channel) =>
								`<#${channel.channelID}> - \`${channel.count}\`${
									guildData.settings?.counting?.disabled
										? `\n\n> ${Emojis.Warning} Note: the counting channels are currently disabled.`
										: ""
								}`,
						)}`,
						color: Colours.Default,
					},
				],
			});
		}
	},
};
