import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose, { Document, ObjectId, Types } from 'mongoose';

export type AnalysisResultDocument = AnalysisResult & Document;
@Schema({
	collection: 'analysis_results',
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class AnalysisResult {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;	
	
	@Prop({ type: Number, required: true })
	creator_id: number;

	@Prop({ required: true })
	platform: string;

	@Prop({ required: true })
	prompt_key: string;

	@Prop()
	llm_model?: string;

	@Prop({ type: Object })
	@Transform(({ value }) => {
	if (!value) return value;
		return {
			...value,
			server_id: value.server_id?.toString(),
			channel_id: value.channel_id?.toString(),
		};
	})
	scope?: Record<string, any>;

	@Prop({ type: Object })
	period?: Record<string, any>;

	@Prop({ required: true, type: Object })
	result: Record<string, any>;
}
export const AnalysisResultSchema = SchemaFactory.createForClass(AnalysisResult);