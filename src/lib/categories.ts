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
