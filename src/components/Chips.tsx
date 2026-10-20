"use client";

import { etiqueta } from "@/lib/categories";

export function Chips<T extends string>({
  opciones,
  seleccion,
  onChange,
}: {
  opciones: readonly T[];
  seleccion: T[];
  onChange: (valor: T[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activo = seleccion.includes(o);
        return (
          <button
            key={etiqueta(o)}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(activo ? seleccion.filter((s) => s !== o) : [...seleccion, o])}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              activo
                ? "border-foreground bg-foreground text-background"
                : "border-line text-muted hover:border-foreground"
            }`}
          >
            {etiqueta(o)}
          </button>
        );
      })}
    </div>
  );
}
