<template><div class="card" style="max-width:420px;margin:40px auto">Redirecting…</div></template>
<script setup>
onMounted(async()=>{
  try{ await $fetch('/api/auth/me'); navigateTo('/dashboard/videos') }
  catch{ navigateTo('/login') }
})
</script>
