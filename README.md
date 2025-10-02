# Nuxt + Redis M3U Server (all-in-one)
- Image/Video libraries with chunked upload
- Playlists editor (drag to reorder, bulk import M3U/JSON)
- M3U export: `/api/m3u/<id>.m3u`, `/api/m3u/<id>`, or aliases `/api/m3u/default|first|latest`
- Scheduled remote M3U fetch + merge
- Users & Roles with idle session timeout
- Docker + Redis (no Postgres)

## Run
```bash
docker compose up -d --build
# open http://localhost:3000/login → click "Seed Admin" → login admin/admin123
```
## Test M3U
```
http://localhost:3000/api/m3u/default
http://localhost:3000/api/m3u/first
http://localhost:3000/api/m3u/latest
http://localhost:3000/api/m3u/1
http://localhost:3000/api/m3u/1.m3u
```
