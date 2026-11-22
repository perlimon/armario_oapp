import type { Categoria, Temporada } from "./categories";
import { parecido } from "./colores";
import type { Pin, Prenda, Tablero } from "./prendas";

export interface Propuesta {
  clave: string;
  prendas: Prenda[];
  pin?: Pin;
  tablero?: Tablero;
  /** Cuánto se parecen los colores al pin, de 0 a 1. */
  encaje: number;
}

const TEMPORADAS: Record<string, Temporada> = {
  verano: "verano",
  invierno: "invierno",
  otoño: "otoño",
  primavera: "primavera",
  fall: "otoño",
  autumn: "otoño",
  winter: "invierno",
  summer: "verano",
  spring: "primavera",
};

/** Temporada a la que apunta un tablero, por sus etiquetas o su título. */
export function temporadaDe(tablero?: Tablero): Temporada | undefined {
  if (!tablero) return;
  const palabras = [...tablero.etiquetas, ...tablero.titulo.split(/\s+/)].map((p) => p.toLowerCase());
  return palabras.map((p) => TEMPORADAS[p]).find(Boolean);
}

/** Lo bien que encaja una prenda con un color objetivo (y la temporada, si la hay). */
function puntuar(prenda: Prenda, color: string | undefined, temporada?: Temporada) {
  const colores = prenda.colores.length ? prenda.colores : [];
  const cColor = color ? Math.max(0, ...colores.map((c, i) => parecido(c, color) * (i === 0 ? 1 : 0.85))) : 0.5;
  const cTemporada = !temporada || !prenda.temporadas.length || prenda.temporadas.includes(temporada) ? 1 : 0.6;
  return cColor * cTemporada;
}

function mejor(prendas: Prenda[], color: string | undefined, temporada: Temporada | undefined, azar: number) {
  return prendas
    .map((p) => ({ p, s: puntuar(p, color, temporada) + Math.random() * azar }))
    .sort((a, b) => b.s - a.s)[0];
}

/**
 * Propone outfits con las prendas del armario, uno por pin, buscando para la parte de
 * arriba y la de abajo las prendas cuyo color más se parece al del look del pin.
 * Añade calzado y, en otoño o invierno, una prenda de abrigo con los colores del tablero.
 */
export function generarOutfits(prendas: Prenda[], tableros: Tablero[], cuantos = 6, azar = 0.15): Propuesta[] {
  const por = (c: Categoria) => prendas.filter((p) => p.categoria === c);
  const arriba = por("parte de arriba");
  const abajo = por("parte de abajo");
  const vestidos = por("cuerpo entero");
  const abrigos = por("abrigo");
  const calzado = por("calzado");

  const pins = tableros
    .flatMap((t) => t.pins.filter((p) => p.arriba && p.abajo).map((pin) => ({ pin, tablero: t })))
    .sort(() => Math.random() - 0.5);

  const vistas = new Set<string>();
  const propuestas: Propuesta[] = [];

  for (const { pin, tablero } of pins) {
    if (propuestas.length >= cuantos) break;
    const temporada = temporadaDe(tablero);
    const paleta = [pin.arriba!, pin.abajo!];

    let base: Prenda[];
    let encaje: number;
    const vestido = pin.arriba === pin.abajo && vestidos.length ? mejor(vestidos, pin.arriba, temporada, azar) : undefined;
    if (vestido && vestido.s > 0.6) {
      base = [vestido.p];
      encaje = vestido.s;
    } else if (arriba.length && abajo.length) {
      const a = mejor(arriba, pin.arriba, temporada, azar);
      const b = mejor(abajo, pin.abajo, temporada, azar);
      base = [a.p, b.p];
      encaje = (a.s + b.s) / 2;
    } else if (vestidos.length) {
      const v = mejor(vestidos, pin.arriba, temporada, azar);
      base = [v.p];
      encaje = v.s;
    } else {
      break;
    }

    const extra: Prenda[] = [];
    if (abrigos.length && (temporada === "otoño" || temporada === "invierno")) {
      const conPaleta = (p: Prenda) => Math.max(...paleta.map((c) => puntuar(p, c, temporada)));
      extra.push(abrigos.map((p) => ({ p, s: conPaleta(p) + Math.random() * azar })).sort((a, b) => b.s - a.s)[0].p);
    }
    if (calzado.length) extra.push(mejor(calzado, pin.abajo, temporada, azar * 2).p);

    const lista = [...base, ...extra];
    const clave = lista.map((p) => p.id).sort().join("+");
    if (vistas.has(clave)) continue;
    vistas.add(clave);
    propuestas.push({ clave, prendas: lista, pin, tablero, encaje });
  }
  return propuestas;
}

/** Cómo se describe el parecido al usuario. */
export function textoEncaje(encaje: number) {
  return encaje > 0.85 ? "Muy parecido al pin" : encaje > 0.65 ? "Parecido al pin" : "Inspirado en el pin";
}
