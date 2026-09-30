import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker,{api,identity,validateDocument} from './platform.mjs';
const owner={email:'one@hanpass.com'},other={email:'two@hanpass.com'};
const id='11111111-1111-4111-8111-111111111111';
const document={id,format:0,theme:5,title:'테스트',desc:'설명',image:''};
function environment(){
  const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('./migrations/0001_projects.sql',import.meta.url),'utf8'));
  const objects=new Map();
  return {DB:{prepare(query){return {bind(...params){const stmt=sql.prepare(query);return {first:async()=>stmt.get(...params),all:async()=>({results:stmt.all(...params)}),run:async()=>({meta:stmt.run(...params)})}}}}},FILES:{put:async(k,v)=>{const bytes=v instanceof ReadableStream?new Uint8Array(await new Response(v).arrayBuffer()):v;objects.set(k,bytes);return {size:bytes.length}},get:async k=>objects.has(k)?{body:objects.get(k),size:objects.get(k).length}:null,delete:async k=>objects.delete(k)},sql};
}
const req=(path,method='GET',body,origin='https://studio.example')=>new Request('https://studio.example'+path,{method,headers:{Origin:origin,'Content-Type':'application/json'},body:body&&JSON.stringify(body)});
test('unconfigured and unauthenticated requests fail closed',async()=>{
  assert.equal((await worker.fetch(req('/index.html'),{})).status,503);
  await assert.rejects(identity(req('/'),{ACCESS_TEAM_DOMAIN:'team.cloudflareaccess.com',ACCESS_AUD:'aud'}),e=>e.status===401);
});
test('forged identity header is never accepted',async()=>{
  const r=new Request('https://studio.example/api/projects',{headers:{'Cf-Access-Authenticated-User-Email':owner.email}});
  assert.equal((await worker.fetch(r,{ACCESS_TEAM_DOMAIN:'team.cloudflareaccess.com',ACCESS_AUD:'aud',ALLOWED_EMAIL_DOMAIN:'hanpass.com'})).status,401);
});
test('projects persist across reads and stay private to the owner',async()=>{
  const env=environment();assert.equal((await api(req('/api/projects/'+id,'PUT',{document,revision:0}),env,owner)).status,200);
  assert.equal((await (await api(req('/api/projects'),env,owner)).json()).projects[0].document.title,'테스트');
  assert.equal((await (await api(req('/api/projects'),env,other)).json()).projects.length,0);
});
test('editable SVG source round-trips with project and validates source references',async()=>{
  const env=environment(),svgDesign='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="284"><text>편집 가능한 문구</text></svg>';
  assert.equal((await api(req('/api/projects/'+id,'PUT',{document:{...document,svgDesign},revision:0}),env,owner)).status,200);
  const saved=(await (await api(req('/api/projects'),env,owner)).json()).projects[0].document;
  assert.equal(saved.svgDesign,svgDesign);
  assert.throws(()=>validateDocument({...document,svgRef:'https://example.com/design.svg'},id));
});
test('large originals stream to private storage and use small project references',async()=>{
  const env=environment(),body=new Uint8Array(5*1024*1024);
  const result=await api(new Request('https://studio.example/api/design-files',{method:'POST',headers:{Origin:'https://studio.example','Content-Type':'application/octet-stream'},body}),env,owner);
  assert.equal(result.status,201);const {url}=await result.json();
  const file=await api(req(url),env,owner);assert.equal(file.status,200);assert.equal((await file.arrayBuffer()).byteLength,body.length);
  assert.match(file.headers.get('Content-Disposition'),/attachment/);
  assert.equal((await api(req(url),env,other)).status,404);
  assert.equal((await api(req('/api/projects/'+id,'PUT',{document:{...document,svgRef:url},revision:0}),env,other)).status,403);
  assert.equal((await api(req('/api/projects/'+id,'PUT',{document:{...document,svgRef:url},revision:0}),env,owner)).status,200);
});
test('stale saves cannot overwrite a newer revision',async()=>{
  const env=environment();await api(req('/api/projects/'+id,'PUT',{document,revision:0}),env,owner);
  assert.equal((await api(req('/api/projects/'+id,'PUT',{document:{...document,title:'새 문구'},revision:1}),env,owner)).status,200);
  assert.equal((await api(req('/api/projects/'+id,'PUT',{document,revision:1}),env,owner)).status,409);
  assert.equal((await (await api(req('/api/projects'),env,owner)).json()).projects[0].document.title,'새 문구');
});
test('cross-origin mutations and remote image references rejected',async()=>{
  const env=environment();assert.equal((await api(req('/api/projects/'+id,'PUT',{document,revision:0},'https://evil.example'),env,owner)).status,403);
  assert.throws(()=>validateDocument({...document,image:'https://evil.example/file'},id));
});
test('R2 upload and retrieval enforce image type and asset ownership',async()=>{
  const env=environment();
  const upload=new Request('https://studio.example/api/assets',{method:'POST',headers:{Origin:'https://studio.example','Content-Type':'image/png'},body:new Uint8Array([137,80,78,71,13,10,26,10,0])});
  const r=await api(upload,env,owner);assert.equal(r.status,201);const {url}=await r.json();
  assert.equal((await api(req(url),env,owner)).status,200);
  assert.equal((await api(req(url),env,other)).status,404);
  assert.equal((await api(req('/api/projects/'+id,'PUT',{document:{...document,image:url},revision:0}),env,other)).status,403);
  const bad=new Request('https://studio.example/api/assets',{method:'POST',headers:{Origin:'https://studio.example','Content-Type':'image/png'},body:'not an image'});
  assert.equal((await api(bad,env,owner)).status,415);
});
