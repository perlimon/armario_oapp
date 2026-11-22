# MyStyle (armario) — instrucciones para Claude

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
- Copia de seguridad: el menú exporta/importa un JSON con prendas y fotos (`exportarCopia`/`importarCopia` en `src/lib/prendas.ts`). En iOS, borrar la app de la pantalla de inicio borra sus datos: exportar antes.
- Pinterest (Fase 2): varios tableros públicos con etiquetas (informal, elegante, otoño…). `src/app/api/tablero` resuelve el enlace (pin.it incluido) y lee el feed RSS `pinterest.com/<usuario>/<tablero>.rss` (≈25 pines más recientes, casi sin títulos). `src/app/api/pin-imagen` sirve las fotos de `i.pinimg.com` (sin CORS) para leer sus colores. Los tableros se guardan en el dispositivo.
- Outfits (Fase 3), sin IA: `analizarLook` (src/lib/colores.ts) toma el color dominante de una franja del torso y otra de las piernas de cada pin; `generarOutfits` (src/lib/outfits.ts) busca las prendas de arriba/abajo de color más parecido, añade calzado y, en otoño/invierno, abrigo. Es una aproximación por colores.
- Paso a Supabase: solo hay que reescribir `src/lib/prendas.ts` con las mismas funciones. Una versión ya hecha con Supabase (tabla, bucket, RLS y pantalla de entrada) está en el commit `7071344`.

## Diseño (acordado con el usuario)

- Minimalista y neutro. Fondo blanco roto `#faf8f5`, tarjetas arena `#efeae3`, texto espresso `#3b2f27`, moka `#7e6555` para el botón principal y el panel de la ficha, azul cielo `#a9c7e3` como acento (botón +, subrayado del título, selección).
- Nombre de la app: **MyStyle**. Logo: "MyStyle" en Cormorant Garamond blanco roto sobre moka, con una raya azul cielo debajo (iconos en `public/icon-*.png` y `src/app/*icon.png`).
- Letra Jost. Tarjetas altas muy redondeadas con el nombre sobre la foto; elementos blancos flotantes con sombra suave; barra inferior flotante.
- Estilo de interfaz inspirado en apps de "smart home" que el usuario compartió: cabecera con foto de vestidor y panel moka translúcido (desenfoque), menú lateral moka, ficha de prenda sobre el vestidor desenfocado.
- Fotos de vestidor en `public/fondos/` (inspiración de Pinterest del usuario, uso personal); se elige cuál desde el menú y se recuerda en `localStorage` (preferencia del dispositivo, no datos del armario).
- Sin patrones de fondo, sin arcos, sin estética "femenina". Propuesta visual: https://claude.ai/artifact/GVwCBmE22LLpzZPsH94drW
- La función de "veces puesta" queda para la Fase 3.

## Estructura

- `src/lib/prendas.ts`: todo el acceso a datos (único archivo que sabe dónde se guardan).
