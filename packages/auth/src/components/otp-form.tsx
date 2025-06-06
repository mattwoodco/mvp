export interface OTPFormProps {
  length?: number;
  onComplete: (value: string) => void;
  onSubmit?: (value: string) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
  children: (props: OTPFormRenderProps) => React.ReactNode;
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

// This is a headless component that requires React to be provided by the consuming application
export declare function OTPForm(props: OTPFormProps): React.ReactElement;

// For use with React applications
export const createOTPForm = (React: {
  useState: {
    (initialState: string): [string, (newState: string) => void];
    <T>(
      initialState: T | (() => T),
    ): [T, (newState: T | ((prevState: T) => T)) => void];
  };
}) => {
  return function OTPForm({
    length = 6,
    onComplete,
    onSubmit,
    error,
    isLoading = false,
    children,
  }: OTPFormProps) {
    const [value, setValue] = React.useState("");
    const [internalError, setInternalError] = React.useState<string | null>(
      null,
    );

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
          setInternalError(
            err instanceof Error ? err.message : "Verification failed",
          );
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
  };
};
