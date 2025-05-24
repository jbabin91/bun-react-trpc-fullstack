import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTRPC } from '@/lib/trpc';
import { CreatePostForm, PostsList } from '@/modules/posts/components';
import { usePostCount } from '@/modules/posts/hooks';

export const Route = createFileRoute('/posts')({
  component: PostsDemo,
});

function PostsDemo() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);

  // Using traditional tRPC for users (not yet migrated)
  const users = useQuery(trpc.users.list.queryOptions());

  // Using new modular hook for posts
  const { data: postCountData } = usePostCount();

  // User creation mutation (not yet migrated)
  const createUserMutation = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.users.list.queryKey() });
        setNewUserName('');
        setNewUserEmail('');
      },
    }),
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    try {
      await createUserMutation.mutateAsync({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Posts Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstration of the new modular posts structure with reusable
          components and hooks.
        </p>

        {postCountData && (
          <div className="bg-muted mt-4 rounded-lg p-4">
            <p className="text-sm">
              📊 Total posts: <strong>{postCountData.count}</strong> (using new
              modular hook)
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Management Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create User</CardTitle>
              <CardDescription>
                Create a user to author posts (traditional tRPC approach)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateUser}>
                <div className="space-y-2">
                  <Label htmlFor="userName">Name</Label>
                  <Input
                    disabled={createUserMutation.isPending}
                    id="userName"
                    placeholder="Enter user name..."
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    disabled={createUserMutation.isPending}
                    id="userEmail"
                    placeholder="Enter user email..."
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  disabled={createUserMutation.isPending}
                  type="submit"
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Available users for authoring posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.isLoading ? (
                <div className="py-4 text-center">Loading users...</div>
              ) : !users.data?.length ? (
                <div className="text-muted-foreground py-4 text-center">
                  No users yet. Create one above to get started.
                </div>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {users.data.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {user.email}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={
                            selectedAuthorId === user.id ? 'default' : 'outline'
                          }
                          onClick={() => setSelectedAuthorId(user.id)}
                        >
                          {selectedAuthorId === user.id ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Posts Section - Using New Modular Components */}
        <div className="space-y-6">
          {selectedAuthorId ? (
            <CreatePostForm
              authorId={selectedAuthorId}
              onSuccess={() => {
                // Post creation handled by the modular component
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create Post</CardTitle>
                <CardDescription>
                  Select a user first to create posts (using new modular
                  component)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground py-8 text-center">
                  Please select a user from the left to create posts
                </div>
              </CardContent>
            </Card>
          )}

          <PostsList showAuthorActions={true} />
        </div>
      </div>
    </div>
  );
}
