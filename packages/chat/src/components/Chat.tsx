'use client';

import React from 'react';
import { ChatProvider } from './ChatProvider';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import type { Message } from 'ai';
import clsx from 'clsx';

interface ChatProps {
  onSubmit: (message: string) => void;
  initialMessages?: Message[];
  className?: string;
  messagesClassName?: string;
  inputClassName?: string;
}

export function Chat({
  onSubmit,
  initialMessages,
  className,
  messagesClassName,
  inputClassName,
}: ChatProps) {
  return (
    <ChatProvider initialMessages={initialMessages}>
      <div
        className={clsx(
          'flex flex-col h-full bg-white rounded-lg shadow-lg',
          className
        )}
      >
        <ChatMessages className={clsx('flex-1', messagesClassName)} />
        <ChatInput
          onSubmit={onSubmit}
          className={inputClassName}
        />
      </div>
    </ChatProvider>
  );
}