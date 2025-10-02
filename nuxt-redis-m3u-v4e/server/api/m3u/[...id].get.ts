import { r } from '../../utils/redis.js'

async function listIds () {
  const ids = await r().smembers('org:1:playlists')
  ids.sort((a, b) => Number(a) - Number(b))
  return ids
}
async function resolveAlias (hint) {
  const ids = await listIds()
  if (!ids || ids.length === 0) return null
  if (!hint || hint === 'default' || hint === 'first') return ids[0]
  if (hint === 'latest' || hint === 'last') return ids[ids.length - 1]
  return hint
}
async function resolveToExisting (hint) {
  const ids = await listIds()
  if (!ids || ids.length === 0) return null
  const h = await resolveAlias(hint)
  if (!h) return null
  if (ids.includes(h)) return h
  for (const pid of ids) {
    const raw = await r().get('playlist:' + pid)
    try { const pl = JSON.parse(raw || ''); if ((pl?.name || '').toLowerCase() === String(h).toLowerCase()) return pid } catch {}
  }
  return null
}

export default defineEventHandler(async (e) => {
  const segs = (e.context.params?.id || []) as string[]
  let raw = Array.isArray(segs) ? segs.join('/') : String(segs || '')
  raw = raw.replace(/^\/+|\/+$/g, '').replace(/\.m3u$/i, '').trim()

  const id = await resolveToExisting(raw || null)
  if (!id) throw createError({ status: 404, message: 'Playlist not found' })

  const plRaw = await r().get('playlist:' + id)
  if (!plRaw) throw createError({ status: 404, message: 'Playlist not found' })
  const pl = JSON.parse(plRaw)

  setHeader(e, 'Content-Type', 'application/x-mpegURL; charset=utf-8')
  setHeader(e, 'Content-Disposition', `inline; filename="${id}.m3u"`)
  setHeader(e, 'Cache-Control', 'no-store')

  const out: string[] = ['#EXTM3U']
  for (const ch of pl.channels as any[]) {
    const attrs: string[] = []
    if (ch.logo) attrs.push(`tvg-logo="${String(ch.logo).replace(/"/g, '\"')}"`)
    if (ch.category) attrs.push(`group-title="${String(ch.category).replace(/"/g, '\"')}"`)
    out.push(`#EXTINF:-1 ${attrs.join(' ')},${ch.name}`)
    if (ch.ua) out.push(`#EXTVLCOPT:http-user-agent=${ch.ua}`)
    out.push(ch.url)
  }
  return out.join('\n')
})
