import mongoose, {Schema, model} from "mongoose";

export interface ITemporaryDataSchema<D, M?> {
	_id: mongoose.Types.ObjectId;
	type: string;
	data: D;
 matchData?: M;
	creationDate?: number;
	lifeSpan: number;
}

const TemporaryDataSchema = new Schema<ITemporaryDataSchema<unknown, unknown>>({
	_id: {type: mongoose.Types.ObjectId, required: true},
	type: {type: String, required: true},
	data: {type: Schema.Types.Mixed, required: true},
 matchData: Schema.Types.Mixed,
	creationDate: {type: Number, default: Date.now},
	lifeSpan: {type: Number, required: true},
});

export default model("Temporary Data", TemporaryDataSchema, "Temporary Data");
