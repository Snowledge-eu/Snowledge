import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ChangePassword {
    // Token-based reset (forgot password)
    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    token?: string;

    // Backward compat: old field name used by forgot-password page
    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    password?: string;

    // Authenticated change fields
    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    currentPassword?: string;

    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    newPassword?: string;

    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    confirmPassword?: string;
}
