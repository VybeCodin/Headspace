import Link from "next/link";
import { fetchExplore } from "@/lib/api";
import CategoryCard from "@/components/CategoryCard";

export default async function ExplorePage() {
  const data = await fetchExplore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-navy mb-8">
        Explore
      </h1>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy mb-4">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              id={cat.id}
              name={cat.name}
              slug={cat.slug}
              icon={cat.icon}
              color={cat.color}
              contentCount={cat.contentCount}
            />
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy mb-4">Featured</h2>
        <Link
          href={`/collection/${data.featuredCollection.collectionId}`}
          className="block"
        >
          <div className="bg-gradient-to-br from-orange to-orange-light rounded-2xl p-8 text-white hover:opacity-95 transition-opacity shadow-lg">
            <span className="text-sm font-semibold uppercase tracking-wider opacity-80">
              Featured Collection
            </span>
            <h3 className="text-2xl md:text-3xl font-bold mt-2">
              {data.featuredCollection.title}
            </h3>
            <p className="mt-2 opacity-80 max-w-md">
              {data.featuredCollection.description}
            </p>
          </div>
        </Link>
      </section>

      {/* Guided Programs */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy mb-4">Guided Programs</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {data.guidedPrograms.map((program) => (
            <Link
              key={program.id}
              href={`/collection/${program.id}`}
              className="block group"
            >
              <div
                className="rounded-2xl p-6 text-white shadow-md hover:shadow-lg transition-shadow"
                style={{
                  background: `linear-gradient(135deg, ${program.gradientColors[0]}, ${program.gradientColors[1]})`,
                }}
              >
                <h3 className="text-lg font-bold">{program.title}</h3>
                <div className="mt-3 flex items-center gap-4 text-sm opacity-80">
                  <span>{program.totalSessions} sessions</span>
                  <span>{program.dailyMinutes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
