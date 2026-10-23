import Dexie, { type EntityTable } from "dexie";
import type { Categoria, Estilo, Temporada } from "./categories";

// Por ahora todo se guarda en el propio dispositivo (IndexedDB).
// Este archivo es el único que sabe dónde viven los datos: para pasar a
// Supabase más adelante basta con reescribirlo manteniendo las mismas funciones.

export interface DatosPrenda {
  nombre: string;
  categoria: Categoria;
  tipo: string;
  colores: string[];
  temporadas: Temporada[];
  estilos: Estilo[];
}

export interface Prenda extends DatosPrenda {
  id: string;
  /** Imagen que se muestra (sin fondo si se pudo quitar). */
  imagen_path: string;
  /** Foto original reducida, por si se quiere repetir el recorte. */
  original_path: string;
  creada_en: string;
}

interface Foto {
  path: string;
  blob: Blob;
}

const db = new Dexie("armario") as Dexie & {
  prendas: EntityTable<Prenda, "id">;
  fotos: EntityTable<Foto, "path">;
};

db.version(1).stores({
  prendas: "id, creada_en",
  fotos: "path",
});

export async function listarPrendas(): Promise<Prenda[]> {
  return db.prendas.orderBy("creada_en").reverse().toArray();
}

export async function obtenerPrenda(id: string): Promise<Prenda | null> {
  return (await db.prendas.get(id)) ?? null;
}

export async function crearPrenda(datos: DatosPrenda, imagen: Blob, original: Blob) {
  const id = crypto.randomUUID();
  const original_path = `${id}-original.${extension(original)}`;
  // Sin recorte, la imagen es la propia foto original: se guarda una sola vez.
  const imagen_path = imagen === original ? original_path : `${id}.${extension(imagen)}`;

  await db.transaction("rw", db.prendas, db.fotos, async () => {
    await db.fotos.put({ path: original_path, blob: original });
    if (imagen_path !== original_path) await db.fotos.put({ path: imagen_path, blob: imagen });
    await db.prendas.add({ id, ...datos, imagen_path, original_path, creada_en: new Date().toISOString() });
  });
}

export async function actualizarPrenda(id: string, datos: DatosPrenda) {
  await db.prendas.update(id, { ...datos });
}

export async function borrarPrenda(prenda: Prenda) {
  await db.transaction("rw", db.prendas, db.fotos, async () => {
    await db.prendas.delete(prenda.id);
    await db.fotos.bulkDelete([...new Set([prenda.imagen_path, prenda.original_path])]);
  });
  for (const path of [prenda.imagen_path, prenda.original_path]) {
    const url = urls.get(path);
    if (url) URL.revokeObjectURL(url);
    urls.delete(path);
  }
}

const urls = new Map<string, string>();

/** Direcciones para mostrar las fotos en pantalla. */
export async function urlsDeImagenes(paths: string[]): Promise<Record<string, string>> {
  const faltan = paths.filter((p) => !urls.has(p));
  const fotos = await db.fotos.bulkGet(faltan);
  fotos.forEach((f) => f && urls.set(f.path, URL.createObjectURL(f.blob)));
  return Object.fromEntries(paths.flatMap((p) => (urls.has(p) ? [[p, urls.get(p)!]] : [])));
}

/** Pide al navegador que no borre estos datos cuando le falte espacio. */
export function pedirAlmacenamientoPersistente() {
  navigator.storage?.persist?.().catch(() => {});
}

function extension(blob: Blob) {
  return blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
}
