import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { LearnerModule } from 'src/learner/learner.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), LearnerModule],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
