import { ApiProperty, getSchemaPath, OmitType } from '@nestjs/swagger';
import { SignUpDto } from '../../auth/dto';
import {
    ArrayNotEmpty,
    IsArray,
    IsNumber,
    IsString,
} from 'class-validator';
import { Gender } from 'src/shared/enums/Gender';
import { DiscordAccess } from 'src/discord/entities/discord-access.entity';

export class FindContributorDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true})
    expertises: string[];

    @IsNumber()
    communityId: number;
}
