import React, { useMemo, useRef, useState } from 'react';
import { parseLenient, formatJson } from '../lib/lenientJson.js';
import { validate } from '../lib/schema.js';

// A JSON editor for the admin dashboard.
//  • forgiving parser (smart quotes, stray quotes, trailing commas, comments…)
//  • schema validation with a readable error list before anything is saved
//  • never overwrites what you're typing when Firestore updates underneath
//  • ⌘/Ctrl+S to save, Tab indents, "Tidy up" reformats

const C = {
  ink: '#1a2e44', muted: '#6a84a0', line: '#c8d4e0', err: '#c0392b', errBg: '#fdf1ef',
  warn: '#9a6b00', warnBg: '#fdf8ec', ok: '#2e7d4f', okBg: '#eff8f2',
};
const MAX_LIST = 8;

function analyse(text, schema) {
  let parsed;
  try {
    parsed = parseLenient(text);
  } catch (e) {
    return { parseError: e };
  }
  const v = schema ? validate(schema, parsed.value) : { value: parsed.value, errors: [], warnings: [] };
  return { value: v.value, fixes: parsed.fixes, errors: v.errors, warnings: v.warnings };
}

const Box = ({ tone, children }) => (
  <div style={{
    background: C[`${tone}Bg`], borderLeft: `3px solid ${C[tone]}`, color: C.ink,
    padding: '0.6rem 0.85rem', borderRadius: 4, fontSize: '0.78rem', lineHeight: 1.55, marginBottom: '0.6rem',
  }}>{children}</div>
);

const Issues = ({ list }) => (
  <ul style={{ margin: '0.3rem 0 0', paddingLeft: '1.1rem' }}>
    {list.slice(0, MAX_LIST).map((x, i) => (
      <li key={i}>{x.path ? <code style={{ fontSize: '0.72rem' }}>{x.path}</code> : null}{x.path ? ' — ' : ''}{x.message}</li>
    ))}
    {list.length > MAX_LIST && <li>…and {list.length - MAX_LIST} more</li>}
  </ul>
);

export default function JsonEditor({ title, help, schema, value, defaultValue, onSave, height = 420 }) {
  const initial = value ?? defaultValue ?? {};
  const [text, setText] = useState(() => formatJson(initial));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { tone, text }
  const [remoteChanged, setRemoteChanged] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const taRef = useRef(null);

  // Firestore pushed a new version: refresh only if you haven't started editing.
  if (value !== prevValue) {
    setPrevValue(value);
    if (!dirty) setText(formatJson(value ?? defaultValue ?? {}));
    else setRemoteChanged(true);
  }

  const a = useMemo(() => analyse(text, schema), [text, schema]);
  const canSave = !a.parseError && a.errors.length === 0 && !saving;

  const edit = (next) => { setText(next); setDirty(true); setMsg(null); };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setMsg(null);
    try {
      await onSave(a.value);
      setText(formatJson(a.value));
      setDirty(false);
      setRemoteChanged(false);
      setMsg({ tone: 'ok', text: 'Saved.' });
    } catch (e) {
      setMsg({ tone: 'err', text: `Save failed: ${e?.message || e}` });
    } finally {
      setSaving(false);
    }
  };

  const tidy = () => { if (!a.parseError) edit(formatJson(a.value)); };
  const revert = () => {
    setText(formatJson(value ?? defaultValue ?? {}));
    setDirty(false); setRemoteChanged(false); setMsg(null);
  };
  const resetDefault = () => {
    if (defaultValue === undefined) return;
    if (!window.confirm('Replace the editor contents with the built-in default? (Nothing is saved until you press Save.)')) return;
    edit(formatJson(defaultValue));
  };
  const jumpTo = (pos) => {
    const ta = taRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(pos, Math.min(pos + 1, ta.value.length));
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); return; }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: en } = ta;
      const next = text.slice(0, s) + '  ' + text.slice(en);
      edit(next);
      requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
    }
  };

  const btn = { fontSize: '0.75rem' };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {title && <h2 style={{ fontSize: '1rem', fontWeight: 600, color: C.ink, marginBottom: '0.5rem' }}>{title}</h2>}
      {help && (
        <details style={{ marginBottom: '0.75rem' }}>
          <summary style={{ fontSize: '0.8rem', color: C.muted, cursor: 'pointer' }}>What can I put here?</summary>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: C.muted, lineHeight: 1.6, marginTop: '0.5rem', fontFamily: 'inherit' }}>{help}</pre>
        </details>
      )}

      {remoteChanged && (
        <Box tone="warn">
          This content changed on the server while you were editing.{' '}
          <button onClick={revert} style={{ background: 'none', border: 'none', color: C.ink, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>Load the new version</button>{' '}
          (discards your edits) or keep going and Save to overwrite it.
        </Box>
      )}

      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => edit(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        data-gramm="false"
        style={{
          width: '100%', height, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.78rem',
          padding: '1rem', border: `1px solid ${a.parseError || a.errors?.length ? C.err : C.line}`, borderRadius: 4,
          color: C.ink, lineHeight: 1.5, resize: 'vertical', boxSizing: 'border-box', tabSize: 2,
        }}
      />

      <div style={{ marginTop: '0.75rem' }}>
        {a.parseError ? (
          <Box tone="err">
            <strong>Can’t read this yet</strong> — line {a.parseError.line}, column {a.parseError.column}: {a.parseError.message}{' '}
            <button onClick={() => jumpTo(a.parseError.pos)} style={{ background: 'none', border: 'none', color: C.ink, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>Show me</button>
            <pre style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', overflowX: 'auto' }}>{a.parseError.snippet}</pre>
          </Box>
        ) : (
          <>
            {a.errors.length > 0 && (
              <Box tone="err"><strong>Fix {a.errors.length === 1 ? 'this' : `these ${a.errors.length}`} before saving:</strong><Issues list={a.errors} /></Box>
            )}
            {a.fixes.length > 0 && (
              <Box tone="warn">
                <strong>Auto-corrected when you save</strong> (press Tidy up to see the result):
                <Issues list={a.fixes.map((f) => ({ message: f }))} />
              </Box>
            )}
            {a.warnings.length > 0 && (
              <Box tone="warn"><strong>Heads up:</strong><Issues list={a.warnings} /></Box>
            )}
            {a.errors.length === 0 && a.fixes.length === 0 && a.warnings.length === 0 && dirty && (
              <Box tone="ok">Looks good.</Box>
            )}
          </>
        )}
        {msg && <Box tone={msg.tone}>{msg.text}</Box>}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn-primary" style={btn} disabled={!canSave} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
        <button className="btn-outline" style={btn} disabled={!!a.parseError} onClick={tidy}>Tidy up</button>
        <button className="btn-outline" style={btn} disabled={!dirty} onClick={revert}>Undo changes</button>
        {defaultValue !== undefined && <button className="btn-outline" style={btn} onClick={resetDefault}>Reset to default</button>}
        <span style={{ fontSize: '0.72rem', color: C.muted }}>{dirty ? 'Unsaved changes · ⌘S to save' : 'Saved'}</span>
      </div>
    </div>
  );
}
