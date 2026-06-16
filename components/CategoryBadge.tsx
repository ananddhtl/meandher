import { CATEGORY_META } from '@/lib/types';
import type { EventCategory } from '@/lib/types';

export default function CategoryBadge({ category }: { category: EventCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.text}`}
    >
      <span>{meta.emoji}</span>
      {category}
    </span>
  );
}
