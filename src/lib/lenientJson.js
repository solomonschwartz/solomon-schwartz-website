// ============================================
// LENIENT JSON PARSER
// ============================================
// A forgiving JSON parser for the admin editors. Valid JSON goes straight
// through JSON.parse. Anything else goes through a small recursive-descent
// parser that repairs the mistakes people actually make when typing JSON by
// hand, and reports every repair it made:
//
//   • curly “smart” quotes (macOS / iOS / Google Docs autocorrect)
//   • unescaped quotes inside text:  "He said "hi" to me"
//   • single-quoted strings, unquoted keys, unquoted text values
//   • trailing / doubled / missing commas
//   • // and /* */ comments
//   • real line breaks inside text (kept as \n)
//   • True / False / NULL, +1, .5, 1.
//
// When the input can't be understood, it throws a LenientJsonError that
// carries a friendly message plus line, column and a snippet with a caret.

const DQ_SMART = '“”„‟″'; // “ ” „ ‟ ″
const SQ_SMART = '‘’‚‛';       // ‘ ’ ‚ ‛
const ALL_DQ = '"' + DQ_SMART;
const ALL_SQ = "'" + SQ_SMART;

const isQuote = (c) => c !== undefined && (ALL_DQ.includes(c) || ALL_SQ.includes(c));
const isWs = (c) => c !== undefined && /\s/.test(c);
const NUMBER_RE = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;
const STRICT_NUMBER_RE = /^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?$/;
const BARE_KEY_AHEAD_RE = /^[A-Za-z_$][\w$ -]{0,60}?\s*:/;

export class LenientJsonError extends Error {
  constructor(message, pos, text) {
    super(message);
    this.name = 'LenientJsonError';
    const before = text.slice(0, pos);
    this.line = before.split('\n').length;
    const lineStart = before.lastIndexOf('\n') + 1;
    this.column = pos - lineStart + 1;
    let lineEnd = text.indexOf('\n', pos);
    if (lineEnd === -1) lineEnd = text.length;
    const lineText = text.slice(lineStart, lineEnd);
    this.snippet = lineText + '\n' + ' '.repeat(Math.max(0, this.column - 1)) + '^';
    this.pos = pos;
  }
  toString() {
    return `Line ${this.line}, column ${this.column}: ${this.message}`;
  }
}

const setKey = (obj, key, value) => {
  // defineProperty so a key named "__proto__" can't touch the prototype
  Object.defineProperty(obj, key, { value, enumerable: true, writable: true, configurable: true });
};

class Parser {
  constructor(src) {
    this.s = src;
    this.i = 0;
    this.fixes = new Set();
  }

  fix(msg) { this.fixes.add(msg); }
  err(msg, at = this.i) { throw new LenientJsonError(msg, at, this.s); }
  lineOf(pos) { return this.s.slice(0, pos).split('\n').length; }

  // Skip whitespace and comments starting at j; returns { k, sawNewline }.
  scanWs(j, record = false) {
    const s = this.s;
    let sawNewline = false;
    for (;;) {
      const c = s[j];
      if (c === undefined) break;
      if (isWs(c)) { if (c === '\n') sawNewline = true; j++; continue; }
      if (c === '/' && s[j + 1] === '/') {
        if (record) this.fix('Removed // comments');
        while (j < s.length && s[j] !== '\n') j++;
        continue;
      }
      if (c === '/' && s[j + 1] === '*') {
        const end = s.indexOf('*/', j + 2);
        if (end === -1) { if (record) this.err('This /* comment is never closed with */.', j); break; }
        if (record) this.fix('Removed /* */ comments');
        j = end + 2;
        continue;
      }
      break;
    }
    return { k: j, sawNewline };
  }

  skipWs() { this.i = this.scanWs(this.i, true).k; }

  parseTop() {
    this.skipWs();
    const v = this.parseValue();
    this.skipWs();
    if (this.i < this.s.length) {
      this.err(`Unexpected "${this.s[this.i]}" after the end of the data — is there an extra } or ], or a missing comma?`);
    }
    return v;
  }

  parseValue() {
    this.skipWs();
    const c = this.s[this.i];
    if (c === undefined) this.err('Unexpected end — a value or a closing } or ] is missing.');
    if (c === '{') return this.parseObject();
    if (c === '[') return this.parseArray();
    if (isQuote(c)) return this.parseString('value');
    if (c === '}' || c === ']' || c === ',' || c === ':') this.err(`Expected a value here but found "${c}".`);
    return this.parseBare();
  }

  parseObject() {
    const start = this.i;
    this.i++;
    const obj = {};
    for (;;) {
      this.skipWs();
      let c = this.s[this.i];
      if (c === undefined) this.err(`The { on line ${this.lineOf(start)} is never closed with }.`, start);
      if (c === '}') { this.i++; return obj; }
      if (c === ',') { this.fix('Removed extra commas'); this.i++; continue; }
      if (c === ']') this.err(`Found ] but expected } to close the { on line ${this.lineOf(start)}.`);

      const key = isQuote(c) ? this.parseString('key') : this.parseBareKey();
      this.skipWs();
      c = this.s[this.i];
      if (c === ':') this.i++;
      else if (c === '=') { this.i++; this.fix('Replaced = with :'); }
      else this.err(`Expected ":" after the key "${key}".`);

      const value = this.parseValue();
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        this.fix(`Key "${key}" appeared twice — kept the last one`);
      }
      setKey(obj, key, value);

      const afterValue = this.i;
      this.skipWs();
      c = this.s[this.i];
      if (c === ',') {
        this.i++;
        this.skipWs();
        if (this.s[this.i] === '}') this.fix('Removed trailing commas');
        continue;
      }
      if (c === '}') { this.i++; return obj; }
      if (c === undefined) this.err(`The { on line ${this.lineOf(start)} is never closed with }.`, start);
      if ((isQuote(c) || /[A-Za-z_$]/.test(c)) && this.s.slice(afterValue, this.i).includes('\n')) {
        this.fix('Added missing commas');
        continue;
      }
      this.err(`Expected "," or "}" after the value of "${key}" but found "${c}".`);
    }
  }

  parseArray() {
    const start = this.i;
    this.i++;
    const arr = [];
    for (;;) {
      this.skipWs();
      let c = this.s[this.i];
      if (c === undefined) this.err(`The [ on line ${this.lineOf(start)} is never closed with ].`, start);
      if (c === ']') { this.i++; return arr; }
      if (c === ',') { this.fix('Removed extra commas'); this.i++; continue; }
      if (c === '}') this.err(`Found } but expected ] to close the [ on line ${this.lineOf(start)}.`);

      arr.push(this.parseValue());

      const afterValue = this.i;
      this.skipWs();
      c = this.s[this.i];
      if (c === ',') {
        this.i++;
        this.skipWs();
        if (this.s[this.i] === ']') this.fix('Removed trailing commas');
        continue;
      }
      if (c === ']') { this.i++; return arr; }
      if (c === undefined) this.err(`The [ on line ${this.lineOf(start)} is never closed with ].`, start);
      if ((isQuote(c) || c === '{' || c === '[' || /[-+.\dA-Za-z]/.test(c)) && this.s.slice(afterValue, this.i).includes('\n')) {
        this.fix('Added missing commas');
        continue;
      }
      this.err(`Expected "," or "]" in the list but found "${c}".`);
    }
  }

  parseBareKey() {
    const s = this.s;
    const start = this.i;
    let j = this.i;
    while (j < s.length && s[j] !== ':' && s[j] !== '\n' && s[j] !== '}' && s[j] !== ',') j++;
    const key = s.slice(start, j).trim();
    if (!key || s[j] !== ':' || /["'\u2018-\u201F]/.test(key)) {
      this.err('Expected a key in quotes, like "name": …', start);
    }
    this.fix('Added quotes around keys');
    this.i = j;
    return key;
  }

  parseBare() {
    const s = this.s;
    const start = this.i;
    let j = this.i;
    while (j < s.length && !',}]\n\r'.includes(s[j])) j++;
    const raw = s.slice(start, j);
    const token = raw.trim();
    this.i = start + raw.length - (raw.length - raw.trimEnd().length);
    if (!token) this.err('Expected a value here.');

    const lower = token.toLowerCase();
    if (lower === 'true' || lower === 'false' || lower === 'null') {
      if (token !== lower) this.fix('Lower-cased true / false / null');
      return lower === 'null' ? null : lower === 'true';
    }
    if (NUMBER_RE.test(token)) {
      if (!STRICT_NUMBER_RE.test(token)) this.fix('Fixed number formats');
      return Number(token);
    }
    this.fix('Added quotes around unquoted text');
    return token;
  }

  // Does a closing quote at position j-1 look like the real end of the string?
  looksLikeEnd(j, role) {
    const s = this.s;
    const { k, sawNewline } = this.scanWs(j);
    const c = s[k];
    if (c === undefined) return true;
    if (role === 'key') return c === ':' || c === '=';
    if (c === '}' || c === ']') return true;
    if (c === ',') {
      const k2 = this.scanWs(k + 1).k;
      const d = s[k2];
      if (d === undefined || isQuote(d) || '{[}]'.includes(d) || /[-+.\d]/.test(d)) return true;
      const rest = s.slice(k2, k2 + 64);
      return /^(true|false|null)\b/i.test(rest) || BARE_KEY_AHEAD_RE.test(rest);
    }
    // No comma but the next line starts a new value/key → missing comma
    if (sawNewline && (isQuote(c) || c === '{' || c === '[')) return true;
    return false;
  }

  parseString(role) {
    const start = this.i;
    const open = this.s[start];
    const single = ALL_SQ.includes(open);
    try {
      return this.readString(start, open, single, role, false);
    } catch (e) {
      if (!(e instanceof LenientJsonError) || e.pos !== -1) throw e;
      // Lenient reading ran off the end; fall back to "first matching quote closes".
      return this.readString(start, open, single, role, true);
    }
  }

  readString(start, open, single, role, strict) {
    const s = this.s;
    const localFixes = [];
    let closers;
    if (strict) closers = open === '"' ? '"' : open === "'" ? "'" : single ? ALL_SQ : ALL_DQ;
    else closers = single ? ALL_SQ : ALL_DQ;
    if (open === "'") localFixes.push('Converted single-quoted text to double quotes');
    else if (open !== '"') localFixes.push('Converted curly “smart” quotes to straight quotes');

    let out = '';
    let i = start + 1;
    for (;;) {
      if (i >= s.length) {
        if (!strict) { const e = new LenientJsonError('', 0, s); e.pos = -1; throw e; }
        this.err('This text is never closed with a matching quote.', start);
      }
      const c = s[i];
      if (c === '\\') {
        const n = s[i + 1];
        const simple = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '/': '/', '\\': '\\', '"': '"' };
        if (n in simple) { out += simple[n]; i += 2; continue; }
        if (n === 'u' && /^[0-9a-fA-F]{4}$/.test(s.slice(i + 2, i + 6))) {
          out += String.fromCharCode(parseInt(s.slice(i + 2, i + 6), 16));
          i += 6;
          continue;
        }
        if (n === undefined) { i++; continue; }
        // \' or \“ or an unknown escape like \d → keep the character itself
        if (isQuote(n)) out += n;
        else { localFixes.push('Kept a lone backslash as-is'); out += '\\' + n; }
        i += 2;
        continue;
      }
      if (closers.includes(c)) {
        if (strict || this.looksLikeEnd(i + 1, role)) {
          if (c !== open && c !== '"' && c !== "'") {
            localFixes.push('Converted curly “smart” quotes to straight quotes');
          }
          this.i = i + 1;
          localFixes.forEach((f) => this.fix(f));
          return out;
        }
        if (c === '"' || c === "'") localFixes.push('Kept quotation marks that were inside text (e.g. He said "hi")');
        out += c;
        i++;
        continue;
      }
      if (c === '\n' || c === '\r') {
        localFixes.push('Kept line breaks that were inside text');
        if (c === '\r' && s[i + 1] === '\n') i++;
        out += '\n';
        i++;
        continue;
      }
      out += c;
      i++;
    }
  }
}

/**
 * Parse JSON leniently.
 * @returns {{ value: any, fixes: string[] }}
 * @throws {LenientJsonError}
 */
export function parseLenient(text) {
  if (typeof text !== 'string') throw new TypeError('parseLenient expects a string');
  const src = text.replace(/^\uFEFF/, '');
  if (!src.trim()) throw new LenientJsonError('The editor is empty.', 0, src);
  try {
    return { value: JSON.parse(src), fixes: [] };
  } catch {
    // fall through to the lenient parser
  }
  const p = new Parser(src);
  const value = p.parseTop();
  return { value, fixes: [...p.fixes] };
}

export const formatJson = (value) => JSON.stringify(value, null, 2);
