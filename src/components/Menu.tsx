"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FONDOS, useFondo } from "@/lib/fondo";
import { IconoCerrar, IconoEstilo, IconoImagen, IconoMas, IconoOutfits, IconoPercha } from "./Iconos";

const fila = "flex min-h-13 items-center gap-4 rounded-2xl px-2 text-[17px]";

/** Menú lateral en panel moka translúcido. */
export function Menu({ abierto, onCerrar, prendas }: { abierto: boolean; onCerrar: () => void; prendas?: number }) {
  const { fondo, elegir } = useFondo();

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
        className={`absolute top-4 bottom-4 left-4 flex w-[min(340px,calc(100%-56px))] flex-col rounded-[40px] bg-moka/90 px-6 pt-7 pb-8 text-white shadow-flotante backdrop-blur-xl transition-transform duration-300 ${
          abierto ? "translate-x-0" : "-translate-x-[110%]"
        }`}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-2xl font-medium">Mi armario</p>
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
          <span className={`${fila} text-white/60`}>
            <IconoOutfits size={22} />
            Outfits · pronto
          </span>
          <span className={`${fila} text-white/60`}>
            <IconoEstilo />
            Mi estilo · pronto
          </span>
        </div>

        <div className="mt-auto border-t border-white/20 pt-5">
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
