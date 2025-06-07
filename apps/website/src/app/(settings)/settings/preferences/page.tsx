import { ThemeDemo } from "@mvp/ui/theme-demo";

export default function PreferencesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Preferences</h1>
        <p className="text-muted-foreground">
          Customize your theme and appearance settings.
        </p>
      </div>

      <ThemeDemo />
    </div>
  );
}
