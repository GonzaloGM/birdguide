import { Test, TestingModule } from '@nestjs/testing';
import { SpeciesService } from './species.service';
import { SpeciesRepository } from '../repositories/species.repository';
import { PinoLoggerService } from '../services/logger.service';
import type { Species, SpeciesCommonName } from '@birdguide/shared-types';

describe('SpeciesService', () => {
  let service: SpeciesService;
  let repository: SpeciesRepository;

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
      providers: [
        SpeciesService,
        {
          provide: SpeciesRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findCommonNamesBySpeciesId: jest.fn(),
            findCommonNamesBySpeciesIds: jest.fn(),
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

    service = module.get<SpeciesService>(SpeciesService);
    repository = module.get<SpeciesRepository>(SpeciesRepository);
  });

  describe('findAll', () => {
    it('should return species with their common names', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([mockSpecies]);
      jest
        .spyOn(repository, 'findCommonNamesBySpeciesIds')
        .mockResolvedValue([mockCommonName]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockSpecies,
        commonName: 'American Robin',
      });
      expect(repository.findAll).toHaveBeenCalled();
      expect(repository.findCommonNamesBySpeciesIds).toHaveBeenCalledWith([1]);
    });

    it('should return species without common name when none exists', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([mockSpecies]);
      jest
        .spyOn(repository, 'findCommonNamesBySpeciesIds')
        .mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockSpecies,
        commonName: null,
      });
    });

    it('should return empty array when no species exist', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(repository.findCommonNamesBySpeciesIds).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      jest
        .spyOn(repository, 'findAll')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return species with common name by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockSpecies);
      jest
        .spyOn(repository, 'findCommonNamesBySpeciesId')
        .mockResolvedValue([mockCommonName]);

      const result = await service.findOne(1);

      expect(result).toEqual({
        ...mockSpecies,
        commonName: 'American Robin',
      });
      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(repository.findCommonNamesBySpeciesId).toHaveBeenCalledWith(1);
    });

    it('should return null when species not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
      expect(repository.findCommonNamesBySpeciesId).not.toHaveBeenCalled();
    });

    it('should return species without common name when none exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockSpecies);
      jest
        .spyOn(repository, 'findCommonNamesBySpeciesId')
        .mockResolvedValue([]);

      const result = await service.findOne(1);

      expect(result).toEqual({
        ...mockSpecies,
        commonName: null,
      });
    });

    it('should handle repository errors', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('species-123')).rejects.toThrow(
        'Database error'
      );
    });
  });
});
