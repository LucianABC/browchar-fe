import { defineConfig, devices } from "@playwright/test";

/**
 * E2E black-box (DEV-199): dirige un browser real contra la app renderizada,
 * mockeando la API en el borde de red por test (`page.route`, ver
 * `e2e/mocks.ts`) — no depende de `browchar-api` ni de Docker. Decisión
 * documentada en el README ("E2E tests").
 *
 * `NEXT_PUBLIC_API_URL: ""` fuerza fetches relativos al origin de la app
 * (`http://localhost:3001/characters`, no una URL cruzada a otro host), igual
 * criterio que vitest (`BASE_URL` cae en `""` porque no carga `.env.local`) —
 * determinista sin importar qué tenga configurado el `.env.local` de quien
 * corre los tests localmente.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    env: { NEXT_PUBLIC_API_URL: "" },
    timeout: 120_000,
  },
});
