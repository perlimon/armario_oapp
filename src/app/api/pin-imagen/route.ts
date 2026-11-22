// Sirve las fotos de los pines desde nuestro dominio para que la app pueda leer
// sus colores (Pinterest no lo permite desde otro dominio). Solo acepta i.pinimg.com.

export const runtime = "nodejs";

export async function GET(req: Request) {
  const enlace = new URL(req.url).searchParams.get("url");
  let url: URL;
  try {
    url = new URL(enlace ?? "");
  } catch {
    return new Response("Enlace no válido", { status: 400 });
  }
  if (url.protocol !== "https:" || url.hostname !== "i.pinimg.com") return new Response("Solo imágenes de Pinterest", { status: 400 });

  const res = await fetch(url);
  const tipo = res.headers.get("content-type") ?? "";
  if (!res.ok || !tipo.startsWith("image/")) return new Response("No se pudo obtener la imagen", { status: 502 });
  return new Response(res.body, {
    headers: { "Content-Type": tipo, "Cache-Control": "public, max-age=604800, immutable" },
  });
}
