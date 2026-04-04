// Re-export everything from the shared API client package.
// Each portal uses the same API client — the env var NEXT_PUBLIC_API_URL
// controls which backend it talks to (defaults to http://localhost:3001/api/v1).
export * from '@intemso/api-client';
