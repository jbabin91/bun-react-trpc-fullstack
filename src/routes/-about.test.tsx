// src/routes/about.test.tsx
import { describe, expect, test } from 'bun:test';

import { customRenderWithProviders, screen, waitFor } from '@/test/ui-setup'; // Updated import

describe('About Page UI', () => {
  test('renders the about page correctly', async () => {
    customRenderWithProviders(<div>Test</div>, { route: '/about' }); // Use the new customRenderWithProviders utility

    // Wait for the route to load and render
    await waitFor(() => {
      // Check for the main heading - be more specific to avoid multiple matches
      expect(
        screen.getByRole('heading', { name: 'About Page' }),
      ).toBeInTheDocument();
    });

    // Check for some static text content
    expect(
      screen.getByText(/this is the about page of the application/i),
    ).toBeInTheDocument();

    // Check that we can see the navigation links
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Database' })).toBeInTheDocument();
  });
});
