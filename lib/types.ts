export type EventCategory =
  | 'Adventure'
  | 'Romantic'
  | 'Food'
  | 'Cultural'
  | 'Rest'
  | 'Travel'
  | 'Milestone';

export type EventStatus = 'planned' | 'today' | 'done';

export interface TripEvent {
  id: string;
  title: string;
  date: string;       // ISO yyyy-mm-dd
  location: string;
  category: EventCategory;
  notes?: string;
  photo?: string;     // public URL
  photo_url?: string; // raw DB field alias
  status: EventStatus;
  lat?: number;
  lng?: number;
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  location: string;
  note: string;
  photos: string[];   // array of public URLs
  photo_urls?: string[];
  lat?: number;
  lng?: number;
}

export const CATEGORY_META: Record<
  EventCategory,
  { emoji: string; bg: string; text: string; dot: string }
> = {
  Adventure: { emoji: '⛰️', bg: 'bg-orange-100', text: 'text-orange-800', dot: '#f97316' },
  Romantic:  { emoji: '💖', bg: 'bg-rose-100',   text: 'text-rose-800',   dot: '#f43f5e' },
  Food:      { emoji: '🍜', bg: 'bg-amber-100',  text: 'text-amber-800',  dot: '#d97706' },
  Cultural:  { emoji: '🛕', bg: 'bg-purple-100', text: 'text-purple-800', dot: '#9333ea' },
  Rest:      { emoji: '🌿', bg: 'bg-green-100',  text: 'text-green-800',  dot: '#16a34a' },
  Travel:    { emoji: '🚌', bg: 'bg-blue-100',   text: 'text-blue-800',   dot: '#2563eb' },
  Milestone: { emoji: '✨', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: '#ca8a04' },
};
