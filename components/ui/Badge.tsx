interface BadgeProps {
  label: string;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: 'bg-orange-100 text-orange-700',
  restaurants: 'bg-orange-100 text-orange-700',
  hiking: 'bg-green-100 text-green-700',
  sports: 'bg-blue-100 text-blue-700',
  travel: 'bg-purple-100 text-purple-700',
  cafe: 'bg-yellow-100 text-yellow-700',
  bar: 'bg-red-100 text-red-700',
  museum: 'bg-indigo-100 text-indigo-700',
};

function getCategoryColor(category: string): string {
  const key = category.toLowerCase();
  return CATEGORY_COLORS[key] ?? 'bg-gray-100 text-gray-700';
}

export function Badge({ label, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getCategoryColor(label)} ${className}`}
    >
      {label}
    </span>
  );
}
