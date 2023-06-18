import {Schema, model} from "mongoose";

const TemporaryDataSchema = new Schema({
	_id: Schema.Types.ObjectId,
	type: {type: String, required: true},
	data: {type: Object, required: true},
	creationDate: {type: Number, default: Date.now},
	lifeSpan: {type: Number, required: true},
});

export default model("Temporary Data", TemporaryDataSchema, "Temporary Data");
