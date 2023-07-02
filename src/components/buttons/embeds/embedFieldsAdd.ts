import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
	APIEmbedFooter,
} from "discord.js";
import {ErrorMessage} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";

export const embedFieldsAdd: Button = {
	async execute(interaction) {
		const embed = interaction.message.embeds[0].data;

		const id = (/\d+/.exec(embed.description as string) as RegExpExecArray)[0];

		const embedNumber = (
			/\d+/.exec((embed.footer as APIEmbedFooter).text) as RegExpExecArray
		)[0];

		const embedData = await EmbedSchema.findOne({
			author: interaction.user.id,
			id,
		});

		if (!embedData) {
			return interaction.reply(new ErrorMessage("This embed does not exist!"));
		}

		await interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedFieldsAdd")
				.setTitle(
					`Field ${
						(embedData.embeds?.[parseInt(embedNumber) - 1].fields?.length ??
							0) + 1
					}`,
				)
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldPosition")
							.setLabel("Field Position")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder(
								"The position of the field in the embed (default is at the end).",
							),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldName")
							.setLabel("Field Name")
							.setRequired(true)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("The field name."),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldValue")
							.setLabel("Field Value")
							.setRequired(true)
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder("The field value."),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldInline")
							.setLabel("Inline")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder(
								"Whether the field should be inline (true / false).",
							),
					),
				),
		);
	},
};
