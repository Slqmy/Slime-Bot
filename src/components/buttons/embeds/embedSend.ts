import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} from "discord.js";
import {ErrorMessage} from "../../../utility.js";
import {Button} from "types";

export const embedSend: Button = {
	async execute(interaction) {
		const count = parseInt(
			(
				/\d+/.exec(
					interaction.message.embeds[0].data.description ?? "1",
				) as RegExpExecArray
			)[0],
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embedProfile) {
			await interaction.reply(new ErrorMessage("This embed does not exist!"));
		} else {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId("embedSend")
					.setTitle("Create your embed here!")
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
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
