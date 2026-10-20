"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { DATOS_VACIOS, PrendaForm, type DatosPrenda } from "@/components/PrendaForm";
import { db } from "@/lib/db";
import { blobABase64, quitarFondo, reducirImagen } from "@/lib/image";
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
  const [clasificando, setClasificando] = useState(false);
  const [avisos, setAvisos] = useState<string[]>([]);

  const urlImagen = useBlobUrl(usarRecorte && recorte ? recorte : original);

  async function procesar(file: File) {
    setEstado("procesando");
    setAvisos([]);
    setProgresoFondo(0);
    const reducida = await reducirImagen(file);
    setOriginal(reducida);

    const fondo = quitarFondo(reducida, setProgresoFondo)
      .then(setRecorte)
      .catch(() => setAvisos((a) => [...a, "No se pudo quitar el fondo; se usará la foto original."]));

    setClasificando(true);
    const clasificacion = clasificar(reducida)
      .then((d) => setDatos(d))
      .catch((e: Error) => setAvisos((a) => [...a, `${e.message}. Rellena los datos a mano.`]))
      .finally(() => setClasificando(false));

    await fondo;
    setEstado("revision");
    await clasificacion;
  }

  async function guardar() {
    if (!original) return;
    await db.prendas.add({
      id: crypto.randomUUID(),
      imagen: usarRecorte && recorte ? recorte : original,
      original,
      ...datos,
      creadaEn: Date.now(),
    });
    router.push("/");
  }

  return (
    <main className="mx-auto max-w-lg px-4 pb-10 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-muted">
          ← Armario
        </Link>
        <h1 className="text-lg font-semibold">Nueva prenda</h1>
        <span className="w-16" />
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
        <div className="space-y-3">
          <p className="mb-4 text-muted">
            Pon la prenda sobre un fondo liso o colgada en una percha, con buena luz.
          </p>
          <button onClick={() => camara.current?.click()} className="w-full rounded-2xl bg-foreground py-4 font-medium text-background">
            Hacer foto
          </button>
          <button onClick={() => galeria.current?.click()} className="w-full rounded-2xl border border-line py-4 font-medium">
            Elegir de la galería
          </button>
        </div>
      )}

      {estado === "procesando" && (
        <div className="space-y-4 py-10 text-center">
          <p className="font-medium">Quitando el fondo…</p>
          <div className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface">
            <div className="h-full bg-foreground transition-all" style={{ width: `${Math.round(progresoFondo * 100)}%` }} />
          </div>
          <p className="text-sm text-muted">La primera vez tarda un poco más: se descarga el modelo al móvil.</p>
        </div>
      )}

      {estado === "revision" && (
        <div className="space-y-6">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
            {urlImagen && <img src={urlImagen} alt="" className="h-full w-full object-contain p-4" />}
          </div>
          {recorte && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={usarRecorte} onChange={(e) => setUsarRecorte(e.target.checked)} />
              Usar la imagen sin fondo
            </label>
          )}

          {avisos.map((a) => (
            <p key={a} className="rounded-xl bg-warn px-3 py-2 text-sm">
              {a}
            </p>
          ))}

          {clasificando ? (
            <p className="py-6 text-center text-muted">Clasificando con IA…</p>
          ) : (
            <PrendaForm datos={datos} onChange={setDatos} />
          )}

          <div className="flex gap-3">
            <button onClick={() => setEstado("inicio")} className="flex-1 rounded-2xl border border-line py-3.5">
              Otra foto
            </button>
            <button
              onClick={guardar}
              disabled={clasificando}
              className="flex-1 rounded-2xl bg-foreground py-3.5 font-medium text-background disabled:opacity-40"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

async function clasificar(imagen: Blob): Promise<DatosPrenda> {
  const res = await fetch("/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imagen: await blobABase64(imagen), mediaType: imagen.type }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "No se pudo clasificar la prenda");
  return json as DatosPrenda;
}
