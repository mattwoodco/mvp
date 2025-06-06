// This is a demo page showing how MDX would be integrated
// Once dependencies are installed, this can be converted to page.mdx

export default function MdxDemoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">MDX Demo Page</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            This page demonstrates the MDX setup in our monorepo
          </p>
        </header>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Package Structure</h2>
          <p>
            We've created a new <code>@mvp/markdown</code> package that provides:
          </p>
          <ul>
            <li>Pre-styled MDX components</li>
            <li>Layout components for MDX pages</li>
            <li>Utility functions for MDX configuration</li>
            <li>Full TypeScript support</li>
          </ul>
          
          <h2>Usage Example</h2>
          <p>Once dependencies are installed, you can create MDX files like this:</p>
          <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted p-4">
            <code>{`import { MdxLayout } from "@mvp/markdown";
import { Button } from "@mvp/ui/button";

# Hello World

<Button>Click me!</Button>`}</code>
          </pre>
          
          <h2>Features</h2>
          <div className="rounded-lg border bg-card p-6 shadow-sm my-6">
            <h3 className="mb-4 text-xl font-semibold">Interactive Components</h3>
            <div className="text-card-foreground">
              <p>MDX allows you to use React components directly in your markdown files.</p>
              <div className="mt-4">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Example Button
                </button>
              </div>
            </div>
          </div>
          
          <h2>Next Steps</h2>
          <ol>
            <li>Install dependencies with <code>bun install</code></li>
            <li>Navigate to <code>/hello</code> to see the MDX page</li>
            <li>Create your own MDX content in the marketing directory</li>
          </ol>
        </div>
      </article>
    </div>
  );
}