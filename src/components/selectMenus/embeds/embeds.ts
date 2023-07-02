import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {numberEnding} from "../../../functions.js";
import {EmbedMessageBuilder} from "../../../classes.js";

export default {
	data: {
		name: "embeds",
	},
	async execute(interaction, client) {
		const count = parseInt(interaction.values[0]);

		const embedArray = await EmbedSchema.find({
			author: interaction.user.id,
		});

		await interaction.message.edit(
			new EmbedMessageBuilder(
				client,
				embedArray[count - 1],
				embedArray,
				`Currently editing your \`${count}${numberEnding(
					count,
				)}\` embed! Select what you would like to do with it below.`,
			),
		);

		await interaction.deferUpdate();
	},
};
