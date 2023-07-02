import {Modal} from "types";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {ErrorMessage, SuccessMessage} from "../../../utility.js";
import {APIEmbedFooter, Message} from "discord.js";

export const embedFieldsAdd: Modal = {
	async execute(interaction) {
		let fieldPosition = parseInt(
			interaction.fields.getTextInputValue("fieldPosition"),
		);

		const fieldName = interaction.fields.getTextInputValue("fieldName");
		const fieldValue = interaction.fields.getTextInputValue("fieldValue");
		const fieldInline = interaction.fields.getTextInputValue("fieldInline");

		const embed = (interaction.message as Message).embeds[0].data;

		const id = (/\d+/.exec(embed.description as string) as RegExpExecArray)[0];

		const embedNumber = parseInt(
			(/\d+/.exec((embed.footer as APIEmbedFooter).text) as RegExpExecArray)[0],
		);

		const embedData = await EmbedSchema.findOne({
			author: interaction.user.id,
			id,
		});

		if (!embedData) {
			return interaction.reply(new ErrorMessage("Couldn't find embed!"));
		}

		let {embeds} = embedData;
		embeds ??= [];

		const fieldArray = embeds[embedNumber - 1].fields ?? [];

		if (!fieldPosition) {
			fieldPosition = fieldArray.length;
		}

		if (!fieldPosition) {
			const reg = new RegExp(`^.*${fieldPosition}.*$`, "ig");
			for (let index = 0; index < fieldArray.length; index++) {
				if (reg.test(fieldArray[index].name)) {
					fieldPosition = index;
					break;
				}
			}
		}

		if (!fieldArray[fieldPosition] && fieldArray.length !== 0) {
			return interaction.reply(new ErrorMessage("That field does not exist!"));
		}

		fieldArray.splice(fieldPosition - 1, 0, {
			name: fieldName,
			value: fieldValue,
			inline: fieldInline.toLowerCase().trim() === "true",
		});

		embeds[embedNumber - 1].fields = fieldArray;

		await EmbedSchema.updateOne(
			{
				author: interaction.user.id,
				id,
			},
			{
				embeds,
			},
		);

		await interaction.reply(new SuccessMessage("Embed Saved"));
	},
};
