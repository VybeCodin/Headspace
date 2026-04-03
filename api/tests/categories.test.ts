import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Categories API", () => {
  const app = createTestApp();

  it("GET /api/categories returns all categories with content count", async () => {
    const res = await request(app, "/api/categories");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(4);

    // Verify sorted by sortOrder
    expect(data[0].name).toBe("Meditate");
    expect(data[1].name).toBe("Sleep");
    expect(data[2].name).toBe("Move");
    expect(data[3].name).toBe("Focus");

    // Verify contentCount is computed
    expect(data[0].contentCount).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("icon");
    expect(data[0]).toHaveProperty("color");
  });
});
