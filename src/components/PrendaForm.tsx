"use client";

import { CATEGORIAS, CATEGORIA_CORTA, COLORES, ESTILOS, TEMPORADAS, etiqueta } from "@/lib/categories";
import type { DatosPrenda } from "@/lib/prendas";
import { Chips } from "./Chips";
import { IconoCategoria } from "./Iconos";

export const DATOS_VACIOS: DatosPrenda = {
  nombre: "",
  categoria: "parte de arriba",
  tipo: "",
  colores: [],
  temporadas: [],
  estilos: [],
};

const titulo = "text-sm text-muted";
const campo = "h-14 w-full rounded-[18px] bg-white px-4.5 text-lg shadow-suave outline-none focus:ring-2 focus:ring-cielo";

export function PrendaForm({ datos, onChange }: { datos: DatosPrenda; onChange: (d: DatosPrenda) => void }) {
  const set = <K extends keyof DatosPrenda>(k: K, v: DatosPrenda[K]) => onChange({ ...datos, [k]: v });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className={titulo}>Nombre</span>
          <input className={campo} value={datos.nombre} placeholder="Camisa de lino" onChange={(e) => set("nombre", e.target.value)} />
        </label>
        <label className="block space-y-2">
          <span className={titulo}>Tipo (opcional)</span>
          <input className={campo} value={datos.tipo} placeholder="vaqueros, blazer…" onChange={(e) => set("tipo", e.target.value)} />
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className={`${titulo} mb-2`}>Categoría</legend>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={datos.categoria === c}
              onClick={() => set("categoria", c)}
              className={`flex h-21 flex-col items-center justify-center gap-1.5 rounded-3xl text-[13px] shadow-suave ${
                datos.categoria === c ? "bg-cielo-suave" : "bg-white"
              }`}
            >
              <IconoCategoria categoria={c} />
              {CATEGORIA_CORTA[c]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className={`${titulo} mb-2`}>
          Color{datos.colores.length > 0 && <span className="text-foreground"> · {etiqueta(datos.colores.join(", "))}</span>}
        </legend>
        <div className="inline-flex flex-wrap gap-2.5 rounded-[28px] bg-white p-2 shadow-suave">
          {COLORES.map((c) => {
            const activo = datos.colores.includes(c.nombre);
            return (
              <button
                key={c.nombre}
                type="button"
                aria-label={etiqueta(c.nombre)}
                aria-pressed={activo}
                onClick={() => set("colores", activo ? datos.colores.filter((x) => x !== c.nombre) : [...datos.colores, c.nombre])}
                className={`size-11 rounded-full ${activo ? "border-[3px] border-moka" : "border border-line"}`}
                style={{ background: c.hex }}
              />
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className={`${titulo} mb-2`}>Temporada</legend>
        <Chips opciones={TEMPORADAS} seleccion={datos.temporadas} onChange={(v) => set("temporadas", v)} />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className={`${titulo} mb-2`}>Estilo</legend>
        <Chips opciones={ESTILOS} seleccion={datos.estilos} onChange={(v) => set("estilos", v)} />
      </fieldset>
    </div>
  );
}
