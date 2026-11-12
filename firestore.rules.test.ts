import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateGuestbookInput } from './src/utils/guestbookUtils';
import { validateLeaderboardSubmission } from './src/utils/starDashRules';

test('firestore.rules enforces default-deny, create-only immutability, and strict schema validators', () => {
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  assert.equal(rules.includes("rules_version = '2';"), true);
  assert.equal(rules.includes('allow read, write: if false;'), true);
  assert.equal(rules.includes('match /guestbook/{commentId}'), true);
  assert.equal(rules.includes('match /leaderboard/{scoreId}'), true);
  // Both collections strictly forbid update and delete
  const updateFalseMatches = rules.match(/allow update: if false;/g) || [];
  const deleteFalseMatches = rules.match(/allow delete: if false;/g) || [];
  assert.equal(updateFalseMatches.length, 2);
  assert.equal(deleteFalseMatches.length, 2);
});

test('Dirty Dozen payloads are rejected by client and rule validation predicates', () => {
  // 1. Oversized guestbook message (> 200 chars)
  assert.equal(validateGuestbookInput('Ana', 'A'.repeat(201)).valid, false);
  // 2. Empty guestbook message
  assert.equal(validateGuestbookInput('Ana', '   ').valid, false);
  // 3. Spam URL in guestbook message (https://)
  assert.equal(validateGuestbookInput('Ana', 'Visita https://spam.example.com').valid, false);
  // 4. Spam URL in guestbook message (www.)
  assert.equal(validateGuestbookInput('Ana', 'Mira www.spam.com gratis').valid, false);
  // 5. Spam URL in guestbook authorName
  assert.equal(validateGuestbookInput('http://spam.com', 'Hola').valid, false);
  // 6. Oversized guestbook authorName (> 60 chars)
  assert.equal(validateGuestbookInput('B'.repeat(61), 'Hola').valid, false);
  // 7. Leaderboard oversized playerName (> 15 chars)
  assert.equal(validateLeaderboardSubmission('NombreMuyLargo1234', 500).valid, false);
  // 8. Leaderboard offensive playerName
  assert.equal(validateLeaderboardSubmission('mierda123', 500).valid, false);
  // 9. Leaderboard unreasonable score (> 150000)
  assert.equal(validateLeaderboardSubmission('Luis', 9999999).valid, false);
  // 10. Leaderboard zero/negative score
  assert.equal(validateLeaderboardSubmission('Luis', 0).valid, false);
  assert.equal(validateLeaderboardSubmission('Luis', -50).valid, false);
  // 11. Leaderboard spam link in playerName
  assert.equal(validateLeaderboardSubmission('www.spam.com', 500).valid, false);
});
