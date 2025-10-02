# Flashcards — PRD for MVP (detailed behavior & implementation plan at the bottom)

Perfect — let’s narrow this to a **lean MVP** that is still flexible enough to support all the rich functionality we discussed later (SRS, streaks, badges, stats).
I’ll break this down into:

1. **What the MVP includes** (features + behaviors)
2. **How each action behaves** (progress, streak, stats, badges, events)
3. **Simplified but extensible DB schema**
4. **Pseudo-code & queries for key flows** (just enough for PRD clarity)

---

# 1) MVP Scope — Features

### Core

* **Flashcard learning sessions**

  * Show species (photo, optional audio) → reveal name → mark *“I knew it”* / *“I didn’t”*.
  * 10–20 cards per session, mixed random + due review.
* **Progress tracking (per species)**

  * Store times_seen, times_correct, last_seen, accuracy.
* **Basic streak**

  * Daily activity detection (>=1 review = active day).
  * Track `current_streak`, `longest_streak`.
* **Basic stats dashboard**

  * Overall accuracy, total species studied, total mastered (using simple rule: ≥3 correct in a row).
* **Simple badges**

  * First review, 10 correct answers, 3-day streak. (Enough to test the system.)
* **Events logging**

  * Flashcard answered, session started/ended. (Lightweight, just insert rows.)
* **User XP**

  * +10 correct, +2 incorrect, +5 streak bonus. Stored in users table.

### Not in MVP (but design DB to allow later)

* Full SuperMemo SRS algorithm (for now, just simple scheduling: show missed more often).
* Complex badges (50 mastered, 30-day streak).
* Offline sync.
* Detailed habitat/region stats (we’ll add later, DB is ready).

---

# 2) MVP Behavior (Business Logic)

### Session

* User taps **Flashcards** → backend returns N cards:

  * Priority: unseen species (introduce variety).
  * Secondary: species with low accuracy.
  * Simpler than full SRS, but keeps logic flexible.

### Card actions

* **Reveal** → client-only (no server event needed).
* **I knew it** → server records review with result=correct.
* **I didn’t** → server records review with result=incorrect.

### On Review

* Insert into `flashcard_reviews` (raw log).
* Upsert into `user_species_progress`:

  * Increment times_seen.
  * Increment times_correct if correct.
  * Update last_seen.
  * Compute accuracy = times_correct / times_seen.
  * If accuracy >= 0.8 and times_correct >= 3 → mark mastered.
* Update `users`:

  * +XP.
  * Update streak.
* Insert into `events`.

### Streak update logic

* If last_active = yesterday → increment streak.
* If last_active = today → no change.
* Else → reset streak = 1.
* Update longest_streak if beaten.

### Stats view

* Precompute species accuracy in `user_species_progress`.
* Aggregate overall accuracy and mastered count on request.

### Badges

* Check lightweight rules on review:

  * First review badge if total_reviews = 1.
  * Correct_streak_in_session >= 10 → badge.
  * current_streak >= 3 → badge.
* Insert into `user_badges`.

---

# 3) MVP Database Structure (simplified, extensible)

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  xp INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active DATE,
  created_at TIMESTAMP DEFAULT now()
);

-- Species (pre-loaded from dataset)
CREATE TABLE species (
  id SERIAL PRIMARY KEY,
  sci_name TEXT,
  default_name TEXT
);

-- Species translations
CREATE TABLE species_translations (
  species_id INT REFERENCES species(id),
  lang_code TEXT,
  common_name TEXT,
  PRIMARY KEY (species_id, lang_code)
);

-- Raw flashcard reviews
CREATE TABLE flashcard_reviews (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  species_id INT REFERENCES species(id),
  result TEXT CHECK (result IN ('correct','incorrect')),
  created_at TIMESTAMP DEFAULT now()
);

-- User progress per species
CREATE TABLE user_species_progress (
  user_id INT REFERENCES users(id),
  species_id INT REFERENCES species(id),
  times_seen INT DEFAULT 0,
  times_correct INT DEFAULT 0,
  last_seen TIMESTAMP,
  mastered BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, species_id)
);

-- Badges
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT,
  description TEXT
);

CREATE TABLE user_badges (
  user_id INT REFERENCES users(id),
  badge_id INT REFERENCES badges(id),
  awarded_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Events (for logging)
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id INT,
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

👉 Later, add:

* `habitats`, `regions` + linking tables.
* `courses`/`paths`.
* Advanced SRS fields (`efactor`, `interval_days`, `next_review_at`).

---

# 4) Example Queries / Pseudo-code

### A) Record a review

```sql
INSERT INTO flashcard_reviews (user_id, species_id, result)
VALUES ($1, $2, $3);

INSERT INTO user_species_progress (user_id, species_id, times_seen, times_correct, last_seen, mastered)
VALUES ($1, $2,
        1,
        CASE WHEN $3='correct' THEN 1 ELSE 0 END,
        now(),
        false)
ON CONFLICT (user_id, species_id) DO UPDATE
SET times_seen = user_species_progress.times_seen + 1,
    times_correct = user_species_progress.times_correct + (CASE WHEN $3='correct' THEN 1 ELSE 0 END),
    last_seen = now(),
    mastered = (user_species_progress.times_correct + (CASE WHEN $3='correct' THEN 1 ELSE 0 END)) >= 3
               AND ( (user_species_progress.times_correct + (CASE WHEN $3='correct' THEN 1 ELSE 0 END))::float
                     / (user_species_progress.times_seen + 1) ) >= 0.8;
```

### B) Update streaks

```ts
function updateStreak(user, today) {
  if (!user.last_active) return { current: 1, longest: 1 };
  if (user.last_active == today) return { current: user.current_streak, longest: user.longest_streak };
  if (user.last_active == today - 1) {
    const newStreak = user.current_streak + 1;
    return { current: newStreak, longest: Math.max(user.longest_streak, newStreak) };
  }
  return { current: 1, longest: user.longest_streak };
}
```

### C) Get next 10 cards

```sql
-- 5 least accurate species
SELECT usp.species_id
FROM user_species_progress usp
WHERE usp.user_id = $userId
ORDER BY (usp.times_correct::float / NULLIF(usp.times_seen,0)) ASC NULLS FIRST
LIMIT 5

UNION

-- 5 unseen species
SELECT s.id
FROM species s
WHERE NOT EXISTS (SELECT 1 FROM user_species_progress usp WHERE usp.user_id = $userId AND usp.species_id = s.id)
ORDER BY RANDOM()
LIMIT 5;
```

---

# ✅ MVP Summary

* **What’s in:**
  Flashcards, simple progress, streaks, XP, stats, 2–3 badges, event logging.
* **How it works:**
  Every review = log → update progress → update streak/XP → maybe award badge → log event.
* **DB design:**
  Users, species, translations, reviews, user progress, badges, events.
* **Extendability:**
  Schema supports adding SRS fields, habitats, advanced badges later.

---

Would you like me to also **draft the PRD document outline** (sections, acceptance criteria, non-goals, edge cases) so you can hand it to devs? That would formalize this MVP plan.


# Flashcards — PRD for detailed behavior

Below is a thorough, practical spec for the **Flashcards** feature — UX behavior, business rules (streaks, XP, badges, events), DB updates, offline/sync, SRS logic, queries and sample pseudocode for the critical flows. I thought hard about edge cases, scale and analytics so it becomes easy to turn into a PRD and engineer a reliable implementation.

---

## 1) Objective (business / user)

* **Primary:** help users reliably learn bird species through repeated, bite-sized practice (photo/audio + name).
* **Success signals:** daily active sessions, session length (#cards), improvement in accuracy, retained users (D7/D30 retention), social shares.
* **Constraints:** no user uploads in MVP, media are attribution-only, keep infra simple but support offline.

---

## 2) Main user stories

* As a user I want to study flashcards (photo±audio) and mark whether I knew the species so the app tracks my learning.
* As a user I want spaced review so I see weak species more often and master species over time.
* As a user I want progress / streaks / badges so I feel motivated to return daily.
* As a power user I want precise stats (accuracy, mastery) to guide practice.

---

## 3) UX & behavioral flows

### Session types

* **Ad-hoc session:** user opens “Explore” → picks Flashcards → gets a session of N cards (N configurable / default 20).
* **Deck review:** user selects a specific deck (e.g., Backyard Birds).
* **Daily Challenge session:** a curated, single-card or small-card sequence for the day.
* **SRS review:** app returns due cards (next_review_at <= now).

### Card states & user actions

Each card displayed shows photo (and optional audio). User can:

* **Reveal** (flip card) → shows name(s), ID tips.
* **I knew it** (correct) → counts as success.
* **I didn’t know** (incorrect) → counts as miss; moves card higher in review priority.
* **Skip** → optionally skip and leave card unscored (or count as incorrect depending on config).
* **Favorite/star** → saved for later (user_favorites).
* **Add note** → saves a note (user_notes).
* **Play sound** → for audio reinforcement.

### Session lifecycle

1. **Start session:** server creates `flashcard_sessions` (optional) or client marks local session id.
2. **Fetch initial queue:** endpoint returns first batch of cards per ordering rules (described later).
3. **Per-card:** when user answers, client sends `submitReview` immediately (or queues offline).
4. **End session:** session ended either on user action or after N cards → server marks `ended_at`; can return session summary and award any session badges.

---

## 4) Business rules mapped to behavior

### SRS / Mastery

* Use SM-2-like algorithm for scheduling. Fields tracked per `(user_id, species_id)`:

  * `times_seen`, `times_correct`, `efactor`, `repetition`, `interval_days`, `next_review_at`.
* A species becomes `mastered = true` when `times_correct >= 5` AND `accuracy >= 80%` (example threshold). Mastery threshold configurable.

### XP / Points

* **Correct answer:** +10 XP
* **Incorrect answer:** +2 XP (encouragement) or 0 (your choice)
* **Streak bonus:** +5 XP per day for maintaining streak (applied once per day)
* **Daily challenge success:** +20 XP bonus
* Store XP in `users.xp`.

### Streak rules

* If user performs ≥1 meaningful learning action in UTC day (review/quiz), it counts as activity for that day.
* Update logic:

  * If `last_active_date` is yesterday → `current_streak += 1`.
  * If `last_active_date` is today → no change.
  * Else (gap > 1 day) → `current_streak = 1`.
* Update `longest_streak` if `current_streak > longest_streak`.

### Badges / Achievements (examples)

Award on event or periodically:

* `first_review` — first flashcard review.
* `10_correct_in_a_row` — within a session.
* `50_species_mastered` — species where `mastered = true`.
* `7_day_streak`, `30_day_streak`.
* `course_completed` — completed all lessons in a course.

### Events to log (analytics)

* `flashcard_shown`, `flashcard_revealed`, `flashcard_answered` (include result), `session_started`, `session_ended`, `badge_awarded`, `streak_updated`, `xp_awarded`.

---

## 5) DB changes & tables updated per action

(Refers to schema from earlier; key tables used below.)

**When user answers a card** (preferred transactional path):

1. `flashcard_reviews` INSERT (raw event).
2. `user_species_progress` UPSERT — increment `times_seen`, `times_correct` when correct; update SRS fields `efactor`, `repetition`, `interval_days`, `next_review_at`, `last_seen_at`.
3. `user_species_stats` UPSERT — increment totals for quick dashboard queries.
4. For each habitat & region linked to species: `user_habitat_stats`/`user_region_stats` UPSERT.
5. `users` UPDATE — `last_active_at`, `xp`, possibly `current_streak` and `longest_streak`.
6. `user_badges` INSERT if awarding badge(s).
7. `events` INSERT for analytics.

All of the above ideally done in a transaction (or insert events, then async process aggregates; see scale options below).

---

## 6) SRS algorithm (SM-2) — implementation notes

**Fields (per user_species_progress):**

* `repetition` — number of consecutive successful reviews
* `efactor` — easiness factor (start 2.5)
* `interval_days` — days until next review
* `next_review_at` — timestamp

**SM-2 pseudo-algo (simplified):**

* On review:

  * Let `quality` = 5 if correct, 2 if incorrect (you can allow scale 0..5 for granular scoring).
  * If `quality >= 3` (success):

    * If `repetition == 0`: `interval = 1`
    * Else if `repetition == 1`: `interval = 6`
    * Else: `interval = round(previous_interval * efactor)`
    * `repetition += 1`
  * Else (failure):

    * `repetition = 0`
    * `interval = 1`
  * Update `efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))`
  * Clamp `efactor >= 1.3` (lower bound)
  * Set `next_review_at = now() + interval days`

**Notes:**

* Compute SRS fields in backend code (NestJS) — easier to test & audit than stored procs.
* You may prefer a simpler SRS for MVP: show missed items more frequently and schedule a fixed next_review_at (e.g., now + [1,3,7,21,60] days by repetition level).

---

## 7) Transactional pseudocode (review submission)

### TypeORM-like pseudocode (NestJS)

```ts
async function submitFlashcardReview({ userId, speciesId, sessionId, result, method }) {
  return await this.connection.transaction(async (manager) => {
    // 1. Insert raw review
    const review = await manager.insert('flashcard_reviews', {
      session_id: sessionId,
      user_id: userId,
      species_id: speciesId,
      result, method, created_at: new Date()
    });

    // 2. Fetch or create user_species_progress
    let usp = await manager.findOne('user_species_progress', { user_id: userId, species_id: speciesId });
    if (!usp) {
      usp = {
        user_id: userId, species_id: speciesId,
        times_seen: 0, times_correct: 0, efactor: 2.5, repetition: 0, interval_days: 0
      };
      await manager.insert('user_species_progress', usp);
      usp = await manager.findOne('user_species_progress', { user_id: userId, species_id: speciesId });
    }

    // 3. Compute SRS update in app
    const quality = result === 'correct' ? 5 : 2;
    const srs = computeSM2(usp, quality); // returns { efactor, repetition, interval_days, next_review_at }
    await manager.update('user_species_progress',
      { user_id: userId, species_id: speciesId },
      {
        times_seen: usp.times_seen + 1,
        times_correct: usp.times_correct + (result === 'correct' ? 1 : 0),
        efactor: srs.efactor, repetition: srs.repetition,
        interval_days: srs.interval_days, next_review_at: srs.next_review_at, last_seen_at: new Date()
      }
    );

    // 4. Upsert aggregated stats
    await upsertUserSpeciesStats(manager, userId, speciesId, result === 'correct');

    // 5. Update habitat & region stats (loop over species_habitats)
    const habitats = await manager.find('species_habitats', { species_id: speciesId });
    for (const h of habitats) {
      await upsertUserHabitatStats(manager, userId, h.habitat_id, result === 'correct');
    }
    const regions = await manager.find('species_regions', { species_id: speciesId });
    for (const r of regions) {
      await upsertUserRegionStats(manager, userId, r.region_id, result === 'correct');
    }

    // 6. Update user activity / xp / streak
    const user = await manager.findOne('users', { id: userId });
    // calculate xpDelta and streak update (see streak logic below)
    const xpDelta = result === 'correct' ? 10 : 2;
    const newLastActive = new Date();
    const { newStreak, newLongest } = computeStreak(user.last_active_at, user.current_streak, user.longest_streak, newLastActive);
    await manager.update('users', { id: userId }, {
      xp: user.xp + xpDelta,
      last_active_at: newLastActive,
      current_streak: newStreak,
      longest_streak: newLongest
    });

    // 7. Badge checks (award synchronously or push to badge-worker)
    await maybeAwardBadges(manager, userId);

    // 8. Insert analytics event
    await manager.insert('events', { user_id: userId, event_type: 'flashcard_answered', payload: JSON.stringify({ speciesId, result }), created_at: new Date() });

    return { ok: true };
  });
}
```

**Note:** Upserts for aggregate tables should use `ON CONFLICT` SQL for performance.

---

## 8) Example SQL upsert (user_species_stats)

```sql
INSERT INTO user_species_stats (user_id, species_id, total_attempts, correct_attempts, last_reviewed_at)
VALUES ($1, $2, 1, CASE WHEN $3='correct' THEN 1 ELSE 0 END, now())
ON CONFLICT (user_id, species_id) DO UPDATE
  SET total_attempts = user_species_stats.total_attempts + 1,
      correct_attempts = user_species_stats.correct_attempts + (CASE WHEN $3='correct' THEN 1 ELSE 0 END),
      last_reviewed_at = now();
```

---

## 9) Queries you’ll need (selection and ordering rules)

### A) Get next N cards for a session (SRS + new + failed ordering)

Goal: show due cards first, then cards user previously missed frequently, then new cards.

```sql
WITH due AS (
  SELECT usp.species_id, usp.next_review_at, usp.repetition, usp.times_correct, usp.times_seen
  FROM user_species_progress usp
  WHERE usp.user_id = $userId AND usp.next_review_at <= now()
  ORDER BY usp.next_review_at ASC
  LIMIT $limit
),
difficult AS (
  SELECT s.id AS species_id, (1.0 - COALESCE(us.correct_attempts::float / NULLIF(us.total_attempts,0), 0)) AS difficulty
  FROM species s
  JOIN user_species_stats us ON us.species_id = s.id
  WHERE us.user_id = $userId AND us.total_attempts >= 3
  ORDER BY difficulty DESC
  LIMIT $limit
),
newcards AS (
  SELECT s.id AS species_id
  FROM species s
  WHERE NOT EXISTS (SELECT 1 FROM user_species_progress usp WHERE usp.user_id = $userId AND usp.species_id = s.id)
  ORDER BY RANDOM()
  LIMIT $limit
)
SELECT species_id FROM due
UNION ALL
SELECT species_id FROM difficult WHERE species_id NOT IN (SELECT species_id FROM due)
UNION ALL
SELECT species_id FROM newcards WHERE species_id NOT IN (SELECT species_id FROM due UNION ALL SELECT species_id FROM difficult)
LIMIT $limit;
```

### B) Overall accuracy & mastery counts

```sql
SELECT
  SUM(us.correct_attempts)::float / NULLIF(SUM(us.total_attempts),0) AS overall_accuracy,
  SUM(CASE WHEN us.total_attempts > 0 AND (us.correct_attempts::float / us.total_attempts) >= 0.8 THEN 1 ELSE 0 END) AS mastered_species_count,
  COUNT(*) FILTER (WHERE us.total_attempts > 0) AS species_studied_count
FROM user_species_stats us
WHERE us.user_id = $userId;
```

### C) Accuracy by habitat (from cached user_habitat_stats)

```sql
SELECT h.name,
  ROUND((uhs.correct_attempts::float / NULLIF(uhs.total_attempts, 0)) * 100, 1) AS accuracy_pct
FROM user_habitat_stats uhs
JOIN habitats h ON h.id = uhs.habitat_id
WHERE uhs.user_id = $userId
ORDER BY accuracy_pct ASC;  -- show worst first to guide practice
```

---

## 10) Badges awarding logic (examples + pseudocode)

### Badge examples

* **first_review** — trigger on the first `flashcard_reviews` insert.
* **five_in_a_row** — during session track `session_correct_streak`, award when streak >= 5.
* **50_mastered** — when `user_species_progress` mastered count >= 50.
* **7_day_streak** — when `current_streak >= 7`.

### Badge check strategy

* **Lightweight checks synchronously** (simple ones: first_review, in-session streak).
* **Heavier checks** (counts across many rows) in background periodic job (cron or badge-worker) to avoid costly queries during user requests.

### Pseudocode (sync simple badges)

```ts
async function maybeAwardBadges(manager, userId) {
  // Example: first_review
  const count = await manager.count('flashcard_reviews', { user_id: userId });
  if (count === 1) {
    await safeInsertUserBadge(manager, userId, BADGE_FIRST_REVIEW);
  }

  // In-session streak badge: check session state kept in cache or session table
  const sessionStreak = await getSessionCorrectStreak(userId, sessionId);
  if (sessionStreak >= 5) safeInsertUserBadge(..., BADGE_5_IN_A_ROW);
}
```

---

## 11) Offline support & syncing

* **Client local store:** use IndexedDB (e.g. localForage) to persist un-synced `flashcard_reviews` queue and local `user_species_progress` state for immediate UI.
* **Optimistic UI:** show immediate effects (XP, streak increase) locally; mark them pending sync.
* **Sync worker:** on connectivity, post queued reviews to server sequentially. Server returns canonical SRS values & updated XP/streaks; client reconciles local state with server returned results.
* **Conflict rules:** server is source-of-truth. If server indicates different xp/streak after sync, local should update. Avoid double-applying XP by marking queued reviews with client-side UUIDs and the server rejecting duplicates (idempotency keyed by `client_review_id`).

---

## 12) Concurrency, scale & performance

* For MVP (< hundreds/sec writes), perform synchronous upserts inside DB transactions as shown.
* At higher scale: insert raw `flashcard_reviews` and push an event to a queue. A worker processes events and updates aggregates (`user_species_stats`, `user_habitat_stats`, `user_region_stats`) and SRS fields. This keeps API latency low; stats may be near real-time (few seconds/minutes).
* Partition `flashcard_reviews` by month-year to avoid huge table scans.

---

## 13) API endpoints (recommended)

* `POST /api/sessions` → create session (returns session_id)
* `GET  /api/sessions/:id/next?limit=10` → next cards (list species + media + cached question payload)
* `POST /api/reviews` → submit a review `{ session_id, user_id, species_id, client_review_id, result, time_taken }`
* `POST /api/sessions/:id/end` → end session, return summary
* `GET  /api/user/stats` → aggregated stats (mastery, accuracy, streak, XP)
* `GET  /api/user/badges` → list badges
* `GET  /api/decks/:id` → deck contents

All endpoints should be idempotent where possible for offline replays (client_review_id).

---

## 14) Analytics & KPIs to track

* Sessions started per user/day
* Avg cards per session, avg duration per session
* Correct rate per session (quality)
* D1/D7/D30 retention
* Conversion (if/when monetizing) of engaged users who practice 7+ days
* Popular decks & species interaction counts (for later partnerships)

---

## 15) Testing checklist

* Unit tests for SRS (`computeSM2`) with edge cases (efactor clamps, repetition reset on fail).
* Integration test for transactional review flow (insert review + all upserts + badge awarding).
* Offline sync tests — replay queued reviews with duplicates to confirm idempotency.
* Load tests simulating concurrent reviews to tune DB indexes and connection pooling.

---

## 16) Security & privacy notes

* Treat `events` and analytics appropriately; allow users to opt out.
* User data export: let users download progress if required by privacy regulations.
* Sanitize any free-text notes (user_notes) for XSS if displayed in web.

---

## 17) Example user story → end-to-end (short)

**Maria** opens app for daily practice:

1. Start Flashcards session → server returns 20 cards (4 due + 8 difficult + 8 new).
2. She answers 5 cards correct, 3 incorrect. Each answer triggers `POST /api/reviews`; DB records event + SRS updates next_review_at.
3. After first correct answer, if it's her first ever review, system awards `first_review` badge and logs event.
4. After finishing session, server updates `flashcard_sessions.ended_at`.
5. Maria’s streak increased (last_active was yesterday), XP updated; dashboard shows new XP and streak.
6. Nightly job builds improved recommendations (e.g., generate focus deck of lowest-accuracy birds).
