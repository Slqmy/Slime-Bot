import {
	ErrorMessage,
	GuildInviteRegExp,
	RegExpCharactersRegExp,
	SuccessMessage,
	URLRegExp,
	addSuffix,
} from "../../utility.js";
import {
	Message,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js";
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
				.setMinValue(1)
				.setMaxValue(100),
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
				.setName("contain-embeds")
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
				.setName("contain-file-attachments")
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
				.setName("contain-guild-invites")
				.setDescription(
					"🔗 Only delete messages containing invites. Specify false to not delete messages containing invites.",
				),
		)
		.addBooleanOption((option) =>
			option
				.setName("contain-links")
				.setDescription(
					"🔗 Only delete messages containing links. Specify false to not delete messages containing links",
				),
		)
		.addBooleanOption((option) =>
			option
				.setName("contain-mention-pings")
				.setDescription(
					"🔔 Only delete messages containing pings. Specify false to not delete messages containing pings.",
				),
		)
		.addStringOption((option) =>
			option
				.setName("before-message")
				.setDescription(
					"📄 Only delete messages sent before a specified message ID/link.",
				),
		)
		.addStringOption((option) =>
			option
				.setName("before-date")
				.setDescription("📅 Only delete message sent after a specified date."),
		)
		.addStringOption((option) =>
			option
				.setName("after-message")
				.setDescription(
					"📄 Only delete messages sent after a specified message ID/link.",
				),
		)
		.addStringOption((option) =>
			option
				.setName("after-date")
				.setDescription("📅 Only delete messages sent after a specified date"),
		)
		.addBooleanOption((option) =>
			option
				.setName("inverse")
				.setDescription(
					"🙃 Inverse the previous choices. ❗ Can lead to unexpected behaviour.",
				),
		),
	usage: ["messages:number of messages to delete"],
	examples: ["messages:50"],
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});

		const {channel, options} = interaction;

		if (!(channel instanceof TextChannel)) {
			return interaction.editReply(
				new ErrorMessage("You can only use this command in a `Text Channel`!"),
			);
		}

		let regex: string | null | RegExp = options.getString("regex");

		if (regex) {
			try {
				regex = new RegExp(regex);
			} catch (error) {
				return interaction.editReply(
					new ErrorMessage(`Invalid regular expression pattern:\n${error}`),
				);
			}
		}

		let beforeDate: string | null | number = options.getString("before-date");

		if (beforeDate) {
			try {
				beforeDate = Date.parse(beforeDate);
			} catch (error) {
				return interaction.editReply(
					new ErrorMessage(`Invalid \`before-date\` input:\n${error}`),
				);
			}
		}

		let afterDate: string | null | number = options.getString("after-date");

		if (afterDate) {
			try {
				afterDate = Date.parse(afterDate);
			} catch (error) {
				return interaction.editReply(
					new ErrorMessage(`Invalid \`after-date\` input:\n${error}`),
				);
			}
		}

		let beforeMessage: string | null | Message | undefined =
			options.getString("before-message");

		if (beforeMessage) {
			const beforeMessageID = /\d+$/.exec(beforeMessage)?.[0];

			if (!beforeMessageID) {
				return interaction.editReply(
					new ErrorMessage(
						"Invalid message ID or link entered for `before-message`.",
					),
				);
			}

			beforeMessage = await channel?.messages.fetch(beforeMessageID);

			if (!beforeMessage) {
				return interaction.editReply(
					new ErrorMessage("`before-message` message not found."),
				);
			}
		}

		let afterMessage: string | null | Message | undefined =
			options.getString("after-message");

		if (afterMessage) {
			const afterMessageID = /\d+$/.exec(afterMessage)?.[0];

			if (!afterMessageID) {
				return interaction.editReply(
					new ErrorMessage(
						`Invalid message ID or link entered for \`after-message\`.`,
					),
				);
			}

			afterMessage = await channel?.messages.fetch(afterMessageID);

			if (!afterMessage) {
				return interaction.editReply(
					new ErrorMessage(`\`after-message\` message not found.`),
				);
			}
		}

		let messageNumber = options.getInteger("count", true);

		const user = options.getUser("user");
		const match = options.getString("match");
		const noMatch = options.getString("no-match");

		const containEmbeds = options.getBoolean("contain-embeds");

		const startsWith = options.getString("starts-with");
		const notStartsWith = options.getString("not-starts-with");

		const endsWith = options.getString("ends-with");
		const notEndsWith = options.getString("not-ends-with");

		const containFileAttachments = options.getBoolean(
			"contain-file-attachments",
		);

		const bot = options.getBoolean("bot");

		const containGuildInvites = options.getBoolean("contain-guild-invites");
		const containLinks = options.getBoolean("contain-links");
		const containMentionPings = options.getBoolean("contain-mention-pings");

		const inverse = options.getBoolean("inverse");

		const matchRegExp = match
			? new RegExp(match?.replace(RegExpCharactersRegExp, "\\$&"))
			: null;

		const noMatchRegExp = noMatch
			? new RegExp(noMatch?.replace(RegExpCharactersRegExp, "\\$&"))
			: null;

		let messages: Message[] = [];
		let earliestMessageID: string | undefined;

		while (messages.length < messageNumber) {
			const fetchedMessages = [
				...((
					await channel?.messages.fetch(
						earliestMessageID
							? {
									limit: 100,
									before: earliestMessageID,
							  }
							: {
									limit: 100,
							  },
					)
				)?.values() ?? []),
			].filter((message) => {
				const {author, content, embeds, attachments, createdTimestamp} =
					message;

				const meetsConditions =
					(!user || user.id === author.id) &&
					(!matchRegExp || matchRegExp.test(content)) &&
					(!noMatchRegExp || !noMatchRegExp.test(content)) &&
					(!regex || (regex as RegExp).test(content)) &&
					(containEmbeds === null ||
						(!containEmbeds && !embeds.length) ||
						(containEmbeds && embeds.length)) &&
					(!startsWith || content.startsWith(startsWith)) &&
					(!endsWith || content.endsWith(endsWith)) &&
					(!notStartsWith || !content.startsWith(notStartsWith)) &&
					(!notEndsWith || !content.endsWith(notEndsWith)) &&
					(containFileAttachments === null ||
						(!containFileAttachments && !attachments.size) ||
						(containFileAttachments && attachments.size)) &&
					(bot === null ||
						(bot === false && !author.bot) ||
						(bot === true && author.bot)) &&
					(containGuildInvites === null ||
						(containGuildInvites === false &&
							!GuildInviteRegExp.test(content)) ||
						(containGuildInvites === true &&
							GuildInviteRegExp.test(content))) &&
					(containLinks === null ||
						(!containLinks && !URLRegExp.test(content)) ||
						(containLinks && URLRegExp.test(content))) &&
					(containMentionPings === null ||
						(!containMentionPings && !/<@&?\d{18,}>/.test(content)) ||
						(containMentionPings && /<@&?\d{18,}>/.test(content))) &&
					(!beforeDate || createdTimestamp < (beforeDate as number)) &&
					(!afterDate || createdTimestamp > (afterDate as number)) &&
					(!beforeMessage ||
						createdTimestamp < (beforeMessage as Message).createdTimestamp) &&
					(!afterMessage ||
						createdTimestamp > (afterMessage as Message).createdTimestamp);

				return inverse ? !meetsConditions : meetsConditions;
			});

			messages.push(...fetchedMessages);

			if (!fetchedMessages.length) messageNumber = 0;

			if (fetchedMessages.length) {
				earliestMessageID = fetchedMessages[fetchedMessages.length - 1].id;
			}
		}

		messages = messages.slice(0, messageNumber);

		await channel.bulkDelete(messages);

		return interaction.editReply(
			messages.length
				? new SuccessMessage(
						`Successfully deleted \`${messages.length}\` message${addSuffix(
							messages.length,
						)}!`,
				  )
				: new ErrorMessage(
						`Couldn't find any messages that matched the specified requirements within a reasonable number of messages.`,
				  ),
		);
	},
};
