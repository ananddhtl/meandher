'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { supabase } from './supabase';
import type { TripEvent, Memory } from './types';

interface AppContextValue {
  events: TripEvent[];
  memories: Memory[];
  loveNote: string;
  loading: boolean;
  addEvent: (e: Omit<TripEvent, 'id'>) => Promise<void>;
  updateEventStatus: (id: string, status: TripEvent['status']) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addMemory: (m: Omit<Memory, 'id'>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  setLoveNote: (text: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events,    setEvents]    = useState<TripEvent[]>([]);
  const [memories,  setMemories]  = useState<Memory[]>([]);
  const [loveNote,  setLoveNoteState] = useState('Today I\'m excited because…');
  const [loading,   setLoading]   = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── initial load ── */
  useEffect(() => {
    async function load() {
      const [evRes, memRes, noteRes] = await Promise.all([
        supabase.from('events').select('*').order('date'),
        supabase.from('memories').select('*').order('created_at', { ascending: false }),
        supabase.from('love_note').select('content').eq('id', 1).single(),
      ]);

      if (evRes.data) {
        setEvents(
          (evRes.data as Record<string, unknown>[]).map(r => ({
            id:       r.id       as string,
            title:    r.title    as string,
            date:     r.date     as string,
            location: (r.location as string) ?? '',
            category: r.category as TripEvent['category'],
            notes:    r.notes    as string | undefined,
            photo:    r.photo_url as string | undefined,
            status:   r.status   as TripEvent['status'],
            lat:      r.lat      as number | undefined,
            lng:      r.lng      as number | undefined,
          }) satisfies TripEvent),
        );
      }
      if (memRes.data) {
        setMemories(
          (memRes.data as Record<string, unknown>[]).map(r => ({
            id:       r.id       as string,
            title:    r.title    as string,
            date:     r.date     as string,
            location: (r.location as string) ?? '',
            note:     (r.note    as string) ?? '',
            photos:   (r.photo_urls as string[] | null) ?? [],
            lat:      r.lat      as number | undefined,
            lng:      r.lng      as number | undefined,
          }) satisfies Memory),
        );
      }
      if (noteRes.data) setLoveNoteState(noteRes.data.content as string);
      setLoading(false);
    }
    load();
  }, []);

  /* ── love note debounce ── */
  const setLoveNote = useCallback((text: string) => {
    setLoveNoteState(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('love_note')
        .update({ content: text })
        .eq('id', 1);
      if (error) toast.error('Could not save note');
    }, 1000);
  }, []);

  /* ── add event ── */
  const addEvent = useCallback(async (ev: Omit<TripEvent, 'id'>) => {
    const optimistic: TripEvent = { ...ev, id: crypto.randomUUID() };
    setEvents(prev => [...prev, optimistic].sort((a, b) => a.date.localeCompare(b.date)));
    const { data, error } = await supabase
      .from('events')
      .insert({
        title:     ev.title,
        date:      ev.date,
        location:  ev.location,
        category:  ev.category,
        notes:     ev.notes,
        photo_url: ev.photo,
        status:    ev.status,
        lat:       ev.lat,
        lng:       ev.lng,
      })
      .select()
      .single();
    if (error) {
      setEvents(prev => prev.filter(e => e.id !== optimistic.id));
      toast.error('Failed to save event');
    } else {
      setEvents(prev =>
        prev.map(e =>
          e.id === optimistic.id
            ? ({
                id: data.id, title: data.title, date: data.date,
                location: data.location ?? '', category: data.category,
                notes: data.notes, photo: data.photo_url,
                status: data.status, lat: data.lat, lng: data.lng,
              } satisfies TripEvent)
            : e,
        ),
      );
      toast.success('Event added!');
    }
  }, []);

  /* ── update event status ── */
  const updateEventStatus = useCallback(
    async (id: string, status: TripEvent['status']) => {
      setEvents(prev => prev.map(e => (e.id === id ? { ...e, status } : e)));
      const { error } = await supabase.from('events').update({ status }).eq('id', id);
      if (error) {
        toast.error('Failed to update event');
      }
    },
    [],
  );

  /* ── delete event ── */
  const deleteEvent = useCallback(async (id: string) => {
    const prev = events;
    setEvents(p => p.filter(e => e.id !== id));
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      setEvents(prev);
      toast.error('Failed to delete event');
    } else {
      toast.success('Event deleted');
    }
  }, [events]);

  /* ── add memory ── */
  const addMemory = useCallback(async (mem: Omit<Memory, 'id'>) => {
    const optimistic: Memory = { ...mem, id: crypto.randomUUID() };
    setMemories(prev => [optimistic, ...prev]);
    const { data, error } = await supabase
      .from('memories')
      .insert({
        title:      mem.title,
        date:       mem.date,
        location:   mem.location,
        note:       mem.note,
        photo_urls: mem.photos,
        lat:        mem.lat,
        lng:        mem.lng,
      })
      .select()
      .single();
    if (error) {
      setMemories(prev => prev.filter(m => m.id !== optimistic.id));
      toast.error('Failed to save memory');
    } else {
      setMemories(prev =>
        prev.map(m =>
          m.id === optimistic.id
            ? ({
                id: data.id, title: data.title, date: data.date,
                location: data.location ?? '', note: data.note ?? '',
                photos: data.photo_urls ?? [], lat: data.lat, lng: data.lng,
              } satisfies Memory)
            : m,
        ),
      );
      toast.success('Memory saved!');
    }
  }, []);

  /* ── delete memory ── */
  const deleteMemory = useCallback(async (id: string) => {
    const prev = memories;
    setMemories(p => p.filter(m => m.id !== id));
    const { error } = await supabase.from('memories').delete().eq('id', id);
    if (error) {
      setMemories(prev);
      toast.error('Failed to delete memory');
    } else {
      toast.success('Memory deleted');
    }
  }, [memories]);

  return (
    <AppContext.Provider
      value={{
        events, memories, loveNote, loading,
        addEvent, updateEventStatus, deleteEvent,
        addMemory, deleteMemory, setLoveNote,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
