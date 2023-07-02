import {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} from "discord.js";
import {ErrorMessage} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";

export const embedFieldsEdit: Button = {
	async execute(interaction) {
		const embed = interaction.message.embeds[0].data;

		const id = (/\d+/.exec(embed.description as string) as RegExpExecArray)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id,
		});

		if (!embedProfile) {
			return interaction.reply(new ErrorMessage("This embed does not exist!"));
		}
		await interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedFieldsEdit")
				.setTitle("Edit Field")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldPosition")
							.setLabel("Field Number")
							.setRequired(true)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Which field would you like to edit?"),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldName")
							.setLabel("Field Name")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your field name here."),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldValue")
							.setLabel("Field Value")
							.setRequired(false)
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder("Your field value here."),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldInline")
							.setLabel("Inline")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Inline (true / false)."),
					),
				),
		);
	},
};
