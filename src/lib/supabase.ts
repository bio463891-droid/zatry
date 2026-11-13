import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY, AUTH_FUNCTION } from './config';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth:{storage:AsyncStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false} });
export async function authRequest(action:string,payload:Record<string,unknown>={}) {
 const res=await fetch(AUTH_FUNCTION,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY},body:JSON.stringify({action,...payload})});
 const data=await res.json().catch(()=>({error:'استجابة غير صالحة من الخادم.'}));
 if(!res.ok||data.error) throw new Error(data.error||'تعذر إكمال العملية.');
 if(data.session){const {error}=await supabase.auth.setSession({access_token:data.session.access_token,refresh_token:data.session.refresh_token});if(error)throw error;}
 return data;
}
export async function invokeRoom(action:string,payload:Record<string,unknown>={}) {const {data,error}=await supabase.functions.invoke('zikra-room-api',{body:{action,...payload}});if(error||data?.error)throw new Error(data?.error||error?.message||'تعذر تنفيذ العملية.');return data;}
export async function signedMediaUrl(mediaId:string){const {data,error}=await supabase.functions.invoke('zikra-cloudinary-deliver-media',{body:{media_id:mediaId}});if(error||!data?.url)throw new Error(data?.error||error?.message||'تعذر فتح الصورة.');return data.url as string;}
