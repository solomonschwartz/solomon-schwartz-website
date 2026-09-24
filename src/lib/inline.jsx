import React from 'react';
import { safeUrl } from './schema.js';

// Inline markdown subset: **bold**, *italic*, [label](url). No innerHTML.
const INLINE_RE = /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;

export function renderInline(str, linkStyle) {
  if (typeof str !== 'string') return str == null ? null : String(str);
  const out = [];
  let last = 0;
  let m;
  let k = 0;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(str))) {
    if (m.index > last) out.push(str.slice(last, m.index));
    if (m[1] !== undefined) {
      const href = safeUrl(m[2]);
      const external = href && /^https?:/i.test(href);
      out.push(href
        ? <a key={k++} href={href} style={linkStyle} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{m[1]}</a>
        : m[1]);
    } else if (m[3] !== undefined) {
      out.push(<strong key={k++}>{m[3]}</strong>);
    } else {
      out.push(<em key={k++}>{m[4]}</em>);
    }
    last = INLINE_RE.lastIndex;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}

export const DEFAULT_LINK_STYLE = { color: 'inherit', textDecoration: 'underline', textDecorationColor: '#c8d4e0' };
