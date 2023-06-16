import {Schema, model} from "mongoose";

const UserDataSchema = new Schema({
	id: String,
	// Experience is stored, and an inverse function is used to find the level.
	experience: {
		type: Object,
		of: {
			experience: Number,
			lastMessageTimestamp: Number,
		},
	},
});

export default model("User Data", UserDataSchema, "User Data");
