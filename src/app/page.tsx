"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIAS, etiqueta, type Categoria } from "@/lib/categories";
import { listarPrendas, urlsDeImagenes, type Prenda } from "@/lib/prendas";

export default function Armario() {
  const [filtro, setFiltro] = useState<Categoria | null>(null);
  const [prendas, setPrendas] = useState<Prenda[]>();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();

  useEffect(() => {
    listarPrendas()
      .then(async (lista) => {
        setPrendas(lista);
        setUrls(await urlsDeImagenes(lista.map((p) => p.imagen_path)));
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const visibles = prendas?.filter((p) => !filtro || p.categoria === filtro);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:px-8">
      <header className="mb-5">
        <h1 className="text-3xl font-semibold tracking-tight">Mi armario</h1>
        {prendas && (
          <p className="text-muted">
            {prendas.length} {prendas.length === 1 ? "prenda" : "prendas"}
          </p>
        )}
      </header>

      {error && <p className="mb-4 rounded-xl bg-warn px-3 py-2 text-sm">No se pudo cargar el armario: {error}</p>}
      {!prendas && !error && <p className="py-10 text-center text-muted">Cargando…</p>}

      {!!prendas?.length && (
        <nav className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
          {[null, ...CATEGORIAS].map((c) => (
            <button
              key={c ?? "todas"}
              onClick={() => setFiltro(c)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${
                filtro === c ? "border-foreground bg-foreground text-background" : "border-line text-muted"
              }`}
            >
              {c ? etiqueta(c) : "Todas"}
            </button>
          ))}
        </nav>
      )}

      {prendas && prendas.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="mb-1 font-medium">Tu armario está vacío</p>
          <p className="text-sm text-muted">Haz una foto a tu primera prenda para empezar.</p>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visibles?.map((p) => (
          <li key={p.id}>
            <Link href={`/prenda/${p.id}`} className="block">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-surface">
                {urls[p.imagen_path] && (
                  <img src={urls[p.imagen_path]} alt={p.nombre} loading="lazy" className="h-full w-full object-contain p-2" />
                )}
              </div>
              <p className="mt-1.5 truncate text-sm font-medium">{p.nombre || p.tipo || etiqueta(p.categoria)}</p>
              <p className="truncate text-xs text-muted">{etiqueta(p.colores.join(", "))}</p>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/nueva"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-6 py-3.5 font-medium text-background shadow-lg"
      >
        + Añadir prenda
      </Link>
    </main>
  );
}
