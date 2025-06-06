"use client";

import * as React from "react";
import type { MDXComponents } from "mdx/types";
import { useMDXComponents } from "@mdx-js/react";

interface MdxContentProps {
  children: React.ReactNode;
  components?: MDXComponents;
}

export function MdxContent({ children, components }: MdxContentProps) {
  const mdxComponents = useMDXComponents(components);
  
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {children}
    </div>
  );
}