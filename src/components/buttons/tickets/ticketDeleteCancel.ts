import {TextChannel} from "discord.js";
import {Button, MongooseDocument} from "types";
import {SuccessMessage} from "../../../utility.js";
import TemporaryDataSchema, {ITemporaryDataSchema} from "../../../schemas/TemporaryDataSchema.js";

export const ticketDeleteCancel: Button = {
	async execute(interaction) {
  const {message, channel} = interaction;

		await interaction.deferUpdate();

  await message.delete()

		const timeoutData = await TemporaryDataSchema.findOne({matchData: {messageID: message.id}}) as MongooseDocument<ITemporaryDataSchema<{timeoutID: Timeout}, {messageID: message.id}>>;

		clearTimeout(timeoutData.data.timeoutID);

		await (interaction.channel as TextChannel).send(
			new SuccessMessage("Successfully cancelled ticket deletion."),
		);
		);
	},
};
