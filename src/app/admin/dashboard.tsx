'use client';

import {useState, useTransition} from 'react';
import type {Experience} from '@/lib/experience';
import {saveExperienceAction} from './actions';

const blank = (): Experience => ({
  id: crypto.randomUUID(),
  role: '',
  company: '',
  location: '',
  start: '',
  end: '',
  description: '',
  highlights: [],
  tech: [],
  link: '',
});

function Field({label, children, hint}: {label: string; children: React.ReactNode; hint?: string}) {
  return (
    <label className="block space-y-2">
      <span className="eyebrow block">{label}</span>
      {children}
      {hint && <span className="block text-xs text-mist">{hint}</span>}
    </label>
  );
}

export default function Dashboard({initial}: {initial: Experience[]}) {
  const [items, setItems] = useState<Experience[]>(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ok: boolean; msg: string} | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (id: string, patch: Partial<Experience>) => {
    setItems(list => list.map(e => (e.id === id ? {...e, ...patch} : e)));
    setDirty(true);
    setStatus(null);
  };
  const move = (i: number, dir: -1 | 1) => {
    setItems(list => {
      const next = [...list];
      const j = i + dir;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
  };
  const remove = (id: string) => {
    if (!confirm('Delete this entry? It will be removed from the site when you save.')) return;
    setItems(list => list.filter(e => e.id !== id));
    setDirty(true);
  };
  const add = () => {
    const e = blank();
    setItems(list => [e, ...list]);
    setOpen(e.id);
    setDirty(true);
  };
  const save = () =>
    startTransition(async () => {
      const res = await saveExperienceAction(items);
      setStatus(res.ok ? {ok: true, msg: 'Saved — the site is updated.'} : {ok: false, msg: res.error ?? 'Could not save.'});
      if (res.ok) setDirty(false);
    });

  return (
    <div className="mt-8">
      <div className="sticky top-0 z-10 -mx-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-ink-900/90 px-5 py-4 backdrop-blur">
        <button type="button" onClick={add} className="rounded-full border border-white/15 px-5 py-2.5 text-sm hover:border-acid hover:text-acid">
          + Add experience
        </button>
        <div className="flex items-center gap-4">
          <p role="status" className={`text-sm ${status?.ok ? 'text-acid' : 'text-red-400'}`}>
            {status?.msg ?? (dirty ? <span className="text-amber-300">Unsaved changes</span> : null)}
          </p>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="rounded-full bg-acid px-6 py-2.5 text-sm font-medium text-ink-950 disabled:opacity-40"
          >
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-white/15 p-10 text-center text-mist">
          No experience yet. Add your first role — until then the site shows your certifications timeline.
        </p>
      )}

      <ol className="mt-6 space-y-4">
        {items.map((e, i) => {
          const isOpen = open === e.id;
          return (
            <li key={e.id} className="glass rounded-2xl">
              <div className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : e.id)}
                  aria-expanded={isOpen}
                  className="flex-1 text-left"
                >
                  <span className="block font-display text-lg font-semibold">{e.role || 'Untitled role'}</span>
                  <span className="block text-sm text-mist">
                    {e.company || 'Company'} · {e.start || 'Start'} — {e.end || 'Present'}
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="h-9 w-9 rounded-full hover:bg-white/10 disabled:opacity-30">
                    ↑
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="h-9 w-9 rounded-full hover:bg-white/10 disabled:opacity-30">
                    ↓
                  </button>
                  <button type="button" onClick={() => remove(e.id)} aria-label="Delete entry" className="h-9 w-9 rounded-full text-red-400 hover:bg-red-400/10">
                    ✕
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="grid gap-5 border-t border-white/10 p-5 md:grid-cols-2">
                  <Field label="Role *">
                    <input className="input-field" value={e.role} onChange={ev => update(e.id, {role: ev.target.value})} placeholder="Frontend Developer Intern" />
                  </Field>
                  <Field label="Company *">
                    <input className="input-field" value={e.company} onChange={ev => update(e.id, {company: ev.target.value})} placeholder="Company name" />
                  </Field>
                  <Field label="Start *">
                    <input className="input-field" value={e.start} onChange={ev => update(e.id, {start: ev.target.value})} placeholder="Jun 2025" />
                  </Field>
                  <Field label="End" hint="Leave empty for “Present”">
                    <input className="input-field" value={e.end} onChange={ev => update(e.id, {end: ev.target.value})} placeholder="Aug 2025" />
                  </Field>
                  <Field label="Location">
                    <input className="input-field" value={e.location} onChange={ev => update(e.id, {location: ev.target.value})} placeholder="Remote" />
                  </Field>
                  <Field label="Link">
                    <input className="input-field" value={e.link} onChange={ev => update(e.id, {link: ev.target.value})} placeholder="https://company.com" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Description">
                      <textarea className="input-field resize-y" rows={3} value={e.description} onChange={ev => update(e.id, {description: ev.target.value})} />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Highlights" hint="One per line">
                      <textarea
                        className="input-field resize-y"
                        rows={4}
                        value={e.highlights.join('\n')}
                        onChange={ev => update(e.id, {highlights: ev.target.value.split('\n').map(s => s.trim()).filter(Boolean)})}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Tech" hint="Comma separated">
                      <input
                        className="input-field"
                        defaultValue={e.tech.join(', ')}
                        onBlur={ev => update(e.id, {tech: ev.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        placeholder="React, Node.js, Firebase"
                      />
                    </Field>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
