import {SuccessMessageBuilder, EmbedsMessageBuilder} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedDelete",
	},
	async execute(interaction, client) {
		const count = parseInt(
			interaction.message.embeds[0].data.description.match(/\d+/)[0],
		);

		let embedArray = await EmbedSchema.find({author: interaction.user.id});

		await EmbedSchema.deleteOne({
			author: interaction.user.id,
			customID: count,
		});

		for (let i = count + 1; i <= embedArray.length; i++) {
			await EmbedSchema.updateOne(
				{author: interaction.user.id, customID: i},
				{customID: i - 1},
			);
		}

		await interaction.reply(
			new SuccessMessageBuilder("Embed successfully deleted.", true),
		);

		embedArray = await EmbedSchema.find({
			author: interaction.user.id,
		});

		await interaction.message.edit(
			new EmbedsMessageBuilder(
				embedArray,
				interaction,
				client,
				Math.ceil(count / 25) -
					(embedArray.length % 25 === 1 && count === embedArray.length ? 1 : 0),
			),
		);
	},
};
