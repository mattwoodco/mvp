import { Bot, Folder, Home, Settings, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "../button";

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card">
      <div className="p-4">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/projects">
              <Folder className="mr-2 h-4 w-4" />
              Projects
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/agent">
              <Bot className="mr-2 h-4 w-4" />
              Agent
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </nav>
      </div>
    </aside>
  );
}
