import {
	APIEmbed,
	APIEmbedField,
	APIEmbedFooter,
	APISelectMenuOption,
	ActionRowBuilder,
	AttachmentBuilder,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	ColorResolvable,
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
	SelectMenuComponentOptionData,
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
 * ! By default, exports are sorted by:
 * * 1. Functions -> Classes -> Enums -> Objects -> Regular Expressions -> Arrays.
 * * 2. The order they were created in, with oldest being first.
 * However, if two exports are related, E.g., the `isValidURL` function & the `URLRegExp` regular expression, they should be put together, with the export that has *higher priority* in the normal order being first, **unless** the *higher priority* export is in some way a more advanced form of the *lower priority* export, **or** if the *lower priority* export is used by the *higher priority* export.
 * They should be located in the section that the higher order export would normally be located in.
 * For example, the `isValidURL` function and the `URLRegExp` regular expression are related because they both involve URLs in strings, so they should be sorted together.
 * `isValidURL` is a function and has higher priority than `URLRegExp`. It would normally go first, but `isValidURL` is basically a more advanced form of `URLRegExp`, so it goes second.
 * Because `isValidURL` has a higher priority, both exports are located in the *functions* section.
 */

// ! Functions

/**
 * A function to loop over a folder containing categories, which themselves contain files. The file exports (if there are any), the file name and the file path are passed as parameters to a callback function.
 *
 * Information about the files is logged to the console.
 * @param {string} path The path to the folder containing the categories. (from the src directory)
 * @param {(exports: unknown, fileName: string, filePath: string) => void | Promise<void>} callback The callback function to be called on each file. The function is called with three arguments: the file exports (if there are any), the file name and the file path.
 * @returns {Promise<void>}
 * @example
 * // ./src/bot.ts.
 * // Registering the client functions.
 * import {loopFolders} from "./functions.js";
 *
 * // ...
 *
 * // Loops through the client functions folder and calls the functions.
 * await loopFolders("functions", (callback) => (callback as (client: SlimeBotClient) => void)(client));
 *
 * // ...
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

/**
 * A regular expression that matches all URLs in a string. +(Global and ignore case flags)
 * @example
 * // Matching all URLs in a string.
 * import {URLRegExp} from "../../../utility.js";
 *
 * const string = "http://foo.co.uk/ Some example text in between https://marketplace.visualstudio.com/items?itemName=chrmarti.regex Some more random text - https://github.com/chrmarti/vscode-regex";
 *
 * const urls = URLRegExp.exec(string);
 * console.log(urls);
 * // => ["http://foo.co.uk/", "https://marketplace.visualstudio.com/items?itemName=chrmarti.regex", "https://github.com/chrmarti/vscode-regex"].
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
 * const messageImageURLs = (content?.match(URLRegExp) ?? []).filter(isImageLink);
 *
 * // ...
 */
export const URLRegExp =
	/(https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?/gi;

/**
 * A function to check if a string is a valid URL or not.
 * @param {string} urlString The string to check.
 * @returns {boolean} Whether the string is a valid URL.
 * @example
 *
 * isValidURL("styles.css");
 * // => false.
 *
 * isValidURL("https://www.youtube.com");
 * // => true.
 */
export const isValidURL = (urlString: string): boolean =>
	/^(https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i.test(
		urlString,
	);

/**
 * A list of all (probably most) valid image file extensions.
 *
 * Used in the `isImageLink` function. `./src/utility.ts`
 * @example
 * // Checking if a link is an image link.
 * import {ImageExtensions} from "../../../utility.js";
 *
 * const string = "https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/dd/Slime_JE3_BE2.png/revision/latest?cb=20191230025505";
 *
 * console.log(ImageExtensions.some((extension) => new RegExp(`.${extension}`, "i").test(string)));
 * // => true.
 * @example
 * // Used in the isImageLink function.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * ImageExtensions.some((extension) =>
 *  	new RegExp(`\\.${extension}($|\\/[^/]+)`, "i").test(urlString),
 * );
 *
 * // ...
 */
export const ImageExtensions = [
	"jpg",
	"jpeg",
	"png",
	"gif",
	"tiff",
	"tif",
	"psd",
	"pdf",
	"eps",
	"ai",
	"indd",
	"cr2",
	"crw",
	"nef",
	"pef",
];

/**
 * A function to check whether a link leads to an image file based off of it's file extension.
 * @param {string} urlString The link to check whether it is an image or not.
 * @returns {boolean} Whether the link stores an image file or not.
 * @example
 * import {isImageLink} from "../../../utility.js";
 *
 * isImageLink("https://www.youtube.com");
 * // => false.
 *
 * isImageLink("https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/dd/Slime_JE3_BE2.png/revision/latest?cb=20191230025505");
 * // => true.
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
	// For loop instead of forEach or reduce because jump target can not cross function boundary.
	// I.e. -> "return true" in the callback passed as an argument to the forEach function will return true in the scope of that callback, not that of the whole forEach function.
	// A regex pattern is used here instead of String.prototype.endsWith because there are certain cases where there can be more text after the file extension, as seen in the second example above.
	ImageExtensions.some((extension) =>
		new RegExp(`\\.${extension}($|\\/[^/]+)`, "i").test(urlString),
	);

/**
 * A function that inverts an objects keys and values. Used in the `⭐ Starboard`.
 * @param {{[key: string]: string}} object The object to invert the values of.
 * @returns {{[key: string]: string}} A **new** object with the inverted keys and values.
 * @example
 * // Inverting a user object.
 * import {invertObject} from "../../../utility.js";
 *
 * let rolyPolyVole = { firstName: "roly", secondName: "Poly", thirdName: "Vole" };
 *
 * invertObject(rolyPolyVole);
 * // => { roly: "firstName", Poly: "secondName", Vole: "thirdName" }.
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
	[key: string]: string;
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
 * @example
 * // Used in handleError.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * // Logs interaction details object to the console.
 * logObject({
 * 	// ...
 * })
 *
 * // ...
 */
export const logObject = (
	object: {[key: string]: unknown},
	indent = 0,
): void => {
	for (const key in object) {
		if (typeof object[key] === "object" && object[key]) {
			console.log(`${" ".repeat(indent)}${bold(key)}`);
			logObject(object[key] as {[key: string]: unknown}, indent + 1);
		} else if (object[key]) {
			console.log(
				`${" ".repeat(indent)}${bold(key)}:`,
				whiteBright(`${object[key]}`),
			);
		}
	}

	if (!indent) console.log();
};

/**
 * A function to attempt to handle errors as best as possible.
 *
 * If the user is just a normal user, the function will reply with a simple error prompting the user to report the error.
 *
 * If the user ID is one of the IDs included in `process.env.discordBotTesters`, then a more detailed error message is sent with interaction details.
 *
 * Sends an embed with some of the error details and a prompt for the user to report the error. Used in `interactionCreate.ts`.
 * @param {Interaction} interaction The interaction that caused the error.
 * @param {BotClient} client The bot client.
 * @param {unknown} error The error that occurred.
 * @returns {Promise<void>} Replies to the interaction with an error message. (A simple message if the user is an average user, a more detailed one if the user is included in `process.env.discordBotTesters`).
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
	console.log();
	console.error(error);

	const {
		discordBotOwnerID,
		discordBotTesters,
		discordGuildID,
		discordSupportChannelID,
	} = process.env;

	const discordBotOwner = discordBotOwnerID
		? await client.users.fetch(discordBotOwnerID)
		: null;

	const discordGuild = discordGuildID
		? await client.guilds.fetch(discordGuildID)
		: null;

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

	const isBotTester =
		(discordBotTesters
			?.split(",")
			.map((id) => id.trim())
			.includes(user.id) ??
			false) ||
		user.id === discordBotOwnerID;

	const errorReply = {
		embeds: [
			{
				title: `${Emojis.Error} Error!`,
				description: `\`${
					client.user?.username as string
				}\` has encountered an error while executing the interaction${
					isBotTester
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
				}`.trim(),
				color: Colours.Transparent,
			},
		],
	};

	if (process.env.debug) {
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
			await interaction.reply(errorReply);
		} catch (_error) {
			await interaction.editReply(errorReply).catch(console.error);
		}
	} else {
		await channel?.send(errorReply).catch(console.error);
	}
};

/**
 * The standard, untouched console log function. Used in the refactored `console.log` function.
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
 * List of all logged messages on the console. Used in the refactored `console.log` function.
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
 * Refactored version of `console.log` that ensures that there are never more than two new lines between logged strings.
 * *(in reality, the function reduces the number of new lines between two logged strings by 1 (if needed), which, in most cases, results in two new lines remaining, which is the intended behavior)*
 * This creates a *very clean* and *professional* looking console with *consistent newlines*.
 * *Otherwise, there would be inconsistent new lines.*
 * E.g,
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
 * Between the client and database status messages, there are **three** new lines, which is *inconsistent* with the overall console style.
 * This refactoring of the function fixes that issue:
 *
 * [Database Status] Connecting...
 *
 * [Debug] [WS => Shard 0] Shard received all its guilds. Marking as fully ready.
 *
 * [Client] Ready! Online and logged in as 🌳 Slime Bot [/].
 *
 * [Database Status] Connected.
 */
console.log = (...data) => {
	const previousLogs = consoleLogs[consoleLogs.length - 1];
	const previousLog = previousLogs?.[previousLogs.length - 1];

	const latestLog = data[data.length - 1];

	if (
		typeof latestLog === "string" &&
		typeof previousLog === "string" &&
		// Remove possible control characters added by chalk.
		latestLog.replace(ANSIControlCharacterRegExp, "").startsWith("\n") &&
		previousLog.replace(ANSIControlCharacterRegExp, "").endsWith("\n")
	) {
		data[data.length - 1] = latestLog.replace(/\n/, "");
	}

	standardLog(...data);

	consoleLogs.push(data);
};

/**
 * Resolves a duration from a given string.
 * @param {string} string The string to resolve the duration of.
 * @returns {number} The resolved duration.
 * @example
 * // Resolving specific durations.
 *
 * resolveDuration("In 5 days"); // Returns Date.now() + 5 * 24 * 60 * 60 * 1000.
 * resolveDuration("Now"); // Returns Date.now().
 * resolveDuration("5 min"); // Returns 5 * 60 * 1000.
 *
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
		minute: 60000,
		min: 60000,
		m: 60000,
		hour: 3600000,
		h: 3600000,
		day: 86400000,
		d: 86400000,
		week: 604800000,
		w: 604800000,
		mo: 2592000000,
		month: 2592000000,
	};

	try {
		string = string
			.replace(/([0-9.]+)/g, "+ $1 *")
			.replace(/ /g, "")
			.trim();

		for (const time in durations) {
			string = string.replace(
				new RegExp(`${time}s?`, "ig"),
				`${durations[time]}`,
			);
		}

		if (string.startsWith("in")) {
			return Date.now() + evaluate(/(?<=in).+/.exec(string)?.[0] ?? "0");
		}

		if (string.endsWith("ago")) {
			return Date.now() - evaluate(/.+(?=ago)/.exec(string)?.[0] ?? "0");
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

/**
 * A simple function that extends the Discord JS `resolveColor` function, now including colours from the `Colours` enum.
 * @param {ColorResolvable | keyof typeof Colours} colour The colour to resolve.
 * @returns {number} The resolved colour value.
 */
export const resolveColour = (
	colour: ColorResolvable | keyof typeof Colours,
): number =>
	typeof colour === "string" && colour in Colours
		? Colours[colour as keyof typeof Colours]
		: resolveColor(colour as ColorResolvable);

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
) => {
	startValue = new Decimal(startValue);
	endValue = new Decimal(endValue);

	let sum = new Decimal(0);

	for (let i = startValue; i <= endValue; i = i.plus(1)) {
		sum = sum.plus(
			evaluate(variable ? expression.replace(variable, `(${i})`) : expression),
		);
	}

	return sum;
};

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

export const limitNumber = (
	number: number | Decimal,
	minimumValue?: number | Decimal,
	maximumValue?: number | Decimal,
) =>
	Math.min(
		Math.max(
			new Decimal(number).toNumber(),
			new Decimal(minimumValue ?? -Infinity).toNumber(),
		),
		new Decimal(maximumValue ?? Infinity).toNumber(),
	);

// ! Classes

/**
 * A class to easily create a simple error message.
 */
export class SuccessMessage {
	embeds: [APIEmbed];

	/**
	 * @param {string} message The message to display in the embed.
	 */
	constructor(message: string) {
		this.embeds = [
			{
				description: `${Emojis.Success} ${message}`,
				color: Colours.Transparent,
			},
		];
	}
}

/**
 * A class to easily create a simple error message.
 */
export class ErrorMessage {
	embeds: [APIEmbed];

	/**
	 * @param {string} message The message to display in the embed.
	 */
	constructor(message: string) {
		this.embeds = [
			{
				description: `${Emojis.Error} ${message}`,
				color: Colours.Transparent,
			},
		];
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
	files: string[];
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

		const emojiReg =
			/^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟)/;

		const afterEmojiReg =
			/(?<=^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟)).+/;

		if (embed) {
			const optionArray = (
				(embed.description as string).match(
					/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟).+/gm,
				) as RegExpMatchArray
			).filter((option: string) => !option.startsWith("█"));

			for (const option of optionArray) {
				const emoji = (emojiReg.exec(option) as RegExpMatchArray)[0];

				if (emojiArray.includes(emoji)) {
					const index = emojiArray.indexOf(emoji);
					this.emojis[index] = emoji;
					this.options[index] = afterEmojiReg.exec(option)?.[0] ?? " ";
				} else {
					this.emojis.push(emoji);
					this.options.push(afterEmojiReg.exec(option)?.[0] ?? " ");
				}
			}
		} else if (data instanceof ChatInputCommandInteraction) {
			for (let i = 1; i <= 10; i++) {
				const option = data.options.getString(`choice-${i}`);

				const emoji = emojiReg.exec(option ?? "")?.[0];

				const afterEmojiMatch = afterEmojiReg.exec(option ?? "")?.[0];

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

					context.fill(); // Fills the circle.

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

		let attachment: AttachmentBuilder | string = new AttachmentBuilder(
			canvas.toBuffer(),
			{
				name: `slime-bot-poll-${new Date(Date.now())}.png`,
			},
		);

		const user = await client.users.fetch("500690028960284672");

		const message: Message = await user.send({files: [attachment]});

		attachment = [...message.attachments.values()][0].url;

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

		this.embeds = [
			{
				title:
					data instanceof ChatInputCommandInteraction
						? data.options.getString("message", true)
						: embed?.title,
				description:
					(data instanceof ChatInputCommandInteraction
						? data.options.getString("description") ?? ""
						: new RegExp(
								`^[\\s\\S]+(?=${this.emojis.filter((emoji) => emoji)[0]})`,
								"gm",
						  ).exec(
								(embed as Readonly<APIEmbed>).description as string,
						  )?.[0] ?? "") + description,
				color:
					data instanceof ChatInputCommandInteraction
						? (() => {
								// *Try* to resolve the colour.
								try {
									return resolveColour(
										(data.options.getString("colour") ??
											Colours.Blurple) as ColorResolvable,
									);
								} catch (_error) {}

								return undefined;
						  })()
						: embed?.color,

				author: {
					name: `${client.user?.username} Poll${
						pollEnd && parseInt(pollEnd) * 1000 <= Date.now() ? " - Ended" : ""
					}`,
					icon_url: client.user?.displayAvatarURL(DisplayAvatarURLOptions),
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
				thumbnail: {url: attachment},
			},
		];

		this.files = !(data instanceof ChatInputCommandInteraction)
			? [...data.message.attachments.values()].map(
					(attachmentData) => attachmentData.url,
			  )
			: [];

		if (data instanceof ChatInputCommandInteraction) {
			for (const attachmentData of (
				data.options.getString("attachments") ?? ""
			).split(",")) {
				if (isValidURL(attachmentData)) {
					this.files.push(attachmentData);
				}
			}
		}
		return this;
	}
}

export class LevelLeaderboardMessage {
	files?: [AttachmentBuilder];
	embeds?: [APIEmbed];
	components?: [
		ActionRowBuilder<ButtonBuilder>,
		ActionRowBuilder<StringSelectMenuBuilder>,
	];
	async create(
		interaction: ChatInputCommandInteraction | ButtonInteraction,
		pageFunction?: (page: number) => number,
	) {
		if (!interaction.guild) {
			this.embeds = new ErrorMessage(
				"You must be in a guild to do this!",
			).embeds;

			return this;
		}

		let pageNumber =
			interaction instanceof ChatInputCommandInteraction
				? interaction.options.getNumber("page") ?? 1
				: parseInt(
						(
							/\d+/.exec(
								(interaction.message.embeds[0]?.data.footer as APIEmbedFooter)
									.text,
							) as RegExpExecArray
						)[0],
				  );

		if (pageFunction) pageNumber = pageFunction(pageNumber);

		const guildData = (await GuildDataSchema.findOne({
			id: interaction.guildId,
		})) as MongooseDocument<IGuildDataSchema>;

		const levels = guildData.userExperienceData;

		let leaderboardArray: {
			userID: string;
			experience: number;
			lastMessageTimestamp?: number;
		}[] = [];

		for (const key in levels) {
			leaderboardArray.push({userID: key, ...levels[key]});
		}

		leaderboardArray = leaderboardArray.sort(
			(a, b) => b.experience - a.experience,
		);

		const pageLevels = leaderboardArray.slice(
			pageNumber * 10 - 10,
			pageNumber * 10 + 1,
		);

		if (!pageLevels.length) {
			if (pageNumber === 1) {
				this.embeds = new ErrorMessage(
					"This server has no levelling data!",
				).embeds;
				return this;
			}

			this.embeds = new ErrorMessage("Please enter a valid page!").embeds;
			return this;
		}

		const canvas = createCanvas(934, leaderboardArray.length * 282);
		const context = canvas.getContext("2d");

		let index = 0;

		// For loop with an index has to be used here because of async functions.
		for await (const user of pageLevels) {
			const guildMember = await interaction.guild.members.fetch(user.userID);

			const userAvatar = guildMember.displayAvatarURL(DisplayAvatarURLOptions);

			const userLevel = experienceToLevel(user.experience);

			const userLevelRequiredXP = levelToExperience(userLevel);

			const currentLevelProgress = user.experience - userLevelRequiredXP;

			const nextLevelRequiredXP = levelToExperience(userLevel + 1);

			const levelCard = await new canvacord.Rank()
				.setAvatar(userAvatar)
				.setLevel(userLevel)
				.setCurrentXP(currentLevelProgress)
				.setRank(index + 1)
				.setRequiredXP(nextLevelRequiredXP - userLevelRequiredXP)
				.setStatus(guildMember.presence?.status ?? "online")
				.setProgressBar("#10df50", "COLOR")
				.setUsername(guildMember.user.username)
				.setDiscriminator(guildMember.user.discriminator)
				.build();

			context.drawImage(await loadImage(levelCard), 0, index * 282);

			index++;
		}

		const attachment = new AttachmentBuilder(await canvas.toBuffer(), {
			name: `leaderboard-${pageNumber}-${Date.now()}.png`,
		});

		let selectMenuOptions: (
			| SelectMenuComponentOptionData
			| APISelectMenuOption
		)[] = [];

		while (selectMenuOptions.length < 25) {
			selectMenuOptions.push({
				label: `${pageNumber + 13 - selectMenuOptions.length}`,
				value: `${pageNumber + 13 - selectMenuOptions.length}`,
			});
		}

		selectMenuOptions = selectMenuOptions
			.filter((choice) => parseInt(choice.value) > 0)
			.reverse()
			.slice(0, Math.ceil(pageLevels.length / 10));

		this.files = [attachment];

		if (Math.floor(pageLevels.length / 10) > 1 || true) {
			this.components = [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setCustomId("leaderboardFirstPage")
						.setEmoji(Emojis.FirstPage)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId("leaderboardBack")
						.setEmoji(Emojis.Back)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId("leaderboardForward")
						.setEmoji(Emojis.Forward)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId("leaderboardLastPage")
						.setEmoji(Emojis.LastPage)
						.setStyle(ButtonStyle.Secondary),
				),
				new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
					new StringSelectMenuBuilder()
						.setCustomId("leaderboardPageSelection")
						.setPlaceholder("Select a Page")
						.setOptions(...selectMenuOptions)
						.setMaxValues(1)
						.setMinValues(1),
				),
			];
		}

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
	YouTubeLogo = "<:_:1115689277397926022>",
	// Edited version of https://www.flaticon.com/free-icon/check_10337354
	Success = "<:_:1118183966705467532>",
	// Edited version of https://www.flaticon.com/free-icon/exclamation_10308557
	Warning = "<:_:1120062360531521546>",
	// https://www.flaticon.com/free-icon/cross_10308387
	Error = "<:_:1118182956670914634>",
	// https://www.flaticon.com/free-icon/rewind_190518
	FirstPage = "<:_:1121126417770500096>",
	// https://www.flaticon.com/free-icon/previous_189260
	Back = "<:_:1121126569906290708>",
	// https://www.flaticon.com/free-icon/previous_189259
	Forward = "<:_:1121126580991819867>",
	// https://www.flaticon.com/free-icon/fast-forward_190517
	LastPage = "<:_:1121126592480022568>",
	// https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/dd/Slime_JE3_BE2.png/revision/latest?cb=20191230025505
	Slime = "<:_:1112438888359792640>",
}

export enum EmojiIDs {
	YouTubeLogo = "1115689277397926022",
	Success = "1118183966705467532",
	Warning = "1120062360531521546",
	Error = "1118182956670914634",
	FirstPage = "1121126417770500096",
	Back = "1121126569906290708",
	Forward = "1121126580991819867",
	LastPage = "1121126592480022568",
	Slime = "1112438888359792640",
}

export enum ImageURLs {
	YouTubeLogo = "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
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

// ! Regular Expressions

/**
 * A regular expression to match `ANSI control characters`.
 *
 * This is useful for cleaning up strings that were changed in some way by the `chalk` module.
 *
 * Used in the `console.log` function refactor.
 * @example
 * // Removing control characters added by chalk.
 * import {ANSIControlCharacterRegExp} from "../../../utility.js";
 * import chalk from "chalk";
 *
 * const {redBright, bold} = chalk;
 *
 * const message = redBright(bold("Hello, world!"));
 *
 * console.log(JSON.stringify(message));
 * // => "\u001b[91m\u001b[1mHello, world!\u001b[22m\u001b[39m"
 *
 * const trimmedMessage = message.replace(ANSIControlCharacterRegExp, "");
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
 * latestLog.replace(ANSIControlCharacterRegExp, "").startsWith("\n")
 *
 * // ...
 *
 */
export const ANSIControlCharacterRegExp = /\x1B|\[\d{1,2}m/g;

export const RegExpCharactersRegExp = /[.*+?^${}()|[\]\\]/g;

export const PunctuationRegExp =
	/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~]/g;

export const GuildInviteRegExp =
	/(https?:\/\/)?(www\.)?(dis((cord(\.(((media|com)\/invite)|gg)\/[a-z]{7,}|((io|me(?!dia))\/[a-z\d-+=_[\]{}\\|:"<>?!@#$%^&*()~`]{3,})(?!\/servers)(?=\S\S))|app\.(com|net)\/invite\/[a-z]{7,})|board\.(org)\/server\/(\s*\S\s*){2,})|top\.gg\/servers)(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?/gi;

export const SentenceRegExp =
	/((…|\.{3,})(?=\s([^A-Z]|I))|([.…?!](?=\S))|\d+\.\d+\.{3,}|[^….?!\n]|(?<=\d+|(?<=\s|(\n|\r\n|\r|\n\r|\u000C|\u0085|\u2028|\u2029|\u001E)(Dr|Esq|Hon|Jr|Mr|Mrs|Ms|Messrs|Mmes|Msgr|Prof|Rev|Rt\. Hon|Sr|St)))\.|[.…?!](?=”|"|'|\)))+([….?!]+|$|(\)|”|"|')(?=(\n|\r\n|\r|\n\r|\u000C|\u0085|\u2028|\u2029|\u001E)))(?=\s|(\n|\r\n|\r|\n\r|\u000C|\u0085|\u2028|\u2029|\u001E)|$)(\s\(([^….?!]|(\n|\r\n|\r|\n\r|\u000C|\u0085|\u2028|\u2029|\u001E))+\))?/g;

export const WordRegExp =
	/[a-z-’']+(?= |\n|$|[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~])/gi;

export const NewLineRegExp =
	/(\n|\r\n|\r|\n\r|\u000C|\u0085|\u2028|\u2029|\u001E|\s)+/g;

export const ParagraphRegExp =
	/(\s*(\n|\r\n|\r|\n\r|\u000C|\u0085|\u2028|\u2029|\u001E)\s*){2,}/g;

// ! Arrays

/**
 * An array of number emoji characters (1️⃣, 2️⃣, 3️⃣ ...)
 *
 * Used in the poll system.
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
 * Object used by the poll system to represent certain options with different emojis.
 *
 * For example, instead of using the usual number emojis for the choices `yes` and `no`, thumbs up and thumbs down are used instead.
 */
export const optionEmojis: {[key: string]: string} = {
	yes: "👍",
	no: "👎",
};

/**
 * Array of rainbow colours.
 *
 * Used in the poll system to have a colourful pie chart.
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
