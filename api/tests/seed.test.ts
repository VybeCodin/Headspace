import { describe, it, expect } from "bun:test";
import { createDb } from "../src/db/index";
import { seed } from "../src/db/seed";
import * as schema from "../src/db/schema";

describe("Seed", () => {
  it("seeds database with all required data", async () => {
    const db = createDb(":memory:");
    await seed(db);

    const instructors = db.select().from(schema.instructors).all();
    expect(instructors).toHaveLength(2);

    const categories = db.select().from(schema.categories).all();
    expect(categories).toHaveLength(4);

    const content = db.select().from(schema.content).all();
    expect(content).toHaveLength(14);

    const collections = db.select().from(schema.collections).all();
    expect(collections).toHaveLength(4);

    const users = db.select().from(schema.users).all();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("Samuel East");

    const progress = db.select().from(schema.userProgress).all();
    expect(progress.length).toBeGreaterThanOrEqual(96);

    const saved = db.select().from(schema.savedContent).all();
    expect(saved).toHaveLength(3);

    const conversations = db.select().from(schema.conversations).all();
    expect(conversations).toHaveLength(1);

    const messages = db.select().from(schema.messages).all();
    expect(messages).toHaveLength(1);

    const suggestions = db.select().from(schema.suggestionPrompts).all();
    expect(suggestions).toHaveLength(4);
  });

  it("is idempotent (running twice doesn't duplicate data)", async () => {
    const db = createDb(":memory:");
    await seed(db);
    await seed(db);

    const users = db.select().from(schema.users).all();
    expect(users).toHaveLength(1);
  });
});
