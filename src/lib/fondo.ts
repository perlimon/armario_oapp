"use client";

import { useEffect, useState } from "react";

/** Fotos de vestidor que se pueden elegir como fondo (en public/fondos). */
export const FONDOS = [
  { id: "nogal", nombre: "Nogal", src: "/fondos/vestidor-nogal.webp" },
  { id: "claraboya", nombre: "Claraboya", src: "/fondos/vestidor-claraboya.webp" },
  { id: "palmeras", nombre: "Palmeras", src: "/fondos/vestidor-palmeras.webp" },
  { id: "lampara", nombre: "Lámpara", src: "/fondos/vestidor-lampara.webp" },
] as const;

const CLAVE = "armario-fondo";
const EVENTO = "armario-fondo";

function leer() {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

/** Fondo elegido (es solo una preferencia de este dispositivo). */
export function useFondo() {
  const [id, setId] = useState<string>(FONDOS[0].id);

  useEffect(() => {
    const actualizar = () => setId(leer() ?? FONDOS[0].id);
    actualizar();
    window.addEventListener(EVENTO, actualizar);
    return () => window.removeEventListener(EVENTO, actualizar);
  }, []);

  const fondo = FONDOS.find((f) => f.id === id) ?? FONDOS[0];

  function elegir(nuevo: string) {
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {}
    window.dispatchEvent(new Event(EVENTO));
  }

  return { fondo, elegir };
}
