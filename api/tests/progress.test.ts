import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Progress API", () => {
  const app = createTestApp();

  it("GET /api/users/:id/progress returns all progress records", async () => {
    const res = await request(app, "/api/users/usr_001/progress");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("contentId");
    expect(data[0]).toHaveProperty("status");
    expect(data[0]).toHaveProperty("progressSeconds");
  });

  it("GET /api/users/:id/progress?status=completed filters by status", async () => {
    const res = await request(app, "/api/users/usr_001/progress?status=completed");
    const data = await res.json();
    data.forEach((p: any) => expect(p.status).toBe("completed"));
  });

  it("GET /api/users/:id/progress?status=inProgress shows in-progress items", async () => {
    const res = await request(app, "/api/users/usr_001/progress?status=inProgress");
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    data.forEach((p: any) => expect(p.status).toBe("inProgress"));
  });

  it("POST /api/users/:id/progress creates new progress", async () => {
    const app2 = createTestApp(); // fresh app to avoid conflicts
    const res = await request(app2, "/api/users/usr_001/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: "cnt_030", progressSeconds: 30 }),
    });
    expect(res.status).toBe(200); // upsert returns 200 since seed already has progress for this
    const data = await res.json();
    expect(data.contentId).toBe("cnt_030");
  });

  it("PATCH /api/users/:id/progress/:contentId updates progress", async () => {
    const res = await request(app, "/api/users/usr_001/progress/cnt_012", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progressSeconds: 45 }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.progressSeconds).toBe(45);
  });
});
