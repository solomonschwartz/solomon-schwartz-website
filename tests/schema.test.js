import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, safeUrl } from '../src/lib/schema.js';
import { HOME_SCHEMA, RESUME_SCHEMA, HOBBY_SCHEMA, LEDGER_BACKUP_SCHEMA, LEDGER_CONFIG_SCHEMA } from '../src/lib/contentSchemas.js';

test('safeUrl blocks javascript: and data:', () => {
  assert.equal(safeUrl('javascript:alert(1)'), null);
  assert.equal(safeUrl(' JavaScript:alert(1)'), null);
  assert.equal(safeUrl('data:text/html,hi'), null);
  assert.equal(safeUrl('//evil.com'), null);
  assert.equal(safeUrl('https://ok.com'), 'https://ok.com');
  assert.equal(safeUrl('/images/a.jpg'), '/images/a.jpg');
  assert.equal(safeUrl('mailto:a@b.com'), 'mailto:a@b.com');
});

test('home: wrong types that used to white-screen the site', () => {
  const r = validate(HOME_SCHEMA, { about: 'hi', otherStuff: 'just one line' });
  assert.equal(r.errors.length, 0);
  assert.deepEqual(r.value.otherStuff, ['just one line']);
  assert.ok(r.warnings.length > 0);

  const bad = validate(HOME_SCHEMA, { about: { nested: true } });
  assert.equal(bad.errors.length, 1);
  assert.equal(bad.errors[0].path, 'about');
});

test('home: rich text fields accept a list (bullets) without warnings', () => {
  const r = validate(HOME_SCHEMA, { rightNow: ['Palantir', 'whereisthejohn.com'] });
  assert.equal(r.errors.length, 0);
  assert.equal(r.warnings.length, 0);
  assert.deepEqual(r.value.rightNow, ['Palantir', 'whereisthejohn.com']);
  assert.equal(validate(HOME_SCHEMA, { rightNow: ['ok', 3] }).errors.length, 1);
});

test('home: layout must reference known blocks', () => {
  const r = validate(HOME_SCHEMA, { sections: [{ id: 'reading', title: 'Reading' }], layout: ['about', 'reading', 'nope'] });
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0].message, /nope/);
});

test('resume: sections required, bullets string wrapped', () => {
  assert.equal(validate(RESUME_SCHEMA, {}).errors.length, 1);
  const r = validate(RESUME_SCHEMA, { sections: [{ title: 'X', entries: [{ title: 'Y', bullets: 'one' }] }], skills: ['a'] });
  assert.equal(r.errors.length, 0);
  assert.deepEqual(r.value.sections[0].entries[0].bullets, ['one']);
});

test('hobby: bad url, icon case fix, unknown fields kept', () => {
  const r = validate(HOBBY_SCHEMA, { name: 'Golf', icon: 'golf', links: [{ url: 'javascript:x' }], mood: 'good' });
  assert.equal(r.errors.length, 1);
  assert.equal(r.errors[0].path, 'links[0].url');
  assert.equal(r.value.icon, 'Golf');
  assert.equal(r.value.mood, 'good');
});

test('ledger backup: keys must be dates (no slashes)', () => {
  const r = validate(LEDGER_BACKUP_SCHEMA, { '2026-01-02': { checks: {} }, 'a/b': {} });
  assert.equal(r.errors.length, 1);
  assert.deepEqual(Object.keys(r.value), ['2026-01-02']);
});

test('ledger config: streak ids must exist', () => {
  const r = validate(LEDGER_CONFIG_SCHEMA, { items: [{ id: 'a', label: 'A' }], streakItems: ['b'] });
  assert.equal(r.errors.length, 1);
});
