"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrendaForm } from "@/components/PrendaForm";
import { actualizarPrenda, borrarPrenda, obtenerPrenda, urlsDeImagenes, type DatosPrenda, type Prenda } from "@/lib/prendas";

export default function DetallePrenda({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [prenda, setPrenda] = useState<Prenda | null>();
  const [datos, setDatos] = useState<DatosPrenda>();
  const [url, setUrl] = useState<string>();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    obtenerPrenda(id)
      .then(async (p) => {
        setPrenda(p);
        if (!p) return;
        const { nombre, categoria, tipo, colores, temporadas, estilos } = p;
        setDatos({ nombre, categoria, tipo, colores, temporadas, estilos });
        setUrl((await urlsDeImagenes([p.imagen_path]))[p.imagen_path]);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function ejecutar(accion: () => Promise<void>) {
    setOcupado(true);
    setError(undefined);
    try {
      await accion();
      router.push("/");
    } catch (e) {
      setError((e as Error).message);
      setOcupado(false);
    }
  }

  const guardar = () => datos && ejecutar(() => actualizarPrenda(id, datos));
  const borrar = () => prenda && confirm("¿Borrar esta prenda del armario?") && ejecutar(() => borrarPrenda(prenda));

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
        <button onClick={borrar} disabled={!prenda || ocupado} className="text-sm text-danger disabled:opacity-40">
          Borrar
        </button>
      </header>

      <div className="mb-6 aspect-square overflow-hidden rounded-2xl bg-surface">
        {url && <img src={url} alt={prenda?.nombre} className="h-full w-full object-contain p-4" />}
      </div>

      {error && <p className="mb-4 rounded-xl bg-warn px-3 py-2 text-sm">{error}</p>}

      {datos && (
        <>
          <PrendaForm datos={datos} onChange={setDatos} />
          <button
            onClick={guardar}
            disabled={ocupado}
            className="mt-8 w-full rounded-2xl bg-foreground py-3.5 font-medium text-background disabled:opacity-40"
          >
            Guardar cambios
          </button>
        </>
      )}
    </main>
  );
}
