/* Imported SVGs are rebuilt from an allowlist before ever entering the page. */
(()=>{
 const NS='http://www.w3.org/2000/svg';
 const tags=new Set('svg g defs rect circle ellipse line polyline polygon path text tspan image linearGradient radialGradient stop clipPath mask use title desc'.split(' '));
 const attrs=new Set('id x y x1 x2 y1 y2 cx cy r rx ry width height viewBox preserveAspectRatio d points transform fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset opacity font-family font-size font-weight font-style text-decoration text-anchor dominant-baseline letter-spacing dx dy offset stop-color stop-opacity gradientUnits gradientTransform spreadMethod fx fy fr clip-path clip-rule mask maskUnits maskContentUnits clipPathUnits display visibility'.split(' '));
 const paints=new Set('fill stroke clip-path mask'.split(' '));
 function clean(source){
  if(typeof source!=='string')throw Error('올바른 SVG 파일을 선택해 주세요.');
  if(/<!DOCTYPE|<!ENTITY/i.test(source))throw Error('외부 문서 선언이 포함된 SVG는 지원하지 않습니다.');
  const doc=new DOMParser().parseFromString(source,'image/svg+xml'),root=doc.documentElement;
  if(doc.querySelector('parsererror')||root.localName!=='svg')throw Error('올바른 SVG 파일을 선택해 주세요.');
  if(root.querySelectorAll('*').length>2000)throw Error('요소가 너무 많습니다. 2,000개 이하로 나누어 내보내 주세요.');
  // Illustrator often stores presentation attributes in simple CSS classes.
  const rules=[];for(const sheet of root.querySelectorAll('style')){
   if(/@|\\|url\s*\(/i.test(sheet.textContent))throw Error('외부 글꼴·복잡한 CSS는 지원하지 않습니다. SVG 스타일을 프레젠테이션 속성으로 내보내 주세요.');
   for(const match of sheet.textContent.matchAll(/([^{}]+)\{([^{}]*)\}/g))rules.push([match[1].trim(),match[2]]);
  }
  let omitted=0;
  function safeAttr(out,name,value){
   if(name==='filter'&&value!=='none')throw Error('SVG 필터 효과는 이미지로 변환한 뒤 다시 내보내 주세요.');
   if(!attrs.has(name))return;
   if(/[\\<>]/.test(value)||/javascript:|data:|https?:|expression\s*\(/i.test(value))throw Error('외부 참조 또는 지원하지 않는 속성이 포함되어 있습니다.');
   if(/url\s*\(/i.test(value)&&(!paints.has(name)||!/^url\(\s*['"]?#[\w:.-]+['"]?\s*\)$/.test(value)))throw Error('외부 리소스는 지원하지 않습니다. 이미지를 포함하여 내보내 주세요.');
   out.setAttribute(name,value);
  }
  function declarations(out,text){for(const part of text.split(';')){const colon=part.indexOf(':');if(colon>0)safeAttr(out,part.slice(0,colon).trim(),part.slice(colon+1).trim())}}
  function copy(node){
   if(node.nodeType===3)return document.createTextNode(node.data);
   if(node.nodeType!==1)return null;
   if(['style','metadata','desc'].includes(node.localName)){omitted++;return null;}
   if(!tags.has(node.localName))throw Error('지원하지 않는 SVG 요소: '+node.localName+' (필터 효과는 이미지로 변환해서 내보내 주세요.)');
   const out=document.createElementNS(NS,node.localName);
   for(const attr of node.attributes){if(attr.name==='href'||attr.name==='xlink:href'){
     const v=attr.value;if(!/^#[\w:.-]+$/.test(v)&&!(node.localName==='image'&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\s]+$/.test(v)))throw Error('외부 연결 이미지는 포함(Embed)한 뒤 다시 내보내 주세요.');out.setAttribute('href',v);
    }else safeAttr(out,attr.name,attr.value);}
   for(const [selector,body] of rules){try{if(node.matches(selector))declarations(out,body)}catch{throw Error('지원하지 않는 CSS 선택자가 있습니다.')}}
   declarations(out,node.getAttribute('style')||'');
   for(const child of node.childNodes){const next=copy(child);if(next)out.append(next)}return out;
  }
  const svg=copy(root);svg.setAttribute('xmlns',NS);
  const ids=new Map();for(const el of [svg,...svg.querySelectorAll('[id]')]){const id=el.getAttribute('id');if(!id)continue;if(ids.has(id))throw Error('중복된 SVG 요소 ID가 있습니다. 다시 내보내 주세요.');const next=id.startsWith('hp-import-')?id:'hp-import-'+id;ids.set(id,next);el.setAttribute('id',next)}
  for(const el of [svg,...svg.querySelectorAll('*')])for(const attr of [...el.attributes]){if(attr.name==='href'&&attr.value.startsWith('#')&&ids.has(attr.value.slice(1)))el.setAttribute('href','#'+ids.get(attr.value.slice(1)));else if(paints.has(attr.name)&&attr.value.startsWith('url('))el.setAttribute(attr.name,attr.value.replace(/#([\w:.-]+)/g,(_,id)=>'#'+(ids.get(id)||id)))}
  let vb=(svg.getAttribute('viewBox')||'').trim().split(/[ ,]+/).map(Number);
  if(vb.length!==4){const w=parseFloat(svg.getAttribute('width')),h=parseFloat(svg.getAttribute('height'));vb=[0,0,w,h];svg.setAttribute('viewBox',vb.join(' '));}
  if(!vb.every(Number.isFinite)||vb[2]<=0||vb[3]<=0||vb[2]>8192||vb[3]>8192)throw Error('SVG 크기는 1~8192px 범위여야 합니다.');
  svg.setAttribute('width',vb[2]);svg.setAttribute('height',vb[3]);
  return {svg,width:vb[2],height:vb[3],omitted};
 }
 const serialize=svg=>new XMLSerializer().serializeToString(svg);
 function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 async function open({source,name,onSave,onClose}){
  let parsed=clean(source),svg=parsed.svg,selected=null,drag=null;const undo=[],redo=[];
  const host=document.getElementById('app');host.innerHTML='<div class="sv-editor"><header><button data-back>← 내 작업</button><strong></strong><span role="status"></span><button data-undo>실행 취소</button><button data-redo>다시 실행</button><button data-save>저장</button><button data-svg>SVG 다운로드</button><button data-png>PNG 다운로드</button></header><main><aside><h3>가져온 요소</h3><p>텍스트·도형을 선택하세요. 그룹 효과와 이미지 내부 문구는 개별 편집되지 않습니다.</p><div data-layers></div></aside><section><div class="sv-stage" tabindex="0" aria-label="가져온 디자인 편집"><div class="sv-outline" hidden></div></div><p>드래그 또는 방향키: 이동 · Shift+방향키: 10px · Delete: 삭제 · Esc: 이동 취소</p></section><aside data-inspector><h3>요소 편집</h3><p data-empty>요소를 선택하세요.</p><div data-controls hidden><label>문구<input data-text aria-label="SVG 문구"></label><p data-text-hint>문구 변경 시 기존 줄바꿈·부분 서식은 한 줄로 합쳐집니다.</p><label>글자 크기<input type="number" min="1" max="500" data-font aria-label="SVG 글자 크기"></label><label>채우기 색상<input type="color" data-fill aria-label="SVG 채우기 색상"></label><label>불투명도<input type="range" min="0" max="1" step="0.05" data-opacity aria-label="SVG 불투명도"></label><button data-delete>선택 요소 삭제</button></div><h3>가져오기 안내</h3><p data-report></p><p>글자가 도형(윤곽선)이면 문구를 수정할 수 없습니다. 설치되지 않은 글꼴은 다르게 보일 수 있습니다.</p></aside></main></div>';
  const q=s=>host.querySelector(s),stage=q('.sv-stage'),outline=q('.sv-outline'),notice=q('[role=status]');q('strong').textContent=name||'가져온 디자인';
  function message(s){notice.textContent=s}
  function snapshot(){return serialize(svg)}let current=snapshot(),saved=current;
  function elements(){return [...svg.querySelectorAll('text,path,rect,circle,ellipse,line,polyline,polygon,image,use')].filter(n=>!n.closest('defs,clipPath,mask'))}
  function frame(){if(!selected||!selected.isConnected){outline.hidden=true;return}const a=selected.getBoundingClientRect(),b=stage.getBoundingClientRect();outline.hidden=false;Object.assign(outline.style,{left:a.left-b.left+stage.scrollLeft+'px',top:a.top-b.top+stage.scrollTop+'px',width:a.width+'px',height:a.height+'px'})}
  function select(el){selected=el;q('[data-empty]').hidden=!!el;q('[data-controls]').hidden=!el;frame();if(!el)return;const text=el.localName==='text';q('[data-text]').parentElement.hidden=!text;q('[data-text-hint]').hidden=!text;q('[data-font]').parentElement.hidden=!text;q('[data-text]').value=el.textContent;q('[data-font]').value=parseFloat(getComputedStyle(el).fontSize)||16;const color=el.getAttribute('fill')||'#000000';q('[data-fill]').value=/^#[a-f0-9]{6}$/i.test(color)?color:'#000000';q('[data-opacity]').value=el.getAttribute('opacity')||1;}
  function layers(){q('[data-layers]').replaceChildren();elements().forEach((el,i)=>{const button=document.createElement('button');button.textContent=(el.localName==='text'?el.textContent:el.id||el.localName).slice(0,45)||'요소 '+(i+1);button.onclick=()=>select(el);q('[data-layers]').append(button)});q('[data-undo]').disabled=!undo.length;q('[data-redo]').disabled=!redo.length;}
  function commit(){const next=snapshot();if(next!==current){undo.push(current);if(undo.length>40)undo.shift();redo.length=0;current=next;message('변경됨 · 저장 버튼을 눌러 주세요.')}layers();frame()}
  function mount(){stage.querySelector('svg')?.remove();stage.prepend(svg);svg.style.maxWidth='100%';svg.style.height='auto';select(null);layers();current=snapshot();}
  // The display style is not persisted in exported artwork.
  mount();current=snapshot();saved=current;
  q('[data-report]').textContent=parsed.width+' × '+parsed.height+'px · 요소 '+elements().length+'개 · 편집 가능한 텍스트 '+elements().filter(e=>e.localName==='text').length+'개';
  const observer=new ResizeObserver(frame);observer.observe(stage);
  const cleanup=()=>{observer.disconnect();window.removeEventListener('beforeunload',unload)};
  function unload(e){if(current!==saved){e.preventDefault();e.returnValue=''}}window.addEventListener('beforeunload',unload);
  q('[data-back]').onclick=()=>{if(current!==saved&&!confirm('저장하지 않은 변경을 버리고 나갈까요?'))return;cleanup();onClose()};
  async function save(){try{const safe=clean(snapshot());await onSave(serialize(safe.svg));saved=current;message('저장 완료')}catch(e){message(e.message)}}q('[data-save]').onclick=save;
  for(const [selector,attr] of [['[data-fill]','fill'],['[data-opacity]','opacity'],['[data-font]','font-size']])q(selector).onchange=e=>{if(!selected)return;const value=e.target.value;if(attr==='font-size'&&!(+value>0&&+value<=500))return;selected.setAttribute(attr,value);if(selected.localName==='text')selected.querySelectorAll('tspan').forEach(n=>n.removeAttribute(attr));commit()};
  q('[data-text]').onchange=e=>{if(selected?.localName!=='text')return;const first=selected.querySelector('tspan');if(first){for(const attr of ['x','y'])if(first.hasAttribute(attr)&&!selected.hasAttribute(attr))selected.setAttribute(attr,first.getAttribute(attr))}selected.textContent=e.target.value;commit()};
  const remove=()=>{if(!selected)return;selected.remove();select(null);commit()};q('[data-delete]').onclick=remove;
  function travel(back){const from=back?undo:redo,to=back?redo:undo;if(!from.length)return;to.push(current);svg=clean(from.pop()).svg;mount();message('변경됨 · 저장 버튼을 눌러 주세요.')}
  q('[data-undo]').onclick=()=>travel(true);q('[data-redo]').onclick=()=>travel(false);
  function delta(el,dx,dy,base){const m=el.parentNode.getScreenCTM().inverse(),a=new DOMPoint(0,0).matrixTransform(m),b=new DOMPoint(dx,dy).matrixTransform(m);el.setAttribute('transform','translate('+(b.x-a.x)+' '+(b.y-a.y)+') '+base)}
  function finish(cancel){if(!drag)return;if(cancel)selected.setAttribute('transform',drag.base);const id=drag.id;drag=null;if(stage.hasPointerCapture(id))stage.releasePointerCapture(id);if(!cancel)commit();frame()}
  stage.onpointerdown=e=>{if(e.button!==0)return;const el=elements().find(n=>n===e.target||n.contains(e.target));select(el||null);stage.focus();if(!el)return;e.preventDefault();drag={x:e.clientX,y:e.clientY,base:el.getAttribute('transform')||'',id:e.pointerId};stage.setPointerCapture(e.pointerId)};
  stage.onpointermove=e=>{if(!drag)return;delta(selected,e.clientX-drag.x,e.clientY-drag.y,drag.base);frame()};stage.onpointerup=()=>finish(false);stage.onpointercancel=()=>finish(true);stage.onlostpointercapture=()=>finish(true);
  stage.onkeydown=e=>{if(e.key==='Escape'){finish(true);return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();travel(!e.shiftKey);return}if(!selected)return;if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();return}const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(dirs[e.key]){e.preventDefault();const [x,y]=dirs[e.key],rect=svg.getBoundingClientRect(),step=e.shiftKey?10:1;delta(selected,x*step*rect.width/parsed.width,y*step*rect.height/parsed.height,selected.getAttribute('transform')||'');commit()}};
  q('[data-svg]').onclick=()=>{try{download(new Blob([serialize(clean(snapshot()).svg)],{type:'image/svg+xml'}),'hanpass-design.svg')}catch(e){message(e.message)}};
  HanpassSvgTranslations.bind({host:q('[data-inspector]'),getSvg:()=>svg,commit,select,message});
  q('[data-png]').onclick=async()=>{const button=q('[data-png]');button.disabled=true;let url;try{if(parsed.width*parsed.height>24000000)throw Error('PNG는 2,400만 픽셀 이하만 지원합니다. SVG로 내려받아 주세요.');await document.fonts.ready;url=URL.createObjectURL(new Blob([serialize(clean(snapshot()).svg)],{type:'image/svg+xml'}));const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url});const canvas=document.createElement('canvas');canvas.width=Math.ceil(parsed.width);canvas.height=Math.ceil(parsed.height);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve));if(!blob)throw Error('PNG를 만들지 못했습니다.');download(blob,'hanpass-design.png');message('PNG 다운로드 완료')}catch(e){message(e.message||'PNG 변환에 실패했습니다. SVG로 내려받아 주세요.')}finally{if(url)URL.revokeObjectURL(url);button.disabled=false}};
 }
 window.HanpassSvg={clean,open,serialize};
})();
