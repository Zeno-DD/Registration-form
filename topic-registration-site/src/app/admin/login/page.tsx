'use client';
import {useState} from 'react';
import {createBrowserClient} from '@supabase/ssr';
export default function Login(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[msg,setMsg]=useState('');
 async function signIn(e:React.FormEvent){e.preventDefault();const supabase=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);const {error}=await supabase.auth.signInWithPassword({email,password});if(error){setMsg('Đăng nhập thất bại.');return;}location.href='/admin';}
 return <main className="wrap"><div className="panel"><h1>Đăng nhập quản trị</h1><form onSubmit={signIn}><label className="field">Email quản trị<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="field">Mật khẩu<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button>Đăng nhập</button>{msg&&<p role="alert">{msg}</p>}</form></div></main>;
}
