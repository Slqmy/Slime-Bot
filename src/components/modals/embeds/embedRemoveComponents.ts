import {
	ErrorMessage,
	SuccessMessage,
	EmbedFileMessageBuilder,
	EmbedEmbedMessageBuilder,
	EmbedComponentMessageBuilder,
	addNumberSuffix,
	capitaliseFirstLetter,
} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Modal} from "types";
import {Message} from "discord.js";

export const embedRemoveComponents: Modal = {
	async execute(interaction, client) {
		const embed = (interaction.message as Message).embeds[0].data;

		const match = embed.title.match(/(?<= - Editing )\w+(?=s$)/)[0];

		const input = interaction.fields.getTextInputValue("name").split(/, ?/g);

		const count = parseInt(embed.footer.text.match(/\d+/)[0]);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		const map = embedProfile[`${match}s`].map(
			(element) => element.name ?? element.title ?? element.label,
		);

		const removedElements = [];

		for (const name of input) {
			for (const element of map) {
				if (
					new RegExp(name, "ig").test(element) ||
					embedProfile[`${match}s`][parseInt(name) - 1]
				) {
					removedElements.push(element);
					embedProfile[`${match}s`].splice(
						embedProfile[`${match}s`][parseInt(name) - 1]
							? name - 1
							: embedProfile[`${match}s`].indexOf(element),
						1,
					);
					break;
				}
			}
		}

		if (!removedElements.length) {
			return interaction.reply(
				new ErrorMessage(
					`${capitaliseFirstLetter(match)}${addNumberSuffix(
						input.length,
					)} not found.`,
				),
			);
		}

		await EmbedSchema.updateOne(
			{author: interaction.user.id, id: count},
			match === "file"
				? {files: embedProfile.files}
				: match === "embed"
				? {embeds: embedProfile.embeds}
				: {components: embedProfile.components},
		);

		await interaction.reply(
			new SuccessMessage(
				`Successfully removed ${
					removedElements.length === 1
						? `\`${removedElements[0]}\``
						: `\`${removedElements.length}\` ${match}s`
				}.`,
			),
		);

		let embedMessage;

		switch (match) {
			case "file":
				embedMessage = new EmbedFileMessageBuilder(embedProfile, null, client);
				break;
			case "embed":
				embedMessage = new EmbedEmbedMessageBuilder(embedProfile, null, client);
				break;
			case "component":
				embedMessage = new EmbedComponentMessageBuilder(
					embedProfile,
					null,
					client,
				);
				break;
		}

		await interaction.message.edit(embedMessage);
	},
};
