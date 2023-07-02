import {EmbedBuilder, Message} from "discord.js";
import {
	Colours,
	EmbedEmbedMessageBuilder,
	ErrorMessage,
	isValidURL,
	resolveColour,
	resolveDuration,
} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Modal} from "types";

export const embedEmbedAdd: Modal = {
	async execute(interaction, client) {
		const {fields, message, user} = interaction;

		const id = (
			/\d+/.exec(
				(message as Message).embeds[0].data.description as string,
			) as RegExpExecArray
		)[0];

		const embed = await EmbedSchema.findOne({
			author: user.id,
			id,
		});

		if (!embed) {
			return interaction.reply(new ErrorMessage("Couldn't find embed!"));
		}

		const colour = fields.getTextInputValue("embedColour");
		const url = fields.getTextInputValue("embedURL");
		const timestamp = fields.getTextInputValue("embedTimestamp");

		embed.embeds ??= [];

		embed.embeds.push(
			new EmbedBuilder()
				.setTitle(fields.getTextInputValue("embedTitle"))
				.setURL(isValidURL(url) ? url : null)
				.setDescription(fields.getTextInputValue("embedDescription") || null)
				.setColor(colour ? resolveColour(colour) : Colours.Default)
				.setTimestamp(timestamp ? resolveDuration(timestamp) : null).data,
		);

		await EmbedSchema.updateOne(
			{
				author: user.id,
				id,
			},
			embed,
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id,
		});

		if (!embedProfile) {
			return interaction.reply(new ErrorMessage("Embed not found!"));
		}

		await (interaction.message as Message).edit(
			new EmbedEmbedMessageBuilder(
				embedProfile,
				embedProfile.embeds.length - 1,
				client,
			),
		);

		await interaction.deferUpdate();
	},
};
