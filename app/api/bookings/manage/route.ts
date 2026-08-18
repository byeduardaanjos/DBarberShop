import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const times = new Set(["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function config() {
  const url=process.env.SUPABASE_URL; const key=process.env.SUPABASE_PUBLISHABLE_KEY;
  return url&&key?{url,key}:null;
}
function tokenHash(token:string){return createHash("sha256").update(token).digest("hex");}

export async function POST(request:NextRequest){
  const body=(await request.json().catch(()=>null)) as null|{id?:string;token?:string};
  const id=body?.id??""; const token=body?.token??"";
  if(!uuidPattern.test(id)||token.length!==72)return NextResponse.json({error:"Link de agendamento inválido."},{status:400});
  const supabase=config(); if(!supabase)return NextResponse.json({error:"Banco não configurado."},{status:503});
  const response=await fetch(`${supabase.url}/rest/v1/rpc/get_public_booking`,{method:"POST",headers:{apikey:supabase.key,Authorization:`Bearer ${supabase.key}`,"Content-Type":"application/json"},body:JSON.stringify({p_booking_id:id,p_manage_token_hash:tokenHash(token)}),cache:"no-store"});
  if(!response.ok)return NextResponse.json({error:"Não foi possível consultar o agendamento."},{status:502});
  const rows=await response.json(); if(!rows[0])return NextResponse.json({error:"Agendamento não encontrado ou link inválido."},{status:404});
  return NextResponse.json({booking:rows[0]});
}

export async function PATCH(request:NextRequest){
  const body=(await request.json().catch(()=>null)) as null|{id?:string;token?:string;action?:string;date?:string;time?:string};
  if(!body||!uuidPattern.test(body.id??"")||(body.token?.length??0)!==72||!new Set(["cancel","reschedule"]).has(body.action??""))return NextResponse.json({error:"Alteração inválida."},{status:400});
  if(body.action==="reschedule"&&(!/^\d{4}-\d{2}-\d{2}$/.test(body.date??"")||!times.has(body.time??"")))return NextResponse.json({error:"Escolha uma nova data e horário."},{status:400});
  const supabase=config(); if(!supabase)return NextResponse.json({error:"Banco não configurado."},{status:503});
  const response=await fetch(`${supabase.url}/rest/v1/rpc/manage_public_booking`,{method:"POST",headers:{apikey:supabase.key,Authorization:`Bearer ${supabase.key}`,"Content-Type":"application/json"},body:JSON.stringify({p_booking_id:body.id,p_manage_token_hash:tokenHash(body.token!),p_action:body.action,p_booking_date:body.date??null,p_booking_time:body.time??null}),cache:"no-store"});
  if(!response.ok){const message=await response.text();if(message.includes("unauthorized_booking"))return NextResponse.json({error:"Link inválido."},{status:403});if(message.includes("slot_unavailable")||message.includes("invalid_slot"))return NextResponse.json({error:"Este horário não está mais disponível."},{status:409});if(message.includes("booking_locked"))return NextResponse.json({error:"Este agendamento não pode mais ser alterado. Alterações são permitidas até 1 hora antes."},{status:409});return NextResponse.json({error:"Não foi possível alterar o agendamento."},{status:502});}
  return NextResponse.json({success:true});
}
