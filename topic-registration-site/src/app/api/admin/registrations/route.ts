import {NextResponse} from 'next/server';
import {isAdminSession} from '@/lib/admin';
import {supabaseAdmin} from '@/lib/supabase-admin';
export async function GET(){
 if(!(await isAdminSession()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const {data,error}=await supabaseAdmin().from('registrations').select('id,student_name,student_code,email,phone,advisor,topic_title,created_at,source').order('created_at',{ascending:false});
 if(error)return NextResponse.json({error:'Database error'},{status:500});
 return NextResponse.json(data||[],{headers:{'Cache-Control':'no-store'}});
}
