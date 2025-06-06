import * as React from "react";
import type { ReactNode } from "react";

export interface OTPFormProps {
  length?: number;
  onComplete: (value: string) => void;
  onSubmit?: (value: string) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
  children: (props: OTPFormRenderProps) => ReactNode;
}

export interface OTPFormRenderProps {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  error?: string | null;
  isLoading?: boolean;
  handleSubmit: (e?: React.FormEvent) => void;
  isComplete: boolean;
}

export function OTPForm({
  length = 6,
  onComplete,
  onSubmit,
  error,
  isLoading = false,
  children,
}: OTPFormProps) {
  const [value, setValue] = React.useState("");
  const [internalError, setInternalError] = React.useState<string | null>(null);

  const handleChange = (newValue: string) => {
    // Only allow digits
    const cleanValue = newValue.replace(/\D/g, "").slice(0, length);
    setValue(cleanValue);
    setInternalError(null);

    if (cleanValue.length === length) {
      onComplete(cleanValue);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (value.length !== length) {
      setInternalError(`Please enter all ${length} digits`);
      return;
    }

    if (onSubmit) {
      try {
        await onSubmit(value);
      } catch (err) {
        setInternalError(err instanceof Error ? err.message : "Verification failed");
      }
    }
  };

  return children({
    value,
    onChange: handleChange,
    onComplete,
    error: error || internalError,
    isLoading,
    handleSubmit,
    isComplete: value.length === length,
  });
}

// Export React if it's available
let React: any;
if (typeof window !== "undefined") {
  React = (window as any).React || require("react");
} else {
  try {
    React = require("react");
  } catch (e) {
    // React not available
  }
}