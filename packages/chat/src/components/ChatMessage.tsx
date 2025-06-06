"use client";

import type { Message } from "ai";
import clsx from "clsx";
import { Bot, User } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: Message;
  className?: string;
  isLoading?: boolean;
}

export function ChatMessage({
  message,
  className,
  isLoading,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={clsx(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-gray-50" : "bg-white",
        className,
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="font-medium mb-1">{isUser ? "You" : "Assistant"}</div>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
