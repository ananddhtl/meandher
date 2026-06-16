'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from 'date-fns';
import PinGate from '@/components/PinGate';
import Navigation from '@/components/Navigation';
import PrayerFlags from '@/components/PrayerFlags';
import CategoryBadge from '@/components/CategoryBadge';
import { useApp } from '@/lib/context';
import { uploadPhoto } from '@/lib/supabase';
import { CATEGORY_META, type EventCategory, type TripEvent } from '@/lib/types';

const CATEGORIES: EventCategory[] = ['Adventure','Romantic','Food','Cultural','Rest','Travel','Milestone'];
const TRIP_START = '2026-06-28';
const TRIP_END   = '2026-08-28';

/* ── Confetti burst ── */
function spawnConfetti(origin: { x: number; y: number }) {
  const colors = ['#f97316','#f43f5e','#d97706','#16a34a','#2563eb','#9333ea','#ca8a04'];
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    const angle = (Math.PI * 2 * i) / 22;
    const dist  = 80 + Math.random() * 60;
    el.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:8px; height:8px; border-radius:2px;
      background:${colors[i % colors.length]};
      left:${origin.x}px; top:${origin.y}px;
      --tx:${Math.cos(angle) * dist}px;
      --ty:${Math.sin(angle) * dist - 40}px;
    `;
    el.className = 'animate-confetti';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }
}

/* ── Heart burst ── */
function spawnHeart(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const h = document.createElement('div');
  h.textContent = '❤️';
  h.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    font-size:24px;
    left:${rect.left + rect.width / 2 - 12}px;
    top:${rect.top - 10}px;
  `;
  h.className = 'animate-heart';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 850);
}

/* ── Add Event Dialog ── */
function AddEventDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave:  (e: Omit<TripEvent, 'id'>) => Promise<void>;
}) {
  const [title,    setTitle]    = useState('');
  const [date,     setDate]     = useState(TRIP_START);
  const [category, setCategory] = useState<EventCategory>('Adventure');
  const [location, setLocation] = useState('');
  const [notes,    setNotes]    = useState('');
  const [file,     setFile]     = useState<File | null>(null);
  const [preview,  setPreview]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) return;
    setSaving(true);
    let photoUrl: string | undefined;
    if (file) {
      try { photoUrl = await uploadPhoto(file, 'events'); } catch { /* ignore */ }
    }
    const rect = btnRef.current?.getBoundingClientRect();
    await onSave({ title, date, category, location, notes, photo: photoUrl, status: 'planned' });
    if (rect) spawnConfetti({ x: rect.left + rect.width / 2, y: rect.top });
    setSaving(false);
    onClose();
  }

  return (
    <div className="dialog-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="paper-card w-full max-w-lg max-h-[90dvh] overflow-y-auto p-6 space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold italic" style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}>
            New Event
          </h2>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: 'oklch(0.55 0.05 60)' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.04 60)' }}>Title *</label>
            <input
              required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'oklch(0.85 0.04 80)', background: 'oklch(0.99 0.01 80)', color: 'oklch(0.25 0.05 60)' }}
              placeholder="Event title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.04 60)' }}>Date *</label>
              <input
                required type="date" value={date} onChange={e => setDate(e.target.value)}
                min={TRIP_START} max={TRIP_END}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'oklch(0.85 0.04 80)', background: 'oklch(0.99 0.01 80)', color: 'oklch(0.25 0.05 60)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.04 60)' }}>Category</label>
              <select
                value={category} onChange={e => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'oklch(0.85 0.04 80)', background: 'oklch(0.99 0.01 80)', color: 'oklch(0.25 0.05 60)' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_META[c].emoji} {c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.04 60)' }}>Location</label>
            <input
              value={location} onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'oklch(0.85 0.04 80)', background: 'oklch(0.99 0.01 80)', color: 'oklch(0.25 0.05 60)' }}
              placeholder="e.g. Pokhara, Nepal"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.04 60)' }}>Notes</label>
            <textarea
              rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
              style={{ borderColor: 'oklch(0.85 0.04 80)', background: 'oklch(0.99 0.01 80)', color: 'oklch(0.25 0.05 60)' }}
              placeholder="Any details…"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.04 60)' }}>Photo</label>
            <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
            {preview && (
              <img src={preview} alt="preview" className="mt-2 h-28 w-full object-cover rounded-lg" />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border text-sm font-medium"
              style={{ borderColor: 'oklch(0.85 0.04 80)', color: 'oklch(0.45 0.04 60)' }}
            >
              Cancel
            </button>
            <button
              ref={btnRef} type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'oklch(0.55 0.15 40)' }}
            >
              {saving ? 'Saving…' : 'Save Event ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Timeline view ── */
function TimelineView({ events, onMarkDone, onDelete }: {
  events: TripEvent[];
  onMarkDone: (id: string, el: HTMLElement) => void;
  onDelete:   (id: string) => void;
}) {
  const grouped: Record<string, TripEvent[]> = {};
  for (const ev of events) {
    const month = ev.date.slice(0, 7);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(ev);
  }

  if (!events.length) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl" style={{ fontFamily: 'var(--font-dancing), cursive', color: 'oklch(0.55 0.05 60)' }}>
          No adventures planned yet — add one! 🏕️
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([month, evs]) => (
        <div key={month}>
          <h3
            className="text-sm font-semibold uppercase tracking-widest mb-4 pb-2 border-b"
            style={{ color: 'oklch(0.55 0.05 60)', borderColor: 'oklch(0.88 0.04 80)' }}
          >
            {format(parseISO(month + '-01'), 'MMMM yyyy')}
          </h3>
          <div className="relative pl-6">
            <div className="timeline-line" />
            <div className="space-y-4">
              {evs.map(ev => {
                const meta = CATEGORY_META[ev.category];
                return (
                  <div key={ev.id} className="relative">
                    {/* dot */}
                    <div
                      className="absolute -left-[25px] top-4 w-4 h-4 rounded-full border-2 border-white"
                      style={{ background: meta.dot }}
                    />
                    <div
                      className={`paper-card p-4 space-y-2 transition-opacity ${ev.status === 'done' ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <CategoryBadge category={ev.category} />
                          <p
                            className="font-bold text-base leading-snug"
                            style={{
                              fontFamily: 'var(--font-playfair), serif',
                              color: 'oklch(0.25 0.05 60)',
                              textDecoration: ev.status === 'done' ? 'line-through' : 'none',
                            }}
                          >
                            {ev.title}
                          </p>
                          <p className="text-xs font-medium" style={{ color: 'oklch(0.55 0.15 40)' }}>
                            {format(parseISO(ev.date), 'EEEE, MMMM d')}
                          </p>
                          {ev.location && (
                            <p className="flex items-center gap-1 text-xs" style={{ color: 'oklch(0.50 0.04 60)' }}>
                              <span>📍</span> {ev.location}
                            </p>
                          )}
                          {ev.notes && (
                            <p className="text-xs mt-1" style={{ color: 'oklch(0.45 0.04 60)' }}>
                              {ev.notes}
                            </p>
                          )}
                        </div>
                        {ev.photo && (
                          <img src={ev.photo} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        {ev.status !== 'done' && (
                          <button
                            onClick={e => onMarkDone(ev.id, e.currentTarget)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                            style={{ background: 'oklch(0.94 0.06 10)', color: 'oklch(0.50 0.15 15)' }}
                          >
                            ❤️ Mark done
                          </button>
                        )}
                        {ev.status === 'done' && (
                          <span className="text-xs font-medium" style={{ color: 'oklch(0.55 0.10 140)' }}>
                            ✓ Done
                          </span>
                        )}
                        <button
                          onClick={() => onDelete(ev.id)}
                          className="ml-auto text-xs px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                          style={{ color: 'oklch(0.55 0.10 15)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Calendar view ── */
function CalendarView({ events, today }: { events: TripEvent[]; today: string }) {
  const eventsByDate: Record<string, TripEvent[]> = {};
  for (const ev of events) {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  }

  const months: Date[] = [];
  let cur = new Date('2026-06-01');
  while (cur <= new Date('2026-08-01')) {
    months.push(new Date(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div className="space-y-8">
      {months.map(monthDate => {
        const days = eachDayOfInterval({
          start: startOfMonth(monthDate),
          end:   endOfMonth(monthDate),
        });
        const firstDow = getDay(days[0]);

        return (
          <div key={monthDate.toISOString()} className="paper-card p-4 sm:p-6">
            <h3
              className="text-lg font-bold italic mb-4"
              style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
            >
              {format(monthDate, 'MMMM yyyy')}
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold uppercase pb-1" style={{ color: 'oklch(0.60 0.05 60)' }}>
                  {d}
                </div>
              ))}
              {/* empty cells before first day */}
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {days.map(day => {
                const iso = format(day, 'yyyy-MM-dd');
                const inTrip = iso >= TRIP_START && iso <= TRIP_END;
                const dayEvents = eventsByDate[iso] ?? [];
                const isToday = today !== '' && iso === today;

                return (
                  <div
                    key={iso}
                    className="min-h-[56px] rounded-lg p-1 text-xs"
                    style={{
                      background: isToday
                        ? 'oklch(0.95 0.05 40)'
                        : inTrip
                        ? 'oklch(0.98 0.01 80)'
                        : 'oklch(0.93 0.02 80)',
                      opacity: inTrip ? 1 : 0.4,
                    }}
                  >
                    <div
                      className="font-medium mb-0.5"
                      style={{ color: isToday ? 'oklch(0.45 0.15 40)' : 'oklch(0.40 0.04 60)' }}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div
                          key={ev.id}
                          className="truncate rounded px-1 text-[9px] font-medium"
                          style={{
                            background: CATEGORY_META[ev.category].dot + '30',
                            color: 'oklch(0.30 0.05 60)',
                          }}
                        >
                          {CATEGORY_META[ev.category].emoji} {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px]" style={{ color: 'oklch(0.55 0.05 60)' }}>
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main ── */
export default function PlanClient() {
  const { events, addEvent, updateEventStatus, deleteEvent } = useApp();
  const [view,     setView]     = useState<'timeline' | 'calendar'>('timeline');
  const [showAdd,  setShowAdd]  = useState(false);
  const [today,    setToday]    = useState('');

  useEffect(() => { setToday(new Date().toISOString().slice(0, 10)); }, []);

  const handleMarkDone = useCallback((id: string, el: HTMLElement) => {
    spawnHeart(el);
    updateEventStatus(id, 'done');
  }, [updateEventStatus]);

  return (
    <PinGate>
      <Navigation />
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-24 sm:pb-10 pt-8 space-y-6">

        <PrayerFlags />

        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1
            className="text-3xl font-bold italic"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
          >
            The Plan 📋
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {/* view toggle */}
            <div className="flex rounded-lg border overflow-hidden text-sm" style={{ borderColor: 'oklch(0.85 0.04 80)' }}>
              {(['timeline','calendar'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-1.5 capitalize font-medium transition-colors"
                  style={{
                    background: view === v ? 'oklch(0.55 0.15 40)' : 'oklch(0.99 0.01 80)',
                    color: view === v ? 'white' : 'oklch(0.45 0.04 60)',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'oklch(0.55 0.15 40)' }}
            >
              + New Event
            </button>
          </div>
        </div>

        {/* views */}
        {view === 'timeline' ? (
          <TimelineView events={events} onMarkDone={handleMarkDone} onDelete={deleteEvent} />
        ) : (
          <CalendarView events={events} today={today} />
        )}

        <PrayerFlags />
      </main>

      {showAdd && (
        <AddEventDialog
          onClose={() => setShowAdd(false)}
          onSave={addEvent}
        />
      )}
    </PinGate>
  );
}
