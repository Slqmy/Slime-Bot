import {Modal} from "types";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {ErrorMessage, SuccessMessage} from "../../../utility.js";
import {APIEmbedFooter, Message} from "discord.js";

export const embedFieldsEdit: Modal = {
	async execute(interaction) {
		let fieldPosition: string | number =
			interaction.fields.getTextInputValue("fieldPosition");
		const name = interaction.fields.getTextInputValue("fieldName");
		const value = interaction.fields.getTextInputValue("fieldValue");
		const inline = interaction.fields.getTextInputValue("fieldInline");

		const embed = (interaction.message as Message).embeds[0].data;

		const count = (
			/\d+/.exec(embed.description as string) as RegExpExecArray
		)[0];

		const embedData = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embedData) {
			return interaction.reply(new ErrorMessage("Couldn't find embed!"));
		}

		const embedNumber = parseInt(
			(/\d+/.exec((embed.footer as APIEmbedFooter).text) as RegExpExecArray)[0],
		);

		let embeds = embedData.embeds;
		embeds ??= [];

		let fieldArray = embeds[embedNumber - 1].fields;
		fieldArray ??= [];

		if (!parseInt(fieldPosition)) {
			const reg = new RegExp(`^.*${fieldPosition}.*$`, "ig");
			for (let index = 0; index < fieldArray.length; index++) {
				if (reg.test(fieldArray[index].name)) {
					fieldPosition = index + 1;
					break;
				}
			}
		}

		fieldPosition = parseInt(`${fieldPosition}`);

		if (!fieldArray[fieldPosition]) {
			return interaction.reply(new ErrorMessage("That field does not exist!"));
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
				id: count,
			},
			{
				embeds,
			},
		);

		await interaction.reply(new SuccessMessage("Embed Saved"));
	},
};
