import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';

import { useDeletePost, usePostsWithAuthors } from '../hooks';

type PostsListProps = {
  showAuthorActions?: boolean;
};

export function PostsList({ showAuthorActions = false }: PostsListProps) {
  const { data: posts, isLoading, error } = usePostsWithAuthors();
  const deletePostMutation = useDeletePost();

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      return;
    }

    try {
      await deletePostMutation.mutateAsync({ id: postId });
      toast.success('Post deleted successfully');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading posts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Failed to load posts</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
        <CardDescription>
          {posts?.length ? `${posts.length} posts found` : 'No posts yet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!posts?.length ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">No posts to display</div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={post.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm leading-none font-medium">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge className="text-xs" variant="secondary">
                            {post.author.name}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {showAuthorActions && (
                        <Button
                          disabled={deletePostMutation.isPending}
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePost(post.id, post.title)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {post.content}
                    </p>
                  </div>
                  {index < posts.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
