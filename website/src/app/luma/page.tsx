"use client";

import { useEffect, useRef, useState } from "react";
import ChatBubble from "@/components/ChatBubble";
import type { ChatMessage, SuggestionPrompt } from "@/lib/types";

const BASE_URL = "https://headspace-api.vercel.app/api";
const USER_ID = "usr_001";

export default function LumaPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionPrompt[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/users/${USER_ID}/luma`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.conversation.messages);
        setSuggestions(data.suggestions);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
      feedback: null,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setSuggestions([]);

    try {
      const res = await fetch(
        `${BASE_URL}/users/${USER_ID}/luma/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim() }),
        }
      );
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      }
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch {
      // Show error as assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          text: "Sorry, I had trouble responding. Please try again.",
          timestamp: new Date().toISOString(),
          feedback: null,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-4rem-5rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-beige-dark">
        <h1 className="text-xl font-bold text-navy">Luma</h1>
        <p className="text-sm text-navy/50">Your mindfulness companion</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              text={msg.text}
              timestamp={msg.timestamp}
            />
          ))
        )}
        {sending && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-navy/30 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-navy/30 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-navy/30 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {suggestions.map((sug) => (
            <button
              key={sug.id}
              onClick={() => sendMessage(sug.text)}
              className="shrink-0 px-4 py-2 bg-white rounded-full text-sm text-navy font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              {sug.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-beige-dark">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Luma..."
            className="flex-1 px-4 py-3 bg-white rounded-full text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-orange/30 shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-12 h-12 rounded-full bg-orange text-white flex items-center justify-center hover:bg-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M22 2L11 13" />
              <polygon points="22,2 15,22 11,13 2,9" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
