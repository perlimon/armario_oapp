"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BarraInferior } from "@/components/BarraInferior";
import { Cabecera } from "@/components/Cabecera";
import { imagenPin } from "@/lib/colores";
import { generarOutfits, textoEncaje, type Propuesta } from "@/lib/outfits";
import {
  borrarOutfit,
  guardarOutfit,
  listarOutfits,
  listarPrendas,
  listarTableros,
  urlsDeImagenes,
  type Outfit,
  type Pin,
  type Prenda,
  type Tablero,
} from "@/lib/prendas";

export default function Outfits() {
  const [prendas, setPrendas] = useState<Prenda[]>();
  const [tableros, setTableros] = useState<Tablero[]>([]);
  const [guardados, setGuardados] = useState<Outfit[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [filtro, setFiltro] = useState<string | null>(null);
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);

  useEffect(() => {
    Promise.all([listarPrendas(), listarTableros(), listarOutfits()]).then(async ([p, t, o]) => {
      setPrendas(p);
      setTableros(t);
      setGuardados(o);
      setUrls(await urlsDeImagenes(p.map((x) => x.imagen_path)));
    });
  }, []);

  const elegidos = filtro ? tableros.filter((t) => t.id === filtro) : tableros;
  const generar = useCallback(() => prendas && setPropuestas(generarOutfits(prendas, elegidos)), [prendas, elegidos]);
  useEffect(() => {
    if (prendas && tableros.length) generar();
    // Se regenera al cambiar de tablero, no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prendas, tableros, filtro]);

  const porId = new Map(prendas?.map((p) => [p.id, p]));
  const pinPorId = new Map(tableros.flatMap((t) => t.pins.map((p) => [p.id, p] as const)));
  const guardado = (clave: string) => guardados.find((o) => [...o.prendas].sort().join("+") === clave);

  async function alternarGuardado(p: Propuesta) {
    const ya = guardado(p.clave);
    if (ya) {
      await borrarOutfit(ya.id);
      setGuardados(guardados.filter((o) => o.id !== ya.id));
    } else {
      const nuevo = await guardarOutfit({ prendas: p.prendas.map((x) => x.id), pinId: p.pin?.id, tableroId: p.tablero?.id });
      setGuardados([nuevo, ...guardados]);
    }
  }

  const sinTableros = tableros.length === 0;
  const faltanPrendas = prendas && !(prendas.some((p) => p.categoria === "cuerpo entero") || (prendas.some((p) => p.categoria === "parte de arriba") && prendas.some((p) => p.categoria === "parte de abajo")));

  return (
    <main className="mx-auto max-w-5xl px-5 pb-36 pt-10 md:px-12">
      <Cabecera titulo="Outfits" subtitulo="Combinaciones con tu ropa, inspiradas en tus tableros." />

      {prendas && sinTableros && (
        <Aviso>
          Primero añade un tablero de Pinterest en{" "}
          <Link href="/estilo" className="underline underline-offset-4">
            Mi estilo
          </Link>
          .
        </Aviso>
      )}
      {faltanPrendas && <Aviso>Para generar outfits necesitas al menos una prenda de arriba y una de abajo (o un vestido).</Aviso>}

      {!sinTableros && !faltanPrendas && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2.5">
              {[null, ...tableros.map((t) => t.id)].map((id) => (
                <button
                  key={id ?? "todos"}
                  aria-pressed={filtro === id}
                  onClick={() => setFiltro(id)}
                  className={`h-11 rounded-full px-5 text-[15px] shadow-suave ${filtro === id ? "bg-cielo-suave" : "bg-white"}`}
                >
                  {id ? tableros.find((t) => t.id === id)?.titulo : "Todos los tableros"}
                </button>
              ))}
            </div>
            <button onClick={generar} className="h-12 rounded-full bg-moka px-6 font-medium text-white">
              Otras combinaciones
            </button>
          </div>

          {propuestas.length === 0 && <Aviso>Ningún pin tiene colores analizados todavía. Pulsa «Actualizar» en Mi estilo.</Aviso>}

          <ul className="grid gap-5 md:grid-cols-2">
            {propuestas.map((p) => (
              <li key={p.clave}>
                <TarjetaOutfit
                  prendas={p.prendas}
                  urls={urls}
                  pin={p.pin}
                  pie={`${textoEncaje(p.encaje)} · ${p.tablero?.titulo ?? ""}`}
                  guardado={!!guardado(p.clave)}
                  onGuardar={() => alternarGuardado(p)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {guardados.length > 0 && prendas && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-medium">Guardados · {guardados.length}</h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {guardados.map((o) => {
              const lista = o.prendas.map((id) => porId.get(id)).filter((x): x is Prenda => !!x);
              if (!lista.length) return null;
              return (
                <li key={o.id}>
                  <TarjetaOutfit
                    prendas={lista}
                    urls={urls}
                    pin={o.pinId ? pinPorId.get(o.pinId) : undefined}
                    pie={new Date(o.creado).toLocaleDateString("es", { day: "numeric", month: "long" })}
                    guardado
                    onGuardar={async () => {
                      await borrarOutfit(o.id);
                      setGuardados(guardados.filter((x) => x.id !== o.id));
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <BarraInferior />
    </main>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="mb-6 rounded-[28px] bg-white p-6 text-center shadow-suave">{children}</p>;
}

function TarjetaOutfit({
  prendas,
  urls,
  pin,
  pie,
  guardado,
  onGuardar,
}: {
  prendas: Prenda[];
  urls: Record<string, string>;
  pin?: Pin;
  pie: string;
  guardado: boolean;
  onGuardar: () => void;
}) {
  return (
    <article className="flex gap-4 rounded-[34px] bg-white p-4 shadow-suave">
      {pin && (
        <a href={pin.enlace} target="_blank" rel="noreferrer" className="w-[38%] shrink-0" aria-label="Ver el pin en Pinterest">
          <img src={imagenPin(pin.imagen)} alt="" className="aspect-[2/3] w-full rounded-3xl object-cover" />
        </a>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="grid flex-1 grid-cols-2 gap-2.5">
          {prendas.map((p) => (
            <Link key={p.id} href={`/prenda/${p.id}`} className="block">
              <div className="aspect-square overflow-hidden rounded-[20px] bg-surface">
                {urls[p.imagen_path] && <img src={urls[p.imagen_path]} alt="" className="h-full w-full object-contain p-2" />}
              </div>
              <p className="mt-1 truncate text-xs">{p.nombre || p.tipo}</p>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted">{pie}</p>
          <button
            onClick={onGuardar}
            aria-pressed={guardado}
            className={`h-10 shrink-0 rounded-full px-4 text-sm ${guardado ? "bg-cielo-suave" : "bg-background"}`}
          >
            {guardado ? "Guardado" : "Guardar"}
          </button>
        </div>
      </div>
    </article>
  );
}
