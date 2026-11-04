'use client';
import { useEffect, useState } from 'react';

type Topic = { id:string; category:string; title:string; advisor:string; occupied:boolean };
export default function Home() {
  const [topics,setTopics]=useState<Topic[]>([]);
  const [advisor,setAdvisor]=useState('');
  const [topicId,setTopicId]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [form,setForm]=useState({studentName:'',studentCode:'',email:'',phone:''});

  async function loadTopics() {
    const r=await fetch('/api/topics',{cache:'no-store'});
    if(r.ok) setTopics(await r.json());
  }
  useEffect(()=>{loadTopics(); const t=setInterval(loadTopics,2500); return ()=>clearInterval(t);},[]);
  const advisors=[...new Set(topics.map(t=>t.advisor))].sort();
  const available=topics.filter(t=>!t.occupied && t.advisor===advisor);
  function change(k:keyof typeof form,v:string){setForm(p=>({...p,[k]:v}));}
  async function submit(e:React.FormEvent){
    e.preventDefault();setMessage('');setBusy(true);
    try{
      const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,topicId})});
      const data=await r.json();
      if(!r.ok){setMessage(data.error||'Không thể đăng ký.');if(r.status===409){setTopicId('');await loadTopics();}return;}
      setMessage('Đăng ký thành công!');setForm({studentName:'',studentCode:'',email:'',phone:''});setAdvisor('');setTopicId('');await loadTopics();
    }catch{setMessage('Lỗi kết nối. Vui lòng thử lại.');}finally{setBusy(false);}
  }
  return <main className="wrap"><div className="panel">
    <h1>Đăng ký chuyên đề</h1><p className="muted">Nhập thông tin sinh viên, chọn giáo viên hướng dẫn rồi chọn đề tài còn trống.</p>
    <form onSubmit={submit}>
      <div className="grid">
        <label className="field">Họ và tên<input required maxLength={120} value={form.studentName} onChange={e=>change('studentName',e.target.value)}/></label>
        <label className="field">Mã sinh viên<input required maxLength={30} value={form.studentCode} onChange={e=>change('studentCode',e.target.value)}/></label>
        <label className="field">Gmail<input required type="email" maxLength={254} value={form.email} onChange={e=>change('email',e.target.value)}/></label>
        <label className="field">Số điện thoại<input required type="tel" maxLength={20} value={form.phone} onChange={e=>change('phone',e.target.value)}/></label>
      </div>
      <label className="field">Giáo viên hướng dẫn<select required value={advisor} onChange={e=>{setAdvisor(e.target.value);setTopicId('');}}><option value="">-- Chọn giáo viên --</option>{advisors.map(a=><option key={a}>{a}</option>)}</select></label>
      <label className="field">Đề tài<select required disabled={!advisor} value={topicId} onChange={e=>setTopicId(e.target.value)}><option value="">-- Chọn đề tài còn trống --</option>{available.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
      {advisor && available.length===0 && <p className="muted">Giáo viên này hiện không còn đề tài trống.</p>}
      {message && <p className="message" role="status">{message}</p>}
      <button disabled={busy || !topicId}>{busy?'Đang gửi...':'Đăng ký đề tài'}</button>
    </form>
    <p className="muted">Danh sách được tự động làm mới khoảng 2,5 giây một lần.</p>
  </div></main>;
}
