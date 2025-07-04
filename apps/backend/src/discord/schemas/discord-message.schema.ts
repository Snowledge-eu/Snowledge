import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { Long } from 'bson';

export type DiscordMessageDocument = DiscordMessage & Document;
@Schema({
	collection: 'discord_messages',
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class DiscordMessage {
	@Transform(({ value }) => value.toString())
	@Prop({ type: Object, required: true })
	_id: Long;

	@Prop({ type: Number, required: true })
	user_id: number;

	@Prop()
	content?: string;

	@Transform(({ value }) => value.toString())
	@Prop({ type: Object, required: true })
	channel_id: Long;

	@Prop({ type: Number })
	parent_message_id?: number;

	@Prop()
	fetched_at?: Date;
}
export const DiscordMessageSchema = SchemaFactory.createForClass(DiscordMessage);