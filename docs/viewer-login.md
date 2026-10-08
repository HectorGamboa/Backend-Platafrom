# Login de prueba para Veyra TV / Lumen

El seeder base siempre crea los roles `admin` y `viewer`, y opcionalmente el administrador configurado. Para crear además un usuario **viewer** con suscripción `ACTIVE` de 30 días, agrega al `.env` local:

```env
NODE_ENV=development
SEED_VIEWER_DEMO=true
VIEWER_EMAIL=viewer@veyra.tv
VIEWER_PASSWORD=CAMBIA_ESTA_CLAVE_POR_UNA_DE_12_CARACTERES_O_MAS
XTREAM_COMPAT_ENABLED=true
```

Luego ejecuta `npm run prisma:seed`. El comando puede repetirse: reutiliza al usuario y al plan del demo y renueva la suscripción. Actualiza la contraseña del **viewer** a `VIEWER_PASSWORD`; la contraseña de un administrador existente se conserva.

Abre Lumen en el emulador Android con servidor `http://10.0.2.2:3000`, usuario `viewer@veyra.tv` (o `VIEWER_EMAIL`), y `VIEWER_PASSWORD`. `XTREAM_PUBLIC_URL`/`XTREAM_PUBLIC_HOST` deben ser accesibles desde el emulador.

Nunca activar `SEED_VIEWER_DEMO` en producción, ni compartir claves reales o el `.env`. El seed solo crea usuario/suscripción: para contenido reproducible aún necesitas fuentes registradas y activas.
