"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FONDOS, useFondo } from "@/lib/fondo";
import { exportarCopia, importarCopia } from "@/lib/prendas";
import { IconoCerrar, IconoCopia, IconoEstilo, IconoImagen, IconoMas, IconoOutfits, IconoPercha } from "./Iconos";

const fila = "flex min-h-13 items-center gap-4 rounded-2xl px-2 text-[17px]";

/** Menú lateral en panel moka translúcido. */
export function Menu({ abierto, onCerrar, prendas }: { abierto: boolean; onCerrar: () => void; prendas?: number }) {
  const { fondo, elegir } = useFondo();
  const selector = useRef<HTMLInputElement>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string>();

  async function exportar() {
    setOcupado(true);
    setAviso(undefined);
    try {
      const archivo = await exportarCopia();
      // En el iPad, compartir abre el menú con "Guardar en Archivos"; si no se puede, se descarga.
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({ files: [archivo], title: "Copia de MyStyle" }).catch((e: Error) => {
          if (e.name !== "AbortError") throw e;
        });
      } else {
        const url = URL.createObjectURL(archivo);
        const a = document.createElement("a");
        a.href = url;
        a.download = archivo.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (e) {
      setAviso(`No se pudo exportar: ${(e as Error).message}`);
    }
    setOcupado(false);
  }

  async function importar(archivo: File) {
    setOcupado(true);
    setAviso(undefined);
    try {
      const { nuevas, repetidas } = await importarCopia(archivo);
      setAviso(
        `${nuevas} ${nuevas === 1 ? "prenda recuperada" : "prendas recuperadas"}` +
          (repetidas ? ` · ${repetidas} ya estaban` : ""),
      );
      if (nuevas) setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setAviso((e as Error).message);
    }
    setOcupado(false);
  }

  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abierto, onCerrar]);

  return (
    <div className={`fixed inset-0 z-20 transition ${abierto ? "visible" : "invisible"}`} aria-hidden={!abierto}>
      <button
        aria-label="Cerrar menú"
        tabIndex={-1}
        onClick={onCerrar}
        className={`absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity ${abierto ? "opacity-100" : "opacity-0"}`}
      />
      <nav
        aria-label="Menú"
        className={`absolute top-4 bottom-4 left-4 flex w-[min(340px,calc(100%-56px))] flex-col overflow-y-auto rounded-[40px] bg-moka/90 px-6 pt-7 pb-8 text-white shadow-flotante backdrop-blur-xl transition-transform duration-300 ${
          abierto ? "translate-x-0" : "-translate-x-[110%]"
        }`}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="font-logo text-[34px] leading-none">MyStyle</p>
            {prendas !== undefined && <p className="mt-1 text-sm font-light text-[#f1e9e1]">{prendas} prendas</p>}
            <div className="mt-3 h-[3px] w-11 rounded-full bg-cielo" />
          </div>
          <button onClick={onCerrar} aria-label="Cerrar menú" className="-mt-1 -mr-1 flex size-11 items-center justify-center rounded-full">
            <IconoCerrar />
          </button>
        </div>

        <div className="space-y-1 border-t border-white/20 pt-5">
          <Link href="/" onClick={onCerrar} className={fila}>
            <IconoPercha size={22} />
            Armario
          </Link>
          <Link href="/nueva" className={fila}>
            <IconoMas size={22} />
            Añadir prenda
          </Link>
          <Link href="/outfits" className={fila}>
            <IconoOutfits size={22} />
            Outfits
          </Link>
          <Link href="/estilo" className={fila}>
            <IconoEstilo />
            Mi estilo
          </Link>
        </div>

        <div className="mt-auto border-t border-white/20 pt-5">
          <p className="mb-3 flex items-center gap-3 px-2 text-[15px]">
            <IconoCopia />
            Copia de seguridad
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={exportar} disabled={ocupado} className="h-11 rounded-full bg-white/15 text-sm disabled:opacity-40">
              Exportar
            </button>
            <button onClick={() => selector.current?.click()} disabled={ocupado} className="h-11 rounded-full bg-white/15 text-sm disabled:opacity-40">
              Importar
            </button>
          </div>
          <input
            ref={selector}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              e.target.value = "";
              if (archivo) importar(archivo);
            }}
          />
          <p className="mt-2 px-2 text-xs leading-snug text-[#f1e9e1]" role="status">
            {ocupado ? "Un momento…" : (aviso ?? "Guarda el archivo en Archivos o iCloud para no perder tu armario.")}
          </p>
        </div>

        <div className="mt-5 border-t border-white/20 pt-5">
          <p className="mb-3 flex items-center gap-3 px-2 text-[15px]">
            <IconoImagen />
            Fondo
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            {FONDOS.map((f) => (
              <button
                key={f.id}
                onClick={() => elegir(f.id)}
                aria-label={`Fondo ${f.nombre}`}
                aria-pressed={fondo.id === f.id}
                className={`aspect-[3/4] overflow-hidden rounded-2xl ${fondo.id === f.id ? "ring-[3px] ring-cielo" : "opacity-80"}`}
              >
                <img src={f.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
