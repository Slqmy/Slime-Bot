import {
	SuccessMessage,
	ErrorMessage,
	checkAuthorisation,
} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Modal} from "types";
import {APIEmbedFooter, Message} from "discord.js";

export const embedModal3: Modal = {
	async execute(interaction) {
		if (!checkAuthorisation(interaction)) {
			return interaction.reply(new ErrorMessage("This is not your embed!"));
		}

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
			return interaction.reply(new ErrorMessage("Can't find embed!"));
		}

		embed.embeds ??= [];

		embed.embeds[embedIndex - 1] = {
			...embed.embeds[embedIndex - 1],
			...{
				image: {url: interaction.fields.getTextInputValue("embedImage")},
				thumbnail: {
					url: interaction.fields.getTextInputValue("embedThumbnail"),
				},
				footer: {
					text: interaction.fields.getTextInputValue("embedFooterText"),
					icon_url: interaction.fields.getTextInputValue("embedFooterIconURL"),
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
