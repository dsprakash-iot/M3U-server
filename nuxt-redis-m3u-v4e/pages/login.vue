<template>
  <div class="card" style="max-width:520px;margin:40px auto">
    <h1>Sign in</h1>
    <p class="muted">First-time? Click <b>Seed Admin</b>, then login with <b>admin / admin123</b>.</p>
    <form @submit.prevent="login">
      <div class="tr" style="grid-template-columns:120px 1fr">
        <label>Username</label><input v-model="loginId" required/>
      </div>
      <div class="tr" style="grid-template-columns:120px 1fr">
        <label>Password</label><input type="password" v-model="password" required/>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn primary" type="submit">Login</button>
        <button class="btn" type="button" @click="seed">Seed Admin</button>
      </div>
      <p v-if="err" style="color:#ff6b6b">{{err}}</p>
    </form>
  </div>
</template>
<script setup>
const loginId=ref('admin'), password=ref('admin123'), err=ref(''); const router=useRouter(); const { login:authLogin, fetchMe } = useAuth()
async function login(){ try{ await authLogin(loginId.value, password.value); router.push('/dashboard/videos') }catch(e){ err.value=e?.data?.message||e?.message||'Login failed' } }
async function seed(){ try{ await $fetch('/api/auth/seed',{ method:'POST' }); await authLogin('admin','admin123'); router.push('/dashboard/videos') }catch(e){ alert('Seed failed: '+(e?.data?.message||e?.message)) } }
</script>
