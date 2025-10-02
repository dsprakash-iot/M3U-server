import { ensureAdmin } from '../../utils/session.js'
import { r, nextId } from '../../utils/redis.js'
export default defineEventHandler(async()=>{
  await ensureAdmin()
  const existing = await r().smembers('org:1:playlists')
  if (!existing || existing.length===0){
    const id = await nextId('playlist')
    const pl = { id, name:'Default', channels:[{name:'Sample', url:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', logo:'', category:'Demo', ua:''}] }
    await r().set('playlist:'+id, JSON.stringify(pl)); await r().sadd('org:1:playlists', String(id))
  }
  return {ok:true}
})
