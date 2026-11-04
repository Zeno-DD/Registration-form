'use client';
import {useEffect,useState} from 'react';
type Row={id:string;student_name:string;student_code:string;email:string;phone:string;advisor:string;topic_title:string;created_at:string;source:string};
export default function AdminPanel(){
 const [rows,setRows]=useState<Row[]>([]);const [error,setError]=useState('');
 async function load(){const r=await fetch('/api/admin/registrations',{cache:'no-store'});if(r.ok)setRows(await r.json());else setError('Không có quyền hoặc không tải được dữ liệu.');}
 useEffect(()=>{load();},[]);
 async function exportExcel(){const r=await fetch('/api/admin/export');if(!r.ok){setError('Xuất Excel thất bại.');return;}const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='danh-sach-dang-ky.xlsx';a.click();URL.revokeObjectURL(url);}
 return <main className="wrap"><div className="panel"><h1>Quản trị đăng ký</h1><p>Chỉ tài khoản quản trị được phép xem thông tin sinh viên.</p><button onClick={exportExcel}>Xuất Excel (.xlsx)</button> <button onClick={load}>Làm mới</button>{error&&<p role="alert">{error}</p>}<p>Tổng đăng ký: {rows.length}</p><div style={{overflowX:'auto'}}><table><thead><tr>{['Tên','MSSV','Gmail','SĐT','Giáo viên','Đề tài','Thời gian'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.student_name}</td><td>{r.student_code}</td><td>{r.email}</td><td>{r.phone}</td><td>{r.advisor}</td><td>{r.topic_title}</td><td>{new Date(r.created_at).toLocaleString('vi-VN')}</td></tr>)}</tbody></table></div></div></main>;
}
