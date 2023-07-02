import {
	ErrorMessage,
	SuccessMessageBuilder,
	EmbedFileMessageBuilder,
} from "../../../classes.js";
import {isValidURL} from "../../../functions.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import temp from "../../../schemas/temp.js";
import mongoose from "mongoose";
import {EmbedBuilder} from "discord.js";

export default {
	data: {
		name: "embedFileAdd",
	},
	async execute(interaction, client) {
		await interaction.deferReply({ephemeral: true});
		const count = parseInt(
			interaction.message.embeds[0].data.footer.text.match(/\d+/)[0],
		);
		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});

		if (!interaction.fields.getTextInputValue("link")) {
			const waiting = new temp({
				_id: mongoose.Types.ObjectId(),
				type: "waitingForUpload",
				match: {
					user: interaction.user.id,
					channel: interaction.channel.id,
				},
				data: {
					count: count,
					message: interaction.message.id,
				},
				lifeSpan: 30,
				date: Date.now(),
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
				ephemeral: true,
			});
		} else {
			const input = interaction.fields.getTextInputValue("link").split(/, ?/gi);

			for (const i of input) {
				if (!isValidURL(i)) {
					input.splice(input.indexOf(i), 1);
				}
			}
			if (input.length) {
				if (input.length + embedProfile.files.length > 10) {
					interaction.editReply(
						new ErrorMessage(
							`Uploading the files provided will exceed the maximum file limit by \`${
								input.length + embedProfile.files.length - 10
							}\` file.`,
						),
					);
				} else {
					let msg;
					let error;
					try {
						msg = await interaction.channel.send({
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
							embedProfile.files.push({
								name: attachment.name,
								link: attachment.attachment,
								type: attachment.contentType,
								size: attachment.size,
							});
						}
						await EmbedSchema.updateOne(
							{author: interaction.user.id, customID: count},
							{files: embedProfile.files},
						);
						interaction.message.edit(
							new EmbedFileMessageBuilder(embedProfile, null, client),
						);

						interaction.editReply(
							new SuccessMessageBuilder(
								`Successfully added ${
									[...msg.attachments.values()].length === 1
										? `\`${[...msg.attachments.values()][0].name}\``
										: `\`${[...msg.attachments.values()].length}\` files`
								}!`,
							),
						);

						msg.edit({
							content: "✅ Successfully added the files!",
							attachments: msg.attachments,
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
