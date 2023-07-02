import {SuccessMessageBuilder} from "../../../classes.js";

export default {
	data: {
		name: "embedDeletionNevermind",
	},
	async execute(interaction) {
		await interaction.reply(
			new SuccessMessageBuilder("Successfully cancelled the deletion.", true),
		);
	},
};
