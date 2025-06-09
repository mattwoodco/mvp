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
  return (
    <div className="container mx-auto py-6">
      <div className="prose prose-gray dark:prose-invert prose-headings:scroll-m-20 prose-headings:tracking-tight max-w-none">
        {children}
      </div>
    </div>
  );
}
