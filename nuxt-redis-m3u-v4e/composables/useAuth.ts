export const useAuth = () => {
  const me = useState<any>('me', () => null)
  const loading = useState<boolean>('me_loading', () => false)

  async function fetchMe(){
    try{
      loading.value = true
      me.value = await $fetch('/api/auth/me')
    }catch{
      me.value = null
    }finally{
      loading.value = false
    }
  }

  async function login(login: string, password: string){
    await $fetch('/api/auth/login', { method:'POST', body:{ login, password } })
    await fetchMe()
  }

  async function logout(){
    try{ await $fetch('/api/auth/logout', { method:'POST' }) }catch{}
    me.value = null
  }

  return { me, loading, fetchMe, login, logout }
}
