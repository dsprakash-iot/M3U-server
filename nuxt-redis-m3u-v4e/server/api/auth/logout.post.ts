import { destroySession } from '../../utils/session.js'; export default defineEventHandler(async(e)=>{ await destroySession(e); return {ok:true} })
