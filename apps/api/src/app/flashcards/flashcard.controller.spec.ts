import { Test, TestingModule } from '@nestjs/testing';
import { FlashcardController } from './flashcard.controller';
import { FlashcardService } from './flashcard.service';

describe('FlashcardController', () => {
  let controller: FlashcardController;
  let service: FlashcardService;

  const mockFlashcardService = {
    getSpeciesForSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlashcardController],
      providers: [
        {
          provide: FlashcardService,
          useValue: mockFlashcardService,
        },
      ],
    }).compile();

    controller = module.get<FlashcardController>(FlashcardController);
    service = module.get<FlashcardService>(FlashcardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSpeciesForSession', () => {
    it('should return species for flashcard session', async () => {
      const mockSpecies = [
        { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
        { id: 2, scientificName: 'Turdus migratorius', eBirdId: 'amerob' },
      ];

      mockFlashcardService.getSpeciesForSession.mockResolvedValue(mockSpecies);

      const result = await controller.getSpeciesForSession();

      expect(service.getSpeciesForSession).toHaveBeenCalled();
      expect(result).toEqual(mockSpecies);
    });
  });
});
