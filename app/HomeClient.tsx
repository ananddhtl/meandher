'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import PinGate from '@/components/PinGate';
import Navigation from '@/components/Navigation';
import PrayerFlags from '@/components/PrayerFlags';
import CategoryBadge from '@/components/CategoryBadge';
import { useApp } from '@/lib/context';

const TRIP_START = new Date('2026-06-28T00:00:00');

function useCountdown(target: Date) {
  // Initialize to 0 to match SSR; correct value is set after mount
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    setDiff(target.getTime() - Date.now());
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const arrived = diff <= 0;
  const days    = Math.floor(Math.abs(diff) / 86_400_000);
  const hours   = Math.floor((Math.abs(diff) % 86_400_000) / 3_600_000);
  const minutes = Math.floor((Math.abs(diff) % 3_600_000) / 60_000);
  const seconds = Math.floor((Math.abs(diff) % 60_000) / 1000);
  return { arrived, days, hours, minutes, seconds };
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-box">
      <div
        className="text-3xl sm:text-4xl font-bold tabular-nums"
        style={{ color: 'oklch(0.55 0.15 40)', fontFamily: 'var(--font-playfair), serif' }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'oklch(0.55 0.05 60)' }}>
        {label}
      </div>
    </div>
  );
}

export default function HomeClient() {
  const { events, memories, loveNote, setLoveNote } = useApp();
  const { arrived, days, hours, minutes, seconds }  = useCountdown(TRIP_START);

  // Derive after mount to avoid SSR/client mismatch
  const [today, setToday] = useState('');
  const [randomMemory, setRandomMemory] = useState<typeof memories[0] | null>(null);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!memories.length) { setRandomMemory(null); return; }
    setRandomMemory(memories[Math.floor(Math.random() * memories.length)]);
  }, [memories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextEvent = useMemo(
    () => today ? events.find(e => e.date >= today && e.status !== 'done') : undefined,
    [events, today],
  );

  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  function handleNoteInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
    setLoveNote(el.value);
  }

  return (
    <PinGate>
      <Navigation />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-24 sm:pb-8 pt-8 space-y-10">

        {/* ── Prayer flags top ── */}
        <PrayerFlags />

        {/* ── Hero / title ── */}
        <section className="text-center space-y-1">
          <p
            className="text-xl"
            style={{ fontFamily: 'var(--font-dancing), cursive', color: 'oklch(0.55 0.15 40)' }}
          >
            welcome to
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold italic leading-tight"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
          >
            Us Together.. K&A
          </h1>
          <p className="text-sm" style={{ color: 'oklch(0.55 0.05 60)' }}>
            Our private Nepal adventure journal
          </p>
        </section>

        {/* ── Countdown ── */}
        <section className="paper-card p-6 sm:p-8 text-center space-y-4">
          {arrived ? (
            <p
              className="text-2xl sm:text-3xl"
              style={{ fontFamily: 'var(--font-dancing), cursive', color: 'oklch(0.55 0.15 40)' }}
            >
              The story begins today. 🏔️
            </p>
          ) : (
            <>
              <p className="text-sm font-medium uppercase tracking-widest" style={{ color: 'oklch(0.55 0.05 60)' }}>
                Counting down to Nepal
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <CountdownBox value={days}    label="days"    />
                <CountdownBox value={hours}   label="hours"   />
                <CountdownBox value={minutes} label="minutes" />
                <CountdownBox value={seconds} label="seconds" />
              </div>
            </>
          )}
          <p className="text-sm" style={{ color: 'oklch(0.55 0.05 60)' }}>
            June 28, 2026 · Tribhuvan International, Kathmandu
          </p>
        </section>

        {/* ── Love note + Quick add (side by side on md+) ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Love note */}
          <section className="space-y-2">
            <h2
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'oklch(0.55 0.05 60)' }}
            >
              Our note
            </h2>
            <div className="sticky-note p-5 relative">
              <textarea
                ref={noteRef}
                value={loveNote}
                onChange={handleNoteInput}
                rows={5}
                className="w-full bg-transparent resize-none focus:outline-none text-lg leading-relaxed"
                style={{
                  fontFamily: 'var(--font-dancing), cursive',
                  color: 'oklch(0.30 0.06 60)',
                  minHeight: 120,
                }}
                placeholder="Today I'm excited because…"
              />
            </div>
          </section>

          {/* Quick add */}
          <section className="space-y-2">
            <h2
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'oklch(0.55 0.05 60)' }}
            >
              Quick add
            </h2>
            <div className="paper-card p-5 space-y-3 h-full">
              {[
                { href: '/plan',       label: '📋  New event',        desc: 'Add to the itinerary' },
                { href: '/memories',   label: '📸  New memory',       desc: 'Capture a moment' },
                { href: '/date-ideas', label: '✨  Ask for a date idea', desc: 'AI date suggestions' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[oklch(0.88_0.04_80)] hover:border-[oklch(0.55_0.15_40)] hover:bg-[oklch(0.96_0.03_80)] transition-colors group"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm" style={{ color: 'oklch(0.25 0.05 60)' }}>
                      {item.label}
                    </div>
                    <div className="text-xs" style={{ color: 'oklch(0.55 0.05 60)' }}>
                      {item.desc}
                    </div>
                  </div>
                  <span className="text-[oklch(0.55_0.15_40)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Next up + Memory of the day ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Next up */}
          <section className="space-y-2">
            <h2
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'oklch(0.55 0.05 60)' }}
            >
              Next up
            </h2>
            {nextEvent ? (
              <div className="paper-card p-5 space-y-2">
                <CategoryBadge category={nextEvent.category} />
                <p
                  className="text-xl font-bold leading-snug"
                  style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
                >
                  {nextEvent.title}
                </p>
                {nextEvent.location && (
                  <p className="flex items-center gap-1 text-sm" style={{ color: 'oklch(0.45 0.05 60)' }}>
                    <span>📍</span> {nextEvent.location}
                  </p>
                )}
                <p className="text-sm font-medium" style={{ color: 'oklch(0.55 0.15 40)' }}>
                  {format(parseISO(nextEvent.date), 'EEEE, MMMM d')}
                </p>
              </div>
            ) : (
              <div className="paper-card p-5 text-center">
                <p
                  className="text-lg"
                  style={{ fontFamily: 'var(--font-dancing), cursive', color: 'oklch(0.55 0.05 60)' }}
                >
                  No upcoming events yet — add some! 🗓️
                </p>
              </div>
            )}
          </section>

          {/* Memory of the day */}
          <section className="space-y-2">
            <h2
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'oklch(0.55 0.05 60)' }}
            >
              Memory of the day
            </h2>
            {randomMemory ? (
              <div className="paper-card overflow-hidden">
                {randomMemory.photos[0] && (
                  <img
                    src={randomMemory.photos[0]}
                    alt={randomMemory.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 space-y-1">
                  <p
                    className="font-bold"
                    style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
                  >
                    {randomMemory.title}
                  </p>
                  <p className="text-xs" style={{ color: 'oklch(0.55 0.05 60)' }}>
                    {randomMemory.location} · {format(parseISO(randomMemory.date), 'MMM d')}
                  </p>
                  {randomMemory.note && (
                    <p className="text-sm line-clamp-3" style={{ color: 'oklch(0.35 0.04 60)' }}>
                      {randomMemory.note}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="paper-card p-5 text-center">
                <p
                  className="text-lg"
                  style={{ fontFamily: 'var(--font-dancing), cursive', color: 'oklch(0.55 0.05 60)' }}
                >
                  Your memories are waiting to be made. Start June 28. 🏔️
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ── Prayer flags bottom ── */}
        <PrayerFlags />
      </main>
    </PinGate>
  );
}
