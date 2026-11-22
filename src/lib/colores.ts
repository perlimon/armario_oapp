import { COLORES } from "./categories";

type RGB = [number, number, number];

export function hexARgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Distancia aproximada entre colores tal como los percibe el ojo ("redmean"). */
export function distancia([r1, g1, b1]: RGB, [r2, g2, b2]: RGB) {
  const rm = (r1 + r2) / 2;
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

/** Nombre del color de la paleta más parecido. */
export function colorMasCercano(rgb: RGB): string {
  let mejor: string = COLORES[0].nombre;
  let min = Infinity;
  for (const c of COLORES) {
    const d = distancia(rgb, hexARgb(c.hex));
    if (d < min) [min, mejor] = [d, c.nombre];
  }
  return mejor;
}

/** Parecido entre dos colores de la paleta, de 0 (nada) a 1 (iguales). */
export function parecido(a: string, b: string) {
  const ca = COLORES.find((c) => c.nombre === a);
  const cb = COLORES.find((c) => c.nombre === b);
  if (!ca || !cb) return 0;
  return Math.max(0, 1 - distancia(hexARgb(ca.hex), hexARgb(cb.hex)) / 500);
}

/**
 * Colores de la parte de arriba y de abajo de un look a partir de la foto de un pin.
 * Supone una foto de cuerpo entero con la persona en el centro: mira una franja del
 * torso y otra de las piernas, y se queda con el color de la paleta que más se repite.
 */
export async function analizarLook(src: string): Promise<{ arriba: string; abajo: string }> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  const ancho = 60;
  const alto = Math.round((img.naturalHeight / img.naturalWidth) * ancho);
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, ancho, alto);

  const zona = (y0: number, y1: number) => {
    const { data } = ctx.getImageData(Math.round(ancho * 0.33), Math.round(alto * y0), Math.round(ancho * 0.34), Math.round(alto * (y1 - y0)));
    const votos = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
      const nombre = colorMasCercano([data[i], data[i + 1], data[i + 2]]);
      votos.set(nombre, (votos.get(nombre) ?? 0) + 1);
    }
    return [...votos].sort((a, b) => b[1] - a[1])[0][0];
  };
  return { arriba: zona(0.28, 0.48), abajo: zona(0.58, 0.82) };
}

/** Las fotos de Pinterest se piden a través de nuestro servidor para poder leer sus colores. */
export const imagenPin = (url: string) => `/api/pin-imagen?url=${encodeURIComponent(url)}`;
