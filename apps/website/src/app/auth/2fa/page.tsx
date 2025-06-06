"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OTPForm } from "@mvp/auth/components";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@mvp/ui/input-otp";
import { Button } from "@mvp/ui/button";
import { authClient } from "@mvp/auth/client";

export default function TwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verificationMethod, setVerificationMethod] = React.useState<"totp" | "otp">("totp");

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (verificationMethod === "totp") {
        await authClient.twoFactor.verifyTotp({ 
          code,
          trustDevice: true 
        });
      } else {
        await authClient.twoFactor.verifyOtp({ 
          code 
        });
      }
      
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authClient.twoFactor.sendOtp();
      setVerificationMethod("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {verificationMethod === "totp" 
              ? "Enter the code from your authenticator app"
              : "Enter the code sent to your phone"}
          </p>
        </div>

        <OTPForm
          length={6}
          onComplete={handleVerify}
          error={error}
          isLoading={isLoading}
        >
          {({ value, onChange, error, isLoading, handleSubmit, isComplete }) => (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  value={value}
                  onChange={onChange}
                  maxLength={6}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <p className="text-center text-sm text-red-600">{error}</p>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isComplete || isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>

                {verificationMethod === "totp" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                  >
                    Send code via SMS instead
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/auth/signin")}
                  disabled={isLoading}
                >
                  Use backup code
                </Button>
              </div>
            </form>
          )}
        </OTPForm>
      </div>
    </div>
  );
}