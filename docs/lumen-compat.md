# Lumen / Xtream compatibility

The Flutter app remains untouched. Xtream root endpoints return **plain JSON** (no Veyra response envelope):
- `/player_api.php?username=EMAIL&password=PASSWORD`
- `/player_api.php?...&action=get_live_streams`, `get_vod_streams`, `get_series`
- `/player_api.php?...&action=get_series_info&series_id=ID`
- `/get.php?username=EMAIL&password=PASSWORD`
- `/live/EMAIL/PASSWORD/ID.ts`, `/movie/EMAIL/PASSWORD/ID.mp4`, `/series/EMAIL/PASSWORD/ID.mp4`

Only active rights-registered sources in territory MX are listed. Supported `LicensedSource.kind`: `channel`, `movie`, `tv`, `episode`. For episodes, use `contentId` in the form `TV_ID:SEASON:EPISODE`. A `tv` record with `contentId=1399` and `episode` record `1399:1:2` yields episode 2 for season 1 in the corresponding Xtream series info. Both must have active permissions/valid dates.

Environment: `XTREAM_COMPAT_ENABLED=true`, `XTREAM_PUBLIC_URL`, `XTREAM_PUBLIC_HOST`, `XTREAM_PUBLIC_PROTOCOL`. Source playback uses a 302 redirect to a configured approved URL. **This is not a full media gateway** and does not enforce stream concurrency against direct URL sharing. Do not deploy for paid streaming until dedicated IPTV credentials, rate limiting, a signed HLS/DASH gateway, stable numeric database IDs, real EPG, test coverage and actual licensed media are in place. In particular, using user login passwords in Xtream URLs is unsafe for production; those paths can enter proxy/CDN logs.

No content is bundled. TMDB metadata and external embed services do not grant streaming rights.
