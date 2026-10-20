"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { PrendaForm, type DatosPrenda } from "@/components/PrendaForm";
import { db } from "@/lib/db";
import { useBlobUrl } from "@/lib/useBlobUrl";

export default function DetallePrenda({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const prenda = useLiveQuery(async () => (await db.prendas.get(id)) ?? null, [id]);
  const [datos, setDatos] = useState<DatosPrenda>();
  const url = useBlobUrl(prenda?.imagen);

  useEffect(() => {
    if (prenda && !datos) {
      const { nombre, categoria, tipo, colores, temporadas, estilos } = prenda;
      setDatos({ nombre, categoria, tipo, colores, temporadas, estilos });
    }
  }, [prenda, datos]);

  async function guardar() {
    if (!datos) return;
    await db.prendas.update(id, datos);
    router.push("/");
  }

  async function borrar() {
    if (!confirm("¿Borrar esta prenda del armario?")) return;
    await db.prendas.delete(id);
    router.push("/");
  }

  if (prenda === null) {
    return (
      <main className="mx-auto max-w-lg px-4 pt-10 text-center">
        <p className="mb-4">Esta prenda ya no existe.</p>
        <Link href="/" className="underline">
          Volver al armario
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 pb-10 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-muted">
          ← Armario
        </Link>
        <button onClick={borrar} className="text-sm text-danger">
          Borrar
        </button>
      </header>

      <div className="mb-6 aspect-square overflow-hidden rounded-2xl bg-surface">
        {url && <img src={url} alt={prenda?.nombre} className="h-full w-full object-contain p-4" />}
      </div>

      {datos && (
        <>
          <PrendaForm datos={datos} onChange={setDatos} />
          <button onClick={guardar} className="mt-8 w-full rounded-2xl bg-foreground py-3.5 font-medium text-background">
            Guardar cambios
          </button>
        </>
      )}
    </main>
  );
}
