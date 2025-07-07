import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { Long } from 'bson';
import { string } from 'yaml/dist/schema/common/string';

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

	@Prop({ type: String, required: true })
	user_id: string;

	@Prop()
	content?: string;

	@Transform(({ value }) => value.toString())
	@Prop({ type: String, required: true })
	channel_id: string;

	@Prop({ type: String })
	parent_message_id?: string;

	@Prop()
	author_name?: string;

	@Prop()
	author_user_id?: string;

	@Prop()
	created_at_by_discord?: Date;
	
	@Prop()
	fetched_at?: Date;
}
export const DiscordMessageSchema = SchemaFactory.createForClass(DiscordMessage);

// 🔧 Middleware pour assigner `user_id` si absent
DiscordMessageSchema.pre('save', function (next) {
	if (!this.user_id && this.author_user_id) {
		this.user_id = this.author_user_id;
	}
	next();
});

// Pour insertMany (ex: batch)
DiscordMessageSchema.pre('insertMany', function (next, docs: DiscordMessageDocument[]) {
	for (const doc of docs) {
		if (!doc.user_id && doc.author_user_id) {
			doc.user_id = doc.author_user_id;
		}
	}
	next();
});