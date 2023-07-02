import {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} from "discord.js";
import {ErrorMessage} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedFieldsEdit",
	},
	async execute(interaction) {
		const embed = interaction.message.embeds[0].data;

		const customID = embed.description.match(/\d+/)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: customID,
		});

		if (!embedProfile) {
			return await interaction.reply(
				new ErrorMessage("This embed does not exist!"),
			);
		}
		await interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedFieldsEdit")
				.setTitle("Edit Field")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldPosition")
							.setLabel("Field Number")
							.setRequired(true)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Which field would you like to edit?"),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldName")
							.setLabel("Field Name")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your field name here."),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("fieldValue")
							.setLabel("Field Value")
							.setRequired(false)
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder("Your field value here."),
					),
					new ActionRowBuilder().addComponents(
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
