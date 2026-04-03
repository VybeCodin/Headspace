import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Explore API", () => {
  const app = createTestApp();

  it("GET /api/explore returns categories, featured, and programs", async () => {
    const res = await request(app, "/api/explore");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("categories");
    expect(data).toHaveProperty("featuredCollection");
    expect(data).toHaveProperty("guidedPrograms");
  });

  it("has 4 categories in correct order", async () => {
    const res = await request(app, "/api/explore");
    const data = await res.json();
    expect(data.categories).toHaveLength(4);
    expect(data.categories[0].name).toBe("Meditate");
    expect(data.categories[1].name).toBe("Sleep");
  });

  it("has featured collection", async () => {
    const res = await request(app, "/api/explore");
    const data = await res.json();
    expect(data.featuredCollection).not.toBeNull();
    expect(data.featuredCollection.collectionId).toBe("col_010");
    expect(data.featuredCollection.title).toBe("Self-Care for Parents");
  });

  it("has guided programs with gradient colors", async () => {
    const res = await request(app, "/api/explore");
    const data = await res.json();
    expect(data.guidedPrograms).toHaveLength(2);
    expect(data.guidedPrograms[0]).toHaveProperty("gradientColors");
    expect(Array.isArray(data.guidedPrograms[0].gradientColors)).toBe(true);
  });
});
