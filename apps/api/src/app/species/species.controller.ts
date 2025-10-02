import { Controller, Get, Param, Query } from '@nestjs/common';
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
  async findAll(
    @Query('lang') lang?: string
  ): Promise<ApiResponse<SpeciesWithCommonName[]>> {
    const language = lang || 'es-AR';

    this.logger.infoWithContext('Species list request received', {
      operation: 'findAll',
      language,
    });

    try {
      const species = await this.speciesService.findAll(language);

      this.logger.infoWithContext('Species list request successful', {
        count: species.length,
        language,
      });

      return {
        success: true,
        data: species,
      };
    } catch (error) {
      this.logger.errorWithContext('Species list request failed', {
        error: error.message,
        language,
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
    @Param('id') id: string,
    @Query('lang') lang?: string
  ): Promise<ApiResponse<SpeciesWithCommonName>> {
    const speciesId = parseInt(id, 10);
    const language = lang || 'es-AR';

    if (isNaN(speciesId)) {
      return {
        success: false,
        error: 'Invalid species ID',
        message: 'Species ID must be a number',
      };
    }

    this.logger.infoWithContext('Species detail request received', {
      speciesId: speciesId,
      language,
    });

    try {
      const species = await this.speciesService.findOne(speciesId, language);

      if (!species) {
        this.logger.warnWithContext('Species not found', {
          speciesId: speciesId,
          language,
        });

        return {
          success: false,
          error: 'Species not found',
          message: 'Species not found',
        };
      }

      this.logger.infoWithContext('Species detail request successful', {
        speciesId: id,
        language,
      });

      return {
        success: true,
        data: species,
      };
    } catch (error) {
      this.logger.errorWithContext('Species detail request failed', {
        speciesId: speciesId,
        language,
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
