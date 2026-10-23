export const CATEGORIAS = [
  "parte de arriba",
  "parte de abajo",
  "cuerpo entero",
  "abrigo",
  "calzado",
  "accesorio",
] as const;

export const TEMPORADAS = ["primavera", "verano", "otoño", "invierno"] as const;

export const ESTILOS = [
  "casual",
  "formal",
  "deportivo",
  "elegante",
  "streetwear",
  "clásico",
  "minimalista",
  "bohemio",
  "romántico",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];
export type Temporada = (typeof TEMPORADAS)[number];
export type Estilo = (typeof ESTILOS)[number];

/** "parte de arriba" → "Parte de arriba" */
export const etiqueta = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Nombre corto para los botones de categoría. */
export const CATEGORIA_CORTA: Record<Categoria, string> = {
  "parte de arriba": "Arriba",
  "parte de abajo": "Abajo",
  "cuerpo entero": "Vestido",
  abrigo: "Abrigo",
  calzado: "Calzado",
  accesorio: "Accesorio",
};

/** Colores que se eligen tocando un círculo; se guarda el nombre. */
export const COLORES = [
  { nombre: "blanco", hex: "#ffffff" },
  { nombre: "crudo", hex: "#efe6d6" },
  { nombre: "beige", hex: "#d8c3a5" },
  { nombre: "camel", hex: "#c19a6b" },
  { nombre: "marrón", hex: "#6b4a35" },
  { nombre: "gris", hex: "#a8a39d" },
  { nombre: "negro", hex: "#1f1b18" },
  { nombre: "azul cielo", hex: "#a9c7e3" },
  { nombre: "azul marino", hex: "#2c3e5c" },
  { nombre: "verde oliva", hex: "#7d7a55" },
  { nombre: "rojo", hex: "#a3362e" },
  { nombre: "rosa", hex: "#e7c6c1" },
] as const;

/** Color de muestra para un nombre; los escritos a mano en versiones anteriores salen en gris claro. */
export const hexDeColor = (nombre: string) => COLORES.find((c) => c.nombre === nombre.toLowerCase())?.hex ?? "#e2dcd3";
