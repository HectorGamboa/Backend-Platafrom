# Upstream Xtream importer

This command connects to an existing Xtream-compatible IPTV provider account and stages **real provider catalog entries** (not demo videos) for channels, films and series episodes, without changing Flutter.

Configure `.env`:

```env
NODE_ENV=development
UPSTREAM_XTREAM_IMPORT=true
UPSTREAM_XTREAM_URL=https://your-provider.example
UPSTREAM_XTREAM_USERNAME=your-provider-user
UPSTREAM_XTREAM_PASSWORD=your-provider-password
UPSTREAM_XTREAM_LIMIT=100
```

Then `npm run xtream:import:upstream`. The importer fetches `get_live_streams`, `get_vod_streams`, `get_series`, and `get_series_info` from the provider, and records `/live`, `/movie`, and `/series` playback URLs. It requires a compatible provider and a reachable server. It cannot manufacture any movies, episodes or channels and does not scrape embed sites.

**Security and rights:** upstream credentials are included in the stored media URLs because this is how standard Xtream works. Use an account dedicated to the upstream integration and protect database backups. Imported entries are intentionally **inactive** and `allowedCommercialUse=false`. Review your provider's redistribution contract, validate source playback, and use the existing content-rights activation workflow before exposing catalog entries to subscribers. Do not send provider passwords in chat.

Current limitations: a source is copied only once and is not updated on reruns; source metadata, logos and categories are not copied; string IDs may not have TMDB enrichment; remote HLS/MP4 may not be compatible with every player; the gateway still redirects to upstream playback. This does not grant rights to retransmit content and is not proof of working video playback.
