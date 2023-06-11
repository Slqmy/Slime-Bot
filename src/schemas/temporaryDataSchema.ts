import {Schema, model} from "mongoose";

const TemporaryDataSchema = new Schema({
	_id: Schema.Types.ObjectId,
	type: String,
	data: Object,
	creationDate: Number,
	lifeSpan: Number,
});

export default model("Temporary Data", TemporaryDataSchema, "Temporary Data");
