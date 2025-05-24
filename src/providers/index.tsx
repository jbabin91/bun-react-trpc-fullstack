import { Toaster } from '@/components/ui/sonner';

import { ThemeProvider } from './theme-provider';
import { TRPCQueryProvider } from './trpc-query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TRPCQueryProvider>
        {children}
        <Toaster />
      </TRPCQueryProvider>
    </ThemeProvider>
  );
}
