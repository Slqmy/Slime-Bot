import {ErrorMessage, EmbedFileMessageBuilder} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Modal} from "types";
import {APIEmbedFooter, Message} from "discord.js";

export const embedFileEdit: Modal = {
	async execute(interaction, client) {
		const input = interaction.fields.getTextInputValue("name");

		const count = parseInt(
			(
				/\d+/.exec(
					(
						(interaction.message as Message).embeds[0].data
							.footer as APIEmbedFooter
					).text,
				) as RegExpExecArray
			)[0],
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embedProfile) {
			return interaction.reply(new ErrorMessage("Couldn't find embed!"));
		}

		let index = -1;
		for (const file of embedProfile.files?.map((e) => e.name) ?? []) {
			const reg = new RegExp(input, "ig");
			if (reg.test(file)) {
				index = embedProfile.files?.map((e) => e.name).indexOf(file) ?? -1;
				break;
			}
		}

		if (index !== -1) {
			await interaction.deferUpdate();

			await (interaction.message as Message).edit(
				new EmbedFileMessageBuilder(embedProfile, index, client),
			);
		} else {
			await interaction.reply(new ErrorMessage("File not found."));
		}
	},
};
