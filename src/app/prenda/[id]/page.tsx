"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconoAtras, IconoCerrar, IconoEditar } from "@/components/Iconos";
import { PrendaForm } from "@/components/PrendaForm";
import { etiqueta, hexDeColor } from "@/lib/categories";
import { actualizarPrenda, borrarPrenda, obtenerPrenda, urlsDeImagenes, type DatosPrenda, type Prenda } from "@/lib/prendas";

const botonCristal = "flex size-13 items-center justify-center rounded-[18px] bg-white/70 backdrop-blur";

export default function DetallePrenda({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [prenda, setPrenda] = useState<Prenda | null>();
  const [datos, setDatos] = useState<DatosPrenda>();
  const [url, setUrl] = useState<string>();
  const [editando, setEditando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    obtenerPrenda(id)
      .then(async (p) => {
        setPrenda(p);
        if (!p) return;
        setDatos(datosDe(p));
        setUrl((await urlsDeImagenes([p.imagen_path]))[p.imagen_path]);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function guardar() {
    if (!datos || !prenda) return;
    setOcupado(true);
    setError(undefined);
    try {
      await actualizarPrenda(id, datos);
      setPrenda({ ...prenda, ...datos });
      setEditando(false);
    } catch (e) {
      setError((e as Error).message);
    }
    setOcupado(false);
  }

  async function borrar() {
    if (!prenda || !confirm("¿Quitar esta prenda del armario?")) return;
    setOcupado(true);
    try {
      await borrarPrenda(prenda);
      router.push("/");
    } catch (e) {
      setError((e as Error).message);
      setOcupado(false);
    }
  }

  if (prenda === null) {
    return (
      <main className="mx-auto max-w-lg px-5 pt-16 text-center">
        <p className="mb-4">Esta prenda ya no existe.</p>
        <Link href="/" className="underline underline-offset-4">
          Volver al armario
        </Link>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh bg-surface pt-[52dvh]">
      <div className="absolute inset-x-0 top-0 flex h-[58dvh] items-center justify-center p-10 pt-24">
        {url && <img src={url} alt={prenda?.nombre} className="h-full w-full object-contain" />}
      </div>

      <div className="absolute inset-x-5 top-10 z-10 flex justify-between md:inset-x-12">
        <Link href="/" aria-label="Volver al armario" className={botonCristal}>
          <IconoAtras />
        </Link>
        {prenda && (
          <button
            onClick={() => {
              setDatos(datosDe(prenda));
              setEditando(!editando);
            }}
            aria-label={editando ? "Cancelar edición" : "Editar"}
            className={botonCristal}
          >
            {editando ? <IconoCerrar /> : <IconoEditar />}
          </button>
        )}
      </div>

      {prenda && datos && (
        <section
          className={`relative min-h-[48dvh] rounded-t-[44px] px-6 pt-10 pb-12 md:px-12 ${
            editando ? "bg-background" : "bg-moka/95 text-white"
          }`}
        >
          {editando ? (
            <div className="mx-auto max-w-3xl">
              <PrendaForm datos={datos} onChange={setDatos} />
              {error && <p className="mt-4 rounded-2xl bg-warn px-4 py-3 text-sm">{error}</p>}
              <button
                onClick={guardar}
                disabled={ocupado}
                className="mt-8 h-15 w-full rounded-full bg-moka font-medium text-white disabled:opacity-40"
              >
                Guardar cambios
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <p className="text-sm tracking-wide text-[#f1e9e1]">
                {etiqueta(prenda.categoria)}
                {prenda.tipo && ` · ${prenda.tipo}`}
              </p>
              <h1 className="mt-2 text-[38px] font-medium leading-tight">{prenda.nombre || etiqueta(prenda.tipo || prenda.categoria)}</h1>
              <div className="mt-3 h-[3px] w-11 rounded-full bg-cielo" />

              <div className="mt-7 border-t border-white/25 pt-6">
                <p className="mb-4 text-lg">Detalles</p>
                <div className="flex flex-wrap gap-3.5">
                  <Ficha titulo="Color" valor={prenda.colores.map(etiqueta).join(", ") || "—"} muestra={hexDeColor(prenda.colores[0] ?? "")} />
                  <Ficha titulo="Temporada" valor={prenda.temporadas.map(etiqueta).join(", ") || "—"} muestra="#a9c7e3" />
                  <Ficha titulo="Estilo" valor={prenda.estilos.map(etiqueta).join(", ") || "—"} muestra="#d8c3a5" />
                </div>
              </div>

              {error && <p className="mt-4 rounded-2xl bg-warn px-4 py-3 text-sm text-foreground">{error}</p>}
              <button
                onClick={borrar}
                disabled={ocupado}
                className="mx-auto mt-10 block h-11 px-5 text-sm text-[#f7f2ec] underline underline-offset-4 disabled:opacity-40"
              >
                Quitar del armario
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function Ficha({ titulo, valor, muestra }: { titulo: string; valor: string; muestra: string }) {
  return (
    <div className="flex w-[132px] flex-col items-center gap-2 rounded-full bg-white/16 px-3 pt-3 pb-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-white">
        <span className="size-6 rounded-full border border-line" style={{ background: muestra }} />
      </span>
      <span className="text-sm font-medium">{titulo}</span>
      <span className="text-xs leading-snug text-[#f1e9e1]">{valor}</span>
    </div>
  );
}

function datosDe({ nombre, categoria, tipo, colores, temporadas, estilos }: Prenda): DatosPrenda {
  return { nombre, categoria, tipo, colores, temporadas, estilos };
}
