# @mvp/chat

Reusable React components for building chat interfaces with AI.

## Installation

This package is part of the monorepo and is available as a workspace dependency.

```json
{
  "dependencies": {
    "@mvp/chat": "workspace:*"
  }
}
```

## Components

### Chat

The main chat component that combines all chat functionality.

```tsx
import { Chat } from '@mvp/chat';

function MyApp() {
  const handleSubmit = async (message: string) => {
    // Handle message submission
    console.log('User message:', message);
  };

  return (
    <Chat 
      onSubmit={handleSubmit}
      className="h-screen"
    />
  );
}
```

### ChatProvider

Context provider for managing chat state.

```tsx
import { ChatProvider, useChatContext } from '@mvp/chat';

function MyChat() {
  return (
    <ChatProvider>
      <ChatUI />
    </ChatProvider>
  );
}

function ChatUI() {
  const { messages, setMessages, isLoading, setIsLoading } = useChatContext();
  
  // Use chat context
}
```

### Individual Components

You can also use individual components for custom layouts:

```tsx
import { 
  ChatProvider,
  ChatMessages, 
  ChatInput 
} from '@mvp/chat';

function CustomChat() {
  const handleSubmit = async (message: string) => {
    // Handle message
  };

  return (
    <ChatProvider>
      <div className="flex flex-col h-screen">
        <header>My Custom Header</header>
        <ChatMessages className="flex-1" />
        <ChatInput onSubmit={handleSubmit} />
      </div>
    </ChatProvider>
  );
}
```

## Example with AI Integration

```tsx
import { Chat } from '@mvp/chat';
import { streamText } from '@mvp/ai';
import { createOpenAIProvider } from '@mvp/ai';
import { useChat } from 'ai/react';

function AIChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <Chat
      onSubmit={handleSubmit}
      initialMessages={messages}
      className="h-screen"
    />
  );
}
```

## Props

### Chat Component

- `onSubmit`: `(message: string) => void | Promise<void>` - Handler for message submission
- `initialMessages?`: `Message[]` - Initial messages to display
- `className?`: `string` - Additional CSS classes
- `messagesClassName?`: `string` - CSS classes for messages container
- `inputClassName?`: `string` - CSS classes for input component

### ChatProvider

- `children`: `ReactNode` - Child components
- `initialMessages?`: `Message[]` - Initial messages

### ChatMessages

- `className?`: `string` - Additional CSS classes

### ChatInput

- `onSubmit`: `(message: string) => void` - Handler for message submission
- `className?`: `string` - Additional CSS classes

## Styling

The components use Tailwind CSS classes. Make sure your project has Tailwind CSS configured.

You can customize the appearance by passing className props to the components.
