import type { Categoria, Estilo, Temporada } from "./categories";
import { supabase } from "./supabase";

const BUCKET = "prendas";

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

export async function listarPrendas(): Promise<Prenda[]> {
  const { data, error } = await supabase().from("prendas").select("*").order("creada_en", { ascending: false });
  if (error) throw error;
  return data;
}

export async function obtenerPrenda(id: string): Promise<Prenda | null> {
  const { data, error } = await supabase().from("prendas").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function crearPrenda(datos: DatosPrenda, imagen: Blob, original: Blob) {
  const { data: sesion } = await supabase().auth.getSession();
  const userId = sesion.session?.user.id;
  if (!userId) throw new Error("La sesión ha caducado; vuelve a entrar");

  const id = crypto.randomUUID();
  const original_path = `${userId}/${id}-original.${extension(original)}`;
  // Sin recorte, la imagen es la propia foto original: se sube una sola vez.
  const imagen_path = imagen === original ? original_path : `${userId}/${id}.${extension(imagen)}`;

  await subir(original_path, original);
  if (imagen_path !== original_path) await subir(imagen_path, imagen);

  const { error } = await supabase().from("prendas").insert({ id, ...datos, imagen_path, original_path });
  if (error) {
    await supabase().storage.from(BUCKET).remove([...new Set([imagen_path, original_path])]);
    throw error;
  }
}

export async function actualizarPrenda(id: string, datos: DatosPrenda) {
  const { error } = await supabase().from("prendas").update(datos).eq("id", id);
  if (error) throw error;
}

export async function borrarPrenda(prenda: Prenda) {
  const { error } = await supabase().from("prendas").delete().eq("id", prenda.id);
  if (error) throw error;
  await supabase().storage.from(BUCKET).remove([...new Set([prenda.imagen_path, prenda.original_path])]);
}

/** Las fotos son privadas: se piden enlaces temporales (1 hora) para mostrarlas. */
export async function urlsDeImagenes(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data, error } = await supabase().storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
  if (error) throw error;
  return Object.fromEntries(data.flatMap((d) => (d.path && d.signedUrl ? [[d.path, d.signedUrl]] : [])));
}

async function subir(path: string, blob: Blob) {
  const { error } = await supabase().storage.from(BUCKET).upload(path, blob, { contentType: blob.type });
  if (error) throw error;
}

function extension(blob: Blob) {
  return blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
}
