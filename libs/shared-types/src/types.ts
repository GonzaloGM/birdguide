// Additional shared types for BirdGuide app - aligned with database schema

// Enums and Union Types
export type ConservationStatus =
  | 'LC' // Least Concern
  | 'NT' // Near Threatened
  | 'VU' // Vulnerable
  | 'EN' // Endangered
  | 'CR' // Critically Endangered
  | 'EW' // Extinct in the Wild
  | 'EX'; // Extinct

export type MediaType = 'photo' | 'audio' | 'spectrogram';

export type QuizType = 'photo' | 'audio' | 'mixed';

export type QuizSource = 'daily' | 'deck' | 'course';

export type ReviewResult = 'correct' | 'incorrect' | 'skipped';

export type ReviewMethod = 'flashcard' | 'daily_challenge' | 'deck_review';

export type AuthProvider = 'google' | 'apple' | 'email' | 'guest';

export type DeviceType = 'ios' | 'android' | 'web';

export type PrecipitationType =
  | 'None'
  | 'Light Rain'
  | 'Moderate Rain'
  | 'Heavy Rain'
  | 'Snow'
  | 'Sleet'
  | 'Hail';

export type WeatherConditions = {
  temperature: number; // Celsius
  humidity: number; // Percentage
  windSpeed: number; // km/h
  windDirection: string;
  precipitation: PrecipitationType;
  cloudCover: number; // Percentage
  visibility: number; // km
};

export type Location = {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  habitat?: string;
};

export type BirdSize =
  | 'Very Small' // < 10cm
  | 'Small' // 10-20cm
  | 'Medium' // 20-40cm
  | 'Large' // 40-80cm
  | 'Very Large'; // > 80cm

// User and Authentication
export type User = {
  id: string;
  email: string;
  username: string;
  preferredLocale: string; // e.g. 'es-AR', 'en-US'
  preferredRegionId?: string;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt?: Date;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // soft delete
};

export type UserAuthProvider = {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerUserId: string;
  createdAt: Date;
};

export type UserDevice = {
  id: string;
  userId: string;
  deviceType: DeviceType;
  pushToken?: string;
  lastSeenAt?: Date;
  createdAt: Date;
};

export type CreateUserRequest = {
  email: string;
  username: string;
  password?: string; // optional for social login
  preferredLocale: string;
  preferredRegionId?: string;
};

export type UpdateUserRequest = {
  username?: string;
  preferredLocale?: string;
  preferredRegionId?: string;
};

export type LoginRequest = {
  emailOrUsername: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  token: string;
  refreshToken: string | null;
};

// Species and Taxonomy
export type Species = {
  id: string;
  scientificName: string;
  genus?: string;
  family?: string;
  orderName?: string;
  iucnStatus?: ConservationStatus;
  sizeMm?: number; // size in millimeters
  summary?: string; // short description (EN)
  rangeMapUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SpeciesCommonName = {
  id: string;
  speciesId: string;
  langCode: string; // e.g. 'es-AR', 'es-ES', 'en-US'
  commonName: string;
  isPreferred: boolean;
  notes?: string;
};

export type SpeciesDescription = {
  id: string;
  speciesId: string;
  langCode: string;
  description?: string;
  idTips?: string; // identification tips
  createdAt: Date;
};

// Media and Attribution
export type MediaLicense = {
  id: string;
  name: string; // 'CC BY 4.0', 'Public Domain', etc.
  shortCode: string; // 'CC-BY-4.0'
  url?: string;
};

export type SpeciesMedia = {
  id: string;
  speciesId: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  durationSeconds?: number; // for audio
  contributor: string; // 'John Doe / Macaulay Library'
  source: string; // 'macaulay', 'xeno-canto', 'wikimedia'
  sourceId?: string; // original id in the source
  licenseId?: string;
  attributionText?: string; // pre-built attribution string
  qualityRank: number; // 0 = unknown, higher = better
  isDefault: boolean; // preferred media for flashcards
  createdAt: Date;
};

// Habitats and Regions
export type Habitat = {
  id: string;
  name: string; // 'Wetlands', 'Grassland', 'Forest'
  description?: string;
};

export type Region = {
  id: string;
  code: string; // 'AR-Pampas', 'US-NE', 'Patagonia'
  name: string;
};

export type SpeciesHabitat = {
  speciesId: string;
  habitatId: string;
};

export type SpeciesRegion = {
  speciesId: string;
  regionId: string;
};

export type Deck = {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
};

export type DeckSpecies = {
  deckId: string;
  speciesId: string;
  orderIndex: number;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  createdAt: Date;
};

export type CourseLesson = {
  id: string;
  courseId: string;
  title?: string;
  description?: string;
  deckId?: string; // lesson content points to a deck
  lessonOrder: number;
};

export type UserCourseProgress = {
  userId: string;
  courseId: string;
  currentLessonId?: string;
  startedAt?: Date;
  completedAt?: Date;
};

// Spaced Repetition System (SRS)
export type UserSpeciesProgress = {
  userId: string;
  speciesId: string;
  timesSeen: number;
  timesCorrect: number;
  lastSeenAt?: Date;
  // SRS SM-2 fields:
  efactor: number; // ease factor
  intervalDays: number;
  repetition: number;
  nextReviewAt?: Date;
  mastered: boolean;
};

// Flashcard System
export type FlashcardSession = {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
};

export type FlashcardReview = {
  id: string;
  sessionId?: string;
  userId: string;
  speciesId: string;
  result: ReviewResult;
  method?: ReviewMethod;
  deviceInfo?: Record<string, unknown>; // JSONB
  createdAt: Date;
};

// Quiz System
export type Quiz = {
  id: string;
  userId?: string;
  quizType?: QuizType;
  source?: QuizSource;
  createdAt: Date;
  completedAt?: Date;
  score?: number;
  totalQuestions?: number;
};

export type QuizQuestion = {
  id: string;
  quizId: string;
  speciesId?: string;
  position: number;
  correctOption?: string;
  questionPayload?: Record<string, unknown>; // JSONB for audit
};

export type QuizAnswer = {
  id: string;
  quizQuestionId: string;
  userId?: string;
  chosenAnswer?: string;
  result?: 'correct' | 'incorrect';
  answeredAt: Date;
};

// Bird Search and Filtering
export type BirdSearchFilters = {
  commonName?: string;
  scientificName?: string;
  family?: string;
  order?: string;
  conservationStatus?: ConservationStatus[];
  habitat?: string[];
  size?: BirdSize[];
  colors?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // km
  };
};

// Gamification System
export type DailyChallenge = {
  challengeDate: string; // DATE format
  speciesId: string;
  createdAt: Date;
};

export type UserDailyChallenge = {
  userId: string;
  challengeDate: string;
  attempts: number;
  completed: boolean;
  completedAt?: Date;
};

export type Badge = {
  id: string;
  code: string; // 'first_10_species', '7day_streak'
  title: string;
  description?: string;
  iconUrl?: string;
  createdAt: Date;
};

export type UserBadge = {
  userId: string;
  badgeId: string;
  awardedAt: Date;
};

// User Preferences and Content
export type UserFavorite = {
  userId: string;
  speciesId: string;
  createdAt: Date;
};

export type UserNote = {
  id: string;
  userId: string;
  speciesId: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
};

// Analytics and Events
export type Event = {
  id: string;
  userId?: string;
  eventType: string; // 'flashcard_shown','quiz_answer','login'
  payload?: Record<string, unknown>; // JSONB
  createdAt: Date;
};

// Aggregated Statistics (for performance)
export type UserSpeciesStats = {
  userId: string;
  speciesId: string;
  totalAttempts: number;
  correctAttempts: number;
  lastReviewedAt?: Date;
};

export type UserHabitatStats = {
  userId: string;
  habitatId: string;
  totalAttempts: number;
  correctAttempts: number;
  lastUpdatedAt: Date;
};

export type UserRegionStats = {
  userId: string;
  regionId: string;
  totalAttempts: number;
  correctAttempts: number;
  lastUpdatedAt: Date;
};

// Legacy Statistics (keeping for backward compatibility)
export type UserStats = {
  totalSightings: number;
  uniqueSpecies: number;
  totalSpecies: number;
  favoriteHabitat: string;
  mostSightedBird: {
    birdId: string;
    commonName: string;
    count: number;
  };
  recentActivity: {
    lastSighting: Date;
    sightingsThisMonth: number;
    newSpeciesThisMonth: number;
  };
};

export type BirdStats = {
  totalSightings: number;
  uniqueObservers: number;
  averageCount: number;
  sightingFrequency: {
    month: string;
    count: number;
  }[];
  topLocations: {
    location: Location;
    count: number;
  }[];
};
