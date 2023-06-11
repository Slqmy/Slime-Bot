import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {Command} from "types";

export const purge: Command = {
	data: new SlashCommandBuilder()
		.setName("purge")
		.setDescription("💬 Purge (mass delete) messages.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption((option) =>
			option
				.setName("count")
				.setDescription("💬 The number of messages to delete.")
				.setRequired(true)
				.setMinValue(1),
		)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("👤 The user to purge messages from."),
		)
		.addStringOption((option) =>
			option
				.setName("match")
				.setDescription(
					"📜 Delete messages that contain the specified input text.",
				),
		)
		.addStringOption((option) =>
			option
				.setName("no-match")
				.setDescription(
					"📜 Delete messages that do not contain the specified input text",
				),
		)
		.addStringOption((option) =>
			option
				.setName("regex")
				.setDescription(
					"💬 Only delete messages that match a certain regular expression pattern.",
				),
		)
		.addBooleanOption((option) =>
			option
				.setName("embeds")
				.setDescription(
					"📝 Only delete messages that contain embeds. Specify false to not delete messages with embeds.",
				),
		)
		.addStringOption((option) =>
			option
				.setName("starts-with")
				.setDescription("💬 Delete messages that begin with the input text."),
		)
		.addStringOption((option) =>
			option
				.setName("not-starts-with")
				.setDescription(
					"💬 Only delete messages that do not begin with the input text.",
				),
		)
		.addStringOption((option) =>
			option
				.setName("ends-with")
				.setDescription("💬 Delete message that end with the input text."),
		)
		.addStringOption((option) =>
			option
				.setName("not-ends-with")
				.setDescription(
					"💬 Only delete messages that do not end with the input text.",
				),
		)
		.addBooleanOption((option) =>
			option
				.setName("files-attachments")
				.setDescription(
					"🎨 Only delete messages that contain files. Specify false to not delete messages with files.",
				),
		)
		.addBooleanOption((option) =>
			option
				.setName("bot")
				.setDescription(
					"🤖 Only delete messages sent by bots. Specify false to not delete messages sent by bots.",
				),
		)
		.addBooleanOption((option) =>
			option
				.setName("guild-invites")
				.setDescription(
					"🔗 Only delete messages containing invites. Specify false to not delete messages containing invites.",
				),
		)
		.addBooleanOption((option) =>
			option
				.setName("links")
				.setDescription(
					"🔗 Only delete messages containing links. Specify false to not delete messages containing links",
				),
		)
		.addBooleanOption((option) =>
			option
				.setName("mention-pings")
				.setDescription(
					"🔔 Only delete messages containing pings. Specify false to not delete messages containing pings.",
				),
		)
		.addStringOption((option) =>
			option
				.setName("after")
				.setDescription(
					"📄 Only delete messages sent after a specified message ID/link.",
				),
		)
		.addStringOption((option) =>
			option
				.setName("before")
				.setDescription(
					"📄 Only delete messages sent before a specified message ID/link.",
				),
		)
		.addBooleanOption((option) =>
			option
				.setName("inverse")
				.setDescription(
					"🙃 Inverse the previous choices. ! Can lead to unexpected behaviour.",
				),
		),
	usage: ["purge messages:number of messages to delete"],
	examples: ["purge messages:50"],
	async execute(interaction) {
		const {channel, options} = interaction;

		const messageNumber = options.getInteger("messages", true);

		const messages = await channel?.messages.fetch({limit: messageNumber});
	},
};
