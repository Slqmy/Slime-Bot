import {Button} from "types";

export const ticketCloseCancel: Button = {
	async execute(interaction) {
		await interaction.message.delete();
	},
};
