import Link from "next/link";
import { fetchContent } from "@/lib/api";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await fetchContent(id);

  const minutes = content.durationSeconds
    ? Math.ceil(content.durationSeconds / 60)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/today"
        className="inline-flex items-center gap-1 text-navy/60 hover:text-navy mb-6 text-sm font-medium"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-navy to-navy-light rounded-3xl p-8 md:p-12 text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-white/20 rounded-full">
            {content.type}
          </span>
          {content.isPremium && (
            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-orange/80 rounded-full">
              Premium
            </span>
          )}
          {content.difficulty && (
            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-white/10 rounded-full">
              {content.difficulty}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{content.title}</h1>
        <p className="mt-3 text-white/70 text-lg leading-relaxed">
          {content.description}
        </p>
        <div className="mt-6 flex items-center gap-6">
          {minutes && (
            <span className="text-sm text-white/60">{minutes} min</span>
          )}
          {content.instructor && (
            <span className="text-sm text-white/60">
              with {content.instructor.name}
            </span>
          )}
        </div>
      </div>

      {/* Play Button */}
      <div className="flex justify-center mb-8">
        <button className="w-20 h-20 rounded-full bg-orange flex items-center justify-center shadow-lg shadow-orange/25 hover:bg-orange/90 transition-colors">
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </button>
      </div>

      {/* Tags */}
      {content.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-white rounded-full text-sm text-navy/70 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
