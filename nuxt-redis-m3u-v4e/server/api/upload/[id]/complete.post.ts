import { requireRole } from '../../../utils/rbac.js'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

function encPath(relPath:string, name:string){ const segs = (relPath?relPath.split('/'):[ ]); segs.push(name); return segs.map(s=>encodeURIComponent(s)).join('/') }

export default defineEventHandler(async(e)=>{
  requireRole(e,'EDITOR')
  const cfg=useRuntimeConfig()
  const id=e.context.params.id
  const dir=path.posix.join(cfg.mediaRoot,'tmp_uploads',id)
  const meta=JSON.parse(await fsp.readFile(path.posix.join(dir,'meta.json'),'utf8'))
  const list=(await fsp.readdir(dir)).filter(n=>/\.part$/.test(n)).sort((a,b)=>Number(a.split('.')[0])-Number(b.split('.')[0]))
  const finalDir=path.posix.join(cfg.mediaRoot,'uploads',meta.type==='image'?'images':'videos',meta.rel||'')
  await fsp.mkdir(finalDir,{recursive:true})
  const final=path.posix.join(finalDir, meta.name)
  const ws=fs.createWriteStream(final,{flags:'w'})
  for(const n of list){
    const rs=fs.createReadStream(path.posix.join(dir,n))
    await new Promise((res,rej)=>{ rs.on('error',rej); ws.on('error',rej); rs.on('end',res); rs.pipe(ws,{end:false}) })
  }
  ws.end()
  for(const n of list) try{ await fsp.unlink(path.posix.join(dir,n)) }catch{}
  try{ await fsp.unlink(path.posix.join(dir,'meta.json')) }catch{}
  try{ await fsp.rmdir(dir) }catch{}
  const relativeEncoded = `/uploads/${meta.type==='image'?'images':'videos'}/${encPath(meta.rel||'', meta.name)}`
  return { url: relativeEncoded }
})
