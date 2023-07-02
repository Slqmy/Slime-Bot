import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {ErrorMessage, SuccessMessageBuilder} from "../../../classes.js";

export default {
	data: {
		name: "embedFieldsAdd",
	},
	async execute(interaction) {
		let fieldPosition = interaction.fields.getTextInputValue("fieldPosition");
		const fieldName = interaction.fields.getTextInputValue("fieldName");
		const fieldValue = interaction.fields.getTextInputValue("fieldValue");
		const fieldInline = interaction.fields.getTextInputValue("fieldInline");

		const embed = interaction.message.embeds[0].data;

		const customID = embed.description.match(/\d+/)[0];

		const embedNumber = embed.footer.text.match(/\d+/)[0];

		const embedData = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: customID,
		});

		const {embeds} = embedData;

		const fieldArray = embeds[embedNumber - 1].fields ?? [];

		if (!fieldPosition) {
			fieldPosition = fieldArray.length;
		} else {
			if (!parseInt(fieldPosition)) {
				const reg = new RegExp(`^.*${fieldPosition}.*$`, "ig");
				for (let index = 0; index < fieldArray.length; index++) {
					if (reg.test(fieldArray[index].name)) {
						fieldPosition = index;
						break;
					}
				}
			}
		}

		if (!fieldArray[parseInt(fieldPosition)] && !fieldArray.length === 0) {
			return await interaction.reply(
				new ErrorMessage("That field does not exist!"),
			);
		}

		fieldArray.splice(fieldPosition - 1, 0, {
			name: `${fieldName}`,
			value: `${fieldValue}`,
			inline: fieldInline.toLowerCase().trim() === "true",
		});

		embeds[embedNumber - 1].fields = fieldArray;

		await EmbedSchema.updateOne(
			{
				author: interaction.user.id,
				customID: customID,
			},
			{
				embeds: embeds,
			},
		);

		await interaction.reply(new SuccessMessageBuilder("Embed Saved"));
	},
};
