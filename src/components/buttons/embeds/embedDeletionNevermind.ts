import {Button} from "types";
import {SuccessMessage} from "../../../utility.js";

export const embedDeletionNevermind: Button = {
	async execute(interaction) {
		await interaction.reply(
			new SuccessMessage("Successfully cancelled the deletion.", true),
		);
	},
};
