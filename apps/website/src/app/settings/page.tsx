"use client";

import { useAuth } from "@mvp/auth";
import { Button } from "@mvp/ui/button";
import { Card } from "@mvp/ui/card";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <p className="text-gray-600 mb-4">Manage your profile information</p>
          <Link href="/settings/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <p className="text-gray-600 mb-4">Customize your app experience</p>
          <Link href="/settings/preferences">
            <Button variant="outline">Edit Preferences</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
