import {Modal} from "types";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {ErrorMessage, SuccessMessage} from "../../../utility.js";
import {APIEmbedFooter, Message} from "discord.js";

export const embedFieldsRemove: Modal = {
	async execute(interaction) {
		const embed = (interaction.message as Message).embeds[0].data;

		const id = /\d+/.exec(
			(interaction.message as Message).embeds[0].data.description as string,
		);

		const embedData = await EmbedSchema.findOne({
			author: interaction.user.id,
			id,
		});

		if (!embedData) {
			return interaction.reply(new ErrorMessage("Couldn't find embed!"));
		}

		const embedNumber = parseInt(
			(/\d+/.exec((embed.footer as APIEmbedFooter).text) as RegExpExecArray)[0],
		);

		embedData.embeds ??= [];
		let fieldArray = embedData.embeds[embedNumber - 1].fields;
		fieldArray ??= [];

		const input = parseInt(
			interaction.fields.getTextInputValue("deletedField"),
		);

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
			return interaction.reply(new ErrorMessage("That field does not exist!"));
		}

		const field = fieldArray[fieldPosition];

		fieldArray.splice(fieldPosition, 1);

		embedData.embeds[embedNumber - 1].fields = fieldArray;

		await EmbedSchema.updateOne(
			{
				author: interaction.user.id,
				id,
			},
			{
				embeds: embedData.embeds,
			},
		);

		await interaction.reply(
			new SuccessMessage(`Field \`${field.name}\` Successfully deleted`),
		);
	},
};
