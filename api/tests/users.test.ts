import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Users API", () => {
  const app = createTestApp();

  it("GET /api/users/:id returns user with nested preferences/subscription", async () => {
    const res = await request(app, "/api/users/usr_001");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("usr_001");
    expect(data.name).toBe("Samuel East");
    expect(data.email).toBe("samuel@example.com");
    expect(data.preferences).toBeDefined();
    expect(data.preferences.reminderTime).toBe("07:30");
    expect(data.preferences.preferredDuration).toBe(10);
    expect(Array.isArray(data.preferences.preferredTypes)).toBe(true);
    expect(data.subscription).toBeDefined();
    expect(data.subscription.plan).toBe("premium");
  });

  it("GET /api/users/:id returns 404 for missing user", async () => {
    const res = await request(app, "/api/users/nonexistent");
    expect(res.status).toBe(404);
  });

  it("PATCH /api/users/:id/preferences updates preferences", async () => {
    const res = await request(app, "/api/users/usr_001/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderTime: "08:00", preferredDuration: 15 }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.preferences.reminderTime).toBe("08:00");
    expect(data.preferences.preferredDuration).toBe(15);
  });
});
