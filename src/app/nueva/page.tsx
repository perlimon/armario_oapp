"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IconoAtras } from "@/components/Iconos";
import { DATOS_VACIOS, PrendaForm } from "@/components/PrendaForm";
import { quitarFondo, reducirImagen } from "@/lib/image";
import { crearPrenda, type DatosPrenda } from "@/lib/prendas";
import { useBlobUrl } from "@/lib/useBlobUrl";

type Estado = "inicio" | "procesando" | "revision";

export default function NuevaPrenda() {
  const router = useRouter();
  const camara = useRef<HTMLInputElement>(null);
  const galeria = useRef<HTMLInputElement>(null);

  const [estado, setEstado] = useState<Estado>("inicio");
  const [original, setOriginal] = useState<Blob>();
  const [recorte, setRecorte] = useState<Blob>();
  const [usarRecorte, setUsarRecorte] = useState(true);
  const [datos, setDatos] = useState<DatosPrenda>(DATOS_VACIOS);
  const [progresoFondo, setProgresoFondo] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string>();

  const urlImagen = useBlobUrl(usarRecorte && recorte ? recorte : original);

  async function procesar(file: File) {
    setEstado("procesando");
    setAviso(undefined);
    setRecorte(undefined);
    setDatos(DATOS_VACIOS);
    setProgresoFondo(0);
    const reducida = await reducirImagen(file);
    setOriginal(reducida);
    try {
      setRecorte(await quitarFondo(reducida, setProgresoFondo));
    } catch {
      setAviso("No se pudo quitar el fondo; se usará la foto original.");
    }
    setEstado("revision");
  }

  async function guardar() {
    if (!original) return;
    setGuardando(true);
    setAviso(undefined);
    try {
      await crearPrenda(datos, usarRecorte && recorte ? recorte : original, original);
      router.push("/");
    } catch (e) {
      setAviso(`No se pudo guardar: ${(e as Error).message}`);
      setGuardando(false);
    }
  }

  const pasos: { estado: Estado; nombre: string }[] = [
    { estado: "inicio", nombre: "1 Foto" },
    { estado: "procesando", nombre: "2 Recorte" },
    { estado: "revision", nombre: "3 Detalles" },
  ];

  return (
    <main className="mx-auto max-w-3xl px-5 pb-12 pt-10 md:px-12">
      <header className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" aria-label="Volver al armario" className="flex size-13 items-center justify-center rounded-[18px] bg-white shadow-suave">
          <IconoAtras />
        </Link>
        <ol className="flex items-center gap-1 rounded-full bg-white p-1.5 text-[13px] shadow-suave">
          {pasos.map((p) => (
            <li
              key={p.estado}
              aria-current={estado === p.estado ? "step" : undefined}
              className={`rounded-full px-3.5 py-2 ${estado === p.estado ? "bg-cielo-suave font-medium" : "text-muted"}`}
            >
              {p.nombre}
            </li>
          ))}
        </ol>
      </header>

      <input
        ref={camara}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => e.target.files?.[0] && procesar(e.target.files[0])}
      />
      <input
        ref={galeria}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => e.target.files?.[0] && procesar(e.target.files[0])}
      />

      {estado === "inicio" && (
        <div className="space-y-4">
          <h1 className="text-[34px] font-medium leading-tight">Nueva prenda</h1>
          <p className="mb-6 font-light text-muted">Ponla sobre un fondo liso o colgada en una percha, con buena luz.</p>
          <button onClick={() => camara.current?.click()} className="h-15 w-full rounded-full bg-moka font-medium text-white">
            Hacer foto
          </button>
          <button onClick={() => galeria.current?.click()} className="h-15 w-full rounded-full bg-white shadow-suave">
            Elegir de la galería
          </button>
        </div>
      )}

      {estado === "procesando" && (
        <div className="space-y-5 rounded-[40px] bg-white px-8 py-14 text-center shadow-suave">
          <p className="text-lg font-medium">Quitando el fondo…</p>
          <div className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-cielo transition-all" style={{ width: `${Math.round(progresoFondo * 100)}%` }} />
          </div>
          <p className="text-sm font-light text-muted">La primera vez tarda un poco más: se descarga el modelo.</p>
        </div>
      )}

      {estado === "revision" && (
        <div className="space-y-7">
          <div className="relative mx-auto aspect-[30/38] w-full max-w-[300px] overflow-hidden rounded-[40px] bg-surface">
            {urlImagen && <img src={urlImagen} alt="" className="h-full w-full object-contain p-6 pb-20" />}
            {recorte && (
              <label className="absolute inset-x-4 bottom-4 flex h-12 items-center justify-center gap-2.5 rounded-full bg-white/85 text-sm backdrop-blur">
                <input type="checkbox" className="size-4.5 accent-moka" checked={usarRecorte} onChange={(e) => setUsarRecorte(e.target.checked)} />
                Sin fondo
              </label>
            )}
          </div>

          {aviso && <p className="rounded-2xl bg-warn px-4 py-3 text-sm">{aviso}</p>}

          <PrendaForm datos={datos} onChange={setDatos} />

          <div className="flex gap-3.5 pt-2">
            <button onClick={() => setEstado("inicio")} className="h-15 flex-1 rounded-full bg-white shadow-suave">
              Otra foto
            </button>
            <button
              onClick={guardar}
              disabled={guardando}
              className="h-15 flex-[2] rounded-full bg-moka font-medium text-white disabled:opacity-40"
            >
              {guardando ? "Guardando…" : "Guardar en el armario"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
