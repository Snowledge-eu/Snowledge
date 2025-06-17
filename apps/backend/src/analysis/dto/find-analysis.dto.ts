import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class FindAnalysisDto {
    @ApiProperty({
        type: String,
    })
    @IsString()
    platform: string;

    scope: Record<string, any>;
}
