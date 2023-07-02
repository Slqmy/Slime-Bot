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
		name: "embedEdit2",
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
				.setCustomId("embedModal3")
				.setTitle("Embed Creation Part 3")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedImage")
							.setLabel("Embed Image")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your image link here.")
							.setValue(embedProfile.embeds[embedNumber].image || ""),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedThumbnail")
							.setLabel("Thumbnail")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("The thumbnail link here.")
							.setValue(embedProfile.embeds[embedNumber].thumbnail || ""),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedFooterText")
							.setLabel("Footer Text")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your footer text here.")
							.setValue(embedProfile.embeds[embedNumber].footer?.text || ""),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedFooterIconURL")
							.setLabel("Footer Icon")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Your footer icon link here.")
							.setValue(
								embedProfile.embeds[embedNumber].footer?.icon_url || "",
							),
					),
				),
		);
	},
};
