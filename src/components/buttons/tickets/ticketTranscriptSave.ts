import {Button} from "types";
import discordTranscripts from "discord-html-transcripts";
import {TextChannel} from "discord.js";
import {
	Colours,
	DisplayAvatarURLOptions,
	LoadingMessage,
	SuccessMessage,
} from "../../../utility.js";

export const ticketTranscriptSave: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();

		const channel = interaction.channel as TextChannel;

		const message = await channel.send(
			new LoadingMessage("Saving transcript..."),
		);

		const attachment = await discordTranscripts.createTranscript(channel);

		await message.edit(new SuccessMessage("Transcript saved!"));

		await channel.send({
			files: [attachment],
			embeds: [
				{
					author: {
						name: interaction.user.tag,
						icon_url: interaction.user.displayAvatarURL(
							DisplayAvatarURLOptions,
						),
					},
					color: Colours.Default,
					fields: [
						{
							name: "Ticket Creator",
							value: `<@${interaction.user.id}>`,
							inline: true,
						},
						{
							name: "Ticket Name",
							value: channel.name,
							inline: true,
						},
						{
							name: "Ticket Category",
							value: `${channel.name.replace("closed-", "").slice(0, -4)}`,
							inline: true,
						},
						{
							name: "Ticket Members",
							value: channel.members
								.map((member) => `<@${member.id}> » ${member.user.tag}`)
								.join("\n"),
						},
					],
				},
			],
		});
	},
};
