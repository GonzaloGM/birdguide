import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Species, User, ApiResponse } from '@birdguide/shared-types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('species')
  getSpecies(): ApiResponse<Species[]> {
    const species: Species[] = [
      {
        id: '1',
        scientificName: 'Turdus migratorius',
        genus: 'Turdus',
        family: 'Turdidae',
        orderName: 'Passeriformes',
        iucnStatus: 'LC',
        sizeMm: 250,
        summary: 'A common North American songbird',
        rangeMapUrl: 'https://example.com/range-map.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return {
      success: true,
      data: species,
    };
  }
}
