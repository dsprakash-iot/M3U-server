<template>
  <div>
    <div class="toolbar">
      <h1>Video Library</h1>
      <div style="display:flex;gap:8px">
        <label class="file-btn">Upload<input type="file" multiple @change="onUpload"></label>
        <button class="btn" @click="mkdir">+ Folder</button>
      </div>
    </div>
    <div class="card">
      <div class="crumbs">
        <span class="muted">Path:</span>
        <a @click="rel=''">root</a>
        <template v-for="(p,i) in parts" :key="i"><span>/</span><a @click="drill(i)">{{p}}</a></template>
      </div>
      <div class="grid" style="margin-top:8px">
        <div v-for="it in filtered" :key="it.name" class="tile">
          <div class="thumb" @click="open(it)">
            <div v-if="it.type==='dir'">📁</div>
            <template v-else>
              <img v-if="it.thumb" :src="it.thumb + '?v=' + version" />
              <div v-else>🎬 {{it.name}}</div>
            </template>
          </div>
          <div class="name">{{it.name}}</div>
          <div class="actions">
            <a v-if="it.url" :href="it.url" target="_blank" class="btn">Open</a>
            <button v-if="it.url" class="btn" @click="copy(it.url)">Copy URL</button>
            <button v-if="!it.thumb && it.url && me?.role!=='VIEWER'" class="btn ok" @click="makeThumb(it)">Make thumb</button>
            <span class="badge" v-if="it.url">{{short(it.url)}}</span>
            <button class="btn danger" v-if="me?.role!=='VIEWER'" @click="del(it)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps(['q','me'])
function abs(u){ return u }
const rel=ref(''), items=ref([]), version=ref(Date.now())
const parts = computed(()=> rel.value? rel.value.split('/') : [])
const filtered = computed(()=> items.value.filter(i => !props.q || i.name.toLowerCase().includes(props.q.toLowerCase())))
onMounted(load); watch(()=>rel.value, load)
function short(u){ return u.length>48? u.slice(0,48)+'…' : u }
function copy(t){ navigator.clipboard.writeText(t); }
async function load(){ items.value = await $fetch('/api/videos',{ params:{ path: rel.value } }) }
function open(it){ if(it.type==='dir') rel.value=(rel.value?rel.value+'/':'')+it.name }
function drill(i){ rel.value = parts.value.slice(0,i+1).join('/') }
async function del(it){ if(!confirm('Delete?')) return; await $fetch('/api/videos',{ method:'DELETE', params:{ path: it.relPath } }); load() }
async function mkdir(){ const name=prompt('Folder name'); if(!name) return; await $fetch('/api/videos/mkdir',{ method:'POST', body:{ path: rel.value, name } }); load() }
async function onUpload(e){
  const files = Array.from(e.target.files||[])
  for(const f of files){
    const q = new URLSearchParams({ type:'video', path: rel.value, name: f.name })
    const init = await $fetch('/api/upload/init?'+q.toString(), { method:'POST' })
    const size=f.size, CHUNK=8*1024*1024, total=Math.ceil(size/CHUNK)
    for(let i=0;i<total;i++){
      const start=i*CHUNK,end=Math.min(start+CHUNK,size), blob=f.slice(start,end)
      await $fetch('/api/upload/'+init.uploadId, { method:'PUT', body: blob, headers:{ 'x-chunk-index': String(i), 'x-chunk-size': String(blob.size) } })
    }
    await $fetch('/api/upload/'+init.uploadId+'/complete', { method:'POST' })
  }
  load()
}
async function makeThumb(it){ await $fetch('/api/videos/thumb',{ method:'POST', body:{ path: it.relPath } }); version.value=Date.now(); await load() }
</script>
