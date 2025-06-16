import Link from "next/link";

interface HeaderProps {
  userSection?: React.ReactNode;
  tokenDisplay?: React.ReactNode;
}

export function Header({ userSection, tokenDisplay }: HeaderProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          mvp
        </Link>
        <nav className="flex items-center gap-4">
          {tokenDisplay}
          {userSection}
        </nav>
      </div>
    </header>
  );
}
