import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CharacterDeleteRequestParams } from "@tpklabs/browchar-contracts";

import { apiClient } from "@/api/client";
import { characterQueryKey } from "@/hooks/useCharacter";

/**
 * Elimina un personaje contra `DELETE /characters/:id` (DEV-52/DEV-71). El
 * back hace borrado lógico (soft-delete) y responde `204 No Content`.
 *
 * Al resolver, saca el detalle de la cache (ya no existe — un refetch daría
 * 404) e invalida el listado (`useCharacters`) para que la tarjeta eliminada
 * desaparezca, mismo criterio que `useUpdateCharacter`.
 */
export function useDeleteCharacter(id: CharacterDeleteRequestParams["id"]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete<void>(`/characters/${id}`),
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: characterQueryKey(id),
        exact: true,
      });
      await queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}
