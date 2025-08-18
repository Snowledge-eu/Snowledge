import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

export type DiscordChannelDocument = DiscordChannel & Document;
@Schema({
	collection: 'discord_channels',
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class DiscordChannel {
	@Prop({ type: String, required: true })
	_id: string;

	@Prop({ required: true })
	name: string;

	@Prop({ type: String, required: true })
	server_id: string;
}
export const DiscordChannelSchema = SchemaFactory.createForClass(DiscordChannel);