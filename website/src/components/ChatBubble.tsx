interface ChatBubbleProps {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export default function ChatBubble({ role, text, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-orange text-white rounded-br-md"
            : "bg-white text-navy rounded-bl-md shadow-sm"
        }`}
      >
        <p className="text-sm leading-relaxed">{text}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? "text-white/60" : "text-navy/40"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
