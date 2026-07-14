import Link from "next/link";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CharacterView } from "@/lib/types";

/**
 * Tarjeta de un Character. Presentacional: no fetchea, recibe el dato por
 * prop. El personaje no tiene `class`/`level`/`ancestry` (DEV-54): se muestra
 * `name` y un par de entradas de `values` tal cual vienen (clave: valor, sin
 * resolver contra el template del Playbook por ahora).
 */
export function CharacterCard({ character }: { character: CharacterView }) {
  const previewValues = Object.entries(character.values).slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-lg tracking-wide">
          <UserRound className="text-primary size-4" aria-hidden />
          {character.name}
        </CardTitle>
      </CardHeader>
      {previewValues.length > 0 ? (
        <CardContent className="text-muted-foreground flex flex-col gap-1 text-sm">
          {previewValues.map(([key, value]) => (
            <p key={key}>
              <span className="font-medium">{key}:</span> {String(value)}
            </p>
          ))}
        </CardContent>
      ) : null}
      <CardFooter>
        <Button
          className="w-full"
          variant="outline"
          nativeButton={false}
          render={<Link href={`/characters/${character.id}`} />}
        >
          Ver detalle
        </Button>
      </CardFooter>
    </Card>
  );
}
