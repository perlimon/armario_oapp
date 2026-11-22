// Lee un tablero público de Pinterest a partir de su enlace (pin.it o pinterest.*)
// usando su feed RSS. Pinterest no permite leerlo desde el navegador, por eso pasa por aquí.

export const runtime = "nodejs";

const AGENTE = "Mozilla/5.0 (compatible; MyStyle/1.0)";

interface PinFeed {
  id: string;
  enlace: string;
  imagen: string;
  titulo: string;
}

export async function GET(req: Request) {
  const enlace = new URL(req.url).searchParams.get("url")?.trim();
  if (!enlace) return Response.json({ error: "Falta el enlace del tablero" }, { status: 400 });

  try {
    const { usuario, tablero } = await resolverTablero(enlace);
    const rss = await fetch(`https://www.pinterest.com/${usuario}/${tablero}.rss`, { headers: { "User-Agent": AGENTE } });
    if (rss.status === 404) return Response.json({ error: "No se encontró el tablero. ¿Es público?" }, { status: 404 });
    if (!rss.ok) return Response.json({ error: `Pinterest respondió ${rss.status}` }, { status: 502 });
    const xml = await rss.text();

    const titulo = decodificar(/<channel>\s*<title>([\s\S]*?)<\/title>/.exec(xml)?.[1] ?? tablero).trim() || tablero;
    const pins: PinFeed[] = [];
    for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const link = /<link>([\s\S]*?)<\/link>/.exec(item)?.[1]?.trim() ?? "";
      const descripcion = decodificar(/<description>([\s\S]*?)<\/description>/.exec(item)?.[1] ?? "");
      const img = /<img src="([^"]+)"/.exec(descripcion)?.[1];
      if (!img) continue;
      pins.push({
        id: /\/pin\/([^/]+)/.exec(link)?.[1] ?? img,
        enlace: link,
        // El feed trae miniaturas de 236 px; la de 474 px se ve mejor y sigue siendo ligera.
        imagen: img.replace("/236x/", "/474x/"),
        titulo: decodificar(/<title>([\s\S]*?)<\/title>/.exec(item)?.[1] ?? "").trim(),
      });
    }
    if (!pins.length) return Response.json({ error: "El tablero no tiene pines o es privado" }, { status: 404 });

    return Response.json({ usuario, tablero, titulo, url: `https://www.pinterest.com/${usuario}/${tablero}/`, pins });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** Sigue las redirecciones del enlace (p. ej. pin.it) hasta dar con usuario/tablero. */
async function resolverTablero(enlace: string) {
  let url = new URL(enlace.startsWith("http") ? enlace : `https://${enlace}`);
  for (let i = 0; i < 6; i++) {
    if (!esPinterest(url)) throw new Error("El enlace no es de Pinterest");
    const partes = url.pathname.split("/").filter(Boolean);
    if (/pinterest\./.test(url.hostname) && partes.length >= 2 && !["pin", "url_shortener", "search", "ideas"].includes(partes[0])) {
      return { usuario: partes[0], tablero: partes[1] };
    }
    const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": AGENTE } });
    const destino = res.headers.get("location");
    if (!destino) break;
    url = new URL(destino, url);
  }
  throw new Error("No se reconoce el enlace como un tablero de Pinterest");
}

function esPinterest(url: URL) {
  return url.protocol === "https:" && (url.hostname === "pin.it" || /(^|\.)pinterest\.[a-z.]+$/.test(url.hostname));
}

function decodificar(texto: string) {
  return texto
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
