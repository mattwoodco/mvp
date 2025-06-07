import type { ReactNode } from "react";

interface MDXComponents {
  [key: string]: React.ComponentType<any>;
}

interface HeadingProps {
  children: ReactNode;
}

interface LinkProps {
  href?: string;
  children: ReactNode;
}

interface CodeProps {
  children: ReactNode;
}

export function useMDXComponents(
  components: MDXComponents = {},
): MDXComponents {
  return {
    // Headings
    h1: ({ children }: HeadingProps) => (
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {children}
      </h1>
    ),
    h2: ({ children }: HeadingProps) => (
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }: HeadingProps) => (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {children}
      </h3>
    ),
    h4: ({ children }: HeadingProps) => (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {children}
      </h4>
    ),
    h5: ({ children }: HeadingProps) => (
      <h5 className="scroll-m-20 text-lg font-semibold tracking-tight">
        {children}
      </h5>
    ),
    h6: ({ children }: HeadingProps) => (
      <h6 className="scroll-m-20 text-base font-semibold tracking-tight">
        {children}
      </h6>
    ),

    // Text elements
    p: ({ children }: HeadingProps) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
    ),

    // Lists
    ul: ({ children }: HeadingProps) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    ),
    ol: ({ children }: HeadingProps) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    ),
    li: ({ children }: HeadingProps) => <li className="mt-2">{children}</li>,

    // Links
    a: ({ href, children }: LinkProps) => (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      >
        {children}
      </a>
    ),

    // Code
    code: ({ children }: CodeProps) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
        {children}
      </code>
    ),

    // Blockquote
    blockquote: ({ children }: HeadingProps) => (
      <blockquote className="mt-6 border-l-2 pl-6 italic">
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: () => <hr className="my-4 md:my-8" />,

    // Tables
    table: ({ children }: HeadingProps) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">{children}</table>
      </div>
    ),
    tr: ({ children }: HeadingProps) => (
      <tr className="m-0 border-t p-0 even:bg-muted">{children}</tr>
    ),
    th: ({ children }: HeadingProps) => (
      <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </th>
    ),
    td: ({ children }: HeadingProps) => (
      <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    ),

    ...components,
  };
}
