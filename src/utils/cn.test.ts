import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("une clases y descarta valores falsy", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("resuelve conflictos de Tailwind quedándose con la última clase", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
