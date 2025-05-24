import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { useTRPC, useTRPCClient } from '@/lib/trpc';

const formSchema = z.object({
  method: z.enum(['GET', 'PUT']),
  name: z.string().optional(),
});

export function APITester() {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mutation for PUT requests
  const updateHelloMutation = useMutation(trpc.updateHello.mutationOptions());

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      method: 'GET',
      name: '',
    },
    resolver: zodResolver(formSchema),
  });

  const testEndpoint = (values: z.infer<typeof formSchema>) => {
    const { method, name } = values;

    // Clear any previous errors
    updateHelloMutation.reset();

    const apiCall = async () => {
      setIsLoading(true);
      try {
        let result;

        if (method === 'GET') {
          // Use the tRPC client directly for GET requests
          result = await trpcClient.hello.query({
            method: 'GET',
            name: name ?? undefined,
          });
        } else {
          // Use mutation for PUT
          result = await updateHelloMutation.mutateAsync({
            name: name ?? undefined,
          });
        }

        return result;
      } finally {
        setIsLoading(false);
      }
    };

    toast.promise(apiCall(), {
      error: (error) => {
        // Update the response textarea on error
        if (responseInputRef.current) {
          responseInputRef.current.value = String(error);
        }
        return `${method} request failed: ${error?.message ?? 'Unknown error'}`;
      },
      loading: `Making ${method} request...`,
      success: (data) => {
        // Update the response textarea on success
        if (responseInputRef.current) {
          responseInputRef.current.value = JSON.stringify(data, null, 2);
        }
        return `${method} request completed successfully!`;
      },
    });
  };

  return (
    <div className="mx-auto mt-8 flex w-full max-w-[600px] flex-col gap-4 text-left">
      <Form {...form}>
        <form
          className="border-border bg-card focus-within:border-primary hover:border-accent box-border flex w-full flex-row items-center gap-2 rounded-xl border-2 p-3 transition-all duration-300"
          onSubmit={form.handleSubmit(testEndpoint)}
        >
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Enter name (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button
              className="w-full"
              loading={isLoading}
              type="submit"
              variant="outline"
            >
              Send
            </Button>
          </div>
        </form>
      </Form>

      <Textarea
        ref={responseInputRef}
        readOnly
        placeholder="Response will appear here..."
      />
    </div>
  );
}
