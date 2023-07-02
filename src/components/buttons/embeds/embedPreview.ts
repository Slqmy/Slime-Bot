import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {ErrorMessage, checkAuthorisation} from "../../../utility.js";
import {EmbedBuilder} from "discord.js";
import {Button} from "types.js";

export const embedPreview: Button = {
	async execute(interaction) {
		if (!checkAuthorisation(interaction)) {
			return interaction.reply(new ErrorMessage("This is not your embed!"));
		}

		await interaction.deferReply({ephemeral: true});

		const count = (
			/\d+/.exec(
				interaction.message.embeds[0].data.description as string,
			) as RegExpExecArray
		)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embedProfile) {
			return interaction.editReply(
				new ErrorMessage("This embed does not exist!"),
			);
		}

		if (
			!embedProfile.content &&
			!embedProfile.embeds?.length &&
			!embedProfile.files?.length &&
			!embedProfile.components?.length
		) {
			return interaction.editReply(
				new ErrorMessage("Can not send an empty message!"),
			);
		}

		await interaction.editReply({
			content: embedProfile.content,
			embeds: embedProfile.embeds?.map((embed) => new EmbedBuilder(embed)),
			files: embedProfile.files?.map((file) => file.link),
			components: embedProfile.components,
		});
	},
};
