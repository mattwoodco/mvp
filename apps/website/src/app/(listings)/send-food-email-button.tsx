"use client";

import { Button } from "@money/ui/button";
import { useState } from "react";

export function SendFoodEmailButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/send-food-email", {
        method: "POST",
      });

      if (response.ok) {
        alert("Food email sent to matt@mattwood.co!");
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSendEmail} disabled={isLoading} variant="outline">
      {isLoading ? "Sending..." : "Send Food Email"}
    </Button>
  );
}
