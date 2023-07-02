import {ErrorMessage, SuccessMessageBuilder} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedSend",
	},
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});
		const count =
			interaction.message.embeds[0].data.description.match(/\d+/)[0];

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});

		const channelInput = interaction.fields.getTextInputValue("channel");

		const channelReg = new RegExp(`^.*${channelInput}.*$`, "i");

		let channels = await interaction.member.guild.channels.fetch();

		channels = [...channels.values()];

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
					new SuccessMessageBuilder(
						`Embed successfully sent in channel ${sendChannel}`,
					),
				);
			}
		}
	},
};
