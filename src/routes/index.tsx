import { createFileRoute } from '@tanstack/react-router';
import { APITester } from '../components/APITester';

import logo from '../assets/logo.svg';
import reactLogo from '../assets/react.svg';

export const Route = createFileRoute('/')({
  component: Home,
});

export function Home() {
  return (
    <div className="app">
      <div className="logo-container">
        <img src={logo} alt="Bun Logo" className="logo bun-logo" />
        <img src={reactLogo} alt="React Logo" className="logo react-logo" />
      </div>

      <h1>Bun + React</h1>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <APITester />
    </div>
  );
}
