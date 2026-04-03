import Link from "next/link";

const iconMap: Record<string, string> = {
  "circle.fill": "🧘",
  "moon.fill": "🌙",
  "forward.fill": "🏃",
  "music.note": "🎵",
};

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  contentCount: number;
}

export default function CategoryCard({
  name,
  slug,
  icon,
  color,
  contentCount,
}: CategoryCardProps) {
  return (
    <Link href={`/explore?category=${slug}`} className="block group">
      <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl"
          style={{ backgroundColor: `${color}20` }}
        >
          {iconMap[icon] || "🎯"}
        </div>
        <h3 className="font-semibold text-navy">{name}</h3>
        <p className="text-sm text-navy/50 mt-1">{contentCount} sessions</p>
      </div>
    </Link>
  );
}
