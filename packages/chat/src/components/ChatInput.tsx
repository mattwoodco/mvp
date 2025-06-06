"use client";

import clsx from "clsx";
import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { useChatContext } from "./ChatProvider";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  className?: string;
}

export function ChatInput({ onSubmit, className }: ChatInputProps) {
  const { input, setInput, isLoading } = useChatContext();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx("flex gap-2 p-4 border-t", className)}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={isLoading}
        className={clsx(
          "flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
          isLoading && "opacity-50 cursor-not-allowed",
        )}
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={clsx(
          "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200",
        )}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
