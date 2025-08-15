import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, IsInt, ArrayMaxSize, IsArray } from "class-validator";

export class CreateSnowTestRegisterDto {
        @ApiProperty({
            type: String,
        })
        @IsString()
        firstname: string;
    
        @ApiProperty({
            type: String,
        })
        @IsString()
        lastname: string;
    
        @ApiProperty({
            type: String,
        })
        @IsString()
        expertise: string;

        @ApiProperty({
            type: String,
        })
        @IsInt()
        communitySize: number;

        @ApiProperty({
            type: [String],
            maxItems: 5,
        })
        @IsArray()
        @ArrayMaxSize(5)
        platforms: string[];

        @ApiProperty({
            type: String,
        })
        @IsEmail()
        email: string;
      
        @ApiProperty({
            type: String,
        })
        @IsString()
        @IsOptional()
        referrer?: string;
}
