"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Swords, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteCharacter } from "@/hooks/useDeleteCharacter";
import type { CharacterSummary } from "@/types";
import { formatDate, formatRelativeDate } from "@/utils/dates";
import { deleteErrorMessage } from "./deleteErrorMessage";

/**
 * Tarjeta de un Character. Misma vista que usa la home en "Tus personajes
 * recientes" (DEV-56): chips de Game/Campaign arriba, `name`, Playbook (hace
 * de raza/clase), fecha de creación (absoluta) y de última edición (relativa
 * a ahora, con la fecha absoluta en el `title` para quien la necesite exacta).
 *
 * No hay botón de editar separado: la edición vive inline en la pantalla de
 * detalle (DEV-51, `CharacterDetail`), detrás de su propio botón "Editar" —
 * no hay una ruta `/characters/:id/edit` distinta.
 *
 * "Eliminar" pide confirmación y llama a `useDeleteCharacter` (DEV-52), el
 * mismo hook que usa el detalle: pega a `DELETE /characters/:id` de verdad.
 * Al confirmar con éxito, la card se oculta localmente al toque — no hace
 * falta esperar el refetch del listado, que igual se invalida en segundo
 * plano vía el hook, así una recarga posterior no la vuelve a mostrar. Si
 * falla, se muestra el error inline y la card sigue visible.
 */
export function CharacterCard({ character }: { character: CharacterSummary }) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteCharacter = useDeleteCharacter(character.id);

  if (isDeleted) return null;

  const handleDelete = async () => {
    if (deleteCharacter.isPending) return;
    if (!window.confirm(`¿Eliminar a ${character.name}?`)) return;

    setDeleteError(null);
    try {
      await deleteCharacter.mutateAsync();
      setIsDeleted(true);
    } catch (error) {
      setDeleteError(deleteErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{character.gameName}</Badge>
          {character.campaignName ? (
            <Badge variant="outline">{character.campaignName}</Badge>
          ) : null}
        </div>
        <CardTitle className="font-heading flex items-center gap-2 text-lg tracking-wide">
          <Swords className="text-primary size-4" aria-hidden />
          {character.name}
        </CardTitle>
        <CardDescription>{character.playbookName}</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground flex flex-col gap-1 text-xs">
        <p>Creado el {formatDate(character.createdAt)}</p>
        <p title={formatDate(character.updatedAt)}>
          Última edición {formatRelativeDate(character.updatedAt)}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/characters/${character.id}`} />}
          >
            Ver detalle
          </Button>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Eliminar personaje"
            onClick={handleDelete}
            disabled={deleteCharacter.isPending}
          >
            {deleteCharacter.isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Trash2 aria-hidden />
            )}
          </Button>
        </div>
        {deleteError ? (
          <p role="alert" className="text-destructive text-xs">
            {deleteError}
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}
