import type { Categoria } from "@/lib/categories";

// Siluetas sencillas de cada categoría (viewBox 0 0 100 100).
const SILUETAS: Record<Categoria, string> = {
  "parte de arriba": "M30 22 L42 17 Q50 24 58 17 L70 22 L82 38 L73 44 L68 39 L68 84 L32 84 L32 39 L27 44 L18 38 Z",
  "parte de abajo": "M34 16 L66 16 L70 86 L56 86 L50 40 L44 86 L30 86 Z",
  "cuerpo entero": "M42 14 L58 14 L60 30 L74 84 L26 84 L40 30 Z",
  abrigo: "M32 16 L50 22 L68 16 L80 30 L78 86 L22 86 L20 30 Z M50 22 L50 86",
  calzado: "M16 62 L16 70 L84 70 Q86 60 76 58 L54 52 L44 40 L30 40 L30 60 Z",
  accesorio: "M26 40 L74 40 L78 82 L22 82 Z M38 40 Q38 22 50 22 Q62 22 62 40",
};

export function IconoCategoria({ categoria, size = 26 }: { categoria: Categoria; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" aria-hidden="true">
      <path d={SILUETAS[categoria]} />
    </svg>
  );
}

type IconoProps = { size?: number };
const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconoAtras = ({ size = 20 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const IconoEditar = ({ size = 20 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13 7l4 4" />
  </svg>
);

export const IconoBuscar = ({ size = 20 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
);

export const IconoMas = ({ size = 24 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...trazo} strokeWidth={1.6} aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconoPercha = ({ size = 24 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <path d="M12 6a2 2 0 1 1 2 2c-1 0-2 .6-2 1.6v.4" />
    <path d="M12 10L3.5 16c-.9.6-.5 2 .6 2h15.8c1.1 0 1.5-1.4.6-2z" />
  </svg>
);

export const IconoOutfits = ({ size = 24 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <rect x="4" y="4" width="7" height="9" rx="3.5" />
    <rect x="13" y="4" width="7" height="6" rx="3" />
    <rect x="13" y="12" width="7" height="8" rx="2" />
    <rect x="4" y="15" width="7" height="5" rx="2" />
  </svg>
);

export const IconoCerrar = ({ size = 20 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...trazo} aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
