"use client";

import { useState } from "react";
import { Button } from "./button";
import { Card } from "./card";

interface CheckoutFormProps {
  onPurchase: (tokens: number) => Promise<void>;
  isLoading?: boolean;
}

export function CheckoutForm({ onPurchase, isLoading }: CheckoutFormProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async (tokens: number) => {
    setIsPurchasing(true);
    try {
      await onPurchase(tokens);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Buy More Tokens</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Purchase additional tokens to continue using our services.
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">1,000 Tokens</p>
            <p className="text-sm text-muted-foreground">
              Perfect for regular use
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">$5.00</p>
            <Button
              size="sm"
              onClick={() => handlePurchase(1000)}
              disabled={isPurchasing || isLoading}
            >
              {isPurchasing ? "Processing..." : "Buy Now"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
