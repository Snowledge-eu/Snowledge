import { Injectable } from '@nestjs/common';
import { DiscordMessage } from '../schemas/discord-message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Long } from 'bson';

@Injectable()
export class DiscordMessageService {
    constructor(
        @InjectModel(DiscordMessage.name) private messageModel: Model<DiscordMessage>,
    ) {}

    findAll(): Promise<any> {
        return this.messageModel.find().lean().exec();
    }
    findAllById(id: string | Long) {
        const idChannel = typeof id === 'string' ? Long.fromString(id) : id

        return this.messageModel.find({channel_id: idChannel}).lean().exec();
    }
    async countMessageForDate(channelId: string | Long, date: Date): Promise<number> {
        const idChannel = typeof channelId === 'string' ? Long.fromString(channelId) : channelId
            const result = await this.messageModel.aggregate([
            {
            $match: {
                    channel_id: idChannel
                }
            },
            {
            $match: {
                    $expr: {
                    $eq: [
                            { $dateTrunc: { date: "$fetched_at", unit: "day" } },
                            { $dateTrunc: { date: date, unit: "day" } }
                        ]
                    }
                }
            },
            {
                $count: "count"
            }
        ]).exec();
        // console.log(result)
        // this.countMessageForDatebis(channelId, date)
        return result[0]?.count || 0;
    }

    countMessageForPeriod(channelId: string, startDate: Date): Promise<number> {
        const now = new Date();

        return this.messageModel
            .countDocuments({
                channel_id: Long.fromString(channelId),
                fetched_at: { $gte: startDate, $lte: now}
            })
            .exec();
    }
}
