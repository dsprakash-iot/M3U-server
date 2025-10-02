<template>
  <div>
    <div class="toolbar">
      <h1>Playlists</h1>
      <div style="display:flex;gap:8px">
        <button class="btn primary" @click="addPl">+ New Playlist</button>
      </div>
    </div>
    <div v-if="!current" class="card">
      <div class="grid">
        <div v-for="p in filtered" :key="p.id" class="tile" style="cursor:pointer" @click="open(p)">
          <div class="name"><b>{{p.name}}</b></div>
          <div class="muted">M3U: <code class="inline">/api/m3u/{{p.id}}.m3u</code></div>
        </div>
      </div>
    </div>
    <div v-else class="card">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <h2 style="margin:0">{{current.name}}</h2>
        <button class="btn" @click="current=null">Back</button>
        <button class="btn danger" v-if="me?.role!=='VIEWER'" @click="delPl(current)">Delete</button>
        <span class="badge">/api/m3u/{{current.id}}.m3u</span>
        <a class="btn" :href="abs('/api/m3u/'+current.id+'.m3u')" target="_blank">Open M3U</a>
        <button class="btn" @click="copy('/api/m3u/'+current.id+'.m3u')">Copy link</button>
      </div>
      <div class="toolbar">
        <div class="input-row"><label>Name <input v-model="current.name" @change="savePl"/></label></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" @click="showImport=true">Bulk import</button>
          <button class="btn ok" @click="saveOrder">Save order</button>
        </div>
      </div>
      <div ref="listEl">
        <div class="tr drag" v-for="(c,idx) in current.channels" :key="idx">
          <div class="muted">≡</div>
          <input v-model="c.name" placeholder="Name"/>
          <input v-model="c.url" placeholder="Stream URL"/>
          <input v-model="c.logo" placeholder="Logo URL"/>
          <input v-model="c.category" placeholder="Category"/>
          <div style="display:flex;gap:6px">
            <button class="btn ok" @click="saveCh(idx,c)">Save</button>
            <button class="btn danger" @click="remove(idx)">Remove</button>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <h4>Add channel</h4>
        <form @submit.prevent="addCh">
          <div class="input-row" style="display:grid;grid-template-columns:repeat(5,1fr) 120px;gap:8px">
            <input v-model="f.name" placeholder="Name" required/>
            <input v-model="f.url" placeholder="Stream URL" required/>
            <input v-model="f.logo" placeholder="Logo URL"/>
            <input v-model="f.category" placeholder="Category"/>
            <input v-model="f.ua" placeholder="User-Agent"/>
            <button class="btn primary">Add</button>
          </div>
        </form>
      </div>
      <div v-if="showImport" class="card" style="margin-top:12px">
        <h4>Bulk import</h4>
        <p class="muted">Paste **M3U** text or **JSON** array of channels (name,url,logo,category,ua).</p>
        <textarea v-model="bulk" style="width:100%;height:160px"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn" @click="importText('m3u')">Import M3U</button>
          <button class="btn" @click="importText('json')">Import JSON</button>
          <div style="flex:1"></div>
          <button class="btn" @click="showImport=false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import Sortable from 'sortablejs'
const props = defineProps(['q','me'])
function abs(u){ try{ return new URL(u, location.origin).href } catch{ return u } }
const pls=ref([]), current=ref(null), listEl=ref(null)
const f=reactive({ name:'', url:'', logo:'', category:'' , ua:''})
const showImport=ref(false), bulk=ref('')
const filtered = computed(()=> pls.value.filter(p => !props.q || p.name.toLowerCase().includes(props.q.toLowerCase())))
onMounted(load)
function copy(t){ navigator.clipboard.writeText(abs(t)) }
async function load(){ pls.value = await $fetch('/api/playlists') }
async function addPl(){ const name=prompt('Playlist name','Main'); if(!name) return; await $fetch('/api/playlists',{ method:'POST', body:{ name } }); load() }
function open(p){ current.value = JSON.parse(JSON.stringify(p)); nextTick(()=>{ Sortable.create(listEl.value,{ animation:150, handle:'.drag', ghostClass:'badge' }) }) }
async function savePl(){ await $fetch('/api/playlists/'+current.value.id,{ method:'PUT', body:{ name: current.value.name } }); load() }
async function delPl(p){ if(!confirm('Delete playlist?')) return; await $fetch('/api/playlists/'+p.id,{ method:'DELETE' }); current.value=null; load() }
async function addCh(){ await $fetch('/api/playlists/'+current.value.id+'/channels',{ method:'POST', body:{ ...f } }); f.name=f.url=f.logo=f.category=f.ua=''; current.value = await $fetch('/api/playlists/'+current.value.id) }
async function saveCh(i,c){ await $fetch('/api/playlists/'+current.value.id+'/channels',{ method:'PUT', body:{ index:i, channel:c } }); current.value = await $fetch('/api/playlists/'+current.value.id) }
async function remove(i){ await $fetch('/api/playlists/'+current.value.id+'/channels',{ method:'DELETE', body:{ index:i } }); current.value = await $fetch('/api/playlists/'+current.value.id) }
async function saveOrder(){
  const rows = Array.from(listEl.value.children)
  const reordered = rows.map((row, newIdx) => current.value.channels[newIdx])
  await $fetch('/api/playlists/'+current.value.id,{ method:'PUT', body:{ channels: reordered, name: current.value.name } })
  current.value = await $fetch('/api/playlists/'+current.value.id)
}
async function importText(kind){
  if(!bulk.value.trim()) return
  await $fetch('/api/playlists/'+current.value.id+'/import',{ method:'POST', body:{ kind, text: bulk.value } })
  bulk.value=''
  current.value = await $fetch('/api/playlists/'+current.value.id)
  showImport.value=false
}
</script>
