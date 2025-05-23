/** @type {import("lint-staged").Config} */
export default {
  // Type check TypeScript files
  '*.(ts|tsx)': () => 'bun typecheck',
  // Lint files
  '*.(ts|tsx|js|jsx|cjs|mjs)': () => 'bun lint',
  // Format files
  '*.(ts|tsx|js|jsx|cjs|mjs|json|md|mdx)': (files) =>
    `bun prettier -uc ${files.join(' ')}`,
};
