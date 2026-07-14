import Link from "next/link";
import { Swords } from "lucide-react";

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
import type { CharacterSummary } from "@/lib/types";

/**
 * Tarjeta de un Character. Presentacional: no fetchea, recibe el dato por
 * prop. Misma vista que usa la home en "Tus personajes recientes" (DEV-56):
 * `name`, Playbook (hace de raza/clase), Game y, si corresponde, Campaign.
 */
export function CharacterCard({ character }: { character: CharacterSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-lg tracking-wide">
          <Swords className="text-primary size-4" aria-hidden />
          {character.name}
        </CardTitle>
        <CardDescription>{character.playbookName}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge variant="secondary">{character.gameName}</Badge>
        {character.campaignName ? (
          <Badge variant="outline">{character.campaignName}</Badge>
        ) : null}
      </CardContent>
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
