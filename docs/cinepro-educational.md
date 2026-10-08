# CinePro — educational local integration

CinePro Core is distributed under PolyForm Noncommercial 1.0.0. This adapter is provided for local educational experiments and does not imply commercial media distribution rights.

1. Run CinePro Core on `http://127.0.0.1:3001` with its own TMDB key.
2. Run Veyra NestJS in **development** mode.
3. Add to the local `.env`:
   ```env
   NODE_ENV=development
   CINEPRO_NONCOMMERCIAL_MODE=true
   CINEPRO_URL=http://127.0.0.1:3001
   ```
4. Authenticate as an admin account granted `cinepro:debug`.
5. Call `GET /api/v1/integrations/cinepro/movies/550` or `GET /api/v1/integrations/cinepro/tv/1396/seasons/1/episodes/1`.

The adapter returns the local service response in the standard API envelope. It does not proxy video, validate or distribute any third-party rights, or serve as a production media origin. Never enable it on a publicly accessible development server.
