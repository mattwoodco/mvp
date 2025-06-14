import Link from "next/link";

interface HeaderProps {
  userSection?: React.ReactNode;
}

export function Header({ userSection }: HeaderProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Money
        </Link>
        <nav className="flex items-center gap-4">{userSection}</nav>
      </div>
    </header>
  );
}
