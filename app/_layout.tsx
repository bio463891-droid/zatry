import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {useEffect} from 'react';
import {I18nManager} from 'react-native';
import {useZikra} from '../src/store/useZikra';
I18nManager.allowRTL(true);
export default function RootLayout(){const refresh=useZikra(s=>s.refresh);useEffect(()=>{refresh().catch(()=>{});},[]);return <><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:'#fff'}}}/></>;}
