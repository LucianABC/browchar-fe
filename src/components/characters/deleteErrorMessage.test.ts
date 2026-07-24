import { describe, expect, it } from "vitest";

import { ApiError } from "@/api/client";
import { deleteErrorMessage } from "./deleteErrorMessage";

describe("deleteErrorMessage", () => {
  it('devuelve el mensaje de "ya no existe" para un 404', () => {
    expect(
      deleteErrorMessage(new ApiError(404, "Character char_1 no encontrado")),
    ).toBe("Este personaje ya no existe o fue eliminado.");
  });

  it("devuelve un mensaje genérico para otros status de ApiError", () => {
    expect(deleteErrorMessage(new ApiError(500, "boom"))).toBe(
      "No se pudo eliminar el personaje. Intentá de nuevo más tarde.",
    );
  });

  it("devuelve un mensaje genérico para un error inesperado", () => {
    expect(deleteErrorMessage(new Error("network down"))).toBe(
      "No se pudo eliminar el personaje. Intentá de nuevo más tarde.",
    );
  });
});
