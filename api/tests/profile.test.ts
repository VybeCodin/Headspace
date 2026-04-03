import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Profile API", () => {
  const app = createTestApp();

  it("GET /api/users/:id/profile returns aggregate profile", async () => {
    const res = await request(app, "/api/users/usr_001/profile");
    expect(res.status).toBe(200);
    const data = await res.json();

    // User
    expect(data.user.id).toBe("usr_001");
    expect(data.user.name).toBe("Samuel East");
    expect(data.user.preferences).toBeDefined();
    expect(data.user.subscription).toBeDefined();

    // Stats
    expect(data.stats).toHaveProperty("totalSessions");
    expect(data.stats).toHaveProperty("totalMinutes");
    expect(data.stats.totalSessions).toBeGreaterThanOrEqual(96);

    // Streak
    expect(data.streak).toHaveProperty("current");
    expect(data.streak).toHaveProperty("message");
    expect(data.streak).toHaveProperty("weeklyActivity");
    expect(data.streak.weeklyActivity).toHaveLength(7);

    // Saved
    expect(data.savedContentIds).toHaveLength(3);
    expect(data.savedContentIds).toContain("cnt_001");

    // Recent
    expect(data.recentContentIds.length).toBeGreaterThan(0);
  });

  it("returns 404 for unknown user", async () => {
    const res = await request(app, "/api/users/nonexistent/profile");
    expect(res.status).toBe(404);
  });
});
