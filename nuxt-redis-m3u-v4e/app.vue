<template>
  <div class="wrap" :class="themeClass">
    <aside>
      <div class="brand">M3U Server</div>
      <div class="search" v-if="isAuthed"><input v-model="q" placeholder="Search…"/></div>
      <template v-if="isAuthed">
        <button :class="{active:route.path.startsWith('/dashboard/images')}" @click="go('/dashboard/images')">🖼️ Image Library</button>
        <button :class="{active:route.path.startsWith('/dashboard/videos')}" @click="go('/dashboard/videos')">🎬 Video Library</button>
        <button :class="{active:route.path.startsWith('/dashboard/playlists')}" @click="go('/dashboard/playlists')">📜 Playlists</button>
        <button :class="{active:route.path.startsWith('/dashboard/sources')}" @click="go('/dashboard/sources')">⏱️ Scheduled Sources</button>
        <button v-if="me?.role==='ADMIN'" :class="{active:route.path.startsWith('/dashboard/users')}" @click="go('/dashboard/users')">👤 Users & Roles</button>
      </template>
      <div style="flex:1"></div>
      <div class="theme">
        <span class="muted">Theme</span>
        <select v-model="theme" @change="saveTheme">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <button v-if="isAuthed" class="btn" @click="logout">↩ Logout</button>
    </aside>
    <main>
      <div class="topbar">
        <div><b>{{title}}</b> <span class="badge" v-if="me">User: {{me.username}} ({{me.role}})</span></div>
        <div class="muted">Idle timeout applies</div>
      </div>
      <NuxtPage :q="q" :me="me" />
    </main>
  </div>
</template>
<script setup>
const router = useRouter(); const route = useRoute()
const title = computed(()=> route.path.split('/').slice(-1)[0] || 'Dashboard')
const { me, fetchMe, logout:authLogout } = useAuth()
function go(p){ router.push(p) }
async function logout(){ await authLogout(); router.push('/login') }
const isAuthed = computed(()=> !!me.value)
const theme = ref(localStorage.getItem('theme')||'dark')
const themeClass = computed(()=> theme.value==='light' ? 'light' : '')
function saveTheme(){ localStorage.setItem('theme', theme.value); document.documentElement.className = theme.value==='light'?'light':'' }
onMounted(saveTheme)
onMounted(fetchMe)
watch(()=>route.fullPath, ()=>{ fetchMe() })
const q = ref('')
</script>
