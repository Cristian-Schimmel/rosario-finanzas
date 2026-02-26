# Rosario Finanzas

Portal financiero moderno para la región de Rosario, Argentina. Ofrece cotizaciones del dólar, indicadores económicos, noticias y más.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)
![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación Rápida](#-instalación-rápida)
- [Credenciales de Acceso](#-credenciales-de-acceso)
- [Uso del Portal](#-uso-del-portal)
- [Panel de Administración](#-panel-de-administración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [APIs de Datos](#-apis-de-datos)
- [Comandos Disponibles](#-comandos-disponibles)
- [Configuración](#-configuración)
- [Solución de Problemas](#-solución-de-problemas)
- [Despliegue](#-despliegue)

---

## 🚀 Características

### Portal Público
- **Market Overview**: Ticker en tiempo real con cotizaciones
- **Cotizaciones del Dólar**: Oficial, Blue, MEP, CCL, Cripto, Tarjeta
- **Indicadores Económicos**: Inflación, tasas, reservas, actividad
- **Commodities Agrícolas**: Soja, maíz, trigo (precios Rosario)
- **Criptomonedas**: Bitcoin, Ethereum, USDT, USDC
- **Noticias**: Sistema completo con categorías y tags
- **SEO Optimizado**: Meta tags, Open Graph, Twitter Cards

### Panel de Administración
- **Dashboard**: Estadísticas y accesos rápidos
- **Gestión de Artículos**: Crear, editar, publicar, archivar
- **Categorías y Tags**: Organización del contenido
- **Indicadores Manuales**: Precios locales actualizables
- **Usuarios**: Gestión de roles (Admin, Editor, Viewer)

### Técnicas
- **Multi-fuente de datos**: BCRA, DolarAPI, CoinGecko
- **Caché inteligente**: TTL configurable por tipo de dato
- **Rate limiting**: Protección de APIs externas
- **Diseño responsivo**: Mobile-first
- **Modo oscuro**: Soporte completo
- **Accesibilidad**: WCAG AA

---

## 📦 Requisitos

- **Node.js**: 18.x o superior
- **npm**: 9.x o superior (o pnpm/yarn)
- **Git**: Para clonar el repositorio

---

## 🏁 Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd rosario-finanzas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
copy .env.example .env
```

El archivo `.env` ya viene configurado para desarrollo:

```env
# Base de datos SQLite (desarrollo)
DATABASE_URL="file:./dev.db"

# NextAuth - Cambiar en producción
NEXTAUTH_SECRET="desarrollo-secreto-cambiar-en-produccion"
NEXTAUTH_URL="http://localhost:3000"

# URL de la aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configurar la base de datos

```bash
# Generar el cliente Prisma
npm run db:generate

# Crear las tablas
npm run db:push

# Cargar datos iniciales (usuarios, categorías, artículos de ejemplo)
npm run db:seed
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

O si hay problemas con el comando npm:

```bash
node node_modules/next/dist/bin/next dev
```

### 6. Abrir en el navegador

- **Portal público**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login

---

## 🔐 Credenciales de Acceso

### Usuario Administrador

| Campo | Valor |
|-------|-------|
| **Email** | `admin@rosariofinanzas.com.ar` |
| **Contraseña** | `admin123` |
| **Rol** | ADMIN |

### Roles disponibles

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso completo: usuarios, configuración, todo el contenido |
| **EDITOR** | Crear y editar artículos, categorías, tags |
| **VIEWER** | Solo lectura del panel de administración |

### Crear nuevos usuarios

1. Acceder al panel de administración
2. Ir a **Administración > Usuarios**
3. Click en **Nuevo Usuario**
4. Completar el formulario con email, nombre, contraseña y rol

---

## 📖 Uso del Portal

### Página Principal (Home)

La página principal muestra:

1. **Ticker animado**: Cotizaciones en tiempo real
2. **Sección Dólar**: Todas las cotizaciones con compra/venta
3. **Tabs de indicadores**: Inflación, Tasas, Actividad
4. **Commodities**: Precios agrícolas
5. **Criptomonedas**: Bitcoin, ETH, stablecoins
6. **Últimas noticias**: Sidebar con artículos recientes

### Sección Noticias

- **Listado**: `/noticias` - Todas las noticias con filtros
- **Detalle**: `/noticias/[slug]` - Artículo completo
- **Por categoría**: `/noticias/categoria/[slug]`
- **Por tag**: `/noticias/tag/[slug]`

### Navegación

| Ruta | Descripción |
|------|-------------|
| `/` | Home - Market Overview |
| `/indicadores` | Todos los indicadores |
| `/indicadores/dolar` | Cotizaciones del dólar |
| `/indicadores/agro` | Commodities agrícolas |
| `/indicadores/cripto` | Criptomonedas |
| `/noticias` | Listado de noticias |
| `/ui-kit` | Demo del Design System |

---

## ⚙️ Panel de Administración

### Acceso

1. Ir a http://localhost:3000/admin/login
2. Ingresar credenciales:
   - Email: `admin@rosariofinanzas.com.ar`
   - Contraseña: `admin123`
3. Click en **Iniciar Sesión**

### Dashboard

El dashboard muestra:
- Total de artículos
- Artículos publicados
- Borradores pendientes
- Categorías activas
- Artículos recientes
- Accesos rápidos

### Gestión de Artículos

#### Crear un artículo

1. Click en **Nuevo Artículo** (botón verde)
2. Completar:
   - **Título**: Nombre del artículo
   - **Slug**: URL amigable (auto-generado)
   - **Resumen**: Descripción breve
   - **Contenido**: Texto completo (soporta Markdown)
   - **Categoría**: Seleccionar una
   - **Tags**: Seleccionar varios
   - **Imagen**: URL de la imagen de portada
3. Click en **Guardar Borrador** o **Publicar**

#### Estados de artículos

| Estado | Descripción |
|--------|-------------|
| **DRAFT** | Borrador, no visible públicamente |
| **PUBLISHED** | Publicado y visible |
| **SCHEDULED** | Programado para fecha futura |
| **ARCHIVED** | Archivado, no visible |

#### Editar/Eliminar

- Click en el ícono de **lápiz** para editar
- Click en el ícono de **ojo** para ver en el sitio
- Solo ADMIN puede eliminar artículos

### Gestión de Categorías

Ruta: `/admin/categorias`

Categorías predefinidas:
- Economía
- Mercados
- Agro
- Finanzas Personales
- Empresas
- Internacional

### Gestión de Tags

Ruta: `/admin/tags`

Tags predefinidos: dólar, inflación, BCRA, tasas, Merval, soja, bitcoin, Argentina, Rosario, campo

### Indicadores Manuales

Ruta: `/admin/indicadores`

Para precios que no vienen de APIs (ej: precios locales de Rosario):
- Soja Rosario
- Maíz Rosario
- Trigo Rosario

---

## 📁 Estructura del Proyecto

```
rosario-finanzas/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   ├── seed.ts            # Datos iniciales
│   └── dev.db             # Base de datos SQLite (desarrollo)
│
├── src/
│   ├── app/
│   │   ├── (public)/      # Rutas públicas
│   │   │   ├── page.tsx   # Home
│   │   │   └── noticias/  # Sección noticias
│   │   ├── (admin)/       # Rutas del admin
│   │   │   └── admin/     # Panel de administración
│   │   ├── api/           # API Routes
│   │   │   ├── auth/      # NextAuth
│   │   │   ├── admin/     # APIs del admin
│   │   │   └── indicators/# APIs de indicadores
│   │   └── ui-kit/        # Demo Design System
│   │
│   ├── components/
│   │   ├── ui/            # Componentes base
│   │   ├── indicators/    # Componentes financieros
│   │   ├── layout/        # Header, Footer
│   │   ├── news/          # Componentes de noticias
│   │   └── admin/         # Componentes del admin
│   │
│   ├── lib/
│   │   ├── auth/          # Configuración NextAuth
│   │   ├── db/            # Cliente Prisma
│   │   ├── services/      # Servicios de datos
│   │   │   └── connectors/# APIs externas
│   │   ├── design-tokens.ts
│   │   └── utils.ts
│   │
│   ├── styles/
│   │   └── globals.css    # Estilos globales
│   │
│   └── types/
│       └── index.ts       # Tipos TypeScript
│
├── .env                   # Variables de entorno
├── .env.example           # Ejemplo de variables
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 📊 APIs de Datos

### Fuentes externas

| Fuente | Datos | TTL Cache | URL |
|--------|-------|-----------|-----|
| **BCRA** | Reservas, Inflación, Tasas | 5 min | api.bcra.gob.ar |
| **DolarAPI** | Cotizaciones dólar | 1 min | dolarapi.com |
| **CoinGecko** | Criptomonedas | 2 min | coingecko.com |
| **Manual** | Commodities locales | - | Base de datos |

### APIs internas

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/indicators/overview` | GET | Resumen del mercado |
| `/api/indicators/dollar` | GET | Cotizaciones dólar |
| `/api/indicators/[category]` | GET | Indicadores por categoría |
| `/api/health` | GET | Estado del sistema |
| `/api/admin/articles` | GET/POST | CRUD artículos |
| `/api/admin/articles/[id]` | GET/PUT/DELETE | Artículo específico |

---

## 📝 Comandos Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# O directamente con node
node node_modules/next/dist/bin/next dev
```

### Base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema con la base de datos
npm run db:push

# Cargar datos iniciales
npm run db:seed

# Abrir Prisma Studio (interfaz visual de la BD)
npm run db:studio
```

### Producción

```bash
# Compilar para producción
npm run build

# Iniciar servidor de producción
npm run start
```

### Calidad de código

```bash
# Ejecutar linter
npm run lint

# Ejecutar tests
npm run test

# Tests end-to-end
npm run test:e2e
```

---

## 🔧 Configuración

### Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a base de datos | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Secreto para JWT | `mi-secreto-seguro` |
| `NEXTAUTH_URL` | URL de la aplicación | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | URL pública | `http://localhost:3000` |

### Producción con PostgreSQL

1. Cambiar en `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Actualizar `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/rosariofinanzas"
```

3. Ejecutar migraciones:

```bash
npm run db:push
npm run db:seed
```

---

## 🔍 Solución de Problemas

### Error: "Missing script: dev"

Ejecutar directamente con node:

```bash
node node_modules/next/dist/bin/next dev
```

### Error: "Port 3000 is in use"

El servidor usará automáticamente el puerto 3001. Acceder a http://localhost:3001

### Error: "UNABLE_TO_VERIFY_LEAF_SIGNATURE"

Problema de certificados SSL en desarrollo. Agregar a `.env`:

```env
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

⚠️ **IMPORTANTE**: Remover esta línea en producción.

### Error: "Module not found"

Reinstalar dependencias:

```bash
Remove-Item -Recurse -Force node_modules
npm install
npm run db:generate
```

### Error: "BCRA API error: 400"

La API del BCRA puede estar temporalmente no disponible. El sistema usa datos de fallback automáticamente.

### La base de datos no tiene datos

Ejecutar el seed:

```bash
npm run db:seed
```

### Olvidé la contraseña del admin

Ejecutar el seed nuevamente (esto borra y recrea los datos):

```bash
npm run db:seed
```

Credenciales: `admin@rosariofinanzas.com.ar` / `admin123`

---

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar variables de entorno:
   - `DATABASE_URL` (usar Neon, Supabase, o PlanetScale)
   - `NEXTAUTH_SECRET` (generar uno seguro)
   - `NEXTAUTH_URL` (URL del dominio)
3. Deploy automático con cada push

### Variables de producción

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://tu-dominio.com"
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t rosario-finanzas .
docker run -p 3000:3000 --env-file .env rosario-finanzas
```

---

## 📄 Licencia

Proyecto privado - Rosario Finanzas © 2024-2026

---

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@rosariofinanzas.com.ar
- Documentación: Este archivo README.md

---

## ✅ Checklist Post-Instalación

- [ ] Instalar dependencias: `npm install`
- [ ] Configurar `.env`
- [ ] Crear base de datos: `npm run db:push`
- [ ] Cargar datos iniciales: `npm run db:seed`
- [ ] Iniciar servidor: `npm run dev`
- [ ] Acceder al admin: http://localhost:3000/admin/login
- [ ] Cambiar contraseña del admin en producción
- [ ] Configurar dominio en producción
