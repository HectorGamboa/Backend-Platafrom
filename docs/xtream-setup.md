# Xtream-compatible API (experimental)

This module is opt-in: XTREAM_COMPAT_ENABLED=true. Uses existing Veyra email/password and requires an active subscription. Do not expose credentials over HTTP in production. Xtream clients send credentials in URL parameters/paths; deploy TLS, redact request logs and preferably replace with separate per-user IPTV credentials.

Client base URL: https://your-domain.example (not /api/v1).
- GET /player_api.php?username=EMAIL&password=PASSWORD
- GET /player_api.php?username=EMAIL&password=PASSWORD&action=get_live_streams
- get_live_categories, get_vod_categories, get_vod_streams, get_vod_info, get_series_categories, get_series, get_series_info
- GET /get.php?username=EMAIL&password=PASSWORD&type=m3u_plus
- GET /live/EMAIL/PASSWORD/STREAM_ID.ts
- GET /movie/EMAIL/PASSWORD/STREAM_ID.mp4

Catalog reads ONLY active LicensedSource records with commercial rights declared for MX, so an empty list is expected until sources are registered. Movie and channel names currently use contentId, and series episodes are not yet indexed. Stream requests return 302 redirects to a configured approved media origin; this does NOT enforce stream concurrency or protect upstream credentials. Do not use for paid production until a media gateway, separate IPTV credentials, stable stream IDs, content metadata, and comprehensive tests are implemented.

Example env: XTREAM_COMPAT_ENABLED=true, XTREAM_PUBLIC_URL=https://your-domain.example, XTREAM_PUBLIC_HOST=your-domain.example, XTREAM_PUBLIC_PROTOCOL=https, XTREAM_PUBLIC_HTTPS_PORT=443.
