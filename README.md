# Veyra TV API
Backend base en **NestJS 10 + Prisma 5 + MySQL**. Proyecto independiente de EIT.

## Arquitectura
- `src/common`: respuesta `{success,message,data,pagination?}`, paginación, errores, JWT/RBAC, Prisma
- `src/modules/auth`: alta, login y rol viewer inicial
- `src/modules/admin`: usuarios, roles, permisos y asignaciones
- `src/modules/plans`: planes y cupos
- `src/modules/subscriptions`: suscripciones activadas manualmente por administrador
- `src/modules/devices`: registro/revocación de dispositivos con comprobación del cupo
- `src/modules/catalog`: géneros y metadatos TMDB, lista pública M3U de IPTV-org

Cada módulo separa `controller`, `service`, `repository` y `dto` cuando aplica.

## Preparación (Windows CMD)
```bat
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```
Crear primero base MySQL `veyra_tv`. Configurar `.env` con `DATABASE_URL`, secreto JWT robusto, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `TMDB_API_KEY`.
La semilla configura roles/permisos y asigna `admin` al correo indicado; **no ejecutar con credenciales débiles**.
Documentación Swagger: `http://localhost:3000/docs`. Prefijo API: `/api/v1`.

## Consideraciones de seguridad y alcance
**Estado: implementación inicial, aún no validada en CI ni lista para producción.**
- El registro de dispositivos comprueba el máximo del plan, pero las transacciones actuales **no garantizan exclusión mutua entre requests paralelos**; hace falta bloqueo por usuario en BD y pruebas de carrera. Un dispositivo registrado tampoco equivale a una conexión de reproducción activa; hace falta un servicio de playback sessions con heartbeat/TTL.
- No existe integración de pagos ni callbacks de pasarela: una suscripción queda PENDING hasta habilitarla el administrador.
- JWT de acceso básico; faltan refresh tokens rotativos, revocación, rate limiting, auditoría y pruebas automatizadas.
- Canales IPTV-org: los enlaces públicos pueden estar caídos; cada canal necesita comprobar derechos antes de comercializar.
- CinePro: no se integra automáticamente porque sus fuentes y licencia no acreditan derechos de distribución comercial. Un adaptador de fuentes autorizadas puede incorporarse más adelante.
- TMDB ofrece metadatos, **no** archivos completos de películas.
