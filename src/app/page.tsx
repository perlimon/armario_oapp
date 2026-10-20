"use client";

import Link from "next/link";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CATEGORIAS, etiqueta, type Categoria } from "@/lib/categories";
import { db, type Prenda } from "@/lib/db";
import { useBlobUrl } from "@/lib/useBlobUrl";

export default function Armario() {
  const [filtro, setFiltro] = useState<Categoria | null>(null);
  const prendas = useLiveQuery(() => db.prendas.orderBy("creadaEn").reverse().toArray(), []);
  const visibles = prendas?.filter((p) => !filtro || p.categoria === filtro);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
      <header className="mb-5">
        <h1 className="text-3xl font-semibold tracking-tight">Mi armario</h1>
        {prendas && (
          <p className="text-muted">
            {prendas.length} {prendas.length === 1 ? "prenda" : "prendas"}
          </p>
        )}
      </header>

      {!!prendas?.length && (
        <nav className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
          {[null, ...CATEGORIAS].map((c) => (
            <button
              key={c ? etiqueta(c) : "Todas"}
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

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visibles?.map((p) => <Tarjeta key={p.id} prenda={p} />)}
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

function Tarjeta({ prenda }: { prenda: Prenda }) {
  const url = useBlobUrl(prenda.imagen);
  return (
    <li>
      <Link href={`/prenda/${prenda.id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-surface">
          {url && <img src={url} alt={prenda.nombre} className="h-full w-full object-contain p-2" />}
        </div>
        <p className="mt-1.5 truncate text-sm font-medium">{prenda.nombre || prenda.tipo}</p>
        <p className="truncate text-xs text-muted">{etiqueta(prenda.colores.join(", "))}</p>
      </Link>
    </li>
  );
}
