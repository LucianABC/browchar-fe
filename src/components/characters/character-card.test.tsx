import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { CharacterSummary } from "@/lib/types";
import { CharacterCard } from "./character-card";

const CHARACTER: CharacterSummary = {
  id: "char_1",
  name: "Mad Dog",
  playbookName: "Motorista",
  gameName: "Apocalypse World",
  campaignName: "Ruinas de Neo Tokio",
};

describe("CharacterCard", () => {
  it("muestra el nombre y el playbook del personaje", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText("Mad Dog")).toBeInTheDocument();
    expect(screen.getByText("Motorista")).toBeInTheDocument();
  });

  it("muestra el juego y la campaña cuando corresponde", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText("Apocalypse World")).toBeInTheDocument();
    expect(screen.getByText("Ruinas de Neo Tokio")).toBeInTheDocument();
  });

  it("no muestra badge de campaña cuando el personaje no tiene una", () => {
    render(
      <CharacterCard character={{ ...CHARACTER, campaignName: undefined }} />,
    );
    expect(screen.queryByText("Ruinas de Neo Tokio")).not.toBeInTheDocument();
  });

  it("linkea al detalle del personaje", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByRole("button", { name: "Ver detalle" })).toHaveAttribute(
      "href",
      "/characters/char_1",
    );
  });
});
