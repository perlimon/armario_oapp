"use client";

import { CATEGORIAS, ESTILOS, TEMPORADAS, etiqueta } from "@/lib/categories";
import type { DatosPrenda } from "@/lib/prendas";
import { Chips } from "./Chips";

export const DATOS_VACIOS: DatosPrenda = {
  nombre: "",
  categoria: "parte de arriba",
  tipo: "",
  colores: [],
  temporadas: [],
  estilos: [],
};

const campo = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 outline-none focus:border-foreground";

export function PrendaForm({ datos, onChange }: { datos: DatosPrenda; onChange: (d: DatosPrenda) => void }) {
  const set = <K extends keyof DatosPrenda>(k: K, v: DatosPrenda[K]) => onChange({ ...datos, [k]: v });

  return (
    <div className="space-y-5">
      <label className="block space-y-1.5">
        <span className="text-sm text-muted">Nombre</span>
        <input className={campo} value={datos.nombre} onChange={(e) => set("nombre", e.target.value)} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Categoría</span>
          <select
            className={campo}
            value={datos.categoria}
            onChange={(e) => set("categoria", e.target.value as DatosPrenda["categoria"])}
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {etiqueta(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Tipo</span>
          <input className={campo} value={datos.tipo} placeholder="vaqueros, blazer…" onChange={(e) => set("tipo", e.target.value)} />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm text-muted">Colores (separados por comas)</span>
        <input
          className={campo}
          defaultValue={datos.colores.join(", ")}
          key={datos.colores.join(",")}
          onBlur={(e) =>
            set(
              "colores",
              e.target.value
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean),
            )
          }
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm text-muted">Temporada</span>
        <Chips opciones={TEMPORADAS} seleccion={datos.temporadas} onChange={(v) => set("temporadas", v)} />
      </div>

      <div className="space-y-2">
        <span className="text-sm text-muted">Estilo</span>
        <Chips opciones={ESTILOS} seleccion={datos.estilos} onChange={(v) => set("estilos", v)} />
      </div>
    </div>
  );
}
