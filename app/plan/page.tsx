import type { Metadata } from 'next';
import PlanClient from './PlanClient';

export const metadata: Metadata = { title: 'The Plan' };

export default function PlanPage() {
  return <PlanClient />;
}
