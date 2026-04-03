import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Collections API", () => {
  const app = createTestApp();

  it("GET /api/collections returns all collections", async () => {
    const res = await request(app, "/api/collections");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(4);
  });

  it("GET /api/collections?type=program filters by type", async () => {
    const res = await request(app, "/api/collections?type=program");
    const data = await res.json();
    expect(data).toHaveLength(2);
    data.forEach((c: any) => expect(c.type).toBe("program"));
  });

  it("GET /api/collections/:id returns collection with contentIds", async () => {
    const res = await request(app, "/api/collections/col_020");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("col_020");
    expect(data.title).toBe("Wind down routines");
    expect(data.contentIds).toEqual(["cnt_060", "cnt_061"]);
  });

  it("GET /api/collections/:id returns 404 for missing collection", async () => {
    const res = await request(app, "/api/collections/nonexistent");
    expect(res.status).toBe(404);
  });

  it("collections have gradientColors as array", async () => {
    const res = await request(app, "/api/collections?type=program");
    const data = await res.json();
    expect(Array.isArray(data[0].gradientColors)).toBe(true);
    expect(data[0].gradientColors.length).toBeGreaterThan(0);
  });
});
