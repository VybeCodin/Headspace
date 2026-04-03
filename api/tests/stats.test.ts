import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Stats API", () => {
  const app = createTestApp();

  it("GET /api/users/:id/stats returns computed stats", async () => {
    const res = await request(app, "/api/users/usr_001/stats");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("totalSessions");
    expect(data).toHaveProperty("totalMinutes");
    expect(data).toHaveProperty("avgSessionMinutes");
    expect(data).toHaveProperty("currentStreakDays");
    expect(data).toHaveProperty("longestStreakDays");
    expect(data.totalSessions).toBeGreaterThanOrEqual(96);
  });

  it("GET /api/users/:id/stats returns 404 for missing user", async () => {
    const res = await request(app, "/api/users/nonexistent/stats");
    expect(res.status).toBe(404);
  });
});
