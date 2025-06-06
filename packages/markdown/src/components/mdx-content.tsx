"use client";

import type { MDXComponents } from "mdx/types";

interface MdxContentProps {
  children: React.ReactNode;
  components?: MDXComponents;
}

export function MdxContent({ children, components }: MdxContentProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {children}
    </div>
  );
}
