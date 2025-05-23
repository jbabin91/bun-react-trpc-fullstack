import { createFileRoute } from '@tanstack/react-router';

import logo from '@/assets/logo.svg';
import reactLogo from '@/assets/react.svg';
import { APITester } from '@/components/api-tester';

export const Route = createFileRoute('/')({
  component: Home,
});

export function Home() {
  return (
    <div className="app">
      <div className="logo-container">
        <img alt="Bun Logo" className="logo bun-logo" src={logo} />
        <img alt="React Logo" className="logo react-logo" src={reactLogo} />
      </div>

      <h1>Bun + React</h1>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <APITester />
    </div>
  );
}
