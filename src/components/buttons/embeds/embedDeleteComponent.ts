import {
	EmbedFileMessageBuilder,
	EmbedComponentMessageBuilder,
	EmbedEmbedMessageBuilder,
} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedDeleteComponent",
	},
	async execute(interaction, client) {
		const embed = interaction.message.embeds[0].data;

		const match = embed.title.match(/(?<= - Editing )\w+(?=s$)/)[0];

		const count = parseInt(embed.description.match(/\d+/)[0]);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});

		const index = parseInt(embed.footer.text.match(/\d+/)[0]) - 1;

		embedProfile[`${match}s`].splice(index, 1);

		await EmbedSchema.updateOne(
			{author: interaction.user.id, customID: count},
			match === "file"
				? {files: embedProfile.files}
				: match === "embed"
				? {embeds: embedProfile.embeds}
				: {components: embedProfile.components},
		);

		let embedMessage;

		switch (match) {
			case "file":
				embedMessage = new EmbedFileMessageBuilder(
					embedProfile,
					embedProfile[`${match}s`][index]
						? index
						: embedProfile[`${match}s`][index - 1]
						? index - 1
						: null,
					client,
				);
				break;
			case "embed":
				embedMessage = new EmbedEmbedMessageBuilder(
					embedProfile,
					embedProfile[`${match}s`][index]
						? index
						: embedProfile[`${match}s`][index - 1]
						? index - 1
						: null,
					client,
				);
				break;
			case "component":
				embedMessage = new EmbedComponentMessageBuilder(
					embedProfile,
					embedProfile[`${match}s`][index]
						? index
						: embedProfile[`${match}s`][index - 1]
						? index - 1
						: null,
					client,
				);
				break;
		}

		await interaction.deferUpdate();

		await interaction.message.edit(embedMessage);
	},
};
