import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose, { Document, ObjectId, Types } from 'mongoose';
import { Long } from 'bson';

export type SummaryResultDocument = SummaryResult & Document;
@Schema({
    collection: 'summary_results',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
})
export class SummaryResult {
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

    @Prop({ type: mongoose.Schema.Types.ObjectId, })
    source_analysis_id: ObjectId;

    @Prop({ type: Object })
    @Transform(({ value }) => {
    if (!value) return value;
        return {
            ...value,
            trend_id: Number(value.trend_id),
            trend_title: value.selected_trend?.toString(),
        };
    })
    scope?: Record<string, any>;

    @Prop({ type: Object })
    period?: Record<string, any>;

    @Prop({ required: true, type: Object })
    result: Record<string, any>;
}
export const SummaryResultSchema = SchemaFactory.createForClass(SummaryResult);