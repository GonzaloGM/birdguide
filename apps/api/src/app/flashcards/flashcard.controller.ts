import { Controller, Get, Post, Body } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';

type ReviewData = {
  speciesId: number;
  result: 'correct' | 'incorrect';
};

type SessionData = {
  speciesIds: number[];
};

@Controller('flashcards')
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Get('species')
  async getSpeciesForSession() {
    return this.flashcardService.getSpeciesForSession();
  }

  @Post('review')
  async submitReview(@Body() reviewData: ReviewData) {
    return this.flashcardService.submitReview(reviewData);
  }

  @Post('session')
  async startSession(@Body() sessionData: SessionData) {
    return this.flashcardService.startSession(sessionData);
  }

  @Get('progress')
  async getProgress() {
    return this.flashcardService.getProgress();
  }

  @Get('badges')
  async getBadges() {
    return this.flashcardService.getBadges();
  }
}
