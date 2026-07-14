import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Utilidades de fecha centralizadas: un solo punto de contacto para
 * parsear/formatear las fechas ISO 8601 que devuelve la API, en vez de que
 * cada componente arme su propio `Intl.DateTimeFormat`/lógica de tiempo
 * relativo por separado.
 */
const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Fecha absoluta, ej. "15 ene 2026". */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** Fecha relativa a ahora, ej. "hace 3 días". */
export function formatRelativeDate(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
}
