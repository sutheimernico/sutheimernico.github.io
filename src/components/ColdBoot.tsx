import { useState, useEffect, useRef } from 'react';

const BOOT_LINES: [string, string][] = [
  ['init phosphor core ........', 'OK'],
  ['mount ~/portfolio .........', 'OK'],
  ['forge identity <NS> .......', 'OK'],
  ['spin data-spine ...........', 'OK'],
  ['render mythic layer .......', 'OK'],
];

const SCRAMBLE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&$/\\<>';

function randomize(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    out += s[i] === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
  }
  return out;
}

export default function ColdBoot() {
  // visible: true = overlay shown, false = unmount
  const [visible, setVisible] = useState(true);
  // fading: true = CSS dismiss animation running
  const [fading, setFading] = useState(false);
  // lines of rendered log HTML (strings)
  const [logLines, setLogLines] = useState<string[]>([]);

  const doneRef = useRef(false);
  const scrambleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function dismiss() {
    if (doneRef.current) return;
    doneRef.current = true;

    if (scrambleTimerRef.current !== null) {
      clearInterval(scrambleTimerRef.current);
      scrambleTimerRef.current = null;
    }
    if (autoDismissRef.current !== null) {
      clearTimeout(autoDismissRef.current);
      autoDismissRef.current = null;
    }

    setFading(true);
    // Wait for the CSS fade-out (0.45s skip, 0.8s auto), then unmount
    setTimeout(() => setVisible(false), 500);
  }

  useEffect(() => {
    // Detect prefers-reduced-motion on the client only
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Auto-dismiss safety timer
    autoDismissRef.current = setTimeout(dismiss, 4400);

    // Wheel listener (one-shot)
    function onWheel() {
      dismiss();
      window.removeEventListener('wheel', onWheel);
    }
    window.addEventListener('wheel', onWheel, { passive: true });

    // Keydown listener
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        dismiss();
        // listener removed inside dismiss via the done guard; clean up here too
        window.removeEventListener('keydown', onKey);
      }
    }
    window.addEventListener('keydown', onKey);

    // Build the boot log
    if (reduce) {
      // Show all lines instantly, no scramble
      setLogLines(
        BOOT_LINES.map(([text, ok]) => `${text} <span class="boot-ok">${ok}</span>`)
      );
    } else {
      let idx = 0;

      function addLine() {
        if (doneRef.current || idx >= BOOT_LINES.length) return;
        const [target, ok] = BOOT_LINES[idx];
        const lineIdx = idx; // capture so the closure is stable
        let frame = 0;

        // Seed a blank slot for this line
        setLogLines((prev) => [...prev, '']);

        scrambleTimerRef.current = setInterval(() => {
          frame++;
          if (frame >= 7) {
            clearInterval(scrambleTimerRef.current!);
            scrambleTimerRef.current = null;
            // Resolve this line in place
            setLogLines((prev) => {
              const next = [...prev];
              next[lineIdx] = `${target} <span class="boot-ok">${ok}</span>`;
              return next;
            });
            idx++;
            setTimeout(addLine, 130);
          } else {
            // Scramble this line's slot
            setLogLines((prev) => {
              const next = [...prev];
              next[lineIdx] = randomize(target);
              return next;
            });
          }
        }, 42);
      }

      addLine();
    }

    return () => {
      // Cleanup on unmount
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      if (scrambleTimerRef.current !== null) clearInterval(scrambleTimerRef.current);
      if (autoDismissRef.current !== null) clearTimeout(autoDismissRef.current);
    };
    // dismiss is stable (uses ref), safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`boot${fading ? ' boot-skip' : ''}`}
      onClick={dismiss}
      aria-hidden="true"
    >
      {/* Inline NS monogram SVG — cannot use NsMonogram.astro inside React */}
      <svg className="boot-mark" viewBox="0 0 100 100">
        <path
          pathLength={1}
          d="M20 72 V26 L52 72 V26 M82 44 C82 34 48 34 48 48 C48 62 82 58 82 74 C82 88 46 88 44 76"
        />
      </svg>

      <div className="boot-log">
        {logLines.map((line, i) => (
          // Using dangerouslySetInnerHTML because line may contain
          // the <span class="boot-ok"> markup for the resolved state.
          // The content is fully internal (no user input), so XSS is not a concern.
          <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </div>

      <div className="boot-skip-hint">click / scroll to enter</div>
    </div>
  );
}
