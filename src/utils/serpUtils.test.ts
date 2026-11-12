import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRandomSearchSeconds,
  formatSearchStatsText,
  getWordmarkColoredChars,
  isValidMetaDescriptionLength,
  isDescriptiveLinkText,
} from './serpUtils';
import { SEO_CONFIG, MAIN_SEARCH_RESULTS, PROFILE_DATA } from '../data/profile';
import { FRIENDS_LIST } from '../data/friends';

test('generateRandomSearchSeconds returns Spanish comma-formatted seconds', () => {
  const minVal = generateRandomSearchSeconds(0);
  const maxVal = generateRandomSearchSeconds(0.999);
  assert.match(minVal, /^0,\d{2}$/);
  assert.match(maxVal, /^0,\d{2}$/);
  assert.equal(minVal, '0,18');
  assert.equal(maxVal, '0,68');
});

test('formatSearchStatsText produces exact required Spanish phrasing', () => {
  assert.equal(
    formatSearchStatsText('0,42', 1),
    'Aproximadamente 1 resultado (0,42 segundos)'
  );
});

test('getWordmarkColoredChars cycles through blue, red, yellow, and green for Luis Felipe', () => {
  const colored = getWordmarkColoredChars('Luis Felipe');
  assert.equal(colored.length, 11);
  // First 4 non-space letters: L (blue), u (red), i (yellow), s (green)
  assert.equal(colored[0].color, '#4285F4');
  assert.equal(colored[1].color, '#EA4335');
  assert.equal(colored[2].color, '#FBBC05');
  assert.equal(colored[3].color, '#34A853');
  // Space at index 4 does not advance color cycle, so F at index 5 is blue again
  assert.equal(colored[4].char, ' ');
  assert.equal(colored[5].color, '#4285F4');
});

test('SEO meta description is strictly between 150 and 160 characters', () => {
  assert.equal(
    SEO_CONFIG.title,
    'Luis Felipe Sandoval Charca | Administración de Negocios – UCSP'
  );
  assert.equal(
    isValidMetaDescriptionLength(SEO_CONFIG.description),
    true,
    `Expected description length 150..160, got ${SEO_CONFIG.description.length}`
  );
});

test('FRIENDS_LIST includes Jhon Gutierrez and valid friend entries', () => {
  assert.equal(FRIENDS_LIST.length >= 3, true);
  assert.equal(
    FRIENDS_LIST.some((f) => f.url === 'https://jhongutierrez-stack.github.io/'),
    true
  );
  for (const friend of FRIENDS_LIST) {
    assert.equal(friend.url.length > 0, true);
    assert.equal(friend.name.length > 0, true);
    assert.equal(friend.description.length > 0, true);
  }
});

test('All main search results and profile links use descriptive text', () => {
  for (const item of MAIN_SEARCH_RESULTS) {
    assert.equal(isDescriptiveLinkText(item.title), true);
    if (item.secondaryLink) {
      assert.equal(isDescriptiveLinkText(item.secondaryLink.label), true);
    }
  }
  assert.equal(isDescriptiveLinkText(PROFILE_DATA.career.name), true);
  assert.equal(isDescriptiveLinkText(PROFILE_DATA.university.name), true);
  assert.equal(isDescriptiveLinkText(PROFILE_DATA.professor.name), true);
});
