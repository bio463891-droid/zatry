export const SUPABASE_URL = 'https://zmssushpynpsrlkswltf.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_oZWjUnNbz4aCURnHiGperw_aqNzm3wB';
export const AUTH_FUNCTION = `${SUPABASE_URL}/functions/v1/zikra-username-auth`;
export const COLORS = { bg:'#FFFFFF', surface:'#FFFFFF', ink:'#111113', muted:'#85858C', line:'#EBEBED', soft:'#F5F5F6', red:'#D23B3B', green:'#111113' };
export const AVATARS:[string,string][] = [['avatar_01','🌿'],['avatar_02','🌸'],['avatar_03','🌙'],['avatar_04','⭐'],['avatar_05','🦋'],['avatar_06','🐚'],['avatar_07','🌻'],['avatar_08','🪴'],['avatar_09','☁️'],['avatar_10','🕊️'],['avatar_11','📷'],['avatar_12','❤️']];
export const avatarEmoji=(id?:string|null)=>AVATARS.find(x=>x[0]===id)?.[1]||'🌿';
