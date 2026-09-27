'use client';

import {useState, useTransition} from 'react';
import {saveResumeAction} from './actions';

export default function ResumePanel({initial}: {initial: string}) {
  const [url, setUrl] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<{ok: boolean; msg: string} | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await saveResumeAction(url);
      if (res.ok) {
        setSaved(url.trim());
        setStatus({ok: true, msg: url.trim() ? 'Saved — the site now serves this resume.' : 'Resume link removed.'});
      } else {
        setStatus({ok: false, msg: res.error ?? 'Could not save.'});
      }
    });

  return (
    <section className="glass mt-8 rounded-2xl p-5 md:p-6" aria-labelledby="resume-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="resume-title" className="font-display text-xl font-semibold">
            Resume
          </h2>
          <p className="mt-1 max-w-xl text-sm text-mist">
            Paste a Google Drive share link to your PDF. In Drive, set sharing to <b className="text-bone">Anyone with the link</b>{' '}
            → Viewer. The site fetches the file from this link for its View/Download buttons.
          </p>
        </div>
        {saved && (
          <div className="flex gap-2">
            <a href="/resume" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-acid hover:text-acid">
              Test view ↗
            </a>
            <a href="/resume?download=1" className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-acid hover:text-acid">
              Test download ↓
            </a>
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="resume-url" className="sr-only">
          Google Drive link
        </label>
        <input
          id="resume-url"
          className="input-field flex-1"
          value={url}
          onChange={e => {
            setUrl(e.target.value);
            setStatus(null);
          }}
          placeholder="https://drive.google.com/file/d/…/view?usp=sharing"
        />
        <button
          type="button"
          onClick={save}
          disabled={pending || url.trim() === saved}
          className="rounded-full bg-acid px-6 py-3 text-sm font-medium text-ink-950 disabled:opacity-40"
        >
          {pending ? 'Saving…' : 'Save link'}
        </button>
      </div>
      <p role="status" className={`mt-3 min-h-5 text-sm ${status?.ok ? 'text-acid' : 'text-red-400'}`}>
        {status?.msg ?? (!saved ? <span className="text-amber-300">No resume set — the resume buttons are hidden on the site.</span> : null)}
      </p>
    </section>
  );
}
