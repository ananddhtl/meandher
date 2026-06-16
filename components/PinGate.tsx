'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import PrayerFlags from './PrayerFlags';

const CORRECT_PIN = '2121';
const STORAGE_KEY = 'ons.unlocked';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked]   = useState<boolean | null>(null);
  const [digits,   setDigits]     = useState(['', '', '', '']);
  const [error,    setError]      = useState('');
  const [shaking,  setShaking]    = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  /* check localStorage on mount */
  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  useEffect(() => {
    if (unlocked === false) inputRefs[0].current?.focus();
  }, [unlocked]);

  function handleChange(idx: number, e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');

    if (val && idx < 3) inputRefs[idx + 1].current?.focus();

    if (val && idx === 3) {
      const pin = next.join('');
      if (pin === CORRECT_PIN) {
        localStorage.setItem(STORAGE_KEY, 'true');
        setUnlocked(true);
      } else {
        setShaking(true);
        setError('Wrong pin — try again');
        setTimeout(() => {
          setDigits(['', '', '', '']);
          setShaking(false);
          inputRefs[0].current?.focus();
        }, 500);
      }
    }
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  }

  /* not yet determined */
  if (unlocked === null) return null;

  /* unlocked — render app */
  if (unlocked) return <>{children}</>;

  /* locked — show PIN gate */
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[oklch(0.97_0.03_80)] px-4">
      {/* Prayer flags at top */}
      <div className="absolute top-0 left-0 right-0">
        <PrayerFlags />
      </div>

      {/* Card */}
      <div
        className={`paper-card relative p-8 sm:p-10 w-full max-w-sm text-center tape ${
          shaking ? 'animate-shake' : ''
        }`}
        style={{ transform: 'rotate(-0.4deg)' }}
      >
        {/* Script heading */}
        <p
          className="font-script text-[oklch(0.55_0.15_40)] text-lg mb-1"
          style={{ fontFamily: 'var(--font-dancing), cursive' }}
        >
          welcome to
        </p>
        <h1
          className="font-display text-2xl sm:text-3xl font-bold italic text-[oklch(0.25_0.05_60)] mb-2"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          Us Together.. K&A
        </h1>
        <p className="text-sm text-[oklch(0.45_0.04_60)] mb-8">
          Enter your PIN to continue
        </p>

        {/* OTP boxes */}
        <div className="flex justify-center gap-3 mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              className="pin-box"
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e)}
              onKeyDown={e => handleKeyDown(i, e)}
              aria-label={`PIN digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-rose-600 font-medium mt-2">{error}</p>
        )}
      </div>

      {/* Prayer flags at bottom */}
      <div className="absolute bottom-8 left-0 right-0">
        <PrayerFlags />
      </div>
    </div>
  );
}
