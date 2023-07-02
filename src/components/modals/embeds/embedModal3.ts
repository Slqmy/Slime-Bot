import {EmbedBuilder} from "discord.js";
import {checkAuthorisation} from "../../../functions.js";
import {SuccessMessageBuilder, ErrorMessage} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedModal3",
	},

	async execute(interaction) {
		if (!checkAuthorisation(interaction)) {
			return await interaction.reply(
				new ErrorMessage("This is not your embed!"),
			);
		}

		const embedMessage = interaction.message.embeds[0].data;

		const count =
			interaction.message.embeds[0].data.description.match(/\d+/)[0];

		const embedIndex = embedMessage.footer.text.match(/\d+/)[0] - 1;

		const embed = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});

		embed.embeds[embedIndex - 1] = {
			...embed.embeds[embedIndex - 1],
			...new EmbedBuilder({
				image: interaction.fields.getTextInputValue("embedImage"),
				thumbnail: interaction.fields.getTextInputValue("embedThumbnail"),
				footer: {
					text: interaction.fields.getTextInputValue("embedFooterText"),
					iconURL: interaction.fields.getTextInputValue("embedFooterIconURL"),
				},
			}).data,
		};

		await EmbedSchema.updateOne(
			{
				author: interaction.user.id,
				customID: count,
			},
			{
				embeds: embed.embeds,
			},
		);

		await interaction.reply(
			new SuccessMessageBuilder("Embed saved successfully", true),
		);
	},
};
