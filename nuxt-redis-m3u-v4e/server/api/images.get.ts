export default defineEventHandler(async (e)=>{
  const cfg=useRuntimeConfig(); const root=cfg.mediaRoot+'/uploads/images'
  const q=getQuery(e); const rel=String(q.path||'').replace(/(^\/+|\.\.)/g,'')
  const fs=await import('node:fs/promises'); const path=await import('node:path')
  const abs=path.default.posix.join(root, rel||''); await fs.mkdir(abs,{recursive:true}); const names=await fs.readdir(abs,{withFileTypes:true})
  const origin = getRequestURL(e).origin
  function encPath(relPath:string, name:string){ const segs = (relPath?relPath.split('/'):[ ]); segs.push(name); return segs.map(s=>encodeURIComponent(s)).join('/') }
  return names.map(d=> d.isDirectory()
    ? { type:'dir', name:d.name, relPath:(rel?rel+'/':'')+d.name }
    : { type:'file', name:d.name, url: origin + '/uploads/images/' + encPath(rel||'', d.name), relPath:(rel?rel+'/':'')+d.name }
  )
})
