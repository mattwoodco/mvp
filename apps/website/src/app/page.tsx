import { ModeToggle } from "@mvp/ui/mode-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dark Mode Example</h1>
          <ModeToggle />
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow-sm">
            <h2 className="text-2xl font-semibold mb-2">Welcome to Dark Mode</h2>
            <p className="text-muted-foreground">
              This page demonstrates the dark mode implementation. Click the toggle button
              in the top right to switch between light and dark themes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-lg">
              <h3 className="font-medium mb-1">Primary Colors</h3>
              <p className="text-sm opacity-90">This uses primary background and foreground colors</p>
            </div>
            
            <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
              <h3 className="font-medium mb-1">Secondary Colors</h3>
              <p className="text-sm opacity-90">This uses secondary background and foreground colors</p>
            </div>
            
            <div className="p-4 bg-accent text-accent-foreground rounded-lg">
              <h3 className="font-medium mb-1">Accent Colors</h3>
              <p className="text-sm opacity-90">This uses accent background and foreground colors</p>
            </div>
            
            <div className="p-4 bg-muted text-muted-foreground rounded-lg">
              <h3 className="font-medium mb-1">Muted Colors</h3>
              <p className="text-sm">This uses muted background and foreground colors</p>
            </div>
          </div>
          
          <div className="p-6 bg-card text-card-foreground rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Features</h3>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>Automatic theme detection based on system preference</li>
              <li>Manual toggle between light and dark modes</li>
              <li>Persisted theme preference in local storage</li>
              <li>No flash of unstyled content on page load</li>
              <li>Smooth transitions between themes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}