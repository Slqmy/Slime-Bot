import {
	EmbedFileMessageBuilder,
	EmbedEmbedMessageBuilder,
	EmbedComponentMessageBuilder,
	getEmbedType,
	ErrorMessage,
} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";
import {APIEmbedFooter} from "discord.js";

export const embedEditDown: Button = {
	async execute(interaction, client) {
		const embed = interaction.message.embeds[0].data;

		const match = (
			RegExp(/(?<= - Editing )\w+(?=s$)/).exec(
				embed.title as string,
			) as RegExpExecArray
		)[0];

		const count = parseInt(
			(
				/\d+/.exec(
					interaction.message.embeds[0].data.description as string,
				) as RegExpExecArray
			)[0],
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embedProfile) {
			return interaction.reply(new ErrorMessage("Couldn't find embed!"));
		}

		const index =
			parseInt(
				(
					/\d+/.exec(
						(interaction.message.embeds[0].data.footer as APIEmbedFooter).text,
					) as RegExpExecArray
				)[0],
			) - 1;

		const array = (embedProfile as unknown as {[key: string]: unknown})[
			`${match}s`
		] as [];

		if (index !== array.length - 1) {
			[array[index + 1], array[index]] = [array[index], array[index + 1]];
		}

		await EmbedSchema.updateOne(
			{author: interaction.user.id, id: count},
			match === "file"
				? {files: embedProfile.files}
				: match === "embed"
				? {embeds: embedProfile.embeds}
				: {components: embedProfile.components},
		);

		await interaction.deferUpdate();

		await interaction.message.edit(
			getEmbedType(
				match as "file" | "embed" | "component",
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
