import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/20 via-beige to-blue/10" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-36 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-navy leading-tight">
            Be kind to
            <br />
            your mind
          </h1>
          <p className="mt-6 text-lg md:text-xl text-navy/70 max-w-xl mx-auto leading-relaxed">
            Meditation and mindfulness made simple. Find calm, sleep better, and
            live a happier, healthier life.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/today"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-orange text-white font-semibold text-lg hover:bg-orange/90 transition-colors shadow-lg shadow-orange/25"
            >
              Get Started
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-navy font-semibold text-lg hover:bg-white/80 transition-colors shadow-sm"
            >
              Explore Content
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            gradient="from-[#F47D20] to-[#FF9E50]"
            title="Meditate"
            description="Guided sessions from 1 to 20 minutes. Find calm and clarity any time of day."
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <circle cx="12" cy="12" r="10" />
              </svg>
            }
          />
          <FeatureCard
            gradient="from-[#2D3A8C] to-[#6E7BD4]"
            title="Sleep"
            description="Wind down with sleep stories, soundscapes, and bedtime meditations."
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            }
          />
          <FeatureCard
            gradient="from-[#00A050] to-[#4ADE80]"
            title="Focus"
            description="Boost your concentration with focus music, timers, and mindful exercises."
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            }
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <div className="bg-gradient-to-br from-navy to-navy-light rounded-3xl p-10 md:p-16 text-white">
          <h2 className="text-3xl md:text-4xl font-bold">
            Start your journey today
          </h2>
          <p className="mt-4 text-white/70 text-lg">
            Join millions of people finding more peace, better sleep, and a
            happier life.
          </p>
          <Link
            href="/today"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 rounded-full bg-orange text-white font-semibold text-lg hover:bg-orange/90 transition-colors"
          >
            Try for Free
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  gradient,
  title,
  description,
  icon,
}: {
  gradient: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-5`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-navy">{title}</h3>
      <p className="mt-2 text-navy/60 leading-relaxed">{description}</p>
    </div>
  );
}
