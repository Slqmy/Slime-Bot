import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	TextChannel,
} from "discord.js";
import {Button} from "types";
import TemporaryDataSchema, {
	ITemporaryDataSchema,
} from "../../../schemas/TemporaryDataSchema.js";
import mongoose from "mongoose";

export const ticketDelete: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();

		const channel = interaction.channel as TextChannel;

		const message = await channel.send({
			embeds: [
				{
					description: `The ticket will be deleted <t:${Math.round(
						// The ticket is closed after 11 seconds to give a little "buffer time" for the user to click the "cancel" button and to account for the possible delay created after doing so.
						(Date.now() + 10000) / 1000,
					)}:R>.`,
					color: Colors.Red,
				},
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setLabel("Cancel")
						.setCustomId("ticketDeleteCancel")
						.setStyle(ButtonStyle.Primary),
				),
			],
		});

		const timeoutID = setTimeout(async () => await channel.delete(), 11000);

		// Store some temporary data of the timeoutID, this used to be done by changing the channel topic, but the rate limit was way too high for that, and resulted in the channel being deleted before the topic even changed in some cases.
		// It's much better to use the TemporaryDataSchema here, as this is basically what it's been designed to do.
		await new TemporaryDataSchema<
			ITemporaryDataSchema<{timeoutID: number}, {messageID: string}>
		>({
			_id: new mongoose.Types.ObjectId(),
			type: "ticket-delete",
			lifeSpan: 10000,
			data: {
				// Convert the devilish NodeJS.Timeout type to a simple number 😌.
				timeoutID: Number(timeoutID),
			},
			matchData: {messageID: message.id},
		}).save();
	},
};
