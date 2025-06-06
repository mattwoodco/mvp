export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-gray-600">Page not found</p>
        <a
          href="/"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
