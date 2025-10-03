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
    // TODO: Get userId from JWT token in real implementation
    const userId = 123; // Mock userId for now
    return this.flashcardService.submitReview(reviewData, userId);
  }

  @Post('session')
  async startSession(@Body() sessionData: SessionData) {
    // TODO: Get userId from JWT token in real implementation
    const userId = 123; // Mock userId for now
    return this.flashcardService.startSession(sessionData, userId);
  }

  @Get('progress')
  async getProgress() {
    // TODO: Get userId from JWT token in real implementation
    const userId = 123; // Mock userId for now
    return this.flashcardService.getProgress(userId);
  }

  @Get('badges')
  async getBadges() {
    // TODO: Get userId from JWT token in real implementation
    const userId = 123; // Mock userId for now
    return this.flashcardService.getBadges(userId);
  }
}
