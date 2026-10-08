# Unified media client integration
Flutter Android/TV clients talk only to Veyra NestJS:
- GET /api/v1/catalog/movies/popular: TMDB movie metadata
- GET /api/v1/catalog/series/popular: TMDB series metadata
- GET /api/v1/catalog/tv/channels: M3U channel discovery (not licensed by default)
- GET /api/v1/media/providers: adapter inventory
- GET /api/v1/media/sources?kind=movie&contentId=550&territory=MX: licensed source availability (no video URLs returned)
- POST /api/v1/playback/sessions: validate subscription/device and acquire concurrent slot

Do not assume a stream URL is permitted just because it appears in a playlist, embedded player or third-party provider. The backend needs a secure media gateway that authorizes manifests and segments before it can offer commercial playback. This endpoint deliberately exposes only availability/rights metadata.
