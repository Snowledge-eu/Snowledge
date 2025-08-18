import { Injectable } from '@nestjs/common';
import { DiscordChannel } from '../schemas/discord-channel.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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
            .findOne({_id: id})
            .setOptions({ sanitizeFilter: false })
            .lean()
            .exec();
    }

    /**
     * Vérifie si un canal existe dans la base de données
     */
    async exists(channelId: string): Promise<boolean> {
        const channel = await this.channelModel
            .findOne({ _id: channelId })
            .setOptions({ sanitizeFilter: false })
            .lean()
            .exec();
        return !!channel;
    }

    /**
     * Crée un nouveau canal Discord dans la base de données
     */
    async create(channelData: {
        _id: string;
        name: string;
        server_id: string;
    }): Promise<DiscordChannel> {
        const channel = new this.channelModel({
            _id: channelData._id,
            name: channelData.name,
            server_id: channelData.server_id,
        });
        return channel.save();
    }

}
