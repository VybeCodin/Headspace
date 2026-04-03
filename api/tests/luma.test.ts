import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Luma API", () => {
  const app = createTestApp();

  it("GET /api/users/:id/luma returns assistant, conversation, suggestions", async () => {
    const res = await request(app, "/api/users/usr_001/luma");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.assistant.name).toBe("Luma");
    expect(data.assistant.avatarStyle).toBe("warm_gradient");
    expect(data.conversation).not.toBeNull();
    expect(data.conversation.messages).toHaveLength(1);
    expect(data.conversation.messages[0].role).toBe("assistant");
    expect(data.suggestions).toHaveLength(4);
  });

  it("POST /api/users/:id/luma/messages sends message and gets reply", async () => {
    const res = await request(app, "/api/users/usr_001/luma/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "I'm feeling overwhelmed" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.role).toBe("assistant");
    expect(data.text).toContain("Samuel");
    expect(data.text.toLowerCase()).toContain("breath");
  });

  it("mock reply handles sleep topic", async () => {
    const app2 = createTestApp();
    const res = await request(app2, "/api/users/usr_001/luma/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "I can't sleep tonight" }),
    });
    const data = await res.json();
    expect(data.text.toLowerCase()).toContain("wind down");
  });

  it("returns 404 for unknown user", async () => {
    const res = await request(app, "/api/users/nonexistent/luma");
    expect(res.status).toBe(404);
  });
});
