import { Injectable } from '@nestjs/common';
import { DiscordMessage } from '../schemas/discord-message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Long } from 'bson';

@Injectable()
export class DiscordMessageService {
	constructor(
		@InjectModel(DiscordMessage.name)
		private messageModel: Model<DiscordMessage>,
	) {}

	findAll(): Promise<any> {
		return this.messageModel.find().lean().exec();
	}
	findAllById(id: string | Long) {
		const idChannel = typeof id === 'string' ? Long.fromString(id) : id;

		return this.messageModel.find({ channel_id: idChannel }).lean();
	}
	async countMessageForDate(
		channelId: string | Long,
		date: Date,
	): Promise<number> {
		const idChannel =
			typeof channelId === 'string'
				? Long.fromString(channelId)
				: channelId;
		const result = await this.messageModel
			.aggregate([
				{
					$match: {
						channel_id: idChannel,
					},
				},
				{
					$match: {
						$expr: {
							$eq: [
								{
									$dateTrunc: {
										date: '$created_at_by_discord',
										unit: 'day',
									},
								},
								{ $dateTrunc: { date: date, unit: 'day' } },
							],
						},
					},
				},
				{
					$count: 'count',
				},
			])
			.exec();
		// console.log(result)
		// this.countMessageForDatebis(channelId, date)
		return result[0]?.count || 0;
	}
	async findMessagesInRange(
		channelId: string,
		from: Date,
		to: Date,
	): Promise<any[]> {
		return this.messageModel
			.find({
				channel_id: Long.fromString(channelId),
				created_at_by_discord: { $gte: from, $lte: to },
			})
			.lean()
			.exec();
	}
	countMessageForPeriod(channelId: string, startDate: Date): Promise<number> {
		const now = new Date();

		return this.messageModel
			.countDocuments({
				channel_id: Long.fromString(channelId),
				created_at_by_discord: { $gte: startDate, $lte: now },
			})
			.exec();
	}

	async findHarvestedChannelIds(channelIds: string[]): Promise<string[]> {
		const longIds = channelIds.map((id) => Long.fromString(id));

		const results: string[] = await this.messageModel.distinct(
			'channel_id',
			{
				channel_id: { $in: longIds },
			},
		);

		return results.map((id) => id.toString());
	}

	/**
	 * Anonymise un message en masquant les informations personnelles
	 * Compatible avec la structure author_name/author_user_id du DiscordHelper
	 */
	private anonymizeMessage(message: any): any {
		return {
			...message,
			author_name: 'Utilisateur Anonyme',
			author_user_id: message.author_user_id
				? `anonymous_${message.author_user_id}`
				: 'anonymous_unknown',
		};
	}

	/**
	 * Sauvegarde les messages en anonymisant ceux des utilisateurs qui n'ont pas accepté les termes
	 * Compatible avec la structure author_name/author_user_id du DiscordHelper
	 */
	async saveIfNewWithTermsCheck(
		messages: any[],
		acceptedUserIds: Set<string>,
	): Promise<number> {
		if (!messages.length) return 0;

		const ids = messages.map((m) => m.id);
		const existing = await this.messageModel
			.find({ _id: { $in: ids } }, { _id: 1 })
			.lean()
			.exec();
		const existingIds = new Set(existing.map((doc) => doc._id));

		const toInsert = messages
			.filter((m) => !existingIds.has(m.id))
			.map((m) => {
				const messageData = { ...m, _id: m.id };

				// Vérifier si l'utilisateur a accepté les termes
				const userId = m.author_user_id;
				if (userId && !acceptedUserIds.has(userId.toString())) {
					return this.anonymizeMessage(messageData);
				}

				return messageData;
			});

		if (toInsert.length) {
			await this.messageModel.insertMany(toInsert);
		}
		return toInsert.length;
	}

	async saveIfNew(messages: any[]): Promise<number> {
		if (!messages.length) return 0;
		const ids = messages.map((m) => m.id);
		const existing = await this.messageModel
			.find({ _id: { $in: ids } }, { _id: 1 })
			.lean()
			.exec();
		const existingIds = new Set(existing.map((doc) => doc._id));
		const toInsert = messages
			.filter((m) => !existingIds.has(m.id))
			.map((m) => ({ ...m, _id: m.id }));

		if (toInsert.length) {
			await this.messageModel.insertMany(toInsert);
		}
		return toInsert.length;
	}
}
