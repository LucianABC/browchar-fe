import type { Page, Route } from "@playwright/test";

/**
 * Helpers de mock de red para los E2E (DEV-199) — equivalente de
 * `page.route()` a los handlers MSW de la suite de vitest (DEV-200), mismo
 * espíritu: cada test registra la respuesta que necesita, nada corre contra
 * `browchar-api` real. A diferencia de MSW, `page.route()` no tiene un modo
 * "falla si no hay handler": una request sin mock sigue a la red real y, sin
 * un backend escuchando, falla con un error de conexión visible en la UI (no
 * queda en un limbo silencioso) — igual hay que mockear todo lo que la
 * pantalla pide.
 *
 * Patrones de URL: `**\/recurso*` (comodín simple, sin cruzar `/`) matcheá la
 * lista/creación (`/characters`, con o sin query string); `**\/recurso/*`
 * matchea el detalle/update de un id (`/characters/:id`) sin pisar el
 * anterior, porque el `/` extra no lo cruza un `*` simple.
 *
 * Gotcha: `page.route()` intercepta TODO el tráfico que matchea el patrón, no
 * solo `fetch`/XHR — incluida la navegación del documento. `/characters/:id`
 * matchea tanto la llamada a la API como el `page.goto("/characters/:id")` en
 * sí; sin filtrar por `resourceType()`, el mock reemplaza la página entera
 * por el JSON crudo en vez de dejar pasar la navegación real de Next.js.
 */
async function jsonRoute(
  page: Page,
  pattern: string,
  method: string,
  handler: (route: Route) => Promise<void> | void,
): Promise<void> {
  await page.route(pattern, async (route) => {
    const resourceType = route.request().resourceType();
    if (resourceType !== "fetch" && resourceType !== "xhr") {
      await route.fallback();
      return;
    }
    if (route.request().method() !== method) {
      await route.fallback();
      return;
    }
    await handler(route);
  });
}

export function mockPlaybooksList(page: Page, playbooks: unknown) {
  return jsonRoute(page, "**/playbooks*", "GET", (route) =>
    route.fulfill({ json: playbooks }),
  );
}

export function mockPlaybookDetail(page: Page, playbook: unknown) {
  return jsonRoute(page, "**/playbooks/*", "GET", (route) =>
    route.fulfill({ json: playbook }),
  );
}

export function mockCharactersList(page: Page, envelope: unknown) {
  return jsonRoute(page, "**/characters*", "GET", (route) =>
    route.fulfill({ json: envelope }),
  );
}

export function mockCharacterDetail(page: Page, character: unknown) {
  return jsonRoute(page, "**/characters/*", "GET", (route) =>
    route.fulfill({ json: character }),
  );
}

interface MutationResult {
  status?: number;
  json: unknown;
}

export function mockCreateCharacter(
  page: Page,
  handler: (body: unknown) => MutationResult,
) {
  return jsonRoute(page, "**/characters*", "POST", async (route) => {
    const { status = 201, json } = handler(route.request().postDataJSON());
    await route.fulfill({ status, json });
  });
}

export function mockUpdateCharacter(
  page: Page,
  handler: (body: unknown) => MutationResult,
) {
  return jsonRoute(page, "**/characters/*", "PATCH", async (route) => {
    const { status = 200, json } = handler(route.request().postDataJSON());
    await route.fulfill({ status, json });
  });
}
