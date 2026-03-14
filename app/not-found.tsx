import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-4">🗺️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">The place you're looking for doesn't exist.</p>
      <Link href="/timeline" className="text-emerald-600 hover:underline">
        Back to Timeline
      </Link>
    </main>
  );
}
