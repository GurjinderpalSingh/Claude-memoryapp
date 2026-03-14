import { Suspense } from 'react';
import { CategoryChip } from './CategoryChip';
import type { CategoryCount } from '@/lib/db';

interface CategoryFilterProps {
  categories: CategoryCount[];
  activeCategory?: string;
}

function CategoryFilterInner({ categories, activeCategory }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <CategoryChip name="All" active={!activeCategory} />
      {categories.map(cat => (
        <CategoryChip
          key={cat.name}
          name={cat.name}
          count={cat.count}
          active={activeCategory === cat.name}
        />
      ))}
    </div>
  );
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  return (
    <Suspense fallback={<div className="h-10" />}>
      <CategoryFilterInner categories={categories} activeCategory={activeCategory} />
    </Suspense>
  );
}
