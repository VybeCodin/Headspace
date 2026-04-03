import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { LumaConversationSchema, LumaMessageSchema, ErrorSchema } from "../lib/types";

export function lumaRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/users/:id/luma
  router.get("/:id/luma", describeRoute({
    tags: ["Luma AI"],
    summary: "Get Luma conversation state",
    responses: {
      200: { description: "Conversation state", content: { "application/json": { schema: resolver(LumaConversationSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), async (c) => {
    const userId = c.req.param("id");

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();
    if (!user) throw new NotFoundError("User", userId);

    // Get or create conversation
    let conversation = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.userId, userId))
      .get();

    let messages: any[] = [];
    if (conversation) {
      messages = await db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.conversationId, conversation.id))
        .all();
    }

    const suggestions = await db.select().from(schema.suggestionPrompts).all();

    return c.json({
      assistant: {
        name: "Luma",
        avatarStyle: "warm_gradient",
        persona: "calm, supportive, mindfulness-focused",
      },
      conversation: conversation
        ? {
            id: conversation.id,
            userId: conversation.userId,
            messages: messages.map((m) => ({
              id: m.id,
              role: m.role,
              text: m.text,
              timestamp: m.timestamp,
              feedback: m.feedback,
            })),
          }
        : null,
      suggestions: suggestions.map((s) => ({ id: s.id, text: s.text })),
    });
  });

  // POST /api/users/:id/luma/messages
  router.post("/:id/luma/messages", describeRoute({
    tags: ["Luma AI"],
    summary: "Send message to Luma",
    responses: {
      201: { description: "Assistant reply", content: { "application/json": { schema: resolver(LumaMessageSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), async (c) => {
    const userId = c.req.param("id");
    const body = await c.req.json();
    const userText = body.text;

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();
    if (!user) throw new NotFoundError("User", userId);

    // Get or create conversation
    let conversation = await db
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.userId, userId))
      .get();

    if (!conversation) {
      const convId = `conv_${Date.now()}`;
      await db.insert(schema.conversations).values({ id: convId, userId }).run();
      conversation = (await db
        .select()
        .from(schema.conversations)
        .where(eq(schema.conversations.id, convId))
        .get())!;
    }

    // Insert user message
    const userMsgId = `msg_${Date.now()}_u`;
    await db.insert(schema.messages)
      .values({
        id: userMsgId,
        conversationId: conversation.id,
        role: "user",
        text: userText,
        timestamp: new Date().toISOString(),
      })
      .run();

    // Generate mock reply
    const reply = generateMockReply(userText, user.name.split(" ")[0]);

    const replyMsgId = `msg_${Date.now()}_a`;
    await db.insert(schema.messages)
      .values({
        id: replyMsgId,
        conversationId: conversation.id,
        role: "assistant",
        text: reply,
        timestamp: new Date().toISOString(),
      })
      .run();

    const replyMsg = (await db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.id, replyMsgId))
      .get())!;

    return c.json(
      {
        id: replyMsg.id,
        role: replyMsg.role,
        text: replyMsg.text,
        timestamp: replyMsg.timestamp,
        feedback: replyMsg.feedback,
      },
      201
    );
  });

  return router;
}

function generateMockReply(userText: string, firstName: string): string {
  const lower = userText.toLowerCase();

  if (lower.includes("overwhelm") || lower.includes("stress") || lower.includes("anxious")) {
    return `I hear you, ${firstName}. When things feel overwhelming, even one mindful breath can help. Would you like to try a quick breathing exercise?`;
  }
  if (lower.includes("sleep") || lower.includes("can't sleep") || lower.includes("insomnia")) {
    return `Let's help you wind down, ${firstName}. I'd recommend starting with a sleep story or some calming rain sounds. What sounds good?`;
  }
  if (lower.includes("focus") || lower.includes("concentrate") || lower.includes("distract")) {
    return `Focus can be tricky! A short meditation or some focus music might help you get in the zone. Want me to suggest something?`;
  }
  if (lower.includes("break") || lower.includes("quick") || lower.includes("pause")) {
    return `A quick pause can make a big difference. Try "Treat Yourself to 5 Gentle Breaths" — it's only a minute long!`;
  }
  if (lower.includes("conversation") || lower.includes("prepare") || lower.includes("nervous")) {
    return `Preparing for something important? A grounding meditation can help you feel centered and confident. Would you like to try one?`;
  }

  return `Thanks for sharing, ${firstName}. I'm here to help you find what you need. Would you like a meditation, some calming sounds, or a breathing exercise?`;
}
