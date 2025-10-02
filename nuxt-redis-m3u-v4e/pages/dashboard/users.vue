<template>
  <div class="card">
    <h1>Users</h1>
    <div style="margin:10px 0">
      <form @submit.prevent="createUser">
        <div class="input-row" style="display:grid;grid-template-columns:1fr 1fr 1fr 120px;gap:8px">
          <input v-model="u" placeholder="Username" required />
          <input type="password" v-model="p" placeholder="Password" required />
          <select v-model="r">
            <option value="ADMIN">ADMIN</option>
            <option value="EDITOR">EDITOR</option>
            <option value="VIEWER">VIEWER</option>
          </select>
          <button class="btn primary">Create</button>
        </div>
      </form>
    </div>
    <div v-for="x in users" :key="x.username" class="tile">
      <div class="name">{{x.username}}</div>
      <div class="muted">Role: {{x.role}}</div>
      <div class="actions"><button class="btn danger" @click="del(x)">Delete</button></div>
    </div>
  </div>
</template>
<script setup>
const users=ref([]); const u=ref(''), p=ref(''), r=ref('EDITOR')
onMounted(load)
async function load(){ users.value = await $fetch('/api/users') }
async function createUser(){ await $fetch('/api/users',{ method:'POST', body:{ username:u.value, password:p.value, role:r.value } }); u.value=''; p.value=''; r.value='EDITOR'; load() }
async function del(x){ if(!confirm('Delete user?')) return; await $fetch('/api/users',{ method:'DELETE', body:{ username:x.username } }); load() }
</script>
