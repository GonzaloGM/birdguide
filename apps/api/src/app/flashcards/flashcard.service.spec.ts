import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { FlashcardService } from './flashcard.service';
import { FlashcardReviewEntity } from '../entities/flashcard-review.entity';
import { UserSpeciesProgressEntity } from '../entities/user-species-progress.entity';
import { BadgeEntity } from '../entities/badge.entity';
import { UserBadgeEntity } from '../entities/user-badge.entity';
import { EventEntity } from '../entities/event.entity';
import { FlashcardSessionEntity } from '../entities/flashcard-session.entity';
import { SpeciesEntity } from '../entities/species.entity';

describe('FlashcardService', () => {
  let service: FlashcardService;
  let reviewRepository: Repository<FlashcardReviewEntity>;
  let progressRepository: Repository<UserSpeciesProgressEntity>;
  let badgeRepository: Repository<BadgeEntity>;
  let userBadgeRepository: Repository<UserBadgeEntity>;
  let eventRepository: Repository<EventEntity>;
  let sessionRepository: Repository<FlashcardSessionEntity>;
  let speciesRepository: Repository<SpeciesEntity>;

  const mockReviewRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  } as any;

  const mockProgressRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  } as any;

  const mockBadgeRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  } as any;

  const mockUserBadgeRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  } as any;

  const mockEventRepository = {
    save: jest.fn(),
    create: jest.fn(),
  } as any;

  const mockSessionRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  } as any;

  const mockSpeciesRepository = {
    find: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashcardService,
        {
          provide: getRepositoryToken(FlashcardReviewEntity),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(UserSpeciesProgressEntity),
          useValue: mockProgressRepository,
        },
        {
          provide: getRepositoryToken(BadgeEntity),
          useValue: mockBadgeRepository,
        },
        {
          provide: getRepositoryToken(UserBadgeEntity),
          useValue: mockUserBadgeRepository,
        },
        {
          provide: getRepositoryToken(EventEntity),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(FlashcardSessionEntity),
          useValue: mockSessionRepository,
        },
        {
          provide: getRepositoryToken(SpeciesEntity),
          useValue: mockSpeciesRepository,
        },
      ],
    }).compile();

    service = module.get<FlashcardService>(FlashcardService);
    reviewRepository = module.get<Repository<FlashcardReviewEntity>>(
      getRepositoryToken(FlashcardReviewEntity)
    );
    progressRepository = module.get<Repository<UserSpeciesProgressEntity>>(
      getRepositoryToken(UserSpeciesProgressEntity)
    );
    badgeRepository = module.get<Repository<BadgeEntity>>(
      getRepositoryToken(BadgeEntity)
    );
    userBadgeRepository = module.get<Repository<UserBadgeEntity>>(
      getRepositoryToken(UserBadgeEntity)
    );
    eventRepository = module.get<Repository<EventEntity>>(
      getRepositoryToken(EventEntity)
    );
    sessionRepository = module.get<Repository<FlashcardSessionEntity>>(
      getRepositoryToken(FlashcardSessionEntity)
    );
    speciesRepository = module.get<Repository<SpeciesEntity>>(
      getRepositoryToken(SpeciesEntity)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitReview', () => {
    it('should create a new review record in the database', async () => {
      const reviewData = {
        speciesId: 1,
        result: 'correct' as const,
      };
      const userId = 123;

      const mockReview = {
        id: 1,
        userId,
        speciesId: 1,
        result: 'correct',
        reviewedAt: new Date(),
      };

      mockReviewRepository.create.mockReturnValue(mockReview);
      mockReviewRepository.save.mockResolvedValue(mockReview);
      mockReviewRepository.count.mockResolvedValue(0); // No previous reviews

      const result = await service.submitReview(reviewData, userId);

      expect(mockReviewRepository.create).toHaveBeenCalledWith({
        userId,
        speciesId: reviewData.speciesId,
        result: reviewData.result,
        reviewedAt: expect.any(Date),
      });
      expect(mockReviewRepository.save).toHaveBeenCalledWith(mockReview);
      expect(result.success).toBe(true);
    });

    it('should update user species progress when review is submitted', async () => {
      const reviewData = {
        speciesId: 1,
        result: 'correct' as const,
      };
      const userId = 123;

      const existingProgress = {
        id: 1,
        userId,
        speciesId: 1,
        timesSeen: 2,
        timesCorrect: 1,
        accuracy: 0.5,
        masteryLevel: 1,
        isMastered: false,
      };

      mockProgressRepository.findOne.mockResolvedValue(existingProgress);
      mockProgressRepository.save.mockResolvedValue({
        ...existingProgress,
        timesSeen: 3,
        timesCorrect: 2,
        accuracy: 0.67,
      });
      mockReviewRepository.count.mockResolvedValue(0); // No previous reviews

      await service.submitReview(reviewData, userId);

      expect(mockProgressRepository.findOne).toHaveBeenCalledWith({
        where: { userId, speciesId: reviewData.speciesId },
      });
      expect(mockProgressRepository.save).toHaveBeenCalled();
    });

    it('should create new progress record if none exists', async () => {
      const reviewData = {
        speciesId: 1,
        result: 'correct' as const,
      };
      const userId = 123;

      mockProgressRepository.findOne.mockResolvedValue(null);
      mockProgressRepository.create.mockReturnValue({
        userId,
        speciesId: 1,
        timesSeen: 1,
        timesCorrect: 1,
        accuracy: 1.0,
        masteryLevel: 1,
        isMastered: false,
      });
      mockProgressRepository.save.mockResolvedValue({});
      mockReviewRepository.count.mockResolvedValue(0); // No previous reviews

      await service.submitReview(reviewData, userId);

      expect(mockProgressRepository.create).toHaveBeenCalledWith({
        userId,
        speciesId: reviewData.speciesId,
        timesSeen: 1,
        timesCorrect: reviewData.result === 'correct' ? 1 : 0,
        accuracy: reviewData.result === 'correct' ? 1.0 : 0.0,
        masteryLevel: 1,
        isMastered: false,
        lastSeen: expect.any(Date),
      });
    });

    it('should log review event to database', async () => {
      const reviewData = {
        speciesId: 1,
        result: 'correct' as const,
      };
      const userId = 123;

      mockEventRepository.create.mockReturnValue({
        userId,
        eventType: 'flashcard_review',
        data: { speciesId: 1, result: 'correct' },
        timestamp: new Date(),
      });
      mockEventRepository.save.mockResolvedValue({});
      mockReviewRepository.count.mockResolvedValue(0); // No previous reviews

      await service.submitReview(reviewData, userId);

      expect(mockEventRepository.create).toHaveBeenCalledWith({
        userId,
        eventType: 'flashcard_review',
        data: { speciesId: reviewData.speciesId, result: reviewData.result },
        timestamp: expect.any(Date),
      });
      expect(mockEventRepository.save).toHaveBeenCalled();
    });
  });

  describe('getSpeciesForSession', () => {
    it('should return species from database', async () => {
      const mockSpecies = [
        { id: 1, scientificName: 'Passer domesticus', eBirdId: 'houspa' },
        { id: 2, scientificName: 'Turdus migratorius', eBirdId: 'amerob' },
      ];

      mockSpeciesRepository.find.mockResolvedValue(mockSpecies);

      const result = await service.getSpeciesForSession();

      expect(mockSpeciesRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockSpecies);
    });
  });

  describe('getProgress', () => {
    it('should calculate progress from database records', async () => {
      const userId = 123;
      const mockProgressRecords = [
        { speciesId: 1, timesSeen: 5, timesCorrect: 4, isMastered: true },
        { speciesId: 2, timesSeen: 3, timesCorrect: 2, isMastered: false },
        { speciesId: 3, timesSeen: 1, timesCorrect: 0, isMastered: false },
      ];

      mockProgressRepository.find.mockResolvedValue(mockProgressRecords);

      const result = await service.getProgress(userId);

      expect(mockProgressRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result.totalSpecies).toBe(3);
      expect(result.masteredSpecies).toBe(1);
      expect(result.accuracy).toBe(67); // (4+2+0)/(5+3+1) = 6/9 = 0.67 * 100 = 67
    });
  });

  describe('getBadges', () => {
    it('should return user badges with earned status', async () => {
      const userId = 123;
      const mockBadges = [
        {
          id: 1,
          name: 'first_review',
          title: 'First Review',
          description: 'Complete your first flashcard review',
        },
        {
          id: 2,
          name: 'ten_correct',
          title: 'Quick Learner',
          description: 'Get 10 correct answers in a row',
        },
      ];
      const mockUserBadges = [
        { badgeId: 1, earnedAt: new Date('2024-01-15T10:30:00Z') },
      ];

      mockBadgeRepository.find.mockResolvedValue(mockBadges);
      mockUserBadgeRepository.find.mockResolvedValue(mockUserBadges);

      const result = await service.getBadges(userId);

      expect(mockBadgeRepository.find).toHaveBeenCalled();
      expect(mockUserBadgeRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['badge'],
      });
      expect(result).toHaveLength(2);
      expect(result[0].earned).toBe(true);
      expect(result[0].earnedAt).toEqual('2024-01-15T10:30:00.000Z');
      expect(result[1].earned).toBe(false);
      expect(result[1].earnedAt).toBeNull();
    });
  });
});
