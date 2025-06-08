import Link from "next/link";
import { Button } from "../button";

interface HeaderProps {
  userSection?: React.ReactNode;
}

export function Header({ userSection }: HeaderProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          ChatMTV
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/terms">Terms</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/privacy">Privacy</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/logout">Logout</Link>
          </Button>
          {userSection}
        </nav>
      </div>
    </header>
  );
}
