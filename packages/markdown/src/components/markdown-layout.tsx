import type { ReactNode } from "react";

interface MarkdownLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function MarkdownLayout({
  children,
  title,
  description,
}: MarkdownLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {title && (
        <div className="mb-8">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="prose prose-gray dark:prose-invert prose-headings:scroll-m-20 prose-headings:tracking-tight max-w-none">
        {children}
      </div>
    </div>
  );
}
