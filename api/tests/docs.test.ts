import { describe, it, expect } from "bun:test";
import { createTestApp, request } from "./setup";

describe("OpenAPI Docs", () => {
  const app = createTestApp();

  it("GET /api/openapi.json returns valid OpenAPI spec", async () => {
    const res = await request(app, "/api/openapi.json");
    expect(res.status).toBe(200);
    const spec = await res.json();
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.info.title).toBe("Headspace API");
    expect(spec.paths).toBeDefined();
    expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
  });

  it("GET /docs returns Scalar HTML", async () => {
    const res = await request(app, "/docs");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("<html");
  });
});
