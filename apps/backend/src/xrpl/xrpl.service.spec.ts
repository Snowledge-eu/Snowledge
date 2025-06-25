import { Test, TestingModule } from '@nestjs/testing';
import { XrplService } from './xrpl.service';

describe('XrplService', () => {
  let service: XrplService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XrplService],
    }).compile();

    service = module.get<XrplService>(XrplService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
