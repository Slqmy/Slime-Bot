import {ErrorMessage, SuccessMessage} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Modal} from "types";
import {APIEmbedFooter, Message} from "discord.js";

export const embedModal2: Modal = {
	async execute(interaction) {
		const embedMessage = (interaction.message as Message).embeds[0].data;

		const count = (
			/\d+/.exec(
				(interaction.message as Message).embeds[0].data.description as string,
			) as RegExpExecArray
		)[0];

		const embedIndex =
			parseInt(
				(
					/\d+/.exec(
						(embedMessage.footer as APIEmbedFooter).text,
					) as RegExpExecArray
				)[0],
			) - 1;

		const embed = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embed) {
			return interaction.reply(new ErrorMessage("Couldn't find embed!"));
		}

		embed.embeds ??= [];

		embed.embeds[embedIndex - 1] = {
			...embed.embeds[embedIndex - 1],
			...{
				author: {
					name: interaction.fields.getTextInputValue("embedAuthorName"),
					url: interaction.fields.getTextInputValue("embedAuthorURL"),
					icon_url: interaction.fields.getTextInputValue("embedAuthorIconURL"),
				},
			},
		};

		await EmbedSchema.updateOne(
			{
				author: interaction.user.id,
				id: count,
			},
			{
				embeds: embed.embeds,
			},
		);

		await interaction.reply(
			new SuccessMessage("Embed saved successfully", true),
		);
	},
};
