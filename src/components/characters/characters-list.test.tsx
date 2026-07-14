import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { CharacterView } from "@/lib/types";
import { CharactersList } from "./characters-list";

const CHARACTERS: CharacterView[] = [
  {
    id: "char_1",
    name: "Mad Dog",
    ownerId: "usr_demo",
    values: { cool: 3, look: "Cuero y cadenas" },
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-01-15T12:00:00.000Z",
    deletedAt: null,
    playbookId: "playbook_1",
    playbookVersion: 1,
  },
  {
    id: "char_2",
    name: "Silent Star",
    ownerId: "usr_demo",
    values: { hard: 2 },
    createdAt: "2026-02-02T12:00:00.000Z",
    updatedAt: "2026-02-02T12:00:00.000Z",
    deletedAt: null,
    playbookId: "playbook_2",
    playbookVersion: 1,
  },
];

describe("CharactersList", () => {
  it("muestra un estado de carga", () => {
    render(<CharactersList characters={[]} isPending isError={false} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando personajes…",
    );
  });

  it("muestra un error", () => {
    render(<CharactersList characters={[]} isPending={false} isError />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los personajes",
    );
  });

  it("muestra un estado vacío cuando no hay personajes", () => {
    render(
      <CharactersList characters={[]} isPending={false} isError={false} />,
    );
    expect(
      screen.getByText("Todavía no creaste ningún personaje."),
    ).toBeInTheDocument();
  });

  it("renderiza cada personaje", () => {
    render(
      <CharactersList
        characters={CHARACTERS}
        isPending={false}
        isError={false}
      />,
    );
    expect(screen.getByText("Mad Dog")).toBeInTheDocument();
    expect(screen.getByText("Silent Star")).toBeInTheDocument();
  });
});
