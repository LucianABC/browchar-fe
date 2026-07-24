import { CHARACTER, PLAYBOOK } from "./fixtures";
import {
  mockCharacterDetail,
  mockCharactersList,
  mockDeleteCharacter,
  mockPlaybookDetail,
} from "./mocks";
import { expect, test } from "./test";

test("elimina un personaje desde el detalle y vuelve al listado", async ({
  page,
}) => {
  await mockCharacterDetail(page, CHARACTER);
  await mockPlaybookDetail(page, PLAYBOOK);
  await mockCharactersList(page, {
    data: [],
    meta: { page: 1, pageSize: 20, total: 0 },
  });

  let deleteCalls = 0;
  await mockDeleteCharacter(page, () => {
    deleteCalls += 1;
    return { status: 204 };
  });

  await page.goto(`/characters/${CHARACTER.id}`);
  await expect(page.getByLabel("Nombre")).toHaveValue(CHARACTER.name);

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe(`¿Eliminar a ${CHARACTER.name}?`);
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Eliminar" }).click();

  await expect(page).toHaveURL("/characters");
  await expect(
    page.getByText("Todavía no creaste ningún personaje."),
  ).toBeVisible();
  expect(deleteCalls).toBe(1);
});
