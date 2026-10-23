# Armario

App web progresiva (PWA) para digitalizar tu armario: haces una foto a cada prenda, se le quita el fondo en el propio dispositivo y la guardas con su categoría, tipo, colores, temporada y estilo.

Es la **Fase 1** del plan. Las reglas del proyecto (coste 0, datos en el iPad…) están en [`CLAUDE.md`](CLAUDE.md).

## Cómo funciona

- **Datos y fotos**: se guardan solo en el dispositivo (IndexedDB). Nada va a la galería ni a ningún servidor.
- **Quitar el fondo**: en el dispositivo con [`@imgly/background-removal`](https://github.com/imgly/background-removal-js). La primera vez descarga un modelo de unos 50–60 MB a la caché del navegador. Si falla, se usa la foto original.
- **Publicación**: en [Vercel](https://vercel.com) (plan gratis), solo para poder abrir la app desde el iPad.

> Como los datos viven solo en el iPad, si borras la app o los datos de Safari se pierde el armario. Instálala en la pantalla de inicio y no borres los datos de la web.

## Ponerla en el iPad (una sola vez)

1. Entra en https://vercel.com con tu cuenta de GitHub.
2. **Add New → Project**, importa este repositorio y pulsa **Deploy**. No hace falta configurar nada.
3. Abre en Safari la dirección que te da Vercel (del tipo `https://armario-xxx.vercel.app`).
4. Botón **Compartir → Añadir a pantalla de inicio**.

Cada vez que se suban cambios a GitHub, Vercel actualiza la app solo.

## Desarrollo local

```bash
npm install
npm run dev
```

## Estructura

```
src/app/page.tsx              Armario (cuadrícula con filtro por categoría)
src/app/nueva/page.tsx        Añadir prenda: foto → quitar fondo → rellenar datos → guardar
src/app/prenda/[id]/page.tsx  Ver, editar o borrar una prenda
src/lib/prendas.ts            Dónde se guardan los datos (hoy, el dispositivo)
src/lib/image.ts              Reducir fotos y quitar el fondo
```
