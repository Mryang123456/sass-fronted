const demoFlag = import.meta.env.VITE_DEMO_MODE;

if (demoFlag !== undefined && demoFlag !== 'true' && demoFlag !== 'false') {
  throw new Error('VITE_DEMO_MODE must be either "true" or "false"');
}

export const appConfig = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, ''),
  // Safe default: an omitted flag must never silently replace the real API with fixtures.
  demoMode: demoFlag === 'true',
} as const;
