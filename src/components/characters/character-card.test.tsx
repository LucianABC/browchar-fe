import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { CharacterView } from "@/lib/types";
import { CharacterCard } from "./character-card";

const CHARACTER: CharacterView = {
  id: "char_1",
  name: "Mad Dog",
  ownerId: "usr_demo",
  values: { cool: 3, look: "Cuero y cadenas" },
  createdAt: "2026-01-15T12:00:00.000Z",
  updatedAt: "2026-01-15T12:00:00.000Z",
  deletedAt: null,
  playbookId: "playbook_1",
  playbookVersion: 1,
};

describe("CharacterCard", () => {
  it("muestra el nombre del personaje", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText("Mad Dog")).toBeInTheDocument();
  });

  it("muestra hasta dos entradas de values", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText("cool:")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("look:")).toBeInTheDocument();
    expect(screen.getByText("Cuero y cadenas")).toBeInTheDocument();
  });

  it("no rompe cuando values está vacío", () => {
    render(<CharacterCard character={{ ...CHARACTER, values: {} }} />);
    expect(screen.getByText("Mad Dog")).toBeInTheDocument();
  });

  it("linkea al detalle del personaje", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByRole("button", { name: "Ver detalle" })).toHaveAttribute(
      "href",
      "/characters/char_1",
    );
  });
});
