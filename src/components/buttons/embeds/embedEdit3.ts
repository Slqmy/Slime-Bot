import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {checkAuthorisation} from "../../../functions.js";
import {ErrorMessage} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedEdit3",
	},
	async execute(interaction) {
		if (!checkAuthorisation(interaction)) {
			return interaction.reply(new ErrorMessage("This is not your embed!"));
		}

		const embed = interaction.message.embeds[0].data;

		const countReg = /[0-9]+/;

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
				.setCustomId("embedModal2")
				.setTitle("Embed Creation Part 2")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedAuthorName")
							.setLabel("Author Text")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("The embed author here.")
							.setValue(embedProfile.embeds[embedNumber].author?.name || ""),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedAuthorURL")
							.setLabel("Author Link")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("The author URL.")
							.setValue(embedProfile.embeds[embedNumber].author?.url || ""),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("embedAuthorIconURL")
							.setLabel("Author Icon")
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("The author icon here.")
							.setValue(embedProfile.embeds[embedNumber].author?.iconURL || ""),
					),
				),
		);
	},
};
