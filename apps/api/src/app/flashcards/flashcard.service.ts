import { Injectable } from '@nestjs/common';

@Injectable()
export class FlashcardService {
  async getSpeciesForSession() {
    // For now, return mock data
    return [
      { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
      { id: 2, scientificName: 'Turdus migratorius', eBirdId: 'amerob' },
      { id: 3, scientificName: 'Cardinalis cardinalis', eBirdId: 'norcar' },
    ];
  }
}
