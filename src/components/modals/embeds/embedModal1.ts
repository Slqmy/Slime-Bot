import {APIEmbedFooter, Message} from "discord.js";
import {
	SuccessMessage,
	EmbedEmbedMessageBuilder,
	resolveDuration,
	resolveColour,
} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Modal} from "types";

export const embedModal1: Modal = {
	async execute(interaction, client) {
		const embedMessage = (interaction.message as Message).embeds[0].data;

		const count = (
			/\d+/.exec(embedMessage.description as string) as RegExpExecArray
		)[0];

		const embedIndex =
			parseInt(
				(
					/\d+/.exec(
						(embedMessage.footer as APIEmbedFooter).text,
					) as RegExpExecArray
				)[0],
			) - 1;

		const embed = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embed) {
			return interaction.reply("Couldn't find embed!");
		}

		embed.embeds ??= [];

		embed.embeds[embedIndex] = {
			...embed.embeds[embedIndex],
			...{
				title: interaction.fields.getTextInputValue("embedTitle"),
				url: interaction.fields.getTextInputValue("embedURL"),
				description: interaction.fields.getTextInputValue("embedDescription"),
				color: resolveColour(
					interaction.fields.getTextInputValue("embedColour"),
				),
				timestamp: interaction.fields.getTextInputValue("embedTimestamp")
					? new Date(
							resolveDuration(
								interaction.fields.getTextInputValue("embedTimestamp"),
							) ?? Date.now(),
					  ).toISOString()
					: undefined,
			},
		};

		await EmbedSchema.updateOne(
			{
				author: interaction.user.id,
				id: count,
			},
			{
				embeds: embed.embeds,
			},
		);

		await (interaction.message as Message).edit(
			new EmbedEmbedMessageBuilder(embed, embedIndex, client),
		);

		await interaction.reply(
			new SuccessMessage("Embed saved successfully", true),
		);
	},
};
