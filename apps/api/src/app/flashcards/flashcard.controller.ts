import { Controller, Get } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';

@Controller('flashcards')
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Get('species')
  async getSpeciesForSession() {
    return this.flashcardService.getSpeciesForSession();
  }
}
