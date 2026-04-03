import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Saved API", () => {
  const app = createTestApp();

  it("GET /api/users/:id/saved returns saved content", async () => {
    const res = await request(app, "/api/users/usr_001/saved");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(3);
    expect(data[0]).toHaveProperty("contentId");
    expect(data[0]).toHaveProperty("savedAt");
  });

  it("POST /api/users/:id/saved saves new content", async () => {
    const app2 = createTestApp();
    const res = await request(app2, "/api/users/usr_001/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: "cnt_021" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.contentId).toBe("cnt_021");

    // Verify it's now in the list
    const listRes = await request(app2, "/api/users/usr_001/saved");
    const listData = await listRes.json();
    expect(listData).toHaveLength(4);
  });

  it("POST /api/users/:id/saved handles duplicates gracefully", async () => {
    const res = await request(app, "/api/users/usr_001/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: "cnt_001" }),
    });
    expect(res.status).toBe(200);
  });

  it("DELETE /api/users/:id/saved/:contentId removes saved content", async () => {
    const app2 = createTestApp();
    const res = await request(app2, "/api/users/usr_001/saved/cnt_001", {
      method: "DELETE",
    });
    expect(res.status).toBe(200);

    // Verify removed
    const listRes = await request(app2, "/api/users/usr_001/saved");
    const listData = await listRes.json();
    expect(listData).toHaveLength(2);
  });

  it("DELETE /api/users/:id/saved/:contentId returns 404 for unsaved content", async () => {
    const res = await request(app, "/api/users/usr_001/saved/cnt_999", {
      method: "DELETE",
    });
    expect(res.status).toBe(404);
  });
});
