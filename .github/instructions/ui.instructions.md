---
applyTo: '**/*.tsx'
---

# UI Component Standards & Guidelines

## Design System Overview

This project uses **shadcn/ui** components with **Tailwind CSS v4** for a modern, accessible design system:

- **Base Style**: New York style variant
- **Color System**: OKLCH color space with CSS custom properties
- **Typography**: Geist & Geist Mono fonts from Google Fonts
- **Icons**: Lucide React icon library
- **Dark Mode**: next-themes with system preference support
- **Component Library**: Radix UI primitives with custom styling

## Component Architecture

### Component Structure Pattern

All UI components follow this consistent structure:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

// Define variants using class-variance-authority (cva)
const componentVariants = cva(
  'base-classes', // Base styles
  {
    variants: {
      variant: {
        default: 'default-styles',
        destructive: 'destructive-styles',
      },
      size: {
        sm: 'small-styles',
        default: 'default-size-styles',
        lg: 'large-styles',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Component using function declaration (NOT arrow function)
function Component({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof componentVariants>) {
  return (
    <div
      className={cn(componentVariants({ variant, size, className }))}
      data-slot="component-name"
      {...props}
    />
  );
}

export { Component, componentVariants };
```

### Key Patterns

1. **Function Declarations**: Always use function declarations, not arrow functions
2. **Forwarded Props**: Spread remaining props using `{...props}`
3. **Data Slots**: Include `data-slot` attributes for CSS targeting
4. **Variant Props**: Use `VariantProps` for type-safe variant props
5. **Class Merging**: Always use `cn()` utility for className merging

## Styling Guidelines

### Tailwind CSS v4 Features

This project uses Tailwind CSS v4 with modern features:

```css
/* Custom variants for dark mode */
@custom-variant dark (&:is(.dark *));

/* Theme configuration */
@theme {
  --font-geist: 'Geist', sans-serif;
  --font-geist-mono: 'Geist Mono', monospace;
}

/* Utility classes */
@utility size-*:size {
  width: var(--size);
  height: var(--size);
}
```

### CSS Custom Properties

Use semantic color tokens defined in `globals.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  /* ... more tokens */
}
```

### Class Naming Conventions

- **Component Classes**: Use semantic Tailwind utilities
- **State Classes**: Use data attributes for state-dependent styling
- **Focus States**: Always include focus-visible states with ring utilities
- **Dark Mode**: Handled automatically through CSS custom properties

## Component Categories

### Form Components

Forms use `react-hook-form` with `zod` validation:

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Navigation Components

- **Sidebar**: Complex collapsible sidebar with mobile support
- **Navigation Menu**: Radix-based navigation with hover/focus states
- **Breadcrumbs**: Semantic navigation breadcrumbs

### Feedback Components

- **Toast**: Sonner-based toast notifications with theme integration
- **Alert**: Various alert states (default, destructive, warning)
- **Progress**: Animated progress indicators

### Layout Components

- **Card**: Flexible card layout with header, content, footer
- **Sheet**: Slide-out panels for mobile and desktop
- **Dialog**: Modal dialogs with focus management
- **Accordion**: Collapsible content sections

## Theme Integration

### Dark Mode Support

Components automatically support dark mode through:

```tsx
// Theme provider setup
<ThemeProvider>
  <App />
</ThemeProvider>

// Mode toggle component
<ModeToggle /> // Dropdown with Light/Dark/System options
```

### Color Semantics

Use semantic color classes:

- `bg-background` / `text-foreground` - Main background/text
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-destructive` / `text-destructive-foreground` - Error states
- `bg-muted` / `text-muted-foreground` - Secondary content
- `bg-accent` / `text-accent-foreground` - Highlights

## Accessibility Standards

### Required Practices

1. **Semantic HTML**: Use proper HTML elements (`button`, `nav`, `main`, etc.)
2. **ARIA Labels**: Include `aria-label` for complex interactions
3. **Focus Management**: Implement proper focus flow and visible focus states
4. **Screen Reader Support**: Include `sr-only` text for icon-only buttons
5. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible

### Focus States

All interactive components include comprehensive focus states:

```tsx
className={cn(
  "focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
  "focus-visible:border-ring transition-[color,box-shadow]"
)}
```

## Testing Patterns

### Component Testing

Test components using the provided test utilities:

```tsx
import { render, screen } from '@/test/ui-setup';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Visual Testing

- Use semantic queries (`getByRole`, `getByLabelText`)
- Test keyboard navigation
- Verify focus states
- Test with different theme modes

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Use `React.lazy()` for heavy components
2. **Memoization**: Use `React.memo()` for expensive renders
3. **Bundle Splitting**: Keep component chunks reasonable
4. **CSS-in-JS**: Minimize runtime CSS generation

### Bundle Size

- Tree-shakable imports from `@/components/ui`
- Radix UI components are optimized for bundle size
- Tailwind CSS purges unused styles automatically

## Development Workflow

### Adding New Components

1. Create component in `src/components/ui/[name].tsx`
2. Follow the established pattern (variants, props, styling)
3. Export from component file
4. Add to documentation if complex
5. Test across themes and screen sizes

### Customizing Existing Components

1. Extend variants in the `cva` configuration
2. Add new props while maintaining backward compatibility
3. Update TypeScript types accordingly
4. Test all existing use cases

### shadcn/ui Integration

Components are managed through the shadcn/ui CLI:

```bash
# Add new component
bun dlx shadcn@latest add button

# Update component
bun dlx shadcn@latest add button --overwrite
```

Configuration in `components.json`:

- Style: `new-york`
- Base color: `zinc`
- CSS variables: enabled
- TypeScript: enabled
