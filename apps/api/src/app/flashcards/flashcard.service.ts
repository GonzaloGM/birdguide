import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashcardReviewEntity } from '../entities/flashcard-review.entity';
import { UserSpeciesProgressEntity } from '../entities/user-species-progress.entity';
import { BadgeEntity } from '../entities/badge.entity';
import { UserBadgeEntity } from '../entities/user-badge.entity';
import { EventEntity } from '../entities/event.entity';
import { FlashcardSessionEntity } from '../entities/flashcard-session.entity';
import { SpeciesEntity } from '../entities/species.entity';

type ReviewData = {
  speciesId: number;
  result: 'correct' | 'incorrect';
};

type SessionData = {
  speciesIds: number[];
};

@Injectable()
export class FlashcardService {
  constructor(
    @InjectRepository(FlashcardReviewEntity)
    private reviewRepository: Repository<FlashcardReviewEntity>,
    @InjectRepository(UserSpeciesProgressEntity)
    private progressRepository: Repository<UserSpeciesProgressEntity>,
    @InjectRepository(BadgeEntity)
    private badgeRepository: Repository<BadgeEntity>,
    @InjectRepository(UserBadgeEntity)
    private userBadgeRepository: Repository<UserBadgeEntity>,
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(FlashcardSessionEntity)
    private sessionRepository: Repository<FlashcardSessionEntity>,
    @InjectRepository(SpeciesEntity)
    private speciesRepository: Repository<SpeciesEntity>
  ) {}
  async getSpeciesForSession() {
    return this.speciesRepository.find({
      select: ['id', 'scientificName', 'eBirdId'],
      take: 10, // Limit to 10 species for a session
    });
  }

  async submitReview(reviewData: ReviewData, userId: number) {
    // Create review record
    const review = this.reviewRepository.create({
      userId,
      speciesId: reviewData.speciesId,
      result: reviewData.result,
      reviewedAt: new Date(),
    });
    await this.reviewRepository.save(review);

    // Update or create user species progress
    let progress = await this.progressRepository.findOne({
      where: { userId, speciesId: reviewData.speciesId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        speciesId: reviewData.speciesId,
        timesSeen: 1,
        timesCorrect: reviewData.result === 'correct' ? 1 : 0,
        accuracy: reviewData.result === 'correct' ? 1.0 : 0.0,
        masteryLevel: 1,
        isMastered: false,
        lastSeen: new Date(),
      });
    } else {
      progress.timesSeen += 1;
      if (reviewData.result === 'correct') {
        progress.timesCorrect += 1;
      }
      progress.accuracy = progress.timesCorrect / progress.timesSeen;
      progress.lastSeen = new Date();

      // Update mastery level based on accuracy
      if (progress.accuracy >= 0.8 && progress.timesSeen >= 5) {
        progress.masteryLevel = Math.min(5, progress.masteryLevel + 1);
        progress.isMastered = progress.masteryLevel >= 5;
      }
    }

    await this.progressRepository.save(progress);

    // Log event
    const event = this.eventRepository.create({
      userId,
      eventType: 'flashcard_review',
      data: { speciesId: reviewData.speciesId, result: reviewData.result },
      timestamp: new Date(),
    });
    await this.eventRepository.save(event);

    // Check for badge awards
    const badgesAwarded = await this.checkAndAwardBadges(userId);

    return {
      success: true,
      badgesAwarded,
    };
  }

  async startSession(sessionData: SessionData, userId: number) {
    const session = this.sessionRepository.create({
      userId,
      speciesIds: sessionData.speciesIds,
      startedAt: new Date(),
    });
    const savedSession = await this.sessionRepository.save(session);

    // Log session start event
    const event = this.eventRepository.create({
      userId,
      eventType: 'session_started',
      data: { sessionId: savedSession.id, speciesIds: sessionData.speciesIds },
      timestamp: new Date(),
    });
    await this.eventRepository.save(event);

    return { sessionId: savedSession.id.toString() };
  }

  async getProgress(userId: number) {
    const progressRecords = await this.progressRepository.find({
      where: { userId },
    });

    const totalSpecies = progressRecords.length;
    const masteredSpecies = progressRecords.filter((p) => p.isMastered).length;
    const totalCorrect = progressRecords.reduce(
      (sum, p) => sum + p.timesCorrect,
      0
    );
    const totalSeen = progressRecords.reduce((sum, p) => sum + p.timesSeen, 0);
    const accuracy =
      totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0;

    return {
      totalSpecies,
      masteredSpecies,
      accuracy,
    };
  }

  async getBadges(userId: number) {
    const badges = await this.badgeRepository.find();
    const userBadges = await this.userBadgeRepository.find({
      where: { userId },
      relations: ['badge'],
    });

    const userBadgeMap = new Map(
      userBadges.map((ub) => [ub.badgeId, ub.earnedAt])
    );

    return badges.map((badge) => ({
      id: badge.id,
      name: badge.name,
      title: badge.title,
      description: badge.description,
      earned: userBadgeMap.has(badge.id),
      earnedAt: userBadgeMap.get(badge.id)?.toISOString() || null,
    }));
  }

  private async checkAndAwardBadges(userId: number) {
    const badgesAwarded = [];

    // Check for first review badge
    const reviewCount = await this.reviewRepository.count({
      where: { userId },
    });
    if (reviewCount === 1) {
      const firstReviewBadge = await this.badgeRepository.findOne({
        where: { name: 'first_review' },
      });

      if (firstReviewBadge) {
        const existingUserBadge = await this.userBadgeRepository.findOne({
          where: { userId, badgeId: firstReviewBadge.id },
        });

        if (!existingUserBadge) {
          const userBadge = this.userBadgeRepository.create({
            userId,
            badgeId: firstReviewBadge.id,
            earnedAt: new Date(),
          });
          await this.userBadgeRepository.save(userBadge);

          badgesAwarded.push({
            id: firstReviewBadge.id,
            name: firstReviewBadge.name,
            title: firstReviewBadge.title,
            description: firstReviewBadge.description,
          });

          // Log badge earned event
          const event = this.eventRepository.create({
            userId,
            eventType: 'badge_earned',
            data: {
              badgeId: firstReviewBadge.id,
              badgeName: firstReviewBadge.name,
            },
            timestamp: new Date(),
          });
          await this.eventRepository.save(event);
        }
      }
    }

    // Check for other badges (ten_correct, three_day_streak, etc.)
    // This would be implemented based on specific badge criteria

    return badgesAwarded;
  }
}
