/* Large SVG bodies live outside localStorage and project JSON. */
(()=>{
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 const db=new Promise((resolve,reject)=>{const request=indexedDB.open('hanpass-design-files',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('이 브라우저에서 파일 저장소를 열 수 없습니다.'))});
 async function store(blob,key){const database=await db;await new Promise((resolve,reject)=>{const tx=database.transaction('files','readwrite');tx.objectStore('files').put(blob,key);tx.oncomplete=resolve;tx.onerror=()=>reject(Error('브라우저 저장 공간이 부족합니다. 원본 파일을 내려받아 보관해 주세요.'));tx.onabort=()=>reject(Error('파일 저장이 취소되었습니다.'))})}
 async function save(source){
  const blob=new Blob([source],{type:'application/octet-stream'}),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))).map(n=>n.toString(16).padStart(2,'0')).join('');
  if(local){await store(blob,hash);return 'idb:'+hash}
  const response=await fetch('/api/design-files',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:blob,redirect:'error'});
  if(!response.ok)throw Error(response.status===413?'서버가 처리할 수 있는 업로드 크기를 초과했습니다. 디자인을 나누어 올려 주세요.':'원본 저장에 실패했습니다. 로그인과 네트워크를 확인해 주세요.');
  return (await response.json()).url;
 }
 async function load(ref){if(ref.startsWith('idb:')){const database=await db;const blob=await new Promise((resolve,reject)=>{const tx=database.transaction('files'),request=tx.objectStore('files').get(ref.slice(4));request.onsuccess=()=>resolve(request.result);request.onerror=reject});if(!blob)throw Error('이 브라우저에서 원본 파일을 찾을 수 없습니다. 다시 업로드해 주세요.');return blob.text()}
  if(!/^\/api\/assets\/[a-f0-9-]+$/i.test(ref))throw Error('올바르지 않은 원본 경로입니다.');const response=await fetch(ref,{redirect:'error'});if(!response.ok)throw Error('원본 파일을 불러오지 못했습니다.');return response.text();
 }
 window.HanpassDesignStorage={save,load};
})();
