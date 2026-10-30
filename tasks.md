# Roadmap & Tasks: Learning Experience Enhancements

A comprehensive task list for enhancing learning depth across Decks, Stories, and Field Guides.

---

## Epic 1: Deck Search by Title & Word Content

### Phase 1: Update UI Descriptions & Placeholders (Immediate First Step)

- [x] Update search bar placeholder in `src/routes/decks/+page.svelte` (Flashcards tab) to `Search decks by title, word, pinyin, or meaning...`.
- [x] Update "No decks found" empty state description in `src/routes/decks/+page.svelte` to explain searching by title, character, pinyin, or English translation.
- [x] Update Stories & Field Guides tab search input placeholders for consistent UX.

### Phase 2: Deck Content Search Indexing

- [x] Index card word contents in `loadDecks()` on `src/routes/decks/+page.svelte`:
  - `Chinese Word` / `French Word`
  - `Pinyin`
  - `English Meaning`
  - `Acceptable Answers`
- [x] Update `filteredDecks` derived logic to match `searchQuery` against title OR card contents.
- [x] When a deck matches by word content rather than title, display a badge on `DeckCard.svelte` showing the matched word snippet (e.g. `Matches: 你好 (nǐ hǎo)`).

---

## Epic 2: Main Words from Story (Story Vocab Breakdown)

### Phase 1: Story Key Vocab Data Enrichment

- [x] Audit `BUILTIN_STORIES` in `src/lib/data/stories/index.ts` to ensure every story defines full `summaryVocabulary` (`word`, `pinyin`, `meaning`, `contextSentence`).
- [x] Add word frequency / appearance counter for story nodes to flag high-yield target words.

### Phase 2: Story UI Vocab Drawer & Card Preview

- [x] Add "Key Vocabulary" pill shelf on `StoryCard.svelte` showing the 3–5 core words taught in the scenario.
- [x] In `src/routes/story/[id]/+page.svelte`, add a "Pre-Story Vocab Preview" modal or drawer so learners can inspect key words before reading.
- [x] In story completion summary screen, display mastered vs encountered story vocabulary.

### Phase 3: "Practice Story Vocab" Integration

- [x] Add a **"Practice Story Vocab"** button on the story detail/completion view.
- [x] Allow opening story words directly in quick SRS review or saving to a temporary "Story Words" custom deck.
- [x] Connect story vocab cards with TTS speech pronunciation.

---

## Epic 3: Field Guide Lessons (Children's Language Textbook Style)

### Phase 1: Children's Textbook Lesson Model

- [x] Define `TextbookLesson` schema in `src/lib/types.ts`:
  - `scene`: Illustrated situational dialogue with comic-style character speech bubbles.
  - `spotlightWords`: Oversized Hanzi + Pinyin + tone-colored guides + visual mnemonic.
  - `patternBox`: 1 bite-sized grammar / sentence pattern formula (e.g. `[Subject] + [Want] + [Item]`).
  - `miniCheck`: 2 interactive checks (character-to-picture match, reorder sentence words).
  - `xpReward`: 10–15 XP for completing the textbook lesson.
- [x] Map the 15 Mandarin Field Guides (`src/lib/data/fieldGuides.ts`) to structured lesson sections.

### Phase 2: Textbook Lesson Component & Reader Mode

- [x] Create `TextbookLessonView.svelte`:
  - Playful, high-contrast, children's textbook visual aesthetic (bold rounded borders, warm pastel paper tones, friendly badges).
  - Dialogue speech panels with tap-to-listen audio.
  - Interactive word spotlight cards with stroke-friendly oversized fonts.
  - Sentence pattern formula cards with draggable or tappable slots.
  - Interactive "Try It" mini-quiz widget with instant feedback and sound/confetti.
- [x] Add a view toggle on `src/routes/guide/[id]/+page.svelte`:
  - **Textbook Lesson** (Default interactive mode)
  - **Reference Guide** (Detailed markdown notes)

### Phase 3: Rewards & SRS Pack Bridge

- [x] Award XP via `addXP()` on first lesson completion and persist lesson completion status.
- [x] Add direct CTA at the end of each lesson: **"Practice Flashcard Pack (X words)"** linking to companion SRS pack.

---

## Epic 4: Verification & Quality Assurance

- [x] Run `pnpm check` to ensure strict TypeScript compliance.
- [x] Run `pnpm lint` to maintain code hygiene.
- [x] Run `pnpm test:unit` to verify existing tests and write new unit tests for:
  - Deck content search matching.
  - Story vocabulary extraction.
  - Field guide textbook lesson parsing and progress tracking.

---

## Epic 5: Field Guide Textbook & Decks Polish

- [x] Illustrated avatars for textbook lessons: replace emojis with artistic storybook vector avatars ([TextbookAvatar.svelte](file:///home/russell/projects/experiments/flash-two/src/lib/components/TextbookAvatar.svelte)).
- [x] Pair characters with pinyin in all mini-checks (picture match bank and matched cards, word reorder prompt and chips).
- [x] Remove misleading single "Tone .." badge from multi-tone spotlight vocabulary words.
- [x] Restore and persist active tab (`flashcards` | `stories` | `guides`) on the decks page across back navigation.

---

## Epic 6: Graded Podcasts with Live Synced Transcripts

### Phase 1: Pipeline & Data Model

- [x] Define `PodcastEpisode`, `PodcastSegment`, `PodcastWord`, `PodcastProgress` types in `src/lib/types.ts`.
- [x] Create generator script `scripts/bake/generate_podcast.py` for pre-baking audio, calculating word/sentence timestamps, and compressing to lightweight audio files (`static/audio/podcasts/`).
- [x] Author starter episodes across difficulty levels (Beginner, Intermediate).

### Phase 2: Reactive Player & Storage

- [x] Implement `src/lib/utils/podcastStorage.ts` for playback position persistence, completion records, and XP rewards.
- [x] Connect with central XP system (`addXP`) and `StudyTimer`.
- [x] Write comprehensive unit tests in `src/lib/utils/podcastStorage.spec.ts` and `src/lib/podcasts.spec.ts`.

### Phase 3: Player UI & Live Transcripts

- [x] Create `src/lib/components/podcast/AudioPlayerBar.svelte` with scrubber, speed controls, jump buttons.
- [x] Create `src/lib/components/podcast/TranscriptView.svelte` with auto-scrolling synced highlight and tap-to-seek/lookup.
- [x] Build catalog page at `src/routes/podcasts/+page.svelte` and player page at `src/routes/podcasts/[id]/+page.svelte`.
- [x] Connect with `WordLookupModal` for instant word definitions and custom deck export.
- [x] Add Podcast discovery links in `BottomNav.svelte`, `src/routes/+page.svelte`, and `src/routes/decks/+page.svelte`.
