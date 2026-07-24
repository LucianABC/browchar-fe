import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import type { CharacterSummary } from "@/types";
import { CharacterCard } from "./characterCard";

const CHARACTER: CharacterSummary = {
  id: "char_1",
  name: "Mad Dog",
  playbookName: "Motorista",
  gameName: "Apocalypse World",
  campaignName: "Ruinas de Neo Tokio",
  createdAt: "2026-04-01T09:30:00.000Z",
  updatedAt: "2026-04-28T18:00:00.000Z",
};

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("CharacterCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T18:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra el nombre y el playbook del personaje", () => {
    renderWithClient(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText("Mad Dog")).toBeInTheDocument();
    expect(screen.getByText("Motorista")).toBeInTheDocument();
  });

  it("muestra el juego y la campaña cuando corresponde", () => {
    renderWithClient(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText("Apocalypse World")).toBeInTheDocument();
    expect(screen.getByText("Ruinas de Neo Tokio")).toBeInTheDocument();
  });

  it("no muestra badge de campaña cuando el personaje no tiene una", () => {
    renderWithClient(
      <CharacterCard character={{ ...CHARACTER, campaignName: undefined }} />,
    );
    expect(screen.queryByText("Ruinas de Neo Tokio")).not.toBeInTheDocument();
  });

  it("ubica los chips de juego y campaña antes del nombre", () => {
    const { container } = renderWithClient(
      <CharacterCard character={CHARACTER} />,
    );
    const html = container.innerHTML;
    expect(html.indexOf("Apocalypse World")).toBeLessThan(
      html.indexOf("Mad Dog"),
    );
    expect(html.indexOf("Ruinas de Neo Tokio")).toBeLessThan(
      html.indexOf("Mad Dog"),
    );
  });

  it("muestra la fecha de creación absoluta y el tiempo relativo desde la última edición", () => {
    renderWithClient(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText(/Creado el/)).toHaveTextContent(
      "Creado el 1 de abr de 2026",
    );
    const lastEdited = screen.getByText(/Última edición/);
    expect(lastEdited).toHaveTextContent("Última edición hace 3 días");
    expect(lastEdited).toHaveAttribute("title", "28 de abr de 2026");
  });

  it("linkea al detalle del personaje", () => {
    renderWithClient(<CharacterCard character={CHARACTER} />);
    expect(screen.getByRole("button", { name: "Ver detalle" })).toHaveAttribute(
      "href",
      "/characters/char_1",
    );
  });

  describe("eliminar", () => {
    beforeEach(() => {
      // Los tests de esta suite esperan requests reales (MSW) con
      // waitFor/findBy — timers reales, no los fake de arriba (solo hacen
      // falta para las aserciones de fecha).
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("pide confirmación, llama a DELETE /characters/:id y oculta la card si se confirma", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      let receivedUrl: string | undefined;
      let receivedMethod: string | undefined;
      server.use(
        http.delete("/characters/:id", ({ request }) => {
          receivedUrl = new URL(request.url).pathname;
          receivedMethod = request.method;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderWithClient(<CharacterCard character={CHARACTER} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Eliminar personaje" }),
      );

      expect(window.confirm).toHaveBeenCalledWith("¿Eliminar a Mad Dog?");
      await waitFor(() =>
        expect(screen.queryByText("Mad Dog")).not.toBeInTheDocument(),
      );
      expect(receivedUrl).toBe("/characters/char_1");
      expect(receivedMethod).toBe("DELETE");
    });

    it("no llama a la API ni oculta la card si se cancela la confirmación", () => {
      vi.spyOn(window, "confirm").mockReturnValue(false);
      let called = false;
      server.use(
        http.delete("/characters/:id", () => {
          called = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderWithClient(<CharacterCard character={CHARACTER} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Eliminar personaje" }),
      );

      expect(screen.getByText("Mad Dog")).toBeInTheDocument();
      expect(called).toBe(false);
    });

    it("deshabilita el botón mientras la eliminación está pendiente", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      let resolveDelete!: () => void;
      server.use(
        http.delete(
          "/characters/:id",
          () =>
            new Promise((resolve) => {
              resolveDelete = () =>
                resolve(new HttpResponse(null, { status: 204 }));
            }),
        ),
      );
      renderWithClient(<CharacterCard character={CHARACTER} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Eliminar personaje" }),
      );

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Eliminar personaje" }),
        ).toBeDisabled(),
      );

      resolveDelete();
      await waitFor(() =>
        expect(screen.queryByText("Mad Dog")).not.toBeInTheDocument(),
      );
    });

    it("muestra un mensaje y no oculta la card cuando la API devuelve 404", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      server.use(
        http.delete("/characters/:id", () =>
          HttpResponse.json(
            { message: "Character char_1 no encontrado" },
            { status: 404 },
          ),
        ),
      );
      renderWithClient(<CharacterCard character={CHARACTER} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Eliminar personaje" }),
      );

      expect(
        await screen.findByText("Este personaje ya no existe o fue eliminado."),
      ).toBeInTheDocument();
      expect(screen.getByText("Mad Dog")).toBeInTheDocument();
    });

    it("muestra un mensaje genérico ante un error inesperado", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      server.use(
        http.delete("/characters/:id", () =>
          HttpResponse.json({}, { status: 500 }),
        ),
      );
      renderWithClient(<CharacterCard character={CHARACTER} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Eliminar personaje" }),
      );

      expect(
        await screen.findByText(
          "No se pudo eliminar el personaje. Intentá de nuevo más tarde.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Mad Dog")).toBeInTheDocument();
    });
  });
});
