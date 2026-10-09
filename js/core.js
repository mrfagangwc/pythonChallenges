import { PERIODS } from './config.js';

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Never choose two versions of a concept in the same gate. Keep recently
// encountered concepts out of later gates; reset only when the pool is exhausted.
export function pickQuestions(bank, history, count = 2, random = Math.random) {
  const recent = new Set(history.slice(-20));
  const selected = [];
  const topics = shuffle([...new Set(bank.map(q => q.topic))], random);
  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    let pool = bank.filter(q => q.topic === topic && !recent.has(q.concept));
    if (!pool.length) pool = bank.filter(q => !recent.has(q.concept));
    if (!pool.length) pool = bank.filter(q => !selected.some(s => s.concept === q.concept));
    const question = shuffle(pool, random)[0];
    selected.push({ ...question, options: shuffle([question.answer, ...question.distractors], random) });
    recent.add(question.concept);
    history.push(question.concept);
  }
  return selected;
}

// Tokenise this small answer vocabulary, rather than stripping every space:
// `score + 1` equals `score+1`, but `s core` is never accepted as `score`.
// Strings preserve their contents; Python identifiers remain case-sensitive.
export function pythonTokens(value) {
  const tokens = [];
  const pattern = /\s+|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?|==|!=|<=|>=|\*\*|\/\/|[+\-*/%<>=().,\[\]:]/gy;
  let position = 0;
  while (position < value.length) {
    pattern.lastIndex = position;
    const match = pattern.exec(value);
    if (!match) return null;
    position = pattern.lastIndex;
    if (!/^\s+$/.test(match[0])) tokens.push(match[0]);
  }
  return tokens;
}
export function validAnswer(value, blank) {
  const actual = pythonTokens(value.trim());
  if (!actual || !actual.length) return false;
  return [blank.answer, ...(blank.accept || [])].some(answer => {
    const expected = pythonTokens(answer);
    return actual.length === expected.length && actual.every((token, i) => token === expected[i]);
  });
}

export function periodAt(date, periods = PERIODS) {
  const seconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  const toSeconds = text => { const [h, m] = text.split(':').map(Number); return h * 3600 + m * 60; };
  const period = periods.find(p => seconds >= toSeconds(p.start) && seconds < toSeconds(p.end));
  if (!period) return null;
  const end = new Date(date);
  const [hour, minute] = period.end.split(':').map(Number);
  end.setHours(hour, minute, 0, 0);
  return { number: period.number, end: end.getTime(), remaining: Math.ceil((end - date) / 1000) };
}
export function countdown(seconds) {
  const value = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
export function duration(milliseconds) {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`;
}
export function cleanName(value) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 30);
}
export function makeGameState() {
  return { gate: null, gateAttempts: 0, answers: {}, gatePassed: false, blanks: [], codeComplete: false, played: false };
}
export function unlockedIndex(states) {
  const firstIncomplete = states.findIndex(s => !s.played);
  return firstIncomplete === -1 ? states.length - 1 : firstIncomplete;
}

// Anchor answers to one exact source fragment, so edits cannot silently remove
// a blank or mask the wrong occurrence. Python files stay runnable on their own.
export function sourceParts(source, blanks) {
  const ranges = blanks.map((blank, index) => {
    const start = source.indexOf(blank.find);
    if (start === -1 || source.indexOf(blank.find, start + 1) !== -1) throw new Error(`Ambiguous or missing source fragment: ${blank.id}`);
    const answerOffset = blank.find.indexOf(blank.answer);
    if (answerOffset === -1) throw new Error(`Answer absent from fragment: ${blank.id}`);
    return { start: start + answerOffset, end: start + answerOffset + blank.answer.length, index };
  }).sort((a, b) => a.start - b.start);
  let position = 0;
  const parts = [];
  for (const range of ranges) {
    if (range.start < position) throw new Error('Overlapping code blanks');
    parts.push({ text: source.slice(position, range.start) }, { blank: range.index });
    position = range.end;
  }
  parts.push({ text: source.slice(position) });
  return parts;
}

// Announce every observed end once. At adjacent periods the header immediately
// shows the new period; the time-up notice remains visible without blocking work.
export class LessonClock {
  constructor() { this.active = null; this.frozen = null; }
  read(date) {
    if (this.frozen) return { ...this.frozen, expired: false };
    const expired = Boolean(this.active && date.getTime() >= this.active.end);
    const current = periodAt(date);
    this.active = current;
    return { current, expired, frozen: false };
  }
  freeze(date) {
    const result = this.read(date);
    if (result.current) this.frozen = { current: result.current, frozen: true };
    return result;
  }
}
