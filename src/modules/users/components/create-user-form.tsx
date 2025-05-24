import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { useCreateUser } from '../hooks';
import { type CreateUserInput, createUserSchema } from '../schemas';

type CreateUserFormProps = {
  onSuccess?: () => void;
  className?: string;
};

export function CreateUserForm({ onSuccess, className }: CreateUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createUser = useCreateUser();

  const form = useForm<CreateUserInput>({
    defaultValues: {
      email: '',
      name: '',
    },
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true);
    try {
      await createUser.mutateAsync(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className={cn(className)} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter email address"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full"
            disabled={isSubmitting || createUser.isPending}
            type="submit"
          >
            {isSubmitting || createUser.isPending
              ? 'Creating...'
              : 'Create User'}
          </Button>

          {createUser.error && (
            <div className={cn('text-destructive text-sm')}>
              Failed to create user. Please try again.
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
