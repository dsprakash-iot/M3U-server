import Redis from 'ioredis'
let client=null
export function r(){ if(client) return client; const cfg=useRuntimeConfig(); client=new Redis(cfg.redisUrl,{lazyConnect:false,maxRetriesPerRequest:null}); return client }
export async function nextId(key){ return Number(await r().incr('seq:'+key)) }
