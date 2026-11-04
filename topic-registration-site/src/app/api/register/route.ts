import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { registrationSchema } from '@/lib/validation';

export async function POST(req:NextRequest){
  // Basic origin check. For cross-origin deployment, configure the exact allowed origin.
  const origin=req.headers.get('origin');
  const host=req.headers.get('host');
  if(origin && host && new URL(origin).host!==host) return NextResponse.json({error:'Yêu cầu không hợp lệ.'},{status:403});
  const parsed=registrationSchema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:'Thông tin nhập chưa hợp lệ. Vui lòng kiểm tra lại.'},{status:400});
  const v=parsed.data, db=supabaseAdmin();
  const {data:topic,error:topicError}=await db.from('topics').select('id,title,advisor,occupied').eq('id',v.topicId).maybeSingle();
  if(topicError || !topic) return NextResponse.json({error:'Đề tài không tồn tại.'},{status:404});
  if(topic.occupied) return NextResponse.json({error:'Đề tài này vừa được đăng ký bởi sinh viên khác. Vui lòng chọn đề tài khác.'},{status:409});
  // The unique constraint on registrations.topic_id is the final concurrency guard.
  const {error}=await db.from('registrations').insert({
    topic_id:topic.id,student_name:v.studentName,student_code:v.studentCode,email:v.email,
    phone:v.phone,advisor:topic.advisor,topic_title:topic.title,source:'website'
  });
  if(error){
    if(error.code==='23505') return NextResponse.json({error:'Đề tài này vừa được đăng ký bởi sinh viên khác. Vui lòng chọn đề tài khác.'},{status:409});
    return NextResponse.json({error:'Không thể lưu đăng ký. Vui lòng thử lại.'},{status:500});
  }
  const {error:updateError}=await db.from('topics').update({occupied:true}).eq('id',topic.id);
  if(updateError) return NextResponse.json({error:'Đã ghi nhận đăng ký nhưng cập nhật trạng thái đề tài gặp lỗi. Vui lòng liên hệ quản trị viên.'},{status:500});
  return NextResponse.json({ok:true});
}
