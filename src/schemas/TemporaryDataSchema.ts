import {Schema, model} from "mongoose";

interface ITemporaryDataSchema {
	_id: Schema.Types.ObjectId;
	type: string;
	data: {[key: string]: unknown};
	creationDate?: number;
	lifeSpan: number;
}

const TemporaryDataSchema = new Schema<ITemporaryDataSchema>({
	_id: Schema.Types.ObjectId,
	type: {type: String, required: true},
	data: {type: Object, required: true},
	creationDate: {type: Number, default: Date.now},
	lifeSpan: {type: Number, required: true},
});

export default model("Temporary Data", TemporaryDataSchema, "Temporary Data");
