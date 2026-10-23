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
    <div className="flex flex-wrap gap-2.5">
      {opciones.map((o) => {
        const activo = seleccion.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(activo ? seleccion.filter((s) => s !== o) : [...seleccion, o])}
            className={`h-11.5 rounded-full px-5 text-[15px] shadow-suave transition ${activo ? "bg-cielo-suave" : "bg-white"}`}
          >
            {etiqueta(o)}
          </button>
        );
      })}
    </div>
  );
}
