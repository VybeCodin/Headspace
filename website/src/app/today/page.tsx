import { fetchToday } from "@/lib/api";
import SectionRow from "@/components/SectionRow";

export default async function TodayPage() {
  const data = await fetchToday();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-navy">
          {data.greeting}
        </h1>
        <p className="text-navy/50 mt-1">{formatDate(data.date)}</p>
      </div>

      {data.sections.map((section) => (
        <SectionRow
          key={section.id}
          title={section.title}
          items={section.items}
          layout={section.layout}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
