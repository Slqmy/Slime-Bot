import {EmbedFileMessageBuilder} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {name: "embedEditFiles"},
	async execute(interaction, client) {
		const count = parseInt(
			interaction.message.embeds[0].data.description.match(/\d+/)[0],
		);
		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});
		await interaction.deferUpdate();

		await interaction.message.edit(
			new EmbedFileMessageBuilder(embedProfile, null, client),
		);
	},
};
