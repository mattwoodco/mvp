"use client";

import { AccountsList } from "@/app/components/accounts-list";
import { PlaidLink } from "@/app/components/plaid-link";
import { useState } from "react";

export default function FinancePage() {
  const [hasAccounts, setHasAccounts] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLinkSuccess = () => {
    setHasAccounts(true);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Financial Overview</h1>
          <p className="text-gray-600 mt-2">
            Manage your connected bank accounts and track spending
          </p>
        </div>
        <PlaidLink onSuccess={handleLinkSuccess} />
      </div>

      <AccountsList key={refreshKey} />
    </div>
  );
}
