import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-beige/80 backdrop-blur-md border-b border-beige-dark">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <span className="text-xl font-bold text-navy">Headspace</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/today" className="text-navy/70 hover:text-navy transition-colors font-medium">
            Today
          </Link>
          <Link href="/explore" className="text-navy/70 hover:text-navy transition-colors font-medium">
            Explore
          </Link>
          <Link href="/luma" className="text-navy/70 hover:text-navy transition-colors font-medium">
            Luma
          </Link>
          <Link href="/profile" className="text-navy/70 hover:text-navy transition-colors font-medium">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
