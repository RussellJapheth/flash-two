import { describe, it, expect } from 'vitest';
import { BUILTIN_PODCASTS } from './data/podcasts';

describe('Built-in Podcast Episodes', () => {
	it('loads builtin podcasts with valid metadata', () => {
		expect(BUILTIN_PODCASTS.length).toBeGreaterThanOrEqual(2);

		for (const ep of BUILTIN_PODCASTS) {
			expect(ep.id).toBeTruthy();
			expect(ep.title).toBeTruthy();
			expect(ep.duration).toBeGreaterThan(0);
			expect(['beginner', 'intermediate', 'advanced']).toContain(ep.level);
			expect(ep.audioUrl).toMatch(/^\/audio\/podcasts\/.+\.(mp3|opus|m4a)$/);
			expect(ep.speakers.length).toBeGreaterThanOrEqual(1);
			expect(ep.keyVocabulary.length).toBeGreaterThanOrEqual(3);
			expect(ep.segments.length).toBeGreaterThanOrEqual(4);

			// Verify chronological segments
			let prevStart = -1;
			for (const seg of ep.segments) {
				expect(seg.id).toBeTruthy();
				expect(seg.start).toBeGreaterThanOrEqual(0);
				expect(seg.end).toBeGreaterThan(seg.start);
				expect(seg.start).toBeGreaterThanOrEqual(prevStart);
				expect(seg.text).toBeTruthy();
				prevStart = seg.start;
			}
		}
	});

	it('contains both beginner and intermediate levels', () => {
		const levels = BUILTIN_PODCASTS.map((p) => p.level);
		expect(levels).toContain('beginner');
		expect(levels).toContain('intermediate');
	});
});
