import mongoose, {Schema, model} from "mongoose";

export interface ITemporaryDataSchema<D> {
	_id: mongoose.Types.ObjectId;
	type: string;
	data: D;
	creationDate?: number;
	lifeSpan: number;
}

const TemporaryDataSchema = new Schema<ITemporaryDataSchema<unknown>>({
	_id: mongoose.Types.ObjectId,
	type: {type: String, required: true},
	data: Schema.Types.Mixed,
	creationDate: {type: Number, default: Date.now},
	lifeSpan: {type: Number, required: true},
});

export default model("Temporary Data", TemporaryDataSchema, "Temporary Data");
