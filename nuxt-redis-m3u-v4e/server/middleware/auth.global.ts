import { readSession } from '../utils/session.js'
export default defineEventHandler(async (e)=>{
  const p=getRequestURL(e).pathname
  if (p.startsWith('/api/auth/login') || p.startsWith('/api/auth/seed') || p.startsWith('/api/m3u')) return
  if (p.startsWith('/api')){
    const sess = await readSession(e)
    if(!sess) throw createError({ status:401, message:'Unauthorized or session expired' })
    e.context.user = { username: sess.username, role: sess.role }
  }
})
