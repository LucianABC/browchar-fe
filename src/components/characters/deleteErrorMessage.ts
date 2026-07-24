import { ApiError } from "@/api/client";

/**
 * Mensaje de error para un `DELETE /characters/:id` fallido. Compartido entre
 * `CharacterDetail` y `CharacterCard` (DEV-52): ambos disparan el mismo
 * `useDeleteCharacter` y deben mostrar el mismo texto ante el mismo error.
 */
export function deleteErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Este personaje ya no existe o fue eliminado.";
  }
  return "No se pudo eliminar el personaje. Intentá de nuevo más tarde.";
}
