import {
	ErrorMessage,
	SuccessMessage,
	EmbedFileMessageBuilder,
	isValidURL,
} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import TemporaryDataSchema from "../../../schemas/TemporaryDataSchema.js";
import mongoose from "mongoose";
import {
	APIEmbedFooter,
	AttachmentPayload,
	Channel,
	EmbedBuilder,
	JSONEncodable,
	Message,
	TextChannel,
} from "discord.js";
import {Modal} from "types";

export const embedFileAdd: Modal = {
	async execute(interaction, client) {
		await interaction.deferReply({ephemeral: true});
		const count = parseInt(
			(
				/\d+/.exec(
					(
						(interaction.message as Message).embeds[0].data
							.footer as APIEmbedFooter
					).text,
				) as RegExpExecArray
			)[0],
		);
		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embedProfile) {
			return interaction.reply(new ErrorMessage("Embed not found."));
		}

		if (!interaction.fields.getTextInputValue("link")) {
			const waiting = new TemporaryDataSchema({
				_id: new mongoose.Types.ObjectId(),
				type: "waitingForUpload",
				match: {
					user: interaction.user.id,
					channel: (interaction.channel as Channel).id,
				},
				data: {
					message: (interaction.message as Message).id,
					count,
				},
				lifeSpan: 30000,
			});

			await waiting.save();

			interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle("🗃 Awaiting Files...")
						.setDescription(
							// eslint-disable-next-line quotes
							'> Send the files you would like to add to the embed builder, send "cancel" to cancel.',
						)
						.setColor(126543),
				],
			});
		} else {
			const input = interaction.fields.getTextInputValue("link").split(/, ?/gi);

			for (const i of input) {
				if (!isValidURL(i)) {
					input.splice(input.indexOf(i), 1);
				}
			}

			if (input.length) {
				if (input.length + (embedProfile.files?.length ?? 0) > 10) {
					interaction.editReply(
						new ErrorMessage(
							`Uploading the files provided will exceed the maximum file limit by \`${
								input.length + (embedProfile.files?.length ?? 0) - 10
							}\` file.`,
						),
					);
				} else {
					let msg;
					let error;

					try {
						msg = await (interaction.channel as TextChannel).send({
							content: "⚙ Adding Files...",
							files: input,
						});
					} catch (e) {
						error = e;
					}

					if (!msg) {
						interaction.editReply(
							new ErrorMessage(
								`Please provide a valid file URL!\n\n**Error:**\n> ${error}`,
							),
						);
					} else {
						for (const attachment of [...msg.attachments.values()]) {
							embedProfile.files ??= [];

							embedProfile.files.push({
								name: attachment.name,
								link: attachment.url,
								type: attachment.contentType ?? "image/png",
								size: attachment.size,
							});
						}
						await EmbedSchema.updateOne(
							{author: interaction.user.id, id: count},
							{files: embedProfile.files},
						);
						(interaction.message as Message).edit(
							new EmbedFileMessageBuilder(embedProfile, null, client),
						);

						interaction.editReply(
							new SuccessMessage(
								`Successfully added ${
									[...msg.attachments.values()].length === 1
										? `\`${[...msg.attachments.values()][0].name}\``
										: `\`${[...msg.attachments.values()].length}\` files`
								}!`,
							),
						);

						msg.edit({
							content: "✅ Successfully added the files!",
							attachments: [
								...msg.attachments.values(),
							] as JSONEncodable<AttachmentPayload>[],
						});
					}
				}
			} else {
				interaction.editReply(
					new ErrorMessage("Please input a valid file URL!"),
				);
			}
		}
	},
};
