import EmbedSchema, {IEmbedSchema} from "../../schemas/EmbedSchema.js";
import {
	SlashCommandBuilder,
	ActionRowBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	TextChannel,
} from "discord.js";
import mongoose from "mongoose";
import {
	addNumberSuffix,
	checkPermissions,
	cut,
	EmbedMessageBuilder,
	ErrorMessage,
	SuccessMessage,
	TextChannelTypes,
} from "../../utility.js";
import {AutoCompleteCommand, MongooseDocument} from "../../types";

export const command: AutoCompleteCommand = {
	data: new SlashCommandBuilder()
		.setName("embed")
		.setDescription(
			"💬 Create, edit and send custom messages containing embeds, attachments, buttons and select menus.",
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("create")
				.setDescription("💬 Create a new embed.")
				.addStringOption((option) =>
					option
						.setName("name")
						.setDescription(
							"💬 The name of the embed, this can be changed later.",
						),
				),
		)
		.addSubcommandGroup((group) =>
			group
				.setName("delete")
				.setDescription("❌ Delete one or all of your embeds")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("all")
						.setDescription(
							"❌ Delete all your embeds. This action can not be undone.",
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("one")
						.setDescription("❌ Delete one embed.")
						.addStringOption((option) =>
							option
								.setName("embed")
								.setDescription(
									"💬 Which embed would you like to delete? (Input embed name or ID)",
								)
								.setAutocomplete(true)
								.setRequired(true),
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("edit")
				.setDescription("View and edit an existing embed.")
				.addStringOption((option) =>
					option
						.setName("embed")
						.setDescription(
							"Which embed would you like to edit? (Input embed name or ID)",
						)
						.setAutocomplete(true)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("send")
				.setDescription("Send one of your embeds in a chosen channel.")
				.addStringOption((option) =>
					option
						.setName("embed")
						.setDescription(
							"Which embed would you like to send? (Input embed name or ID)",
						)
						.setRequired(true)
						.setAutocomplete(true),
				)
				.addChannelOption((option) =>
					option
						.setName("channel")
						.setDescription("Which channel should the embed be sent in?")
						.addChannelTypes(...TextChannelTypes),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("save")
				.setDescription("Save an embed from a message to your embed profile.")
				.addStringOption((option) =>
					option
						.setName("message")
						.setDescription(
							"Which message would you like to save? (Input message ID or link)",
						)
						.setRequired(true),
				)
				.addChannelOption((option) =>
					option
						.setName("channel")
						.setDescription(
							"What channel is the message in? (Input channel ID or link)",
						)
						.addChannelTypes(...TextChannelTypes),
				),
		),
	usage: [
		"**/embed create** `name: embed name`",
		"**/embed delete one** `embed: embed name`",
		"**/embed delete all**",
		"**/embed edit** `embed: embed name`",
		"**/embed save** `message: message id or link` `channel: channel`",
	],
	examples: [
		"**/embed create** `name: my embed 1`",
		"**/embed edit** `embed: 1`",
		"**/embed delete one** `embed: 1 - my embed 1`",
	],
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused(true).value;

		const embedArray =
			(await EmbedSchema.find({author: interaction.user.id})) ?? [];

		const map = embedArray.map((embed) => `${embed.id} - ${embed.name}`);

		const filtered = map
			.filter((embed) => new RegExp(focusedValue, "ig").test(`${embed}`))
			.sort(
				(a, b) =>
					parseInt(/^\d+/.exec(a)?.[0] ?? "0") -
					parseInt(/^\d+/.exec(b)?.[0] ?? "0"),
			);

		await interaction.respond(
			filtered.map((embed) => ({name: embed, value: embed})).slice(0, 25),
		);
	},
	async execute(interaction, client) {
		const input = interaction.options.getString("embed");

		let embedArray = await EmbedSchema.find({
			author: interaction.user.id,
		});

		let embed =
			(await EmbedSchema.findOne({
				author: interaction.user.id,
				id: /\d+/.exec(input as string)?.[0],
			})) ??
			(() => {
				let embedIndex;
				for (let i = 0; i < embedArray.length; i++) {
					const indexedEmbed = embedArray[i];

					if (new RegExp(input as string, "gi").test(indexedEmbed.name)) {
						embedIndex = i;
					}
				}

				if (embedIndex) return embedArray[embedIndex];
				return null;
			})();

		const channel =
			interaction.options.getChannel("channel") ?? interaction.channel;

		if (!(channel instanceof TextChannel)) {
			return interaction.reply(
				new ErrorMessage(
					"You must be in a valid `text channel` to use this command!",
				),
			);
		}

		if (
			!embed &&
			!(
				interaction.options.getSubcommand() === "create" ||
				interaction.options.getSubcommand() === "all" ||
				interaction.options.getSubcommand() === "save"
			)
		) {
			return interaction.reply(new ErrorMessage("That embed does not exist!"));
		}

		const typedEmbed = embed as MongooseDocument<IEmbedSchema>;

		switch (interaction.options.getSubcommand()) {
			case "one": {
				await EmbedSchema.deleteOne({
					author: interaction.user.id,
					id: typedEmbed.id,
				});

				for (
					let index = typedEmbed.id + 1;
					index <= embedArray.length;
					index++
				) {
					await EmbedSchema.findOneAndUpdate(
						{
							author: interaction.user.id,
							id: index,
						},
						{id: index - 1},
					);
				}

				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("🗑 Embed Successfully deleted")
							.setColor("Red"),
					],
					ephemeral: true,
				});
				break;
			}
			case "create": {
				embed = new EmbedSchema({
					_id: new mongoose.Types.ObjectId(),
					name:
						interaction.options.getString("name") ??
						`${interaction.user.username}'s Embed`,
					author: interaction.user.id,
					id: embedArray.length + 1,
					content: "",
					embeds: [],
					files: [],
					components: [],
				});

				await embed.save();

				embedArray = await EmbedSchema.find({author: interaction.user.id});

				await interaction.reply(
					await new EmbedMessageBuilder().create(
						interaction,
						client,
						`${embedArray.length}`,
						`Successfully created your \`${embedArray.length}${addNumberSuffix(
							embedArray.length,
						)}\` embed builder! Select what you would like to do with it below.`,
					),
				);
				break;
			}
			case "edit": {
				await interaction.reply(
					await new EmbedMessageBuilder().create(
						interaction,
						client,
						embed?.id ?? "1",
						`Currently editing your \`${embed?.id}${addNumberSuffix(
							embed?.id,
						)}\` embed builder! Select what you would like to do \n> with it below`,
					),
				);
				break;
			}
			case "all": {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("🗑️ Confirm Deletion")
							.setColor("Red")
							.setDescription(
								"> Are you sure you would like to delete all your embed builders? You can not\n> undo this action.",
							),
					],
					ephemeral: true,
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setLabel("Nevermind ❌")
								.setStyle(ButtonStyle.Danger)
								.setCustomId("embedDeletionNevermind"),
							new ButtonBuilder()
								.setStyle(ButtonStyle.Success)
								.setLabel("Confirm Deletion ✅")
								.setCustomId("embedDeletionConfirm"),
						),
					],
				});
				break;
			}
			case "send": {
				await interaction.deferReply({ephemeral: true});

				const permissions = await checkPermissions(
					[interaction.user, client.user],
					interaction.user,
					["ViewChannel", "SendMessages", "EmbedLinks"],
					channel,
				);

				if (!permissions.value) {
					return interaction.editReply(
						new ErrorMessage(permissions.message as string),
					);
				}

				if (
					!typedEmbed.content &&
					!typedEmbed.embeds?.length &&
					!typedEmbed.files?.length &&
					!typedEmbed.components?.length
				) {
					return interaction.editReply(
						new ErrorMessage("Can not send an empty message!", true),
					);
				}

				await channel.send({
					content: typedEmbed.content,
					embeds: typedEmbed.embeds,
					files: typedEmbed.files?.map((file) => file.link),
					components: typedEmbed.components,
				});

				await interaction.editReply(
					new SuccessMessage(
						`Embed successfully sent in channel <#${channel.id}>`,
					),
				);

				break;
			}
			case "save": {
				const id = interaction.options.getString("message", true);

				const message = await (
					((await client.channels.fetch(
						/\d+(?=\/\d+$)/.exec(id)?.[0] ?? "",
					)) as TextChannel) ?? interaction.channel
				)?.messages?.fetch((/\d+/.exec(id) as RegExpExecArray)[0]);

				if (!message) {
					return interaction.reply(
						new ErrorMessage(
							"This message does not exist! Please input a valid message ID or link.",
							true,
						),
					);
				}

				const data = message.embeds?.[0]?.data;

				embed = new EmbedSchema({
					_id: new mongoose.Types.ObjectId(),
					name:
						data?.title ??
						cut(data?.description ?? "", 100) ??
						data?.author?.name ??
						data?.footer?.text ??
						message.content ??
						(message.attachments.size
							? "Attachment"
							: `${interaction.user.username}'s Embed Builder`),
					author: interaction.user.id,
					id: embedArray.length + 1,
					content: message.content,
					embeds: message.embeds.map((embedData) => embedData.data),
					files: [...message.attachments.values()].map((e) => ({
						name: e.name,
						link: e.url,
						type: e.contentType,
						size: e.size,
					})),
					components: message.components.map((component) => {
						// @ts-ignore
						component.type = component.data.type;
						// @ts-ignore
						delete component.data;

						// @ts-ignore
						component.components = component.components.map(
							(comp) => comp.data,
						);

						// @ts-ignore
						component.data.label = "Unnamed Component";

						return component;
					}),
				});

				await embed.save();

				embedArray = await EmbedSchema.find({author: interaction.user.id});

				await interaction.reply(
					await new EmbedMessageBuilder().create(
						interaction,
						client,
						embed.id,
						`The message has been saved to your embed profile with the custom ID of \`${embedArray.length}\`.`,
					),
				);

				break;
			}
		}
	},
};
