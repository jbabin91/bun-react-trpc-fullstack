import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/db/schema/users';
import { cn } from '@/lib/utils';

import { useDeleteUser, useUsers } from '../hooks';

type UsersListProps = {
  showActions?: boolean;
  onUserClick?: (user: User) => void;
  className?: string;
  maxHeight?: string;
};

export function UsersList({
  showActions = false,
  onUserClick,
  className,
  maxHeight,
}: UsersListProps) {
  const { data: users, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser.mutateAsync({ id: userId });
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardHeader>
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-destructive text-center', className)}>
        Failed to load users. Please try again.
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className={cn('text-muted-foreground text-center', className)}>
        No users found.
      </div>
    );
  }

  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col', className)}
      style={maxHeight ? { height: maxHeight } : undefined}
    >
      <ScrollArea className="flex-1 overflow-hidden rounded-md">
        <div className="space-y-4">
          {users.map((user) => (
            <Card
              key={user.id}
              className={cn(onUserClick && 'cursor-pointer hover:shadow-md')}
              onClick={() => onUserClick?.(user)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-sm">
                  Created: {format(new Date(user.createdAt), 'PPp')}
                </div>
                {user.updatedAt && user.updatedAt !== user.createdAt && (
                  <div className="text-muted-foreground text-sm">
                    Updated: {format(new Date(user.updatedAt), 'PPp')}
                  </div>
                )}

                {showActions && (
                  <div className="mt-4 space-x-2">
                    <Button
                      disabled={deleteUser.isPending}
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(user.id);
                      }}
                    >
                      {deleteUser.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
