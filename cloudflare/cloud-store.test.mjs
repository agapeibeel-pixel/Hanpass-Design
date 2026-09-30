import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/cloud-store.js',import.meta.url),'utf8');
function boot(handler,storage=new Map()){
  const timers=[];
  const context=vm.createContext({window:{},location:{hostname:'studio.example'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},fetch:async(url,options)=>{
    if(url==='/api/session')return Response.json({email:'one@hanpass.com',storage:'cloudflare'});
    return handler(url,options);
  },AbortSignal,structuredClone,Map,JSON,Error,Object,setTimeout:fn=>{timers.push(fn);return timers.length},clearTimeout:()=>{},addEventListener:()=>{}});
  vm.runInContext(source,context);return {ready:context.window.HanpassCloud,timers,storage};
}
const doc={id:'11111111-1111-4111-8111-111111111111',format:0,theme:5,title:'첫 문구',desc:'설명',image:'',updated:1};
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));
test('client loads server data and sends the correct revision',async()=>{
  const sent=[];const b=boot(async(url,options)=>{if(!options?.method)return Response.json({projects:[{document:doc,revision:3}]});sent.push(JSON.parse(options.body));return Response.json({revision:4})});
  const client=await b.ready;assert.equal((await client.load()).length,1);client.save({...doc,title:'수정'});await tick();
  assert.equal(sent[0].revision,3);assert.equal(sent[0].document.title,'수정');
  assert.equal(b.storage.get('hanpass-cloud:one@hanpass.com:pending'),'{}');
});
test('failed network save survives reload in a per-user pending queue',async()=>{
  const b=boot(async(url,options)=>{if(!options?.method)return Response.json({projects:[]});throw Error('offline')});
  const client=await b.ready;await client.load();client.save(doc);await tick();
  const queue=JSON.parse(b.storage.get('hanpass-cloud:one@hanpass.com:pending'));assert.equal(queue[doc.id].document.title,doc.title);
  const reloaded=await boot(async()=>Response.json({projects:[]}),b.storage).ready;
  assert.equal((await reloaded.load())[0].title,doc.title);
});
test('client keeps conflict data instead of overwriting the server',async()=>{
  let writes=0;const b=boot(async(url,options)=>{if(!options?.method)return Response.json({projects:[]});writes++;return Response.json({error:'conflict'},{status:409})});
  const client=await b.ready;await client.load();client.save(doc);await tick();client.save({...doc,title:'또 수정'});await tick();
  assert.equal(writes,1);const queue=JSON.parse(b.storage.get('hanpass-cloud:one@hanpass.com:pending'));assert.equal(queue[doc.id].blocked,true);assert.equal(queue[doc.id].document.title,'또 수정');
});
