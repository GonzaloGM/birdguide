import { Test, TestingModule } from '@nestjs/testing';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';
import { PinoLoggerService } from '../services/logger.service';
import type {
  Species,
  SpeciesCommonName,
  ApiResponse,
} from '@birdguide/shared-types';

describe('SpeciesController', () => {
  let controller: SpeciesController;
  let service: SpeciesService;

  const mockSpecies: Species = {
    id: 1,
    scientificName: 'Turdus migratorius',
    eBirdId: 'amerob',
    genus: 'Turdus',
    family: 'Turdidae',
    orderName: 'Passeriformes',
    iucnStatus: 'LC',
    sizeMm: 250,
    summary: 'A common North American thrush',
    rangeMapUrl: 'https://example.com/range-map.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCommonName: SpeciesCommonName = {
    id: 1,
    speciesId: 1,
    langCode: 'en-US',
    commonName: 'American Robin',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeciesController],
      providers: [
        {
          provide: SpeciesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: PinoLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
            info: jest.fn(),
            infoWithContext: jest.fn(),
            errorWithContext: jest.fn(),
            warnWithContext: jest.fn(),
            debugWithContext: jest.fn(),
            child: jest.fn().mockReturnThis(),
          },
        },
      ],
    }).compile();

    controller = module.get<SpeciesController>(SpeciesController);
    service = module.get<SpeciesService>(SpeciesService);
  });

  describe('GET /species', () => {
    it('should return a list of species with common names', async () => {
      const mockSpeciesWithCommonName = {
        ...mockSpecies,
        commonName: mockCommonName.commonName,
      };

      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue([mockSpeciesWithCommonName]);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toEqual(mockSpeciesWithCommonName);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no species exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle service errors gracefully', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new Error('Database error'));

      const result = await controller.findAll();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.message).toBe('Failed to fetch species');
    });
  });

  describe('GET /species/:id', () => {
    it('should return a single species with common name', async () => {
      const mockSpeciesWithCommonName = {
        ...mockSpecies,
        commonName: mockCommonName.commonName,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockSpeciesWithCommonName);

      const result = await controller.findOne('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSpeciesWithCommonName);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 404 when species not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Species not found');
      expect(result.message).toBe('Species not found');
    });

    it('should return error for invalid species ID', async () => {
      const result = await controller.findOne('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid species ID');
      expect(result.message).toBe('Species ID must be a number');
    });

    it('should handle service errors gracefully', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      const result = await controller.findOne('1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.message).toBe('Failed to fetch species');
    });
  });
});
