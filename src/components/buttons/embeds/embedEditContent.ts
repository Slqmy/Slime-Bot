import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
	APIEmbedFooter,
} from "discord.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";
import {ErrorMessage} from "../../../utility.js";

export const embedEditContent: Button = {
	async execute(interaction) {
		const count = (
			RegExp(/\d+/).exec(
				(interaction.message.embeds[0].data.footer as APIEmbedFooter).text,
			) as RegExpExecArray
		)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embedProfile) {
			return interaction.reply(new ErrorMessage("Embed profile not found!"));
		}

		interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedEditContent")
				.setTitle("Edit Content")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("content")
							.setLabel("Content")
							.setPlaceholder("Message content")
							.setStyle(TextInputStyle.Paragraph)
							.setValue(embedProfile.content ?? "")
							.setRequired(false),
					),
				),
		);
	},
};
