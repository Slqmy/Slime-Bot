import {EmbedComponentMessageBuilder} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {name: "embedEditComponents"},
	async execute(interaction) {
		interaction.deferUpdate();
		const count =
			interaction.message.embeds[0].data.description.match(/\d+/)[0];
		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});
		interaction.message.edit(
			new EmbedComponentMessageBuilder(embedProfile, null, interaction),
		);
	},
};
