import * as React from "react";

interface MdxLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function MdxLayout({ children, title, description }: MdxLayoutProps) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      {title && (
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-2 text-lg text-muted-foreground">{description}</p>
          )}
        </header>
      )}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {children}
      </div>
    </article>
  );
}