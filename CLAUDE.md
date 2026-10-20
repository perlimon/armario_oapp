# Armario — instrucciones para Claude

App web progresiva (Next.js) para digitalizar el armario y, en fases posteriores, proponer outfits según el estilo de Pinterest. Plan completo: https://claude.ai/artifact/QrdVF3HoWZuEyQbjsNXhEB

## Reglas del proyecto (acordadas con el usuario; no cambiarlas sin preguntarle)

1. **Coste 0.** Solo servicios gratuitos que no pidan tarjeta (Supabase y Vercel en plan gratis). Nada de APIs de pago (Anthropic, OpenAI, try-on de pago…). Si algo no se puede hacer gratis, preguntar antes.
2. **Todo online.** Fotos y datos en Supabase. No guardar prendas en el almacenamiento del navegador ni en la galería.
3. **Privada.** Cada usuario solo ve lo suyo (RLS en Supabase, sesión con correo y contraseña).
4. **Pinterest por enlace** a un tablero público (feed RSS). Sin capturas.
5. **Móvil primero y en español** (interfaz, código y comentarios).
6. **Sin sorpresas.** Consultar los cambios importantes. Cada fase termina con algo probable en el móvil.

## Decisiones vigentes

- Sin IA de clasificación: los datos de cada prenda se rellenan a mano.
- Recorte de fondo en el dispositivo con `@imgly/background-removal`, modelo `isnet_quint8` (el más ligero), salida WebP.
- Las fotos se reducen a 900 px antes de subir para que 100 prendas ocupen ~15–25 MB.

## Estructura

- `supabase/schema.sql`: tabla `prendas`, bucket privado `prendas` y sus políticas.
- `src/lib/prendas.ts`: todo el acceso a datos.
- `src/components/Sesion.tsx`: pantalla de entrada; envuelve toda la app.
