import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import type { CharacterView } from "@/types";
import { characterQueryKey } from "./useCharacter";

/** Payload de `PATCH /characters/:id` (DEV-68). */
export interface UpdateCharacterInput {
  name: string;
  values: Record<string, unknown>;
}

/**
 * Actualiza un personaje contra `PATCH /characters/:id` (DEV-68). El back
 * revalida `values` completo contra el template del Playbook (DEV-67), así
 * que el caller siempre manda el objeto entero, no un diff.
 *
 * Al resolver, escribe la respuesta directo en la cache de `useCharacter`
 * (`characterQueryKey`) — ya viene con el personaje actualizado completo, no
 * hace falta invalidar y esperar un refetch — e invalida el listado
 * (`useCharacters`) para que las tarjetas reflejen el nombre nuevo.
 */
export function useUpdateCharacter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCharacterInput) =>
      apiClient.patch<CharacterView>(`/characters/${id}`, input),
    onSuccess: (character) => {
      queryClient.setQueryData(characterQueryKey(id), character);
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}
