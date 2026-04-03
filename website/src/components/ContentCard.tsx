import Link from "next/link";

interface ContentCardProps {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  durationLabel?: string | null;
  gradientColors: [string, string];
  progressSeconds?: number;
  durationSeconds?: number;
}

export default function ContentCard({
  id,
  title,
  subtitle,
  type,
  durationLabel,
  gradientColors,
  progressSeconds,
  durationSeconds,
}: ContentCardProps) {
  const progress =
    progressSeconds && durationSeconds
      ? Math.round((progressSeconds / durationSeconds) * 100)
      : null;

  return (
    <Link href={`/content/${id}`} className="block group">
      <div
        className="rounded-2xl p-5 min-w-[200px] h-[180px] flex flex-col justify-between text-white shadow-md transition-transform group-hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        }}
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {type}
          </span>
          <h3 className="text-lg font-bold mt-1 leading-snug line-clamp-2">{title}</h3>
        </div>
        <div className="flex items-center justify-between">
          {durationLabel && (
            <span className="text-sm opacity-80">{durationLabel}</span>
          )}
          {progress !== null && (
            <div className="flex-1 ml-3">
              <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
