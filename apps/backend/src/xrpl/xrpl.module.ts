import { Module } from '@nestjs/common';
import { XrplService } from './xrpl.service';
import { XrplController } from './xrpl.controller';
import { XrplProvider } from './xrpl.provider';
import { XrplHelper } from './xrpl.helper';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [UserModule],
	controllers: [XrplController],
	providers: [XrplService, XrplProvider, XrplHelper],
	exports: [XrplService, XrplProvider],
})
export class XrplModule {}
