import { Module } from '@nestjs/common';
import { SnowTestRegisterService } from './snow-test-register.service';
import { SnowTestRegisterController } from './snow-test-register.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnowTestRegister } from './entities/snow-test-register.entity';
import { EmailModule } from '../email/email.module';
import { SnowTestRegisterProvider } from './snow-test-register.provider';

@Module({
  imports: [TypeOrmModule.forFeature([SnowTestRegister]), EmailModule],
  controllers: [SnowTestRegisterController],
  providers: [SnowTestRegisterProvider, SnowTestRegisterService],
})
export class SnowTestRegisterModule {}
