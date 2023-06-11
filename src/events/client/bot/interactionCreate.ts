import {
	AnyContextMenuCommand,
	AutoCompleteCommand,
	Command,
	Event,
} from "types";
import {AutocompleteInteraction, InteractionType} from "discord.js";
import {Emojis, handleError} from "../../../utility.js";
import chalk from "chalk";

const {yellow, bold} = chalk;

// Very basic interactionCreate file, will be worked on later.
// TODO: Make the code better & more concise (don't repeat yourself).
export const interactionCreate: Event<"interactionCreate"> = {
	async execute(client, interaction) {
		const time = Date.now();

		if (process.env.debug) {
			console.log(
				yellow(
					`${bold("[Debug]")} Received interaction type ${bold(
						InteractionType[interaction.type],
					)} ${bold(
						`(${
							// This is needed or else TypeScript will complain.
							interaction.type === 2 || interaction.isAutocomplete()
								? interaction.commandName
								: interaction.customId
						})`,
					)} in guild ${bold(interaction.guild?.name)} from user ${bold(
						interaction.user.username,
					)} (ID: ${interaction.user.id}) ()`,
				).replace(/\s{2,}/g, " "),
			);
		}

		if (
			!process.env.maintenance ||
			// interaction.user.id === process.env.discordBotOwnerID ||
			(process.env.discordBotTesters ?? "")
				.split(",")
				.map((id) => id.trim())
				.includes(interaction.user.id)
		) {
			if (interaction.isChatInputCommand()) {
				const {commands} = client;
				const command = commands.get(interaction.commandName);

				if (!command) {
					return interaction.reply("❌ Command not found.");
				}

				try {
					await (command as Command).execute(interaction, client);
				} catch (error) {
					return handleError(interaction, client, error);
				}
			} else if (interaction.isButton()) {
				const {buttons} = client;

				const button = buttons.get(interaction.customId);

				if (!button) {
					return interaction.reply("❌ Button not found.");
				}

				try {
					await button.execute(interaction, client);
				} catch (error) {
					return handleError(interaction, client, error);
				}
			} else if (interaction.isStringSelectMenu()) {
				const {selectMenus} = client;

				const selectMenu = selectMenus.get(interaction.customId);

				if (!selectMenu) {
					return interaction.reply("❌ Select menu not found.");
				}

				try {
					await selectMenu.execute(interaction, client);
				} catch (error) {
					return handleError(interaction, client, error);
				}
			} else if (interaction.type === InteractionType.ModalSubmit) {
				const {modals} = client;

				const modal = modals.get(interaction.customId);

				if (!modal) {
					return interaction.reply("❌ Modal not found.");
				}

				try {
					await modal.execute(interaction, client);
				} catch (error) {
					return handleError(interaction, client, error);
				}
			} else if (interaction.isContextMenuCommand()) {
				const {commands} = client;

				const command = commands.get(interaction.commandName);

				if (!command) {
					return console.error(
						`❌ Command not found: ${interaction.commandName}`,
					);
				}

				try {
					await (command as AnyContextMenuCommand).execute(interaction, client);
				} catch (error) {
					return handleError(interaction, client, error);
				}
			} else if (
				interaction.type === InteractionType.ApplicationCommandAutocomplete
			) {
				const {commands} = client;

				const command = commands.get(interaction.commandName);

				if (!command) {
					return console.error(
						`❌ Command not found: ${interaction.commandName}`,
					);
				}

				try {
					await (command as AutoCompleteCommand).autocomplete(
						interaction,
						client,
					);
				} catch (error) {
					return handleError(interaction, client, error);
				}
			}
		} else {
			const maintenanceReply = {
				embeds: [
					{
						title: `<:_:${Emojis.Error}> Maintenance Mode!`,
						description: `Sorry, <@${
							client.user?.id
						}> is currently in maintenance mode!\n\n<@${
							client.user?.id
						}> has been in maintenance since <t:${Math.round(
							client.onlineTimestamp / 1000,
						)}:R>.`,
						color: 0xff0000,
					},
				],
			};

			if (!(interaction instanceof AutocompleteInteraction)) {
				try {
					await interaction.reply(maintenanceReply);
				} catch (error) {
					await interaction.editReply(maintenanceReply).catch(console.error);
				}
			}
		}

		const timeTaken = Date.now() - time;

		if (process.env.debug) {
			console.log(
				yellow(
					`${bold("[Debug]")} Took ${bold(
						`${timeTaken} milliseconds (${new Intl.NumberFormat().format(
							timeTaken / 1000,
						)} seconds)`,
					)} to execute interaction ${bold(
						// This is needed or else TypeScript will complain.
						interaction.type === 2 || interaction.isAutocomplete()
							? interaction.commandName
							: interaction.customId,
					)}.\n`,
				),
			);
		}
	},
};
