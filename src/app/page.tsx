"use client";

import { useEffect, useState } from "react";
import { BarraInferior } from "@/components/BarraInferior";
import { IconoBuscar, IconoCategoria, IconoCerrar } from "@/components/Iconos";
import { Menu } from "@/components/Menu";
import { TarjetaPrenda } from "@/components/TarjetaPrenda";
import { CATEGORIAS, CATEGORIA_CORTA, etiqueta, type Categoria } from "@/lib/categories";
import { useFondo } from "@/lib/fondo";
import { listarPrendas, urlsDeImagenes, type Prenda } from "@/lib/prendas";

type Vista = "estantes" | "cuadricula";

const botonCristal = "flex size-13 items-center justify-center rounded-[18px] bg-white/70 text-foreground backdrop-blur";

export default function Armario() {
  const { fondo } = useFondo();
  const [prendas, setPrendas] = useState<Prenda[]>();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [filtro, setFiltro] = useState<Categoria | null>(null);
  const [vista, setVista] = useState<Vista>("estantes");
  const [buscando, setBuscando] = useState(false);
  const [texto, setTexto] = useState("");
  const [menu, setMenu] = useState(false);

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
    <main className="mx-auto max-w-5xl pb-36">
      <section className="relative flex min-h-[min(62dvh,640px)] flex-col justify-between overflow-hidden rounded-b-[44px] md:mx-4 md:mt-4 md:rounded-[44px]">
        <img src={fondo.src} alt="" className="absolute inset-0 h-full w-full object-cover" />

        <div className="relative flex justify-between px-5 pt-10 md:px-8 md:pt-8">
          <button onClick={() => setMenu(true)} aria-label="Abrir menú" className={`${botonCristal} flex-col gap-1.5`}>
            <span className="block h-0.5 w-6 rounded-full bg-cielo" />
            <span className="block h-0.5 w-6 rounded-full bg-moka" />
          </button>
          <button
            onClick={() => {
              setBuscando(!buscando);
              setTexto("");
            }}
            aria-label={buscando ? "Cerrar búsqueda" : "Buscar"}
            className={botonCristal}
          >
            {buscando ? <IconoCerrar /> : <IconoBuscar />}
          </button>
        </div>

        <div className="relative m-3 rounded-[36px] bg-moka/60 p-6 text-white backdrop-blur-xl md:m-5 md:p-8">
          <h1 className="text-[38px] font-medium leading-tight tracking-tight">Mi armario</h1>
          <div className="mt-2.5 mb-2 h-[3px] w-11 rounded-full bg-cielo" />
          <p className="font-light text-[#f7f2ec]">
            {prendas ? `${prendas.length} ${prendas.length === 1 ? "prenda guardada" : "prendas guardadas"}` : " "}
          </p>

          {buscando && (
            <input
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por nombre, tipo o color"
              className="mt-5 h-13 w-full rounded-full bg-white/90 px-6 text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-cielo"
            />
          )}

          <div className="mt-5 border-t border-white/25 pt-5">
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  aria-pressed={filtro === c}
                  onClick={() => setFiltro(filtro === c ? null : c)}
                  className={`flex h-[104px] w-[76px] shrink-0 flex-col items-center gap-2 rounded-full pt-2.5 text-xs transition ${
                    filtro === c ? "bg-white/40" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`flex size-13 items-center justify-center rounded-full text-foreground ${filtro === c ? "bg-cielo" : "bg-white"}`}
                  >
                    <IconoCategoria categoria={c} />
                  </span>
                  {CATEGORIA_CORTA[c]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error && <p className="mx-5 mt-6 rounded-2xl bg-warn px-4 py-3 text-sm md:mx-12">No se pudo cargar el armario: {error}</p>}
      {!prendas && !error && <p className="py-10 text-center text-muted">Cargando…</p>}

      {prendas && prendas.length === 0 && (
        <div className="mx-5 mt-8 rounded-[34px] bg-white p-10 text-center shadow-suave md:mx-12">
          <p className="mb-1 text-lg font-medium">Tu armario está vacío</p>
          <p className="text-muted">Pulsa + para hacer una foto a tu primera prenda.</p>
        </div>
      )}

      {!!prendas?.length && (
        <>
          <div className="mt-8 mb-6 flex items-center justify-between gap-3 px-5 md:px-12">
            <h2 className="text-lg font-medium sm:text-xl">{filtro ? etiqueta(filtro) : "Todas las prendas"}</h2>
            <div className="flex rounded-full bg-[#f4f1ec] p-1">
              {(["estantes", "cuadricula"] as const).map((v) => (
                <button
                  key={v}
                  aria-pressed={vista === v}
                  onClick={() => setVista(v)}
                  className={`h-10 rounded-full px-4 text-sm sm:px-5 ${vista === v ? "bg-white shadow-suave" : "text-muted"}`}
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
                  <h3 className="mb-3.5 px-5 text-lg md:px-12">
                    {etiqueta(e.categoria)} <span className="font-light text-muted">· {e.prendas.length}</span>
                  </h3>
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
      <Menu abierto={menu} onCerrar={() => setMenu(false)} prendas={prendas?.length} />
    </main>
  );
}
