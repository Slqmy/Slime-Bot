import {EmbedMessageBuilder, SuccessMessageBuilder} from "../../../classes.js";
import {numberEnding} from "../../../functions.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedEditContent",
	},
	async execute(interaction) {
		const count =
			interaction.message.embeds[0].data.footer.text.match(/\d+/)[0];
		const embedArray = await EmbedSchema.find({
			author: interaction.user.id,
		});
		embedArray[count - 1].content =
			interaction.fields.getTextInputValue("content");
		await EmbedSchema.updateOne(
			{author: interaction.user.id, customID: count},
			{content: embedArray[0].content},
		);
		await interaction.message.edit(
			new EmbedMessageBuilder(
				`Currently editing your ${count}${numberEnding(
					count,
				)} embed builder! Select what you would like to do with it below.`,
				embedArray[count - 1],
				interaction,
				embedArray,
			),
		);
		await interaction.reply(
			new SuccessMessageBuilder("Successfully updated the message content!"),
		);
	},
};
