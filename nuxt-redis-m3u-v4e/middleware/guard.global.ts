export default defineNuxtRouteMiddleware(async (to) => {
  const { me, fetchMe } = useAuth()

  async function ensure(){
    if (!me.value){
      try{ await fetchMe() }catch{}
    }
    return !!me.value
  }

  if (to.path.startsWith('/dashboard')) {
    const ok = await ensure()
    if (!ok) return navigateTo('/login')
  }

  if (to.path === '/login') {
    const ok = await ensure()
    if (ok) return navigateTo('/dashboard/videos')
  }
})
