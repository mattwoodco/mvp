import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@mvp/ui/button";
import { Sparkles, Home, LogOut } from "lucide-react";

export default function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                <Sparkles className="h-5 w-5" />
                AI Video Scripts
              </Link>
              
              <div className="hidden md:flex items-center gap-4">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/agent" className="text-sm font-medium">
                  <Button variant="ghost" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Script Generator
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/logout">
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main>{children}</main>
    </div>
  );
}