import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	TextChannel,
} from "discord.js";
import {Button} from "types";
import TemporaryDataSchema, {ITemporaryDataSchema} from "../../../schemas/TemporaryDataSchema.js";

export const ticketDelete: Button = {
	async execute(interaction) {
		await interaction.deferUpdate();

		const channel = interaction.channel as TextChannel;
		const topic = channel.topic as string;

		await channel.send({
			embeds: [
				{
					description: `The ticket will be deleted <t:${Math.round(
      // The ticket is closed after 11 seconds to give a little "buffer time" for the user to click the "cancel" button and to account for the possible delay created after doing so.
						(Date.now() + 11000) / 1000,
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
		await new TemporaryDataSchema<ITemporaryDataSchema<{timeoutID: Timeout}>>({lifeSpan: 10000, data: {timeoutID}}).save();
		);
	},
};
