import { r } from '../utils/redis.js'
async function fetchM3U(url){ const res = await $fetch(url, { responseType: 'text' }).catch(()=>null); return typeof res === 'string' ? res : '' }
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
export default defineNitroPlugin(async ()=>{
  const cfg = useRuntimeConfig(); const iv = Math.max(15, cfg.schedulerIntervalSec||60) * 1000
  async function tick(){
    try{
      const ids = await r().smembers('org:1:sources')
      const now = Date.now()
      for(const sid of ids){
        const raw = await r().get('source:'+sid); if(!raw) continue
        const s = JSON.parse(raw)
        if (!s.nextAt || now >= s.nextAt){
          const txt = await fetchM3U(s.url)
          const channels = parseM3U(txt)
          await r().set('source:'+sid+':last', JSON.stringify(channels))
          s.lastRun = now; s.status = `ok (${channels.length} ch)`; s.nextAt = now + (s.everyMin||60)*60000
          await r().set('source:'+sid, JSON.stringify(s))
        }
      }
    }catch(e){}
    setTimeout(tick, iv)
  }
  setTimeout(tick, 2000)
})
