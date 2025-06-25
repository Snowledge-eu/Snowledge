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

	@Prop({ type: Object, required: true })
	@Transform(({ value }) => value.toString())
	serverId: Long;

	@Prop({ type: [Object], required: true })
	@Transform(({ value }) => value.map((v) => v.toString()))
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

	@Prop()
	created_at: Date;

	@Prop()
	updated_at: Date;

}
export const DiscordHarvestJobSchema = SchemaFactory.createForClass(DiscordHarvestJob);