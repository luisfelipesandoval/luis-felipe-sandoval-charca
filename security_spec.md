# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Collection Exclusivity**: Only `/guestbook/{commentId}` and `/leaderboard/{scoreId}` are exposed; all other paths default-deny (`allow read, write: if false;`).
2. **Create-Only Immutability**: Both `/guestbook/{commentId}` and `/leaderboard/{scoreId}` only allow `create` (`allow update: if false; allow delete: if false;`). Existing records can never be modified or deleted.
3. **Guestbook Constraints (`/guestbook/{commentId}`)**:
   - Exact keys: `['authorName', 'message', 'visitorId', 'createdAt']`.
   - `authorName`: string, `1 <= size() <= 60`, no links (`http://`, `https://`, `www.`).
   - `message`: string, `1 <= size() <= 200`, no links.
   - `visitorId`: valid ID (`1..128` chars, `^[a-zA-Z0-9_\-]+$`).
   - `createdAt == request.time`.
4. **Leaderboard Constraints (`/leaderboard/{scoreId}`)**:
   - Exact keys: `['playerName', 'score', 'visitorId', 'createdAt']`.
   - `playerName`: string, `1 <= size() <= 15`, no links, no offensive words.
   - `score`: integer (`data.score is int`), `1 <= data.score <= 150000` (reasonable arcade score bounds).
   - `visitorId`: valid ID (`1..128` chars, `^[a-zA-Z0-9_\-]+$`).
   - `createdAt == request.time`.

## 2. The "Dirty Dozen" Payloads
1. **Guestbook Shadow Field Injection**: `{ authorName: "Ana", message: "Hola", visitorId: "v_1", createdAt: request.time, isAdmin: true }` -> `PERMISSION_DENIED`
2. **Guestbook Oversized Message (> 200 chars)**: `{ authorName: "Ana", message: "A".repeat(201), visitorId: "v_1", createdAt: request.time }` -> `PERMISSION_DENIED`
3. **Guestbook Spam URL in Message**: `{ authorName: "Ana", message: "Visita https://spam.com", visitorId: "v_1", createdAt: request.time }` -> `PERMISSION_DENIED`
4. **Guestbook Update Attempt**: `updateDoc(doc(db, 'guestbook', id), { message: "Editado" })` -> `PERMISSION_DENIED`
5. **Guestbook Delete Attempt**: `deleteDoc(doc(db, 'guestbook', id))` -> `PERMISSION_DENIED`
6. **Leaderboard Oversized Player Name (> 15 chars)**: `{ playerName: "NombreMuyLargo1234", score: 500, visitorId: "v_1", createdAt: request.time }` -> `PERMISSION_DENIED`
7. **Leaderboard Offensive Player Name**: `{ playerName: "mierda123", score: 500, visitorId: "v_1", createdAt: request.time }` -> `PERMISSION_DENIED`
8. **Leaderboard Unreasonable Score (> 150000)**: `{ playerName: "Luis", score: 9999999, visitorId: "v_1", createdAt: request.time }` -> `PERMISSION_DENIED`
9. **Leaderboard Zero/Negative Score**: `{ playerName: "Luis", score: 0, visitorId: "v_1", createdAt: request.time }` -> `PERMISSION_DENIED`
10. **Leaderboard Spoofed Timestamp**: `{ playerName: "Luis", score: 1200, visitorId: "v_1", createdAt: timestamp.date(2020, 1, 1) }` -> `PERMISSION_DENIED`
11. **Leaderboard Update Attempt**: `updateDoc(doc(db, 'leaderboard', id), { score: 100000 })` -> `PERMISSION_DENIED`
12. **Leaderboard Delete Attempt**: `deleteDoc(doc(db, 'leaderboard', id))` -> `PERMISSION_DENIED`
