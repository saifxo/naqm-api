import { Test, TestingModule } from '@nestjs/testing';
import { LstmService } from './lstm.service';

describe('LstmService', () => {
  let service: LstmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LstmService],
    }).compile();

    service = module.get<LstmService>(LstmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
