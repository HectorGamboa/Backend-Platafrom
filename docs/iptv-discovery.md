# Discover public Mexican IPTV channels

The development-only `npm run iptv:discover:mx` importer reads a public Mexico M3U playlist from IPTV-org and creates up to 15 candidate channels (max 50 with `IMPORT_PUBLIC_IPTV_LIMIT`).

Set `NODE_ENV=development` and `IMPORT_PUBLIC_IPTV_DEMO=true`. Requires MySQL migrations and `DATABASE_URL`.

**Important:** all entries are INACTIVE, with `allowedCommercialUse=false`. Public playlist listing does **not** imply permission to restream, and streams may be unavailable. This is discovery and database onboarding, not a source of automatically licensed and playable TV. The existing Xtream catalog intentionally excludes these entries unless they are independently authorized and activated.

For VOD, the backend already imports individually licensed media records. CinePro is noncommercial, while VidSrc and NyumatFlix commonly provide web embeds rather than usable streaming URLs; this importer does not bypass them.

Flutter is unchanged. Before production: contract licensed content, separate IPTV credentials, enforce session limits at a media gateway, metadata and EPG.
