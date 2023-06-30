import {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
	ClientUser,
	Collection,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	StringSelectMenuInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";
import mongoose, {Document} from "mongoose";

/**
 * A type for the bot client. Extends the default Discord JS client class with the necessary methods used by the code.
 */
export type BotClient = Client & {
	user: ClientUser;
	commands: Collection<string, AnyCommand>;
	commandArray: (
		| SlashCommandBuilder
		| ContextMenuCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
	)[];
	buttons: Collection<string, Button>;
	selectMenus: Collection<string, SelectMenu>;
	modals: Collection<string, Modal>;
	handleEvents(): Promise<void>;
	handleCommands(): Promise<void>;
	handleComponents(): Promise<void>;
	handleFonts(): Promise<void>;
	checkTemporaryData(): Promise<void>;
	checkUploads(): Promise<void>;
	updateStatisticsChannels(channelID?: string): Promise<void>;
	onlineTimestamp: number;
};

/**
 * A type for  handling Discord commands.
 */
export type Command = {
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	description?: string;
	usage?: string[];
	examples?: string[];
	execute(
		interaction: ChatInputCommandInteraction,
		client: BotClient,
	): Promise<unknown>;
};

/**
 * Type for autocomplete commands. This basically extends base command type & adds an autocompletion function.
 */
export type AutoCompleteCommand = {
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	description?: string;
	usage?: string[];
	examples?: string[];
	autocomplete(
		interaction: AutocompleteInteraction,
		client: BotClient,
	): Promise<unknown>;
	execute(
		interaction: ChatInputCommandInteraction,
		client: BotClient,
	): Promise<unknown>;
};

export type MessageContextMenuCommand = {
	data: ContextMenuCommandBuilder;
	description: string;
	usage?: string[];
	execute(
		interaction: MessageContextMenuCommandInteraction,
		client: BotClient,
	): Promise<unknown>;
};

export type UserContextMenuCommand = {
	data: ContextMenuCommandBuilder;
	description: string;
	usage?: string[];
	execute(
		interaction: UserContextMenuCommandInteraction,
		client: BotClient,
	): Promise<unknown>;
};

/**
 * This type has to be declared fully or else TypeScript will complain.
 */
export type AnyContextMenuCommand = {
	data: ContextMenuCommandBuilder;
	description: string;
	usage?: string[];
	execute(
		interaction:
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction,
		client: BotClient,
	): Promise<unknown>;
};

export type AnyCommand = Command | AutoCompleteCommand | AnyContextMenuCommand;

export type Button = {
	execute(interaction: ButtonInteraction, client: BotClient): Promise<void>;
};

export type Modal = {
	execute(
		interaction: ModalSubmitInteraction,
		client: BotClient,
	): Promise<void>;
};

export type SelectMenu = {
	execute(
		interaction: StringSelectMenuInteraction,
		client: BotClient,
	): Promise<void>;
};

/**
 * A type for Discord client events.
 * => Provides autocompletion for the events, which is very useful.
 * @template {keyof ClientEvents} E - Event - The name of the event.
 */
export type ClientEvent<E extends keyof ClientEvents> = {
	once?: boolean;
	execute(client: BotClient, ...args: ClientEvents[E]): Promise<unknown>;
};

export type ProcessEvent = {
	once?: boolean;
	execute(...args: unknown[]): void;
};

export type MongooseEvent = {
	once?: boolean;
	execute(...args: unknown[]): void;
};

/**
 * A utility type for more easily asserting mongoose document types.
 */
export type MongooseDocument<I> = Document<unknown, NonNullable<unknown>, I> &
	Omit<
		I &
			Required<{
				_id: mongoose.Types.ObjectId;
			}>,
		never
	>;
