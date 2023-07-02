import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {ErrorMessage} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types.js";

export const embedAddComponent: Button = {
	async execute(interaction) {
		const embed = interaction.message.embeds[0].data;

		const count = embed.footer.text.match(/\d+/);
		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});
		const match = embed.title.match(/(?<= - Editing )\w+(?=s$)/)[0];

		switch (match) {
			case "file":
				if (embedProfile.files.length === 10) {
					return interaction.reply(
						new ErrorMessage(
							"Uploading more files will exceed the maximum file limit.",
							true,
						),
					);
				}

				await interaction.showModal(
					new ModalBuilder()
						.setCustomId("embedFileAdd")
						.setTitle("Add File")
						.addComponents(
							new ActionRowBuilder().addComponents(
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
				break;
			case "embed":
				if (embedProfile.embeds.length === 25) {
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
							new ActionRowBuilder().addComponents(
								new TextInputBuilder()
									.setCustomId("embedTitle")
									.setLabel("Embed Title")
									.setRequired(true)
									.setStyle(TextInputStyle.Short)
									.setPlaceholder("Your embed title here."),
							),
							new ActionRowBuilder().addComponents(
								new TextInputBuilder()
									.setCustomId("embedURL")
									.setLabel("Embed URL")
									.setRequired(false)
									.setStyle(TextInputStyle.Short)
									.setPlaceholder("Hyperlink for the embed title."),
							),
							new ActionRowBuilder().addComponents(
								new TextInputBuilder()
									.setCustomId("embedDescription")
									.setLabel("Embed Description")
									.setRequired(false)
									.setStyle(TextInputStyle.Paragraph)
									.setPlaceholder("Your embed description here."),
							),
							new ActionRowBuilder().addComponents(
								new TextInputBuilder()
									.setCustomId("embedColour")
									.setLabel("Embed Colour")
									.setRequired(false)
									.setStyle(TextInputStyle.Short)
									.setPlaceholder("#ff0000 | 0xff0000 | Red | Transparent "),
							),
							new ActionRowBuilder().addComponents(
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
