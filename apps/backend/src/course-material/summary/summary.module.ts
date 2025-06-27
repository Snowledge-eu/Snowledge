import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { SummaryResult, SummaryResultSchema } from './schemas/summary.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: SummaryResult.name, schema: SummaryResultSchema }])],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
