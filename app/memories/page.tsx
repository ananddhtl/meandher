import type { Metadata } from 'next';
import MemoriesClient from './MemoriesClient';

export const metadata: Metadata = { title: 'Memory Vault' };

export default function MemoriesPage() {
  return <MemoriesClient />;
}
