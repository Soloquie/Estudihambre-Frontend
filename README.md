# EstudiHambre · Frontend

Aplicación web (React 19 + Vite + TypeScript + Tailwind v4) para consultar y comparar los restaurantes y cafeterías cercanos a la Universidad del Quindío. Se conecta al backend Spring Boot de `../backend`.

## Requisitos

- Node.js 22
- pnpm (`npm install -g pnpm`)
- Backend corriendo en `http://localhost:8080` (ver abajo)

## Cómo ejecutar

### 1. Base de datos (solo la primera vez)

Crea una base de datos vacía llamada `estudihambre` en PostgreSQL, desde pgAdmin (*Databases → Create → Database*) o con:

```powershell
& "C:\Program Files\PostgreSQL\<versión>\bin\psql.exe" -U postgres -c "CREATE DATABASE estudihambre;"
```

Las tablas las crea Spring automáticamente.

### 2. Backend (terminal 1)

```powershell
cd backend
$env:DB_URL="jdbc:postgresql://localhost:5432/estudihambre"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="<tu contraseña>"
$env:CLOUDINARY_CLOUD_NAME="..."; $env:CLOUDINARY_API_KEY="..."; $env:CLOUDINARY_API_SECRET="..."
.\mvnw.cmd spring-boot:run
```

### 3. Frontend (terminal 2)

```powershell
cd frontend
pnpm install
pnpm dev
```

Abre `http://localhost:5173`. Vite reenvía `/api` al backend, así que las cookies de sesión y CSRF funcionan sin configurar CORS.

### Usuario administrador

El registro siempre crea usuarios `ESTUDIANTE`. Para probar el panel de administración, en PostgreSQL:

```sql
UPDATE usuarios SET rol = 'ADMIN' WHERE correo = 'tu@correo.com';
```

Cierra sesión y vuelve a entrar.

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Compilación de producción |
| `pnpm typecheck` | Verificación de tipos |
| `pnpm lint` | ESLint (TypeScript, hooks de React y accesibilidad) |
| `pnpm test` | Pruebas con Vitest |

## Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Inicio: búsqueda por nombre; filtros por tipo, plato, presupuesto y distancia; orden por precio, cercanía, calificación y precio-calidad; lista y mapa | Público |
| `/establecimientos/:id` | Detalle: menús, precios, ubicación, contacto, calificaciones y comentarios | Público (calificar y comentar requiere sesión) |
| `/ingresar`, `/registro` | Acceso | Sin sesión |
| `/perfil` | Datos del usuario, notificaciones, cerrar sesión | Con sesión |
| `/mis-establecimientos` | Registrar, editar y eliminar establecimientos propios | Estudiante o restaurante |
| `/mis-establecimientos/:id/menus` | Gestión de menús (solo establecimientos aprobados) | Propietario |
| `/admin` | Aprobar o rechazar establecimientos y moderar comentarios | Administrador |

## Estructura

```
src/
  app/            router, providers y layout principal
  components/ui   botones, chips, estados (carga, vacío, error), diálogo, toast
  components/map  mapas de Leaflet (inicio, detalle, selector de ubicación)
  config/         variables de entorno y constantes (ubicación de la universidad)
  features/       auth, establecimientos, menus, calificaciones, comentarios, admin, notificaciones
                  cada una con api.ts (llamadas HTTP), hooks.ts (React Query), types.ts y pages/
  lib/            cliente HTTP con CSRF, cálculo de distancias, formatos
  styles/         tokens de Tailwind y estilos del prototipo de Figma
```

Las páginas nunca llaman a `fetch`: usan hooks, los hooks usan las funciones de `api.ts` y todo pasa por `lib/http/client.ts`.

Lo que el frontend necesita y el backend aún no ofrece está en `docs/brechas-backend.md`.
