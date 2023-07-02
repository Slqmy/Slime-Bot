import {
	EmbedFileMessageBuilder,
	EmbedComponentMessageBuilder,
	EmbedEmbedMessageBuilder,
	ErrorMessage,
} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Button} from "types";
import {
	APIEmbedFooter,
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from "discord.js";

export const embedDeleteComponent: Button = {
	async execute(interaction, client) {
		const embed = interaction.message.embeds[0].data;

		const match = (
			/(?<= - Editing )\w+(?=s$)/.exec(embed.title as string) as RegExpExecArray
		)[0];

		const count = parseInt(
			(/\d+/.exec(embed.description as string) as RegExpExecArray)[0],
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embedProfile) {
			return interaction.reply(
				new ErrorMessage("Couldn't find embed profile!"),
			);
		}

		const index =
			parseInt(
				(
					/\d+/.exec((embed.footer as APIEmbedFooter).text) as RegExpExecArray
				)[0],
			) - 1;

		const array = (embedProfile as unknown as {[key: string]: unknown})[
			`${match}s`
		] as (
			| EmbedBuilder["data"]
			| {link: string; name: string; size: number; type: string}
			| ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>
		)[];

		array.splice(index, 1);

		await EmbedSchema.updateOne(
			{author: interaction.user.id, id: count},
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
					(embedProfile[`${match}s`] as [])[index]
						? index
						: array[index - 1]
						? index - 1
						: null,
					client,
				);
				break;
			case "embed":
				embedMessage = new EmbedEmbedMessageBuilder(
					embedProfile,
					array[index] ? index : array[index - 1] ? index - 1 : null,
					client,
				);
				break;
			case "component":
				embedMessage = new EmbedComponentMessageBuilder(
					embedProfile,
					array[index] ? index : array[index - 1] ? index - 1 : null,
					client,
				);
				break;
		}

		await interaction.deferUpdate();

		await interaction.message.edit(embedMessage);
	},
};
