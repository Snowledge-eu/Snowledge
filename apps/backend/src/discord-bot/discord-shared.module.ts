import { Module } from '@nestjs/common';
import { DiscordClientService } from './services/discord-client.service';
import { DiscordCommandService } from './services/discord-command.service';
import { MyNftCommand } from './commands/mynft.command';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [UserModule],
	providers: [DiscordClientService, DiscordCommandService, MyNftCommand],
	exports: [DiscordClientService, DiscordCommandService],
})
export class DiscordSharedModule {}
