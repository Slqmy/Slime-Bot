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

export const embedAddComponent: Button = {
	async execute(interaction) {
		const embed = interaction.message.embeds[0].data;

		const id = (
			/\d+/.exec((embed.footer as APIEmbedFooter).text) as RegExpExecArray
		)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id,
		});

		const match = (
			/(?<= - Editing )\w+(?=s$)/.exec(embed.title as string) as RegExpExecArray
		)[0];

		switch (match) {
			case "file":
				if (embedProfile?.files?.length === 10) {
					return interaction.reply(
						new ErrorMessage(
							"Uploading more files will exceed the maximum file limit.",
							true,
						),
					);
				}

				return interaction.showModal(
					new ModalBuilder()
						.setCustomId("embedFileAdd")
						.setTitle("Add File")
						.addComponents(
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setLabel("Link")
									.setPlaceholder(
										"File link, add multiple by separating links with commas. Leave empty to upload files directly.",
									)
									.setCustomId("link")
									.setStyle(TextInputStyle.Paragraph)
									.setRequired(false),
							),
						),
				);
			case "embed":
				if (embedProfile?.embeds?.length === 25) {
					return interaction.reply(
						new ErrorMessage(
							"Creating more embeds will exceed the maximum embed limit.",
							true,
						),
					);
				}

				await interaction.showModal(
					new ModalBuilder()
						.setCustomId("embedEmbedAdd")
						.setTitle("Add Embed")
						.addComponents(
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setCustomId("embedTitle")
									.setLabel("Embed Title")
									.setRequired(true)
									.setStyle(TextInputStyle.Short)
									.setPlaceholder("Your embed title here."),
							),
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setCustomId("embedURL")
									.setLabel("Embed URL")
									.setRequired(false)
									.setStyle(TextInputStyle.Short)
									.setPlaceholder("Hyperlink for the embed title."),
							),
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setCustomId("embedDescription")
									.setLabel("Embed Description")
									.setRequired(false)
									.setStyle(TextInputStyle.Paragraph)
									.setPlaceholder("Your embed description here."),
							),
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setCustomId("embedColour")
									.setLabel("Embed Colour")
									.setRequired(false)
									.setStyle(TextInputStyle.Short)
									.setPlaceholder("#ff0000 | 0xff0000 | Red | Transparent "),
							),
							new ActionRowBuilder<TextInputBuilder>().addComponents(
								new TextInputBuilder()
									.setCustomId("embedTimestamp")
									.setLabel("Timestamp")
									.setRequired(false)
									.setStyle(TextInputStyle.Short)
									.setPlaceholder(
										"mm/dd/yyyy hh:mm:ss | Now | In 5 minutes | 10s ago",
									),
							),
						),
				);

				break;
		}
	},
};
