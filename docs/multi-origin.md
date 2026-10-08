# Multiple authorized origins per content

Register more than one `LicensedSource` with the **same kind and contentId**. They appear as a single movie, channel, series, or episode in the Xtream catalog. The ID derives from `kind:contentId` rather than a database UUID so alternate origins do not create duplicate titles and changing the preferred source doesn't change its Xtream ID.

At playback time the backend considers all *active and currently authorized* origins for the requested content and chooses the first valid URL. It skips malformed/insecure URLs. The current selection is a **configuration fallback**, not an availability probe and **not** failover after a player receives a 302 redirect. For automatic mid-stream recovery, a protected streaming proxy/CDN and health monitors are still needed.

Nothing in this feature scrapes third-party embedded players. Providers must supply video URLs with suitable distribution permissions. Production blockers: playback is a direct redirect, password appears in Xtream URLs, no origin URL isolation or concurrency enforcement on the stream, collision-resistant numeric IDs should be stored persistently, health checking not implemented.

Use separate records for kind `tv` and `episode`. Episode content ID `SERIES:SEASON:EPISODE`.
