import type { Metadata } from 'next';
import DateIdeasClient from './DateIdeasClient';

export const metadata: Metadata = { title: 'Plan a Date' };

export default function DateIdeasPage() {
  return <DateIdeasClient />;
}
