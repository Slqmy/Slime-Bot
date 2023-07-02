import {SuccessMessage, EmbedsMessageBuilder} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";

export const embedDelete: Button = {
	async execute(interaction, client) {
		const count = parseInt(
			(
				/\d+/.exec(
					interaction.message.embeds[0].data.description as string,
				) as RegExpExecArray
			)[0],
		);

		let embedArray = await EmbedSchema.find({author: interaction.user.id});

		await EmbedSchema.deleteOne({
			author: interaction.user.id,
			id: count,
		});

		for (let i = count + 1; i <= embedArray.length; i++) {
			await EmbedSchema.updateOne(
				{author: interaction.user.id, id: i},
				{id: i - 1},
			);
		}

		await interaction.reply(
			new SuccessMessage("Embed successfully deleted.", true),
		);

		embedArray = await EmbedSchema.find({
			author: interaction.user.id,
		});

		await interaction.message.edit(
			await new EmbedsMessageBuilder().create(
				interaction,
				client,
				() =>
					Math.ceil(count / 25) -
					(embedArray.length % 25 === 1 && count === embedArray.length ? 1 : 0),
			),
		);
	},
};
