import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { SummaryResult, SummaryResultSchema } from './schemas/summary.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalysisModule } from 'src/analysis/analysis.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: SummaryResult.name, schema: SummaryResultSchema }]), AnalysisModule],
	controllers: [SummaryController],
	providers: [SummaryService],
	exports: [SummaryService],
})
export class SummaryModule {}
