<template>
  <div>
    <div class="toolbar">
      <h1>Scheduled Sources</h1>
      <form @submit.prevent="add" style="display:flex;gap:8px;flex-wrap:wrap">
        <input v-model="url" placeholder="Remote M3U URL" style="min-width:360px"/>
        <input v-model.number="every" type="number" min="1" placeholder="Every (min)" style="width:140px"/>
        <button class="btn primary">Add</button>
      </form>
    </div>
    <div class="card notice">Add remote M3U sources, then use <b>Merge</b> to append into a playlist.</div>
    <div class="grid">
      <div v-for="s in list" :key="s.id" class="tile">
        <div class="name"><b>#{{s.id}}</b> — {{s.url}}</div>
        <div class="muted">Every {{s.everyMin}} min | Last: {{new Date(s.lastRun||0).toLocaleString()}} | {{s.status}}</div>
        <div class="actions" style="margin-top:6px">
          <button class="btn" @click="run(s)">Run now</button>
          <select v-model="pid">
            <option v-for="p in pls" :key="p.id" :value="p.id">Merge → {{p.name}} (#{{p.id}})</option>
          </select>
          <button class="btn ok" @click="merge(s)">Merge</button>
          <button class="btn danger" @click="del(s)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const url=ref(''), every=ref(60), list=ref([]), pls=ref([]), pid=ref(null)
onMounted(load)
async function load(){ list.value = await $fetch('/api/sources'); pls.value = await $fetch('/api/playlists'); if(pls.value[0]) pid.value = pls.value[0].id }
async function add(){ await $fetch('/api/sources',{ method:'POST', body:{ url:url.value, everyMin: every.value||60 } }); url.value=''; load() }
async function del(s){ if(!confirm('Delete source?')) return; await $fetch('/api/sources/'+s.id,{ method:'DELETE' }); load() }
async function run(s){ await $fetch('/api/sources/'+s.id+'/run',{ method:'POST' }); }
async function merge(s){ if(!pid.value) return alert('Pick a playlist'); await $fetch('/api/sources/'+s.id+'/merge',{ method:'POST', body:{ playlistId: pid.value } }); alert('Merged'); }
</script>
