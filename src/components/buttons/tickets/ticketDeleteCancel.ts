import {TextChannel} from "discord.js";
import {Button, MongooseDocument} from "types";
import {SuccessMessage} from "../../../utility.js";
import TemporaryDataSchema, {
	ITemporaryDataSchema,
} from "../../../schemas/TemporaryDataSchema.js";

export const ticketDeleteCancel: Button = {
	async execute(interaction) {
		const channel = interaction.channel as TextChannel;
		const {message} = interaction;

		await interaction.deferUpdate();

		await message.delete();

		const timeoutData = (await TemporaryDataSchema.findOne({
			matchData: {messageID: message.id},
		})) as MongooseDocument<
			ITemporaryDataSchema<{timeoutID: number}, {messageID: string}>
		>;

		clearTimeout(timeoutData.data.timeoutID);

		await channel.send(
			new SuccessMessage("Successfully cancelled ticket deletion."),
		);
	},
};
