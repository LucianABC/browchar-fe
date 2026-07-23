import { FieldType, type PlaybookView } from "@/types";

/**
 * Datos compartidos por los specs E2E (DEV-199). Un playbook mínimo con un
 * único campo TEXT requerido — alcanza para ejercitar el form dinámico sin
 * acoplarse a un template real de `data/playbooks/*` (que vive en
 * browchar-api, otro repo).
 */
export const PLAYBOOK: PlaybookView = {
  id: "guerrero",
  name: "Guerrero",
  version: 3,
  createdAt: "2026-01-15T12:00:00.000Z",
  game: { gameId: "dnd5e", gameName: "D&D 5e" },
  template: [
    {
      id: "sec",
      title: "Sección",
      fields: [
        {
          id: "concepto",
          label: "Concepto",
          type: FieldType.TEXT,
          required: true,
        },
      ],
    },
  ],
};

export const CHARACTER = {
  id: "char_1",
  name: "Aria",
  ownerId: "usr_demo",
  playbookId: PLAYBOOK.id,
  playbookVersion: PLAYBOOK.version,
  values: { concepto: "Una guerrera errante" },
  createdAt: "2026-01-15T12:00:00.000Z",
  updatedAt: "2026-01-15T12:00:00.000Z",
  deletedAt: null,
};

export const CHARACTER_LIST_ITEM = {
  ...CHARACTER,
  playbookName: PLAYBOOK.name,
  gameName: PLAYBOOK.game.gameName,
};
