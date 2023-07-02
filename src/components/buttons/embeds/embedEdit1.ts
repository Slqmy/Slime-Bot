import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {ErrorMessage} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedEdit1",
	},

	async execute(interaction) {
		const embed = interaction.message.embeds[0].data;

		const countReg = /\d+/;

		const count = parseInt(embed.description.match(countReg)[0]);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});

		const embedNumber = embed.footer.text.match(/\d+/)[0] - 1;

		if (!embedProfile) {
			return interaction.reply(new ErrorMessage("This embed does not exist!"));
		}

		await interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedModal1")
				.setTitle("Create your embed here!")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedTitle")
							.setLabel("Embed Title")
							.setRequired(true)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your embed title here.")
							.setValue(embedProfile.embeds[embedNumber].title || ""),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedURL")
							.setLabel("Embed URL")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Hyperlink for the embed title.")
							.setValue(embedProfile.embeds[embedNumber].url || ""),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedDescription")
							.setLabel("Embed Description")
							.setRequired(false)
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder("Your embed description here.")
							.setValue(embedProfile.embeds[embedNumber].description || ""),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedColour")
							.setLabel("Embed Colour")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("#ff0000 | 0xff0000 | Red | Transparent")
							.setValue(
								`${embedProfile.embeds[embedNumber].color.toString(16)}` || "",
							),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedTimestamp")
							.setLabel("Timestamp")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder(
								"mm/dd/yyyy hh:mm:ss | Now | In 5 minutes | 10s ago",
							)
							.setValue(embedProfile.embeds[embedNumber].timestamp || ""),
					),
				),
		);
	},
};
