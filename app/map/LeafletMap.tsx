'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format, parseISO } from 'date-fns';
import { useApp } from '@/lib/context';

/* Fix default Leaflet icon paths broken by bundlers */
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const memoryIcon = new L.Icon({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [20, 32],
  iconAnchor:  [10, 32],
  popupAnchor: [0, -32],
  className:   'hue-rotate-[220deg]',
});

export default function LeafletMap() {
  const { events, memories } = useApp();

  const pinnedEvents   = events.filter(e => e.lat && e.lng);
  const pinnedMemories = memories.filter(m => m.lat && m.lng);

  useEffect(() => {
    /* remove leaflet's default attribution link styling conflict with Tailwind */
  }, []);

  return (
    <div style={{ height: 520 }} className="w-full rounded-2xl overflow-hidden border border-[oklch(0.88_0.04_80)] shadow-md">
      <MapContainer
        center={[28.2, 84.0]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pinnedEvents.map(ev => (
          <Marker key={ev.id} position={[ev.lat!, ev.lng!]}>
            <Popup>
              <div className="text-sm space-y-0.5">
                <p className="text-[10px] uppercase font-bold tracking-wide" style={{ color: 'oklch(0.55 0.15 40)' }}>Event</p>
                <p className="font-bold">{ev.title}</p>
                {ev.location && <p className="text-xs">📍 {ev.location}</p>}
                <p className="text-xs">{format(parseISO(ev.date), 'MMM d, yyyy')}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {pinnedMemories.map(mem => (
          <Marker key={mem.id} position={[mem.lat!, mem.lng!]} icon={memoryIcon}>
            <Popup>
              <div className="text-sm space-y-0.5">
                <p className="text-[10px] uppercase font-bold tracking-wide" style={{ color: 'oklch(0.5 0.12 220)' }}>Memory</p>
                <p className="font-bold">{mem.title}</p>
                {mem.location && <p className="text-xs">📍 {mem.location}</p>}
                <p className="text-xs">{format(parseISO(mem.date), 'MMM d, yyyy')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
