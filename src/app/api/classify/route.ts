import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import { CATEGORIAS, ESTILOS, TEMPORADAS } from "@/lib/categories";

export const runtime = "nodejs";

const Clasificacion = z.object({
  nombre: z.string().describe("Nombre corto y descriptivo, p. ej. 'Camisa de lino blanca'"),
  categoria: z.enum(CATEGORIAS),
  tipo: z.string().describe("Tipo concreto de prenda, p. ej. 'vaqueros', 'blazer', 'zapatillas'"),
  colores: z.array(z.string()).describe("Colores en español, el principal primero"),
  temporadas: z.array(z.enum(TEMPORADAS)),
  estilos: z.array(z.enum(ESTILOS)),
});

const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type TipoImagen = (typeof TIPOS_IMAGEN)[number];

const client = new Anthropic();

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Falta configurar ANTHROPIC_API_KEY en el servidor" }, { status: 500 });
  }
  const { imagen, mediaType } = (await req.json()) as { imagen?: string; mediaType?: string };
  if (!imagen || !TIPOS_IMAGEN.includes(mediaType as TipoImagen)) {
    return Response.json({ error: "Falta la imagen o el formato no es válido" }, { status: 400 });
  }

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 2048,
      output_config: { effort: "low", format: zodOutputFormat(Clasificacion) },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as TipoImagen, data: imagen } },
            {
              type: "text",
              text:
                "Esta es una foto de una prenda o accesorio de un armario personal. " +
                "Clasifícala. Indica todas las temporadas en las que se podría llevar " +
                "y entre uno y tres estilos que encajen. Responde en español.",
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json({ error: "No se pudo clasificar la prenda" }, { status: 422 });
    }
    return Response.json(response.parsed_output);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "Falta configurar ANTHROPIC_API_KEY en el servidor" }, { status: 500 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Demasiadas peticiones, prueba en un momento" }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      return Response.json({ error: `Error de la IA: ${err.message}` }, { status: 502 });
    }
    throw err;
  }
}
