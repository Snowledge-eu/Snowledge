import { ApiProperty, getSchemaPath, OmitType } from '@nestjs/swagger';
import { SignUpDto } from '../../auth/dto';
import {
    IsDate,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Gender } from 'src/shared/enums/Gender';
import { DiscordAccess } from 'src/discord/entities/discord-access.entity';

export class AddExpertiseUserDto {
    @IsString()
    @ApiProperty({ type: String })
    @IsOptional()
    expertise?: string;
}
