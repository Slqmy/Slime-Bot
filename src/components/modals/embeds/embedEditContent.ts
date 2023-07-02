import {
	EmbedMessageBuilder,
	SuccessMessage,
	addNumberSuffix,
} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Modal} from "types";
import {APIEmbedFooter, Message} from "discord.js";

export const embedEditContent: Modal = {
	async execute(interaction, client) {
		const count = parseInt(
			(
				/\d+/.exec(
					(
						(interaction.message as Message).embeds[0].data
							.footer as APIEmbedFooter
					).text,
				) as RegExpExecArray
			)[0],
		);

		const embedArray = await EmbedSchema.find({
			author: interaction.user.id,
		});
		embedArray[count - 1].content =
			interaction.fields.getTextInputValue("content");

		await EmbedSchema.updateOne(
			{author: interaction.user.id, id: count},
			{content: embedArray[0].content},
		);

		await (interaction.message as Message).edit(
			await new EmbedMessageBuilder().create(
				interaction,
				client,
				embedArray[count - 1].id,
				`Currently editing your ${count}${addNumberSuffix(
					count,
				)} embed builder! Select what you would like to do with it below.`,
			),
		);
		await interaction.reply(
			new SuccessMessage("Successfully updated the message content!"),
		);
	},
};
