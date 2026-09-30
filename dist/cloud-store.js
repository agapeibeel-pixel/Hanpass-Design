/* Cloudflare persistence; local preview continues to work without a server. */
window.HanpassCloud=(async()=>{
  const local=['localhost','127.0.0.1'].includes(location.hostname)||location.hostname.endsWith('.chatgpt.site');
  let session;
  try{const r=await fetch('/api/session',{redirect:'error',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();session=await r.json();if(session.storage!=='cloudflare')throw Error()}
  catch{if(local)return null;throw Error('팀 로그인 또는 서버 연결을 확인한 뒤 새로고침해 주세요.')}
  const key='hanpass-cloud:'+session.email, revisions={}, pending=JSON.parse(localStorage.getItem(key+':pending')||'{}');
  const uploaded=new Map(), fingerprints=new Map();let running=false,listener=()=>{},retry;
  const fingerprint=d=>JSON.stringify({...d,updated:0});
  async function request(url,options={}){
    const r=await fetch(url,{...options,redirect:'error',signal:AbortSignal.timeout(30000)});
    const body=await r.json().catch(()=>({error:'로그인이 만료되었거나 서버에 연결할 수 없습니다.'}));
    if(!r.ok)throw Object.assign(Error(body.error||'저장하지 못했습니다.'),{status:r.status});return body;
  }
  const persist=()=>localStorage.setItem(key+':pending',JSON.stringify(pending));
  async function run(){
    if(running)return;clearTimeout(retry);retry=null;running=true;
    try{
      for(const id of Object.keys(pending)){
        const item=pending[id];if(item.blocked)continue;
        listener('클라우드에 저장 중…');
        const doc=structuredClone(item.document);
        try{
          if(doc.image?.startsWith('data:')){
            const source=doc.image;
            if(!uploaded.has(source)){
              const blob=await (await fetch(source)).blob();
              const asset=await request('/api/assets',{method:'POST',headers:{'Content-Type':blob.type},body:blob});uploaded.set(source,asset.url);
            }
            doc.image=uploaded.get(source);
          }
          const result=await request('/api/projects/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({document:doc,revision:item.revision})});
          revisions[id]=result.revision;
          if(pending[id]===item)delete pending[id];else pending[id].revision=result.revision;
          if(!pending[id])fingerprints.set(id,fingerprint(doc));persist();listener('클라우드에 저장됨',doc,result,item.document);
        }catch(e){
          if(e.status===409){item.blocked=true;persist();listener('저장 충돌 · 복사해서 만들기로 보관해 주세요.');continue}
          listener('클라우드 저장 대기 · 이 브라우저에 보관 중');retry=setTimeout(run,15000);break;
        }
      }
    }finally{running=false;if(Object.values(pending).some(x=>!x.blocked)&&!retry)retry=setTimeout(run,1000)}
  }
  addEventListener('online',run);
  addEventListener('beforeunload',e=>{if(Object.keys(pending).length){e.preventDefault();e.returnValue=''}});
  return {
    email:session.email,key,
    async load(){
      const data=await request('/api/projects');
      for(const row of data.projects){revisions[row.document.id]=row.revision;fingerprints.set(row.document.id,fingerprint(row.document))}
      const docs=new Map(data.projects.map(row=>[row.document.id,row.document]));
      for(const [id,item] of Object.entries(pending))docs.set(id,item.document);
      return [...docs.values()].sort((a,b)=>(b.updated||0)-(a.updated||0));
    },
    listen(fn){listener=fn;run()},
    save(document){
      const old=pending[document.id];
      if(!old&&fingerprints.get(document.id)===fingerprint(document))return;
      pending[document.id]={document:structuredClone(document),revision:old?.revision??revisions[document.id]??0,blocked:old?.blocked||false};
      persist();run();
    }
  };
})();
