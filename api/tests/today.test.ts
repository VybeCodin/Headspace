import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Today API", () => {
  const app = createTestApp();

  it("GET /api/users/:id/today returns personalized feed", async () => {
    const res = await request(app, "/api/users/usr_001/today");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("greeting");
    expect(data).toHaveProperty("date");
    expect(data).toHaveProperty("sections");
    expect(data.greeting).toContain("Samuel");
    expect(Array.isArray(data.sections)).toBe(true);
  });

  it("today has continue_listening section with in-progress items", async () => {
    const res = await request(app, "/api/users/usr_001/today");
    const data = await res.json();
    const continueSection = data.sections.find((s: any) => s.type === "continue_listening");
    expect(continueSection).toBeDefined();
    expect(continueSection.items.length).toBeGreaterThan(0);
    expect(continueSection.items[0]).toHaveProperty("progressSeconds");
  });

  it("today has daily_essentials section", async () => {
    const res = await request(app, "/api/users/usr_001/today");
    const data = await res.json();
    const section = data.sections.find((s: any) => s.type === "daily_essentials");
    expect(section).toBeDefined();
    expect(section.layout).toBe("horizontal_scroll");
    expect(section.items).toHaveLength(3);
  });

  it("today has editorial section", async () => {
    const res = await request(app, "/api/users/usr_001/today");
    const data = await res.json();
    const section = data.sections.find((s: any) => s.type === "editorial");
    expect(section).toBeDefined();
    expect(section.layout).toBe("two_column");
    expect(section.items).toHaveLength(2);
  });

  it("returns 404 for unknown user", async () => {
    const res = await request(app, "/api/users/nonexistent/today");
    expect(res.status).toBe(404);
  });
});
