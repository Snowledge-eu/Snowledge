import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { Long } from 'bson';

export type DiscordServerDocument = DiscordServer & Document;
@Schema({
	collection: 'discord_servers',
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class DiscordServer {
	@Transform(({ value }) => value.toString())
	@Prop({ type: Object, required: true })
	_id: Long;

	@Prop({ required: true })
	name: string;

	@Prop({ type: Number, required: true })
	user_id: number; // SQL user ID (foreign key)
}
export const DiscordServerSchema = SchemaFactory.createForClass(DiscordServer);