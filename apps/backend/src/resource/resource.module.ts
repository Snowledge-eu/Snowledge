import { Module } from '@nestjs/common';
import { ResourceController } from './resource.controller';
import { ResourceProvider } from './resource.provider';
import { ResourceService } from './resource.service';
import { ResourceHelper } from './resource.helper';
import { XrplModule } from '../xrpl/xrpl.module';
import { UserModule } from '../user/user.module';
import { LearnerModule } from 'src/learner/learner.module';
import { CommunityModule } from 'src/community/community.module';

@Module({
	imports: [XrplModule, UserModule, LearnerModule, CommunityModule],
	controllers: [ResourceController],
	providers: [ResourceProvider, ResourceService, ResourceHelper],
	exports: [ResourceProvider],
})
export class ResourceModule {}
