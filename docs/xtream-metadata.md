# Xtream TMDB posters / metadata

When a registered, authorized LicensedSource record has a numeric TMDB ID in contentId, Veyra enriches its movie/series Xtream catalog with TMDB title, poster and release date. The detailed `get_vod_info` and `get_series_info` add descriptions and ratings. No TMDB key or network response means graceful fallback to the existing contentId label, without claiming any stream exists that isn't in LicensedSource. TMDB is metadata-only and does not grant streaming rights.

Set `TMDB_API_KEY` in .env. Metadata is cached in memory for one hour per server instance. Large catalog requests issue one TMDB request per distinct ID on first access; consider bounded concurrency and durable metadata index before production use.

No Flutter changes. Live TV logo art and EPG require licensed provider metadata/XMLTV. No unlicensed streaming sources are scraped.
