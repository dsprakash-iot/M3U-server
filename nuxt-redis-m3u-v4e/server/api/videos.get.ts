export default defineEventHandler(async (e)=>{
  const cfg=useRuntimeConfig(); const root=cfg.mediaRoot+'/uploads/videos'
  const q=getQuery(e); const rel=String(q.path||'').replace(/(^\/+|\.\.)/g,'')
  const fs=await import('node:fs/promises'); const path=await import('node:path')
  const abs=path.default.posix.join(root, rel||''); await fs.mkdir(abs,{recursive:true}); const names=await fs.readdir(abs,{withFileTypes:true})
  const origin = getRequestURL(e).origin
  function encPath(relPath:string, name:string){ const segs = (relPath?relPath.split('/'):[ ]); segs.push(name); return segs.map(s=>encodeURIComponent(s)).join('/') }
  return await Promise.all(names.map(async d=>{
    if (d.isDirectory()) return { type:'dir', name:d.name, relPath:(rel?rel+'/':'')+d.name }
    const url = origin + '/uploads/videos/' + encPath(rel||'', d.name)
    const base = d.name.replace(/\.[^/.]+$/, '')
    const thumbPath = path.default.posix.join(root, rel||'', base+'.jpg')
    try{ await fs.access(thumbPath) }catch{ return { type:'file', name:d.name, url, relPath:(rel?rel+'/':'')+d.name } }
    const thumb = origin + '/uploads/videos/' + encPath(rel||'', base+'.jpg')
    return { type:'file', name:d.name, url, thumb, relPath:(rel?rel+'/':'')+d.name }
  }))
})
