// ============================================
// TINY SCHEMA VALIDATOR
// ============================================
// Checks that parsed JSON has the shape the site expects before it is saved,
// so a typo can't white-screen the live site. It also does a few safe,
// reported conversions (e.g. a single string where a list is expected).
//
//   validate(schema, value) → { value, errors: [{path, message}], warnings: [...] }
//
// Unknown fields are kept (so you can stash extra config) but reported as a
// warning, since the site won't display them.

export const safeUrl = (u) => {
  if (typeof u !== 'string') return null;
  const url = u.trim();
  if (/^(https?:|mailto:)/i.test(url)) return url;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (url.startsWith('#')) return url;
  return null;
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export const t = {
  string: (o = {}) => ({ type: 'string', ...o }),
  text: (o = {}) => ({ type: 'string', rich: true, ...o }),
  number: (o = {}) => ({ type: 'number', ...o }),
  boolean: (o = {}) => ({ type: 'boolean', ...o }),
  url: (o = {}) => ({ type: 'url', ...o }),
  color: (o = {}) => ({ type: 'color', ...o }),
  enum: (values, o = {}) => ({ type: 'enum', values, ...o }),
  array: (of, o = {}) => ({ type: 'array', of, ...o }),
  object: (fields, o = {}) => ({ type: 'object', fields, ...o }),
  map: (of, o = {}) => ({ type: 'map', of, ...o }),
  any: (o = {}) => ({ type: 'any', ...o }),
};

const join = (path, key) => (typeof key === 'number' ? `${path}[${key}]` : path ? `${path}.${key}` : key);
const show = (v) => {
  const s = JSON.stringify(v);
  return s && s.length > 40 ? s.slice(0, 37) + '…' : s;
};

function check(s, v, path, out) {
  const where = path || 'The top level';
  if (v === undefined || v === null) {
    if (s.required) out.errors.push({ path, message: `${where} is required.` });
    return undefined;
  }

  switch (s.type) {
    case 'any':
      return v;

    case 'string': {
      if (typeof v === 'string') {
        if (s.required && !v.trim()) out.errors.push({ path, message: `${where} can't be empty.` });
        return v;
      }
      if (typeof v === 'number' || typeof v === 'boolean') {
        out.warnings.push({ path, message: `${where} was ${show(v)}; saved as text.` });
        return String(v);
      }
      // Rich-text fields may also be a list of lines, shown as bullets.
      if (s.rich && Array.isArray(v) && v.every((x) => typeof x === 'string')) return v;
      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
        out.warnings.push({ path, message: `${where} was a list; joined into one text.` });
        return v.join('\n');
      }
      out.errors.push({ path, message: s.rich
        ? `${where} should be text in quotes or a list of text, but is ${show(v)}.`
        : `${where} should be text in quotes, but is ${show(v)}.` });
      return undefined;
    }

    case 'number': {
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) {
        out.warnings.push({ path, message: `${where} was the text ${show(v)}; saved as a number.` });
        return Number(v);
      }
      out.errors.push({ path, message: `${where} should be a number, but is ${show(v)}.` });
      return undefined;
    }

    case 'boolean': {
      if (typeof v === 'boolean') return v;
      const str = String(v).trim().toLowerCase();
      if (['true', 'yes', '1', 'false', 'no', '0'].includes(str)) {
        const b = ['true', 'yes', '1'].includes(str);
        out.warnings.push({ path, message: `${where} was ${show(v)}; saved as ${b}.` });
        return b;
      }
      out.errors.push({ path, message: `${where} should be true or false, but is ${show(v)}.` });
      return undefined;
    }

    case 'url': {
      if (typeof v !== 'string') {
        out.errors.push({ path, message: `${where} should be a link in quotes.` });
        return undefined;
      }
      if (!v.trim() && !s.required) return undefined;
      const safe = safeUrl(v);
      if (!safe) {
        out.errors.push({ path, message: `${where} must start with https://, http://, mailto: or / (got ${show(v)}).` });
        return undefined;
      }
      return safe;
    }

    case 'color': {
      if (typeof v === 'string' && /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(rgb|hsl)a?\([^)]*\)|[a-z]+)$/i.test(v.trim())) return v.trim();
      out.errors.push({ path, message: `${where} should be a color like "#1a2e44", but is ${show(v)}.` });
      return undefined;
    }

    case 'enum': {
      if (s.values.includes(v)) return v;
      const match = typeof v === 'string' && s.values.find((x) => String(x).toLowerCase() === v.trim().toLowerCase());
      if (match !== undefined && match !== false) {
        out.warnings.push({ path, message: `${where} was ${show(v)}; corrected to ${show(match)}.` });
        return match;
      }
      out.errors.push({ path, message: `${where} must be one of: ${s.values.join(', ')} (got ${show(v)}).` });
      return undefined;
    }

    case 'array': {
      let arr = v;
      if (!Array.isArray(v)) {
        if (typeof v === 'string' && s.of.type === 'string') {
          arr = v.includes('\n') ? v.split('\n').map((x) => x.trim()).filter(Boolean) : [v];
          out.warnings.push({ path, message: `${where} should be a list [ … ]; wrapped the text into a list.` });
        } else if (isPlainObject(v) && s.of.type === 'object') {
          arr = [v];
          out.warnings.push({ path, message: `${where} should be a list [ … ]; wrapped the single item into a list.` });
        } else {
          out.errors.push({ path, message: `${where} should be a list [ … ], but is ${show(v)}.` });
          return undefined;
        }
      }
      const res = [];
      arr.forEach((item, i) => {
        const r = check(s.of, item, join(path, i), out);
        if (r !== undefined) res.push(r);
      });
      if (s.required && res.length === 0 && s.nonEmpty) out.errors.push({ path, message: `${where} needs at least one item.` });
      if (s.check) { const m = s.check(res); if (m) out.errors.push({ path, message: `${where} ${m}` }); }
      return res;
    }

    case 'object': {
      if (!isPlainObject(v)) {
        out.errors.push({ path, message: `${where} should be an object { … }, but is ${show(v)}.` });
        return undefined;
      }
      const res = {};
      for (const [key, fs] of Object.entries(s.fields)) {
        const r = check(fs, v[key], join(path, key), out);
        if (r !== undefined) res[key] = r;
      }
      for (const key of Object.keys(v)) {
        if (key in s.fields) continue;
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          out.errors.push({ path: join(path, key), message: `"${key}" isn't allowed as a field name.` });
          continue;
        }
        if (!s.silentExtra) {
          out.warnings.push({ path: join(path, key), message: `Unknown field "${key}" — it will be saved but isn't shown on the site.` });
        }
        res[key] = v[key];
      }
      if (s.check) { const m = s.check(res); if (m) out.errors.push({ path, message: `${where} ${m}` }); }
      return res;
    }

    case 'map': {
      if (!isPlainObject(v)) {
        out.errors.push({ path, message: `${where} should be an object { … }, but is ${show(v)}.` });
        return undefined;
      }
      const res = {};
      for (const [key, item] of Object.entries(v)) {
        if (s.keyPattern && !s.keyPattern.test(key)) {
          out.errors.push({ path: join(path, key), message: `"${key}" isn't a valid key${s.keyHint ? ` (${s.keyHint})` : ''}.` });
          continue;
        }
        const r = check(s.of, item, join(path, key), out);
        if (r !== undefined) res[key] = r;
      }
      return res;
    }

    default:
      throw new Error(`Unknown schema type ${s.type}`);
  }
}

export function validate(schema, value) {
  const out = { errors: [], warnings: [] };
  const result = check(schema, value, '', out);
  return { value: result, ...out };
}
