import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import mime from 'mime'

export default defineEventHandler(async(e)=>{
  const cfg=useRuntimeConfig()
  const param = e.context.params.path as any
  let rest = Array.isArray(param) ? param.join('/') : String(param||'')
  try { rest = decodeURIComponent(rest) } catch { /* noop */ }
  rest = rest.replace(/(^\/+|\.\.)/g,'')
  const abs = path.posix.join(cfg.mediaRoot,'uploads',rest)
  try{
    const st = await fsp.stat(abs)
    if (st.isDirectory()) throw createError({status:403})
    setHeader(e,'Cache-Control','no-store')
    setHeader(e,'Content-Type', mime.getType(abs)||'application/octet-stream')
    return sendStream(e, fs.createReadStream(abs))
  }catch{
    throw createError({status:404})
  }
})
