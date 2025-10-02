import { Controller, Get, Param } from '@nestjs/common';
import { SpeciesService, SpeciesWithCommonName } from './species.service';
import { PinoLoggerService } from '../services/logger.service';
import type { ApiResponse } from '@birdguide/shared-types';

@Controller('species')
export class SpeciesController {
  constructor(
    private readonly speciesService: SpeciesService,
    private readonly logger: PinoLoggerService
  ) {}

  @Get()
  async findAll(): Promise<ApiResponse<SpeciesWithCommonName[]>> {
    this.logger.infoWithContext('Species list request received', {
      operation: 'findAll',
    });

    try {
      const species = await this.speciesService.findAll();

      this.logger.infoWithContext('Species list request successful', {
        count: species.length,
      });

      return {
        success: true,
        data: species,
      };
    } catch (error) {
      this.logger.errorWithContext('Species list request failed', {
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch species',
      };
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string
  ): Promise<ApiResponse<SpeciesWithCommonName>> {
    const speciesId = parseInt(id, 10);

    if (isNaN(speciesId)) {
      return {
        success: false,
        error: 'Invalid species ID',
        message: 'Species ID must be a number',
      };
    }

    this.logger.infoWithContext('Species detail request received', {
      speciesId: speciesId,
    });

    try {
      const species = await this.speciesService.findOne(speciesId);

      if (!species) {
        this.logger.warnWithContext('Species not found', {
          speciesId: speciesId,
        });

        return {
          success: false,
          error: 'Species not found',
          message: 'Species not found',
        };
      }

      this.logger.infoWithContext('Species detail request successful', {
        speciesId: id,
      });

      return {
        success: true,
        data: species,
      };
    } catch (error) {
      this.logger.errorWithContext('Species detail request failed', {
        speciesId: speciesId,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch species',
      };
    }
  }
}
