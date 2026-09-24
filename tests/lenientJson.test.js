import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLenient, LenientJsonError } from '../src/lib/lenientJson.js';

const ok = (src, expected, { fixed } = {}) => {
  const { value, fixes } = parseLenient(src);
  assert.deepEqual(value, expected);
  if (fixed === false) assert.equal(fixes.length, 0, `unexpected fixes: ${fixes}`);
  if (fixed === true) assert.ok(fixes.length > 0, 'expected at least one fix');
  return fixes;
};

test('valid JSON passes through untouched', () => {
  ok('{"a": [1, 2, {"b": "c \\"q\\""}], "d": null}', { a: [1, 2, { b: 'c "q"' }], d: null }, { fixed: false });
});

test('curly smart quotes as delimiters', () => {
  ok('{“about”: “I build things”, “n”: 2}', { about: 'I build things', n: 2 }, { fixed: true });
});

test('mixed straight and smart quotes', () => {
  ok('{"about”: “hello", "x": "y”}', { about: 'hello', x: 'y' }, { fixed: true });
});

test('smart quotes inside straight-quoted text are kept as content', () => {
  ok('{"q": "He said “hi” to me"}', { q: 'He said “hi” to me' }, { fixed: false });
});

test('unescaped straight quotes inside text', () => {
  ok('{"about": "He said "hi" to me", "b": 1}', { about: 'He said "hi" to me', b: 1 }, { fixed: true });
});

test('empty quotes inside text', () => {
  ok('{"about": "Say "" nothing", "b": ""}', { about: 'Say "" nothing', b: '' });
});

test('inner quote followed by a comma inside the text', () => {
  ok('{"a": "Try "this", then that", "b": 2}', { a: 'Try "this", then that', b: 2 });
});

test('inner quotes at the end of a value', () => {
  ok('{"a": "My motto: "keep going""}', { a: 'My motto: "keep going"' });
});

test('inner quotes in arrays', () => {
  ok('["The "best" mule", "plain"]', ['The "best" mule', 'plain']);
});

test('trailing commas and comments', () => {
  ok(`{
    // my homepage
    "a": [1, 2, 3,], /* note */
    "b": "x",
  }`, { a: [1, 2, 3], b: 'x' }, { fixed: true });
});

test('missing commas between lines', () => {
  ok(`{
    "a": "x"
    "b": "y"
  }`, { a: 'x', b: 'y' }, { fixed: true });
  ok(`["a"
  "b"]`, ['a', 'b']);
});

test('unquoted keys, single quotes, bare words', () => {
  ok("{name: 'Moscow Mule', isCurrent: True, count: .5, extra: hello world}",
    { name: 'Moscow Mule', isCurrent: true, count: 0.5, extra: 'hello world' }, { fixed: true });
});

test('apostrophes inside single-quoted strings', () => {
  ok("{'a': 'don't stop'}", { a: "don't stop" });
});

test('real line breaks inside strings', () => {
  ok('{"a": "line one\nline two"}', { a: 'line one\nline two' }, { fixed: true });
});

test('urls as bare values are not treated as comments', () => {
  ok('{"url": https://example.com/a}', { url: 'https://example.com/a' });
});

test('__proto__ key does not pollute', () => {
  const { value } = parseLenient('{"__proto__": {"x": 1}, a: 1}');
  assert.equal(({}).x, undefined);
  assert.deepEqual(Object.keys(value), ['__proto__', 'a']);
});

test('errors carry line and column', () => {
  try {
    parseLenient('{\n  "a": 1,\n  "b": [1, 2\n}');
    assert.fail('should throw');
  } catch (e) {
    assert.ok(e instanceof LenientJsonError);
    assert.ok(e.line >= 1);
    assert.match(e.message, /\]|\}/);
    assert.ok(e.snippet.includes('^'));
  }
});

test('unclosed string reports where it started', () => {
  assert.throws(() => parseLenient('{"a": "never closed}'), LenientJsonError);
});

test('empty input', () => {
  assert.throws(() => parseLenient('   '), /empty/);
});
