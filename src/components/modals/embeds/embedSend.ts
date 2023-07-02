import {ErrorMessage, SuccessMessage} from "../../../utility.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";
import {Modal} from "types";
import {GuildMember, Message} from "discord.js";

export const embedSend: Modal = {
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});

		const count = (
			/\d+/.exec(
				(interaction.message as Message).embeds[0].data.description as string,
			) as RegExpExecArray
		)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			id: count,
		});

		if (!embedProfile) {
			return interaction.reply(new ErrorMessage("Couldn't find embed!"));
		}

		const channelInput = interaction.fields.getTextInputValue("channel");

		const channelReg = new RegExp(`^.*${channelInput}.*$`, "i");

		let channels = [
			...(
				await (interaction.member as GuildMember).guild.channels.fetch()
			).values(),
		];

		let sendChannel = interaction.channel;

		if (!isNaN(parseInt(channelInput))) {
			sendChannel = await interaction.guild.channels.fetch(`${channelInput}`);
		} else if (channelInput) {
			for (const index of channels) {
				if (index.type !== 4) {
					const foundChannel = index.name.match(channelReg);
					if (foundChannel) {
						sendChannel = index;
						break;
					}
				}
			}
		}

		if (!sendChannel) {
			await interaction.editReply(
				new ErrorMessage("Please provide a valid channel name or ID!"),
			);
		} else {
			const memberPerms = sendChannel
				.permissionsFor(
					interaction.guild.members.cache.get(interaction.user.id),
				)
				.toArray();

			const botPerms = sendChannel
				.permissionsFor(interaction.guild.members.me)
				.toArray();

			if (!memberPerms?.includes("ViewChannel")) {
				await interaction.editReply(
					new ErrorMessage("You do not have access to this channel!"),
				);
			} else if (!memberPerms?.includes("SendMessages")) {
				await interaction.editReply(
					new ErrorMessage(
						"You do not have the `Send Messages` permission in this channel!",
					),
				);
			} else if (!memberPerms?.includes("EmbedLinks")) {
				await interaction.editReply(
					new ErrorMessage(
						"You do not have the `Embed Links` permission in this channel!",
					),
				);
			} else if (!botPerms?.includes("ViewChannel")) {
				await interaction.editReply(
					new ErrorMessage(
						`<@${process.env.clientID}> does not have access to this channel!`,
					),
				);
			} else if (!botPerms?.includes("SendMessages")) {
				await interaction.editReply(
					new ErrorMessage(
						`<@${process.env.clientID}> does not have the \`Send Messages\` permission in this channel!`,
					),
				);
			} else if (!botPerms?.includes("EmbedLinks")) {
				await interaction.editReply(
					new ErrorMessage(
						`<@${process.env.clientID}> does not have the \`Embed Links\` permission in this channel!`,
					),
				);
			} else if (
				!embedProfile.content &&
				!embedProfile.embeds.length &&
				!embedProfile.files.length &&
				!embedProfile.components.length
			) {
				interaction.editReply(
					new ErrorMessage("Can not send an empty message!"),
				);
			} else {
				await sendChannel.send({
					content: embedProfile.content,
					embeds: embedProfile.embeds,
					files: embedProfile.files.map((e) => e.link),
					components: embedProfile.components,
				});

				await interaction.editReply(
					new SuccessMessage(
						`Embed successfully sent in channel <#${sendChannel.id}>`,
					),
				);
			}
		}
	},
};
