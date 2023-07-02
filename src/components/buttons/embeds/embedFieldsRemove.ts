import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {ErrorMessage} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";

export const embedFieldsRemove: Button = {
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
				.setCustomId("embedFieldsRemove")
				.setTitle("Delete Field")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("deletedField")
							.setLabel("Which field would you like to delete?")
							.setRequired(true)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Number of the field to delete."),
					),
				),
		);
	},
};
