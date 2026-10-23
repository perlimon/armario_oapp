import Link from "next/link";
import { etiqueta } from "@/lib/categories";
import type { Prenda } from "@/lib/prendas";

/** Tarjeta alta y redondeada con el nombre sobre la foto. */
export function TarjetaPrenda({ prenda, url, className = "" }: { prenda: Prenda; url?: string; className?: string }) {
  return (
    <Link href={`/prenda/${prenda.id}`} className={`relative block aspect-[17/25] overflow-hidden rounded-[34px] bg-surface ${className}`}>
      {url && <img src={url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain p-4 pb-12" />}
      <p className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-b from-surface/0 via-surface/95 to-surface px-4 pt-7 pb-4 text-center text-sm font-medium">
        {prenda.nombre || prenda.tipo || etiqueta(prenda.categoria)}
      </p>
    </Link>
  );
}
