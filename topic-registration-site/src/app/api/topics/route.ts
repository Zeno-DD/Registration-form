import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const dynamic='force-dynamic';
export async function GET(){
  const db=supabaseAdmin();
  const {data,error}=await db.from('topics').select('id,category,title,advisor,occupied').order('advisor').order('title');
  if(error)return NextResponse.json({error:'Không tải được danh sách đề tài.'},{status:500});
  return NextResponse.json(data||[],{headers:{'Cache-Control':'no-store'}});
}
