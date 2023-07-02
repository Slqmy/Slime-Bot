import {EmbedMessageBuilder} from "../../../classes.js";
import {numberEnding} from "../../../functions.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {name: "embedBack"},
	async execute(interaction, client) {
		await interaction.deferUpdate();

		const count =
			interaction.message.embeds[0].data.footer.text.match(/\d+/)[0];
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
				)}\` embed builder! Select what you would like to \n> do with it below.`,
			),
		);
	},
};
