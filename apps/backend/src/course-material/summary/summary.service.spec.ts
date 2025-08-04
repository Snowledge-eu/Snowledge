import { Test, TestingModule } from '@nestjs/testing';
import { SummaryService } from './summary.service';
import { getModelToken } from '@nestjs/mongoose';
import { SummaryResult } from './schemas/summary.schema';

describe('SummaryService', () => {
  let service: SummaryService;
  let model: any;

  const mockSummaryModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    sort: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        {
          provide: getModelToken(SummaryResult.name),
          useValue: mockSummaryModel,
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
    model = module.get(getModelToken(SummaryResult.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a summary', async () => {
      const data = { foo: 'bar' };
      const saveMock = jest.fn().mockResolvedValue({ ...data, _id: 'id1' });
      const mockModelInstance = { save: saveMock };
      // Mock the constructor directly
      service['summaryModel'] = jest.fn(() => mockModelInstance) as any;
      const result = await service.create(data);
      expect(service['summaryModel']).toHaveBeenCalledWith(data);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual({ ...data, _id: 'id1' });
    });
  });

  describe('findAll', () => {
    it('should return all summaries', async () => {
      const summaries = [{ _id: '1' }, { _id: '2' }];
      model.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(summaries) });
      const result = await service.findAll();
      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual(summaries);
    });
  });

  describe('findOneByAnalysisIdAndTrendId', () => {
    it('should return a summary by analysisId and trendId', async () => {
      const summary = { _id: '1', platform: 'discord' };
      const execMock = jest.fn().mockResolvedValue(summary);
      const leanMock = jest.fn().mockReturnValue({ exec: execMock });
      const sortMock = jest.fn().mockReturnValue({ lean: leanMock });
      model.findOne.mockReturnValue({ sort: sortMock });
      const result = await service.findOneByAnalysisIdAndTrendId('analyseId', 2);
      expect(model.findOne).toHaveBeenCalledWith({
        platform: 'discord',
        source_analysis_id: 'analyseId',
        'scope.trend_id': { $exists: true, $eq: 2 },
        prompt_key: 'trend_to_content',
      });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(leanMock).toHaveBeenCalled();
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(summary);
    });
  });

  describe('update', () => {
    it('should return update message', () => {
      const result = service.update(1, { platform: 'discord' } as any);
      expect(result).toBe('This action updates a #1 summary');
    });
  });

  describe('remove', () => {
    it('should return remove message', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a #1 summary');
    });
  });
});
