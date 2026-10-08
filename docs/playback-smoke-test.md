# Veyra authorized playback smoke test

No Flutter changes are needed. This is a manual development-only seed for **one CC BY 3.0 movie clip**; it does **not** install a licensed IPTV/TV provider or a commercial catalog. It registers the same 30-second Big Buck Bunny video for a movie and a test series episode. The series container uses the same clip so Lumen can exercise episode navigation. **No live stream is created.**

## Setup (Windows)
1. Install dependencies and set MySQL `DATABASE_URL` and strong `JWT_SECRET` in `.env`.
2. Create DB, then `npx prisma generate`, `npx prisma db push` in development, `npm run prisma:seed`.
3. Set `NODE_ENV=development` and `XTREAM_COMPAT_ENABLED=true`. Provide `XTREAM_PUBLIC_HOST` and `XTREAM_PUBLIC_URL`. On devices, use your PC's LAN IP, not localhost.
4. Run `npm run demo:seed` explicitly. Re-running is idempotent for existing demo sources.
5. Ensure a Veyra login with an ACTIVE subscription, then `npm run start:dev`.
6. In Lumen, enter base URL `http://YOUR_LAN_IP:3000`, email as username and Veyra password. For local testing only; use HTTPS and dedicated Xtream credentials before any production deployment.
7. Open Movies or Series > demo episode 1. Native player should follow the 302 to the example MP4. Check results on your own device; this seed has not undergone device playback testing.

## Copyright and attribution
Test clip: 30-second excerpt of **Big Buck Bunny**, (c) copyright 2008 Blender Foundation / www.bigbuckbunny.org. Licensed CC BY 3.0; retain attribution. Source: https://github.com/bower-media-samples/big-buck-bunny-480p-30s; licence: https://peach.blender.org/about/ .

## Known limitations
- A public origin may be slow, removed or unavailable. No uptime guarantees.
- Xtream URLs contain user passwords; the current compatibility implementation is unsafe for commercial deployment.
- No proxy/CDN gateway or actual connection limit on video delivery; HTTP 302 redirects to upstream clip.
- No real live channel, EPG, subscription payment verification on device or broad media library.
- Numeric IDs and episode metadata require hardening for a production content inventory.
