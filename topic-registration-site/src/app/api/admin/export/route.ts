import {NextResponse} from 'next/server';
import ExcelJS from 'exceljs';
import {isAdminSession} from '@/lib/admin';
import {supabaseAdmin} from '@/lib/supabase-admin';
export async function GET(){
 if(!(await isAdminSession()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const {data,error}=await supabaseAdmin().from('registrations').select('student_name,student_code,email,phone,advisor,topic_title,created_at').order('created_at',{ascending:false});
 if(error)return NextResponse.json({error:'Database error'},{status:500});
 const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet('Đăng ký');
 ws.columns=[{header:'Họ và tên',key:'student_name',width:28},{header:'Mã sinh viên',key:'student_code',width:18},{header:'Gmail',key:'email',width:32},{header:'Số điện thoại',key:'phone',width:18},{header:'Giáo viên hướng dẫn',key:'advisor',width:28},{header:'Đề tài',key:'topic_title',width:60},{header:'Thời gian đăng ký',key:'created_at',width:24}];
 ws.addRows((data||[]).map(r=>({...r,created_at:new Date(r.created_at).toLocaleString('vi-VN')})));
 ws.getRow(1).font={bold:true};ws.views=[{state:'frozen',ySplit:1}];
 const buf=await wb.xlsx.writeBuffer();
 return new NextResponse(buf,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="registrations.xlsx"','Cache-Control':'no-store'}});
}
