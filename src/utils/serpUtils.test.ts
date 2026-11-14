import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRandomSearchSeconds,
  formatSearchStatsText,
  getWordmarkColoredChars,
  isValidMetaDescriptionLength,
  isDescriptiveLinkText,
} from './serpUtils';
import {
  matchEasterEggQuery,
  evaluateRpsRound,
  flipCoinOutcome,
  rollDiceOutcome,
  pickRandomEasterEgg,
  ROULETTE_PHRASES,
} from './easterEggs';
import {
  containsSpamLinks,
  validateGuestbookInput,
  getRemainingCooldownSeconds,
} from './guestbookUtils';
import {
  containsProfanity,
  validateLeaderboardSubmission,
  calculateCatchPoints,
  computeDifficultyParams,
} from './starDashRules';
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
  assert.equal(colored[0].color, '#4285F4');
  assert.equal(colored[1].color, '#EA4335');
  assert.equal(colored[2].color, '#FBBC05');
  assert.equal(colored[3].color, '#34A853');
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

test('matchEasterEggQuery maps "jugar" to stardash and all 5 secret phrases accurately', () => {
  assert.equal(matchEasterEggQuery('jugar'), 'stardash');
  assert.equal(matchEasterEggQuery('Star Dash'), 'stardash');
  assert.equal(matchEasterEggQuery('piedra papel o tijera'), 'rps');
  assert.equal(matchEasterEggQuery('  Piedra, Papel o Tijera '), 'rps');
  assert.equal(matchEasterEggQuery('lanzar moneda'), 'coin');
  assert.equal(matchEasterEggQuery('tirar dado'), 'dice');
  assert.equal(matchEasterEggQuery('dino'), 'dino');
  assert.equal(matchEasterEggQuery('ruleta'), 'roulette');
  assert.equal(matchEasterEggQuery('Luis Felipe Sandoval Charca'), null);
});

test('Easter egg game mechanics (RPS, coin, dice, random picker, roulette) work deterministically', () => {
  assert.equal(evaluateRpsRound('piedra', 'tijera'), 'win');
  assert.equal(evaluateRpsRound('piedra', 'papel'), 'loss');
  assert.equal(evaluateRpsRound('papel', 'papel'), 'tie');

  assert.equal(flipCoinOutcome(0.2), 'cara');
  assert.equal(flipCoinOutcome(0.8), 'sello');

  assert.equal(rollDiceOutcome(0.0), 1);
  assert.equal(rollDiceOutcome(0.99), 6);

  const picked = pickRandomEasterEgg(0.5);
  assert.equal(['stardash', 'rps', 'coin', 'dice', 'dino', 'roulette'].includes(picked), true);
  assert.equal(ROULETTE_PHRASES.length >= 3, true);
});

test('Guestbook validation enforces 200-char max, defaults empty name to Anónimo, and blocks links', () => {
  const validAnon = validateGuestbookInput('', '¡Excelente página personal, éxitos en la UCSP!');
  assert.equal(validAnon.valid, true);
  assert.equal(validAnon.authorName, 'Anónimo');

  const tooLong = validateGuestbookInput('Carlos', 'A'.repeat(201));
  assert.equal(tooLong.valid, false);

  const withLink = validateGuestbookInput('Carlos', 'Mira mi web https://spam.com');
  assert.equal(withLink.valid, false);
  assert.equal(containsSpamLinks('visita www.ejemplo.com ahora'), true);

  assert.equal(getRemainingCooldownSeconds(10000, 20000), 20);
  assert.equal(getRemainingCooldownSeconds(10000, 45000), 0);
});

test('Star Dash combo scoring, difficulty ramp, and leaderboard validation work accurately', () => {
  const firstCatch = calculateCatchPoints('star', 0, false);
  assert.equal(firstCatch.points, 20);
  assert.equal(firstCatch.nextStreak, 1);
  assert.equal(firstCatch.multiplier, 1);

  // After 3 catches, streak becomes 3 -> multiplier x2, with starRainActive -> doubled!
  const comboCatch = calculateCatchPoints('coin', 2, true);
  assert.equal(comboCatch.multiplier, 2);
  assert.equal(comboCatch.points, 35 * 2 * 2);

  const diffStart = computeDifficultyParams(0);
  const diffLate = computeDifficultyParams(60);
  assert.equal(diffLate.fallSpeedMultiplier > diffStart.fallSpeedMultiplier, true);
  assert.equal(diffLate.spawnIntervalSeconds < diffStart.spawnIntervalSeconds, true);

  assert.equal(containsProfanity('piloto_mierda'), true);
  assert.equal(validateLeaderboardSubmission('mierda', 500).valid, false);
  assert.equal(validateLeaderboardSubmission('NombreDemasiadoLargo123', 500).valid, false);
  assert.equal(validateLeaderboardSubmission('Luis Felipe', 999999).valid, false);

  const validScore = validateLeaderboardSubmission('Luis Felipe', 1450);
  assert.equal(validScore.valid, true);
  assert.equal(validScore.playerName, 'Luis Felipe');
  assert.equal(validScore.score, 1450);
});
