import Link from "next/link";
import { IconoMas, IconoOutfits, IconoPercha } from "./Iconos";

/** Barra flotante: armario, añadir prenda y (más adelante) outfits. */
export function BarraInferior() {
  return (
    <nav className="fixed inset-x-0 bottom-6 z-10 mx-auto flex h-20 w-[min(540px,calc(100%-32px))] items-center justify-around rounded-full bg-white shadow-flotante">
      <Link href="/" className="flex min-w-22 flex-col items-center gap-0.5 text-xs text-foreground">
        <IconoPercha />
        Armario
      </Link>
      <Link
        href="/nueva"
        aria-label="Añadir prenda"
        className="flex size-15 items-center justify-center rounded-full bg-cielo text-foreground shadow-[0_8px_20px_rgba(110,156,196,0.35)]"
      >
        <IconoMas />
      </Link>
      <span className="flex min-w-22 flex-col items-center gap-0.5 text-xs text-muted" aria-disabled="true">
        <IconoOutfits />
        Outfits · pronto
      </span>
    </nav>
  );
}
