import {EmbedBuilder, resolveColor} from "discord.js";
import {EmbedEmbedMessageBuilder} from "../../../classes.js";
import {isValidURL, resolveDate} from "../../../functions.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedEmbedAdd",
	},
	async execute(interaction, client) {
		const {fields, message, user} = interaction;

		const customID = message.embeds[0].data.description.match(/\d+/)[0];

		const embed = await EmbedSchema.findOne({
			author: user.id,
			customID,
		});

		const colour = fields.getTextInputValue("embedColour");
		const url = fields.getTextInputValue("embedURL");
		const timestamp = fields.getTextInputValue("embedTimestamp");

		embed.embeds.push(
			new EmbedBuilder()
				.setTitle(fields.getTextInputValue("embedTitle"))
				.setURL(isValidURL(url) ? url : null)
				.setDescription(fields.getTextInputValue("embedDescription") || null)
				.setColor(colour ? resolveColor(colour) : 0x15fe7f)
				.setTimestamp(timestamp ? resolveDate(timestamp) : null).data,
		);

		await EmbedSchema.updateOne(
			{
				author: user.id,
				customID: customID,
			},
			embed,
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: customID,
		});

		await interaction.message.edit(
			new EmbedEmbedMessageBuilder(
				embedProfile,
				embedProfile.embeds.length - 1,
				client,
			),
		);

		await interaction.deferUpdate();
	},
};
