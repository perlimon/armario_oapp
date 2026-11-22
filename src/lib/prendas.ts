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

// ── Copia de seguridad ──────────────────────────────────────────────
// Un único archivo JSON con las prendas y sus fotos (como data URL), para
// poder reinstalar la app o cambiar de dispositivo sin perder el armario.

interface Copia {
  app: "mystyle";
  version: 1;
  exportada: string;
  prendas: Prenda[];
  fotos: Record<string, string>;
}

export async function exportarCopia(): Promise<File> {
  const prendas = await listarPrendas();
  const fotos = await db.fotos.toArray();
  const copia: Copia = {
    app: "mystyle",
    version: 1,
    exportada: new Date().toISOString(),
    prendas,
    fotos: Object.fromEntries(await Promise.all(fotos.map(async (f) => [f.path, await aDataUrl(f.blob)] as const))),
  };
  const fecha = copia.exportada.slice(0, 10);
  return new File([JSON.stringify(copia)], `mystyle-copia-${fecha}.json`, { type: "application/json" });
}

/** Añade las prendas de la copia; las que ya existen (mismo id) se dejan como están. */
export async function importarCopia(archivo: Blob): Promise<{ nuevas: number; repetidas: number }> {
  let copia: Copia;
  try {
    copia = JSON.parse(await archivo.text());
  } catch {
    throw new Error("El archivo no es una copia de MyStyle");
  }
  if (copia?.app !== "mystyle" || !Array.isArray(copia.prendas)) throw new Error("El archivo no es una copia de MyStyle");

  const existentes = new Set(await db.prendas.toCollection().primaryKeys());
  const nuevas = copia.prendas.filter((p) => !existentes.has(p.id));

  const fotos: Foto[] = [];
  for (const p of nuevas) {
    for (const path of new Set([p.imagen_path, p.original_path])) {
      const dataUrl = copia.fotos[path];
      if (!dataUrl) throw new Error(`Falta la foto de "${p.nombre || p.id}" en la copia`);
      fotos.push({ path, blob: await (await fetch(dataUrl)).blob() });
    }
  }

  await db.transaction("rw", db.prendas, db.fotos, async () => {
    await db.fotos.bulkPut(fotos);
    await db.prendas.bulkAdd(nuevas);
  });
  return { nuevas: nuevas.length, repetidas: copia.prendas.length - nuevas.length };
}

function aDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(blob);
  });
}
