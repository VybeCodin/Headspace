import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Content API", () => {
  const app = createTestApp();

  it("GET /api/content returns all content", async () => {
    const res = await request(app, "/api/content");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(14);
    expect(data[0]).toHaveProperty("id");
    expect(data[0]).toHaveProperty("title");
    expect(data[0]).toHaveProperty("tags");
    expect(Array.isArray(data[0].tags)).toBe(true);
  });

  it("GET /api/content?type=meditation filters by type", async () => {
    const res = await request(app, "/api/content?type=meditation");
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    data.forEach((item: any) => expect(item.type).toBe("meditation"));
  });

  it("GET /api/content?category=cat_sleep filters by category", async () => {
    const res = await request(app, "/api/content?category=cat_sleep");
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    data.forEach((item: any) => expect(item.categoryId).toBe("cat_sleep"));
  });

  it("GET /api/content?isPremium=true filters premium content", async () => {
    const res = await request(app, "/api/content?isPremium=true");
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].id).toBe("cnt_041");
  });

  it("GET /api/content/:id returns single content with instructor", async () => {
    const res = await request(app, "/api/content/cnt_001");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("cnt_001");
    expect(data.title).toBe("Finding Calm in Chaos");
    expect(data.instructor).not.toBeNull();
    expect(data.instructor.name).toBe("Sarah Mitchell");
  });

  it("GET /api/content/:id returns 404 for missing content", async () => {
    const res = await request(app, "/api/content/nonexistent");
    expect(res.status).toBe(404);
  });

  it("GET /api/content/search?q= searches by title", async () => {
    const res = await request(app, "/api/content/search?q=calm");
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].title).toContain("Calm");
  });

  it("GET /api/content/search?q= searches by tags", async () => {
    const res = await request(app, "/api/content/search?q=breathwork");
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
  });
});
