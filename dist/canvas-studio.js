// Local prototype canvas. No server upload, AI generation, or file rendering is implied.
const studio={tab:'design',selected:null,safe:true,zoom:100,collapsed:false,colorTarget:'background',past:[],future:[],filter:'전체',query:'',uploads:[],saving:false};
const studioPalette=[{name:'블루',value:'#2864EE'},{name:'네이비',value:'#183B80'},{name:'스카이',value:'#48C7F0'},{name:'오렌지',value:'#FF8B35'},{name:'화이트',value:'#FFFFFF'}];
const studioGradients=['linear-gradient(145deg,#2864EE,#B8E9FF)','linear-gradient(145deg,#48C7F0,#E2FBFF)','linear-gradient(145deg,#FF8B35,#FFF0C9)','linear-gradient(145deg,#183B80,#2864EE)'];
const studioTemplates=[['promotion','혜택 강조','큰 제목과 혜택'],['notice','깔끔한 공지','설명과 일정'],['education','정보 카드','두 가지 내용을 나란히'],['promotion','이미지 중심','이미지와 짧은 문구']];
function currentScene(){return camp().canvasScenes?.[state.size]}
function nodeDefaults(id,kind,x,y,w,h,extra={}){return {id,kind,x,y,w,h,text:'',font:6,color:'#183B80',align:'left',...extra}}
function makeScene(c,layout=0,spec=state.size,blank=false){const d=c.data,wide=sizes[spec].w/sizes[spec].h>1.7;const nodes=[nodeDefaults('brand','text',7,5,50,8,{text:'hanpass',font:4.2,weight:800,color:'#183B80',locked:true}),nodeDefaults('legal','text',7,91,86,6,{text:d.note||'샘플 디자인 · 실제 게시 전 검수 필요',font:1.7,color:'#60738F',locked:true})];if(!blank){nodes.push(nodeDefaults('title','text',7,wide?21:19,layout===3?53:86,wide?25:24,{text:d.title||'전하고 싶은 소식을\n입력해 주세요',font:wide?4:7.5,weight:800}));nodes.push(nodeDefaults('description','text',7,wide?53:45,layout===3?48:86,18,{text:d.desc||'설명을 입력해 주세요',font:wide?2.7:3.5,weight:400}));if(layout===0){nodes.push(nodeDefaults('benefit','box',7,wide?72:68,70,wide?13:17,{text:d.amount?d.amount+'원':d.short||'특별한 혜택을 알려 주세요',font:wide?3.5:6,fill:'#FFFFFF',color:'#2864EE',weight:800}));}else if(layout===1){nodes.push(nodeDefaults('period','box',7,wide?75:71,85,wide?12:16,{text:d.period||'일정 또는 중요한 안내를 입력해 주세요',font:wide?2.5:3.2,fill:'#FFFFFF',color:'#425877'}));}else if(layout===2){const cs=d.cards||[{title:'첫 번째 안내',desc:'내용을 입력해 주세요'},{title:'두 번째 안내',desc:'내용을 입력해 주세요'}];nodes.find(n=>n.id==='title').font=wide?4.5:6;nodes.find(n=>n.id==='description').y=wide?42:42;for(let i=0;i<2;i++)nodes.push(nodeDefaults('card'+i,'box',7+i*44,wide?62:61,41,wide?25:26,{text:(cs[i]?.title||'안내')+'\n'+(cs[i]?.desc||''),font:wide?2.1:3.1,fill:'#FFFFFF'}));}else{nodes.push(nodeDefaults('visual','art',64,wide?25:38,30,wide?55:40,{art:'transport'}));nodes.push(nodeDefaults('period','text',7,79,85,8,{text:d.period||'행사 기간을 입력해 주세요',font:2.5}));}}return {background:'#EAF1FF',layout,blank,nodes}}
function ensureScene(){if(!camp().canvasScenes)camp().canvasScenes={};if(!currentScene())camp().canvasScenes[state.size]=makeScene(camp(),camp().canvasLayout||0);return currentScene()}
function sceneHTML(scene,interactive=false,spec=state.size){return `<div class="studio-sheet ${interactive&&studio.safe?'safe-on':''}" ${interactive?'id="studioSheet"':''} style="background:${scene.background};aspect-ratio:${sizes[spec].w}/${sizes[spec].h}" role="group" aria-label="배너 캔버스">${scene.nodes.map(n=>`<div class="studio-node ${n.locked?'locked-node':''} ${interactive&&studio.selected===n.id?'node-selected':''}" data-node="${esc(n.id)}" data-kind="${n.kind}" ${interactive?`tabindex="0" role="button" aria-label="${esc(n.locked?'보호된 '+n.id:n.kind==='image'?'이미지':n.text||'디자인 요소')}"`:''} style="left:${n.x}%;top:${n.y}%;width:${n.w}%;height:${n.h}%;font-size:${n.font}cqw;font-weight:${n.weight||600};color:${n.color};text-align:${n.align};${n.kind==='box'?'background:'+n.fill+';border-radius:10px;padding:2%;':''}">${n.kind==='image'?`<img src="${n.src}" alt="업로드한 이미지" draggable="false" style="object-fit:${n.fit||'contain'}">`:n.kind==='art'?cropArt(n.art):studioTextHTML(n)}${interactive&&studio.selected===n.id&&!n.locked?['nw','ne','sw','se','w','e'].map(h=>`<span class="studio-resize handle-${h}" data-resize="${h}" aria-hidden="true"></span>`).join(''):''}${interactive&&studio.selected===n.id?`<span class="node-label">${n.locked?'🔒 보호 영역':'드래그로 이동 · 모서리로 크기 조절'}</span>`:''}</div>`).join('')}${interactive?'<span class="studio-guide"></span>':''}</div>`}
function captureStudio(){studio.past.push(structuredClone(ensureScene()));if(studio.past.length>40)studio.past.shift();studio.future=[]}
function changedStudio(){state.approved={};state.requested=false;camp().status='수정 필요';state.version++;state.save='저장 중…';studio.saving=true;clearTimeout(studio.timer);studio.timer=setTimeout(()=>{state.save='현재 세션에 저장됨';studio.saving=false;camp().workflow=snapshot();if($('#studioSave'))$('#studioSave').textContent='✓ '+state.save},550);if($('#studioSave'))$('#studioSave').textContent='◌ 저장 중…'}
function selectedNode(){return ensureScene().nodes.find(n=>n.id===studio.selected)}
function updateNode(values){const n=selectedNode();if(!n||n.locked)return;captureStudio();Object.assign(n,values);if(n.id==='title')camp().data.title=n.text;if(n.id==='description')camp().data.desc=n.text;if(n.id==='period')camp().data.period=n.text;changedStudio();paintStudio()}
function paintStudio(){const host=$('#sheetHost');if(host){host.innerHTML=sceneHTML(ensureScene(),true);host.style.setProperty('--zoom',studio.zoom/100);wireStudioSheet()}if($('#undoStudio'))$('#undoStudio').disabled=!studio.past.length;if($('#redoStudio'))$('#redoStudio').disabled=!studio.future.length;const n=selectedNode();if($('#selectionName'))$('#selectionName').textContent=n?n.locked?'보호된 브랜드 요소':n.kind==='text'||n.kind==='box'?'텍스트 선택됨':'이미지 선택됨':'요소를 선택하세요'}
function studioPanel(){const scene=ensureScene();if(studio.tab==='design')return `<h2>디자인</h2><p>배치를 바꿔도 입력한 문구는 유지돼요.</p><input id="studioSearch" placeholder="디자인 검색" value="${esc(studio.query)}"><div class="studio-chips">${['전체','이벤트','공지','콘텐츠'].map(t=>`<button data-studio-filter="${t}" class="${studio.filter===t?'active':''}">${t}</button>`).join('')}</div><div class="studio-template-grid">${studioTemplates.map((t,i)=>({t,i})).filter(({t})=>(studio.filter==='전체'||{이벤트:'promotion',공지:'notice',콘텐츠:'education'}[studio.filter]===t[0])&&t[1].includes(studio.query)).map(({t,i})=>`<button data-studio-layout="${i}" class="${scene.layout===i&&!scene.blank?'chosen':''}"><div class="studio-template-preview">${sceneHTML(makeScene(camp(),i))}</div><b>${t[1]}</b><small>${t[2]}</small></button>`).join('')}</div><button id="blankStudio" class="studio-wide">＋ 빈 화면으로 시작</button><div class="studio-panel-note">모든 디자인은 편집 가능한 샘플입니다.<br>새 디자인으로 바꾸기 전 문구를 확인하세요.</div>`;
if(studio.tab==='text'){const n=selectedNode();return `<h2>텍스트</h2><p>캔버스의 문구를 클릭해서 수정하세요.</p><button id="addStudioHeading" class="studio-wide"><b style="font-size:20px">＋ 제목 추가</b></button><button id="addStudioText" class="studio-wide">＋ 본문 추가</button><div class="sectionline"></div>${n&&!n.locked&&['text','box'].includes(n.kind)?`${studioTypographyPanel(n)}<label class="field">선택한 문구<textarea id="studioText" rows="5">${esc(n.text)}</textarea></label><label class="field">글자 크기<input type="range" id="studioFontRange" min="1.8" max="12" step="0.2" value="${n.font}"></label><small>템플릿 기준 상대 크기 · ${Math.round(n.font*sizes[state.size].w/100)}px</small>${studioTextEffects(n)}`:'<div class="studio-panel-note">수정할 제목이나 본문을 먼저 선택하세요.</div>'}<details class="sectionspace"><summary>필수 안내 문구 변경</summary><p class="footnote">위치와 스타일은 보호됩니다. 내용 변경 시 재검수가 필요해요.</p><textarea id="studioLegal">${esc(scene.nodes.find(n=>n.id==='legal')?.text||'')}</textarea><button class="small" id="applyStudioLegal">안내 문구 적용</button></details>`;}
if(studio.tab==='image')return `<h2>이미지·요소</h2><p>필요한 소재를 클릭해 추가하세요.</p><div class="studio-assets">${[['transport','교통 서비스'],['ticket','쿠폰·혜택'],['scam','사기 예방'],['phone','모바일 안내']].map(([id,n])=>`<button data-studio-art="${id}"><div>${cropArt(id)}</div><small>${n}</small></button>`).join('')}</div><div class="studio-panel-note">제공된 참고 이미지에서 가져온 데모 소재입니다. 신규 이미지 생성은 연결되지 않았어요.</div><button id="addStudioBox" class="studio-wide">＋ 혜택 박스 추가</button>`;
if(studio.tab==='upload')return `<h2>업로드</h2><p>사진이나 일러스트를 직접 사용하세요.</p><label class="studio-upload">＋ 이미지 업로드<input type="file" id="studioUpload" accept="image/*" multiple></label><div class="studio-assets">${studio.uploads.map((x,i)=>`<button data-studio-upload="${i}"><img src="${x.src}" alt="${esc(x.name)}"><small>${esc(x.name)}</small></button>`).join('')}</div>${!studio.uploads.length?'<div class="studio-upload-empty">아직 업로드한 이미지가 없어요.<br>PNG·JPG·WebP 등을 올려 주세요.</div>':''}<div class="studio-panel-note">현재 브라우저 세션에서만 사용되며<br>외부 서버로 전송하지 않습니다.</div>`;
return `<h2>배경·색상</h2><p>원하는 색상을 누르면 바로 적용돼요.</p><span class="badge warn">임시 팔레트 · 브랜드 확인 전</span><label class="field sectionspace">적용 범위<select id="studioColorTarget"><option value="background" ${studio.colorTarget==='background'?'selected':''}>배경만 변경</option><option value="all" ${studio.colorTarget==='all'?'selected':''}>디자인 전체 색상 변경</option><option value="selected" ${studio.colorTarget==='selected'?'selected':''}>선택한 요소 색상 변경</option></select></label><h3>기본색 5개</h3><div class="studio-swatches">${studioPalette.map((p,i)=>`<button data-studio-color="${i}" aria-label="${p.name} ${p.value}" style="background:${p.value}"><span>${p.name}</span></button>`).join('')}</div><h3 class="sectionspace">그라데이션</h3><div class="studio-gradients">${studioGradients.map((g,i)=>`<button data-studio-gradient="${i}" style="background:${g}" aria-label="그라데이션 ${i+1}"></button>`).join('')}</div><h3 class="sectionspace">밝은 배경</h3><div class="studio-swatches">${['#EAF1FF','#EDF4FA','#E8FAFF','#FFF1E4','#F5F6F8'].map(c=>`<button data-studio-light="${c}" style="background:${c}" aria-label="밝은 배경 ${c}"></button>`).join('')}</div><div class="studio-panel-note">전체 색상 변경에서도 로고와 사진은 유지돼요. 공식 5색과 그라데이션은 확인 후 교체할 수 있습니다.</div>`}
function studioView(){ensureScene();const n=selectedNode();return `<div class="studio-app"><header class="studio-header"><button class="ghost" id="studioHome" aria-label="홈으로">←</button><b class="studio-logo">hanpass<span>CREATIVE STUDIO</span></b><input id="studioName" value="${esc(camp().name)}" aria-label="작업 이름"><span id="studioSave">✓ ${state.save==='모든 변경사항 저장됨'?'현재 세션에 저장됨':state.save}</span><div class="grow"></div><button id="undoStudio" ${!studio.past.length?'disabled':''} aria-label="실행 취소">↶</button><button id="redoStudio" ${!studio.future.length?'disabled':''} aria-label="다시 실행">↷</button><button id="saveStudio">저장</button><button class="primary" id="reviewStudio">검수 요청 →</button></header><div class="studio-body"><nav class="studio-rail" aria-label="편집 도구">${[['design','template','디자인'],['text',null,'텍스트'],['image','assets','이미지'],['upload',null,'업로드'],['color','settings','배경·색상']].map(([id,ic,title])=>`<button data-studio-tab="${id}" class="${studio.tab===id?'active':''}">${ic?icon(ic):`<span>${id==='text'?'T':'↥'}</span>`}<small>${title}</small></button>`).join('')}<button id="studioMyWork" class="rail-bottom">${icon('campaign')}<small>내 작업</small></button></nav><aside class="studio-side ${studio.collapsed?'side-collapsed':''}">${studioPanel()}</aside><section class="studio-workspace"><div class="studio-context"><button id="collapseStudio" title="보조 패널 접기">☷</button><span id="selectionName">${n?n.locked?'보호된 브랜드 요소':'선택한 요소':'요소를 선택하세요'}</span>${n&&!n.locked?`<div class="studio-context-controls">${['text','box'].includes(n.kind)?`<button id="studioBold" class="${n.weight===800?'active':''}" aria-label="굵게"><b>B</b></button><select id="studioAlign" aria-label="글자 정렬">${[['left','왼쪽'],['center','가운데'],['right','오른쪽']].map(([v,label])=>`<option value="${v}" ${n.align===v?'selected':''}>${label}</option>`).join('')}</select>`:''}<label>크기 <input id="studioWidth" type="range" min="10" max="86" value="${n.w}" aria-label="요소 너비"></label><button id="duplicateStudioNode">복제</button><button id="deleteStudioNode">삭제</button></div>`:''}<span class="grow"></span><select id="studioSpec" aria-label="출력 규격">${sizes.slice(0,4).map((s,i)=>`<option value="${i}" ${state.size===i?'selected':''}>${s.name} · ${s.w}×${s.h}${s.example?' (예시)':''}</option>`).join('')}</select></div><div class="studio-stage"><div class="studio-page-label"><span>${sizes[state.size].name}</span><span>${sizes[state.size].w} × ${sizes[state.size].h}px · ${sizes[state.size].example?'예시 규격':'등록 규격'}</span></div><div id="sheetHost" class="sheet-host" style="--zoom:${studio.zoom/100};--sheet-ratio:${sizes[state.size].w}/${sizes[state.size].h}">${sceneHTML(ensureScene(),true)}</div><div id="studioOverlap" class="studio-overlap" role="status"></div><p class="studio-stage-help">클릭해서 선택 · 모서리 드래그로 크기 조절 · 양옆 핸들로 너비 조절 · Delete로 삭제</p></div><footer class="studio-bottom"><span>데모 · 현재 세션 저장 / 파일 생성 미연결</span><div class="grow"></div><button id="studioSafe" class="${studio.safe?'active':''}">▣ 안전 여백</button><button id="studioZoomOut" aria-label="축소">−</button><span>${studio.zoom}%</span><button id="studioZoomIn" aria-label="확대">＋</button><button id="studioFit">화면 맞춤</button></footer></section></div></div>`}
function addStudioNode(kind,extra={}){captureStudio();const id='node-'+Date.now()+'-'+Math.floor(Math.random()*1000);ensureScene().nodes.push(nodeDefaults(id,kind,20,35,kind==='art'||kind==='image'?30:60,kind==='art'||kind==='image'?35:18,{text:kind==='text'?'내용을 입력해 주세요':kind==='box'?'혜택을 입력해 주세요':'',fill:'#FFFFFF',...extra}));studio.selected=id;changedStudio();render()}
function applyStudioColor(color,gradient=false){const scene=ensureScene(),n=selectedNode();if(studio.colorTarget==='selected'&&(!n||n.locked))return notify('먼저 편집할 텍스트나 박스를 선택해 주세요.');if(studio.colorTarget==='selected'&&gradient&&n.kind!=='box')return notify('그라데이션은 배경이나 혜택 박스에 적용할 수 있어요.');captureStudio();if(studio.colorTarget==='selected'){if(n.kind==='box')n.fill=color;else if(n.kind==='text')n.color=color;else return notify('사진의 원래 색상은 유지됩니다.')}else{scene.background=color;if(studio.colorTarget==='all'){const dark=['#2864EE','#183B80'].includes(color)||color===studioGradients[3];for(const item of scene.nodes){if(item.locked||['image','art'].includes(item.kind))continue;item.color=dark?'#FFFFFF':'#183B80';if(item.kind==='box'){item.fill=dark?'#FFFFFF':'#EAF1FF';item.color='#183B80'}}}}changedStudio();paintStudio()}

function deleteStudioSelection(){
 const n=selectedNode();if(!n)return;
 if(n.locked){notify('보호된 로고와 필수 안내는 삭제할 수 없어요.');return}
 captureStudio();currentScene().nodes=currentScene().nodes.filter(x=>x.id!==n.id);
 studio.selected=null;changedStudio();render();
}
function focusStudioNode(){
 const sheet=$('#studioSheet');
 if(sheet&&studio.selected)Array.from(sheet.querySelectorAll('[data-node]')).find(el=>el.dataset.node===studio.selected)?.focus({preventScroll:true});
}
function wireStudioSheet(){
 const sheet=$('#studioSheet');if(!sheet)return;
 measureStudioText();
 sheet.onpointerdown=e=>{
  if(e.button!==undefined&&e.button!==0)return;
  const target=e.target.closest('[data-node]');
  if(!target){studio.selected=null;render();return}
  const n=ensureScene().nodes.find(n=>n.id===target.dataset.node);if(!n)return;
  e.preventDefault();studio.selected=n.id;
  if(n.locked){render();focusStudioNode();notify('보호된 요소는 이동·크기 조절·삭제할 수 없어요.');return}
  const handle=e.target.closest('[data-resize]')?.dataset.resize;
  const rect=sheet.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,original={x:n.x,y:n.y,w:n.w,h:n.h,font:n.font};
  let moved=false;sheet.setPointerCapture(e.pointerId);
  sheet.onpointermove=ev=>{
   const dx=ev.clientX-sx,dy=ev.clientY-sy;
   if(Math.abs(dx)+Math.abs(dy)<3&&!moved)return;
   if(!moved){captureStudio();moved=true}
   if(handle==='w'||handle==='e'){
    const delta=dx/rect.width*100, right=original.x+original.w;
    n.w=Math.max(5,Math.min(handle==='w'?right:100-original.x,original.w+(handle==='w'?-delta:delta)));
    n.x=handle==='w'?right-n.w:original.x;
    target.style.width=n.w+'%';
   }else if(handle){
    const signX=handle.includes('w')?-1:1,signY=handle.includes('n')?-1:1;
    const ax=signX*dx/(original.w/100*rect.width),ay=signY*dy/(original.h/100*rect.height);
    let scale=1+(Math.abs(ax)>Math.abs(ay)?ax:ay);
    const maxW=(signX<0?original.x+original.w:100-original.x)/original.w;
    const maxH=(signY<0?original.y+original.h:100-original.y)/original.h;
    const minimum=Math.max(0.1,2/original.w,2/original.h);
    scale=Math.max(minimum,Math.min(Math.max(minimum,Math.min(maxW,maxH)),scale));
    n.w=original.w*scale;n.h=original.h*scale;n.font=original.font*scale;
    n.x=signX<0?original.x+original.w-n.w:original.x;
    n.y=signY<0?original.y+original.h-n.h:original.y;
    target.style.width=n.w+'%';target.style.height=n.h+'%';target.style.fontSize=n.font+'cqw';
   }else{
    n.x=Math.max(0,Math.min(100-n.w,original.x+dx/rect.width*100));
    n.y=Math.max(0,Math.min(100-n.h,original.y+dy/rect.height*100));
    const snap=Math.abs(n.x+n.w/2-50)<1.5;if(snap)n.x=50-n.w/2;
    sheet.classList.toggle('show-guide',snap);
   }
   target.style.left=n.x+'%';target.style.top=n.y+'%';
   measureStudioText();
  };
  const finish=ev=>{
   sheet.onpointermove=null;sheet.onpointerup=null;sheet.onpointercancel=null;
   if(sheet.hasPointerCapture(e.pointerId))sheet.releasePointerCapture(e.pointerId);
   if(ev.type==='pointercancel'&&moved){Object.assign(n,original);studio.past.pop()}
   else if(moved)changedStudio();
   if(['text','box'].includes(n.kind)){studio.tab='text';studio.collapsed=false;}
   render();focusStudioNode();
  };
  sheet.onpointerup=finish;sheet.onpointercancel=finish;
 };
 sheet.onkeydown=e=>{
  const id=e.target.closest('[data-node]')?.dataset.node;if(!id)return;
  const n=ensureScene().nodes.find(n=>n.id===id);if(!n)return;
  studio.selected=id;
  if(e.key==='Enter'){studio.tab='text';render();return}
  if(n.locked)return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();captureStudio();const step=e.shiftKey?2:0.5;
   if(e.key==='ArrowLeft')n.x=Math.max(0,n.x-step);
   if(e.key==='ArrowRight')n.x=Math.min(100-n.w,n.x+step);
   if(e.key==='ArrowUp')n.y=Math.max(0,n.y-step);
   if(e.key==='ArrowDown')n.y=Math.min(100-n.h,n.y+step);
   changedStudio();paintStudio();focusStudioNode();
  }
 };
}
function studioDeleteKey(e){
 if(state.page!=='canvas'||easy.admin||!['Delete','Backspace'].includes(e.key))return;
 if(e.target?.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]'))return;
 if(!studio.selected)return;
 e.preventDefault();deleteStudioSelection();
}
window.addEventListener('keydown',studioDeleteKey);
function bindStudio(){const on=(id,fn,type='onclick')=>{if($('#'+id))$('#'+id)[type]=fn};$$('[data-studio-tab]').forEach(b=>b.onclick=()=>{studio.tab=b.dataset.studioTab;studio.collapsed=false;render()});on('studioHome',()=>navigate('home'));on('studioMyWork',()=>navigate('mine'));on('collapseStudio',()=>{studio.collapsed=!studio.collapsed;render()});on('studioName',e=>camp().name=e.target.value,'oninput');on('saveStudio',()=>{camp().workflow=snapshot();notify('현재 세션에 저장했어요. 새로고침하면 초기화됩니다.')});on('reviewStudio',()=>{if(!camp().name.trim())return notify('작업 이름을 입력해 주세요.');camp().workflow=snapshot();navigate('check')});on('studioSpec',e=>{state.size=+e.target.value;if(!activeSizes().includes(state.size)){camp().sizeIds=[...activeSizes(),state.size];camp().sizes=camp().sizeIds.length}studio.selected=null;studio.past=[];studio.future=[];ensureScene();render()},'onchange');on('studioSafe',()=>{studio.safe=!studio.safe;render()});on('studioZoomIn',()=>{studio.zoom=Math.min(140,studio.zoom+10);render()});on('studioZoomOut',()=>{studio.zoom=Math.max(50,studio.zoom-10);render()});on('studioFit',()=>{studio.zoom=100;render()});on('undoStudio',()=>{if(!studio.past.length)return;studio.future.push(structuredClone(currentScene()));camp().canvasScenes[state.size]=studio.past.pop();studio.selected=null;changedStudio();syncStudioData();render()});on('redoStudio',()=>{if(!studio.future.length)return;studio.past.push(structuredClone(currentScene()));camp().canvasScenes[state.size]=studio.future.pop();studio.selected=null;changedStudio();syncStudioData();render()});$$('[data-studio-layout]').forEach(b=>b.onclick=()=>{captureStudio();const i=+b.dataset.studioLayout;const next=makeScene(camp(),i);const prior=currentScene();for(const n of next.nodes){const old=prior.nodes.find(x=>x.id===n.id);if(old)n.text=old.text}next.background=prior.background;for(const n of prior.nodes)if(!next.nodes.some(x=>x.id===n.id)&&n.id!=='visual')next.nodes.push(n);camp().canvasScenes[state.size]=next;camp().canvasLayout=i;studio.selected=null;changedStudio();render()});on('blankStudio',()=>confirmBox('빈 화면으로 시작할까요?','현재 배치를 비웁니다. 실행 취소로 되돌릴 수 있으며 로고와 필수 안내는 유지됩니다.',()=>{captureStudio();camp().canvasScenes[state.size]=makeScene(camp(),0,state.size,true);studio.selected=null;changedStudio();render()},'빈 화면으로'));on('studioSearch',e=>{studio.query=e.target.value;render();$('#studioSearch').focus()},'oninput');$$('[data-studio-filter]').forEach(b=>b.onclick=()=>{studio.filter=b.dataset.studioFilter;render()});on('addStudioHeading',()=>addStudioNode('text',{text:'새 제목',font:7,weight:800}));on('addStudioText',()=>addStudioNode('text',{text:'설명을 입력해 주세요',font:3.5,weight:400}));on('addStudioBox',()=>addStudioNode('box',{font:5}));on('studioText',e=>updateNode({text:e.target.value}),'oninput');on('studioFontRange',e=>updateNode({font:+e.target.value}),'oninput');on('studioWidth',e=>{const n=selectedNode();updateNode({w:Math.min(+e.target.value,95-n.x)})},'oninput');on('studioBold',()=>{updateNode({weight:selectedNode().weight===800?400:800});render()});on('studioAlign',e=>updateNode({align:e.target.value}),'onchange');on('deleteStudioNode',deleteStudioSelection);on('duplicateStudioNode',()=>{const n=selectedNode();if(!n||n.locked)return;const copy=structuredClone(n);copy.id='node-'+Date.now();copy.x=Math.min(95-copy.w,copy.x+3);copy.y=Math.min(90-copy.h,copy.y+3);captureStudio();currentScene().nodes.push(copy);studio.selected=copy.id;changedStudio();render()});on('applyStudioLegal',()=>{captureStudio();const val=$('#studioLegal').value;currentScene().nodes.find(n=>n.id==='legal').text=val;camp().data.note=val;changedStudio();paintStudio();notify('필수 안내를 수정했어요. 재검수가 필요합니다.')});$$('[data-studio-art]').forEach(b=>b.onclick=()=>addStudioNode('art',{art:b.dataset.studioArt}));on('studioUpload',e=>{const files=[...e.target.files].filter(f=>f.type.startsWith('image/'));for(const f of files)studio.uploads.push({src:URL.createObjectURL(f),name:f.name});render();if(files.length)notify('이미지를 선택했어요. 썸네일을 눌러 캔버스에 추가하세요.')},'onchange');$$('[data-studio-upload]').forEach(b=>b.onclick=()=>addStudioNode('image',{src:studio.uploads[+b.dataset.studioUpload].src}));on('studioColorTarget',e=>{studio.colorTarget=e.target.value},'onchange');$$('[data-studio-color]').forEach(b=>b.onclick=()=>applyStudioColor(studioPalette[+b.dataset.studioColor].value));$$('[data-studio-gradient]').forEach(b=>b.onclick=()=>applyStudioColor(studioGradients[+b.dataset.studioGradient],true));$$('[data-studio-light]').forEach(b=>b.onclick=()=>applyStudioColor(b.dataset.studioLight));wireStudioSheet();bindStudioEffects();bindStudioTypography()}
function syncStudioData(){const scene=currentScene();for(const [id,key]of [['title','title'],['description','desc'],['period','period'],['legal','note']]){const n=scene.nodes.find(x=>x.id===id);if(n)camp().data[key]=n.text}}
function startStudio(kind){easy.kind=kind;easy.placement=kinds[kind][3][0];const c={name:'새 '+kinds[kind][0],owner:'김민지',date:'2026-09-30',status:'작업 중',langs:1,sizes:1,languageIds:[0],sizeIds:[easy.placement],canvasMade:true,canvasLayout:0,data:{title:'새로운 소식을\n전해 보세요',short:'나만의 혜택을 알려 주세요',desc:'설명을 클릭해서 내 내용으로 바꿔 주세요.',amount:'',period:'',note:'데모 디자인 · 실제 게시 전 검수 필요'}};campaigns.push(c);camp().workflow=snapshot();state.campaign=campaigns.length-1;Object.assign(state,initialWorkflow(c));studio.tab='design';studio.selected=null;studio.past=[];studio.future=[];navigate('canvas')}
const preCanvasArt=easyArt;easyArt=function(c,look=0){const spec=c?.sizeIds?.[0]??0;return c?.canvasScenes?.[spec]?sceneHTML(c.canvasScenes[spec],false,spec):preCanvasArt(c,look)};
const preCanvasBanner=banner;banner=function(){return camp().canvasScenes?.[state.size]?sceneHTML(currentScene(),false):preCanvasBanner()};
const preCanvasNavigate=navigate;navigate=function(p){if(!easy.admin&&p==='simple'&&camp().canvasMade)p='canvas';preCanvasNavigate(p)};
const preCanvasSelect=selectWork;selectWork=function(c){if(c.canvasMade){camp().workflow=snapshot();state.campaign=campaigns.indexOf(c);Object.assign(state,c.workflow||initialWorkflow(c));studio.past=[];studio.future=[];studio.selected=null;navigate('canvas')}else preCanvasSelect(c)};
const preCanvasCreate=createEasy;createEasy=function(copy){if(!copy?.canvasMade)return preCanvasCreate(copy);const c={...structuredClone(copy),name:copy.name+' (복사)',status:'작업 중',workflow:null};campaigns.push(c);selectWork(c)};
const preCanvasRender=render;render=function(){if(!easy.admin&&state.page==='canvas'){ensureScene();$('#app').innerHTML=studioView();bindStudio();return}preCanvasRender();if(!easy.admin&&state.page==='home'){$$('[data-kind]').forEach(b=>b.onclick=()=>startStudio(+b.dataset.kind));const heading=$('.easy-heading p');if(heading)heading.textContent='만들 종류를 고르면 바로 편집을 시작할 수 있어요.';const head=$('.easy-heading');if(head)head.insertAdjacentHTML('beforeend','<button id="guidedStudio" class="ghost" style="padding-left:0;margin-top:12px;color:#2864ee">무엇부터 쓸지 모르겠다면? 도움받아 만들기 →</button>');if($('#guidedStudio'))$('#guidedStudio').onclick=()=>{easy.editing=false;navigate('brief')}}};
if(state.page==='canvas')state.page='home';render();

function studioTextHTML(n){
 const stroke=Math.max(0,Math.min(12,Number(n.stroke)||0))/100;
 return '<span class="studio-text-ink" style="'+studioTypeStyle(n)+';-webkit-text-stroke:'+stroke+'em '+(n.strokeColor||'#FFFFFF')+';paint-order:stroke fill;text-shadow:'+(n.shadow?'0.035em 0.06em 0.025em '+(n.shadowColor||'#183B80'):'none')+'">'+esc(n.bullets?n.text.split('\n').map(line=>'• '+line).join('\n'):n.text).replaceAll('\n','<br>')+'</span>';
}
function studioTextEffects(n){
 return '<section class="studio-effects"><h3>글자 효과</h3><div class="studio-effect-presets">'+
 [['plain','기본'],['outline','외곽선'],['sticker','스티커'],['shadow','그림자']].map(([v,t])=>'<button data-text-effect="'+v+'"><span class="effect-sample effect-'+v+'">Aa</span>'+t+'</button>').join('')+
 '</div><label class="field">글자색<input id="effectFill" type="color" value="'+n.color+'"></label><label class="field">외곽선 색<input id="effectStrokeColor" type="color" value="'+(n.strokeColor||'#FFFFFF')+'"></label><label class="field">외곽선 두께 <output id="strokeValue">'+(n.stroke||0)+'</output><input id="effectStroke" type="range" min="0" max="12" step="1" value="'+(n.stroke||0)+'"></label><label class="effect-check"><input id="effectShadow" type="checkbox" '+(n.shadow?'checked':'')+'> 그림자 사용</label><label class="field">그림자 색<input id="effectShadowColor" type="color" value="'+(n.shadowColor||'#183B80')+'"></label><p class="footnote">모서리는 글자까지 함께 확대·축소하고, 양옆 핸들은 문구 영역의 너비를 바꿔요.</p></section>';
}
function bindStudioEffects(){
 const on=(id,fn)=>{const e=$('#'+id);if(e)e.oninput=fn};
 on('effectFill',e=>updateNode({color:e.target.value}));
 on('effectStrokeColor',e=>updateNode({strokeColor:e.target.value}));
 on('effectStroke',e=>{updateNode({stroke:+e.target.value});$('#strokeValue').textContent=e.target.value});
 on('effectShadow',e=>updateNode({shadow:e.target.checked}));
 on('effectShadowColor',e=>updateNode({shadowColor:e.target.value}));
 $$('[data-text-effect]').forEach(b=>b.onclick=()=>{
  const effect=b.dataset.textEffect;
  updateNode(effect==='plain'?{stroke:0,shadow:false}:effect==='outline'?{stroke:6,strokeColor:'#FFFFFF',shadow:false}:effect==='sticker'?{color:'#165DDE',stroke:8,strokeColor:'#FFFFFF',shadow:true,shadowColor:'#A9DDEF',weight:900}:{stroke:0,shadow:true,shadowColor:'#183B80'});
  render();focusStudioNode();
 });
}

function measureStudioText(){
 const sheet=$('#studioSheet');if(!sheet)return;
 const bounds=sheet.getBoundingClientRect();if(!bounds.height)return;
 for(const element of sheet.querySelectorAll('[data-node]')){
  const n=currentScene().nodes.find(x=>x.id===element.dataset.node);
  if(n&&n.kind==='text')n.h=element.getBoundingClientRect().height/bounds.height*100;
 }
 const messages=[];
 const nodes=currentScene().nodes.filter(n=>['text','box'].includes(n.kind));
 for(let i=0;i<nodes.length;i++){
  const a=nodes[i];
  if(a.y+a.h>100)messages.push('캔버스 밖으로 나간 문구가 있어요.');
  for(let j=i+1;j<nodes.length;j++){
   const b=nodes[j];
   if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)messages.push('문구 영역이 겹쳐 있어요.');
  }
 }
 const host=$('#studioOverlap');if(!host)return;
 host.innerHTML=messages.length?'⚠ '+[...new Set(messages)].join(' ')+' <button id="studioArrangeText">문구 간격 정리</button>':'';
 if($('#studioArrangeText'))$('#studioArrangeText').onclick=arrangeStudioText;
}
function arrangeStudioText(){
 captureStudio();
 const nodes=currentScene().nodes.filter(n=>['text','box'].includes(n.kind)&&!n.locked).sort((a,b)=>a.y-b.y);
 let failed=false;
 const placed=currentScene().nodes.filter(n=>n.locked);
 for(const n of nodes){
  let y=n.y;
  for(let i=0;i<placed.length;i++){
   const p=placed[i];
   if(n.x<p.x+p.w&&n.x+n.w>p.x&&y<p.y+p.h+2&&y+n.h>p.y-2){
    if(p.id==='legal'){failed=true;continue}
    y=p.y+p.h+2;i=-1;
   }
  }
  if(y+n.h>90)failed=true;
  n.y=y;placed.push(n);
 }
 changedStudio();render();
 if(failed)notify('공간이 부족한 문구가 있어요. 문구를 줄이거나 너비·위치를 조절해 주세요.');
}
function studioTypeStyle(n){
 const family={gothic:'Malgun Gothic, sans-serif',serif:'Batang, serif',arial:'Arial, sans-serif'}[n.fontFamily]||'Pretendard, sans-serif';
 return 'font-family:'+family+';font-style:'+(n.italic?'italic':'normal')+';text-decoration:'+([n.underline?'underline':'',n.strike?'line-through':''].filter(Boolean).join(' ')||'none')+';line-height:'+(n.lineHeight||1.2)+';letter-spacing:'+(n.letterSpacing||0)+'em;background:'+(n.highlight||'transparent');
}
function studioTypographyPanel(n){
 const toggle=(id,label,text,active)=>'<button id="'+id+'" title="'+label+'" aria-label="'+label+'" aria-pressed="'+!!active+'" class="'+(active?'active':'')+'">'+text+'</button>';
 return '<label class="field">글꼴<select id="typeFont">'+[['default','기본 고딕'],['gothic','맑은 고딕'],['serif','바탕'],['arial','Arial · 영문']].map(([v,t])=>'<option value="'+v+'" '+((n.fontFamily||'default')===v?'selected':'')+'>'+t+'</option>').join('')+'</select></label>'+
 '<div class="type-toolbar"><div class="type-size"><button id="typeMinus" aria-label="글자 크기 줄이기">−</button><input id="typeSize" type="number" min="8" max="400" value="'+Math.round(n.font*sizes[state.size].w/100)+'" aria-label="글자 크기 픽셀"><button id="typePlus" aria-label="글자 크기 늘리기">＋</button></div>'+
 toggle('typeBold','굵게','<b>B</b>',n.weight>=700)+toggle('typeItalic','기울임','<i>I</i>',n.italic)+toggle('typeUnderline','밑줄','<u>U</u>',n.underline)+toggle('typeStrike','취소선','<s>A</s>',n.strike)+'</div>'+
 '<div class="type-toolbar"><select id="typeAlign" aria-label="글자 정렬">'+[['left','왼쪽 정렬'],['center','가운데 정렬'],['right','오른쪽 정렬']].map(([v,t])=>'<option value="'+v+'" '+(n.align===v?'selected':'')+'>'+t+'</option>').join('')+
 toggle('typeBullets','글머리 기호','☷',n.bullets)+'<label class="type-color" title="글자색">A<input id="typeColor" aria-label="글자색" type="color" value="'+n.color+'"></label><label class="type-color" title="강조 배경색">▰<input id="typeHighlight" aria-label="강조 배경색" type="color" value="'+(n.highlight||'#FFF0A6')+'"></label><button id="typeClearHighlight" aria-label="강조 배경 지우기" title="강조 배경 지우기">⊘</button></div>'+
 '<div class="type-spacing"><label>줄 간격<input id="typeLine" type="number" min="0.8" max="3" step="0.1" value="'+(n.lineHeight||1.2)+'"></label><label>자간<input id="typeTracking" type="number" min="-0.05" max="0.5" step="0.01" value="'+(n.letterSpacing||0)+'"></label></div>'+
 '<label class="type-outline-toggle">외곽선<input id="typeOutline" type="checkbox" role="switch" '+(n.stroke?'checked':'')+'></label><p class="footnote">크기 단위: 출력 이미지 px · 글꼴은 기기 설치 상태에 따라 대체될 수 있어요.</p>';
}
function bindStudioTypography(){
 const on=(id,fn,event='onclick')=>{const e=$('#'+id);if(e)e[event]=fn};
 const change=values=>{updateNode(values);render()};
 const px=()=>Math.round(selectedNode().font*sizes[state.size].w/100);
 const setSize=v=>{if(Number.isFinite(v))change({font:Math.max(8,Math.min(400,v))*100/sizes[state.size].w})};
 on('typeFont',e=>change({fontFamily:e.target.value}),'onchange');
 on('typeSize',e=>setSize(+e.target.value),'onchange');
 on('typeMinus',()=>setSize(px()-2));on('typePlus',()=>setSize(px()+2));
 on('typeBold',()=>change({weight:selectedNode().weight>=700?400:800}));
 on('typeItalic',()=>change({italic:!selectedNode().italic}));
 on('typeUnderline',()=>change({underline:!selectedNode().underline}));
 on('typeStrike',()=>change({strike:!selectedNode().strike}));
 on('typeBullets',()=>change({bullets:!selectedNode().bullets}));
 on('typeAlign',e=>change({align:e.target.value}),'onchange');
 on('typeColor',e=>updateNode({color:e.target.value}),'oninput');
 on('typeHighlight',e=>updateNode({highlight:e.target.value}),'oninput');
 on('typeClearHighlight',()=>change({highlight:null}));
 on('typeLine',e=>change({lineHeight:Math.max(.8,Math.min(3,+e.target.value||1.2))}),'onchange');
 on('typeTracking',e=>change({letterSpacing:Math.max(-.05,Math.min(.5,+e.target.value||0))}),'onchange');
 on('typeOutline',e=>change({stroke:e.target.checked?6:0}),'onchange');
}
