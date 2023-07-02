import {EmbedBuilder} from "@discordjs/builders";
import {resolveColor} from "discord.js";
import {resolveDate} from "../../../functions.js";
import {
	SuccessMessageBuilder,
	EmbedEmbedMessageBuilder,
} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedModal1",
	},

	async execute(interaction, client) {
		const embedMessage = interaction.message.embeds[0].data;

		const count = embedMessage.description.match(/\d+/)[0];

		const embedIndex = embedMessage.footer.text.match(/\d+/)[0] - 1;

		const embed = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});

		embed.embeds[embedIndex] = {
			...embed.embeds[embedIndex],
			...new EmbedBuilder({
				title: interaction.fields.getTextInputValue("embedTitle"),
				url: interaction.fields.getTextInputValue("embedURL"),
				description: interaction.fields.getTextInputValue("embedDescription"),
				color: resolveColor(
					interaction.fields.getTextInputValue("embedColour"),
				),
				timestamp: interaction.fields.getTextInputValue("embedTimestamp")
					? resolveDate(interaction.fields.getTextInputValue("embedTimestamp"))
					: null,
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

		await interaction.message.edit(
			new EmbedEmbedMessageBuilder(embed, embedIndex, client),
		);

		await interaction.reply(
			new SuccessMessageBuilder("Embed saved successfully", true),
		);
	},
};
