import { Footer } from "./footer";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  userSection?: React.ReactNode;
}

export function MainLayout({ children, userSection }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header userSection={userSection} />
        <main className="flex-1 flex-grow">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
