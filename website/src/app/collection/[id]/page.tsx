import Link from "next/link";
import { fetchCollection } from "@/lib/api";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await fetchCollection(id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1 text-navy/60 hover:text-navy mb-6 text-sm font-medium"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div
        className="rounded-3xl p-8 md:p-12 text-white mb-8"
        style={{
          background: `linear-gradient(135deg, ${collection.gradientColors[0]}, ${collection.gradientColors[1]})`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-white/20 rounded-full">
            {collection.type}
          </span>
          {collection.isPremium && (
            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-white/20 rounded-full">
              Premium
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          {collection.title}
        </h1>
        <p className="mt-3 text-white/80 text-lg">{collection.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
          <span>{collection.totalSessions} sessions</span>
          <span>~{collection.estimatedDailyMinutes} min/day</span>
        </div>
      </div>

      {/* Items */}
      <h2 className="text-xl font-bold text-navy mb-4">Sessions</h2>
      <div className="space-y-3">
        {collection.items.map((item, index) => {
          const minutes = item.durationSeconds
            ? Math.ceil(item.durationSeconds / 60)
            : null;
          return (
            <Link
              key={item.id}
              href={`/content/${item.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-full bg-beige-dark flex items-center justify-center text-sm font-bold text-navy/50 shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy group-hover:text-orange transition-colors truncate">
                  {item.title}
                </h3>
                <p className="text-sm text-navy/50 truncate">
                  {item.type}
                  {minutes ? ` · ${minutes} min` : ""}
                  {item.instructor ? ` · ${item.instructor.name}` : ""}
                </p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-navy/30 shrink-0">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
