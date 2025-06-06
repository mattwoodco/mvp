"use client";

import type { Message } from "@mvp/ai";
import { cn } from "@mvp/ui/utils";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage.js";
import { useChatContext } from "./ChatProvider.js";

interface ChatMessagesProps {
  className?: string;
}

export function ChatMessages({ className }: ChatMessagesProps) {
  const { messages, isLoading } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("flex flex-col gap-4 overflow-y-auto p-4", className)}>
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No messages yet. Start a conversation!
        </div>
      )}

      {messages.map((message: Message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isLoading={isLoading && message === messages[messages.length - 1]}
        />
      ))}

      {isLoading && (
        <div className="flex gap-2 p-4">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
