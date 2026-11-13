import {Redirect} from 'expo-router';
import {useEffect,useState} from 'react';
import {supabase} from '../src/lib/supabase';
import {ActivityIndicator,View} from 'react-native';
export default function Index(){const [path,setPath]=useState<'/(tabs)'|'/login'|null>(null);useEffect(()=>{supabase.auth.getSession().then(({data})=>setPath(data.session?'/(tabs)':'/login'));const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setPath(s?'/(tabs)':'/login'));return()=>subscription.unsubscribe();},[]);if(!path)return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator/></View>;return <Redirect href={path}/>;}
