import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("Sleep & Meditate API", () => {
  const app = createTestApp();

  it("GET /api/sleep-meditate returns sections", async () => {
    const res = await request(app, "/api/sleep-meditate");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("sections");
    expect(data.sections).toHaveLength(3);
  });

  it("has tonight's picks section", async () => {
    const res = await request(app, "/api/sleep-meditate");
    const data = await res.json();
    const section = data.sections.find((s: any) => s.type === "tonight_picks");
    expect(section).toBeDefined();
    expect(section.title).toBe("Tonight's picks");
    expect(section.items).toHaveLength(2);
  });

  it("has soundscapes section", async () => {
    const res = await request(app, "/api/sleep-meditate");
    const data = await res.json();
    const section = data.sections.find((s: any) => s.type === "soundscapes");
    expect(section).toBeDefined();
    expect(section.title).toBe("Background sounds");
    expect(section.items).toHaveLength(3);
  });

  it("has wind-down collection section", async () => {
    const res = await request(app, "/api/sleep-meditate");
    const data = await res.json();
    const section = data.sections.find((s: any) => s.type === "collection");
    expect(section).toBeDefined();
    expect(section.collectionId).toBe("col_020");
    expect(section.items).toHaveLength(2);
  });
});
