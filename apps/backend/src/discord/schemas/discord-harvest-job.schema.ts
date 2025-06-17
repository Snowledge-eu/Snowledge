import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { Long } from 'bson';

export type DiscordHarvestJobDocument = DiscordHarvestJob & Document;
@Schema({
	collection: 'discord_harvest_jobs',
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class DiscordHarvestJob {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;

	@Prop({ required: true })
	discordId: string;

	@Transform(({ value }) => value.toString())
	@Prop({ type: Object, required: true })
	serverId: Long;

	@Transform(({ value }) => value.map((v) => v.toString()))
	@Prop({ type: [Object], required: true })
	channels: Long[];

	@Prop()
	after?: string;

	@Prop()
	before?: string;

	@Prop({ enum: ['pending', 'running', 'completed', 'failed'], required: true })
	status: string;

	@Prop()
	finished_at?: Date;

	@Prop()
	inserted?: number;

	@Prop()
	error?: string;
}
export const DiscordHarvestJobSchema = SchemaFactory.createForClass(DiscordHarvestJob);