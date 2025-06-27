import { Injectable } from '@nestjs/common';
import { DiscordChannel } from '../schemas/discord-channel.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Long } from 'bson';

@Injectable()
export class DiscordChannelService {
    constructor(
        @InjectModel(DiscordChannel.name) private channelModel: Model<DiscordChannel>,
    ) {}

    findAll(): Promise<any> {
        return this.channelModel.find().lean().exec();
    }

    findOne(id: string): Promise<DiscordChannel> {
        return this.channelModel
            .findOne({_id: Long.fromString(id)})
            .setOptions({ sanitizeFilter: false })
            .lean()
            .exec();
    }
}
