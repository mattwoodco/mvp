"use client";

import { Button } from "@money/ui/button";
import { CheckCircle, Link, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkProps {
  onSuccess?: () => void;
  onExit?: () => void;
}

export function PlaidLink({ onSuccess, onExit }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAccounts, setHasAccounts] = useState(false);
  const [checkingAccounts, setCheckingAccounts] = useState(true);

  useEffect(() => {
    checkExistingAccounts();
  }, []);

  const checkExistingAccounts = async () => {
    try {
      const response = await fetch("/api/plaid/accounts");
      if (response.ok) {
        const data = await response.json();
        setHasAccounts(data.accounts?.length > 0);
      }
    } catch (error) {
      console.error("Error checking accounts:", error);
    } finally {
      setCheckingAccounts(false);
    }
  };

  const createLinkToken = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error("Error creating link token:", error);
    } finally {
      setLoading(false);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken: string, metadata: any) => {
      try {
        console.log("🎉 Plaid Link success:", metadata);

        await fetch("/api/plaid/exchange-public-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken, metadata }),
        });

        await fetch("/api/plaid/sync-accounts", { method: "POST" });
        setHasAccounts(true);
        onSuccess?.();
      } catch (error) {
        console.error("Error exchanging token:", error);
      }
    },
    onExit: (error: any, metadata: any) => {
      console.log("🚪 Plaid Link exit event:", { error, metadata });

      if (error) {
        console.error("🔴 Plaid Link error details:", {
          error_type: error.error_type,
          error_code: error.error_code,
          error_message: error.error_message,
          display_message: error.display_message,
          request_id: error.request_id,
          causes: error.causes,
          status: error.status,
          full_error: error,
        });

        if (
          error.error_message?.includes("phone number") ||
          error.error_message?.includes("TOO_SHORT") ||
          error.causes?.some(
            (cause: any) =>
              cause.error_message?.includes("phone number") ||
              cause.error_message?.includes("TOO_SHORT"),
          )
        ) {
          console.error("📞 Phone number validation error detected:", {
            error_message: error.error_message,
            causes: error.causes,
            metadata,
          });
        }
      }

      onExit?.();
    },
  });

  const handleConnect = async () => {
    if (!linkToken) {
      await createLinkToken();
    }
    if (ready) {
      open();
    }
  };

  if (checkingAccounts) {
    return (
      <Button disabled className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading || (linkToken && !ready)}
      variant={hasAccounts ? "outline" : "default"}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : hasAccounts ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <Link className="h-4 w-4" />
      )}
      {hasAccounts ? "Connected" : "Connect Bank Account"}
    </Button>
  );
}
