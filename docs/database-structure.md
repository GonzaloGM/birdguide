# BirdGuide Database Structure

## Overview

This document outlines the comprehensive database structure for BirdGuide, a Duolingo-style birding app that helps users learn about bird species through flashcards, photo quizzes, audio quizzes, and interactive content. The app supports internationalization (i18n) with Spanish as the primary language and English as secondary, and will be built as a web app with Capacitor for native mobile deployment.

## App Features

- **Learning Modules**: Flashcards, photo quizzes, audio quizzes
- **Species Database**: Comprehensive bird species information with scientific and common names
- **Internationalization**: Spanish (primary) and English support
- **User Authentication**: Auth0 integration with email/password, Google, and Apple login
- **Gamification**: Daily challenges, stats tracking, badges, and achievements
- **Content Organization**: Decks, courses, and lessons for structured learning
- **User Profiles**: Personal progress tracking and preferences

## Design Principles

### 1. Canonical Species Management
- **Scientific names** serve as the canonical identifier for species
- **Common names** are stored separately with language localization
- **Taxonomy** is normalized with proper family and order relationships

### 2. Media Attribution
- All media (photos, audio, spectrograms) includes proper attribution
- Source tracking for licensing compliance
- Quality ranking system for media selection

### 3. Many-to-Many Relationships
- Species can belong to multiple habitats and regions
- Official content organization through admin-created decks and courses
- User progress tracked across multiple dimensions

### 4. Performance Optimization
- Raw event storage for analytics
- Precomputed aggregate tables for fast dashboards
- SRS (Spaced Repetition System) fields for efficient learning scheduling

### 5. Scalability Considerations
- UUID primary keys for distributed systems
- Timezone-aware timestamps
- Partitioning strategy for large event tables

### 6. Content Management
- **Official content only**: All decks and courses are created by administrators
- **No user-generated content**: Users cannot create their own decks or courses
- **Focus on learning**: Emphasis on flashcards, quizzes, and structured learning paths

## Database Schema

### Core Extensions

```sql
-- Enable helpful PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram indexes for search
```

### User Management & Authentication

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  password_hash TEXT,            -- nullable for social login only
  display_name TEXT,
  preferred_locale TEXT,         -- e.g. 'es-AR', 'en-US'
  preferred_region_id UUID,      -- default region (nullable)
  xp BIGINT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE  -- soft delete
);
```

#### Authentication Providers
```sql
CREATE TABLE user_auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,        -- 'google', 'apple', 'email', 'guest'
  provider_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (provider, provider_user_id)
);
```

#### User Devices
```sql
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_type TEXT,             -- 'ios', 'android', 'web'
  push_token TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Species & Taxonomy

#### Species (Canonical)
```sql
CREATE TABLE species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scientific_name TEXT NOT NULL UNIQUE,   -- canonical identifier
  genus TEXT,
  family TEXT,
  order_name TEXT,
  iucn_status TEXT,                       -- EN, VU, LC, etc.
  size_mm INT,                            -- optional size in millimeters
  summary TEXT,                           -- short description (EN)
  range_map_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Localized Common Names
```sql
CREATE TABLE species_common_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID REFERENCES species(id) ON DELETE CASCADE,
  lang_code TEXT NOT NULL,                -- e.g. 'es-AR', 'es-ES', 'en-US'
  common_name TEXT NOT NULL,
  is_preferred BOOLEAN DEFAULT FALSE,
  notes TEXT,                             -- optional short note
  UNIQUE (species_id, lang_code, common_name)
);
```

#### Translated Descriptions
```sql
CREATE TABLE species_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID REFERENCES species(id) ON DELETE CASCADE,
  lang_code TEXT NOT NULL,
  description TEXT,
  id_tips TEXT,                           -- identification tips
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Media & Attribution

#### Media Licenses
```sql
CREATE TABLE media_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- 'CC BY 4.0', 'Public Domain', etc.
  short_code TEXT,                        -- 'CC-BY-4.0'
  url TEXT
);
```

#### Species Media
```sql
CREATE TABLE species_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id UUID REFERENCES species(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,               -- 'photo', 'audio', 'spectrogram'
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT,                   -- for audio files
  contributor TEXT,                       -- 'John Doe / Macaulay Library'
  source TEXT,                            -- 'macaulay', 'xeno-canto', 'wikimedia'
  source_id TEXT,                         -- original id in the source
  license_id UUID REFERENCES media_licenses(id),
  attribution_text TEXT,                  -- pre-built attribution string
  quality_rank INT DEFAULT 0,             -- 0 = unknown, higher = better
  is_default BOOLEAN DEFAULT FALSE,       -- preferred media for flashcards
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Habitats & Regions

#### Habitats
```sql
CREATE TABLE habitats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- 'Wetlands', 'Grassland', 'Forest'
  description TEXT
);
```

#### Regions
```sql
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,                     -- 'AR-Pampas', 'US-NE', 'Patagonia'
  name TEXT NOT NULL
);
```

#### Species-Habitat Relationships
```sql
CREATE TABLE species_habitats (
  species_id UUID REFERENCES species(id) ON DELETE CASCADE,
  habitat_id UUID REFERENCES habitats(id) ON DELETE CASCADE,
  PRIMARY KEY (species_id, habitat_id)
);
```

#### Species-Region Relationships
```sql
CREATE TABLE species_regions (
  species_id UUID REFERENCES species(id) ON DELETE CASCADE,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  PRIMARY KEY (species_id, region_id)
);
```

### Content Organization

#### Decks (Official Only)
```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Deck-Species Relationships
```sql
CREATE TABLE deck_species (
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  species_id UUID REFERENCES species(id) ON DELETE CASCADE,
  order_index INT DEFAULT 0,
  PRIMARY KEY (deck_id, species_id)
);
```

#### Courses (Official Only)
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  short_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Course Lessons
```sql
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  deck_id UUID REFERENCES decks(id),    -- lesson content points to a deck
  lesson_order INT DEFAULT 0
);
```

#### User Course Progress
```sql
CREATE TABLE user_course_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  current_lesson_id UUID REFERENCES course_lessons(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, course_id)
);
```

### Learning & Analytics

#### Events (Raw Analytics)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,             -- 'flashcard_shown','quiz_answer','login'
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Flashcard Sessions
```sql
CREATE TABLE flashcard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);
```

#### Flashcard Reviews
```sql
CREATE TABLE flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES flashcard_sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  species_id UUID REFERENCES species(id) ON DELETE CASCADE,
  result TEXT NOT NULL,                  -- 'correct','incorrect','skipped'
  method TEXT,                           -- 'flashcard','daily_challenge','deck_review'
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### User Species Progress (SRS)
```sql
CREATE TABLE user_species_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  species_id UUID REFERENCES species(id) ON DELETE CASCADE,
  times_seen INT DEFAULT 0,
  times_correct INT DEFAULT 0,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  -- SRS SM-2 fields:
  efactor NUMERIC(6,3) DEFAULT 2.5,
  interval_days INT DEFAULT 0,
  repetition INT DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE,
  mastered BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, species_id)
);
```

### Quizzes & Assessments

#### Quizzes
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  quiz_type TEXT,                        -- 'photo','audio','mixed'
  source TEXT,                           -- 'daily','deck','course'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INT,
  total_questions INT
);
```

#### Quiz Questions
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  species_id UUID REFERENCES species(id),
  position INT,
  correct_option TEXT,                   -- store correct option text
  question_payload JSONB                 -- question data for audit
);
```

#### Quiz Answers
```sql
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  chosen_answer TEXT,
  result TEXT,                           -- 'correct' or 'incorrect'
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Gamification

#### Daily Challenges
```sql
CREATE TABLE daily_challenges (
  challenge_date DATE PRIMARY KEY,
  species_id UUID REFERENCES species(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### User Daily Challenge Progress
```sql
CREATE TABLE user_daily_challenge (
  user_id UUID REFERENCES users(id),
  challenge_date DATE REFERENCES daily_challenges(challenge_date),
  attempts INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, challenge_date)
);
```

#### Badges
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,                      -- 'first_10_species', '7day_streak'
  title TEXT,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### User Badges
```sql
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);
```

### Performance Optimization Tables

#### User Species Stats (Aggregated)
```sql
CREATE TABLE user_species_stats (
  user_id UUID REFERENCES users(id),
  species_id UUID REFERENCES species(id),
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, species_id)
);
```

#### User Habitat Stats (Aggregated)
```sql
CREATE TABLE user_habitat_stats (
  user_id UUID REFERENCES users(id),
  habitat_id UUID REFERENCES habitats(id),
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, habitat_id)
);
```

#### User Region Stats (Aggregated)
```sql
CREATE TABLE user_region_stats (
  user_id UUID REFERENCES users(id),
  region_id UUID REFERENCES regions(id),
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, region_id)
);
```

### User Preferences & Content

#### User Favorites
```sql
CREATE TABLE user_favorites (
  user_id UUID REFERENCES users(id),
  species_id UUID REFERENCES species(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, species_id)
);
```

#### User Notes
```sql
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  species_id UUID REFERENCES species(id),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Administrative & Audit

#### Content Changes Audit
```sql
CREATE TABLE content_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT,                    -- 'species','deck','course','media'
  entity_id UUID,
  changed_by UUID REFERENCES users(id),
  change JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Indexes & Performance

### Essential Indexes

```sql
-- User activity tracking
CREATE INDEX idx_user_last_active ON users(last_active_at);

-- Species search optimization
CREATE INDEX idx_common_name_trgm ON species_common_names USING gin (common_name gin_trgm_ops);
CREATE INDEX idx_scientific_name_trgm ON species USING gin (scientific_name gin_trgm_ops);

-- Media selection optimization
CREATE INDEX idx_species_media_default ON species_media (species_id) WHERE is_default = true;

-- Learning progress optimization
CREATE INDEX idx_usp_next_review ON user_species_progress (next_review_at) WHERE next_review_at IS NOT NULL;
CREATE INDEX idx_usp_user ON user_species_progress (user_id);

-- Analytics optimization
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_type_created ON events(event_type, created_at);
CREATE INDEX idx_quiz_user ON quizzes(user_id);
```

### Composite Indexes for Upserts

```sql
-- Frequently upserted composite keys
CREATE UNIQUE INDEX idx_user_species_progress ON user_species_progress (user_id, species_id);
CREATE UNIQUE INDEX idx_user_species_stats ON user_species_stats (user_id, species_id);
CREATE UNIQUE INDEX idx_user_habitat_stats ON user_habitat_stats (user_id, habitat_id);
CREATE UNIQUE INDEX idx_user_region_stats ON user_region_stats (user_id, region_id);
CREATE UNIQUE INDEX idx_user_favorites ON user_favorites (user_id, species_id);
```

## Key Application Flows

### 1. Flashcard Review Flow

When a user reviews a flashcard, the following transactional sequence should be executed:

```sql
BEGIN;

-- 1. Insert raw review event
INSERT INTO flashcard_reviews (session_id, user_id, species_id, result, method)
VALUES ($1, $2, $3, $4, $5);

-- 2. Update user species progress (SRS)
INSERT INTO user_species_progress (user_id, species_id, times_seen, times_correct, last_seen_at, efactor, repetition, interval_days, next_review_at)
VALUES ($2, $3, 1, CASE WHEN $4='correct' THEN 1 ELSE 0 END, now(), $6, $7, $8, $9)
ON CONFLICT (user_id, species_id) DO UPDATE
  SET times_seen = user_species_progress.times_seen + 1,
      times_correct = user_species_progress.times_correct + (CASE WHEN $4='correct' THEN 1 ELSE 0 END),
      last_seen_at = now(),
      efactor = EXCLUDED.efactor,
      repetition = EXCLUDED.repetition,
      interval_days = EXCLUDED.interval_days,
      next_review_at = EXCLUDED.next_review_at;

-- 3. Update aggregated stats
INSERT INTO user_species_stats (user_id, species_id, total_attempts, correct_attempts, last_reviewed_at)
VALUES ($2, $3, 1, CASE WHEN $4='correct' THEN 1 ELSE 0 END, now())
ON CONFLICT (user_id, species_id) DO UPDATE
  SET total_attempts = user_species_stats.total_attempts + 1,
      correct_attempts = user_species_stats.correct_attempts + (CASE WHEN $4='correct' THEN 1 ELSE 0 END),
      last_reviewed_at = now();

-- 4. Update user activity
UPDATE users SET last_active_at = now() WHERE id = $2;

COMMIT;
```

### 2. Species Lookup with Localization

```sql
-- Get species with localized name and default photo
SELECT s.id, 
       COALESCE(sc.common_name, s.scientific_name) AS display_name,
       s.scientific_name,
       pm.url AS photo_url, 
       pm.attribution_text
FROM species s
LEFT JOIN species_common_names sc ON s.id = sc.species_id 
  AND sc.lang_code = $1 
  AND sc.is_preferred = true
LEFT JOIN LATERAL (
  SELECT url, attribution_text 
  FROM species_media 
  WHERE species_id = s.id 
    AND media_type = 'photo' 
  ORDER BY is_default DESC, quality_rank DESC 
  LIMIT 1
) pm ON true
WHERE s.id = $2;
```

### 3. User Progress Dashboard

```sql
-- Get user's species mastery stats
SELECT s.id, 
       COALESCE(sc.common_name, s.scientific_name) AS name,
       us.correct_attempts, 
       us.total_attempts,
       ROUND((us.correct_attempts::float / NULLIF(us.total_attempts, 0)) * 100, 1) AS accuracy
FROM user_species_stats us
JOIN species s ON s.id = us.species_id
LEFT JOIN species_common_names sc ON sc.species_id = s.id AND sc.lang_code = $1
WHERE us.user_id = $2
ORDER BY accuracy DESC NULLS LAST
LIMIT 50;
```

## Scaling Considerations

### 1. Partitioning Strategy
- Partition `flashcard_reviews` and `quiz_answers` by month for large volumes
- Consider time-based partitioning for `events` table

### 2. Connection Management
- Use connection pooling (pgbouncer) for concurrent connections
- Implement proper connection limits and timeouts

### 3. Queue Integration
- For high-volume writes, consider queuing raw events
- Process aggregates asynchronously to reduce user-facing latency

### 4. Caching Strategy
- Cache frequently accessed species data
- Use materialized views for complex dashboard queries
- Implement Redis for session and temporary data

## Implementation Priority

### Phase 1: Core Foundation
1. `users`, `user_auth_providers`
2. `species`, `species_common_names`, `species_media`
3. `habitats`, `regions`, `species_habitats`, `species_regions`

### Phase 2: Learning System
1. `decks`, `deck_species`
2. `flashcard_sessions`, `flashcard_reviews`, `user_species_progress`
3. Basic SRS implementation

### Phase 3: Assessment & Gamification
1. `quizzes`, `quiz_questions`, `quiz_answers`
2. `daily_challenges`, `user_daily_challenge`
3. `badges`, `user_badges`

### Phase 4: Analytics & Optimization
1. `user_species_stats`, `user_habitat_stats`, `user_region_stats`
2. `events` logging
3. Performance optimization and caching

## TypeORM Integration Notes

### Entity Mapping
- Use `@PrimaryGeneratedColumn('uuid')` for all UUID primary keys
- Implement proper relationships with `@ManyToOne`, `@OneToMany`, `@ManyToMany`
- Use `@CreateDateColumn` and `@UpdateDateColumn` for timestamps

### Transaction Management
- Use `@Transactional()` decorator for multi-table operations
- Implement proper error handling and rollback strategies

### Query Optimization
- Use `createQueryBuilder()` for complex queries
- Implement proper eager/lazy loading strategies
- Consider raw SQL for performance-critical operations

This database structure provides a solid foundation for the BirdGuide app, supporting all planned features while maintaining performance and scalability for future growth.
