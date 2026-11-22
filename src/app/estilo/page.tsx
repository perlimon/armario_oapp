"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BarraInferior } from "@/components/BarraInferior";
import { Cabecera } from "@/components/Cabecera";
import { Chips } from "@/components/Chips";
import { etiqueta, hexDeColor } from "@/lib/categories";
import { analizarLook, imagenPin } from "@/lib/colores";
import { borrarTablero, guardarTablero, listarTableros, type Pin, type Tablero } from "@/lib/prendas";

const ETIQUETAS = ["informal", "elegante", "trabajo", "fiesta", "primavera", "verano", "otoño", "invierno"] as const;

export default function MiEstilo() {
  const [tableros, setTableros] = useState<Tablero[]>();
  const [enlace, setEnlace] = useState("");
  const [etiquetas, setEtiquetas] = useState<(typeof ETIQUETAS)[number][]>([]);
  const [progreso, setProgreso] = useState<string>();
  const [error, setError] = useState<string>();

  const recargar = () => listarTableros().then(setTableros);
  useEffect(() => {
    recargar();
  }, []);

  async function cargar(url: string, etiquetasTablero: string[]) {
    setError(undefined);
    setProgreso("Leyendo el tablero…");
    try {
      const res = await fetch(`/api/tablero?url=${encodeURIComponent(url)}`);
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "No se pudo leer el tablero");

      const pins: Pin[] = [];
      for (const [i, pin] of (datos.pins as Pin[]).entries()) {
        setProgreso(`Analizando colores ${i + 1}/${datos.pins.length}…`);
        try {
          pins.push({ ...pin, ...(await analizarLook(imagenPin(pin.imagen))) });
        } catch {
          pins.push(pin);
        }
      }
      await guardarTablero({
        id: `${datos.usuario}/${datos.tablero}`,
        url: datos.url,
        titulo: datos.titulo,
        etiquetas: etiquetasTablero,
        pins,
        actualizado: new Date().toISOString(),
      });
      await recargar();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setProgreso(undefined);
    }
  }

  async function anadir(e: FormEvent) {
    e.preventDefault();
    if (await cargar(enlace, etiquetas)) {
      setEnlace("");
      setEtiquetas([]);
    }
  }

  // Paleta del conjunto de tableros: los colores que más se repiten en los looks.
  const votos = new Map<string, number>();
  for (const pin of tableros?.flatMap((t) => t.pins) ?? []) {
    for (const c of [pin.arriba, pin.abajo]) if (c) votos.set(c, (votos.get(c) ?? 0) + 1);
  }
  const total = [...votos.values()].reduce((a, b) => a + b, 0);
  const paleta = [...votos].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <main className="mx-auto max-w-4xl px-5 pb-36 pt-10 md:px-12">
      <Cabecera titulo="Mi estilo" subtitulo="Tus tableros de Pinterest como inspiración para los outfits." />

      <form onSubmit={anadir} className="mb-10 space-y-5 rounded-[34px] bg-white p-6 shadow-suave">
        <label className="block space-y-2">
          <span className="text-sm text-muted">Enlace de un tablero público</span>
          <input
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            required
            inputMode="url"
            placeholder="https://pin.it/… o https://www.pinterest.es/usuario/tablero"
            className="h-14 w-full rounded-[18px] bg-background px-4.5 outline-none focus:ring-2 focus:ring-cielo"
          />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm text-muted">¿Para qué es este tablero?</legend>
          <Chips opciones={ETIQUETAS} seleccion={etiquetas} onChange={setEtiquetas} />
        </fieldset>
        <button disabled={!!progreso} className="h-14 w-full rounded-full bg-moka font-medium text-white disabled:opacity-50">
          {progreso ?? "Añadir tablero"}
        </button>
        {error && <p className="rounded-2xl bg-warn px-4 py-3 text-sm">{error}</p>}
      </form>

      {paleta.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-medium">Tu paleta</h2>
          <div className="flex flex-wrap gap-4">
            {paleta.map(([color, n]) => (
              <div key={color} className="flex w-20 flex-col items-center gap-1.5 text-center">
                <span className="size-14 rounded-full border border-line shadow-suave" style={{ background: hexDeColor(color) }} />
                <span className="text-sm">{etiqueta(color)}</span>
                <span className="text-xs text-muted">{Math.round((n / total) * 100)} %</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {tableros?.length === 0 && <p className="text-center text-muted">Aún no has añadido ningún tablero.</p>}

      <div className="space-y-10">
        {tableros?.map((t) => (
          <section key={t.id}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-medium">{t.titulo}</h2>
                <p className="text-sm font-light text-muted">
                  {t.pins.length} pines{t.etiquetas.length > 0 && ` · ${t.etiquetas.map(etiqueta).join(", ")}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!!progreso}
                  onClick={() => cargar(t.url, t.etiquetas)}
                  className="h-11 rounded-full bg-white px-5 text-sm shadow-suave disabled:opacity-50"
                >
                  Actualizar
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`¿Quitar el tablero "${t.titulo}"?`)) return;
                    await borrarTablero(t.id);
                    recargar();
                  }}
                  className="h-11 rounded-full px-4 text-sm text-danger"
                >
                  Quitar
                </button>
              </div>
            </div>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {t.pins.map((p) => (
                <li key={p.id} className="relative overflow-hidden rounded-3xl bg-surface">
                  <a href={p.enlace} target="_blank" rel="noreferrer">
                    <img src={imagenPin(p.imagen)} alt={p.titulo} loading="lazy" className="aspect-[2/3] w-full object-cover" />
                  </a>
                  {p.arriba && p.abajo && (
                    <span className="absolute bottom-2 left-2 flex gap-1 rounded-full bg-white/85 p-1 backdrop-blur" title="Colores del look">
                      {[p.arriba, p.abajo].map((c, i) => (
                        <span key={i} className="size-4 rounded-full border border-line" style={{ background: hexDeColor(c) }} />
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <BarraInferior />
    </main>
  );
}
