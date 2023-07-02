import {SuccessMessageBuilder} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedDeletionConfirm",
	},
	async execute(interaction) {
		await EmbedSchema.deleteMany({
			author: interaction.user.id,
		});
		await interaction.reply(
			new SuccessMessageBuilder("Embeds successfully deleted."),
		);
	},
};
