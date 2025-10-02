import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeciesEntity } from '../entities/species.entity';
import { SpeciesCommonNameEntity } from '../entities/species-common-name.entity';
import type { Species, SpeciesCommonName } from '@birdguide/shared-types';
import { PinoLoggerService } from '../services/logger.service';

@Injectable()
export class SpeciesRepository {
  constructor(
    @InjectRepository(SpeciesEntity)
    private speciesRepository: Repository<SpeciesEntity>,
    @InjectRepository(SpeciesCommonNameEntity)
    private commonNameRepository: Repository<SpeciesCommonNameEntity>,
    private readonly logger: PinoLoggerService
  ) {}

  async findAll(): Promise<Species[]> {
    this.logger.debug('Fetching all species', 'SpeciesRepository');

    const entities = await this.speciesRepository.find({
      order: { scientificName: 'ASC' },
    });

    return entities.map(this.mapEntityToSpecies);
  }

  async findOne(id: number): Promise<Species | null> {
    this.logger.debug('Fetching species by id', 'SpeciesRepository');

    const entity = await this.speciesRepository.findOne({
      where: { id },
    });

    return entity ? this.mapEntityToSpecies(entity) : null;
  }

  async findCommonNamesBySpeciesId(
    speciesId: number
  ): Promise<SpeciesCommonName[]> {
    this.logger.debug('Fetching common names for species', 'SpeciesRepository');

    const entities = await this.commonNameRepository.find({
      where: { speciesId },
      order: { isPreferred: 'DESC', commonName: 'ASC' },
    });

    return entities.map(this.mapCommonNameEntityToCommonName);
  }

  async findCommonNamesBySpeciesIds(
    speciesIds: number[]
  ): Promise<SpeciesCommonName[]> {
    this.logger.debug(
      'Batch fetching common names for species',
      'SpeciesRepository'
    );

    if (speciesIds.length === 0) {
      return [];
    }

    const entities = await this.commonNameRepository
      .createQueryBuilder('commonName')
      .where('commonName.speciesId IN (:...speciesIds)', { speciesIds })
      .orderBy('commonName.isPreferred', 'DESC')
      .addOrderBy('commonName.commonName', 'ASC')
      .getMany();

    return entities.map(this.mapCommonNameEntityToCommonName);
  }

  private mapEntityToSpecies(entity: SpeciesEntity): Species {
    return {
      id: entity.id,
      scientificName: entity.scientificName,
      eBirdId: entity.eBirdId,
      genus: entity.genus,
      family: entity.family,
      orderName: entity.orderName,
      iucnStatus: entity.iucnStatus,
      sizeMm: entity.sizeMm,
      summary: entity.summary,
      rangeMapUrl: entity.rangeMapUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private mapCommonNameEntityToCommonName(
    entity: SpeciesCommonNameEntity
  ): SpeciesCommonName {
    return {
      id: entity.id,
      speciesId: entity.speciesId,
      langCode: entity.langCode,
      commonName: entity.commonName,
      isPreferred: entity.isPreferred,
      notes: entity.notes,
    };
  }
}
