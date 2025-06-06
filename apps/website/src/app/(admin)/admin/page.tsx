"use client";

import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ListingsTable } from "@/components/admin/listings-table";
import { UsersTable } from "@/components/admin/users-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mvp/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mvp/ui/tabs";
import { Activity, FileText, TrendingUp, Users } from "lucide-react";
import * as React from "react";

export default function AdminPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor users, listings, and system activity
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">
            <TrendingUp className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="listings">
            <FileText className="mr-2 h-4 w-4" />
            Listings
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardStats />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                View and manage all registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listings Management</CardTitle>
              <CardDescription>Monitor and manage all listings</CardDescription>
            </CardHeader>
            <CardContent>
              <ListingsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Track admin activities and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                Activity logs feature coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
