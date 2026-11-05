'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Đã thêm trường category và stt vào Type
type Topic = { id:string; category?:string; stt?:number; title:string; advisor:string; occupied:boolean };

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [category, setCategory] = useState(''); // State chuyên ngành
  const [advisor, setAdvisor] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State tìm kiếm từ khóa
  const [topicId, setTopicId] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ studentName:'', studentCode:'', email:'', phone:'' });

  async function loadTopics() {
    const r = await fetch('/api/topics', { cache: 'no-store' });
    if (r.ok) setTopics(await r.json());
  }

  useEffect(() => {
    loadTopics(); 
    const channel = supabase
      .channel('public:topics')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'topics' }, () => {
        loadTopics();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Tự động rút trích danh sách Chuyên ngành có trong DB
  const categories = [...new Set(topics.map(t => t.category).filter(Boolean))].sort();

  // Lọc Giáo viên: Nếu chọn chuyên ngành, chỉ hiện GV của chuyên ngành đó
  const filteredTopicsForAdvisor = category ? topics.filter(t => t.category === category) : topics;
  const advisors = [...new Set(filteredTopicsForAdvisor.map(t => t.advisor))].sort();

  // Lọc Đề tài: Dựa vào Chuyên ngành, Giáo viên và Từ khóa tìm kiếm
  const available = topics.filter(t => {
    if (t.occupied) return false;
    if (category && t.category !== category) return false;
    if (advisor && t.advisor !== advisor) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => (a.stt || 0) - (b.stt || 0)); // Sắp xếp theo STT

  function change(k: keyof typeof form, v: string) { setForm(p => ({ ...p, [k]: v })); }
  
  async function submit(e: React.FormEvent) {
    e.preventDefault(); 
    setMessage(''); setBusy(true);
    try {
      const r = await fetch('/api/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ...form, topicId }) 
      });
      const data = await r.json();
      if (!r.ok) {
        setMessage(data.error || 'Không thể đăng ký.');
        if (r.status === 409) { setTopicId(''); await loadTopics(); }
        return;
      }
      setMessage('Đăng ký thành công!');
      setForm({ studentName:'', studentCode:'', email:'', phone:'' });
      setAdvisor(''); setCategory(''); setTopicId(''); setSearchQuery('');
      await loadTopics();
    } catch {
      setMessage('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="wrap">
      <div className="panel">
        <h1>Đăng ký chuyên đề</h1>
        <p className="muted">Nhập thông tin sinh viên, chọn chuyên ngành, giáo viên và đề tài.</p>
        <form onSubmit={submit}>
          <div className="grid">
            <label className="field">Họ và tên<input required maxLength={120} value={form.studentName} onChange={e => change('studentName', e.target.value)}/></label>
            <label className="field">Mã sinh viên<input required maxLength={30} value={form.studentCode} onChange={e => change('studentCode', e.target.value)}/></label>
            <label className="field">Gmail<input required type="email" maxLength={254} value={form.email} onChange={e => change('email', e.target.value)}/></label>
            <label className="field">Số điện thoại<input required type="tel" maxLength={20} value={form.phone} onChange={e => change('phone', e.target.value)}/></label>
          </div>

          <label className="field">
            Chuyên ngành
            <select value={category} onChange={e => { setCategory(e.target.value); setAdvisor(''); setTopicId(''); }}>
              <option value="">-- Tất cả chuyên ngành --</option>
              {categories.map(c => <option key={c as string}>{c as string}</option>)}
            </select>
          </label>

          <label className="field">
            Giáo viên hướng dẫn
            <select required value={advisor} onChange={e => { setAdvisor(e.target.value); setTopicId(''); }}>
              <option value="">-- Chọn giáo viên --</option>
              {advisors.map(a => <option key={a as string}>{a as string}</option>)}
            </select>
          </label>

          <label className="field">
            Tìm kiếm nhanh (Gõ từ khóa)
            <input type="text" placeholder="VD: Blockchain, Web, Android..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setTopicId(''); }} />
          </label>

          <label className="field">
            Đề tài
            <select required disabled={!advisor} value={topicId} onChange={e => setTopicId(e.target.value)}>
              <option value="">-- Chọn đề tài còn trống --</option>
              {available.map(t => (
                <option key={t.id} value={t.id}>
                  {t.stt ? `[STT: ${t.stt}] ` : ''}{t.title}
                </option>
              ))}
            </select>
          </label>

          {advisor && available.length === 0 && <p className="muted">Không tìm thấy đề tài phù hợp. Vui lòng đổi tiêu chí.</p>}
          {message && <p className="message" role="status">{message}</p>}
          
          <button disabled={busy || !topicId}>{busy ? 'Đang gửi...' : 'Đăng ký đề tài'}</button>
        </form>
        <p className="muted" style={{ marginTop: '1rem' }}>Danh sách được đồng bộ theo thời gian thực.</p>
      </div>
    </main>
  );
}
