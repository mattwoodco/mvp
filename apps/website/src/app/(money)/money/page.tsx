"use client";

import { useState } from "react";
import { AccountsList } from "../components/accounts-list";
import { PlaidLink } from "../components/plaid-link";

export default function MoneyPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLinkSuccess = () => {
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
