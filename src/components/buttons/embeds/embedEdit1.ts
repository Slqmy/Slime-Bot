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

export const embedEdit1: Button = {
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
				.setCustomId("embedModal1")
				.setTitle("Create your embed here!")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedTitle")
							.setLabel("Embed Title")
							.setRequired(true)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your embed title here.")
							.setValue(embedProfile.embeds?.[embedNumber].title ?? ""),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedURL")
							.setLabel("Embed URL")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Hyperlink for the embed title.")
							.setValue(embedProfile.embeds?.[embedNumber].url ?? ""),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedDescription")
							.setLabel("Embed Description")
							.setRequired(false)
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder("Your embed description here.")
							.setValue(embedProfile.embeds?.[embedNumber].description ?? ""),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedColour")
							.setLabel("Embed Colour")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("#ff0000 | 0xff0000 | Red | Transparent")
							.setValue(
								embedProfile.embeds?.[embedNumber].color?.toString(16) ?? "",
							),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedTimestamp")
							.setLabel("Timestamp")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder(
								"mm/dd/yyyy hh:mm:ss | Now | In 5 minutes | 10s ago",
							)
							.setValue(embedProfile.embeds?.[embedNumber].timestamp ?? ""),
					),
				),
		);
	},
};
