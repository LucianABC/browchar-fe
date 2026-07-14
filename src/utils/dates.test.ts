import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDate, formatRelativeDate } from "./dates";

describe("formatDate", () => {
  it("formatea una fecha ISO en formato absoluto es-AR", () => {
    expect(formatDate("2026-01-15T12:00:00.000Z")).toBe("15 de ene de 2026");
  });
});

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("describe una fecha de hace unos segundos", () => {
    vi.setSystemTime(new Date("2026-04-28T18:00:10.000Z"));
    expect(formatRelativeDate("2026-04-28T18:00:00.000Z")).toBe(
      "hace menos de un minuto",
    );
  });

  it("describe una fecha de hace unos días", () => {
    vi.setSystemTime(new Date("2026-05-01T18:00:00.000Z"));
    expect(formatRelativeDate("2026-04-28T18:00:00.000Z")).toBe("hace 3 días");
  });
});
