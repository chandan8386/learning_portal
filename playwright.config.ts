import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

const PORT = 3100;
// Use a preinstalled Chromium when one is provided (e.g. in CI images).
const executablePath = process.env.CHROMIUM_PATH ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"], launchOptions: { executablePath } },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/classes`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
