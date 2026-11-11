import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'*.e2e.spec.ts',timeout:35000,retries:process.env.CI?1:0,
  workers:process.env.CI?2:undefined,
  use:{baseURL:'http://127.0.0.1:4321',trace:'retain-on-failure'},
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome']}},
    {name:'firefox',testMatch:'**/crossbrowser.e2e.spec.ts',use:{...devices['Desktop Firefox']}},
    {name:'webkit',testMatch:'**/crossbrowser.e2e.spec.ts',use:{...devices['Desktop Safari']}}
  ],
  webServer:{command:'npm run dev -- --port 4321',url:'http://127.0.0.1:4321',reuseExistingServer:!process.env.CI,timeout:90000},
});
