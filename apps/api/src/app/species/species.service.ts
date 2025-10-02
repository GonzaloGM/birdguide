import { Injectable } from '@nestjs/common';
import { SpeciesRepository } from '../repositories/species.repository';
import { PinoLoggerService } from '../services/logger.service';
import type { Species, SpeciesCommonName } from '@birdguide/shared-types';

export type SpeciesWithCommonName = Species & {
  commonName: string | null;
};

@Injectable()
export class SpeciesService {
  constructor(
    private readonly speciesRepository: SpeciesRepository,
    private readonly logger: PinoLoggerService
  ) {}

  async findAll(langCode: string = 'es-AR'): Promise<SpeciesWithCommonName[]> {
    this.logger.infoWithContext('Fetching all species', {
      operation: 'findAll',
      langCode,
    });

    try {
      const species = await this.speciesRepository.findAll();

      if (species.length === 0) {
        this.logger.infoWithContext('No species found in database', {
          count: 0,
        });
        return [];
      }

      // Batch fetch all common names for all species
      const speciesIds = species.map((s) => s.id);
      const allCommonNames =
        await this.speciesRepository.findCommonNamesBySpeciesIds(speciesIds);

      // Filter common names by language and group by species ID
      const commonNamesBySpeciesId = allCommonNames
        .filter((commonName) => commonName.langCode === langCode)
        .reduce((acc, commonName) => {
          if (!acc[commonName.speciesId]) {
            acc[commonName.speciesId] = [];
          }
          acc[commonName.speciesId].push(commonName);
          return acc;
        }, {} as Record<string, SpeciesCommonName[]>);

      const speciesWithCommonNames = species.map((specie) => {
        const commonNames = commonNamesBySpeciesId[specie.id] || [];
        // Just take the first common name if available
        const firstCommonName = commonNames[0];

        return {
          ...specie,
          commonName: firstCommonName?.commonName || null,
        };
      });

      // Sort species by common name alphabetically
      const sortedSpecies = speciesWithCommonNames.sort((a, b) => {
        const nameA = a.commonName || '';
        const nameB = b.commonName || '';
        return nameA.localeCompare(nameB);
      });

      this.logger.infoWithContext('Successfully fetched species', {
        count: sortedSpecies.length,
      });

      return sortedSpecies;
    } catch (error) {
      this.logger.errorWithContext('Failed to fetch species', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async findOne(id: number): Promise<SpeciesWithCommonName | null> {
    this.logger.infoWithContext('Fetching species by id', {
      speciesId: id,
    });

    try {
      const specie = await this.speciesRepository.findOne(id);

      if (!specie) {
        this.logger.warnWithContext('Species not found', {
          speciesId: id,
        });
        return null;
      }

      const commonNames =
        await this.speciesRepository.findCommonNamesBySpeciesId(id);
      // Just take the first common name if available
      const firstCommonName = commonNames[0];

      const speciesWithCommonName = {
        ...specie,
        commonName: firstCommonName?.commonName || null,
      };

      this.logger.infoWithContext('Successfully fetched species', {
        speciesId: id,
        hasCommonName: !!speciesWithCommonName.commonName,
      });

      return speciesWithCommonName;
    } catch (error) {
      this.logger.errorWithContext('Failed to fetch species', {
        speciesId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
