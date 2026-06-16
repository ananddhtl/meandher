'use client';

import { useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import PinGate from '@/components/PinGate';
import Navigation from '@/components/Navigation';
import PrayerFlags from '@/components/PrayerFlags';
import { useApp } from '@/lib/context';
import { uploadPhoto } from '@/lib/supabase';
import type { Memory } from '@/lib/types';

/* ── Add Memory Dialog ── */
function AddMemoryDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave:  (m: Omit<Memory, 'id'>) => Promise<void>;
}) {
  const [title,    setTitle]    = useState('');
  const [date,     setDate]     = useState('2026-06-28');
  const [location, setLocation] = useState('');
  const [note,     setNote]     = useState('');
  const [files,    setFiles]    = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving,   setSaving]   = useState(false);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const newFiles    = [...files, ...picked];
    const newPreviews = [...previews, ...picked.map(f => URL.createObjectURL(f))];
    setFiles(newFiles);
    setPreviews(newPreviews);
  }

  function removeFile(idx: number) {
    URL.revokeObjectURL(previews[idx]);
    setFiles(f => f.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    const photoUrls: string[] = [];
    for (const f of files) {
      try { photoUrls.push(await uploadPhoto(f, 'memories')); } catch { /* skip */ }
    }
    await onSave({ title, date, location, note, photos: photoUrls });
    setSaving(false);
    onClose();
  }

  return (
    <div className="dialog-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="paper-card w-full max-w-lg max-h-[90dvh] overflow-y-auto p-6 space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold italic" style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}>
            New Memory 📸
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
              placeholder="A magical moment title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.04 60)' }}>Date</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'oklch(0.85 0.04 80)', background: 'oklch(0.99 0.01 80)', color: 'oklch(0.25 0.05 60)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.04 60)' }}>Location</label>
              <input
                value={location} onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'oklch(0.85 0.04 80)', background: 'oklch(0.99 0.01 80)', color: 'oklch(0.25 0.05 60)' }}
                placeholder="Where were you?"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'oklch(0.45 0.04 60)' }}>Story</label>
            <textarea
              rows={4} value={note} onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
              style={{ borderColor: 'oklch(0.85 0.04 80)', background: 'oklch(0.99 0.01 80)', color: 'oklch(0.25 0.05 60)' }}
              placeholder="What happened? How did it feel?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'oklch(0.45 0.04 60)' }}>Photos</label>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="text-sm" />
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
              type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'oklch(0.55 0.15 40)' }}
            >
              {saving ? 'Saving…' : 'Save Memory ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Detail Dialog ── */
function MemoryDetail({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  return (
    <div className="dialog-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="paper-card w-full max-w-2xl max-h-[90dvh] overflow-y-auto p-6 space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl font-bold italic leading-snug"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
          >
            {memory.title}
          </h2>
          <button onClick={onClose} className="text-2xl leading-none flex-shrink-0 ml-2" style={{ color: 'oklch(0.55 0.05 60)' }}>×</button>
        </div>

        <p className="text-sm" style={{ color: 'oklch(0.50 0.04 60)' }}>
          📍 {memory.location} · {format(parseISO(memory.date), 'MMMM d, yyyy')}
        </p>

        {memory.photos.length > 0 && (
          <div className={`grid gap-2 ${memory.photos.length === 1 ? '' : 'grid-cols-2'}`}>
            {memory.photos.map((url, i) => (
              <img key={i} src={url} alt="" className="w-full rounded-xl object-cover" style={{ maxHeight: 320 }} />
            ))}
          </div>
        )}

        {memory.note && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'oklch(0.30 0.04 60)' }}>
            {memory.note}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Memory Card with 3D tilt ── */
function MemoryCard({
  memory,
  onDelete,
  onClick,
}: {
  memory: Memory;
  onDelete: (id: string) => void;
  onClick:  (m: Memory) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -12;
    el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) scale(1.01)`;
  }

  function handleMouseLeave() {
    const el = cardRef.current;
    if (el) el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)';
  }

  return (
    <div
      ref={cardRef}
      className="masonry-item paper-card overflow-hidden tilt-card cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(memory)}
    >
      {memory.photos[0] ? (
        <img src={memory.photos[0]} alt={memory.title} className="w-full object-cover" style={{ maxHeight: 280 }} />
      ) : (
        <div
          className="w-full h-36 flex items-center justify-center text-sm"
          style={{
            background: 'linear-gradient(135deg, oklch(0.88 0.06 60), oklch(0.85 0.06 80))',
            color: 'oklch(0.50 0.05 60)',
          }}
        >
          no photo yet
        </div>
      )}
      <div className="p-4 space-y-1">
        <p
          className="font-bold leading-snug"
          style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
        >
          {memory.title}
        </p>
        <p className="text-xs" style={{ color: 'oklch(0.55 0.04 60)' }}>
          {memory.location} · {format(parseISO(memory.date), 'MMM d, yyyy')}
        </p>
        {memory.note && (
          <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: 'oklch(0.40 0.04 60)' }}>
            {memory.note}
          </p>
        )}
        <button
          onClick={e => { e.stopPropagation(); onDelete(memory.id); }}
          className="mt-2 text-xs px-2 py-1 rounded hover:bg-rose-50 transition-colors"
          style={{ color: 'oklch(0.55 0.10 15)' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function MemoriesClient() {
  const { memories, addMemory, deleteMemory } = useApp();
  const [showAdd,   setShowAdd]    = useState(false);
  const [detail,    setDetail]     = useState<Memory | null>(null);
  const [monthFilter, setMonthFilter] = useState('');

  const months = useMemo(() => {
    const seen = new Set<string>();
    for (const m of memories) seen.add(m.date.slice(0, 7));
    return Array.from(seen).sort().reverse();
  }, [memories]);

  const filtered = useMemo(() => {
    if (!monthFilter) return memories;
    return memories.filter(m => m.date.startsWith(monthFilter));
  }, [memories, monthFilter]);

  return (
    <PinGate>
      <Navigation />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-24 sm:pb-10 pt-8 space-y-6">

        <PrayerFlags />

        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1
            className="text-3xl font-bold italic"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
          >
            Memory Vault 📸
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {months.length > 0 && (
              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{ borderColor: 'oklch(0.85 0.04 80)', background: 'oklch(0.99 0.01 80)', color: 'oklch(0.30 0.04 60)' }}
              >
                <option value="">All months</option>
                {months.map(m => (
                  <option key={m} value={m}>{format(parseISO(m + '-01'), 'MMMM yyyy')}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'oklch(0.55 0.15 40)' }}
            >
              + New Memory
            </button>
          </div>
        </div>

        {/* masonry grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p
              className="text-2xl"
              style={{ fontFamily: 'var(--font-dancing), cursive', color: 'oklch(0.55 0.05 60)' }}
            >
              Every adventure starts with a single step. 🏔️
            </p>
            <p className="text-sm mt-2" style={{ color: 'oklch(0.60 0.04 60)' }}>
              Add your first memory above.
            </p>
          </div>
        ) : (
          <div className="masonry">
            {filtered.map(m => (
              <MemoryCard
                key={m.id}
                memory={m}
                onDelete={deleteMemory}
                onClick={setDetail}
              />
            ))}
          </div>
        )}

        <PrayerFlags />
      </main>

      {showAdd && (
        <AddMemoryDialog
          onClose={() => setShowAdd(false)}
          onSave={addMemory}
        />
      )}

      {detail && (
        <MemoryDetail memory={detail} onClose={() => setDetail(null)} />
      )}
    </PinGate>
  );
}
