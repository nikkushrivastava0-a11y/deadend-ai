import {defineConfig} from '@playwright/test';
const external=process.env.DEADEND_BROWSER_BASE_URL;
export default defineConfig({
 testDir:'./tests/browser',timeout:240000,expect:{timeout:20000},fullyParallel:false,workers:1,retries:0,
 reporter:[['./tests/browser/safe-reporter.js']],
 use:{baseURL:external||'http://127.0.0.1:3001',actionTimeout:15000,navigationTimeout:30000,trace:'off',video:'off',screenshot:'off',acceptDownloads:true},
 ...(external?{}:{webServer:{command:'node scripts/browser-test-server.mjs',url:'http://127.0.0.1:3001/api/health',reuseExistingServer:false,timeout:60000}}),
});
