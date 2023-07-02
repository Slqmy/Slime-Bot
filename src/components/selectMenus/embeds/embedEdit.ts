/* eslint-disable no-unused-vars */
import {
	EmbedFileMessageBuilder,
	EmbedEmbedMessageBuilder,
	EmbedComponentMessageBuilder,
} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedEdit",
	},
	async execute(interaction, client) {
		const embed = interaction.message.embeds[0].data;

		const match = embed.title.match(/(?<= - Editing )\w+(?=s$)/)[0];

		const customID = embed.description.match(/\d+/)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: customID,
		});

		let embedMessage;

		switch (match) {
			case "file":
				embedMessage = new EmbedFileMessageBuilder(
					embedProfile,
					parseInt(interaction.values[0]),
					client,
				);
				break;
			case "embed":
				embedMessage = new EmbedEmbedMessageBuilder(
					embedProfile,
					parseInt(interaction.values[0]),
					client,
				);
				break;
			case "component":
				embedMessage = new EmbedComponentMessageBuilder(
					embedProfile,
					parseInt(interaction.values[0]),
					client,
				);
				break;
		}

		await interaction.deferUpdate();
		await interaction.message.edit(embedMessage);
	},
};
