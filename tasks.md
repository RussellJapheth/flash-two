# Roadmap & Tasks: Learning Experience Enhancements

Task list for learning depth in Decks, Stories, and Field Guides.

---

## Epic 1: Deck Search by Title & Word Content

### Phase 1: Update UI Descriptions & Placeholders

- [x] Search bar placeholder in `src/routes/decks/+page.svelte`: `Search decks by title, word, pinyin, or meaning...`.
- [x] Empty state description in `src/routes/decks/+page.svelte` for character, pinyin, English search.
- [x] Stories and Field Guides tab search placeholders.

### Phase 2: Deck Content Search Indexing

- [x] Index card content in `loadDecks()` (`src/routes/decks/+page.svelte`): word, pinyin, meaning, acceptable answers.
- [x] Filter decks by title or card content in `filteredDecks`.
- [x] Content match badge on `DeckCard.svelte` (e.g. `Matches: 你好 (nǐ hǎo)`).

---

## Epic 2: Main Words from Story (Story Vocab Breakdown)

### Phase 1: Story Key Vocab Data Enrichment

- [x] Add full `summaryVocabulary` to `BUILTIN_STORIES` (`src/lib/data/stories/index.ts`).
- [x] Word frequency counter on story nodes for target words.

### Phase 2: Story UI Vocab Drawer & Card Preview

- [x] Key Vocabulary pills on `StoryCard.svelte`.
- [x] Pre-Story Vocab Preview modal in `src/routes/story/[id]/+page.svelte`.
- [x] Story completion summary: mastered vs encountered vocabulary.

### Phase 3: "Practice Story Vocab" Integration

- [x] **"Practice Story Vocab"** button on story detail and completion.
- [x] Open story words in quick SRS review or save to temporary deck.
- [x] TTS pronunciation for story vocab cards.

---

## Epic 3: Field Guide Lessons (Textbook Style)

### Phase 1: Lesson Model

- [x] Define `TextbookLesson` schema in `src/lib/types.ts`: `scene`, `spotlightWords`, `patternBox`, `miniCheck`, `xpReward`.
- [x] Map 15 Mandarin Field Guides (`src/lib/data/fieldGuides.ts`) to lesson sections.

### Phase 2: Textbook Lesson Component & Reader Mode

- [x] Create `TextbookLessonView.svelte`: dialogue bubbles, tap-to-listen audio, spotlight cards, pattern cards, mini-quiz.
- [x] Add view toggle in `src/routes/guide/[id]/+page.svelte` (Textbook Lesson / Reference Guide).

### Phase 3: Rewards & SRS Pack Bridge

- [x] Award XP via `addXP()` on first lesson completion and persist state.
- [x] Lesson CTA: **"Practice Flashcard Pack (X words)"** linking to companion SRS pack.

---

## Epic 4: Verification & Quality Assurance

- [x] Run `pnpm check`.
- [x] Run `pnpm lint`.
- [x] Run `pnpm test:unit` for deck search, story vocab, and field guide lesson parsing.

---

## Epic 5: Field Guide Textbook & Decks Polish

- [x] Artistic vector avatars in [TextbookAvatar.svelte](file:///home/russell/projects/experiments/flash-two/src/lib/components/TextbookAvatar.svelte).
- [x] Pair characters with pinyin in mini-checks.
- [x] Remove single tone badge from multi-tone spotlight words.
- [x] Persist active tab (`flashcards` | `stories` | `guides`) across back navigation.

---

## Epic 6: Graded Podcasts with Live Synced Transcripts

### Phase 1: Pipeline & Data Model

- [x] Define `PodcastEpisode`, `PodcastSegment`, `PodcastWord`, `PodcastProgress` types in `src/lib/types.ts`.
- [x] Create generator script `scripts/bake/generate_podcast.py` for pre-baked audio and timestamps (`static/audio/podcasts/`).
- [x] Starter episodes for Beginner and Intermediate levels.

### Phase 2: Reactive Player & Storage

- [x] Implement `src/lib/utils/podcastStorage.ts` for position, completion, XP rewards.
- [x] Connect central XP (`addXP`) and `StudyTimer`.
- [x] Unit tests in `src/lib/utils/podcastStorage.spec.ts` and `src/lib/podcasts.spec.ts`.

### Phase 3: Player UI & Live Transcripts

- [x] Create `src/lib/components/podcast/AudioPlayerBar.svelte` (scrubber, speed, jumps).
- [x] Create `src/lib/components/podcast/TranscriptView.svelte` (synced highlight, tap-to-seek/lookup).
- [x] Build catalog (`src/routes/podcasts/+page.svelte`) and player (`src/routes/podcasts/[id]/+page.svelte`).
- [x] Connect `WordLookupModal` for definitions and custom deck export.
- [x] Add podcast links in `BottomNav.svelte`, `src/routes/+page.svelte`, and `src/routes/decks/+page.svelte`.
