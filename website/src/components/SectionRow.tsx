import type { TodayItem } from "@/lib/types";
import ContentCard from "./ContentCard";

interface SectionRowProps {
  title: string;
  items: TodayItem[];
  layout?: string;
}

export default function SectionRow({ title, items, layout }: SectionRowProps) {
  const isTwoColumn = layout === "two_column";

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-navy mb-4 px-1">{title}</h2>
      {isTwoColumn ? (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              subtitle={item.subtitle}
              type={item.type}
              durationLabel={item.durationLabel}
              gradientColors={item.gradientColors}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[220px]">
              <ContentCard
                id={item.id}
                title={item.title}
                subtitle={item.subtitle}
                type={item.type}
                durationLabel={item.durationLabel}
                gradientColors={item.gradientColors}
                progressSeconds={item.progressSeconds}
                durationSeconds={item.durationSeconds}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
