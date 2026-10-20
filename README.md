# Armario

App web progresiva (PWA) para digitalizar tu armario: haces una foto a cada prenda, se le quita el fondo y Claude la clasifica por categoría, tipo, colores, temporada y estilo.

Es la **Fase 1** del plan "App de outfits con Pinterest". Las siguientes fases (estilo de Pinterest, generador de outfits y probador virtual) se construirán sobre esta base.

## Cómo funciona

- **Fotos y datos**: se guardan en el propio móvil (IndexedDB, con [Dexie](https://dexie.org/)). No hay cuentas ni servidor de datos todavía.
- **Quitar el fondo**: se hace en el dispositivo con [`@imgly/background-removal`](https://github.com/imgly/background-removal-js). La primera vez descarga el modelo (unos MB) desde el CDN de IMG.LY; después queda en caché. Si falla, se usa la foto original.
- **Clasificación**: la ruta `POST /api/classify` envía la foto a Claude (`claude-opus-5-5`) y devuelve JSON validado con Zod. Todos los campos se pueden corregir a mano antes de guardar.
- **PWA**: manifiesto, iconos y un service worker que permite abrir la app sin conexión.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y pega tu ANTHROPIC_API_KEY
npm run dev
```

Abre http://localhost:3000. Para probarla en el móvil e instalarla, despliégala con HTTPS (por ejemplo en Vercel, añadiendo `ANTHROPIC_API_KEY` como variable de entorno) y usa "Añadir a pantalla de inicio".

## Estructura

```
src/app/page.tsx              Armario (cuadrícula con filtro por categoría)
src/app/nueva/page.tsx        Añadir prenda: foto → quitar fondo + clasificar → revisar → guardar
src/app/prenda/[id]/page.tsx  Ver, editar o borrar una prenda
src/app/api/classify/route.ts Clasificación con Claude
src/app/manifest.ts           Manifiesto de la PWA
public/sw.js                  Service worker
src/lib/db.ts                 Base de datos local
src/lib/categories.ts         Categorías, temporadas y estilos
```
