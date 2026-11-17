import { describe, it, expect } from 'vitest';
import {
	parseBulkInput,
	countBulkWords,
	synthesizeExample,
	generateCardForWord,
	generateCardsInBulk,
	parseDictEntries,
	cleanGlossSegment,
	isCrossRefGloss,
	healWordRecord,
	isReligiousGloss,
	isReligiousText
} from './generator';

describe('generator', () => {
	it('parses bulk input on new lines only, trimming whitespace and ignoring blanks', () => {
		const raw = `
      你好   
      
      谢谢
      苹果, 香蕉
      猫
    `;
		const parsed = parseBulkInput(raw);
		expect(parsed).toEqual(['你好', '谢谢', '苹果, 香蕉', '猫']);
		expect(countBulkWords(raw)).toBe(4);
	});

	it('returns 0 for empty or whitespace-only input', () => {
		expect(parseBulkInput('')).toEqual([]);
		expect(parseBulkInput('   \n  \n\t')).toEqual([]);
		expect(countBulkWords('  \n  ')).toBe(0);
	});

	it('synthesizes natural example sentences with Pinyin and English based on word type', () => {
		const nounExample = synthesizeExample('茶', 'tea');
		expect(nounExample).toContain('这是茶。');
		expect(nounExample).toContain('Zhè shì chá');
		expect(nounExample).toContain('— This is tea.');

		const verbExample = synthesizeExample('走', 'to walk');
		expect(verbExample).toContain('我想走。');
		expect(verbExample).toContain('Wǒ xiǎng zǒu');
		expect(verbExample).toContain('— I want to walk.');

		const adjExample = synthesizeExample('大', 'big');
		expect(adjExample).toContain('这个很大。');
		expect(adjExample).toContain('Zhè ge hěn dà');
		expect(adjExample).toContain('— This is very big.');

		const suggestionExample = synthesizeExample('来把', 'come');
		expect(suggestionExample).toContain('快来吧！');
		expect(suggestionExample).toContain('Kuài lái ba');
		expect(suggestionExample).toContain('— Come on!');
	});

	it('generates natural card for modal particle phrases like 来把', async () => {
		const card = await generateCardForWord('来把', 'Week 1');
		expect(card.word).toBe('来把');
		expect(card.meaning).toContain('come on');
		expect(card.example).toContain('快来吧');
		expect(card.example).not.toContain('I like come');
	});

	it('generates card from corpus for known word', async () => {
		const card = await generateCardForWord('你好', 'Week 1');
		expect(card.word).toBe('你好');
		expect(card.pinyin).toBe('nǐ hǎo');
		expect(card.meaning).toContain('hello');
		expect(card.example).toContain('你好');
		expect(card.category).toBe('Week 1');
	});

	it('generates card with synthesized pinyin and example for new word', async () => {
		const card = await generateCardForWord('飞龙', 'Week 2');
		expect(card.word).toBe('飞龙');
		expect(card.pinyin).toBe('fēi lóng');
		expect(card.example).toContain('飞龙');
		expect(card.category).toBe('Week 2');
	});

	it('generates multiple cards in bulk with progress callback', async () => {
		const progressEvents: [number, number][] = [];
		const raw = '猫\n狗\n鸟';
		const cards = await generateCardsInBulk(raw, 'Week 3', (curr, total) => {
			progressEvents.push([curr, total]);
		});

		expect(cards).toHaveLength(3);
		expect(cards[0].word).toBe('猫');
		expect(cards[1].word).toBe('狗');
		expect(cards[2].word).toBe('鸟');
		expect(cards[0].category).toBe('Week 3');
		expect(progressEvents).toEqual([
			[1, 3],
			[2, 3],
			[3, 3]
		]);
	});

	it('detects cross-reference glosses accurately', () => {
		expect(isCrossRefGloss('variant of 這裡|这里[zhe4 li3]')).toBe(true);
		expect(isCrossRefGloss('old variant of 五[wu3]')).toBe(true);
		expect(isCrossRefGloss('erhua variant of 這|这[zhe4]')).toBe(true);
		expect(isCrossRefGloss('see 某某[mou3 mou3]')).toBe(true);
		expect(isCrossRefGloss('same as 某某[mou3 mou3]')).toBe(true);
		expect(isCrossRefGloss('also written 哪裡|哪里')).toBe(true);

		expect(isCrossRefGloss('here')).toBe(false);
		expect(isCrossRefGloss('hello / hi')).toBe(false);
		expect(isCrossRefGloss('this')).toBe(false);
	});

	it('cleans gloss segments by stripping classifiers and pronunciation notes', () => {
		expect(cleanGlossSegment('here; CL:個|个[ge4]')).toBe('here');
		expect(cleanGlossSegment('also pr. [nei4 ge5]')).toBe('');
		expect(cleanGlossSegment('(pronoun) this')).toBe('this');
	});

	it('parses dictionary entries preferring clean definitions and resolving variants', () => {
		const rawData = [
			{
				'Chinese Word': '这里',
				'English Meaning': 'variant of 這裡|这里[zhe4 li3]'
			},
			{
				'Chinese Word': '这里',
				'English Meaning': 'here'
			},
			{
				'Chinese Word': '众',
				'English Meaning': 'abbr. for 眾議院|众议院[Zhong4 yi4 yuan4], House of Representatives'
			},
			{
				'Chinese Word': '众',
				'English Meaning': '(bound form) crowd; multitude; many'
			},
			{
				'Chinese Word': '众',
				'English Meaning': 'variant of 眾|众[zhong4]'
			},
			{
				'Chinese Word': '古字',
				'English Meaning': 'variant of 字[zi4]'
			},
			{
				'Chinese Word': '字',
				'English Meaning': 'letter; symbol; character; word'
			}
		];

		const map = parseDictEntries(rawData);
		expect(map.get('这里')).toBe('here');
		expect(map.get('众')).toBe('crowd');
		expect(map.get('古字')).toBe('letter');
	});

	it('heals word records with cross-reference meanings using corpus', () => {
		const record = {
			No: 1,
			'Chinese Word': '这里',
			'English Meaning': 'variant of 這裡|这里[zhe4 li3]'
		};
		const changed = healWordRecord(record);
		expect(changed).toBe(true);
		expect(record['English Meaning']).toBe('here');
	});

	it('generates high quality card for 这里 from corpus', async () => {
		const card = await generateCardForWord('这里', 'Week 1');
		expect(card.word).toBe('这里');
		expect(card.pinyin).toBe('zhè lǐ');
		expect(card.meaning).toBe('here');
		expect(card.example).toContain('这里有很多中国人和外国人。');
	});

	it('identifies religious texts and definitions', () => {
		expect(isReligiousText('《加拉太书》捍卫了福音真理与圣灵所结九样果子的生活。')).toBe(true);
		expect(isReligiousText('《创世记》记载了上帝创造天地万物的故事。')).toBe(true);
		expect(isReligiousText('每个人都有权利选择自己喜欢的生活方式。')).toBe(false);

		expect(isReligiousGloss('(Christianity) gospel')).toBe(true);
		expect(isReligiousGloss('theology / biblical scripture')).toBe(true);
		expect(isReligiousGloss('life / activity / livelihood')).toBe(false);
	});

	it('biases card generation to prefer secular example sentences for words like 生活', async () => {
		const card = await generateCardForWord('生活', 'Week 1');
		expect(card.word).toBe('生活');
		expect(card.pinyin).toBe('shēng huó');
		expect(card.example).not.toContain('加拉太书');
		expect(card.example).not.toContain('福音');
		expect(card.example).toContain('生活方式');
	});

	it('prefers secular definitions over religious ones when parsing dictionary entries', () => {
		const raw = [
			{
				'Chinese Word': '灵',
				'English Meaning': '(Christianity) Holy Spirit; spiritual; soul; quick / sharp'
			}
		];
		const parsed = parseDictEntries(raw);
		expect(parsed.get('灵')).toBe('spiritual');
	});
});
