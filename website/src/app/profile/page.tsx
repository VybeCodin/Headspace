import { fetchProfile } from "@/lib/api";
import StatCard from "@/components/StatCard";

export default async function ProfilePage() {
  const data = await fetchProfile();
  const { user, stats, streak } = data;

  const joinDate = new Date(user.joinedAt + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">{user.name}</h1>
          <p className="text-navy/50 text-sm">Member since {joinDate}</p>
          <span className="inline-block mt-1 px-3 py-0.5 bg-orange/10 text-orange text-xs font-semibold rounded-full capitalize">
            {user.subscription.plan}
          </span>
        </div>
      </div>

      {/* Streak */}
      <div className="bg-gradient-to-br from-orange to-orange-light rounded-2xl p-6 text-white mb-8 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Current Streak</p>
            <p className="text-4xl font-bold mt-1">{streak.current} days</p>
            <p className="text-sm mt-2 opacity-80">{streak.message}</p>
          </div>
          <div className="text-6xl">🔥</div>
        </div>
        <div className="flex gap-2 mt-4">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  streak.weeklyActivity[i]
                    ? "bg-white text-orange"
                    : "bg-white/20 text-white/60"
                }`}
              >
                {streak.weeklyActivity[i] ? "✓" : day}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <h2 className="text-xl font-bold text-navy mb-4">Your Stats</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Total Sessions"
          value={stats.totalSessions}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
        />
        <StatCard
          label="Mindful Minutes"
          value={stats.totalMinutes.toLocaleString()}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        />
        <StatCard
          label="Avg Session"
          value={`${stats.avgSessionMinutes} min`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
          }
        />
        <StatCard
          label="Longest Streak"
          value={`${stats.longestStreakDays} days`}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          }
        />
      </div>

      {/* Preferences */}
      <h2 className="text-xl font-bold text-navy mb-4">Preferences</h2>
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-navy/70">Daily Reminder</span>
          <span className="font-medium text-navy">
            {user.preferences.reminderTime}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-navy/70">Preferred Duration</span>
          <span className="font-medium text-navy">
            {user.preferences.preferredDuration} min
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-navy/70">Notifications</span>
          <span className="font-medium text-navy">
            {user.preferences.notificationsEnabled ? "On" : "Off"}
          </span>
        </div>
      </div>
    </div>
  );
}
