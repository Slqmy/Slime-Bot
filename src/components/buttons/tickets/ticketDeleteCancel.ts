import {TextChannel} from "discord.js";
import {Button} from "types";
import {SuccessMessage} from "../../../utility.js";

export const ticketDeleteCancel: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();

		const channel = interaction.channel as TextChannel;
		const topic = channel.topic as string;

		const timeoutID = parseInt((/\d+$/.exec(topic) as RegExpMatchArray)[0]);

		clearTimeout(timeoutID);

		await channel.send(
			new SuccessMessage("Successfully cancelled ticket deletion."),
		);

		await interaction.message.delete();

		await channel.setTopic(
			topic.replace(/\*\*Ticket Channel Deletion Timeout ID:\*\* \d+/, ""),
		);
	},
};
