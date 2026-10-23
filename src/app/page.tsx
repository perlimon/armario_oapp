"use client";

import { useEffect, useState } from "react";
import { BarraInferior } from "@/components/BarraInferior";
import { IconoBuscar, IconoCategoria, IconoCerrar } from "@/components/Iconos";
import { TarjetaPrenda } from "@/components/TarjetaPrenda";
import { CATEGORIAS, etiqueta, type Categoria } from "@/lib/categories";
import { listarPrendas, urlsDeImagenes, type Prenda } from "@/lib/prendas";

type Vista = "estantes" | "cuadricula";

export default function Armario() {
  const [prendas, setPrendas] = useState<Prenda[]>();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [filtro, setFiltro] = useState<Categoria | null>(null);
  const [vista, setVista] = useState<Vista>("estantes");
  const [buscando, setBuscando] = useState(false);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    listarPrendas()
      .then(async (lista) => {
        setPrendas(lista);
        setUrls(await urlsDeImagenes(lista.map((p) => p.imagen_path)));
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const busqueda = texto.trim().toLowerCase();
  const visibles = prendas?.filter(
    (p) =>
      (!filtro || p.categoria === filtro) &&
      (!busqueda || [p.nombre, p.tipo, ...p.colores].some((t) => t.toLowerCase().includes(busqueda))),
  );
  const estantes = CATEGORIAS.map((c) => ({ categoria: c, prendas: visibles?.filter((p) => p.categoria === c) ?? [] })).filter(
    (e) => e.prendas.length > 0,
  );

  return (
    <main className="mx-auto max-w-5xl pb-36 pt-12">
      <header className="mb-7 flex items-start justify-between px-5 md:px-12">
        <div>
          <h1 className="text-[40px] font-medium leading-tight tracking-tight">Mi armario</h1>
          <div className="mt-2.5 mb-2 h-[3px] w-11 rounded-full bg-cielo" />
          {prendas && (
            <p className="font-light text-muted">
              {prendas.length} {prendas.length === 1 ? "prenda guardada" : "prendas guardadas"}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setBuscando(!buscando);
            setTexto("");
          }}
          aria-label={buscando ? "Cerrar búsqueda" : "Buscar"}
          className="flex size-12 items-center justify-center rounded-full bg-white shadow-suave"
        >
          {buscando ? <IconoCerrar /> : <IconoBuscar />}
        </button>
      </header>

      {buscando && (
        <div className="mb-6 px-5 md:px-12">
          <input
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por nombre, tipo o color"
            className="h-14 w-full rounded-full bg-white px-6 shadow-suave outline-none focus:ring-2 focus:ring-cielo"
          />
        </div>
      )}

      {error && <p className="mx-5 mb-4 rounded-2xl bg-warn px-4 py-3 text-sm md:mx-12">No se pudo cargar el armario: {error}</p>}
      {!prendas && !error && <p className="py-10 text-center text-muted">Cargando…</p>}

      {prendas && prendas.length === 0 && (
        <div className="mx-5 rounded-[34px] bg-white p-10 text-center shadow-suave md:mx-12">
          <p className="mb-1 text-lg font-medium">Tu armario está vacío</p>
          <p className="text-muted">Pulsa + para hacer una foto a tu primera prenda.</p>
        </div>
      )}

      {!!prendas?.length && (
        <>
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4 px-5 md:px-12">
            <div className="flex max-w-full gap-2.5 overflow-x-auto rounded-full bg-white p-2 shadow-suave">
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  aria-label={etiqueta(c)}
                  aria-pressed={filtro === c}
                  onClick={() => setFiltro(filtro === c ? null : c)}
                  className={`flex size-13 shrink-0 items-center justify-center rounded-full ${filtro === c ? "bg-cielo-suave" : "bg-[#f4f1ec]"}`}
                >
                  <IconoCategoria categoria={c} />
                </button>
              ))}
            </div>
            <div className="flex rounded-full bg-[#f4f1ec] p-1">
              {(["estantes", "cuadricula"] as const).map((v) => (
                <button
                  key={v}
                  aria-pressed={vista === v}
                  onClick={() => setVista(v)}
                  className={`h-10 rounded-full px-5 text-sm ${vista === v ? "bg-white shadow-suave" : "text-muted"}`}
                >
                  {v === "estantes" ? "Estantes" : "Cuadrícula"}
                </button>
              ))}
            </div>
          </div>

          {visibles?.length === 0 && <p className="px-5 py-8 text-center text-muted md:px-12">No hay prendas que coincidan.</p>}

          {vista === "estantes" ? (
            <div className="space-y-8">
              {estantes.map((e) => (
                <section key={e.categoria}>
                  <h2 className="mb-3.5 px-5 text-xl font-medium md:px-12">
                    {etiqueta(e.categoria)} <span className="font-light text-muted">· {e.prendas.length}</span>
                  </h2>
                  <ul className="flex gap-4 overflow-x-auto px-5 pb-2 md:px-12">
                    {e.prendas.map((p) => (
                      <li key={p.id} className="w-[150px] shrink-0 md:w-[170px]">
                        <TarjetaPrenda prenda={p} url={urls[p.imagen_path]} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 px-5 sm:grid-cols-3 md:grid-cols-4 md:px-12 lg:grid-cols-5">
              {visibles?.map((p) => (
                <li key={p.id}>
                  <TarjetaPrenda prenda={p} url={urls[p.imagen_path]} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <BarraInferior />
    </main>
  );
}
