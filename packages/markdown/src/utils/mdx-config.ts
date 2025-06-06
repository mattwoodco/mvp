import type { NextConfig } from "next";

interface MDXOptions {
  extension?: RegExp;
  options?: {
    remarkPlugins?: Array<any>;
    rehypePlugins?: Array<any>;
  };
}

export function configureMDX(
  nextConfig: NextConfig = {},
  mdxOptions: MDXOptions = {},
): NextConfig {
  const defaultOptions: MDXOptions = {
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
  };

  return {
    ...nextConfig,
    pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  };
}
