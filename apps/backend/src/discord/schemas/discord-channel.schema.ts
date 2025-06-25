import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { Long } from 'bson';

export type DiscordChannelDocument = DiscordChannel & Document;
@Schema({
	collection: 'discord_channels',
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class DiscordChannel {
	@Prop({ type: Object, required: true })
	@Transform(({ value }) => value.toString())
	_id: Long;

	@Prop({ required: true })
	name: string;

	@Transform(({ value }) => value.toString())
	@Prop({ type: Object, required: true })
	server_id: Long;
}
export const DiscordChannelSchema = SchemaFactory.createForClass(DiscordChannel);