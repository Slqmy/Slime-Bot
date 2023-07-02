import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from "discord.js";
import mongoose, {Schema, model} from "mongoose";

export interface IEmbedSchema {
	_id: mongoose.Types.ObjectId;
	id: string;
	name: string;
	author: string;
	content?: string;
	embeds?: EmbedBuilder["data"][];
	files?: {link: string; name: string; size: number; type: string}[];
	components?: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[];
}

const EmbedSchema = new Schema<IEmbedSchema>({
	_id: mongoose.Types.ObjectId,
	id: {type: String, required: true},
	name: {type: String, required: true},
	author: {type: String, required: true},
	content: String,
	embeds: [
		{
			title: String,
			description: String,
			color: Number,
			author: {
				type: {
					name: {type: String, required: true},
					url: String,
					icon_url: String,
					proxy_icon_url: String,
				},
				required: false,
			},
			footer: {
				type: {
					text: {type: String, required: true},
					icon_url: String,
					proxy_icon_url: String,
				},
				required: false,
			},
			timestamp: Number,
			image: {url: String, proxy_url: String},
			thumbnail: {url: String, proxy_url: String},
			fields: [
				{
					name: {type: String, required: true},
					value: {type: String, required: true},
					inline: Boolean,
				},
			],
		},
	],
	files: [
		{
			link: {type: String, required: true},
			name: {type: String, required: true},
			size: {type: Number, required: true},
			type: {type: String, required: true},
		},
	],
	// TODO: Properly type this later.
	components: [{components: []}],
});

export default model("Embed", EmbedSchema, "Embeds");
