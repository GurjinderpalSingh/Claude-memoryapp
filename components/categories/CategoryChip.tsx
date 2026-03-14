'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryChipProps {
  name: string;
  count?: number;
  active: boolean;
}

export function CategoryChip({ name, count, active }: CategoryChipProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    if (active) {
      params.delete('category');
    } else {
      params.set('category', name);
    }
    router.push(`/categories?${params.toString()}`);
  }

  return (
    <button
      onClick={handleClick}
      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span className="capitalize">{name}</span>
      {count !== undefined && (
        <span className={`ml-1.5 text-xs ${active ? 'text-emerald-100' : 'text-gray-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
