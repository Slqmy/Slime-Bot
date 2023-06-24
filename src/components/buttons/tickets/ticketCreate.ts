import {APIEmbedFooter, Guild} from "discord.js";
import {Button} from "types";
import {Emojis} from "../../../utility.js";

export const ticketCreate: Button = {
	async execute(interaction) {
		const {message} = interaction;

		// This button can only be present in guilds.
		const guild = interaction.guild as Guild;

		const {embeds} = message;
		const embed = embeds[0];

		const categoryChannelID = (embed.footer as APIEmbedFooter).text.slice(11);

		const ticketChannels = [...(await guild.channels.fetch()).values()].filter(
			(channel) => channel?.parentId === categoryChannelID,
		);

		const ticketType = (embed.title as string).slice(
			Emojis.Envelope.length + 1,
		);

		await guild.channels.create({
			name: `ticket-${ticketType === "Create Ticket" ? "" : `${ticketType}-`}${
				ticketChannels.length + 1
			}`,
			parent: categoryChannelID,
		});
	},
};
