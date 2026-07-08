import dotenv from 'dotenv';
import path from 'path';

// Resolve absolute path to apps/backend/.env
const localEnvPath = path.resolve(__dirname, '../../.env');
const dotenvResult = dotenv.config({ path: localEnvPath });

console.log(`[Env Loader] Initializing environment variables...`);
console.log(`[Env Loader] Loading from: ${localEnvPath}. Result: ${dotenvResult.error ? 'Error' : 'Success'} (Keys: ${Object.keys(dotenvResult.parsed || {}).length})`);

if (dotenvResult.error) {
  // If backend .env fails, attempt root .env fallback
  const rootEnvPath = path.resolve(__dirname, '../../../../.env');
  const rootResult = dotenv.config({ path: rootEnvPath });
  console.log(`[Env Loader] Root Fallback Loading from: ${rootEnvPath}. Result: ${rootResult.error ? 'Error' : 'Success'} (Keys: ${Object.keys(rootResult.parsed || {}).length})`);
}
