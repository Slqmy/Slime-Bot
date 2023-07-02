import {Button} from "types";
import {ErrorMessage, EmbedsMessageBuilder} from "../../../utility.js";

export const embedsMenuBack: Button = {
	async execute(interaction, client) {
		if (interaction.message.interaction?.user.id !== interaction.user.id) {
			await interaction.reply(new ErrorMessage("This is not your embed menu."));
		} else {
			interaction.deferUpdate();

			await interaction.message.edit(
				await new EmbedsMessageBuilder().create(
					interaction,
					client,
					(page) => page - 1,
				),
			);
		}
	},
};
