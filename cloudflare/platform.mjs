import {createRemoteJWKSet, jwtVerify} from 'jose';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const keys=new Map();
export const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};

export async function identity(req,env){
  if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD)fail('팀 로그인 연결을 준비 중입니다.',503);
  if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN))fail('로그인 설정을 확인해 주세요.',503);
  const token=req.headers.get('Cf-Access-Jwt-Assertion')||req.headers.get('Cookie')?.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)?.[1];
  if(!token)fail('한패스 팀 로그인이 필요합니다.',401);
  const issuer='https://'+env.ACCESS_TEAM_DOMAIN;
  if(!keys.has(issuer))keys.set(issuer,createRemoteJWKSet(new URL(issuer+'/cdn-cgi/access/certs')));
  let payload;
  try{({payload}=await jwtVerify(token,keys.get(issuer),{issuer,audience:env.ACCESS_AUD,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email']}))}catch{fail('로그인이 만료되었습니다. 다시 로그인해 주세요.',401)}
  const email=String(payload.email).toLowerCase();
  if(email.split('@').length!==2||email.split('@')[1]!==env.ALLOWED_EMAIL_DOMAIN)fail('한패스 팀 계정만 사용할 수 있습니다.',403);
  return {email};
}

async function readBody(req,limit){
  if(Number(req.headers.get('Content-Length'))>limit)fail('파일 또는 요청이 너무 큽니다.',413);
  const reader=req.body?.getReader();if(!reader)return new Uint8Array();
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();fail('파일 또는 요청이 너무 큽니다.',413)}chunks.push(value)}
  const out=new Uint8Array(size);let offset=0;for(const part of chunks){out.set(part,offset);offset+=part.length}return out;
}

export function validateDocument(d,id){
  if(!d||typeof d!=='object'||Array.isArray(d)||d.id!==id||!UUID.test(id))fail('디자인 ID가 올바르지 않습니다.');
  if(!Number.isInteger(d.format)||d.format<0||d.format>13||!Number.isInteger(d.theme)||d.theme<0||d.theme>7)fail('지원하지 않는 디자인 규격입니다.');
  for(const field of ['title','desc','offer','cta','note','name','period','coupon'])if(d[field]!==undefined&&(typeof d[field]!=='string'||d[field].length>1000))fail('문구 길이를 확인해 주세요.');
  if(typeof d.title!=='string'||typeof d.desc!=='string')fail('디자인 문구가 필요합니다.');
  if(d.image&&!new RegExp('^/api/assets/'+UUID.source.slice(1,-1)+'$','i').test(d.image))fail('이미지를 먼저 업로드해 주세요.');
  return d;
}

export async function api(req,env,user){
  const url=new URL(req.url),path=url.pathname,owner=user.email;
  if(req.method!=='GET'&&req.method!=='HEAD'&&req.headers.get('Origin')!==url.origin)return json({error:'다른 출처의 요청은 허용되지 않습니다.'},403);
  if(path==='/api/session'&&req.method==='GET')return json({email:owner,storage:'cloudflare',database:Boolean(env.DB),files:Boolean(env.FILES)});
  if(!env.DB||!env.FILES) return json({error:'저장소 연결을 준비 중입니다.'},503);
  if(path==='/api/projects'&&req.method==='GET'){
    const rows=await env.DB.prepare('SELECT document,revision,updated_at FROM projects WHERE owner=? ORDER BY updated_at DESC').bind(owner).all();
    return json({projects:rows.results.map(r=>({document:JSON.parse(r.document),revision:r.revision,updated:r.updated_at}))});
  }
  const project=path.match(/^\/api\/projects\/([a-f0-9-]+)$/i);
  if(project&&UUID.test(project[1])&&req.method==='PUT'){
    if(!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON 요청이 필요합니다.'},415);
    let input;try{input=JSON.parse(new TextDecoder().decode(await readBody(req,128*1024)))}catch(e){if(e.status)throw e;return json({error:'올바른 JSON이 아닙니다.'},400)}
    const d=validateDocument(input.document,project[1]),revision=input.revision;
    if(!Number.isSafeInteger(revision)||revision<0)return json({error:'저장 버전을 확인해 주세요.'},400);
    if(d.image){const asset=await env.DB.prepare('SELECT id FROM assets WHERE id=? AND owner=?').bind(d.image.split('/').pop(),owner).first();if(!asset)return json({error:'사용할 수 없는 이미지입니다.'},403)}
    const now=Date.now(),document=JSON.stringify({...d,updated:now});
    const result=revision===0
      ?await env.DB.prepare('INSERT OR IGNORE INTO projects(owner,id,document,revision,updated_at) VALUES(?,?,?,1,?)').bind(owner,d.id,document,now).run()
      :await env.DB.prepare('UPDATE projects SET document=?,revision=revision+1,updated_at=? WHERE owner=? AND id=? AND revision=?').bind(document,now,owner,d.id,revision).run();
    if(!result.meta.changes)return json({error:'다른 창에서 수정된 디자인입니다. 새로고침 후 복사본으로 보관해 주세요.',conflict:true},409);
    return json({revision:revision+1,updated:now});
  }
  if(path==='/api/assets'&&req.method==='POST'){
    const type=req.headers.get('Content-Type')?.split(';')[0];
    if(!['image/png','image/jpeg','image/webp'].includes(type))return json({error:'PNG, JPG, WebP 이미지만 업로드할 수 있습니다.'},415);
    const bytes=await readBody(req,8*1024*1024);
    const png=bytes.length>8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
    const jpg=bytes.length>3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    const webp=bytes.length>12&&new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
    if(!(type==='image/png'&&png||type==='image/jpeg'&&jpg||type==='image/webp'&&webp))return json({error:'이미지 형식을 확인해 주세요.'},415);
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(owner)))).map(v=>v.toString(16).padStart(2,'0')).join('');
    const id=crypto.randomUUID(),key=hash+'/'+id;
    await env.FILES.put(key,bytes,{httpMetadata:{contentType:type}});
    try{await env.DB.prepare('INSERT INTO assets(id,owner,object_key,content_type,byte_size,created_at) VALUES(?,?,?,?,?,?)').bind(id,owner,key,type,bytes.length,Date.now()).run()}catch(e){await env.FILES.delete(key);throw e}
    return json({id,url:'/api/assets/'+id},201);
  }
  const asset=path.match(/^\/api\/assets\/([a-f0-9-]+)$/i);
  if(asset&&UUID.test(asset[1])&&['GET','HEAD'].includes(req.method)){
    const record=await env.DB.prepare('SELECT object_key,content_type FROM assets WHERE id=? AND owner=?').bind(asset[1],owner).first();
    if(!record)return json({error:'이미지를 찾을 수 없습니다.'},404);
    const object=await env.FILES.get(record.object_key);if(!object)return json({error:'이미지를 찾을 수 없습니다.'},404);
    return new Response(req.method==='HEAD'?null:object.body,{headers:{'Content-Type':record.content_type,'Content-Length':String(object.size),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
  return json({error:'지원하지 않는 요청입니다.'},404);
}

export default {async fetch(req,env){
  try{
    const user=await identity(req,env);
    const response=new URL(req.url).pathname.startsWith('/api/')?await api(req,env,user):await env.ASSETS.fetch(req);
    const headers=new Headers(response.headers);headers.set('Cache-Control','private, no-store');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');headers.set('X-Frame-Options','DENY');
    return new Response(response.body,{status:response.status,headers});
  }catch(e){return json({error:e.status?e.message:'저장 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'},e.status||500)}
}};
