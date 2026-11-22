import Link from "next/link";
import { IconoAtras } from "./Iconos";

/** Cabecera de las pantallas secundarias: volver, título con subrayado azul y subtítulo. */
export function Cabecera({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <header className="mb-8">
      <Link href="/" aria-label="Volver al armario" className="mb-6 flex size-13 items-center justify-center rounded-[18px] bg-white shadow-suave">
        <IconoAtras />
      </Link>
      <h1 className="text-[38px] font-medium leading-tight tracking-tight">{titulo}</h1>
      <div className="mt-2.5 mb-2 h-[3px] w-11 rounded-full bg-cielo" />
      {subtitulo && <p className="font-light text-muted">{subtitulo}</p>}
    </header>
  );
}
