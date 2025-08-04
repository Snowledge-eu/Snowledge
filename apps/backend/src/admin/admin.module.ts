import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminProvider } from './admin.provider';
import { CommunityModule } from '../community/community.module';
import { DiscordModule } from '../discord/discord.module';
import { UserModule } from '../user/user.module';
import { AdminGuard } from '../auth/admin.guard';

@Module({
	imports: [CommunityModule, DiscordModule, UserModule],
	controllers: [AdminController],
	providers: [AdminProvider, AdminGuard],
	exports: [AdminProvider],
})
export class AdminModule {}
