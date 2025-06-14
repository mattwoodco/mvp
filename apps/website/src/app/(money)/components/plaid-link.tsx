"use client";

import { Button } from "@money/ui/button";
import { Link, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkProps {
  onSuccess?: () => void;
  onExit?: () => void;
}

export function PlaidLink({ onSuccess, onExit }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        await fetch("/api/plaid/exchange-public-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken, metadata }),
        });

        await fetch("/api/plaid/sync-accounts", { method: "POST" });
        onSuccess?.();
      } catch (error) {
        console.error("Error exchanging token:", error);
      }
    },
    onExit: (error: any, metadata: any) => {
      if (error) {
        console.error("Plaid Link error:", error);
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

  return (
    <Button
      onClick={handleConnect}
      disabled={loading || (linkToken && !ready)}
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Link className="h-4 w-4" />
      )}
      Connect Bank Account
    </Button>
  );
}
