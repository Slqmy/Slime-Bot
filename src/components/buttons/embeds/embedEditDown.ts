/* eslint-disable no-unused-vars */
import {getEmbedType} from "../../../functions.js";
import {
	EmbedFileMessageBuilder,
	EmbedEmbedMessageBuilder,
	EmbedComponentMessageBuilder,
} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedEditDown",
	},
	async execute(interaction, client) {
		const embed = interaction.message.embeds[0].data;

		const match = embed.title.match(/(?<= - Editing )\w+(?=s$)/)[0];

		const count = parseInt(
			interaction.message.embeds[0].data.description.match(/\d+/)[0],
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});

		const index =
			parseInt(interaction.message.embeds[0].data.footer.text.match(/\d+/)[0]) -
			1;

		if (index !== embedProfile[`${match}s`].length - 1) {
			[
				embedProfile[`${match}s`][index + 1],
				embedProfile[`${match}s`][`${match}s`],
			] = [
				embedProfile[`${match}s`][index],
				embedProfile[`${match}s`][index + 1],
			];
		}

		await EmbedSchema.updateOne(
			{author: interaction.user.id, customID: count},
			match === "file"
				? {files: embedProfile.files}
				: match === "embed"
				? {embeds: embedProfile.embeds}
				: {components: embedProfile.components},
		);

		await interaction.deferUpdate();

		await interaction.message.edit(
			getEmbedType(
				match,
				(...args) => new EmbedFileMessageBuilder(...args),
				(...args) => new EmbedEmbedMessageBuilder(...args),
				(...args) => new EmbedComponentMessageBuilder(...args),
				embedProfile,
				index === embedProfile[`${match}s`].length - 1 ? index : index + 1,
				client,
			),
		);
	},
};
