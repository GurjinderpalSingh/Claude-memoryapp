import Link from 'next/link';

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/timeline" className="flex items-center gap-2 font-bold text-lg text-emerald-700">
          <span className="text-2xl">📍</span>
          <span>My Places</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/timeline"
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Timeline
          </Link>
          <Link
            href="/map"
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Map
          </Link>
          <Link
            href="/categories"
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/places/new"
            className="ml-2 px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            + Add Place
          </Link>
        </div>
      </div>
    </nav>
  );
}
