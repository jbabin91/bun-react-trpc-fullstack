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
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';

import { useCreatePost } from '../hooks';

type CreatePostFormProps = {
  authorId: string;
  onSuccess?: () => void;
};

export function CreatePostForm({ authorId, onSuccess }: CreatePostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const createPostMutation = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        authorId,
        content: content.trim(),
        title: title.trim(),
      });

      setTitle('');
      setContent('');
      onSuccess?.();
      toast.success('Post created successfully!');
    } catch {
      toast.error('Failed to create post');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
        <CardDescription>
          Share your thoughts with the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              disabled={createPostMutation.isPending}
              id="title"
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              disabled={createPostMutation.isPending}
              id="content"
              placeholder="Write your post content..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            disabled={createPostMutation.isPending}
            type="submit"
          >
            {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
