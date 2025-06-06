"use client";

import type { Message } from "ai";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface ChatContextType {
  messages: Message[];
  input: string;
  isLoading: boolean;
  error: Error | null;
  setInput: (input: string) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clearMessages: () => void;
}

export interface ChatProviderProps {
  children: ReactNode;
  initialMessages?: Message[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  initialMessages = [],
}: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const value: ChatContextType = {
    messages,
    input,
    isLoading,
    error,
    setInput,
    setMessages,
    setIsLoading,
    setError,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
