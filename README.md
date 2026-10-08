# Veyra TV — Backend

NestJS 10, Prisma/MySQL. Modular controllers, services, repositories, DTOs and reusable success/pagination responses.

## Modules
- Auth: JWT access tokens; hashed, rotating refresh tokens and logout.
- Admin: users, roles and permissions.
- Plans and subscriptions: prices, expiry and connection limits.
- Devices and playback: registered devices; per-user MySQL lock, concurrent playback leases (90-second heartbeat).
- Payments: Stripe Checkout + signed, idempotent webhook that activates a subscription only after a paid event.
- Content rights: metadata, territory, commercial permission and license validity.
- Catalog: TMDB metadata and IPTV-org public M3U playlist. Does not grant rights to distribute media.
- CinePro: optional local-only debug adapter. Disabled by default; its license is noncommercial.

## Quick start (Windows CMD)
```bat
npm install
copy .env.example .env
npx prisma validate
npx prisma generate
npx prisma migrate dev --name initial
npm run prisma:seed
npm run build
npm test
npm run start:dev
```

Create MySQL database `veyra_tv` before migrating. Populate the credentials in `.env`, including strong `JWT_SECRET`, admin login and TMDB key. Swagger: http://localhost:3000/docs.

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` using Stripe test-mode keys. Configure `checkout.session.completed` webhook at `POST /api/v1/payments/webhook/stripe`.

## Production blockers
**Not production ready.** Build/CI and database migrations still need to pass. Payment integration needs end-to-end tests (including refunds/disputes). Only introductory unit tests exist; concurrency and integration tests are still needed. Registration and start/heartbeat enforce API session limits but not delivery from a media CDN: origin authorization, short-lived signed media URLs and possibly DRM are required to prevent sharing upstream links. Content-rights records are admin declarations, not independently verified licenses. CinePro uses PolyForm Noncommercial and must not be used as a commercial source without permission. IPTV-org stream URLs also require independent redistribution rights checks.
