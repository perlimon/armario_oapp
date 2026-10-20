# Armario

App web progresiva (PWA) para digitalizar tu armario: haces una foto a cada prenda, se le quita el fondo en el propio móvil y la guardas en la nube con su categoría, tipo, colores, temporada y estilo.

Es la **Fase 1** del plan. Las reglas del proyecto (coste 0, todo online, privada…) están en [`CLAUDE.md`](CLAUDE.md).

## Cómo funciona

- **Datos y fotos**: en [Supabase](https://supabase.com) (plan gratis). Cada usuario solo ve lo suyo.
- **Quitar el fondo**: en el dispositivo con [`@imgly/background-removal`](https://github.com/imgly/background-removal-js). La primera vez descarga un modelo de unos 50–60 MB a la caché del navegador. Si falla, se usa la foto original.
- **Publicación**: en [Vercel](https://vercel.com) (plan gratis).

## Configuración (una sola vez)

### 1. Supabase

1. Crea una cuenta en https://supabase.com y un proyecto nuevo (plan Free). Elige una región de Europa.
2. En **SQL Editor → New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
3. En **Project Settings → API** copia la **Project URL** y la clave **anon public**.

### 2. Vercel

1. Entra en https://vercel.com con tu cuenta de GitHub.
2. **Add New → Project** e importa este repositorio.
3. En **Environment Variables** añade:
   - `NEXT_PUBLIC_SUPABASE_URL` = la Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clave anon public
4. Pulsa **Deploy**. Al terminar tendrás una dirección del tipo `https://armario-xxx.vercel.app`.

### 3. Últimos ajustes en Supabase

1. **Authentication → URL Configuration**: en **Site URL** pon la dirección de Vercel (para que el enlace del correo de confirmación lleve a tu app).
2. Abre la app, pulsa "Crea tu cuenta" y confirma el correo.
3. Cuando ya tengas tu cuenta: **Authentication → Sign In / Providers** y desactiva **Allow new users to sign up**, para que nadie más pueda crear cuentas en tu app.

### 4. Instalar en el móvil

Abre la dirección de Vercel en el móvil → menú del navegador → **Añadir a pantalla de inicio**.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y rellena los datos de Supabase
npm run dev
```

## Estructura

```
src/app/page.tsx              Armario (cuadrícula con filtro por categoría)
src/app/nueva/page.tsx        Añadir prenda: foto → quitar fondo → rellenar datos → guardar
src/app/prenda/[id]/page.tsx  Ver, editar o borrar una prenda
src/components/Sesion.tsx     Entrar / crear cuenta
src/lib/prendas.ts            Acceso a datos y fotos en Supabase
src/lib/image.ts              Reducir fotos y quitar el fondo
supabase/schema.sql           Tablas, almacenamiento y permisos
```
