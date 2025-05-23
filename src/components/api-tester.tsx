import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useRef, useState } from 'react';

import { useTRPC, useTRPCClient } from '@/lib/trpc';

export function APITester() {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'PUT'>('GET');
  const [isLoading, setIsLoading] = useState(false);

  // Mutation for PUT requests
  const updateHelloMutation = useMutation(trpc.updateHello.mutationOptions());

  const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const method = formData.get('method') as 'GET' | 'PUT';
      const name = formData.get('name') as string;

      let result;

      if (method === 'GET') {
        // Use the tRPC client directly for GET requests
        result = await trpcClient.hello.query({
          method: 'GET',
          name: name || undefined,
        });
      } else {
        // Use mutation for PUT
        result = await updateHelloMutation.mutateAsync({
          name: name || undefined,
        });
      }

      if (responseInputRef.current) {
        responseInputRef.current.value = JSON.stringify(result, null, 2);
      }
    } catch (error) {
      if (responseInputRef.current) {
        responseInputRef.current.value = String(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="api-tester">
      <form className="endpoint-row" onSubmit={testEndpoint}>
        <select
          className="method"
          name="method"
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value as 'GET' | 'PUT')}
        >
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
        </select>
        <input
          className="url-input"
          defaultValue=""
          name="name"
          placeholder="Enter name (optional)"
          type="text"
        />
        <button className="send-button" disabled={isLoading} type="submit">
          {isLoading ? 'Loading...' : 'Send'}
        </button>
      </form>

      {/* Show loading state */}
      {isLoading && (
        <div className="loading-indicator">
          Testing {selectedMethod} request...
        </div>
      )}

      {/* Show errors */}
      {updateHelloMutation.error && (
        <div className="error-indicator">
          Error: {updateHelloMutation.error?.message ?? 'Unknown error'}
        </div>
      )}

      <textarea
        ref={responseInputRef}
        readOnly
        className="response-area"
        placeholder="Response will appear here..."
      />
    </div>
  );
}
