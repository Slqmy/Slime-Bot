import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} from "discord.js";
import {ErrorMessage} from "../../../classes.js";

export default {
	data: {
		name: "embedSend",
	},
	async execute(interaction) {
		const countReg = /\d+/;

		const count = parseInt(
			interaction.message.embeds[0].data.description.match(countReg)[0],
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});

		if (!embedProfile) {
			await interaction.reply(new ErrorMessage("This embed does not exist!"));
		} else {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId("embedSend")
					.setTitle("Create your embed here!")
					.addComponents(
						new ActionRowBuilder().addComponents(
							new TextInputBuilder()
								.setCustomId("channel")
								.setLabel("Channel 💬")
								.setRequired(false)
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(
									"Channel to send the embed in. Leave empty to send here.",
								),
						),
					),
			);
		}
	},
};
