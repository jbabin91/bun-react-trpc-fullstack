import { createFileRoute, Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/about')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-3xl font-bold">About Page</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-4 text-lg">
              This is the about page of the application. Welcome to our React +
              Bun project!
            </p>
            <p className="text-base">
              This application demonstrates a modern web development stack
              using:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              <li>React 18 with TypeScript</li>
              <li>TanStack Router for navigation</li>
              <li>TanStack Query for data fetching</li>
              <li>tRPC for type-safe APIs</li>
              <li>Bun as the runtime and test framework</li>
              <li>PostgreSQL with Drizzle ORM</li>
              <li>Tailwind CSS and shadcn/ui components</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button>
              <Link to="/">Go to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
