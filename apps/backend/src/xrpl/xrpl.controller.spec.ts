import { Test, TestingModule } from '@nestjs/testing';
import { XrplController } from './xrpl.controller';
import { XrplService } from './xrpl.service';

describe('XrplController', () => {
  let controller: XrplController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [XrplController],
      providers: [XrplService],
    }).compile();

    controller = module.get<XrplController>(XrplController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
