# Armario — instrucciones para Claude

App web progresiva (Next.js) para digitalizar el armario y, en fases posteriores, proponer outfits según el estilo de Pinterest. Plan completo: https://claude.ai/artifact/QrdVF3HoWZuEyQbjsNXhEB

## Reglas del proyecto (acordadas con el usuario; no cambiarlas sin preguntarle)

1. **Coste 0.** Solo servicios gratuitos que no pidan tarjeta (Vercel en plan gratis). Nada de APIs de pago (Anthropic, OpenAI, try-on de pago…). Si algo no se puede hacer gratis, preguntar antes.
2. **Todo en el iPad (por ahora).** Fotos y datos en IndexedDB del dispositivo, nunca en la galería. Vercel solo sirve la app. Supabase se añadirá más adelante, cuando el usuario lo pida.
3. **Privada.** Los datos no salen del dispositivo; de momento no hay cuentas. El inicio de sesión llegará con Supabase.
4. **Pinterest por enlace** a un tablero público (feed RSS). Sin capturas.
5. **iPad y móvil primero, en español** (interfaz, código y comentarios).
6. **Sin sorpresas.** Consultar los cambios importantes. Cada fase termina con algo probable en el iPad.

## Decisiones vigentes

- Sin IA de clasificación: los datos de cada prenda se rellenan a mano.
- Recorte de fondo en el dispositivo con `@imgly/background-removal`, modelo `isnet_quint8` (el más ligero), salida WebP.
- Las fotos se reducen a 900 px antes de guardar para que 100 prendas ocupen ~15–25 MB.
- Se pide almacenamiento persistente (`navigator.storage.persist`) para que Safari no borre los datos.
- Paso a Supabase: solo hay que reescribir `src/lib/prendas.ts` con las mismas funciones. Una versión ya hecha con Supabase (tabla, bucket, RLS y pantalla de entrada) está en el commit `7071344`.

## Estructura

- `src/lib/prendas.ts`: todo el acceso a datos (único archivo que sabe dónde se guardan).
