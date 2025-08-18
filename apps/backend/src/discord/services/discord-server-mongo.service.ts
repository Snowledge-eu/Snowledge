import { Injectable } from '@nestjs/common';
import { DiscordServer } from '../schemas/discord-server.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class DiscordServerMongoService {
    constructor(
        @InjectModel(DiscordServer.name) private serverModel: Model<DiscordServer>,
    ) {}

    /**
     * Vérifie si un serveur existe dans la base de données
     */
    async exists(serverId: string): Promise<boolean> {
        const server = await this.serverModel
            .findOne({ _id: serverId })
            .setOptions({ sanitizeFilter: false })
            .lean()
            .exec();
        return !!server;
    }

    /**
     * Crée un nouveau serveur Discord dans la base de données
     */
    async create(serverData: {
        _id: string;
        name: string;
        user_id: number;
    }): Promise<DiscordServer> {
        const server = new this.serverModel({
            _id: serverData._id,
            name: serverData.name,
            user_id: serverData.user_id,
        });
        return server.save();
    }

    /**
     * Récupère un serveur par son ID
     */
    async findOne(serverId: string): Promise<DiscordServer | null> {
        return this.serverModel
            .findOne({ _id: serverId })
            .setOptions({ sanitizeFilter: false })
            .lean()
            .exec();
    }
}
