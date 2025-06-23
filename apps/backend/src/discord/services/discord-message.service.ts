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

    findAll() {
        return this.messageModel.find().exec();
    }
    countMessageForPeriod(channelId: string, startDate: Date): Promise<number> {
        const now = new Date();
        return this.messageModel
            .countDocuments({
                channel_id: channelId,
                fetched_at: { $gte: startDate, $lte: now}
            })
            .exec();
    }
}
