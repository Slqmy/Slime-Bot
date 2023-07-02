import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {ErrorMessage, SuccessMessageBuilder} from "../../../classes.js";

export default {
	data: {
		name: "embedFieldsEdit",
	},

	async execute(interaction) {
		let fieldPosition = interaction.fields.getTextInputValue("fieldPosition");
		const name = interaction.fields.getTextInputValue("fieldName");
		const value = interaction.fields.getTextInputValue("fieldValue");
		const inline = interaction.fields.getTextInputValue("fieldInline");

		const embed = interaction.message.embeds[0].data;

		const count = embed.description.match(/\d+/)[0];

		const embedData = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});

		const embedNumber = embed.footer.text.match(/\d+/)[0];

		const embeds = embedData.embeds;

		const fieldArray = embeds[embedNumber - 1].fields;

		if (!parseInt(fieldPosition)) {
			const reg = new RegExp(`^.*${fieldPosition}.*$`, "ig");
			for (let index = 0; index < fieldArray.length; index++) {
				if (reg.test(fieldArray[index].name)) {
					fieldPosition = index + 1;
					break;
				}
			}
		}
		if (!fieldArray[parseInt(fieldPosition)]) {
			return await interaction.reply(
				new ErrorMessage("That field does not exist!"),
			);
		}

		fieldArray[fieldPosition - 1] = {
			name,
			value,
			inline: inline.toLowerCase().trim() === "true",
		};

		embeds[embedNumber - 1].fields = fieldArray;

		await EmbedSchema.updateOne(
			{
				author: interaction.user.id,
				customID: count,
			},
			{
				embeds: embeds,
			},
		);

		await interaction.reply(new SuccessMessageBuilder("Embed Saved"));
	},
};
