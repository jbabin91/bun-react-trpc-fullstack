import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreateUserForm, UsersList } from '@/modules/users/components';
import { useUsersData } from '@/modules/users/hooks';

export const Route = createFileRoute('/users')({
  component: UsersPage,
});

function UsersPage() {
  const [showForm, setShowForm] = useState(false);
  const { users, isLoading, error } = useUsersData();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          This page demonstrates the new modular users architecture with
          reusable components and custom hooks.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Create User Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>
              Add a new user to the system using the reusable CreateUserForm
              component.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button className="w-full" onClick={() => setShowForm(true)}>
                Show Create Form
              </Button>
            ) : (
              <div className="space-y-4">
                <CreateUserForm
                  onSuccess={() => {
                    setShowForm(false);
                  }}
                />
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Users Overview</CardTitle>
            <CardDescription>
              Current user statistics and module benefits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Users:</span>
                <span className="text-2xl font-bold">
                  {isLoading ? '...' : users.length}
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Module Benefits:</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>
                    ✅ Co-located code in <code>src/modules/users/</code>
                  </li>
                  <li>✅ Reusable components and hooks</li>
                  <li>✅ Centralized validation schemas</li>
                  <li>✅ Direct imports (no abstraction layers)</li>
                  <li>✅ Better tree-shaking and bundle optimization</li>
                </ul>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">
                    Error loading users: {error.message}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="mt-8 flex h-[600px] flex-col">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Users list using the reusable UsersList component with actions
            enabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <UsersList showActions={true} />
        </CardContent>
      </Card>

      {/* Architecture Comparison */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Architecture Comparison</CardTitle>
          <CardDescription>
            See how the new modular approach compares to the traditional
            structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-medium text-red-600">
                Before: Scattered Structure
              </h4>
              <pre className="bg-muted rounded p-3 text-xs">
                {`src/
├── server/routers/users.ts
├── components/users/...
├── hooks/users/...
└── scattered imports`}
              </pre>
            </div>
            <div>
              <h4 className="mb-3 font-medium text-green-600">
                After: Modular Structure
              </h4>
              <pre className="bg-muted rounded p-3 text-xs">
                {`src/modules/users/
├── api/
│   ├── repository.ts
│   ├── repository.test.ts
│   ├── router.ts
│   └── router.test.ts
├── components/
├── hooks/
└── schemas/`}
              </pre>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 font-medium">Import Examples</h4>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-sm font-medium text-green-600">
                  ✅ Direct Module Imports (Clean, Tree-shakeable)
                </p>
                <pre className="bg-muted rounded border p-2 text-xs">
                  {`import { CreateUserForm, UsersList } from '@/modules/users/components';
import { useUsers, useCreateUser } from '@/modules/users/hooks';
import { UserRepository } from '@/modules/users/api/repository';`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
