// ============================================
// CONTENT SCHEMAS
// ============================================
// The shape of every JSON document the admin dashboard edits. The `help`
// strings are shown next to each editor.
//
// Anywhere a field is marked "rich text" you can use a list of strings
// (shown as bullets) instead of one string, and inside the text:
//   **bold**   *italic*   [link text](https://example.com)
//   a blank line starts a new paragraph; a single line break is kept.

import { t } from './schema.js';

export const ICON_NAMES = ['Cocktail', 'Cooking', 'Radio', 'Golf', 'Running', 'Meat', 'Camera', 'Book', 'Code'];
export const HOME_BUILTIN_BLOCKS = ['about', 'rightNow', 'contact', 'otherStuff'];

export const LINK = t.object({
  label: t.string(),
  url: t.url({ required: true }),
});

// A generic content block, reusable on the home page and hobby pages.
export const BLOCK = t.object({
  id: t.string(),
  title: t.string(),
  body: t.text(),
  items: t.array(t.text()),
  links: t.array(LINK),
  hidden: t.boolean(),
});

// ---------- Home ----------
export const HOME_SCHEMA = t.object({
  about: t.text(),
  rightNow: t.text(),
  otherStuff: t.array(t.text()),
  titles: t.object({
    about: t.string(),
    rightNow: t.string(),
    contact: t.string(),
    otherStuff: t.string(),
  }),
  sections: t.array(BLOCK, {
    check: (secs) => {
      const ids = secs.map((s) => s.id).filter(Boolean);
      const dup = ids.find((id, i) => ids.indexOf(id) !== i);
      if (dup) return `has two sections with id "${dup}".`;
      const clash = ids.find((id) => HOME_BUILTIN_BLOCKS.includes(id));
      if (clash) return `uses the reserved id "${clash}".`;
      return null;
    },
  }),
  layout: t.array(t.string()),
}, {
  check: (home) => {
    if (!home.layout) return null;
    const known = [...HOME_BUILTIN_BLOCKS, ...(home.sections || []).map((s) => s.id).filter(Boolean)];
    const bad = home.layout.find((id) => !known.includes(id));
    return bad ? `→ layout mentions "${bad}", which isn't one of: ${known.join(', ')}.` : null;
  },
});

export const HOME_HELP = `Fields (all optional):
• about, rightNow — rich text, or a list ["…", "…"] to show as bullets
• otherStuff — list of rich-text lines
• titles — rename headings: { "about": "About", "rightNow": "Right now", "contact": "Get in touch", "otherStuff": "Other stuff" }
• sections — extra blocks: [{ "id": "reading", "title": "Reading", "body": "…", "items": ["…"], "links": [{ "label": "…", "url": "https://…" }], "hidden": false }]
• layout — order of blocks by id; leave a block out to hide it. Default: ["about", "rightNow", "contact", "otherStuff", …your section ids]
Rich text: **bold**, *italic*, [link](https://…), blank line = new paragraph.`;

// ---------- Resume ----------
const RESUME_ENTRY = t.object({
  title: t.string({ required: true }),
  sub: t.string(),
  date: t.string(),
  bullets: t.array(t.text()),
  link: t.url(),
  hidden: t.boolean(),
});

export const RESUME_SCHEMA = t.object({
  sections: t.array(t.object({
    title: t.string({ required: true }),
    entries: t.array(RESUME_ENTRY),
    hidden: t.boolean(),
  }), { required: true }),
  skills: t.array(t.string()),
  skillsTitle: t.string(),
  contact: t.object({
    email: t.string(),
    links: t.array(LINK),
  }),
});

export const RESUME_HELP = `• sections (required) — [{ "title": "Experience", "entries": [ … ], "hidden": false }]
• each entry — { "title": "…", "sub": "…", "date": "…", "bullets": ["…"], "link": "https://…", "hidden": false }
• skills — list of strings;  skillsTitle — heading (default "Skills")
• contact — { "email": "…", "links": [{ "label": "github.com/…", "url": "https://…" }] }
Bullets are rich text: **bold**, *italic*, [link](https://…).`;

// ---------- Hobby ----------
const PHOTO = t.object({ url: t.url({ required: true }), caption: t.string() });

const RECIPE = t.object({
  name: t.string(),
  title: t.string(),
  description: t.text(),
  ingredients: t.array(t.text()),
  instructions: t.text(),
  steps: t.array(t.text()),
  link: t.url(),
}, { check: (r) => (r.name || r.title ? null : 'needs a "name".') });

export const HOBBY_SCHEMA = t.object({
  name: t.string({ required: true }),
  tagline: t.string(),
  pageTagline: t.string(),
  description: t.text(),
  notes: t.text(),
  color: t.color(),
  icon: t.enum(ICON_NAMES),
  isCurrent: t.boolean(),
  hidden: t.boolean(),
  order: t.number(),
  recipesTitle: t.string(),
  photos: t.array(PHOTO),
  recipes: t.array(RECIPE),
  sections: t.array(BLOCK),
  links: t.array(LINK),
});

export const HOBBY_HELP = `• name (required), tagline, pageTagline, description / notes (rich text)
• color "#722f37", icon one of ${ICON_NAMES.join(', ')}
• isCurrent — current vs. former;  hidden — hide from the site;  order — lower numbers sort first
• recipes — [{ "name": "…", "ingredients": ["…"], "instructions": "…", "steps": ["…"], "link": "https://…" }];  recipesTitle — heading
• sections — extra blocks: [{ "title": "…", "body": "…", "items": ["…"], "links": [ … ] }]
• links — [{ "label": "…", "url": "https://…" }];  photos — [{ "url": "https://…", "caption": "…" }]`;

// ---------- Ledger ----------
export const LEDGER_CONFIG_SCHEMA = t.object({
  items: t.array(t.object({
    id: t.string({ required: true }),
    label: t.string({ required: true }),
    cat: t.string(),
    star: t.boolean(),
  }), {
    check: (items) => {
      const ids = items.map((i) => i.id);
      const dup = ids.find((id, i) => ids.indexOf(id) !== i);
      return dup ? `has two items with id "${dup}".` : null;
    },
  }),
  streakItems: t.array(t.string()),
  weekdayChar: t.array(t.text()),
  hobbyLearn: t.array(t.text()),
  fridayPrep: t.array(t.text()),
  saturdayRest: t.array(t.text()),
}, {
  check: (cfg) => {
    if (!cfg.items || !cfg.streakItems) return null;
    const bad = cfg.streakItems.find((id) => !cfg.items.some((i) => i.id === id));
    return bad ? `→ streakItems mentions "${bad}", which isn't an item id.` : null;
  },
});

export const LEDGER_CONFIG_HELP = `• items — [{ "id": "minyan", "label": "Minyan", "cat": "Spirit", "star": true }]
• streakItems — ids from items that count toward streaks
• weekdayChar, hobbyLearn, fridayPrep, saturdayRest — lists of prompt text`;

// A backup is { "YYYY-MM-DD": { …day entry… }, … }
export const LEDGER_BACKUP_SCHEMA = t.map(t.object({}, { silentExtra: true }), {
  keyPattern: /^\d{4}-\d{2}-\d{2}$/,
  keyHint: 'days must look like 2026-01-31',
});
