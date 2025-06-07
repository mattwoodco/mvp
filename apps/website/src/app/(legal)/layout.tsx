import { MarkdownLayout } from "@mvp/markdown/layout";
import type { Metadata } from "next";

interface LegalLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    template: "%s | Legal",
    default: "Legal",
  },
  description: "Legal information and policies",
};

export default function LegalLayout({ children }: LegalLayoutProps) {
  return <MarkdownLayout>{children}</MarkdownLayout>;
}
