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

export const embedEdit2: Button = {
	async execute(interaction) {
		const embed = interaction.message.embeds[0].data;

		const countReg = /\d+/;

		const count = parseInt(
			(countReg.exec(embed.description as string) as RegExpExecArray)[0],
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		const embedNumber =
			parseInt(
				(
					/\d+/.exec((embed.footer as APIEmbedFooter).text) as RegExpExecArray
				)[0],
			) - 1;

		if (!embedProfile) {
			return interaction.reply(new ErrorMessage("This embed does not exist!"));
		}

		await interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedModal3")
				.setTitle("Embed Creation Part 3")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedImage")
							.setLabel("Embed Image")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your image link here.")
							.setValue(embedProfile.embeds?.[embedNumber].image?.url ?? ""),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedThumbnail")
							.setLabel("Thumbnail")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("The thumbnail link here.")
							.setValue(
								embedProfile.embeds?.[embedNumber].thumbnail?.url ?? "",
							),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedFooterText")
							.setLabel("Footer Text")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your footer text here.")
							.setValue(embedProfile.embeds?.[embedNumber].footer?.text ?? ""),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedFooterIconURL")
							.setLabel("Footer Icon")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your footer icon link here.")
							.setValue(
								embedProfile.embeds?.[embedNumber].footer?.icon_url ?? "",
							),
					),
				),
		);
	},
};
