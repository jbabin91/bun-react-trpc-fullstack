import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useTRPC } from '@/lib/trpc';

export const Route = createFileRoute('/database')({
  component: DatabaseDemo,
});

function DatabaseDemo() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);

  // Queries using tRPC React hooks
  const users = useQuery(trpc.users.list.queryOptions());
  const posts = useQuery(trpc.posts.getPostsWithAuthors.queryOptions());
  const postCount = useQuery(trpc.posts.getCount.queryOptions());

  // Mutations
  const createUserMutation = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.users.list.queryKey() });
        setNewUserName('');
        setNewUserEmail('');
      },
    }),
  );

  const createPostMutation = useMutation(
    trpc.posts.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getPostsWithAuthors.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getCount.queryKey(),
        });
        setNewPostTitle('');
        setNewPostContent('');
        setSelectedAuthorId(null);
      },
    }),
  );

  const deleteUserMutation = useMutation(
    trpc.users.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.users.list.queryKey() });
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getPostsWithAuthors.queryKey(),
        });
      },
    }),
  );

  const deletePostMutation = useMutation(
    trpc.posts.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getPostsWithAuthors.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getCount.queryKey(),
        });
      },
    }),
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName && newUserEmail) {
      createUserMutation.mutate({
        email: newUserEmail,
        name: newUserName,
      });
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostTitle && newPostContent && selectedAuthorId) {
      createPostMutation.mutate({
        authorId: selectedAuthorId,
        content: newPostContent,
        title: newPostTitle,
      });
    }
  };

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Database Demo</h1>
        <p className="text-muted-foreground mt-2">
          Testing Drizzle ORM with tRPC integration
        </p>
        {postCount.data && (
          <Badge className="mt-2" variant="secondary">
            Total Posts: {postCount.data.count}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Users Section */}
        <div className="space-y-6">
          <Card className="flex h-[800px] flex-col">
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage users in the database</CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
              <form className="space-y-4" onSubmit={handleCreateUser}>
                <div className="space-y-2">
                  <Label htmlFor="userName">Name</Label>
                  <Input
                    id="userName"
                    placeholder="Enter user name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    placeholder="Enter user email"
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

              <Separator />

              <div className="flex min-h-0 flex-1 flex-col space-y-2">
                <h4 className="font-medium">Existing Users</h4>
                {users.isLoading && (
                  <p className="text-muted-foreground text-sm">Loading...</p>
                )}
                <ScrollArea className="flex-1 overflow-hidden rounded-md">
                  <div className="space-y-3">
                    {users.data?.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {user.email}
                          </p>
                        </div>
                        <Button
                          disabled={deleteUserMutation.isPending}
                          size="sm"
                          title="Deleting this user will also delete all their posts"
                          variant="destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Deleting user:', user.id);
                            deleteUserMutation.mutate({ id: user.id });
                          }}
                        >
                          {deleteUserMutation.isPending
                            ? 'Deleting...'
                            : 'Delete'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          <Card className="flex h-[800px] flex-col">
            <CardHeader>
              <CardTitle>Posts</CardTitle>
              <CardDescription>Manage posts in the database</CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
              <form className="space-y-4" onSubmit={handleCreatePost}>
                <div className="space-y-2">
                  <Label htmlFor="postTitle">Title</Label>
                  <Input
                    id="postTitle"
                    placeholder="Enter post title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postContent">Content</Label>
                  <Textarea
                    id="postContent"
                    placeholder="Enter post content"
                    rows={3}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorSelect">Author</Label>
                  <select
                    className="w-full rounded border p-2"
                    id="authorSelect"
                    value={selectedAuthorId ?? ''}
                    onChange={(e) =>
                      setSelectedAuthorId(e.target.value || null)
                    }
                  >
                    <option value="">Select an author</option>
                    {users.data?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  className="w-full"
                  disabled={createPostMutation.isPending || !selectedAuthorId}
                  type="submit"
                >
                  {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
                </Button>
              </form>

              <Separator />

              <div className="flex min-h-0 flex-1 flex-col space-y-2">
                <h4 className="font-medium">Existing Posts</h4>
                {posts.isLoading && (
                  <p className="text-muted-foreground text-sm">Loading...</p>
                )}
                <ScrollArea className="flex-1 overflow-hidden rounded-md">
                  <div className="space-y-3">
                    {posts.data?.map((post) => (
                      <div
                        key={post.id}
                        className="space-y-2 rounded border p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium">{post.title}</h5>
                            <p className="text-muted-foreground text-sm">
                              by {post.author.name}
                            </p>
                          </div>
                          <Button
                            disabled={deletePostMutation.isPending}
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Deleting post:', post.id);
                              deletePostMutation.mutate({ id: post.id });
                            }}
                          >
                            {deletePostMutation.isPending
                              ? 'Deleting...'
                              : 'Delete'}
                          </Button>
                        </div>
                        <p className="text-sm">{post.content}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
