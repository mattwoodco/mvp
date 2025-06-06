import * as React from "react";

interface MdxCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function MdxCard({ children, title, className = "" }: MdxCardProps) {
  return (
    <div className={`rounded-lg border bg-card p-6 shadow-sm ${className}`}>
      {title && (
        <h3 className="mb-4 text-xl font-semibold">{title}</h3>
      )}
      <div className="text-card-foreground">{children}</div>
    </div>
  );
}