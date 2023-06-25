import {Client, Collection, GatewayIntentBits, Partials} from "discord.js";

import {BotClient} from "types";
import {connect} from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import {loopFolders} from "./utility.js";

const {discordBotToken, mongoDBToken} = process.env;

// Creating a client instance with every single intent and partial.
const client = new Client({
	intents: Object.keys(GatewayIntentBits) as unknown as Partials[],
	partials: Object.keys(Partials) as unknown as Partials[],
}) as BotClient;

// Register the client functions. The loopFolder function loops over the client functions in the ./src/functions directory, and calls all the functions.
// The functions define method properties for the client variable, taking advantage of the fact that the client variable is passed by reference, not by value, meaning that any new properties will be available everywhere where the client variable is used.
await loopFolders("functions", (callback) =>
	(callback as (client: BotClient) => void)(client),
);

client.handleEvents().catch(console.error);

// The commandArray property is used for registering the commands with the Discord REST API.
// The commands collection is used in the interactionCreate file for executing commands.
client.commandArray = [];
client.commands = new Collection();

client.handleCommands().catch(console.error);

client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

client.handleComponents().catch(console.error);

// Handle fonts used by the canvas module.
client.handleFonts().catch(console.error);

await client.login(discordBotToken);

await connect(mongoDBToken as string).catch(console.error);
