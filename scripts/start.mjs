import { spawn } from 'child_process';
import { getAppPort, loadAppEnv } from './load-env.mjs';

loadAppEnv();
const port = getAppPort();

console.log(`Starting SaaS Storefront on http://localhost:${port}`);

const child = spawn('npx', ['next', 'start', '-p', port], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
