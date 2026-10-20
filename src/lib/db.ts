import Dexie, { type EntityTable } from "dexie";
import type { Categoria, Estilo, Temporada } from "./categories";

export interface Prenda {
  id: string;
  /** Imagen final (sin fondo si se pudo quitar). */
  imagen: Blob;
  /** Foto original reducida, por si se quiere repetir el recorte. */
  original: Blob;
  nombre: string;
  categoria: Categoria;
  tipo: string;
  colores: string[];
  temporadas: Temporada[];
  estilos: Estilo[];
  creadaEn: number;
}

export const db = new Dexie("armario") as Dexie & {
  prendas: EntityTable<Prenda, "id">;
};

db.version(1).stores({
  prendas: "id, categoria, creadaEn, *temporadas, *estilos",
});
