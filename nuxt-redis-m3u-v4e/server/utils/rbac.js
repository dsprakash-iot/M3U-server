export function requireRole(e, needed){
  const u = e.context.user
  if (!u) throw createError({ status:401 })
  const rank = { VIEWER: 0, EDITOR: 1, ADMIN: 2 }
  if ((rank[u.role]||0) < (rank[needed]||0)) throw createError({ status:403, message:'Forbidden: need '+needed })
}
