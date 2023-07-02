import {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedEditContent",
	},
	async execute(interaction) {
		const count =
			interaction.message.embeds[0].data.footer.text.match(/\d+/)[0];
		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});
		interaction.showModal(
			new ModalBuilder()
				.setCustomId("embedEditContent")
				.setTitle("Edit Content")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("content")
							.setLabel("Content")
							.setPlaceholder("Message content")
							.setStyle(TextInputStyle.Paragraph)
							.setValue(embedProfile.content)
							.setRequired(false),
					),
				),
		);
	},
};
