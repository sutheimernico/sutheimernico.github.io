import { useEffect, useState } from 'react';
import { parseRuns, proofLine, type ProofLine, type RunInfo } from '../lib/liveproof';

interface Props {
  /** "owner/repo" whose public GitHub Actions history proves the system operates. */
  repo: string;
  /** Standing fact shown when the live check fails (never a fake timestamp). */
  fallback: string;
}

/**
 * LiveProof — fetches the newest completed Actions run at view time (public
 * API, no token) and renders one status line. Rate limits / offline → fallback.
 */
export default function LiveProof({ repo, fallback }: Props) {
  const [line, setLine] = useState<ProofLine>({ text: 'checking the pipeline…', tone: 'neutral' });
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    const ctrl = new AbortController();
    const done = (run: RunInfo | null) => {
      setLine(proofLine(run, new Date(), fallback));
      setUrl(run?.url);
    };
    fetch(`https://api.github.com/repos/${repo}/actions/runs?per_page=1&status=completed`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => done(parseRuns(json)))
      .catch(() => {
        if (!ctrl.signal.aborted) done(null);
      });
    return () => ctrl.abort();
  }, [repo, fallback]);

  const inner = (
    <>
      <i className={`led ${line.tone}`} aria-hidden="true" />
      <span>{line.text}</span>
    </>
  );

  return (
    <p className={`liveproof ${line.tone}`} aria-live="polite">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {inner} <span aria-hidden="true">↗</span>
        </a>
      ) : (
        inner
      )}
    </p>
  );
}
