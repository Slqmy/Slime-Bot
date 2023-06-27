import {
	ALLOWED_EXTENSIONS,
	APIEmbed,
	APIEmbedField,
	APIEmbedFooter,
	APIEmbedImage,
	APISelectMenuOption,
	ActionRowBuilder,
	AttachmentBuilder,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	ChatInputCommandInteraction,
	ColorResolvable,
	Colors,
	Guild,
	GuildChannel,
	GuildMember,
	ImageURLOptions,
	Interaction,
	InteractionType,
	Message,
	MessageReaction,
	PartialMessageReaction,
	PermissionsBitField,
	StringSelectMenuBuilder,
	TextChannel,
	User,
	resolveColor,
} from "discord.js";
import {BotClient, MongooseDocument} from "types";
import GuildDataSchema, {IGuildDataSchema} from "./schemas/GuildDataSchema.js";
import {createCanvas, loadImage} from "canvas";
import {evaluate, isComplex, isResultSet} from "mathjs";
import Decimal from "decimal.js";
import canvacord from "canvacord";
import chalk from "chalk";
import {readdirSync} from "fs";

const {whiteBright, bold} = chalk;

/**
 * ! Export Sorting Guide
 *
 * By default, exports are sorted by:
 * * 1. Functions -> Classes -> Enums -> Objects -> Regular Expressions -> Arrays.
 * * 2. The order they were created in, with oldest being first.
 * However, if two exports are related, E.g., the {@link isValidURL} function & the {@link URLRegExp} regular expression, they should be put together, with the export that has *higher priority* in the normal order being first, **unless** the *higher priority* export is in some way a more advanced form of the *lower priority* export, **or** if the *lower priority* export is used by the *higher priority* export.
 * They should be located in the section that the higher order export would normally be located in.
 * For example, the {@link isValidURL} function and the {@link URLRegExp} regular expression are related because they both involve URLs in strings, so they should be sorted together.
 * {@link isValidURL} is a function and has higher priority than {@link URLRegExp}. It would normally go first, but {@link isValidURL} is basically a more advanced form of {@link URLRegExp}, so it goes second.
 * Because {@link isValidURL} has a higher priority, both exports are located in the *functions* section.
 */

// ! Functions

/**
 * A function to loop over a folder containing categories, which themselves contain files. The file exports `exports` (if there are any), the file name `fileName` and the file path `filePath` are passed as parameters to a `callback function`.
 *
 * *Information about the files is logged to the console.*
 * @param {string} path The path to the folder containing the categories. (from the `src` (or `dist`) directory)
 * @param {(exports: unknown, fileName: string, filePath: string) => void | Promise<void>} callback The `callback function` to be called on each file. The function is called with **3** arguments: the file exports `exports` (if there are any), the file name `fileName` and the file path `filePath`.
 * @returns {Promise<void>}
 * @see {@link ./bot.ts bot.ts} For a use case of this function. (See below `⬇` for a summary of the use case)
 * @example
 * // ./src/bot.ts.
 * // Registering the client functions.
 * import {loopFolders} from "./functions.js";
 *
 * // ...
 *
 * // Register the client functions. The loopFolder function loops over the client functions in the ./src/functions directory, and calls all the functions.
 * // The functions define method properties for the client variable, taking advantage of the fact that the client variable is passed by reference, not by value, meaning that any new properties will be available everywhere where the client variable is used.
 * await loopFolders("functions", (callback) => (callback as (client: BotClient) => void)(client));
 *
 * // ...
 * @see {@link ./functions/handlers/handleFonts.ts handleFonts.ts} or below `⬇` for another, more thorough use case of this function.
 * @example
 * // ./src/functions/handlers/handleFonts.ts
 * // Registering canvas fonts.
 *
 * import {BotClient} from "types";
 * import {loopFolders} from "../../utility.js";
 * import {registerFont} from "canvas";
 *
 * export default (client: BotClient) => {
 * client.handleFonts = async () =>
 * 	// The two trailing periods and slash at the start of the file path are necessary, as by default the loopFolders function starts in the src directory, so the function needs to go one layer out.
 * 	// Exports is actually of type "never", as files for fonts (those ending with ".otf", ".ttf", and possibly other font file extensions) obviously don't have any exports. Exports isn't used here anyway, so the parameter should be ignored.
 * 	loopFolders("../fonts", (_exports, fontName, fontFilePath) =>
 * 		// The fontFilePath variable is sliced to get rid of the trailing periods and slash of "../fonts".
 * 		// This is necessary as the file path is treated as if it starts from the root of the project folder.
 * 		// The name of the font file is used as the font family.
 * 		registerFont(fontFilePath.slice(3), {family: fontName}),
 * 	);
 * };
 */
export const loopFolders = async (
	path: string,
	callback: (
		exports: unknown,
		fileName: string,
		filePath: string,
	) => void | Promise<void>,
): Promise<void> => {
	const categories = readdirSync(`./dist/${path}/`);
	// The path starts at src (dist) because most use cases of this function will start there anyway.

	for (const category of categories) {
		const categoryFiles = readdirSync(`./dist/${path}/${category}`).filter(
			(file) => !file.endsWith(".js.map"),
		);

		for (const file of categoryFiles) {
			let fileExports;

			try {
				fileExports = await import(`../dist/${path}/${category}/${file}`);
			} catch (error) {
				// Sometimes files with non-standard file extensions are imported (E.g., fonts). This will create an error, which can safely be ignored.
				(!(error instanceof Error) ||
					!error.message.startsWith("Unknown file extension ")) &&
					console.error(error);
			}

			// If there is only one export, as is in the case of files such as command, button, modal and select menu exports, then only that export is passed into the function.
			// If it weren't for this check, then an object with only one property would be passed, making the code a bit more cluttered.
			// Implementing this is easier than using "export default" everywhere as that can get a bit cluttered when using type declarations.

			const exportKeys = Object.keys(fileExports ?? {});

			await callback(
				exportKeys.length === 1 ? fileExports[exportKeys[0]] : fileExports,
				(/[\s\S]+(?=\.[^.]+$)/i.exec(file) as RegExpMatchArray)[0],
				`./dist/${path}/${category}/${file}`,
			);
		}
	}
};

const urlRegExpString =
	`(https?:\\/\\/)` + // Validate protocol.
	`((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|` + // Validate domain name.
	`((\\d{1,3}\\.){3}\\d{1,3}))` + // Validate OR IP (v4) address.
	`(:\\d+)?(\\/[-a-z\\d%_.~+]*)*` + // Validate port and path.
	`(\\?[;&a-z\\d%_.~+=-]*)?` + // Match a possible query string.
	`(#[-a-z\\d_]*)?`; // Match a possible fragment locator.

/**
 * A regular expression that matches all `URL`s in a string. (global `g` and ignore case `i` flags as `URL`s are *case insensitive*)
 * @see {@link isValidURL} for a function to test whether a string is *exactly* a valid `URL`.
 * @see {@link isImageLink} for a function to test whether a `URL` leads to an image.
 * @example
 * // Matching all URLs in a string.
 * import {URLRegExp} from "../../../utility.js";
 *
 * const string = "http://foo.co.uk/ Some example text in between https://marketplace.visualstudio.com/items?itemName=chrmarti.regex Some more random text - https://github.com/chrmarti/vscode-regex";
 *
 * const urls = string.match(URLRegExp);
 * console.log(urls);
 * // => ["http://foo.co.uk/", "https://marketplace.visualstudio.com/items?itemName=chrmarti.regex", "https://github.com/chrmarti/vscode-regex"].
 * @see {@link ./events/client/message/messageReactionAdd.ts messageReactionAdd.ts} for a use case of this regular expression. (See below `⬇` for a summary of the use case)
 * @example
 * // Matching all URLs in a string.
 * // ./src/events/client/message/messageReactionAdd.ts.
 * import {URLRegExp, isImageLink} from "../../../utility.js";
 *
 * // ...
 *
 * const {author, content, url, createdTimestamp, attachments, embeds} = message;
 *
 * // ...
 *
 * // isImageLink is shorthand syntax for (link) => isImageLink(link).
 * const messageImageURLs = (content?.match(URLRegExp) ?? []).filter(isImageLink);
 *
 * // ...
 */
export const URLRegExp = RegExp(urlRegExpString, "gi");

/**
 * A function to check if a string is *exactly* a valid `URL` or not.
 * @see {@link URLRegExp} for a regular expression to match *all* `URL`s in a string.
 * @see {@link isImageLink} for a function to test whether a `URL` leads to an image.
 * @param {string} urlString The string to check whether it is a valid URL or not.
 * @returns {boolean} Whether the string is a valid `URL`.
 * @example
 * // Checking whether strings are valid URLs.
 * isValidURL("styles.css");
 * // => false.
 *
 * isValidURL("https://www.youtube.com");
 * // => true.
 * @see {@link PollMessage} (right at the end of the {@link PollMessage.create create} method, where `this.files` is populated with attachment `URL`s, if they have been specified when running the `/poll` command or if they exist on the poll message) for a use case of this function. (See below `⬇` for a summary of the use case)
 * @example
 * // Filtering attachment data by valid URLs.
 * // Used in the PollMessage class.
 *
 * // ...
 *
 *	this.files =
 *		data instanceof ChatInputCommandInteraction
 *			? (data.options.getString("attachments") ?? "")
 *					.split(",")
 *					// "isValidURL" is short for (url) => isValidURL(url).
 *					.filter(isValidURL)
 *			: [...data.message.attachments.values()].map(
 *					(attachmentData) => attachmentData.url,
 *			  );
 *
 * // ...
 */
export const isValidURL = (urlString: string): boolean =>
	RegExp(`^(?:${urlRegExpString})$`, "i").test(urlString);

const GuildInviteRegExpString =
	`(?:https?:\\/\\/)?` + // Validate protocol.
	`(?:www\\.)?(?:(?:dis(?:(?:cord(?:(?:\\.(?:(?:(?:(?:media|com|gg)\\/invite)|gg)\\/[a-z]{7,}` + // Match all invites on the official Discord website (support for all of Discord's domains).
	`|(?:(?:io|li|me)\\/(?!servers)([a-z\\d-+=_/[\\]{}\\\\|:"<>?!@#$%^&*()~\`]{3,}))))` + // Match server links on `discord.io` (same as `discord.li`) and `discord.me`. Both are websites for advertising Discord servers.
	`|app\\.(?:com|net)\\/invite\\/[a-z]{7,}))` + // Match invites on `discordapp.com`.
	`|board\\.org\\/server\\/[-a-z\\d%_.~+/]{2,}))` + // Match server links from `disboard.org`. (Another server advertisement website)
	`|top\\.gg\\/servers\\/(?:[-a-z\\d%_.~+]{2,}))` + // Match server links from `top.gg`. (A bot and server website)
	`\\/?` + // Match a possible slash at the end of the URL which makes no difference, (but is still part of the URL).
	`(?:\\?[;&a-z\\d%_.~+=-]*)?` + // Validate a possible query string.
	`(?:#[-a-z\\d_]*)?`; // Validate a possible fragment locator.

export const GuildInviteRegExp = RegExp(GuildInviteRegExpString, "gi");

export const isValidGuildInviteURL = (urlString: string): boolean =>
	RegExp(`^(?:${GuildInviteRegExpString})$`, "i").test(urlString);

/**
 * A function to check whether a link leads to an image file based off of its *file extension*.
 * @see {@link URLRegExp} for a regular expression to match all valid `URL`s in a string.
 * @see {@link isValidURL} for a function to check whether a string is a valid `URL` or not.
 * @param {string} urlString The link to check whether it is an image or not.
 * @returns {boolean} Whether the link stores an image file or not.
 * @example
 * // Checking whether URLs lead to an image file:
 * import {isImageLink} from "../../../utility.js";
 *
 * isImageLink("https://www.youtube.com");
 * // => false.
 *
 * isImageLink("https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/dd/Slime_JE3_BE2.png/revision/latest?cb=20191230025505");
 * // => true.
 * @see {@link ./events/client/message/messageReactionAdd.ts messageReactionAdd.ts} for an example use case of this function. (See below `⬇` for a summary of the use case)
 * @example
 * // Filtering out non-image links.
 * // ./src/events/client/message/messageReactionAdd.ts.
 * import {isImageLink} from "../../../utility.js";
 *
 * // ...
 *
 * const {author, content, url, createdTimestamp, attachments, embeds} = message;
 *
 * // ...
 *
 * // Shorthand syntax for:
 * // const messageImageURLs = (content?.match(URLRegExp) ?? []).filter((link) => isImageLink(link))
 * const messageImageURLs = (content?.match(URLRegExp) ?? []).filter(isImageLink);
 *
 * // ...
 */
export const isImageLink = (urlString: string): boolean =>
	ALLOWED_EXTENSIONS.some((extension) =>
		RegExp(`\\.${extension}(?:$|\\/+)`, "i").test(urlString),
	);

/**
 * A function that inverts an object's keys and values. Used in the `⭐ Starboard` system.
 * @see {@link logObject} for a function that can nicely log objects to the console.
 * @param {{[key: string]: string}} object The object to invert the values of.
 * @returns {{[key: string]: string}} A **_new_** object with the inverted keys and values.
 * @example
 * // Inverting a user object.
 * import {invertObject} from "../../../utility.js";
 *
 * let rolyPolyVole = { firstName: "roly", secondName: "Poly", thirdName: "Vole" };
 *
 * invertObject(rolyPolyVole);
 * // => { roly: "firstName", Poly: "secondName", Vole: "thirdName" }.
 * @see {@link ./events/client/message/messageDelete.ts messageDelete.ts} for an example use case of this function. (See below `⬇` for a summary of the use case)
 * @example
 * // Inverting starboard message IDs object.
 * // ./src/events/client/message/messageDelete.ts.
 * import {invertObject} from "../../../utility.js";
 *
 * // ...
 *
 * // Normally - original message ID: starboard channel message ID.
 * // After inverting - starboard channel message ID: original message ID.
 * const invertedStarredMessageIDs = invertObject(starboardChannel.starredMessageIDs);
 *
 * // ...
 */
export const invertObject = (object: {
	[key: string | symbol]: string;
}): {[key: string]: string} => {
	const newObject: {[key: string]: string} = {};

	for (const key in object) {
		newObject[object[key]] = key;
	}

	return newObject;
};

/**
 * A function to log objects nicely to the console. Supports nested objects & indents accordingly.
 *
 * Logs the object keys as bold and white, and the object properties as white.
 * @see {@link invertObject} for a utility function that inverts object properties and values.
 * @param {{[key: string]: string}} object The object to log to the console.
 * @param {number} indent The level of indentation to start with. (Used for recursion)
 * @returns {void}
 * @example
 * // Logging a user object to the console.
 * import {logObject} from "../../../utility.js";
 *
 * const userData = {
 *		name: "rolyPolyVole",
 *		firstName: "roly",
 *		secondName: "Poly",
 *		thirdName: "Vole",
 *		stats: {
 *			coding: 10,
 *			troll: 42,
 *			intelligence: "99.999...",
 *			school: 10,
 *			discord: -50,
 *			opinion: -1000,
 *		}
 * };
 *
 * logObject(userData);
 *
 * // Object logged nicely using chalk.
 * // Object keys are bold and white.
 * // Object values are white.
 * // =>
 * // name: rolyPolyVole
 * // firstName: roly
 * // secondName: Poly
 * // thirdName: Vole
 * // stats
 * //  coding: 10
 * //  troll: 42
 * //  intelligence: 99.999...
 * //  school: 10
 * //  discord: -50
 * //  opinion: -1000
 * @see {@link handleError} for an example use case of this function. (See below `⬇` for a summary of the use case)
 * @example
 * // Used in handleError.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * // Logs interaction details object to the console.
 * logObject({
 * 	// Interaction details object to log.
 * })
 *
 * // ...
 */
export const logObject = (
	object: {[key: string]: unknown},
	indent = 0,
): void => {
	for (const key in object) {
		if (typeof object[key] === "object") {
			// Log the key with a space times the current indent.
			console.log(`${" ".repeat(indent)}${bold(key)}`);
			// Use recursion with an increased indent level to log the object that the key is associated with.
			logObject(object[key] as {[key: string]: unknown}, indent + 1);
		} else if (object[key]) {
			// Log the key: value pair normally.
			console.log(
				`${" ".repeat(indent)}${bold(key)}:`,
				whiteBright(`${object[key]}`),
			);
		}
	}

	// When the function has finished logging everything, a gap is created between the interaction information message and the next message.
	if (!indent) console.log();
};

/**
 * A function to attempt to handle errors as best as possible.
 *
 * *If the user is just a normal user, the function will reply with a simple error prompting the user to report the error.*
 *
 * *If the user ID is one of the IDs included in* `process.env.discordBotTesters` *or if the user ID is the same as the one specified in* `process.env.discordBotOwnerID`*,* *then a more detailed error message is sent with interaction details to try and help with debugging the error.*
 *
 * Sends an embed with some of the error details and a prompt for the user to report the error. Used in `interactionCreate.ts`.
 * @param {Interaction} interaction The interaction that caused the error.
 * @param {BotClient} client The bot client.
 * @param {unknown} error The error that occurred.
 * @returns {Promise<void>} Replies to the interaction with an error message. (A simple message, if the user is an average user, a more detailed one if the user is included in `process.env.discordBotTesters` or if the user ID is the same as the one specified in `process.env.discordBotOwnerID`).
 * @see {@link ./events/client/bot/interactionCreate.ts interactionCreate.ts} for an example use case of this function. (See below `⬇` for a summary of the use case)
 * @example
 * // Handing errors in interactionCreate.
 * import {Command} from "types";
 * import {handleError} from "../../../utility.js";
 *
 * // ...
 *
 * try {
 *	 await (command as Command).execute(interaction, client);
 * } catch (error) {
 *	 handleError(interaction, client, error);
 * }
 *
 * // ...
 */
export const handleError = async (
	interaction: Interaction,
	client: BotClient,
	error: unknown,
): Promise<void> => {
	// Create a gap between the last message and the error message.
	console.log();
	console.error(error);

	const {discordBotOwnerID, discordGuildID, discordSupportChannelID} =
		process.env;

	const discordBotOwner = discordBotOwnerID
		? await client.users.fetch(discordBotOwnerID)
		: null;

	const discordGuild = discordGuildID
		? await client.guilds.fetch(discordGuildID)
		: null;

	// Get the optimal guild invite.
	const discordGuildInvite = discordGuildID
		? [...((await discordGuild?.invites?.fetch())?.values() ?? [])].sort(
				(a, b) =>
					!a.temporary
						? 1
						: (a.maxAge as number) > (b.maxAge as number)
						? 1
						: a.maxAge === b.maxAge
						? (a.maxUses ?? Infinity) - (b.maxUses ?? Infinity)
						: 0,
		  )[0].code
		: null;

	const {user, channel, guild, channelId, guildId} = interaction;

	// Sends a message depending on whether the user is a bot tester and whether they are in the support server.
	const errorReply = new ErrorMessage(
		`\`${
			client.user.username
		}\` has encountered an error while executing the interaction${
			isBotTester(user.id)
				? `:\n\n\`\`\`css\n${error}\`\`\`\n> Interaction Custom ID / Name: \`${
						// This is needed or else TypeScript will complain.
						interaction.type === 2 || interaction.isAutocomplete()
							? interaction.commandName
							: interaction.customId
				  }\``
				: "."
		}\n\n${
			discordGuildID && discordBotOwnerID && user.id !== discordBotOwnerID
				? `Please report this error to ${
						guildId === discordGuildID
							? `<@${discordBotOwnerID}>`
							: `\`@${(discordBotOwner as User).tag}\``
				  }${
						guildId === discordGuildID
							? `${
									discordSupportChannelID
										? ` in <#${discordSupportChannelID}>`
										: ""
							  }`
							: ` on [the support server](https://www.discord.gg/${discordGuildInvite})`
				  }!`
				: ""
		}`,
		false,
		false,
	);

	if (process.env.debug) {
		// Create a gap between the error message and the interaction information message.
		console.log();
		logObject({
			"📜 Interaction Information": {
				"⏰ Time": {
					Date: new Date(interaction.createdTimestamp).toISOString(),
					TimeStamp: interaction.createdTimestamp,
				},
				"🏠 Guild": {Name: guild?.name, ID: guildId},
				"📄 Channel": {
					Name: channel instanceof TextChannel ? channel.name : null,
					ID: channelId,
				},
				"👤 User": {Tag: user.tag, ID: user.id},
				"💬 Message":
					interaction.type === InteractionType.ApplicationCommand ||
					interaction.type === InteractionType.ApplicationCommandAutocomplete
						? null
						: {
								"ID": interaction.message?.id,
								"Content": interaction.message?.content,
								"Embed Title": interaction.message?.embeds?.[0]?.data?.title,
								"Date": new Date(
									interaction?.message?.createdTimestamp ?? 0,
								).toISOString(),
								"Timestamp": interaction?.message?.createdTimestamp,
						  },
			},
		});
	}

	if (!(interaction instanceof AutocompleteInteraction)) {
		try {
			await interaction.reply(errorReply).catch(console.error);
		} catch (_error) {
			try {
				await interaction.followUp(errorReply).catch(console.error);
			} catch (_error) {
				try {
					await interaction.editReply(errorReply).catch(console.error);
				} catch (_error) {
					await interaction.user.send(errorReply).catch(console.error);
				}
			}
		}
	} else if (channel) {
		await channel.send(errorReply);
	} else {
		await interaction.user.send(errorReply).catch(console.error);
	}
};

/**
 * The standard, untouched console log function. Used in the refactored {@link console.log} function.
 * @see {@link console.log the refactored console.log function} for an example use case of this function. (See below `⬇` for a summary of the use case)
 *
 * Prints to `stdout` with newline. Multiple arguments can be passed, with the
 * first used as the primary message and all additional used as substitution
 * values similar to [`printf(3)`](http://man7.org/linux/man-pages/man3/printf.3.html) (the arguments are all passed to `util.format()`).
 *
 * ```js
 * const count = 5;
 * console.log('count: %d', count);
 * // Prints: count: 5, to stdout
 * console.log('count:', count);
 * // Prints: count: 5, to stdout
 * ```
 *
 * See `util.format()` for more information.
 * @since v0.1.100
 * @example
 * // Used in the refactored console.log function.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * standardLog(...data);
 *
 * // ...
 */
const standardLog = console.log.bind(console);

/**
 * List of all logged messages on the console. Used in {@link console.log the refactored console.log function} function.
 * @see {@link console.log the refactored console.log function} for an example use case of this array. (See below `⬇` for a summary of the use case)
 * @example
 * // Used in the refactored console.log function.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * const previousLogs = consoleLogs[consoleLogs.length - 1];
 * const previousLog = previousLogs?.[previousLogs.length - 1];
 *
 * // ...
 */
const consoleLogs: unknown[][] = [];

/**
 * Refactored version of {@link console.log} that ensures that there are never more than two new lines between logged strings.
 * *(in reality, the function reduces the number of new lines between two logged strings by 1 (if needed), which, in most cases, results in two new lines remaining, which is the intended behavior)*
 * This creates a *very clean* and *professional* looking console with *consistent newlines*.
 * *Otherwise, there would be inconsistent new lines.*
 * E.g.,
 *
 * [Database Status] Connecting...
 *
 * [Debug] [WS => Shard 0] Shard received all its guilds. Marking as fully ready.
 *
 * [Client] Ready! Online and logged in as 🌳 Slime Bot [/].
 *
 *
 * [Database Status] Connected.
 *
 * Between the client and database status messages, there are **3** new lines, which is *inconsistent* with the overall console style.
 * This refactoring of the function fixes that issue:
 *
 * [Database Status] Connecting...
 *
 * [Debug] [WS => Shard 0] Shard received all its guilds. Marking as fully ready.
 *
 * [Client] Ready! Online and logged in as 🌳 Slime Bot [/].
 *
 * [Database Status] Connected.
 *
 * @see {@link standardLog} for the standard {@link console.log} function.
 * @see {@link consoleLogs} for an array of all logged messages.
 */
console.log = (...data) => {
	const date = new Date(Date.now());

	const previousLogs = consoleLogs[consoleLogs.length - 1];
	const previousLog = previousLogs?.[previousLogs.length - 1];

	const latestLog = data[data.length - 1];

	if (
		typeof latestLog === "string" &&
		typeof previousLog === "string" &&
		// Remove possible control characters added by chalk.
		latestLog.replace(ANSIControlCharactersRegExp, "").startsWith("\n") &&
		previousLog.replace(ANSIControlCharactersRegExp, "").endsWith("\n")
	) {
		data[data.length - 1] = latestLog.replace(/\n/, "");
	}

	data = data.map((value) =>
		typeof value === "string" && value.trim()
			? value.replace(
					new RegExp(`^(${ANSIControlCharactersRegExpString}|\\s)*`),
					`$1${bold(
						`[${date.getHours().toString().padStart(2, "0")}:${date
							.getMinutes()
							.toString()
							.padStart(2, "0")}:${date
							.getSeconds()
							.toString()
							.padStart(2, "0")}]:`,
					)} `,
			  )
			: value,
	);

	standardLog(...data);

	consoleLogs.push(data);
};

/**
 * Resolves a duration from a given string.
 * @see {@link isColorResolvable} for a function to check whether a value is {@link ColorResolvable}.
 * @see {@link resolveColour} for a function to resolve colours.
 * @param {string} string The string to resolve the duration of.
 * @returns {number} The resolved duration.
 * @example
 * // Resolving specific durations.
 *
 * resolveDuration("In 5 days"); // Returns Date.now() + 5 * 24 * 60 * 60 * 1000.
 * resolveDuration("Now"); // Returns Date.now().
 * resolveDuration("5 min"); // Returns 5 * 60 * 1000.
 *
 * @see {@link ./commands/utility/poll.ts poll.ts} for an example use case of this function. (See below `⬇` for a summary of the use case)
 * @example
 * // Resolving user duration input.
 * // Used in the /poll command. (./src/commands/utility/poll.ts)
 * import {resolveDuration} from "../../utility.js";
 *
 * // ...
 *
 * if (duration) {
 * 		try {
 * 			duration = evaluate(
 * 				// Note: I can't use the normal regex here, because it will interpret it as the end of the JSDoc comment.
 * 				`${resolveDuration(duration.replace(/( *in *)|( *ago *)/g, ""))}`,
 * 			);
 *			} catch (error) {
 *				return interaction.reply(
 *					new ErrorMessage(
 *						`**Invalid duration provided:** ${duration}\n\n>>> ${error}`,
 * 					),
 * 				);
 * 			}
 * 		}
 *
 * // ...
 */
export const resolveDuration = (string: string): number | null => {
	if (/now/gi.test(string)) return Date.now();

	const durations: {[key: string]: number} = {
		second: 1000,
		sec: 1000,
		s: 1000,
		minute: 60000,
		min: 60000,
		m: 60000,
		hour: 3600000,
		h: 3600000,
		day: 86400000,
		d: 86400000,
		week: 604800000,
		w: 604800000,
		month: 2592000000,
		mo: 2592000000,
	};

	string = string
		.replace(/([\d.]+)/g, "+ $1 *")
		.replace(/\s+/g, "")
		.trim();

	for (const time in durations) {
		string = string.replace(RegExp(`${time}s?`, "ig"), `${durations[time]}`);
	}

	try {
		if (string.startsWith("in")) {
			return Date.now() + evaluate(string.slice(2).trim());
		}

		if (string.endsWith("ago")) {
			return Date.now() - evaluate(string.slice(0, -3).trim());
		}

		return evaluate(string);
	} catch (_error) {
		return null;
	}
};

/**
 * Checks whether an array of users have a list of permissions.
 * @param {User[]} users The users to check permissions of.
 * @param {User | null} defaultUser The user who is considered the default user. Will display "*You* do not have the permission." if the specified user does not have a permission. Pass in `null` if there is no *"default user"*.
 * @param {(keyof typeof PermissionsBitField.Flags)[] | []} permissions The permissions to check. Pass in `[]` to use the default permission check (`ViewChannel` & `SendMessages`).
 * @param {GuildChannel | null} channel The channel to check the permissions in, if applicable. *Pass in `null` if you're checking the permissions in the guild.*
 * @param {Guild?} guild The guild to check the permissions in. If you specify this parameter, **don't** specify the `channel` parameter (pass in `null`), as the function prioritises checking the channel permissions.
 * @returns {Promise<{value: boolean;permission?: keyof typeof PermissionsBitField.Flags;user?: GuildMember | User;message?: string;}>} Object with information about the permissions.
 * @see {@link ./commands/utility/poll.ts poll.ts} for an example use case of this function. (See below `⬇` for a summary of the use case)
 * @example
 * // Used to check the permissions of the user performing the /poll command.
 * // ./src/commands/utility/poll.ts
 * import {checkPermissions} from "../../utility.js";
 *
 * // ...
 *
 * const permissions = await checkPermissions(
 *		[user],
 *		user,
 *		[
 *			"ViewChannel",
 *			"SendMessages",
 *			"EmbedLinks",
 *			"AddReactions",
 *			"UseApplicationCommands",
 *		],
 *		channel,
 * 	);
 *
 * if (!permissions.value) {
 * 	return interaction.reply(
 * 		new ErrorMessage(permissions.message as string),
 * 	);
 * }
 *
 * // ...
 */
export const checkPermissions = async (
	users: User[],
	defaultUser: User | null,
	permissions: (keyof typeof PermissionsBitField.Flags)[] | [],
	channel: GuildChannel | null,
	guild?: Guild,
): Promise<{
	value: boolean;
	permission?: keyof typeof PermissionsBitField.Flags;
	user?: GuildMember | User;
	message?: string;
}> => {
	permissions = permissions.length
		? permissions
		: ["ViewChannel", "SendMessages"];

	for (const permission of permissions) {
		if (permission) {
			for (const user of users) {
				if (guild) {
					const guildMember = await guild.members.fetch(user.id);

					if (
						!guildMember.permissions.has(PermissionsBitField.Flags[permission])
					) {
						return {
							permission,
							user: guildMember,
							value: false,
							message: `${
								user.id === defaultUser?.id ? "You do " : `<#${user.id}> does `
							}not have the \`${permission}\` permission!`,
						};
					}
					continue;
				}

				if (channel) {
					const userChannelPermissions = channel.permissionsFor(user);

					if (
						!userChannelPermissions?.has(PermissionsBitField.Flags[permission])
					) {
						return {
							permission,
							user,
							value: false,
							message: `${
								user.id === defaultUser?.id ? "You do " : `<@${user.id}> does `
							}not have the \`${permission}\` permission in the <#${
								channel.id
							}> channel!`,
						};
					}
				}
			}
		}
	}

	return {value: true};
};

/**
 * Returns the appropriate suffix to a word that is either plural or singular. Only supports words which the plural ending is "s".
 * @param {number} number The string to convert.
 * @returns {"s"|""} The appropriate ending to the provided string.
 * @see {@link ./commands/admin/purge.ts purge.ts} for an example use case of this function. (See below `⬇` for a summary of the use case)
 * @example
 * // Displaying the correct suffix for the number of messages deleted.
 * // Used in the /purge command.
 * // ./src/commands/admin/purge.ts
 * import {addSuffix} from "../../utility.js";
 *
 * // ...
 *
 * return interaction.editReply(
 *  new SuccessMessage(
 *	  `Successfully deleted \`${messages.length}\` message${addSuffix(
 *	   messages.length,
 *	  )}!`,
 *	 ),
 * );
 *
 * //...
 */
export const addSuffix = (number: number): "s" | "" =>
	Math.abs(number) === 1 ? "" : "s";

export const capitaliseFirstLetter = (string: string) =>
	`${string[0]?.toUpperCase() ?? ""}${string.slice(1)}`;

export const lowerCaseTitleCaseWords = [
	"the",
	"a",
	"an",
	"ago",
	"at",
	"by",
	"for",
	"in",
	"on",
	"far",
	"of",
	"off",
	"out",
	"to",
	"up",
	"via",
	"as",
	"but",
	"per",
	"pro",
	"re",
	"mid",
	"ere",
	"pre",
	"sub",
	"now",
	"if",
	"so",
	"ex",
	"or",
	"pan",
	"and",
	"nor",
	"yet",
];

export const toTitleCase = (string: string) => {
	const splitString = string
		.split(PunctuationLookaheadRegExp)
		.map((subString) =>
			subString
				.split(CamelCaseSubStringSeparatorLookaheadRegExp)
				.map((subSubString) => subSubString.split(/\s/g)),
		)
		.flat(2);

	return capitaliseFirstLetter(
		splitString
			.map((word, index) => {
				const space =
					index === 0 ||
					index === splitString.length - 1 ||
					new RegExp(`^${punctuationRegExpString}$`).test(word)
						? ""
						: " ";

				if (
					word === word.toUpperCase() ||
					(word.endsWith("s") &&
						word.slice(0, word.length - 1) ===
							word.slice(0, word.length - 1).toUpperCase()) ||
					lowerCaseTitleCaseWords.includes(word) ||
					word.length < 3
				) {
					return `${space}${word}`;
				}

				return `${space}${capitaliseFirstLetter(word.toLowerCase())}`;
			})
			.join("")
			.replace(/[-_]+/g, ""),
	);
};

export const toKebabCase = (string: string) =>
	toTitleCase(string).replaceAll(" ", "-").toLowerCase();

/**
 * The maximum numerical value for colours. (`#ffffff` in `hexadecimal`)
 *
 * Equal to `16,777,215` in `decimal` representation.
 * @see {@link isColorResolvable} for an example use case of this value. (See below `⬇` for a summary of the use case)
 * @example
 * // Checking whether a colour is valid. (Checking whether it is less than or equal to the maximum colour value)
 * // isColorResolvable function. (./src/utility.ts)
 */
export const MaximumColourValue = 0xffffff;

export const isColorResolvable = (value: unknown): value is ColorResolvable =>
	(typeof value === "string" &&
		(value in Colors || /^#[a-f\d]{6}$/.test(value))) ||
	value === "Random" ||
	(Array.isArray(value) &&
		value.length === 3 &&
		value.every(
			(colour) =>
				typeof colour === "number" &&
				0 <= colour &&
				colour <= MaximumColourValue,
		)) ||
	(typeof value === "number" && 0 <= value && value <= MaximumColourValue);

/**
 * A simple function that extends the Discord JS {@link resolveColor} function, now including colours from the `Colours` enum.
 * @param {ColorResolvable | keyof typeof Colours} colour The colour to resolve.
 * @returns {number} The resolved colour value.
 * @see {@link PollMessage.create} (where {@link  PollMessage.embeds this.embeds} is populated with an embed) for an example use case of this function. (see below `⬇` for a summary of the use case)
 */
export const resolveColour = (colour: unknown): number => {
	if (typeof colour === "string") {
		if (/random/i.test(colour)) {
			colour = "Random";
		} else if (toTitleCase(colour) in Colours) {
			colour = toTitleCase(colour);
		} else if (colour.startsWith("#")) {
			colour = `${colour[0]}${colour.slice(1).replace(/[^a-f\d]/g, "e")}`.slice(
				0,
				7,
			);
		}

		if ((colour as string) in Colours) {
			return Colours[colour as keyof typeof Colours];
		}
	}

	if (Array.isArray(colour)) {
		const defaultColourHex = Colours.Default.toString(16);
		const red = parseInt(defaultColourHex.slice(0, 2), 16);
		const green = parseInt(defaultColourHex.slice(2, 4), 16);
		const blue = parseInt(defaultColourHex.slice(4), 16);

		colour[0] ??= red;
		colour[1] ??= green;
		colour[2] ??= blue;

		colour = colour.slice(0, 3);

		colour = (colour as [number, number, number]).forEach((colourValue) =>
			limitNumber(colourValue, MaximumColourValue, 0),
		);
	}

	if (typeof colour === "number") {
		colour = limitNumber(colour, MaximumColourValue, 0);
	}

	if (isColorResolvable(colour)) {
		return resolveColor(colour);
	}

	return Colours.Default;
};

export const sum = (numbers: (number | Decimal)[]): number =>
	numbers
		.reduce(
			(accumulator: Decimal, number) => accumulator.plus(number),
			new Decimal(0),
		)
		.toNumber();

/**
 * A function for the sigma notation used in math (Σ). Can be used as a summative operator.
 * @param {string} expression The expression to summarise. You can use the `variable` argument in the expression string just like you would in normal math.
 * @param {Decimal.Value} startValue The start value of the sum. The function will sum the expressions starting from this value, *including the value itself*, up to the end value.
 * @param {Decimal.Value} endValue The end value of the sum. The function will stop summing the expressions after this value. This value is *included* in the sum.
 * @param {string?} variable The name of the variable used in the expression (if any). You can leave this parameter undefined if your sum does not have a variable.
 * @returns {Decimal} The summed expression.
 * @example
 * // Calculating how much XP is needed for a certain Discord level.
 * import {sigma} from "../../utility.js";
 *
 * // ...
 *
 * const xpNeeded = sigma(`100 + 50k`, "k", 0, desiredLevel - 1).dividedBy(xpMultiplier);
 *
 * // ...
 */
export const sigma = (
	expression: string,
	startValue: Decimal.Value,
	endValue: Decimal.Value,
	variable?: string,
): Decimal => {
	startValue = new Decimal(startValue);
	endValue = new Decimal(endValue);

	let sumValue = new Decimal(0);

	for (let i = startValue; i <= endValue; i = i.plus(1)) {
		sumValue = sumValue.plus(
			evaluate(variable ? expression.replace(variable, `(${i})`) : expression),
		);
	}

	return sumValue;
};

export const pi = (
	expression: string,
	startValue: Decimal.Value,
	endValue: Decimal.Value,
	variable?: string,
): Decimal => {
	startValue = new Decimal(startValue);
	endValue = new Decimal(endValue);

	let product = new Decimal(0);

	for (let i = startValue; i <= endValue; i = i.plus(1)) {
		product = product.times(
			evaluate(variable ? expression.replace(variable, `(${i})`) : expression),
		);
	}

	return product;
};

export const limitNumber = (
	number: number | Decimal,
	maximumValue: number | Decimal | undefined = number,
	minimumValue: number | Decimal | undefined = number,
) =>
	Math.min(
		Math.max(
			new Decimal(number).toNumber(),
			new Decimal(minimumValue).toNumber(),
		),
		new Decimal(maximumValue).toNumber(),
	);

export const levelToExperience = (level: Decimal | number) =>
	new Decimal(level)
		.toPower(2)
		.times(25)
		.plus(new Decimal(level).times(75))
		.toNumber();

export const experienceToLevel = (experience: Decimal | number) =>
	new Decimal(experience)
		.plus(56.25)
		.sqrt()
		.dividedBy(5)
		.minus(1.5)
		.floor()
		.toNumber();

export const getExpressionValue = (expression: string) => {
	let evaluatedExpression;

	try {
		evaluatedExpression = evaluate(expression);
	} catch (error) {
		return error;
	}

	return isComplex(evaluatedExpression)
		? evaluatedExpression.re
		: isResultSet(evaluatedExpression)
		? evaluatedExpression.entries[evaluatedExpression.entries.length - 1]
		: evaluatedExpression;
};

export const objectMatch = (
	object: {
		[key: string | symbol]: unknown;
	},
	match: RegExp | string,
): boolean => {
	for (const key in object) {
		if (typeof object[key] === "object") {
			const matchString = objectMatch(
				object[key] as {[key: string | symbol]: unknown},
				match,
			);

			if (matchString) return true;
		} else if (
			typeof object[key] === "string" &&
			RegExp(match).exec(object[key] as string)
		) {
			return true;
		}
	}

	return false;
};

export const isBotTester = (userID: string) =>
	(process.env.discordBotTesters ?? "")
		.replace(/\s+/g, "")
		.split(",")
		.includes(userID) || userID === process.env.discordBotOwnerID;

// ! Classes

export class QueryMessage {
	embeds: [APIEmbed];
	ephemeral = false;
	simple = true;
	/**
	 * @param {string} message The message to display in the embed.
	 */
	constructor(message: string, ephemeral = false, simple = true) {
		this.embeds = [
			{
				title: simple ? "" : `${Emojis.QuestionMark} Error!`,
				description: `${simple ? `${Emojis.QuestionMark} ` : ""}${message}`,
				color: Colours.Query,
			},
		];

		this.ephemeral = ephemeral;
	}
}

export class LoadingMessage {
	embeds: [APIEmbed];
	ephemeral = false;
	simple = true;
	/**
	 * @param {string} message The message to display in the embed.
	 */
	constructor(message: string, ephemeral = false, simple = true) {
		this.embeds = [
			{
				title: simple ? "" : `${Emojis.Loading} Error!`,
				description: `${simple ? `${Emojis.Loading} ` : ""}${message}`,
				color: Colours.Loading,
			},
		];

		this.ephemeral = ephemeral;
	}
}

export class SuccessMessage {
	embeds: [APIEmbed];
	ephemeral = false;
	simple = true;
	/**
	 * @param {string} message The message to display in the embed.
	 */
	constructor(message: string, ephemeral = false, simple = true) {
		this.embeds = [
			{
				title: simple ? "" : `${Emojis.Success} Error!`,
				description: `${simple ? `${Emojis.Success} ` : ""}${message}`,
				color: Colours.Success,
			},
		];

		this.ephemeral = ephemeral;
	}
}

export class WarningMessage {
	embeds: [APIEmbed];
	ephemeral = false;
	simple = true;
	/**
	 * @param {string} message The message to display in the embed.
	 */
	constructor(message: string, ephemeral = false, simple = true) {
		this.embeds = [
			{
				title: simple ? "" : `${Emojis.Warning} Error!`,
				description: `${simple ? `${Emojis.Warning} ` : ""}${message}`,
				color: Colours.Warning,
			},
		];

		this.ephemeral = ephemeral;
	}
}

export class ErrorMessage {
	embeds: [APIEmbed];
	ephemeral = false;
	simple = true;
	/**
	 * @param {string} message The message to display in the embed.
	 */
	constructor(message: string, ephemeral = false, simple = true) {
		this.embeds = [
			{
				title: simple ? "" : `${Emojis.Error} Error!`,
				description: `${simple ? `${Emojis.Error} ` : ""}${message}`,
				color: Colours.Error,
			},
		];

		this.ephemeral = ephemeral;
	}
}

/**
 * A class to create a poll message based on a command, the poll message, or a reaction.
 */
export class PollMessage {
	emojis: (string | null)[];
	options: (string | null)[];
	content?: string;
	embeds: APIEmbed[];
	files: (string | AttachmentBuilder)[];
	constructor() {
		this.emojis = [];
		this.options = [];
		this.embeds = [];
		this.files = [];
	}
	async create(
		data:
			| ChatInputCommandInteraction
			| {message: Message}
			| MessageReaction
			| PartialMessageReaction,
		client: BotClient,
	) {
		const embed = !(data instanceof ChatInputCommandInteraction)
			? data.message.embeds[0].data
			: undefined;

		const role =
			data instanceof ChatInputCommandInteraction
				? data.options.getRole("required-role")
				: null;

		const timestamp =
			data instanceof ChatInputCommandInteraction
				? data.options.getString("duration")
				: null;

		const ping =
			data instanceof ChatInputCommandInteraction
				? data.options.getRole("ping")
				: null;

		const pollEnd = embed
			? embed.fields?.[1].value.match(/(?<=\*Poll ends:\* <t:)\d+(?=>)/)?.[0]
			: null;

		this.emojis = [];

		this.options = [];

		if (embed) {
			// Don't use RegExp.exec() here because it behaves a bit weird with regular expressions with the global `g` flag.
			const optionArray = (
				(embed.description as string).match(
					AfterEmojiRegExp,
				) as RegExpMatchArray
			).filter((option: string) => !option.startsWith("█"));

			for (const option of optionArray) {
				const emoji = (StartEmojiRegExp.exec(option) as RegExpMatchArray)[0];

				if (emojiArray.includes(emoji)) {
					const index = emojiArray.indexOf(emoji);
					this.emojis[index] = emoji;
					this.options[index] = EmojiLookbehindRegExp.exec(option)?.[0] ?? " ";
				} else {
					this.emojis.push(emoji);
					this.options.push(EmojiLookbehindRegExp.exec(option)?.[0] ?? " ");
				}
			}
		} else if (data instanceof ChatInputCommandInteraction) {
			for (let i = 1; i <= 10; i++) {
				const option = data.options.getString(`choice-${i}`);

				const emoji = StartEmojiRegExp.exec(option ?? "")?.[0];

				const afterEmojiMatch = EmojiLookbehindRegExp.exec(option ?? "")?.[0];

				if (
					emoji &&
					!this.emojis.includes(emoji) &&
					!emojiArray.includes(emoji)
				) {
					this.emojis.push(emoji);
					this.options.push(afterEmojiMatch ?? " ");
				} else {
					const optionEmojisOption: string | undefined =
						optionEmojis[(option ?? "").toLowerCase()];

					this.emojis.push(
						option
							? optionEmojisOption && !this.emojis.includes(optionEmojisOption)
								? optionEmojisOption
								: emojiArray[i - 1]
							: null,
					);
					this.options.push(option);
				}
			}

			this.emojis = this.emojis.filter((emoji) => emoji).length
				? this.emojis
				: ["👍", "👎"];
			this.options = this.options.filter((option) => option).length
				? this.options
				: ["Yes", "No"];
		}

		if (!(data instanceof ChatInputCommandInteraction)) {
			this.content = data.message?.content ?? (ping ? `<@&${ping.id}>` : "");
		}

		let description = "";

		const reactions = !(data instanceof ChatInputCommandInteraction)
			? [...data.message.reactions.cache.values()].filter((reaction) =>
					this.emojis.includes(reaction.emoji.name),
			  )
			: this.options.filter((option) => option).map(() => ({count: 1}));

		const totalReactions = reactions.reduce(
			(reactionsCount, reaction) => reactionsCount + reaction.count - 1,
			0,
		);

		const canvas = createCanvas(500, 500);
		const context = canvas.getContext("2d");

		context.save();

		let currentAngle = 0;
		let reactionIndex = 0;

		for (let i = 0; i < 10; i++) {
			if (this.options[i]) {
				const progressBar =
					(reactions
						? reactions.map((reaction) => reaction.count - 1)[reactionIndex] /
						  totalReactions
						: 0) * 10 || 0;

				description += `\n\n${this.emojis[i]} ${this.options[i]}\n\`${
					"█".repeat(Math.round(progressBar)) +
					" ".repeat(Math.round(10 - progressBar))
				}\` | ${(progressBar * 10).toFixed(2)}% (${
					reactions?.map((reaction) => reaction.count - 1)[reactionIndex] ?? "0"
				})`;

				if (reactions[reactionIndex].count - 1 || totalReactions === 0) {
					context.restore();

					const portionAngle =
						((reactions[reactionIndex].count - 1) / totalReactions ||
							1 / this.options.filter((option) => option).length) *
						2 *
						Math.PI;

					context.beginPath();

					context.arc(250, 250, 250, currentAngle, currentAngle + portionAngle); // Draws circle slice with radius of 250 around x: 250, y:250.

					currentAngle += portionAngle;

					context.lineTo(250, 250); // Draws a line to the center of the circle.

					context.fillStyle = rainbowColourArray[i];

					// Fills the circle with a rainbow colour from the rainbow colour array.
					// This creates a pie chart with rainbow colours in the correct order.
					context.fill();

					context.fillStyle = "#FFFFFF";

					context.translate(250, 250); // Center the canvas around the center of the pie chart.

					// If the option is the only option with any votes, then the option text will be displayed in the middle of the pie chart.
					if (
						totalReactions !== reactions[reactionIndex].count - 1 ||
						!totalReactions
					) {
						// Rotate the canvas so the x axis intersects the center radius of one of current sector of the pie chart.
						context.rotate(currentAngle - portionAngle * 0.5);

						// Move the canvas forward so it is now centred around the center point of the current sector of the pie chart.
						context.translate(250 / 2, 0);

						context.rotate(-(currentAngle - portionAngle * 0.5)); // Rotate the canvas so it is now the normal rotation.
					}

					const fontSize = Math.min(
						(reactions[reactionIndex].count / totalReactions) * 25,
						25,
					);

					context.font = `${fontSize}px "Noto Colour Emoji"`;

					const emojiLength = context.measureText(this.emojis[i] ?? "").width;

					context.font = `${fontSize}px "Odin Rounded Light"`;

					const text = `${this.options[i]?.trim() ? " " : ""}${this.options[
						i
					]?.trim()} - ${(progressBar * 10).toFixed(2)}%`;

					const textLength = context.measureText(text).width;

					const stringLength = emojiLength + textLength;

					context.translate(-(stringLength / 2), fontSize / 2); // Move the canvas back so the text is centred.

					context.font = `${fontSize}px "Noto Colour Emoji"`;

					context.fillText(this.emojis[i] ?? "", 0, 0); // Writes the emoji.

					context.translate(emojiLength, 0); // Move forward so the text is after the emoji

					context.font = `${fontSize}px "Odin Rounded Light"`;

					context.fillText(text, 0, 0); // Writes the text.

					context.translate(-emojiLength, 0); // Moves back the length of the emoji.

					// Start undoing the whole process (move the canvas forward so it is centred around the center point of the current sector of the pie chart.)
					context.translate(stringLength / 2, -fontSize / 2);

					if (
						totalReactions !== reactions[reactionIndex].count - 1 ||
						!totalReactions
					) {
						// Rotate it and prepare to go back to the center of the pie chart.
						context.rotate(currentAngle - portionAngle * 0.5);

						context.translate(-(250 / 2), 0); // Go back to the center of the pie chart.

						context.rotate(-(currentAngle - portionAngle * 0.5)); // Rotate it normally.
					}

					context.translate(-250, -250); // Center the canvas around 0, 0.
				}

				reactionIndex++;
			}
		}

		const pollTime =
			timestamp || pollEnd
				? pollEnd ??
				  // Timestamp is guaranteed to be truthy as this whole expression is guarded by the previous expression of timestamp || pollEnd, meaning that either timestamp is truthy or pollEnd is truthy. As we have used the nullish coalescing operator on pollEnd, meaning that if pollEnd were truthy, this expression wouldn't be called. However, if pollEnd isn't truthy, this expression would be called AND timestamp would have to be truthy as either timestamp is truthy or pollEnd is truthy.
				  Math.round(
						(Date.now() +
							// The return value of resolveDuration is a number as that is checked in the /poll command file.
							(resolveDuration(
								/^in.+/.test((timestamp as string).trim())
									? (
											/(?<=^in).+/.exec(timestamp as string) as RegExpMatchArray
									  )[0]
									: (timestamp as string),
							) as number)) /
							1000,
				  )
				: null;

		this.files = [
			...(data instanceof ChatInputCommandInteraction
				? (data.options.getString("attachments") ?? "")
						.split(",")
						// "isValidURL" is short for (url) => isValidURL(url).
						.filter(isValidURL)
				: [...data.message.attachments.values()].map(
						(attachmentData) => attachmentData.url,
				  )),
		];

		this.embeds = [
			{
				title:
					data instanceof ChatInputCommandInteraction
						? data.options.getString("message", true)
						: embed?.title,
				description:
					(data instanceof ChatInputCommandInteraction
						? data.options.getString("description") ?? ""
						: RegExp(
								`^[\\s\\S]+(?=${this.emojis.filter((emoji) => emoji)[0]})`,
								"gm",
						  ).exec(
								(embed as Readonly<APIEmbed>).description as string,
						  )?.[0] ?? "") + description,
				color:
					data instanceof ChatInputCommandInteraction
						? resolveColour(data.options.getString("colour") ?? Colors.Blurple)
						: (embed as Readonly<APIEmbed>).color,

				author: {
					name: `${client.user.username} Poll${
						pollEnd && parseInt(pollEnd) * 1000 <= Date.now() ? " - Ended" : ""
					}`,
					icon_url: client.user.displayAvatarURL(DisplayAvatarURLOptions),
				},
				footer: {
					text:
						data instanceof ChatInputCommandInteraction
							? `Poll by ${data.user.username}`
							: ((embed as Readonly<APIEmbed>).footer as APIEmbedFooter).text,
					icon_url:
						data instanceof ChatInputCommandInteraction
							? data.user.displayAvatarURL(DisplayAvatarURLOptions)
							: embed?.footer?.icon_url,
				},
				timestamp: embed?.timestamp ?? new Date(Date.now()).toISOString(),
				fields: [
					{
						name: "👤 Poll Creator",
						value:
							data instanceof ChatInputCommandInteraction
								? data.options.getBoolean("anonymous")
									? "Anonymous"
									: `<@${data.user.id}>`
								: ((embed as Readonly<APIEmbed>).fields as APIEmbedField[])[0]
										.value,
						inline: true,
					},
					{
						name: "⚙ Poll Settings",
						value:
							embed && !pollEnd
								? (embed.fields as APIEmbedField[])[1].value
								: `*Max options:* \`${
										data instanceof ChatInputCommandInteraction
											? data.options.getString("max-options") ?? "Unlimited"
											: (
													/(?<=\*Max options:\* `).+(?=`)/.exec(
														(
															(embed as Readonly<APIEmbed>)
																.fields as APIEmbedField[]
														)[1].value,
													) as RegExpMatchArray
											  )[0]
								  }\`\n*Required role:* ${
										role
											? `<@&${role.id}>`
											: embed
											? (
													/(?<=\*Required role:\* )(`None`|<@&\d+>)/.exec(
														(embed.fields as APIEmbedField[])[1].value,
													) as RegExpMatchArray
											  )[0]
											: "`None`"
								  }\n*Poll end${
										pollEnd && parseInt(pollEnd) * 1000 <= Date.now()
											? "ed"
											: "s"
								  }:* ${
										timestamp || pollEnd
											? `<t:${pollTime}> (<t:${pollTime}:R>)`
											: "`Never`"
								  }`,
						inline: true,
					},
				],
				image: {
					url: "",
				},
			},
		];

		const attachmentName = `slime-bot-poll-${Date.now()}.png`;
		const attachment = new AttachmentBuilder(canvas.toBuffer()).setName(
			attachmentName,
		);

		this.files.push(attachment);
		this.embeds[0].thumbnail = {url: `attachment://${attachmentName}`};

		return this;
	}
}

export class LevelLeaderboardMessage {
	files?: [AttachmentBuilder];
	embeds: [APIEmbed];
	components?: [
		ActionRowBuilder<ButtonBuilder>,
		ActionRowBuilder<StringSelectMenuBuilder>,
	];
	constructor() {
		this.embeds = [{}];
	}
	async create(
		interaction: ChatInputCommandInteraction | ButtonInteraction,
		pageFunction: (page: number) => number = (page) => page,
	) {
		const {guild} = interaction;

		if (!guild) {
			this.embeds = new ErrorMessage(
				"You must be in a guild to run this command!",
			).embeds;

			return this;
		}

		const guildData = (await GuildDataSchema.findOne({
			id: interaction.guildId,
		})) as MongooseDocument<IGuildDataSchema>;

		let guildMembers = [...guild.members.cache.values()];
		const {userExperienceData} = guildData;

		guildMembers = guildMembers
			.filter((member) => !member.user.bot)
			.sort(
				(a, b) =>
					(userExperienceData?.[b.id]?.experience ?? 0) -
					(userExperienceData?.[a.id]?.experience ?? 0),
			);

		const pageNumber =
			interaction instanceof ChatInputCommandInteraction
				? interaction.options.getNumber("page") ?? 1
				: pageFunction(
						parseInt(
							(
								/\d+/.exec(
									(interaction.message.embeds[0].data.footer as APIEmbedFooter)
										.text,
								) as RegExpExecArray
							)[0],
						),
				  );

		const pageLevels = guildMembers.slice(
			5 * (pageNumber - 1),
			5 * pageNumber + 1,
		);

		if (!pageLevels.length) {
			this.embeds = new ErrorMessage("This page does not exist!").embeds;
			return this;
		}

		const canvas = createCanvas(934, pageLevels.length * 282);
		const context = canvas.getContext("2d");

		let index = 0;

		// For loop with an index has to be used here because of async functions.
		for await (const guildMember of pageLevels) {
			const experience = userExperienceData?.[guildMember.id]?.experience ?? 0;

			const userAvatar = guildMember.displayAvatarURL(DisplayAvatarURLOptions);

			const userLevel = experienceToLevel(experience);

			const userLevelRequiredXP = levelToExperience(userLevel);
			const currentLevelProgress = experience - userLevelRequiredXP;
			const nextLevelRequiredXP = levelToExperience(userLevel + 1);

			const levelCard = await new canvacord.Rank()
				.setAvatar(userAvatar)
				.setLevel(userLevel, "Level ")
				.setCurrentXP(currentLevelProgress)
				.setRank(index + 1, "Rank #")
				.setRequiredXP(nextLevelRequiredXP - userLevelRequiredXP)
				.setStatus(guildMember.presence?.status ?? "online", true, 75)
				.setProgressBar(
					[ColourHexStrings.Lime, ColourHexStrings.OceanBlue],
					"GRADIENT",
				)
				.setUsername(guildMember.user.username)
				.setDiscriminator(guildMember.user.discriminator)
				.build();

			context.drawImage(await loadImage(levelCard), 0, index * 282);

			index++;
		}

		let selectMenuOptions: APISelectMenuOption[] = [];

		while (selectMenuOptions.length < 25) {
			selectMenuOptions.push({
				label: `${pageNumber + 13 - selectMenuOptions.length}`,
				value: `${pageNumber + 13 - selectMenuOptions.length}`,
			});
		}

		selectMenuOptions = selectMenuOptions
			.filter((choice) => parseInt(choice.value) > 0)
			.reverse()
			.slice(0, Math.ceil(pageLevels.length / 5));

		this.embeds = [{color: Colours.Default, image: {url: ""}}];

		if (pageLevels.length || true) {
			this.components = [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setCustomId("leaderboardFirstPage")
						.setEmoji(EmojiIDs.FirstPage)
						.setStyle(ButtonStyle.Secondary)
						.setLabel(" "),
					new ButtonBuilder()
						.setCustomId("leaderboardBack")
						.setEmoji(EmojiIDs.Back)
						.setStyle(ButtonStyle.Secondary)
						.setLabel(" "),
					new ButtonBuilder()
						.setCustomId("leaderboardPageSelectButton")
						.setEmoji(EmojiIDs.SelectPage)
						.setStyle(ButtonStyle.Secondary)
						.setLabel(" "),
					new ButtonBuilder()
						.setCustomId("leaderboardForward")
						.setEmoji(EmojiIDs.Forward)
						.setStyle(ButtonStyle.Secondary)
						.setLabel(" "),
					new ButtonBuilder()
						.setCustomId("leaderboardLastPage")
						.setEmoji(EmojiIDs.LastPage)
						.setStyle(ButtonStyle.Secondary)
						.setLabel(" "),
				),
				new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
					new StringSelectMenuBuilder()
						.setCustomId("leaderboardPageSelectMenu")
						.setPlaceholder(
							`${pageNumber - 2 > 0 ? `${pageNumber - 2} ` : ""}${
								pageNumber - 1 ? `${pageNumber - 1} ` : ""
							}« ${pageNumber} »${
								pageNumber + 1 < Math.ceil(guild.members.cache.size / 5)
									? ` ${pageNumber + 1}`
									: ""
							} ${
								pageNumber + 2 < Math.ceil(guild.members.cache.size / 5)
									? ` ${pageNumber + 2}`
									: ""
							}`,
						)
						.setOptions(...selectMenuOptions)
						.setMaxValues(1)
						.setMinValues(1),
				),
			];
		}

		const attachmentName = `leaderboard-${pageNumber}-${Date.now()}.png`;
		const attachment = new AttachmentBuilder(canvas.toBuffer(), {
			name: attachmentName,
		});

		this.files = [attachment];
		(
			this.embeds[0].image as APIEmbedImage
		).url = `attachment://${attachmentName}`;

		return this;
	}
}

// ! Enums

/**
 * Some nice colours for embeds and what not.
 * @example
 * import {Colours} from "../../../utility.js";
 *
 * // Create an embed the colour (coloured side bar) of which exactly matches the colour of the embed itself, making it practically invisible.
 * // This results in a very clean and professional looking embed.
 * const embed = {
 * 	title: "Example Embed",
 * 	color: Colours.Transparent
 * };
 * @example
 * // Replying with a transparent coloured embed.
 * // ./src/commands/utility/ping.ts.
 * import {Colours} from "../../../utility.js";
 *
 * // ...
 *
 * await interaction.reply({
 * 	// ...
 * 	color: Colours.Transparent,
 * 	// ...
 * })
 *
 * // ...
 */
export enum Colours {
	Query = 0x2b2d31,
	Loading = 0x2b2d31,
	Success = 0x2b2d31,
	Warning = 0x2b2d31,
	Error = 0x2b2d31,
	Default = 0x2b2d31,
	/**
	 * A colour that exactly matches the colour of *embed backgrounds* using **dark theme**.
	 */
	Transparent = 0x2b2d31,
	/**
	 * A colour that matches the colour of *embed backgrounds* using **light theme**.
	 *
	 * Note: Not confirmed whether the colour actually matches the background of embeds in light mode, no way I'm going to enable Discord light theme to test.
	 */
	TransparentBright = 0xf2f3f5,
	/**
	 * The new `blurple` colour that Discord uses.
	 *
	 * Somewhere in between blue and purple.
	 */
	Blurple = 0x5865f2,
	/**
	 * A nice lime colour. Used for the levelling progress bar.
	 *
	 * @see {@link LevelLeaderboardMessage} for an example usage of this colour.
	 * @see {@link ./src/commands/levelling/level.ts level.ts} for another example usage of this colour.
	 */
	Lime = 0x10df50,
	/**
	 * A deep ocean blue colour.
	 */
	OceanBlue = 0x1055d8,
}

/**
 * An enum with hex strings representing colour values.
 *
 * The colours here are the same as in the {@link Colours the Colours enum}.
 * @see {@link Colours} for an enum with numbers representing colour values.
 */
export enum ColourHexStrings {
	Query = "#2b2d31",
	Loading = "#2b2d31",
	Success = "#2b2d31",
	Warning = "#2b2d31",
	Error = "#2b2d31",
	Default = "#2b2d31",
	Transparent = "#2b2d31",
	TransparentBright = "#f2f3f5",
	Blurple = "#5865f2",
	Lime = "#10df50",
	OceanBlue = "#1050df",
}

/**
 * An enum of emoji IDs of emojis from `🌌 The Slimy Swamp 🌳` guild that the bot can use.
 * @example
 * // Using the YouTube logo emoji to create a nice message for the YouTube upload tracker.
 * // ./src/functions/tools/checkUploads.ts.
 * import {Emojis} from "../../../utility.js";
 *
 * // ...
 *
 * await discordChannel.send({
 *		// The emoji name does not need to be in between the two colons.
 *		// In fact, basically any string can go there.
 *		// To save space, just use underscores.
 *		content: `${Emojis.YouTubeLogo} ${pingRoleID ? `<@&${pingRoleID}> ` : ""}${title} has uploaded a new video!`,
 *		embeds: [
 *	// ...
 * ]
 * });
 *
 * // ...
 */
export enum Emojis {
	// https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg
	YouTubeLogo = "<:_:1122177058974474300>",
	// Edited version of https://cdn-icons-png.flaticon.com/512/10313/10313032.png
	QuestionMark = "<:_:1122479667828502568>",
	// https://i.gifer.com/ZZ5H.gif
	Loading = "<a:_:1122539471024443522>",
	// Edited version of https://cdn-icons-png.flaticon.com/512/10337/10337354.png
	Success = "<:_:1122174591591260170>",
	// Edited version of https://www.flaticon.com/free-icon/exclamation_10308557
	Warning = "<:_:1122174876757803018>",
	// https://www.flaticon.com/free-icon/cross_10308387
	Error = "<:_:1122174658331021312>",
	// https://www.flaticon.com/free-icon/rewind_190518
	FirstPage = "<:_:1122174586914623610>",
	// https://www.flaticon.com/free-icon/previous_189260
	Back = "<:_:1122174617604337716>",
	// Edited version of https://www.flaticon.com/free-icon/ellipsis_8699925
	SelectPage = "<:_:1122174222903558165>",
	// https://www.flaticon.com/free-icon/previous_189259
	Forward = "<:_:1122174619563069583>",
	// https://www.flaticon.com/free-icon/fast-forward_190517
	LastPage = "<:_:1122174588294537367>",
	// https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/dd/Slime_JE3_BE2.png/revision/latest?cb=20191230025505
	Slime = "<:_:1112438888359792640>",
	// https://cdn-icons-png.flaticon.com/512/1587/1587509.png
	Envelope = "<:_:1122178406512087071>",
	// https://pbs.twimg.com/media/EThkxLwWsAMGQgp?format=png&name=360x360
	Wumpus = "<:_:1112436655241035807>",
}

export enum EmojiIDs {
	YouTubeLogo = "1122177058974474300",
	QuestionMark = "1122479667828502568",
	Loading = "1122539471024443522",
	Success = "1122174591591260170",
	Warning = "1122174876757803018",
	Error = "1122174658331021312",
	FirstPage = "1122174586914623610",
	Back = "1122174617604337716",
	SelectPage = "1122174222903558165",
	Forward = "1122174619563069583",
	LastPage = "1122174588294537367",
	Slime = "1112438888359792640",
	Envelope = "1122178406512087071",
	Wumpus = "1112436655241035807",
}

export enum ImageURLs {
	YouTubeLogo = "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
	QuestionMark = "https://cdn-icons-png.flaticon.com/512/10313/10313032.png",
	Loading = "https://i.gifer.com/ZZ5H.gif",
	SuccessOriginal = "https://cdn-icons-png.flaticon.com/512/10337/10337354.png",
	WarningOriginal = "https://cdn-icons-png.flaticon.com/512/10308/10308557.png",
	Error = "https://cdn-icons-png.flaticon.com/512/10308/10308387.png",
	FirstPage = "https://cdn-icons-png.flaticon.com/512/190/190518.png",
	Back = "https://cdn-icons-png.flaticon.com/512/189/189260.png",
	SelectPageOriginal = "https://cdn-icons-png.flaticon.com/512/8699/8699925.png",
	Forward = "https://cdn-icons-png.flaticon.com/512/189/189259.png",
	LastPage = "https://cdn-icons-png.flaticon.com/512/190/190517.png",
	Slime = "https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/dd/Slime_JE3_BE2.png/revision/latest?cb=20191230025505",
	Envelope = "https://cdn-icons-png.flaticon.com/512/1587/1587509.png",
	Wumpus = "https://pbs.twimg.com/media/EThkxLwWsAMGQgp?format=png&name=360x360",
}

// ! Objects

/**
 * Some options for the `displayAvatarURL()` function that ensure the best quality avatar.
 * @example
 * // Sending the user's avatar in the footer icon of an embed when an error occurs.
 * // handleError function.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * const errorReply = {
 *  embeds: [{
 *  // ...
 *  footer: {icon_url: interaction.user.displayAvatarURL(DisplayAvatarURLOptions)},
 *  // ...
 * 	}]
 * }
 *
 * // ...
 *
 */
export const DisplayAvatarURLOptions: ImageURLOptions = {
	/**
	 * `forceStatic: false` - If the avatar is animated, don't force it to be static.
	 */
	forceStatic: false,
	/**
	 * `size: 4096` - Make sure that the avatar is of the maximum size.
	 */
	size: 4096,
	/**
	 * `extension: "png"` - Make sure that the avatar image is a PNG, so that the image can be loaded and used without problems by the `canvas` module, and so that in general, it is of good quality.
	 */
	extension: "png",
};

/**
 * Object used by the poll system to represent certain options with different emojis.
 *
 * For example, instead of using the usual number emojis for the choices `yes` and `no`, thumbs up and thumbs down are used instead.
 */
export const optionEmojis: {[key: string]: string} = {
	yes: "👍",
	no: "👎",
};

// ! Regex Hell

/*

? Note

Try to omit capturing groups from all regular expressions (add `?:` to the beginning of the capturing group, right after the opening bracket).

In other words, make them "non-capturing-groups", as otherwise there may be some unintended behaviour, especially when using `String#split` with the regular expression.

Unless you actually *need* a capturing group, remove all capturing groups from regular expressions and use non-capturing groups instead. (add `?:` right after the opening bracket of the group)
If you actually need a capturing group, then you can use them freely, otherwise, if you simply need to group several expressions together, as is in most cases, use non-capturing groups.

This goes for all regular expressions in this project, not just those in this file or just those in this section.

Try to make a string representation of a regular expression first (don't export it), after that, make the regular expression with the string. (RegExp(StringRegExp))

This way you can document different parts of your regular expression.

You don't have to do this if your regular expression is very simple or if it won't cause any inconsistency.

Use camelCase for the regex string variables, and PascalCase for the regular expressions themselves.

*/

const ANSIControlCharactersRegExpString = "(?:\x1B|\\[d{1,2}m)";

/**
 * A regular expression to match `ANSI control characters`.
 *
 * This is useful for cleaning up strings that were changed in some way by the `chalk` module.
 *
 * Used in the {@link console.log} function refactor.
 * @example
 * // Removing control characters added by chalk.
 * import {ANSIControlCharactersRegExp} from "../../../utility.js";
 * import chalk from "chalk";
 *
 * const {redBright, bold} = chalk;
 *
 * const message = redBright(bold("Hello, world!"));
 *
 * console.log(JSON.stringify(message));
 * // => "\u001b[91m\u001b[1mHello, world!\u001b[22m\u001b[39m"
 *
 * const trimmedMessage = message.replace(ANSIControlCharactersRegExp, "");
 *
 * console.log(JSON.stringify(trimmedMessage), trimmedMessage);
 * // => "Hello, world!" Hello, world!
 * @example
 * // Used in the console.log function refactor.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * // Clearing out any invisible control characters, and then checking if the string starts with a new line.
 * latestLog.replace(ANSIControlCharactersRegExp, "").startsWith("\n")
 *
 * // ...
 *
 */
export const ANSIControlCharactersRegExp = new RegExp(
	ANSIControlCharactersRegExpString,
	"g",
);

// A capture group is necessary in this regular expression.
export const RegExpCharactersRegExp = /([.*+?^${}()|[\]\\])/g;

const punctuationRegExpString =
	"[\u2000-\u206F\u2E00-\u2E7F'!\"#$%&()*+,\\-./:;<=>?@[\\]^_`{|}~«»《》〈〉]";

export const PunctuationRegExp = RegExp(punctuationRegExpString, "g");

export const PunctuationLookaheadRegExp = RegExp(
	`(?=${punctuationRegExpString})`,
	"g",
);

const wordRegExpString = `(?:[a-z][’']?(?:[-–—][a-z])?)+(?=(${punctuationRegExpString}|[\n ]|$))`;

export const WordRegExp = RegExp(wordRegExpString, "gi");

const camelCaseSubStringSeparatorRegExpString =
	"[A-Z][a-rt-z]|A|(?<=[a-z])[B-Z]{2,}|(?<=[a-z])I";

export const CamelCaseSubStringSeparatorRegExp = RegExp(
	camelCaseSubStringSeparatorRegExpString,
	"g",
);

export const CamelCaseSubStringSeparatorLookaheadRegExp = RegExp(
	`(?=${camelCaseSubStringSeparatorRegExpString})`,
	"g",
);

const lineBreakRegExpString = "\r\n|\n\r|[\n\r\u000C\u0085\u2028\u2029\u001E]";

export const LineBreakRegExp = RegExp(lineBreakRegExpString, "g");

const notLineBreakRegExpString = "[^\n\r\u000C\u0085\u2028\u2029\u001E]";

export const NotLineBreakRegExp = RegExp(notLineBreakRegExpString, "g");

const nameAbbreviationsRegExpString = `(?:Dr|Esq|Hon|Jr|Mr|Mrs|Ms|Messrs|Mmes|Msgr|Prof|Rev|Rt\\. Hon|Sr|St)`;

export const NameAbbreviationsRegExp = RegExp(
	nameAbbreviationsRegExpString,
	"g",
);

const openingQuoteRegExpString = `[「“‘"'«《〈]`;

export const OpeningQuoteRegExp = RegExp(openingQuoteRegExpString, "g");

const closingQuoteRegExpString = `[」”’"'»》〉]`;

export const ClosingQuoteRegExp = RegExp(closingQuoteRegExpString, "g");

const quoteRegExpString = `[「」“”‘’"'«»《》〈〉]`;

export const QuoteRegExp = RegExp(quoteRegExpString, "g");

const sentenceEndCharactersRegExpString = "[.…?!]";

export const SentenceEndCharactersRegExp = RegExp(
	sentenceEndCharactersRegExpString,
	"g",
);

const notSentenceEndCharactersRegExpString = `[^\\d${sentenceEndCharactersRegExpString.slice(
	1,
	sentenceEndCharactersRegExpString.length - 1,
	// The first parameter of String#slice is 2 here, because we don't want to include the `^` (character set negation) at the start of the `notLineBreakRegExpString`.
)}${notLineBreakRegExpString.slice(2, notLineBreakRegExpString.length - 1)}]`;

export const NotSentenceEndCharactersRegExp = RegExp(
	notSentenceEndCharactersRegExpString,
	"g",
);

const sentenceCharacterRegExpString =
	`(?:` + // Opening outermost non-capturing group bracket.
	`(?:…|\\.{3,})+(?=\\s(?:[^A-Z]|I(?=\\s)))` + // Matches ellipses (...) with a whitespace character after them and no capital letter (or the word "I", as it is always capital). Note: it isn't needed to match ellipses without a whitespace character after them, as that is matched anyway in the next expression below:
	`|\\d(?!\\.)` +
	`|(?<!^|${lineBreakRegExpString})\\d` +
	`|\\s+${nameAbbreviationsRegExpString}\\.` + // Matches name abbreviations, E.g., `Mr. ${name}` isn't a full sentence, even though the period follows the general pattern of a sentence-ending character. Name abbreviations have to have a whitespace character or a newline before them. Note: it isn't needed to check for line breaks specifically, as the whitespace RegExp character covers them.
	`|${sentenceEndCharactersRegExpString}\\s*(?:${closingQuoteRegExpString}|\\))` + // Matches sentence-ending characters inside quotes.
	`(?<=\\s+)${SentenceEndCharactersRegExp}` + // Matches sentence-ending characters with a whitespace in front of them.
	`|(?:${sentenceEndCharactersRegExpString}(?=\\S))` + // Matches sentence-ending characters without a whitespace character after them. Note: it isn't needed to check for decimal point usage as well as recurring decimal notation (0.999...) as the decimal would be matched anyway by this expression and the ellipsis would be matched either by the sentence-ending character part of the SentenceRegExp or by the previous expression.
	`|${notSentenceEndCharactersRegExpString}` + // Matches all non-sentence-ending characters.
	`)`; // Closing outermost non-capturing group bracket.

export const SentenceRegExp = RegExp(
	`(?<=^|\\s)` + // Checks for the necessary whitespace character or start of the string before a sentence. Note: it isn't needed to check for line breaks specifically, as the whitespace RegExp character covers them.
		`${sentenceCharacterRegExpString}+` + // Matches as many valid sentence characters as possible.
		`(?:${sentenceEndCharactersRegExpString}+|$)` + // Matches the sentence end character(s).
		`(?:(?:(?:\\s*\\(\\s*${sentenceCharacterRegExpString}+)?\\s*\\))` + // Matches a possible further string of words inside parentheses, after the main sentence.
		`|${closingQuoteRegExpString}*(?=\\s|$))`, // Matches the necessary space or line break after the sentence end character. Note: it isn't needed to check for line breaks specifically, as the whitespace RegExp character covers them.
	"g",
);

const lineSeparatorRegExpString = `(?:\\s*(?:${lineBreakRegExpString})\\s*)+`;

export const LineSeparatorRegExp = RegExp(lineSeparatorRegExpString, "g");

export const LineSeparatorLookaheadRegExp = RegExp(
	`(?=${lineSeparatorRegExpString})+`,
	"g",
);

const paragraphSeparatorRegExpString = `(?:\\s*(?:${lineBreakRegExpString})\\s*){2,}`;

export const ParagraphSeparatorRegExp = RegExp(
	paragraphSeparatorRegExpString,
	"g",
);

export const ParagraphSeparatorLookaheadRegExp = RegExp(
	`(?=${paragraphSeparatorRegExpString})`,
	"g",
);

const emojiRegExpString =
	"(?:\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟)";

export const EmojiRegExp = new RegExp(emojiRegExpString);

const startEmojiRegExpString = `^${emojiRegExpString}`;

export const StartEmojiRegExp = new RegExp(startEmojiRegExpString);

const afterEmojiRegExpString = `${emojiRegExpString}.+`;

export const AfterEmojiRegExp = new RegExp(afterEmojiRegExpString, "gm");

const emojiLookbehindRegExpString = `(?<=${startEmojiRegExpString}).+`;

export const EmojiLookbehindRegExp = new RegExp(emojiLookbehindRegExpString);

// ! Arrays

/**
 * An array of number emoji characters in ascending order (`1️⃣`, `2️⃣`, `3️⃣` ...) `10` elements long. Used in {@link PollMessage.create}.
 * @see {@link rainbowColourArray} for a related array of rainbow colours in order. This is another array used in the {@link PollMessage.create} class method.
 * @see {@link PollMessage.create} for an example use case of this array.
 * @see `⬇` below for a snippet of the use case.
 * // Using the array to push emojis.
 * // PollMessage.create in ./src/utility.ts.
 * this.emojis.push(
 *				option
 *					? optionEmojisOption && !this.emojis.includes(optionEmojisOption)
 *						? optionEmojisOption
 *						: emojiArray[i - 1]
 *					: null,
 *			);
 */
export const emojiArray = [
	"1️⃣",
	"2️⃣",
	"3️⃣",
	"4️⃣",
	"5️⃣",
	"6️⃣",
	"7️⃣",
	"8️⃣",
	"9️⃣",
	"🔟",
];

/**
 * Array of rainbow colours, 10 elements in size. Used in {@link PollMessage.create}.
 * @see {@link emojiArray} for a related array of number emoji characters in ascending order (`1️⃣`, `2️⃣`, `3️⃣`...), this is another array used in the {@link PollMessage.create} class method.
 * @see {@link PollMessage.create} for an example use case of this array.
 * @see below `⬇` for a snippet of this use case.
 * @example
 * // Using the array to generate a colourful pie chart for the poll message using the canvas module.
 * // PollMessage.create in ./src/utility.ts.
 * // ...
 *
 * for (let i = 0; i < 10; i++) {
 *
 * // ...
 *
 * 	context.fillStyle = rainbowColourArray[i];
 *
 * // Fills the circle with a rainbow colour from the rainbowColourArray.
 * // This creates the current sector of the pie chart with the correct colour of the rainbow.
 * context.fill();
 *
 * // ...
 *
 * };
 *
 * // ...
 */
export const rainbowColourArray = [
	"#ff0033",
	"#ff6633",
	"#ffcc33",
	"#ffff66",
	"#ccff00",
	"#66ff66",
	"#aaf0d1",
	"#33ccff",
	"#0066ff",
	"#a950b0",
];

export const TextChannelTypes = [
	ChannelType.GuildText,
	ChannelType.GuildAnnouncement,
	ChannelType.AnnouncementThread,
	ChannelType.PublicThread,
	ChannelType.PrivateThread,
] as (
	| ChannelType.GuildText
	| ChannelType.GuildVoice
	| ChannelType.GuildCategory
	| ChannelType.GuildAnnouncement
	| ChannelType.AnnouncementThread
	| ChannelType.PublicThread
	| ChannelType.PrivateThread
	| ChannelType.GuildStageVoice
	| ChannelType.GuildForum
)[];
