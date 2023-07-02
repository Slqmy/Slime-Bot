import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {ErrorMessage, SuccessMessageBuilder} from "../../../classes.js";

export default {
	data: {
		name: "embedFieldsRemove",
	},

	async execute(interaction) {
		const embed = interaction.message.embeds[0].data;

		const customID =
			interaction.message.embeds[0].data.description.match(/\d+/);

		const embedData = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: customID,
		});

		const embedNumber = embed.footer.text.match(/\d+/);

		const fieldArray = embedData.embeds[embedNumber - 1].fields;

		const input = interaction.fields.getTextInputValue("deletedField");

		let fieldPosition = input - 1;

		if (isNaN(fieldPosition)) {
			const reg = new RegExp(`^.*${input}.*$`, "ig");
			for (let index = 0; index < fieldArray.length; index++) {
				if (reg.test(fieldArray[index].name)) {
					fieldPosition = index;
					break;
				}
			}
		}

		if (!fieldArray[fieldPosition]) {
			return await interaction.reply(
				new ErrorMessage("That field does not exist!"),
			);
		}

		const field = fieldArray[fieldPosition];

		fieldArray.splice(fieldPosition, 1);

		embedData.embeds[embedNumber - 1].fields = fieldArray;

		await EmbedSchema.updateOne(
			{
				author: interaction.user.id,
				customID: customID,
			},
			{
				embeds: embedData.embeds,
			},
		);

		await interaction.reply(
			new SuccessMessageBuilder(`Field \`${field.name}\` Successfully deleted`),
		);
	},
};
