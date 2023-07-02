import {SuccessMessage} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";

export const embedDeletionConfirm: Button = {
	async execute(interaction) {
		await EmbedSchema.deleteMany({
			author: interaction.user.id,
		});

		await interaction.reply(new SuccessMessage("Embeds successfully deleted."));
	},
};
