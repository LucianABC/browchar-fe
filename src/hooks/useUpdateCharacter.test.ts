import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import { characterQueryKey } from "./useCharacter";
import {
  useUpdateCharacter,
  type UpdateCharacterInput,
} from "./useUpdateCharacter";

function mockResponse(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  } as Response;
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const INPUT: UpdateCharacterInput = {
  name: "Aria",
  values: { concepto: "una vagabunda" },
};

const UPDATED_CHARACTER = {
  id: "char_1",
  name: "Aria",
  ownerId: "usr_demo",
  playbookId: "angel",
  playbookVersion: 1,
  values: { concepto: "una vagabunda" },
  createdAt: "2026-01-15T12:00:00.000Z",
  updatedAt: "2026-01-16T12:00:00.000Z",
  deletedAt: null,
};

describe("useUpdateCharacter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hace PATCH /characters/:id con el input y devuelve el personaje actualizado", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(200, UPDATED_CHARACTER));
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({ id: "char_1", name: "Aria" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/characters/char_1");
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify(INPUT));
  });

  it("escribe el personaje actualizado en la cache de useCharacter", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(200, UPDATED_CHARACTER));
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(characterQueryKey("char_1"))).toEqual(
      UPDATED_CHARACTER,
    );
  });

  it("invalida el listado de personajes al guardar", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(200, UPDATED_CHARACTER));
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["characters"] });
  });

  it("expone el ApiError cuando el back rechaza (ej. 400 de validación)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(400, {
        message: "Los datos del personaje no son válidos para el Playbook",
        errors: [{ field: "concepto", message: "concepto es requerido" }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      status: 400,
      message: "Los datos del personaje no son válidos para el Playbook",
    });
  });

  it("expone el ApiError cuando el personaje no existe (404)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        mockResponse(404, { message: "Character char_1 no encontrado" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 404 });
  });
});
