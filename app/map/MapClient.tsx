'use client';

import dynamic from 'next/dynamic';
import PinGate from '@/components/PinGate';
import Navigation from '@/components/Navigation';
import PrayerFlags from '@/components/PrayerFlags';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-2xl flex items-center justify-center"
      style={{ height: 520, background: 'oklch(0.95 0.03 80)' }}
    >
      <p
        className="text-xl"
        style={{ fontFamily: 'var(--font-dancing), cursive', color: 'oklch(0.55 0.05 60)' }}
      >
        unfolding the map…
      </p>
    </div>
  ),
});

export default function MapClient() {
  return (
    <PinGate>
      <Navigation />
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-24 sm:pb-10 pt-8 space-y-6">

        <PrayerFlags />

        <div className="flex items-center justify-between">
          <h1
            className="text-3xl font-bold italic"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'oklch(0.25 0.05 60)' }}
          >
            Trip Map 🗺️
          </h1>
          <p className="text-sm" style={{ color: 'oklch(0.55 0.05 60)' }}>
            Nepal · June 28 – August 28, 2026
          </p>
        </div>

        <LeafletMap />

        <PrayerFlags />
      </main>
    </PinGate>
  );
}
