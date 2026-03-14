export default function TimelineLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
        {[1, 2].map(i => (
          <div key={i} className="mb-10">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="rounded-xl overflow-hidden">
                  <div className="h-40 bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
