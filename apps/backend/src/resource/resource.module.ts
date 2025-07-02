import { Module } from '@nestjs/common';
import { ResourceController } from './resource.controller';
import { ResourceProvider } from './resource.provider';
import { ResourceService } from './resource.service';
import { ResourceHelper } from './resource.helper';
import { XrplModule } from '../xrpl/xrpl.module';
import { UserModule } from '../user/user.module';

@Module({
	imports: [XrplModule, UserModule],
	controllers: [ResourceController],
	providers: [ResourceProvider, ResourceService, ResourceHelper],
	exports: [ResourceProvider],
})
export class ResourceModule {}
