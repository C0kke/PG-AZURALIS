# project-int-platform-azuralis-2025-2

Este repositorio contiene la aplicación full-stack: backend (NestJS) y frontend (Vite + React). Este README explica cómo compilar y ejecutar localmente, y las dependencias necesarias (Postgres/Supabase y Cloudflare R2).

Requisitos mínimos
- Node.js 18+ y npm
- PostgreSQL (local) o cuenta Supabase
- (Opcional) Cloudflare R2 para almacenamiento de objetos
- Docker & docker-compose (opcional, recomendado para entornos reproducibles)

Resumen de carpetas
- `backend/`: NestJS API
- `web/`: Vite + React frontend
- `training_brownfield/`: escenario degradado para prácticas

Variables de entorno (resumen)

Backend (desarrollo): `backend/.env` (ejemplo mínimo)
- NODE_ENV=development
- PORT=3000
- DB_HOST=localhost
- DB_PORT=5432
- DB_USER=postgres
- DB_PASS=postgres
- DB_NAME=project_int_db
- JWT_SECRET=change_this_dev_secret
- R2_BUCKET_NAME=
- R2_ACCOUNT_ID=
- R2_ACCESS_KEY=
- R2_SECRET_KEY=

Backend (producción): `backend/.env.prod` — usar valores reales o secretos del entorno.

Frontend (Vite): `web/.env` (variables públicas, deben empezar con `VITE_`)
- VITE_API_URL=http://localhost:3000
- VITE_APP_TITLE=PatientApp

Postgres local (rápida guía)
1. Instala Postgres y crea una base de datos y usuario:
   - base: `project_int_db`
   - usuario/clave: ponlos en `backend/.env`
2. Alternativa: usa `docker-compose` si quieres levantar Postgres en contenedor.

Conexión a Supabase
- Si usas Supabase, coloca las credenciales en `backend/.env.prod` (DB_HOST_PROD, DB_USER_PROD, DB_PASS_PROD, DB_NAME_PROD).
- Supabase puede requerir SSL; ajusta la configuración de conexión en `backend/src/app.module.ts` si fuese necesario.

Cloudflare R2
- Si la app usa R2, define `R2_BUCKET_NAME`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY` y `R2_SECRET_KEY` en `backend/.env` o el sistema de secretos de producción.
- Si no vas a usar R2, deja estas variables vacías y adapta/elimina llamadas a `R2StorageService`.

Compilar y ejecutar (local)

Backend (desarrollo):
```bash
cd backend
npm install
# Ejecutar en modo desarrollo (con watch/hot-reload)
npm run start:dev
```

Backend (producción - build):
```bash
cd backend
npm install
npm run build
npm run start:prod
```

Frontend (desarrollo):
```bash
cd web
npm install
npm run dev
```

Notas sobre sincronización y migraciones
- En desarrollo `synchronize: true` puede facilitar, pero en producción debe ser `synchronize: false`.
- Preferir migraciones controladas a `synchronize` en entornos productivos.

Errores comunes y soluciones rápidas
- "R2_BUCKET_NAME and R2_ACCOUNT_ID must be set": rellenar variables R2 o adaptar `R2StorageService` para comportamiento opcional.
- Errores de arranque relacionados con DI/config: comprobar que `ConfigModule.forRoot()` esté registrado en `backend/src/app.module.ts` y que `backend/.env` contenga las variables necesarias.
- Problemas de SSL con Supabase: habilitar `ssl` en la configuración de TypeORM si el proveedor lo requiere.

Seguridad
- No subir `backend/.env.prod` al repositorio. Usar secretos del CI/CD o gestores de secretos.

Ayuda adicional
Si quieres, puedo:
- Generar un `docker-compose.yml` ejemplo que levante Postgres + la API.
- Crear un archivo `.env.example` con todas las variables necesarias.
- Añadir scripts de inicialización o migraciones.

Contacto
Solicita la opción que prefieras y la generaré.
