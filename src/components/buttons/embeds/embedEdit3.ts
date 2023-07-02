import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
	APIEmbedFooter,
} from "discord.js";
import {ErrorMessage, checkAuthorisation} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";

export const embedEdit3: Button = {
	async execute(interaction) {
		if (!checkAuthorisation(interaction)) {
			return interaction.reply(new ErrorMessage("This is not your embed!"));
		}

		const embed = interaction.message.embeds[0].data;

		const id = (/\d+/.exec(embed.description as string) as RegExpExecArray)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id,
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
				.setCustomId("embedModal2")
				.setTitle("Embed Creation Part 2")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedAuthorName")
							.setLabel("Author Text")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("The embed author here.")
							.setValue(embedProfile.embeds?.[embedNumber].author?.name ?? ""),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedAuthorURL")
							.setLabel("Author Link")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("The author URL.")
							.setValue(embedProfile.embeds?.[embedNumber].author?.url ?? ""),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("embedAuthorIconURL")
							.setLabel("Author Icon")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("The author icon here.")
							.setValue(
								embedProfile.embeds?.[embedNumber].author?.icon_url ?? "",
							),
					),
				),
		);
	},
};
