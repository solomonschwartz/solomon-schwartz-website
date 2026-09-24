import React from 'react';
import { safeUrl } from '../lib/schema.js';
import { renderInline, DEFAULT_LINK_STYLE } from '../lib/inline.jsx';

// Renders a small, safe subset of markdown without ever touching innerHTML:
//   **bold**   *italic*   [label](https://url)
// Blank lines split paragraphs; single line breaks become <br>.

const withBreaks = (line, linkStyle) => line.split('\n').flatMap((l, i) => (
  i === 0 ? [<React.Fragment key={i}>{renderInline(l, linkStyle)}</React.Fragment>]
    : [<br key={`b${i}`} />, <React.Fragment key={i}>{renderInline(l, linkStyle)}</React.Fragment>]
));


export default function RichText({ text, style, linkStyle = DEFAULT_LINK_STYLE, paragraphGap = '0.9rem' }) {
  if (text == null || text === '') return null;
  // A list of lines renders as a bulleted list.
  if (Array.isArray(text)) {
    const items = text.filter((x) => x != null && String(x).trim());
    if (items.length === 0) return null;
    return (
      <ul style={{ ...style, listStyleType: 'disc', paddingLeft: '1.25rem', margin: 0 }}>
        {items.map((line, i) => (
          <li key={i} style={{ marginBottom: i < items.length - 1 ? '0.25rem' : 0 }}>{renderInline(String(line), linkStyle)}</li>
        ))}
      </ul>
    );
  }
  const paragraphs = String(text).split(/\n\s*\n/).filter((p) => p.trim());
  return paragraphs.map((p, i) => (
    <p key={i} style={{ ...style, ...(i < paragraphs.length - 1 ? { marginBottom: paragraphGap } : {}) }}>
      {withBreaks(p.trim(), linkStyle)}
    </p>
  ));
}

// A generic { title, body, items, links } block used by the home and hobby pages.
export function ContentBlock({ block, headingStyle, textStyle, linkStyle = DEFAULT_LINK_STYLE, bullet = '— ' }) {
  if (!block || block.hidden) return null;
  const items = Array.isArray(block.items) ? block.items : [];
  const links = Array.isArray(block.links) ? block.links.filter((l) => l && safeUrl(l.url)) : [];
  return (
    <div style={{ marginBottom: '3rem' }}>
      {block.title && <h2 style={headingStyle}>{block.title}</h2>}
      <RichText text={block.body} style={textStyle} linkStyle={linkStyle} />
      {items.length > 0 && (
        <p style={{ ...textStyle, marginTop: block.body ? '0.9rem' : 0 }}>
          {items.map((line, i) => (
            <span key={i}>{bullet}{renderInline(line, linkStyle)}{i < items.length - 1 ? <br /> : null}</span>
          ))}
        </p>
      )}
      {links.length > 0 && (
        <p style={{ ...textStyle, marginTop: '0.9rem' }}>
          {links.map((l, i) => {
            const href = safeUrl(l.url);
            return (
              <span key={i}>
                <a href={href} style={linkStyle} {...(/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l.label || l.url}</a>
                {i < links.length - 1 ? ' · ' : null}
              </span>
            );
          })}
        </p>
      )}
    </div>
  );
}
