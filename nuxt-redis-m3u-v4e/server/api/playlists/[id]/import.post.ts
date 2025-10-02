import { requireRole } from '../../../utils/rbac.js'
import { r } from '../../../utils/redis.js'
function parseM3U(txt){
  const lines = txt.split(/\r?\n/); const out=[]; let cur=null
  for(const ln of lines){
    if(!ln.trim()) continue
    if(ln.startsWith('#EXTINF')){
      const name = ln.split(',').slice(1).join(',').trim()
      const mLogo = ln.match(/tvg-logo="([^"]+)"/); const mCat = ln.match(/group-title="([^"]+)"/)
      cur = { name, url:'', logo: mLogo?mLogo[1]:'', category: mCat?mCat[1]:'', ua:'' }
    }else if(!ln.startsWith('#')){
      if(!cur) cur = { name: ln.split('/').pop()||'Channel', url:'', logo:'', category:'', ua:'' }
      cur.url = ln.trim(); out.push(cur); cur=null
    }
  }
  return out
}
export default defineEventHandler(async (e)=>{
  requireRole(e,'EDITOR')
  const id=e.context.params.id; const raw=await r().get('playlist:'+id); if(!raw) throw createError({status:404})
  const b=await readBody(e)
  const pl=JSON.parse(raw)
  let add=[]
  if(b?.kind==='m3u') add = parseM3U(String(b?.text||''))
  else if(b?.kind==='json') add = JSON.parse(String(b?.text||'[]'))
  else throw createError({status:400, message:'kind m3u|json'})
  pl.channels.push(...add)
  await r().set('playlist:'+id, JSON.stringify(pl))
  return pl
})
