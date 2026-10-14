// Keep the hosting entry point while starting the API and frontend together.
import { tsImport } from 'tsx/esm/api';

process.env.NODE_ENV ||= 'production';
await tsImport('./server.ts', import.meta.url);
