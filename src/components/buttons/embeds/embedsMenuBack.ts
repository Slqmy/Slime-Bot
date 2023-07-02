import {ErrorMessage, EmbedsMessageBuilder} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedsMenuBack",
	},
	async execute(interaction, client) {
		if (interaction.message.interaction.user.id !== interaction.user.id) {
			await interaction.reply(new ErrorMessage("This is not your embed menu."));
		} else {
			const embedArray = await EmbedSchema.find({author: interaction.user.id});
			const page =
				parseInt(
					interaction.message.embeds[0].data.footer?.text.match(/\d+/)[0] ?? 1,
				) - 1;
			await interaction.message.edit(
				new EmbedsMessageBuilder(embedArray, interaction, client, page),
			);
			interaction.deferUpdate();
		}
	},
};
