// Size-first employee editor. Canvas is shared by preview and PNG export.
(async () => {
  let cloud;
  try{cloud=await window.HanpassCloud}catch(e){document.getElementById("app").textContent=e.message;return}
  const formats = [
    ['모바일 배너',616,136,'모바일 화면에 짧은 소식을 전할 때'],
    ['홈 상단 배너',640,284,'홈에서 행사와 혜택을 소개할 때'],
    ['이벤트 배너',640,340,'설명과 참여 버튼을 함께 보여줄 때'],
    ['메인 하단 배너',640,144,'화면 하단에 핵심 혜택을 알릴 때'],
    ['와이드 배너',840,242,'넓은 영역에 캠페인을 소개할 때'],
    ['정사각형 배너',290,290,'카드형 영역에 이미지를 게시할 때'],
    ['소형 배너',210,200,'작은 광고 영역에 간결하게 보여줄 때'],
    ['PC 배너',840,70,'PC 화면의 가로 광고 영역'],
    ['PC 배너',998,70,'PC 화면의 넓은 가로 광고 영역'],
    ['PC 배너',1100,70,'PC 화면의 전체 너비 광고 영역'],
    ['미니 배너',260,56,'작은 띠 배너 영역'],
    ['SNS 정사각형',1080,1080,'인스타그램과 소셜미디어 피드'],
    ['SNS 세로형',1080,1350,'세로형 소셜미디어 게시물'],
    ['포스터',1000,1500,'사내 게시와 행사 홍보 포스터'],
  ];
  const themes = [['클린 화이트','#ffffff','#191f28','#2464eb'],['딥 네이비','#142d52','#ffffff','#91baff'],['소프트 블루','#edf4ff','#191f28','#2464eb'],['한패스 블루','#2358b5','#ffffff','#ffffff'],['쿨 그레이','#f2f4f6','#191f28','#2464eb']];
  themes.push(
    ['미스트 블루','#f3f7fc','#303b4b','#356bc0',['#b8cef5','#dce9fa']],
    ['아쿠아 민트','#f3fafb','#303b4b','#267e98',['#bde6f5','#d8efed']],
    ['크림 옐로','#fffef4','#303b4b','#827334',['#faf1ad','#f4f1d4']]
  );
  const themeSwatch=t=>t[4]?'linear-gradient(120deg,'+t[1]+','+t[4][0]+','+t[4][1]+')':t[1];
  const solidColors=['#ffffff','#101828','#12336b','#075cf4','#38a3ff','#72d9ed','#087f8c','#25805c','#94d36c','#ffd56a','#ff914d','#ec4965','#b52e77','#8855dc','#d5c6f5','#edf4ff'];
  const gradientColors=[['블루 오션','#d9f2ff','#7db4fa'],['블루 핑크','#c5e4ff','#f5cadd'],['라벤더','#e6dfff','#a7b9f4'],['민트 스카이','#b8f0df','#acd5ff'],['피치 크림','#fff3c8','#ffbcad'],['선셋','#ffac77','#e968a0'],['로즈','#ffe0e8','#ed8fab'],['라임','#f3fbb5','#9dddc4'],['한패스 블루','#075cf4','#33c9f5'],['퍼플 네온','#673ee3','#db69ce'],['딥 오션','#071733','#17668c'],['미드나잇','#131b4d','#63459b']];
  const editorFontReady=document.fonts.load('800 24px Pretendard','한패스 디자인').catch(()=>[]);
  function canvasFill(c,fill,x,y,w,h,fallback){if(!fill)return fallback;if(fill.type!=='gradient')return fill.colors[0];const a=((fill.angle??135)-90)*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),len=(Math.abs(w*dx)+Math.abs(h*dy))/2,g=c.createLinearGradient(x+w/2-dx*len,y+h/2-dy*len,x+w/2+dx*len,y+h/2+dy*len);fill.colors.forEach((color,i)=>g.addColorStop(i/(fill.colors.length-1),color));return g;}
  const premiumSets=[
    {name:'웰컴 혜택 · 블루 티켓',title:'반가운 시작,\n더 큰 혜택',desc:'한패스에서 새로운 혜택을 만나보세요',offer:'WELCOME',bg:'#eaf1ff',ink:'#073b98',accent:'#0758fa',art:'ticket'},
    {name:'트리플 카드 · 딥 블루',title:'일상부터 여행까지\n한 장으로',desc:'한패스 카드와 함께하는 새로운 일상',offer:'TRIPLE CARD',bg:'#172663',ink:'#ffffff',accent:'#87d8ff',art:'card'},
    {name:'특별 혜택 · 바이올렛',title:'기다렸던 혜택을\n지금 만나보세요',desc:'나에게 맞는 한패스 혜택을 확인하세요',offer:'SPECIAL BENEFIT',bg:'#5a50ce',ink:'#ffffff',accent:'#e7fba5',art:'gift'},
    {name:'글로벌 금융 · 아쿠아',title:'더 가까워지는\n우리의 일상',desc:'송금부터 결제까지 한패스에서',offer:'GLOBAL LIFE',bg:'#d9f4ff',ink:'#142d72',accent:'#146cff',art:'phone'},
    {name:'기분 좋은 선물 · 코발트',title:'매일의 작은 순간을\n특별하게',desc:'한패스의 다양한 혜택을 확인하세요',offer:'FOR YOU',bg:'#3163ed',ink:'#ffffff',accent:'#ffe271',art:'reward'},
    {name:'교통 서비스 · 클린',title:'이동하는 순간도\n한패스와 함께',desc:'생활 속 편리한 교통 서비스를 만나보세요',offer:'EVERYDAY',bg:'#eef2f6',ink:'#172234',accent:'#4567f4',art:'bus'}
  ];
  const campaignStyles=[
    {name:'웰컴 혜택 · 블루 월렛',title:'반가운 시작,\n더 커지는 혜택',desc:'새로운 일상을 한패스와 함께 시작하세요',bg:'#eaf4ff',ink:'#08469f',accent:'#075cf4',art:'wallet'},
    {name:'트리플 카드 · 시그니처',title:'일상부터 여행까지\n한 장으로 충분하게',desc:'한패스 트리플 카드로 넓어지는 일상',bg:'#081631',ink:'#ffffff',accent:'#8edbff',art:'card'},
    {name:'매일의 혜택 · 체크인',title:'오늘도 한패스,\n매일 새로운 즐거움',desc:'작은 참여로 만나는 기분 좋은 혜택',bg:'#dff0ff',ink:'#0755b6',accent:'#0962ed',art:'calendar'},
    {name:'글로벌 송금 · 커넥트',title:'마음은 가깝게,\n세상은 더 넓게',desc:'국경을 넘어 일상을 연결하는 한패스',bg:'#e7f7ff',ink:'#123e83',accent:'#0761df',art:'global'},
    {name:'특별한 선물 · 리워드',title:'기다리던 혜택이\n활짝 열리는 순간',desc:'당신을 위한 한패스의 특별한 제안',bg:'#1555e8',ink:'#ffffff',accent:'#ffe08a',art:'gift'},
    {name:'여행의 시작 · 블루 스카이',title:'더 넓은 세상으로\n가볍게 떠나요',desc:'여행의 모든 순간, 한패스와 함께',bg:'#b9e5ff',ink:'#074493',accent:'#075cf4',art:'travel'}
  ];
  campaignStyles.forEach((style,i)=>Object.assign(premiumSets[i],style));
  const premiumImages={},campaignImages={};const premiumReady=Promise.all([
    ...['ticket','wrapped_gift','money_bag','mobile_phone','coin','bus','airplane','shield'].map(name=>new Promise(resolve=>{const im=new Image();premiumImages[name]=im;im.onload=resolve;im.onerror=resolve;im.src='assets/fluent-3d/'+name+'_3d.png'})),
    ...['wallet','calendar','global','gift','travel'].map(name=>new Promise(resolve=>{const im=new Image();campaignImages[name]=im;im.onload=resolve;im.onerror=resolve;im.src='assets/campaign-3d/'+name+'.png'}))
  ]);
  const brandLogo=new Image(), brandWhite=new Image(), brandCards=new Image();
  const brandReady=Promise.all([new Promise(resolve=>{brandWhite.onload=resolve;brandWhite.onerror=resolve;brandWhite.src='assets/hanpass-logo-white.svg'}),new Promise(resolve=>{brandLogo.onload=resolve;brandLogo.onerror=resolve;brandLogo.src='assets/hanpass-logo-3.svg'}),new Promise(resolve=>{brandCards.onload=resolve;brandCards.onerror=resolve;brandCards.src='assets/hanpass-cards.png'})]);
  const storageKey=cloud?cloud.key+':draft':'hanpass-size-draft-v1';
  const worksKey=cloud?cloud.key+':works':'hanpass-format-works-v1';
  const valid=d=>d&&formats[d.format]&&themes[d.theme];
  let works=[];
  try{works=JSON.parse(localStorage.getItem(worksKey)||'[]').filter(valid);const last=JSON.parse(localStorage.getItem(storageKey)||'null');if(!works.length&&valid(last)){last.id=last.id||crypto.randomUUID();works=[last];localStorage.setItem(worksKey,JSON.stringify(works));localStorage.setItem(storageKey,JSON.stringify(last))}}catch{works=[]}
  if(cloud){try{works=(await cloud.load()).filter(valid);localStorage.setItem(worksKey,JSON.stringify(works));const last=JSON.parse(localStorage.getItem(storageKey)||'null');if(last){const latest=works.find(w=>w.id===last.id);if(latest)localStorage.setItem(storageKey,JSON.stringify(latest))}}catch(e){document.getElementById('app').textContent='저장한 디자인을 불러오지 못했습니다. 새로고침해 주세요.';return}}
  const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let draft=null, picture=null, hits=[], saveTimer;
  let checks=[],actualSize=false;
  const layouts=[['benefit','혜택 강조형','금액과 참여 행동을 또렷하게'],['image','이미지 중심형','상품 이미지를 크게 보여주세요'],['notice','공지형','내용과 일정을 차분하게 안내']];
  const fieldNames={title:'제목',desc:'설명',offer:'혜택',cta:'버튼',note:'필수 안내',period:'기간·일정',coupon:'쿠폰번호'};
  function contrast(a,b){const lum=x=>{const v=x.match(/[a-f0-9]{2}/gi).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
  const baseRender=render;
  function start(i){flush();draft={id:crypto.randomUUID(),format:i,title:i>6?'한패스와 함께하는 특별한 혜택':'일상에 더하는,\n한패스의 혜택',desc:'지금 새로운 혜택을 만나보세요',offer:'5,000원 혜택',cta:'자세히 보기',note:'',theme:5+i%3,premium:i%6,image:'',scale:100};picture=null;flush();navigate('format-edit')}
  function flush(){clearTimeout(saveTimer);saveTimer=null;if(!draft)return;draft.id=draft.id||crypto.randomUUID();draft.updated=Date.now();const next=[structuredClone(draft),...works.filter(w=>w.id!==draft.id)];works=next;try{localStorage.setItem(worksKey,JSON.stringify(next));localStorage.setItem(storageKey,JSON.stringify(draft));status(cloud?'클라우드 저장 대기':'이 브라우저에 저장됨');if(cloud)cloud.save(draft)}catch{status('저장 공간이 부족해요. PNG를 다운로드해 주세요.')}}
  let undoStack=[],redoStack=[],historyCurrent=null;
  function trackHistory(){const next=JSON.stringify(draft);if(historyCurrent&&JSON.parse(historyCurrent).id===draft.id&&next!==historyCurrent){undoStack.push(historyCurrent);if(undoStack.length>60)undoStack.shift();redoStack=[]}else if(historyCurrent&&JSON.parse(historyCurrent).id!==draft.id){undoStack=[];redoStack=[]}historyCurrent=next;historyButtons()}
  function historyButtons(){const u=document.getElementById('fwUndo'),r=document.getElementById('fwRedo');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length}
  function persist(){trackHistory();status('저장 중…');clearTimeout(saveTimer);saveTimer=setTimeout(flush,300)}
  function openWork(id,copy=false){flush();const selected=works.find(w=>w.id===id);if(!selected)return;draft=structuredClone(selected);if(copy){draft.id=crypto.randomUUID();draft.name=(selected.name||selected.title.replace(/\n/g,' '))+' · 복사본'}loadImage(draft.image);flush();navigate('format-edit')}
  workCards=function(all=false){const list=all?works:works.slice(0,3);return `<div class="fw-saved-grid">${list.length?list.map(d=>{const f=formats[d.format];return `<article class="fw-saved-card"><button class="fw-saved-preview" data-fw-open="${escaped(d.id)}" aria-label="${escaped(d.name||d.title)} 이어서 편집"><canvas data-fw-preview="${escaped(d.id)}"></canvas></button><div class="fw-saved-info"><small>내 디자인 · ${f[1]} × ${f[2]}px</small><h3>${escaped(d.name||d.title.replace(/\n/g,' '))}</h3><p>${d.updated?new Date(d.updated).toLocaleDateString('ko-KR')+' 저장':'이전 편집 복원'}</p><div><button data-fw-open="${escaped(d.id)}">이어서 편집</button><button data-fw-copy="${escaped(d.id)}">복사해서 만들기</button></div></div></article>`}).join(''):'<p class="fw-empty">아직 저장된 디자인이 없어요. 위에서 크기를 골라 시작해 주세요.</p>'}</div>`};
  function bindWorks(){document.querySelectorAll('[data-fw-open]').forEach(b=>b.onclick=()=>openWork(b.dataset.fwOpen));document.querySelectorAll('[data-fw-copy]').forEach(b=>b.onclick=()=>openWork(b.dataset.fwCopy,true));document.querySelectorAll('[data-fw-preview]').forEach(c=>{const d=works.find(w=>w.id===c.dataset.fwPreview);if(!d)return;paint(c,d,null);if(d.image){const im=new Image();im.onload=()=>{if(c.isConnected)paint(c,d,im)};im.src=d.image}})}
  function status(text){const el=document.getElementById('fwStatus');if(el)el.textContent=text}
  function wrap(ctx,text,width){const result=[];for(const paragraph of String(text).split('\n')){let line='';for(const char of Array.from(paragraph)){if(line&&ctx.measureText(line+char).width>width){result.push(line.trimEnd());line=char.trimStart()}else line+=char}result.push(line)}return result}
  const svgPreviews=new Map();
  function paint(canvas,d,img,interactive=false,resolution=1){
    if(d.svgRef&&!d.svgDesign){HanpassDesignStorage.load(d.svgRef).then(source=>{if(canvas.isConnected)paint(canvas,{...d,svgDesign:source},img,interactive,resolution)}).catch(()=>{});return}
    if(d.svgDesign){try{let entry=svgPreviews.get(d.svgDesign);if(!entry){const parsed=HanpassSvg.clean(d.svgDesign),image=new Image();entry={image,width:parsed.width,height:parsed.height};svgPreviews.set(d.svgDesign,entry);if(svgPreviews.size>20)svgPreviews.delete(svgPreviews.keys().next().value);image.onload=()=>{if(canvas.isConnected)paint(canvas,d,img,interactive,resolution)};image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(HanpassSvg.serialize(parsed.svg));}canvas.width=Math.ceil(entry.width*resolution);canvas.height=Math.ceil(entry.height*resolution);if(entry.image.complete&&entry.image.naturalWidth)canvas.getContext('2d').drawImage(entry.image,0,0,canvas.width,canvas.height);return}catch{return}}

    const [,w,h]=formats[d.format],r=w/h,thin=h<=70,ribbon=!thin&&r>4,square=r<1.6,t=themes[d.theme];
    const density=interactive?Math.min(6,Math.max(2,Math.ceil(Math.max(1200,canvas.getBoundingClientRect().width*(window.devicePixelRatio||1))/w))):resolution;canvas.width=Math.round(w*density);canvas.height=Math.round(h*density);const c=canvas.getContext('2d');c.scale(density,density);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';const ink=d.ink||t[2],accent=t[3],p=thin?Math.round(h*.22):Math.round(Math.min(w,h)*.10);
    c.fillStyle=canvasFill(c,d.backgroundFill,0,0,w,h,d.bg||t[1]);c.fillRect(0,0,w,h);
    if(t[4]&&!d.bg&&!d.backgroundFill){
      for(const [cx,cy,color,radius] of [[w*.32,h*.52,t[4][0],w*.70],[w*.85,h*.63,t[4][1],w*.62]]){
        c.save();c.translate(cx,cy);c.scale(1,h/w*1.6);const gradient=c.createRadialGradient(0,0,0,0,0,radius);gradient.addColorStop(0,color);gradient.addColorStop(1,color+'00');c.fillStyle=gradient;c.fillRect(-w*2,-w*2,w*4,w*4);c.restore();
      }
    }
    if(interactive){hits=[];checks=[];if(!d.title.trim()&&!d.textStyles?.title?.hidden)checks.push({error:true,text:'제목을 입력해 주세요.'});if(contrast(d.bg||premiumSets[d.premium]?.bg||t[1],d.ink||premiumSets[d.premium]?.ink||ink)<4.5)checks.push({text:'배경과 글자의 대비가 낮아요. 색상 조합을 변경해 주세요.'});if(d.requireNote&&!d.note?.trim())checks.push({error:true,text:'필수 안내 문구를 입력해 주세요.'})}
    function box(color,x,y,bw,bh,rad=0){c.fillStyle=color;c.beginPath();c.roundRect(x,y,bw,bh,rad);c.fill()}
    const textQueue=[];
    function text(...args){textQueue.push(args)}
    function drawText(key,value,x,y,bw,bh,fs,weight=500,color=ink,linesMax=2,align='left',vertical='top'){
      if(!value||d.textStyles?.[key]?.hidden)return;let lines;const style=d.textStyles?.[key]||{};if(key!=='cta'){x+=(style.x||0)*w;y+=(style.y||0)*h;}fs=style.fontSize||fs*(d.scale/100||1)*(style.scale/100||1);color=style.color||color;align=style.align||align;weight=style.weight||weight;const lineHeight=style.lineHeight||1.35;const requestedSize=fs;const min=Math.max(7,Math.min(fs,fs*.45));if(interactive&&style.color&&key!=='cta'&&contrast(d.bg||premiumSets[d.premium]?.bg||t[1],color)<4.5)checks.push({text:(fieldNames[key]||key)+' 글자색 대비가 낮아요.'});
      while(true){c.font=`${style.italic?'italic ':''}${weight} ${fs}px "${style.fontFamily||'Pretendard'}", "Noto Sans KR", Arial, sans-serif`;c.letterSpacing=(style.letterSpacing||0)+'px';lines=wrap(c,value,bw);if(lines.length<=linesMax&&lines.length*fs*lineHeight<=bh||fs<=min)break;fs=Math.max(min,fs-.25)}
      if(interactive){if(style.fontSize&&fs<requestedSize)checks.push({text:(fieldNames[key]||key)+' 문구를 영역에 맞춰 '+Math.round(fs)+'px로 표시했어요.'});if(lines.length>linesMax||lines.length*fs*lineHeight>bh)checks.push({error:true,text:`${fieldNames[key]||key} 문구가 영역을 넘어요. 줄이거나 다른 구성을 선택해 주세요.`});else if(fs<10)checks.push({text:`${fieldNames[key]||key} 글자가 작아요 (${Math.round(fs)}px). 실제 크기로 확인해 주세요.`})}
      c.save();c.globalAlpha=(style.opacity??100)/100;if(style.shadow){c.shadowColor=style.shadowColor||'#00000066';c.shadowBlur=style.shadowBlur??4;c.shadowOffsetX=2;c.shadowOffsetY=2;}c.beginPath();c.rect(x,y,bw,bh);c.clip();c.fillStyle=canvasFill(c,style.fill,x,y,bw,bh,color);c.textBaseline='alphabetic';c.textAlign=align;const shown=lines.slice(0,linesMax),metrics=shown.map(line=>c.measureText(line)),ascent=Math.max(...metrics.map(m=>m.actualBoundingBoxAscent)),descent=Math.max(...metrics.map(m=>m.actualBoundingBoxDescent)),blockHeight=ascent+descent+(shown.length-1)*fs*lineHeight,top=vertical==='middle'?y+(bh-blockHeight)/2:y;shown.forEach((line,i)=>{const tx=align==='center'?x+bw/2:align==='right'?x+bw:x,ty=top+ascent+i*fs*lineHeight;if(style.outline){c.strokeStyle=style.outlineColor||'#ffffff';c.lineWidth=style.outlineWidth||1;c.lineJoin='round';c.strokeText(line,tx,ty)}c.fillText(line,tx,ty);if(style.underline){const width=c.measureText(line).width,lx=align==='center'?tx-width/2:align==='right'?tx-width:tx;c.fillRect(lx,ty+fs*.1,width,Math.max(1,fs*.055))}});c.restore();
      if(interactive)hits.push({key,x,y,w:bw,h:bh,fs,weight,align,lineHeight,color,fontFamily:style.fontFamily||'Pretendard'});
    }
    function logo(x,y,lw){const bg=d.bg||t[1],rgb=bg.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)),dark=(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722)<145;const image=dark?brandWhite:brandLogo;if(!image.naturalWidth)return;c.drawImage(image,x,y,lw,lw*895.37/5320)}
    function art(x,y,bw,bh){
      if(d.artMode==='none')return;
      if(!Number.isInteger(d.premium)){x+=(d.imagePosition?.x||0)*w;y+=(d.imagePosition?.y||0)*h;}
      const a=img||brandCards;if(!a.naturalWidth)return;
      const icon=!!img&&(String(d.image).startsWith('data:image/svg+xml')||String(d.image).startsWith('assets/fluent-3d/'));
      const sw=img?a.naturalWidth:690,sh=img?a.naturalHeight:1005;
      const cover=img&&!icon&&d.fit==='cover',s=(cover?Math.max:Math.min)(bw/sw,bh/sh);
      const dx=x+(bw-sw*s)*(icon?50:(d.imageX??50))/100,dy=y+(bh-sh*s)*(icon?50:(d.imageY??50))/100;
      c.save();c.beginPath();c.rect(x,y,bw,bh);c.clip();
      if(img)c.drawImage(a,dx,dy,sw*s,sh*s);else c.drawImage(a,210,175,690,1005,dx,dy,sw*s,sh*s);
      c.restore();if(interactive)hits.push({key:'image',x,y,w:bw,h:bh});
    }
    function button(x,y,bw,bh){if(!d.cta||d.textStyles?.cta?.hidden)return;x+=(d.textStyles?.cta?.x||0)*w;y+=(d.textStyles?.cta?.y||0)*h;box(t[4]?'#ffffff':accent,x,y,bw,bh,t[4]?bh/2:Math.min(8,bh*.25));text('cta',d.cta,x+bh*.35,y,bw-bh*.7,bh,Math.min(18,bh*.40),700,t[4]?ink:([1,3].includes(d.theme)?'#142d52':'#fff'),1,'center','middle')}
    try {
    if(Number.isInteger(d.premium)&&premiumSets[d.premium]){
      const set=premiumSets[d.premium],portrait=r<1.35,compact=thin||ribbon;
      const bg=d.bg||set.bg,ti=d.ink||set.ink,dark=contrast(bg,'#ffffff')>4.5;
      const sp=w*(portrait?.07:compact?.045:.065),align=portrait?'center':'left';
      c.fillStyle=canvasFill(c,d.backgroundFill,0,0,w,h,bg);c.fillRect(0,0,w,h);
      // Light belongs to the composition: a broad key light and a soft floor reflection.
      const light=c.createRadialGradient(w*(portrait?.5:.78),h*.46,0,w*.55,h*.5,w*.8);
      light.addColorStop(0,dark?'#4099ff60':'#ffffffed');light.addColorStop(.55,dark?'#2675ed10':'#ffffff30');light.addColorStop(1,'#ffffff00');if(!d.backgroundFill){c.fillStyle=light;c.fillRect(0,0,w,h);}
      const floor=c.createLinearGradient(0,h*.65,0,h);floor.addColorStop(0,'#2677ff00');floor.addColorStop(1,dark?'#020b2425':'#68b9ff40');if(!d.backgroundFill){c.fillStyle=floor;c.fillRect(0,h*.65,w,h*.35);}
      const scene=compact?{x:w*.70,y:h*.035,w:w*.28,h:h*.93}:portrait?{x:w*.07,y:h*.365,w:w*.86,h:h*.475}:{x:w*.56,y:h*.055,w:w*.43,h:h*.89};
      scene.x+=(d.imagePosition?.x||0)*w;scene.y+=(d.imagePosition?.y||0)*h;const sx=scene.x,sy=scene.y,sw=scene.w,sh=scene.h;
      if(d.artMode!=='none'){
        if(d.image){art(sx,sy,sw,sh)}else if(set.art==='card'){
          // Framed light and a reflective pedestal give the real card artwork depth.
          c.save();c.strokeStyle='#83cdff50';c.lineWidth=Math.max(1,w*.004);c.shadowColor='#399dff';c.shadowBlur=w*.035;
          c.beginPath();c.roundRect(sx+sw*.15,sy+sh*.1,sw*.7,sh*.81,sw*.22);c.stroke();c.restore();
          const pedestal=c.createLinearGradient(sx,0,sx+sw,0);pedestal.addColorStop(0,'#2966be00');pedestal.addColorStop(.5,'#8bd8ff90');pedestal.addColorStop(1,'#2966be00');
          c.fillStyle=pedestal;c.beginPath();c.ellipse(sx+sw*.5,sy+sh*.91,sw*.46,sh*.045,0,0,Math.PI*2);c.fill();
          art(sx+sw*.04,sy-sh*.01,sw*.92,sh*.94);
        }else{
          const im=campaignImages[set.art];if(im?.naturalWidth){const scale=Math.min(sw/im.naturalWidth,sh/im.naturalHeight);c.drawImage(im,sx+(sw-im.naturalWidth*scale)/2,sy+(sh-im.naturalHeight*scale)/2,im.naturalWidth*scale,im.naturalHeight*scale)}
          if(interactive)hits.push({key:'image',x:sx,y:sy,w:sw,h:sh});
        }
      }
      // A few restrained light catches, away from the editable copy.
      if(!compact&&d.artMode!=='none')for(const [px,py,size] of [[.15,.37,.012],[.87,.62,.009],[.21,.77,.007]]){
        const x=portrait?w*px:sx+sw*px,y=portrait?h*py:sy+sh*py,s=w*size;c.save();c.fillStyle=dark?'#bceaff':'#ffffff';c.beginPath();c.moveTo(x,y-s);c.quadraticCurveTo(x,y,x+s,y);c.quadraticCurveTo(x,y,x,y+s);c.quadraticCurveTo(x,y,x-s,y);c.quadraticCurveTo(x,y,x,y-s);c.fill();c.restore();
      }
      const logoIm=dark?brandWhite:brandLogo,lw=compact?Math.min(w*.16,h*.68):w*(portrait?.235:.145),lx=portrait?(w-lw)/2:sp,ly=h*(compact?.10:.055);
      if(logoIm.naturalWidth)c.drawImage(logoIm,lx,ly,lw,lw*895.37/5320);
      if(compact){
        const tw=w*.67-sp;
        text('title',thin?d.title.replace(/\n/g,' '):d.title,sp,h*.31,tw,h*.43,Math.min(h*.18,w*.041),800,ti,thin?1:2);
        text('desc',d.desc,sp,h*.79,tw,h*.17,Math.min(h*.105,w*.022),500,ti,1);
        return;
      }
      const tw=portrait?w-2*sp:w*.55-sp;
      text('title',d.title,sp,h*(portrait?.125:.215),tw,h*(portrait?.20:.30),Math.min(w*(portrait?.102:.052),h*.12),900,ti,2,align);
      text('desc',d.desc,sp,h*(portrait?.327:.535),tw,h*(portrait?.055:.13),w*(portrait?.030:.019),500,ti,2,align);
      const offerY=h*(portrait?.82:.705);
      text('offer',d.offer,sp,offerY,tw,h*(portrait?.053:.10),w*(portrait?.037:.029),800,dark?set.accent:ti,1,align,'middle');
      if(d.cta&&!d.textStyles?.cta?.hidden){const bw=portrait?w*.74:w*.32,bh=portrait?Math.min(h*.067,w*.088):h*.12,bx=(portrait?(w-bw)/2:sp)+(d.textStyles?.cta?.x||0)*w,by=h*(portrait?.887:.825)+(d.textStyles?.cta?.y||0)*h;
        c.save();c.shadowColor=dark?'#00000020':'#075cf42b';c.shadowBlur=w*.019;c.shadowOffsetY=h*.007;box(dark?'#ffffff':set.accent,bx,by,bw,bh,bh/2);c.restore();
        text('cta',d.cta,bx+bw*.07,by,bw*.77,bh,w*(portrait?.03:.020),700,dark?'#0646a5':'#ffffff',1,'center','middle');
        c.save();c.strokeStyle=dark?'#0646a5':'#ffffff';c.lineWidth=Math.max(1.4,w*.003);c.lineCap='round';const ax=bx+bw*.90,ay=by+bh*.5,as=bh*.13;c.beginPath();c.moveTo(ax-as,ay);c.lineTo(ax+as,ay);c.moveTo(ax,ay-as);c.lineTo(ax+as,ay);c.lineTo(ax,ay+as);c.stroke();c.restore();
      }
      text('note',[d.period,d.coupon,d.note].filter(Boolean).join(' · '),sp,h*.97,w-2*sp,h*.023,w*(portrait?.014:.012),400,ti,1,portrait?'center':'left');
      return;
    }


    const layout=d.layout||'benefit';
    if(!thin&&!ribbon&&layout==='notice'){
      logo(p,p,Math.min(106,w*.33));
      text('title',d.title,p,h*.25,w-2*p,h*.23,Math.min(w*.075,h*.115),800,ink,2);
      text('desc',d.desc,p,h*.52,w-2*p,h*.16,Math.min(17,w*.043),400,ink,2);
      c.globalAlpha=.12;box(ink,p,h*.73,w-2*p,h*.15,6);c.globalAlpha=1;
      text('period',d.period||'일정을 입력해 주세요',p+10,h*.76,w-2*p-20,h*.095,Math.min(16,w*.045),700,ink,1);
      text('note',d.note,p,h*.91,w-2*p,h*.075,Math.min(11,w*.035),400,ink,1);
    }else if(!thin&&!ribbon&&layout==='image'){
      const cw=w*.48-p;logo(p,p,Math.min(100,w*.32));
      text('title',d.title,p,h*.26,cw,h*.30,Math.min(w*.068,h*.12),800,ink,3);
      text('desc',d.desc,p,h*.60,cw,h*.13,Math.min(14,w*.037),400,ink,2);
      button(p,h*.80,cw,h*.12);art(w*.53,p,w*.47-p,h*.78);
      text('note',[d.period,d.note].filter(Boolean).join(' · '),p,h*.94,w-2*p,h*.055,Math.min(10,w*.028),400,ink,1);
    }else if(thin||ribbon){
      const left=w*.045,tw=w*.67-left,lw=Math.min(w*.16,h*.68);
      logo(left,h*.10,lw);
      text('title',thin?d.title.replace(/\n/g,' '):d.title,left,h*.31,tw,h*.43,Math.min(h*.18,w*.041),800,ink,thin?1:2);
      text(layout==='notice'?'period':'desc',layout==='notice'?d.period:d.desc,left,h*.79,tw,h*.17,Math.min(h*.105,w*.022),500,ink,1);
      if(layout!=='notice')art(w*.70,h*.035,w*.28,h*.93);
    }else if(square){
      logo(p,p,w*.33);
      text('title',d.title,p,h*.23,w-2*p,h*.24,w*.086,800,ink,2);
      text('desc',d.desc,p,h*.50,w-2*p,h*.095,w*.039,400,ink,1);
      text('offer',d.offer,p,h*.64,w*.47,h*.13,w*.069,800,accent,2);
      button(p,h*.82,w*.43,h*.105);art(w*.63,h*.60,w*.27,h*.30);
      if(d.note||d.period||d.coupon)text('note',[d.period,d.coupon,d.note].filter(Boolean).join(' · '),p,h*.94,w-2*p,h*.055,7,400,ink,1);
    }else{
      const tw=w*.58-p,ts=Math.min(h*.125,w*.058);
      logo(p,p,Math.min(106,w*.19));
      text('title',d.title,p,h*.27,tw,h*.29,ts,800,ink,2);
      text('desc',d.desc,p,h*.59,tw,h*.10,Math.min(16,h*.055),400,ink,1);
      text('offer',d.offer,p,h*.755,tw*.57,h*.14,Math.min(25,h*.09),800,accent,1,'left','middle');
      button(p+tw*.62,h*.755,tw*.38,h*.14);
      art(w*.66,p,w*.28,h-2*p);
      if(d.note||d.period||d.coupon)text('note',[d.period,d.coupon,d.note].filter(Boolean).join(' · '),p,h*.93,w-2*p,h*.055,9,400,ink,1);
    }
    } finally {
      const extras=(d.extraTexts||[]).map(item=>{const source=textQueue.find(args=>args[0]===item.source);return source?[item.key,item.value,...source.slice(2)]:null}).filter(Boolean);
      [...textQueue,...extras].sort((a,b)=>(d.textStyles?.[a[0]]?.order||0)-(d.textStyles?.[b[0]]?.order||0)).forEach(args=>drawText(...args));
    }
  }
  const galleryState={search:'',category:'all',style:'all',color:'all',favorites:false};
  let favoriteTemplates=[];try{favoriteTemplates=JSON.parse(localStorage.getItem('hanpass-template-favorites')||'[]');if(!Array.isArray(favoriteTemplates))favoriteTemplates=[]}catch{}
  const catalog=premiumSets.flatMap((set,premium)=>[11,12,13,1,2,0].map(format=>({id:premium+'-'+format,premium,format,category:format===13?'print':format>=11?'social':format===0?'mobile':'web',style:['coupon','card','gift','service','gift','service'][premium],color:['light','dark','light','light','blue','light'][premium],name:set.name})));
  const galleryCategories=[['all','전체','▦'],['social','소셜미디어','◉'],['web','웹 배너','▣'],['mobile','모바일','▯'],['print','포스터·인쇄','▤']];
  const galleryStyles=[['all','모든 스타일'],['coupon','쿠폰·이벤트'],['card','카드 프로모션'],['gift','선물·혜택'],['service','서비스 소개']];
  const galleryColors=[['all','모든 색상'],['light','밝은 톤'],['dark','딥 블루'],['blue','블루']];
  function templateDraft(item){const set=premiumSets[item.premium];return {...set,id:crypto.randomUUID(),name:item.name,format:item.format,premium:item.premium,layout:'benefit',theme:5,image:'',artMode:'image',scale:100,offer:'혜택을 확인하세요',cta:'자세히 보기',note:'',bg:undefined,ink:undefined}}
  function openTemplate(id){const item=catalog.find(x=>x.id===id);if(!item)return;flush();draft=templateDraft(item);picture=null;selectedElement='title';studioLibrary='templates';flush();navigate('format-edit')}
  function home(){
    const grid=document.querySelector('.size-preset-grid');if(!grid)return;
    grid.classList.remove('fw-grid');grid.classList.add('hg-gallery');
    const head=document.querySelector('.size-home-head');if(head)head.innerHTML='<div><span class="eyelabel">HANPASS TEMPLATES</span><h1>어디에 보여줄 디자인인가요?</h1><p>마음에 드는 디자인을 찾아, 내 내용으로 바꿔 보세요.</p></div>';
    const option=(list,value)=>list.map(([v,n])=>`<option value="${v}" ${value===v?'selected':''}>${n}</option>`).join('');
    grid.innerHTML=`<div class="hg-search"><span aria-hidden="true">⌕</span><input id="hgSearch" type="search" aria-label="템플릿 검색" placeholder="예) 카드 혜택, 이벤트, SNS 포스터 — 원하는 디자인을 검색하세요" value="${escaped(galleryState.search)}"></div><div class="hg-filterbar"><button id="hgAllFilters">☷　모든 필터</button><label><span class="hg-sr">사용처</span><select id="hgCategory">${option(galleryCategories,galleryState.category)}</select></label><label><span class="hg-sr">스타일</span><select id="hgStyle">${option(galleryStyles,galleryState.style)}</select></label><label><span class="hg-sr">색상</span><select id="hgColor">${option(galleryColors,galleryState.color)}</select></label><button id="hgFavorites" class="hg-favorites ${galleryState.favorites?'active':''}" aria-pressed="${galleryState.favorites}">☆ 즐겨찾기 템플릿 <span>${favoriteTemplates.length}</span></button></div><section class="hg-featured" aria-label="추천 디자인 컬렉션">${[[1,'일상을 넓히는 한패스 카드','카드의 매력을 보여주는 디자인','card'],[2,'기분 좋은 혜택을 전하세요','이벤트부터 웰컴 프로모션까지','gift'],[3,'더 가까운 글로벌 라이프','한패스 서비스를 알리는 디자인','service']].map(([p,title,desc,style])=>`<button class="hg-feature" data-feature-style="${style}"><canvas data-feature-canvas="${p}" aria-hidden="true"></canvas><span><b>${title}</b><small>${desc}</small></span></button>`).join('')}</section><nav class="hg-categories" aria-label="디자인 사용처">${galleryCategories.map(([v,n,icon])=>`<button data-hg-category="${v}" class="${v===galleryState.category?'active':''}"><i>${icon}</i>${n}</button>`).join('')}</nav><div class="hg-results-heading"><div><h2 id="hgResultsTitle">한패스 추천 템플릿</h2><p id="hgCount" role="status"></p></div><button id="hgReset">필터 초기화 ↻</button></div><div id="hgResults" class="hg-template-grid"></div>`;
    function paintGallery(){grid.querySelectorAll('[data-catalog-canvas]').forEach(c=>{const item=catalog.find(x=>x.id===c.dataset.catalogCanvas);if(item)paint(c,templateDraft(item),null,false,.45)});grid.querySelectorAll('[data-feature-canvas]').forEach(c=>{const premium=+c.dataset.featureCanvas;paint(c,{...templateDraft({premium,format:1,name:premiumSets[premium].name}),title:'',desc:'',offer:'',cta:''},null,false,1.5)})}
    function results(){
      const q=galleryState.search.trim().toLowerCase(),items=catalog.filter(x=>(galleryState.category==='all'||x.category===galleryState.category)&&(galleryState.style==='all'||x.style===galleryState.style)&&(galleryState.color==='all'||x.color===galleryState.color)&&(!galleryState.favorites||favoriteTemplates.includes(x.id))&&[x.name,formats[x.format][0],galleryCategories.find(c=>c[0]===x.category)?.[1],premiumSets[x.premium].desc].join(' ').toLowerCase().includes(q));
      grid.querySelector('#hgResultsTitle').textContent=galleryState.favorites?'즐겨찾기 템플릿':galleryState.category==='all'?'한패스 추천 템플릿':galleryCategories.find(c=>c[0]===galleryState.category)[1]+' 템플릿';grid.querySelector('#hgCount').textContent=items.length+'개의 디자인 · 문구와 이미지를 직접 편집할 수 있어요';
      grid.querySelector('#hgResults').innerHTML=items.length?items.map(x=>{const f=formats[x.format];return `<article class="hg-template"><div class="hg-art" style="aspect-ratio:${f[1]}/${f[2]}"><button class="hg-open" data-hg-open="${x.id}" aria-label="${escaped(x.name+' '+f[0]+' 사용하기')}"><canvas data-catalog-canvas="${x.id}" aria-hidden="true"></canvas></button><button class="hg-star ${favoriteTemplates.includes(x.id)?'active':''}" data-hg-favorite="${x.id}" aria-label="${escaped(x.name)} 즐겨찾기" aria-pressed="${favoriteTemplates.includes(x.id)}">${favoriteTemplates.includes(x.id)?'★':'☆'}</button><div class="hg-card-actions"><button data-hg-preview="${x.id}">미리보기</button><button data-hg-open="${x.id}">사용하기 →</button></div></div><h3>${x.name}</h3><p>${f[0]} · ${f[1]} × ${f[2]}</p></article>`}).join(''):'<div class="hg-empty"><b>조건에 맞는 템플릿이 없어요.</b><p>검색어나 필터를 바꿔 보세요. 별표를 누르면 즐겨찾기에 저장됩니다.</p></div>';
      grid.querySelectorAll('[data-hg-open]').forEach(b=>b.onclick=()=>openTemplate(b.dataset.hgOpen));
      grid.querySelectorAll('[data-hg-favorite]').forEach(b=>b.onclick=()=>{const id=b.dataset.hgFavorite;favoriteTemplates=favoriteTemplates.includes(id)?favoriteTemplates.filter(x=>x!==id):[...favoriteTemplates,id];try{localStorage.setItem('hanpass-template-favorites',JSON.stringify(favoriteTemplates))}catch{notify('즐겨찾기를 저장하지 못했어요.')}grid.querySelector('#hgFavorites span').textContent=favoriteTemplates.length;results()});
      grid.querySelectorAll('[data-hg-preview]').forEach(b=>b.onclick=()=>previewTemplate(b.dataset.hgPreview));paintGallery();
    }
    const sync=()=>{for(const [id,key]of [['hgCategory','category'],['hgStyle','style'],['hgColor','color']])grid.querySelector('#'+id).value=galleryState[key];grid.querySelectorAll('[data-hg-category]').forEach(b=>b.classList.toggle('active',b.dataset.hgCategory===galleryState.category));const fav=grid.querySelector('#hgFavorites');fav.classList.toggle('active',galleryState.favorites);fav.setAttribute('aria-pressed',galleryState.favorites);results()};
    grid.querySelector('#hgSearch').oninput=e=>{galleryState.search=e.target.value;results()};
    for(const [id,key]of [['hgCategory','category'],['hgStyle','style'],['hgColor','color']])grid.querySelector('#'+id).onchange=e=>{galleryState[key]=e.target.value;sync()};
    grid.querySelectorAll('[data-hg-category]').forEach(b=>b.onclick=()=>{galleryState.category=b.dataset.hgCategory;sync()});
    grid.querySelectorAll('[data-feature-style]').forEach(b=>b.onclick=()=>{galleryState.style=b.dataset.featureStyle;galleryState.category='all';galleryState.color='all';galleryState.search='';galleryState.favorites=false;grid.querySelector('#hgSearch').value='';sync();grid.querySelector('#hgResultsTitle').scrollIntoView({behavior:'smooth',block:'start'})});
    grid.querySelector('#hgFavorites').onclick=()=>{galleryState.favorites=!galleryState.favorites;sync()};grid.querySelector('#hgReset').onclick=()=>{Object.assign(galleryState,{search:'',category:'all',style:'all',color:'all',favorites:false});grid.querySelector('#hgSearch').value='';sync()};
    grid.querySelector('#hgAllFilters').onclick=()=>{
      const modal=document.createElement('dialog');modal.className='hg-filter-dialog';modal.setAttribute('aria-label','모든 필터');modal.innerHTML=`<form method="dialog"><header><h2>모든 필터</h2><button aria-label="필터 닫기">×</button></header><p>원하는 디자인을 더 빠르게 찾아보세요.</p><label>사용처<select name="category">${option(galleryCategories,galleryState.category)}</select></label><label>스타일<select name="style">${option(galleryStyles,galleryState.style)}</select></label><label>색상<select name="color">${option(galleryColors,galleryState.color)}</select></label><footer><button value="cancel">취소</button><button value="apply" class="hg-apply">필터 적용하기</button></footer></form>`;document.body.append(modal);modal.addEventListener('close',()=>{if(modal.returnValue==='apply'){for(const key of ['category','style','color'])galleryState[key]=modal.querySelector('[name='+key+']').value;sync()}modal.remove()});modal.showModal();
    };
    results();Promise.all([brandReady,premiumReady,editorFontReady,document.fonts.ready]).then(()=>{if(grid.isConnected)paintGallery()});
    const help=document.querySelector('.size-help-row');if(help){help.innerHTML='<span>작업하던 디자인이 있나요?</span><button id="fwResume">마지막 편집 이어가기 →</button>';document.getElementById('fwResume').onclick=()=>{if(restore())navigate('format-edit');else notify('저장된 디자인이 없습니다.')}}
  }
  function previewTemplate(id){const item=catalog.find(x=>x.id===id);if(!item)return;const f=formats[item.format],modal=document.createElement('dialog');modal.className='hg-preview-dialog';modal.setAttribute('aria-label','템플릿 미리보기');modal.innerHTML=`<form method="dialog"><button class="hg-preview-close" aria-label="미리보기 닫기">×</button></form><div class="hg-preview-art"><canvas></canvas></div><div class="hg-preview-info"><small>HANPASS TEMPLATE</small><h2>${item.name}</h2><p>${f[0]} · ${f[1]} × ${f[2]}px</p><p>원본 템플릿을 유지하고 내 작업본을 만들어 편집합니다.</p><button class="hg-apply">이 템플릿 사용하기 →</button></div>`;document.body.append(modal);paint(modal.querySelector('canvas'),templateDraft(item),null);modal.querySelector('.hg-apply').onclick=()=>{modal.close();openTemplate(id)};modal.addEventListener('close',()=>modal.remove());modal.showModal()}

  function restore(){try{const d=JSON.parse(localStorage.getItem(storageKey));if(!d||!formats[d.format]||!themes[d.theme])return false;draft=d;loadImage(d.image);return true}catch{return false}}
  function loadImage(src){picture=null;if(!src){preview();return}const image=new Image();image.onload=()=>{picture=image;preview()};image.onerror=()=>status('이미지를 불러오지 못했어요. 다시 선택해 주세요.');image.src=src}
  function preview(){const c=document.getElementById('fwCanvas');if(c&&draft){paint(c,draft,picture,true);selectionOutline();const el=document.getElementById('fwChecks');if(el)el.innerHTML=checks.length?checks.map(x=>`<p class="${x.error?'fw-error':'fw-warning'}">${x.error?'!':'△'} ${escaped(x.text)}</p>`).join(''):'<p class="fw-pass">✓ 글자 영역과 색상 대비를 확인했어요.</p>';document.querySelectorAll('[data-layout-preview]').forEach(e=>paint(e,{...draft,layout:e.dataset.layoutPreview},picture))}}

  const iconSvg=(body)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">'+body+'</svg>');
  const imageChoices=[
    ['cards','템플릿 기본 이미지',''],
    ...[['wallet','프리미엄 월렛'],['calendar','출석·체크인'],['global','글로벌 송금'],['gift','리워드 선물'],['travel','여행·항공']].map(([id,label])=>['campaign-'+id,label,'assets/campaign-3d/'+id+'.png']),
    ['gift','선물',iconSvg('<rect x="28" y="74" width="124" height="83" rx="12" fill="#3182f6"/><rect x="20" y="57" width="140" height="34" rx="9" fill="#83b5ff"/><path d="M82 58C27 57 46 7 72 30L90 58L108 30C134 7 153 57 98 58" fill="none" stroke="#2464eb" stroke-width="13"/><path d="M90 61V157" stroke="#d5e7ff" stroke-width="19"/>')],
    ['wallet','혜택·결제',iconSvg('<rect x="20" y="40" width="137" height="112" rx="20" fill="#2464eb"/><path d="M39 39L131 23V48H38" fill="#91baff"/><rect x="104" y="82" width="59" height="44" rx="12" fill="#c7dfff"/><circle cx="121" cy="104" r="6" fill="#2464eb"/>')],
    ['plane','여행·항공',iconSvg('<circle cx="90" cy="90" r="75" fill="#e4efff"/><path d="M151 39C146 32 137 35 130 42L102 69L48 53L36 65L78 91L56 115L37 112L28 121L53 137L70 153L80 142L77 123L102 101L127 145L140 132L124 79L151 51Z" fill="#3182f6"/>')],
    ['gift3d','선물','assets/fluent-3d/wrapped_gift_3d.png'],
    ['money3d','캐시백·혜택','assets/fluent-3d/money_bag_3d.png'],
    ['credit3d','카드·결제','assets/fluent-3d/credit_card_3d.png'],
    ['plane3d','여행·항공','assets/fluent-3d/airplane_3d.png'],
    ['bus3d','버스','assets/fluent-3d/bus_3d.png'],
    ['phone3d','모바일','assets/fluent-3d/mobile_phone_3d.png'],
    ['shield3d','보안·안심','assets/fluent-3d/shield_3d.png'],
    ['coin3d','포인트','assets/fluent-3d/coin_3d.png'],
    ['party3d','이벤트','assets/fluent-3d/party_popper_3d.png'],
    ['ticket3d','쿠폰·티켓','assets/fluent-3d/ticket_3d.png'],
    ['bell3d','공지·알림','assets/fluent-3d/bell_3d.png'],
    ['none','이미지 없음','']
  ];
  function quickChoices(){
    const previewPanel=document.querySelector('.fw-preview'),panel=document.createElement('section');panel.className='fw-quick';panel.innerHTML='<h3>색상과 이미지</h3><p>원하는 스타일을 누르면 바로 반영돼요.</p><div class="fw-quick-colors"><h4>추천 색상</h4></div><div class="fw-quick-images"><h4>이미지·아이콘</h4><div class="fw-image-options"></div></div>';
    previewPanel.querySelector('.fw-quality').before(panel);
    panel.querySelector('.fw-quick-colors').append(document.querySelector('.fw-themes'));
    if(String(draft.image).startsWith('data:image/svg+xml')||String(draft.image).startsWith('assets/fluent-3d/')){for(const id of ['fwImageFit','fwImageX','fwImageY']){const control=document.getElementById(id);control.disabled=true;control.title='기본 아이콘은 전체 보기와 가운데 정렬로 자동 배치됩니다.'}}
    const selected=draft.artMode==='none'?'none':draft.image?(imageChoices.find(x=>x[2]===draft.image)?.[0]||'upload'):'cards';
    panel.querySelector('.fw-image-options').innerHTML=imageChoices.map(([id,name,src])=>`<button type="button" data-art-choice="${id}" aria-pressed="${selected===id}" class="${selected===id?'selected':''}">${id==='none'?'<span class="fw-no-art">∅</span>':`<img src="${src||'assets/hanpass-cards.png'}" alt="">`}<span>${name}</span></button>`).join('')+'<button type="button" id="fwQuickUpload">'+(selected==='upload'?'<img src="'+escaped(draft.image)+'" alt="">':'<span class="fw-no-art">＋</span>')+'<span>내 이미지 올리기</span></button>';
    const upload=document.getElementById('fwImage');upload.closest('label').hidden=true;
    document.getElementById('fwRemoveImage').hidden=true;
    panel.querySelector('.fw-quick-images').insertAdjacentHTML('beforeend','<p class="fw-icon-license">3D 아이콘: Microsoft Fluent Emoji · 무료 상업적 사용 가능 · <a href="assets/fluent-3d/LICENSE.txt" target="_blank" rel="noopener">MIT 라이선스</a><br>아이콘 재배포 시 저작권·라이선스 안내를 함께 포함해 주세요.</p>');
    panel.querySelector('#fwQuickUpload').onclick=()=>upload.click();
    panel.querySelectorAll('[data-art-choice]').forEach(b=>b.onclick=()=>{const [id,,src]=imageChoices.find(x=>x[0]===b.dataset.artChoice);draft.artMode=id==='none'?'none':'image';draft.image=src;draft.fit='contain';draft.imageX=50;draft.imageY=50;picture=null;loadImage(src);persist();editor()});
    if((draft.layout||'benefit')==='notice'){panel.querySelector('.fw-quick-images').hidden=true;}
  }

  function enhanceEditor(){
    const bench=document.querySelector('.fw-workbench'),right=document.querySelector('.fw-fields');bench.classList.add('fw-three');
    const left=document.createElement('section');left.className='fw-content-panel';left.innerHTML='<span class="fw-panel-step">01 CONTENT</span><h2>어떤 내용을 전할까요?</h2>';bench.prepend(left);
    right.querySelectorAll('[data-fw-field]').forEach(e=>left.append(e.closest('label')));
    const layout=draft.layout||'benefit',strip=formats[draft.format][1]/formats[draft.format][2]>4;
    for(const key of layout==='notice'?['offer','cta']:layout==='image'?['offer']:[])left.querySelector('#fw-'+key)?.closest('label').remove();
    if(layout==='notice')left.querySelector('label:has(#fw-desc)').firstChild.textContent='안내 내용';
    for(const [k,n] of [...(!strip||layout==='notice'?[['period',layout==='notice'?'중단·변경 일정':'행사 기간']]:[]),...(!strip&&layout==='benefit'?[['coupon','쿠폰번호']]:[])]){left.insertAdjacentHTML('beforeend',`<label>${n}<input id="fw-${k}" data-fw-field="${k}" value="${escaped(draft[k]||'')}" placeholder="${layout==='notice'?'예: 10월 5일 02:00–04:00':'선택 입력'}"></label>`)}
    left.insertAdjacentHTML('beforeend',`<label class="fw-note-required"><input id="fwRequireNote" type="checkbox" ${draft.requireNote?'checked':''}> 필수 안내가 필요한 디자인</label><p class="fw-hint">로고 비율과 바깥 여백은 자동으로 유지돼요.</p>`);
    right.querySelector('h2').textContent='디자인 선택';right.insertAdjacentHTML('afterbegin','<span class="fw-panel-step">02 DESIGN</span>');
    const choices=document.createElement('div');choices.className='fw-layouts';choices.innerHTML=layouts.map(([id,n,desc])=>`<button data-layout="${id}" class="${layout===id?'selected':''}" aria-pressed="${layout===id}"><canvas data-layout-preview="${id}"></canvas><b>${n}</b><small>${desc}</small></button>`).join('');right.querySelector('h2').after(choices);
    const colors=document.querySelector('.fw-themes');right.append(colors);
    const details=document.createElement('details');details.className='fw-advanced';details.innerHTML='<summary>상세 조정</summary>';right.append(details);details.append(right.querySelector('#fwScale').closest('label'),right.querySelector('.fw-colors'));
    right.insertAdjacentHTML('beforeend',`<label>이미지 맞춤<select id="fwImageFit"><option value="contain">전체 보기 · 비율 유지</option><option value="cover">영역 채우기 · 일부 잘림</option></select></label><label>이미지 좌우 위치<input id="fwImageX" type="range" min="0" max="100" value="${draft.imageX??50}"></label><label>이미지 상하 위치<input id="fwImageY" type="range" min="0" max="100" value="${draft.imageY??50}"></label>`);
    document.getElementById('fwImageFit').value=draft.fit||'contain';
    if(layout==='notice'){
      for(const id of ['fwImage','fwImageFit','fwImageX','fwImageY'])document.getElementById(id).closest('label').hidden=true;
      document.getElementById('fwRemoveImage').hidden=true;
      if(strip)left.querySelector('#fw-desc')?.closest('label').remove();
    }
    const previewPanel=document.querySelector('.fw-preview');previewPanel.insertAdjacentHTML('beforeend','<section class="fw-quality"><h3>다운로드 전 점검</h3><div id="fwChecks" role="status" aria-live="polite"></div><p>금액·일정·필수 고지의 정확성은 직접 확인해 주세요.</p></section>');
    previewPanel.querySelector('.fw-preview-label').insertAdjacentHTML('beforeend',`<button id="fwActual">${actualSize?'화면에 맞추기':'실제 크기 보기'}</button>`);document.querySelector('.fw-canvas-wrap').classList.toggle('fw-actual',actualSize);
    document.getElementById('fwActual').onclick=()=>{actualSize=!actualSize;document.querySelector('.fw-canvas-wrap').classList.toggle('fw-actual',actualSize);document.getElementById('fwActual').textContent=actualSize?'화면에 맞추기':'실제 크기 보기'};
    document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{draft.layout=b.dataset.layout;persist();editor()});
    for(const [id,key]of [['fwImageFit','fit'],['fwImageX','imageX'],['fwImageY','imageY']])document.getElementById(id).oninput=e=>{draft[key]=key==='fit'?e.target.value:+e.target.value;preview();persist()};
    document.getElementById('fwRequireNote').onchange=e=>{draft.requireNote=e.target.checked;preview();persist()};
  }
  let studioZoom=100,studioLibrary='templates';
  function studioShell(){
    const shell=document.querySelector('.fw-editor'),bench=document.querySelector('.fw-workbench'),fields=document.querySelector('.fw-fields'),content=document.querySelector('.fw-content-panel'),previewPanel=document.querySelector('.fw-preview'),quick=document.querySelector('.fw-quick');
    shell.classList.add('fw-studio');
    document.querySelector('.fw-logo img').src='assets/hanpass-logo-3.svg';document.querySelector('.fw-logo small').textContent='Studio';
    const rail=document.createElement('nav');rail.className='fw-rail';rail.setAttribute('aria-label','Studio navigation');rail.innerHTML='<a href="#home"><span>⌂</span>홈</a><button id="fwTemplates"><span>▦</span>디자인 선택</button><a href="#mine"><span>▱</span>내 작업</a><button id="fwAssets"><span>◇</span>이미지·아이콘</button><div class="fw-rail-bottom"><b>H</b><small>HANPASS<br>Creative Studio</small></div>';bench.prepend(rail);
    const library=document.createElement('aside');library.className='fw-library';library.innerHTML='<h2>디자인 선택</h2><p class="fw-hint">원하는 스타일을 누르면 바로 반영돼요.</p><input class="fw-template-search" type="search" placeholder="디자인 선택" aria-label="디자인 선택"><div class="fw-template-grid"></div>';rail.after(library);
    const choices=[['benefit',5],['benefit',1],['image',6],['image',3],['notice',0],['notice',7]];
    const grid=library.querySelector('.fw-template-grid');
    grid.innerHTML=choices.map(([layout,theme],i)=>`<button data-studio-template="${i}" class="${draft.premium===i?'selected':''}"><div><canvas data-studio-thumb="${i}"></canvas></div><b>${layouts.find(x=>x[0]===layout)[1]}</b><small>${themes[theme][0]}</small></button>`).join('');
    const drawTemplates=()=>grid.querySelectorAll('canvas').forEach(c=>{const [layout,theme]=choices[+c.dataset.studioThumb];paint(c,{...draft,...premiumSets[+c.dataset.studioThumb],premium:+c.dataset.studioThumb,layout,theme,image:'',artMode:'image',bg:undefined,ink:undefined,backgroundFill:undefined,imagePosition:undefined,textStyles:{},scale:100},null)});drawTemplates();content.addEventListener('input',drawTemplates);Promise.all([brandReady,premiumReady,editorFontReady]).then(()=>{if(grid.isConnected)drawTemplates()});
    grid.querySelectorAll('button').forEach(b=>b.onclick=()=>{const [layout,theme]=choices[+b.dataset.studioTemplate];draft.layout=layout;draft.theme=theme;draft.premium=+b.dataset.studioTemplate;draft.layout='benefit';delete draft.bg;delete draft.ink;delete draft.backgroundFill;if(draft.premium!==undefined&&!b.dataset.studioTemplate){draft.bg=themes[draft.theme][1];draft.ink=themes[draft.theme][2]}persist();editor()});
    library.querySelector('input').oninput=e=>{const q=e.target.value.toLocaleLowerCase();grid.querySelectorAll('button').forEach(b=>b.hidden=!b.textContent.toLocaleLowerCase().includes(q))};
    content.querySelector('.fw-panel-step').remove();content.querySelector('h2').textContent='내용 입력';
    fields.querySelector('.fw-panel-step').remove();fields.querySelector('h2').remove();fields.querySelector('.fw-layouts').remove();
    fields.prepend(content);fields.querySelector('.fw-advanced').open=true;
    const colors=quick.querySelector('.fw-quick-colors'),images=quick.querySelector('.fw-quick-images');fields.append(colors);
    const assets=document.createElement('section');assets.className='fw-library-assets';assets.hidden=true;assets.append(images);library.append(assets);quick.remove();if(images.hidden){assets.insertAdjacentHTML('beforeend','<p class="fw-hint">이미지 중심형</p><button id="fwEnableArt">이미지·아이콘</button>');assets.querySelector('#fwEnableArt').onclick=()=>{draft.layout='image';persist();editor()}}
    fields.append(previewPanel.querySelector('.fw-quality'));
    const showLibrary=mode=>{studioLibrary=mode;const isAssets=mode==='assets';grid.hidden=isAssets;library.querySelector('input').hidden=isAssets;assets.hidden=!isAssets;library.querySelector('h2').textContent=isAssets?'이미지·아이콘':'디자인 선택';document.getElementById('fwTemplates').classList.toggle('active',!isAssets);document.getElementById('fwAssets').classList.toggle('active',isAssets)};
    document.getElementById('fwTemplates').onclick=()=>showLibrary('templates');document.getElementById('fwAssets').onclick=()=>showLibrary('assets');showLibrary(studioLibrary);
    const hint=previewPanel.querySelector(':scope > p');hint.textContent='더블클릭으로 문구 수정 · 드래그로 이동 · Delete로 삭제';
    const canvas=document.getElementById('fwCanvas');canvas.setAttribute('aria-label','디자인 미리보기');
    const size=document.createElement('select');size.className='fw-size-select';size.setAttribute('aria-label','크기 다시 선택');size.innerHTML=formats.map((f,i)=>`<option value="${i}">${f[1]} × ${f[2]} · ${f[0]}</option>`).join('');size.value=draft.format;document.querySelector('.fw-editor-title').append(size);size.onchange=()=>{draft.format=+size.value;persist();editor()};
    const toolbar=document.createElement('div');toolbar.className='fw-zoom-bar';toolbar.innerHTML='<span>디자인 미리보기</span><button id="fwZoomOut" aria-label="Zoom out">−</button><output id="fwZoomValue"></output><button id="fwZoomIn" aria-label="Zoom in">＋</button><button id="fwZoomFit">화면에 맞추기</button>';previewPanel.append(toolbar);
    const wrap=document.querySelector('.fw-canvas-wrap');
    const zoom=()=>{wrap.classList.remove('fw-actual');actualSize=false;const format=formats[draft.format],fitWidth=Math.min(Math.max(1,wrap.clientWidth-64),Math.max(1,wrap.clientHeight-64)*format[1]/format[2]);canvas.style.width=(fitWidth*studioZoom/100)+'px';canvas.style.maxWidth='none';canvas.style.maxHeight='none';canvas.style.flexShrink='0';document.getElementById('fwZoomValue').textContent=studioZoom+'%'};
    document.getElementById('fwZoomOut').onclick=()=>{studioZoom=Math.max(25,studioZoom-25);zoom()};document.getElementById('fwZoomIn').onclick=()=>{studioZoom=Math.min(200,studioZoom+25);zoom()};document.getElementById('fwZoomFit').onclick=()=>{studioZoom=100;zoom()};zoom();
    document.getElementById('fwActual').onclick=()=>{studioZoom=Math.max(25,Math.min(200,Math.round(formats[draft.format][1]/Math.max(1,wrap.clientWidth-64)*100)));zoom()};
  }

  let selectedElement='title';
  function fillPicker(host,label,initial,onChange){
    let fill=structuredClone(initial||{type:'solid',colors:['#075cf4','#e968a0'],angle:135});if(fill.colors.length<2)fill.colors.push('#e968a0');
    const root=document.createElement('section');root.className='fw-fill-picker';root.innerHTML=`<h4>${label}</h4><div class="fw-solid-palette">${solidColors.map(color=>`<button type="button" data-solid="${color}" style="background:${color}" aria-label="${label} ${color}" title="${color}"></button>`).join('')}</div><h5>그라데이션</h5><div class="fw-gradient-palette">${gradientColors.map(([name,a,b],i)=>`<button type="button" data-gradient="${i}" style="background:linear-gradient(135deg,${a},${b})" aria-label="${label} ${name} 그라데이션" title="${name}"></button>`).join('')}</div><details><summary>직접 색상 설정</summary><label>채우기<select data-fill-mode aria-label="${label} 채우기"><option value="solid">단색</option><option value="gradient">그라데이션</option></select></label><div class="fw-custom-stops">${[0,1].map(i=>`<label>색상 ${i+1}<input type="color" data-stop="${i}" aria-label="${label} 색상 ${i+1}"><input type="text" data-hex="${i}" aria-label="${label} 색상 ${i+1} HEX" maxlength="7" pattern="#[a-fA-F0-9]{6}"></label>`).join('')}</div><label data-angle-row>방향 <input type="range" min="0" max="360" step="15" data-angle aria-label="${label} 그라데이션 방향"><output></output></label></details>`;
    host.append(root);
    const sync=()=>{root.querySelector('[data-fill-mode]').value=fill.type;root.querySelectorAll('[data-stop]').forEach(el=>el.value=fill.colors[+el.dataset.stop]);root.querySelectorAll('[data-hex]').forEach(el=>el.value=fill.colors[+el.dataset.hex]);root.querySelector('[data-angle]').value=fill.angle;root.querySelector('output').textContent=fill.angle+'°';root.querySelector('[data-stop="1"]').closest('label').hidden=fill.type!=='gradient';root.querySelector('[data-angle-row]').hidden=fill.type!=='gradient';root.querySelectorAll('[data-solid]').forEach(b=>b.setAttribute('aria-pressed',String(fill.type==='solid'&&b.dataset.solid===fill.colors[0])));root.querySelectorAll('[data-gradient]').forEach(b=>{const g=gradientColors[+b.dataset.gradient];b.setAttribute('aria-pressed',String(fill.type==='gradient'&&fill.colors[0]===g[1]&&fill.colors[1]===g[2]))})};
    const change=()=>{sync();onChange(structuredClone(fill))};
    root.querySelectorAll('[data-solid]').forEach(b=>b.onclick=()=>{fill.type='solid';fill.colors[0]=b.dataset.solid;change()});root.querySelectorAll('[data-gradient]').forEach(b=>b.onclick=()=>{fill={type:'gradient',colors:gradientColors[+b.dataset.gradient].slice(1),angle:135};change()});
    root.querySelector('[data-fill-mode]').onchange=e=>{fill.type=e.target.value;change()};root.querySelectorAll('[data-stop]').forEach(el=>el.oninput=e=>{fill.colors[+el.dataset.stop]=e.target.value;change()});root.querySelectorAll('[data-hex]').forEach(el=>el.onchange=e=>{if(/^#[0-9a-f]{6}$/i.test(e.target.value)){fill.colors[+el.dataset.hex]=e.target.value;change()}else sync()});root.querySelector('[data-angle]').oninput=e=>{fill.angle=+e.target.value;change()};sync();
  }
  function defaultTextAlign(key){return key==='cta'||formats[draft.format][1]/formats[draft.format][2]<1.35?'center':'left'}
  function selectionOutline(){
    const canvas=document.getElementById('fwCanvas'),wrap=canvas?.parentElement;if(!canvas)return;let outline=wrap.querySelector('.fw-selection-outline');if(!outline){outline=document.createElement('div');outline.className='fw-selection-outline';outline.setAttribute('aria-hidden','true');wrap.append(outline)}
    const hit=hits.find(x=>x.key===selectedElement);outline.hidden=!hit;if(!hit)return;const rect=canvas.getBoundingClientRect(),parent=wrap.getBoundingClientRect(),f=formats[draft.format];Object.assign(outline.style,{left:rect.left-parent.left+wrap.scrollLeft+hit.x*rect.width/f[1]+'px',top:rect.top-parent.top+wrap.scrollTop+hit.y*rect.height/f[2]+'px',width:hit.w*rect.width/f[1]+'px',height:hit.h*rect.height/f[2]+'px'});
  }
  function removeSelected(){if(draft.textStyles?.[selectedElement]?.locked)return;if(selectedElement==='image')draft.artMode='none';else{draft.textStyles=draft.textStyles||{};draft.textStyles[selectedElement]={...draft.textStyles[selectedElement],hidden:true}}persist();selectElement(selectedElement);preview()}
  let canvasObserver;
  function movementDelta(hit,dx,dy,w,h,others=[],tolerance=0){
    const clamp=(v,start,size,limit)=>Math.max(-start,Math.min(Math.max(0,limit-size)-start,v));
    dx=clamp(dx,hit.x,hit.w,w);dy=clamp(dy,hit.y,hit.h,h);
    const snap=(value,start,size,limit,axis)=>{
      const targets=[0,limit/2,limit,...others.flatMap(o=>axis==='x'?[o.x,o.x+o.w/2,o.x+o.w]:[o.y,o.y+o.h/2,o.y+o.h])];
      let best=null;
      for(const target of targets)for(const offset of [0,size/2,size]){const delta=target-start-offset,distance=Math.abs(delta-value);if(distance<=tolerance&&(!best||distance<best.distance)&&delta===clamp(delta,start,size,limit))best={delta,target,distance};}
      return best;
    };
    const x=tolerance?snap(dx,hit.x,hit.w,w,'x'):null,y=tolerance?snap(dy,hit.y,hit.h,h,'y'):null;
    return {dx:x?x.delta:dx,dy:y?y.delta:dy,gx:x?.target,gy:y?.target};
  }
  function bindCanvasMovement(canvas){
    let drag=null;const coords=e=>{const rect=canvas.getBoundingClientRect(),f=formats[draft.format];return {x:(e.clientX-rect.left)*f[1]/rect.width,y:(e.clientY-rect.top)*f[2]/rect.height}};
    const position=key=>key==='image'?(draft.imagePosition||{}):(draft.textStyles?.[key]||{});
    const locked=key=>!!draft.textStyles?.[key]?.locked;
    const move=(key,x,y)=>{if(key==='image')draft.imagePosition={...draft.imagePosition,x,y};else{draft.textStyles=draft.textStyles||{};draft.textStyles[key]={...draft.textStyles[key],x,y}}};
    const guides=(gx,gy)=>{const parent=canvas.parentElement,r=canvas.getBoundingClientRect(),p=parent.getBoundingClientRect(),f=formats[draft.format];for(const [axis,value] of [['x',gx],['y',gy]]){let line=parent.querySelector('.fw-guide-'+axis);if(!line){line=document.createElement('div');line.className='fw-move-guide fw-guide-'+axis;parent.append(line)}line.hidden=value==null;Object.assign(line.style,axis==='x'?{left:r.left-p.left+parent.scrollLeft+(value||0)*r.width/f[1]+'px',top:r.top-p.top+parent.scrollTop+'px',height:r.height+'px'}:{top:r.top-p.top+parent.scrollTop+(value||0)*r.height/f[2]+'px',left:r.left-p.left+parent.scrollLeft+'px',width:r.width+'px'});}};
    const finish=cancel=>{if(!drag)return;const current=drag;drag=null;guides();if(cancel)move(current.key,current.x,current.y);else if(current.moved)persist();if(canvas.hasPointerCapture(current.id))canvas.releasePointerCapture(current.id);canvas.style.cursor='grab';preview()};
    canvas.onclick=null;canvas.style.touchAction='none';canvas.title='드래그로 이동 · Shift 드래그: 한 방향 · Alt: 맞춤 해제 · 방향키: 1px · Shift+방향키: 10px · Esc: 이동 취소';
    canvas.onpointerdown=e=>{if(e.button!==0)return;const p=coords(e),hit=[...hits].reverse().find(a=>p.x>=a.x&&p.x<=a.x+a.w&&p.y>=a.y&&p.y<=a.y+a.h);canvas.focus({preventScroll:true});if(!hit){selectedElement=null;selectionOutline();return}e.preventDefault();selectElement(hit.key);canvas.focus({preventScroll:true});const old=position(hit.key);if(locked(hit.key))return;drag={key:hit.key,id:e.pointerId,p,hit:{...hit},x:old.x||0,y:old.y||0,moved:false};canvas.setPointerCapture(e.pointerId)};
    canvas.onpointermove=e=>{const p=coords(e);if(!drag){const hit=[...hits].reverse().find(a=>p.x>=a.x&&p.x<=a.x+a.w&&p.y>=a.y&&p.y<=a.y+a.h);canvas.style.cursor=hit?(locked(hit.key)?'not-allowed':'grab'):'default';return}const f=formats[draft.format],ratio=f[1]/canvas.getBoundingClientRect().width;let dx=p.x-drag.p.x,dy=p.y-drag.p.y;if(!drag.moved&&Math.hypot(dx,dy)<3*ratio)return;drag.moved=true;canvas.style.cursor='grabbing';const horizontal=Math.abs(dx)>=Math.abs(dy);if(e.shiftKey){if(horizontal)dy=0;else dx=0;}const result=movementDelta(drag.hit,dx,dy,f[1],f[2],hits.filter(a=>a.key!==drag.key),e.altKey?0:5*ratio);if(e.shiftKey){if(horizontal){result.dy=0;result.gy=null}else{result.dx=0;result.gx=null}}move(drag.key,drag.x+result.dx/f[1],drag.y+result.dy/f[2]);preview();guides(result.gx,result.gy)};
    canvas.onpointerup=()=>finish(false);canvas.onpointercancel=()=>finish(true);canvas.onlostpointercapture=()=>finish(true);
    canvas.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();if(drag)finish(true);else{selectedElement=null;selectionOutline()}return}if(drag)return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();document.getElementById(e.shiftKey?'fwRedo':'fwUndo')?.click();canvas.focus({preventScroll:true});return}if(!selectedElement)return;if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeSelected();return}const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(!directions[e.key])return;const hit=hits.find(x=>x.key===selectedElement);if(!hit||locked(selectedElement))return;e.preventDefault();const f=formats[draft.format],old=position(selectedElement),step=e.shiftKey?10:1,[dx,dy]=directions[e.key],delta=movementDelta(hit,dx*step,dy*step,f[1],f[2]);move(selectedElement,(old.x||0)+delta.dx/f[1],(old.y||0)+delta.dy/f[2]);persist();preview()};
    canvas.ondblclick=()=>{if(selectedElement)editInline(canvas)};
    canvasObserver?.disconnect();canvasObserver=new ResizeObserver(selectionOutline);canvasObserver.observe(canvas);
  }

  function textValue(key){return draft.extraTexts?.find(x=>x.key===key)?.value??draft[key]??''}
  function setTextValue(key,value){const item=draft.extraTexts?.find(x=>x.key===key);if(item)item.value=value;else draft[key]=value;const field=document.getElementById('fw-'+key);if(field)field.value=value;}
  function editInline(canvas){
    const key=selectedElement,hit=hits.find(x=>x.key===key);if(!hit||key==='image'||draft.textStyles?.[key]?.locked)return;
    document.querySelector('.fw-inline-editor')?.blur();const rect=canvas.getBoundingClientRect(),f=formats[draft.format],input=document.createElement('textarea');input.className='fw-inline-editor';input.setAttribute('aria-label','캔버스 문구 편집');input.value=textValue(key);
    Object.assign(input.style,{position:'fixed',left:rect.left+hit.x*rect.width/f[1]+'px',top:rect.top+hit.y*rect.height/f[2]+'px',width:hit.w*rect.width/f[1]+'px',height:Math.max(44,hit.h*rect.height/f[2])+'px',fontSize:hit.fs*rect.width/f[1]+'px',fontFamily:hit.fontFamily,fontWeight:hit.weight,textAlign:hit.align,lineHeight:hit.lineHeight});
    let cancel=false;input.onkeydown=e=>{e.stopPropagation();if(e.isComposing)return;if(e.key==='Escape'){cancel=true;input.blur()}else if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();input.blur()}};
    input.onblur=()=>{if(!cancel){setTextValue(key,input.value);persist()}input.remove();selectElement(key)};document.body.append(input);input.focus();input.select();
  }
  function textInspector(box,key){
    const st=draft.textStyles?.[key]||{},hit=hits.find(x=>x.key===key),locked=!!st.locked;
    const update=(prop,value)=>{draft.textStyles??={};draft.textStyles[key]={...draft.textStyles[key],[prop]:value};persist();preview()};
    const number=(label,prop,value,min,max,step=1)=>'<label>'+label+'<input type="number" data-prop="'+prop+'" aria-label="'+label+'" value="'+value+'" min="'+min+'" max="'+max+'" step="'+step+'"></label>';
    box.innerHTML='<h3>텍스트 <small>'+escaped(fieldNames[key]||'복제 문구')+'</small></h3><div class="fw-text-actions"><button data-duplicate>복제</button><button data-lock aria-pressed="'+locked+'">'+(locked?'잠금 해제':'잠금')+'</button></div><fieldset '+(locked?'disabled':'')+'><label>문구<textarea aria-label="선택한 텍스트" rows="3">'+escaped(textValue(key))+'</textarea></label><label>글꼴<select data-font aria-label="글꼴"><option>Pretendard</option><option>Noto Sans KR</option><option>Arial</option></select></label><div class="fw-text-grid">'+number('글자 크기 (px)','fontSize',st.fontSize||Math.round((hit?.fs||24)*10)/10,6,300,.5)+'<label>굵기<select data-weight aria-label="글자 굵기"><option value="400">Regular</option><option value="500">Medium</option><option value="700">Bold</option><option value="800">Extra Bold</option><option value="900">Black</option></select></label></div><div class="fw-type-buttons"><button data-step="-1" aria-label="글자 크기 줄이기">−</button><button data-step="1" aria-label="글자 크기 늘리기">＋</button><button data-toggle="italic" aria-pressed="'+!!st.italic+'"><i>I</i></button><button data-toggle="underline" aria-pressed="'+!!st.underline+'"><u>U</u></button></div><div class="fw-align-buttons">'+['left','center','right'].map((v,i)=>'<button data-align="'+v+'" aria-pressed="'+((st.align||hit?.align||defaultTextAlign(key))===v)+'">'+['왼쪽','가운데','오른쪽'][i]+'</button>').join('')+'</div><div class="fw-text-grid">'+number('자간 (px)','letterSpacing',st.letterSpacing||0,-5,30,.5)+number('줄 간격','lineHeight',st.lineHeight||1.35,.8,3,.05)+'</div><label>불투명도 <input aria-label="텍스트 불투명도" data-opacity type="range" min="0" max="100" value="'+(st.opacity??100)+'"></label><div data-colors></div><details><summary>외곽선</summary><label><input type="checkbox" data-effect="outline" '+(st.outline?'checked':'')+'> 사용</label>'+number('외곽선 두께','outlineWidth',st.outlineWidth||1,1,12)+'<input aria-label="외곽선 색상" type="color" data-effect-color="outlineColor" value="'+(st.outlineColor||'#ffffff')+'"></details><details><summary>그림자</summary><label><input type="checkbox" data-effect="shadow" '+(st.shadow?'checked':'')+'> 사용</label>'+number('그림자 흐림','shadowBlur',st.shadowBlur??4,0,30)+'</details><div class="fw-text-actions"><button data-order="-1">뒤로 보내기</button><button data-order="1">앞으로 가져오기</button></div></fieldset>';
    box.querySelector('textarea').onchange=e=>{setTextValue(key,e.target.value);persist();preview()};box.querySelector('[data-font]').value=st.fontFamily||'Pretendard';box.querySelector('[data-font]').onchange=e=>update('fontFamily',e.target.value);box.querySelector('[data-weight]').value=st.weight||hit?.weight||800;box.querySelector('[data-weight]').onchange=e=>update('weight',+e.target.value);
    box.querySelectorAll('[data-prop]').forEach(el=>el.onchange=()=>{const v=+el.value;if(!Number.isFinite(v)||el.value==='')return;el.value=Math.min(+el.max,Math.max(+el.min,v));update(el.dataset.prop,+el.value)});
    box.querySelectorAll('[data-step]').forEach(el=>el.onclick=()=>{const n=box.querySelector('[data-prop="fontSize"]');n.value=Math.max(6,Math.min(300,+n.value+ +el.dataset.step));n.onchange()});
    box.querySelectorAll('[data-toggle]').forEach(el=>el.onclick=()=>{const v=el.getAttribute('aria-pressed')!=='true';el.setAttribute('aria-pressed',v);update(el.dataset.toggle,v)});
    box.querySelectorAll('[data-align]').forEach(el=>el.onclick=()=>{update('align',el.dataset.align);box.querySelectorAll('[data-align]').forEach(b=>b.setAttribute('aria-pressed',b===el))});
    box.querySelector('[data-opacity]').oninput=e=>update('opacity',+e.target.value);box.querySelectorAll('[data-effect]').forEach(el=>el.onchange=()=>update(el.dataset.effect,el.checked));box.querySelectorAll('[data-effect-color]').forEach(el=>el.oninput=()=>update(el.dataset.effectColor,el.value));
    box.querySelectorAll('[data-order]').forEach(el=>el.onclick=()=>update('order',(draft.textStyles?.[key]?.order||0)+ +el.dataset.order));
    box.querySelector('[data-lock]').onclick=()=>{update('locked',!locked);selectElement(key)};
    box.querySelector('[data-duplicate]').disabled=locked;box.querySelector('[data-duplicate]').onclick=()=>{const id='text_'+crypto.randomUUID(),source=draft.extraTexts?.find(x=>x.key===key)?.source||key;draft.extraTexts??=[];draft.extraTexts.push({key:id,source,value:textValue(key)});draft.textStyles??={};draft.textStyles[id]={...structuredClone(st),x:(st.x||0)+.025,y:(st.y||0)+.025,locked:false,hidden:false};persist();preview();selectElement(id)};
    fillPicker(box.querySelector('[data-colors]'),'글자 색상',st.fill||{type:'solid',colors:[st.color||hit?.color||draft.ink||'#12336b','#e968a0'],angle:135},fill=>update('fill',fill));
  }
  function selectElement(key){
    if(!key)key='title';if(key.startsWith('text_')&&!draft.extraTexts?.some(x=>x.key===key))key='title';selectedElement=key;document.querySelector('[data-inspector=elements]')?.click();
    document.querySelectorAll('[data-fw-field]').forEach(el=>el.closest('label').classList.toggle('fw-selected-field',el.dataset.fwField===key));
    const box=document.getElementById('fwElementProperties');if(!box)return;
    if(key==='image'){
      box.innerHTML='<h3>이미지 · 교체 가능</h3><p>템플릿 영역 안에 비율을 유지하여 배치합니다.</p><button id="fwReplaceSelected">이미지 교체</button><button id="fwResetSelected">초기화</button>';
      box.querySelector('#fwReplaceSelected').onclick=()=>document.getElementById('fwImage').click();
      box.querySelector('#fwResetSelected').onclick=()=>{draft.image='';draft.artMode='image';draft.fit='contain';draft.imageX=50;draft.imageY=50;loadImage('');persist();editor()};
    }else{
      textInspector(box,key);
    }
    const actions=document.createElement('div');actions.className='fw-element-actions';const hidden=key==='image'?draft.artMode==='none':draft.textStyles?.[key]?.hidden;actions.innerHTML='<button type="button" data-position-reset>위치 초기화</button><button type="button" data-remove-element>'+ (hidden?'다시 표시':'선택 요소 삭제')+'</button>';box.querySelector('h3').after(actions);actions.querySelector('[data-remove-element]').onclick=()=>{if(!hidden){removeSelected();return}if(key==='image')draft.artMode='image';else draft.textStyles[key].hidden=false;persist();selectElement(key);preview()};actions.querySelector('[data-position-reset]').onclick=()=>{if(key==='image')delete draft.imagePosition;else if(draft.textStyles?.[key]){delete draft.textStyles[key].x;delete draft.textStyles[key].y}persist();preview()};
    box.querySelector('[data-position-reset]').disabled=!!draft.textStyles?.[key]?.locked;box.querySelector('[data-remove-element]').disabled=!!draft.textStyles?.[key]?.locked;const input=document.getElementById('fw-'+key);if(input?.closest('details'))input.closest('details').open=true;preview();
  }
  function reviewEditor(){
    if(!historyCurrent||JSON.parse(historyCurrent).id!==draft.id){undoStack=[];redoStack=[];historyCurrent=JSON.stringify(draft)}
    const top=document.querySelector('.fw-top'),save=document.getElementById('fwStatus');
    const name=document.createElement('input');name.id='fwProjectName';name.setAttribute('aria-label','프로젝트명');name.value=draft.name||formats[draft.format][0]+' 디자인';name.maxLength=80;top.insertBefore(name,save);name.oninput=()=>{draft.name=name.value;persist()};
    const actions=document.createElement('div');actions.className='fw-history';actions.innerHTML='<button id="fwUndo" aria-label="실행 취소" title="실행 취소">↶</button><button id="fwRedo" aria-label="다시 실행" title="다시 실행">↷</button>';top.insertBefore(actions,document.getElementById('fwDownload'));
    const travel=back=>{const from=back?undoStack:redoStack,to=back?redoStack:undoStack;if(!from.length)return;to.push(JSON.stringify(draft));draft=JSON.parse(from.pop());historyCurrent=JSON.stringify(draft);loadImage(draft.image);flush();editor()};
    document.getElementById('fwUndo').onclick=()=>travel(true);document.getElementById('fwRedo').onclick=()=>travel(false);historyButtons();
    const rail=document.querySelector('.fw-rail'),library=document.querySelector('.fw-library');
    const extras=document.createElement('section');extras.className='fw-extra-library';extras.hidden=true;library.append(extras);
    const restoreLibrary=()=>{extras.hidden=true};document.getElementById('fwTemplates').addEventListener('click',restoreLibrary);document.getElementById('fwAssets').addEventListener('click',restoreLibrary);
    const showExtra=mode=>{
      library.querySelector('.fw-template-grid').hidden=true;library.querySelector('.fw-library-assets').hidden=true;library.querySelector('.fw-template-search').hidden=true;extras.hidden=false;
      library.querySelector('h2').textContent=mode==='brand'?'브랜드 에셋':'레이어';
      rail.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.reviewPanel===mode));
      if(mode==='brand'){
        extras.innerHTML='<div class="fw-brand-card"><img src="assets/hanpass-logo-3.svg" alt="HANPASS 공식 로고"><b>HANPASS Logo</b><small>잠금 · 비율과 위치 유지</small></div><h3>브랜드 컬러</h3><p class="fw-hint">추천 색상으로 디자인 전체에 적용합니다.</p><div class="fw-brand-swatches">'+themes.map((t,i)=>`<button data-brand-theme="${i}" style="background:${themeSwatch(t)}" title="${t[0]}" aria-label="${t[0]}"></button>`).join('')+'</div><h3>공식 이미지</h3><button id="fwBrandCards">한패스 카드 사용</button><p class="fw-hint">원본 로고는 이동하거나 삭제할 수 없습니다.</p>';
        extras.querySelectorAll('[data-brand-theme]').forEach(b=>b.onclick=()=>{draft.theme=+b.dataset.brandTheme;delete draft.bg;delete draft.ink;delete draft.backgroundFill;persist();editor();document.getElementById('fwBrand').click()});
        extras.querySelector('#fwBrandCards').onclick=()=>{draft.image='';draft.artMode='image';loadImage('');persist();editor()};
      }else{
        const keys=[...document.querySelectorAll('[data-fw-field]')].map(el=>el.dataset.fwField);
        extras.innerHTML='<p class="fw-hint">수정할 요소를 선택하세요. 로고와 요소의 위치는 보호됩니다.</p><div class="fw-layer-list"><div>HANPASS Logo <small>잠금</small></div>'+keys.map(k=>`<button data-layer="${k}">${escaped(fieldNames[k])}<small>수정 가능</small></button>`).join('')+(hits.some(h=>h.key==='image')?'<button data-layer="image">카드 이미지<small>교체 가능</small></button>':'')+'<div>레이아웃 <small>잠금</small></div></div>';
        extras.querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>{selectElement(b.dataset.layer);document.getElementById('fw-'+b.dataset.layer)?.focus()});
      }
    };
    for(const [id,mode,icon,label] of [['fwContent','content','T','콘텐츠'],['fwBrand','brand','◈','브랜드'],['fwLayers','layers','▱','레이어']]){
      const b=document.createElement('button');b.id=id;b.dataset.reviewPanel=mode;b.innerHTML=`<span>${icon}</span>${label}`;rail.insertBefore(b,rail.querySelector('.fw-rail-bottom'));b.onclick=()=>mode==='content'?document.querySelector('.fw-content-panel').scrollIntoView({block:'start'}):showExtra(mode);
    }
    const properties=document.createElement('section');properties.id='fwElementProperties';document.querySelector('.fw-fields').prepend(properties);
    document.querySelectorAll('[data-fw-field]').forEach(el=>el.addEventListener('focus',()=>selectElement(el.dataset.fwField)));
    selectElement(selectedElement);
    bindCanvasMovement(document.getElementById('fwCanvas'));
    document.getElementById('fwDownload').textContent='다운로드 ↓';document.getElementById('fwDownload').onclick=exportDialog;
    top.querySelector('#fwStatus').title='현재 브라우저에 자동 저장됩니다. 서버 계정 저장은 아직 연결되지 않았습니다.';
  }
  function polishPanels(){
    const railIcons={
      'a[href="#home"]':'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
      '#fwTemplates':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M9 10h12"/>',
      'a[href="#mine"]':'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
      '#fwAssets':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
      '#fwBrand':'<path d="m12 3 3 2 3.5.5.5 3.5 2 3-2 3-.5 3.5-3.5.5-3 2-3-2-3.5-.5L5 15l-2-3 2-3 .5-3.5L9 5Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
      '#fwLayers':'<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>'
    };
    for(const [selector,paths] of Object.entries(railIcons)){
      const icon=document.querySelector('.fw-rail '+selector+' > span');
      if(icon){icon.classList.add('fw-nav-icon');icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+paths+'</svg>';}
    }
    const library=document.querySelector('.fw-library'),fields=document.querySelector('.fw-fields'),grid=library.querySelector('.fw-template-grid');
    library.classList.add('fw-reference-library');fields.classList.add('fw-reference-inspector');
    library.querySelector('h2').textContent='템플릿';library.querySelector(':scope > .fw-hint').hidden=true;
    const search=library.querySelector('.fw-template-search');search.placeholder='템플릿 검색';search.setAttribute('aria-label','템플릿 검색');
    const tabs=document.createElement('nav');tabs.className='fw-category-tabs';tabs.setAttribute('aria-label','템플릿 분류');tabs.innerHTML=['전체','이벤트','금융','생활'].map((t,i)=>`<button data-category="${i}" class="${i===0?'active':''}">${t}</button>`).join('');search.before(tabs);
    let category=0;const filter=()=>grid.querySelectorAll('button').forEach((b,i)=>{b.hidden=(category!==0&&Math.floor(i/2)!==category-1)||!b.textContent.toLowerCase().includes(search.value.toLowerCase())});search.oninput=filter;
    tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>{category=+b.dataset.category;tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));filter()});
    const names=premiumSets.map(x=>x.name);
    grid.querySelectorAll('button').forEach((b,i)=>{b.querySelector('b').textContent=names[i];b.querySelector('small').textContent=formats[draft.format][1]+' × '+formats[draft.format][2]+' · '+['아이스 블루','미드나잇 블루','스카이 블루','아쿠아 블루','코발트 블루','스카이 블루'][i]});
    const footer=document.createElement('div');footer.className='fw-library-footer';footer.innerHTML='<b>다른 크기로 시작하기</b><a href="#home"><span>＋</span> 크기와 디자인 선택</a>';library.append(footer);
    for(const id of ['fwAssets','fwBrand','fwLayers'])document.getElementById(id).addEventListener('click',()=>{tabs.hidden=true;footer.hidden=true});
    document.getElementById('fwTemplates').addEventListener('click',()=>{tabs.hidden=false;footer.hidden=false;library.querySelector('h2').textContent='템플릿';filter()});
    const property=document.getElementById('fwElementProperties'),content=document.querySelector('.fw-content-panel');
    content.querySelector('h2').textContent='텍스트';content.querySelector('.fw-hint').hidden=true;
    property.before(content);content.append(property);
    const advanced=fields.querySelector('.fw-advanced');advanced.open=false;
    const elementPane=document.createElement('div');elementPane.className='fw-inspector-elements';
    const pagePane=document.createElement('div');pagePane.className='fw-inspector-page';pagePane.hidden=true;
    const tabbar=document.createElement('nav');tabbar.className='fw-inspector-tabs';tabbar.setAttribute('aria-label','속성 패널');tabbar.innerHTML='<button class="active" data-inspector="elements">요소</button><button data-inspector="page">페이지</button>';
    const current=[...fields.children];fields.append(tabbar,elementPane,pagePane);current.forEach(n=>elementPane.append(n));
    pagePane.innerHTML='<h3>페이지 설정</h3><p class="fw-hint">선택한 디자인의 전체 스타일을 조정합니다.</p><div class="fw-page-size"><b>'+formats[draft.format][1]+' × '+formats[draft.format][2]+'px</b><span>현재 페이지 · 1 / 1</span></div>';
    pagePane.append(advanced);
    const colors=fields.querySelector('.fw-quick-colors');colors.querySelector('h4').textContent='스타일';elementPane.append(colors);
    colors.querySelector('.fw-themes').hidden=true;
    fillPicker(colors,'배경 색상',draft.backgroundFill||{type:'solid',colors:[draft.bg||premiumSets[draft.premium].bg,'#f5cadd'],angle:135},fill=>{draft.backgroundFill=fill;draft.bg=fill.colors[0];draft.ink=(fill.type==='gradient'?fill.colors:[fill.colors[0]]).every(color=>contrast(color,'#ffffff')>=4.5)?'#ffffff':'#10294f';persist();preview()});
    const imageCard=document.createElement('section');imageCard.className='fw-inspector-image';imageCard.innerHTML='<h3>이미지</h3><div class="fw-image-asset"><img alt="현재 디자인 이미지"><div><b>디자인 이미지</b><button id="fwPanelReplace">이미지 교체</button></div><button id="fwPanelClear" aria-label="이미지 숨기기" title="이미지 숨기기">×</button></div>';
    imageCard.querySelector('img').src=draft.image||(premiumSets[draft.premium]?.art==='card'?'assets/hanpass-cards.png':'assets/campaign-3d/'+premiumSets[draft.premium]?.art+'.png');colors.before(imageCard);
    const adjustments=document.createElement('details');adjustments.className='fw-image-adjustments';adjustments.innerHTML='<summary>이미지 맞춤·위치 조정</summary>';imageCard.append(adjustments);for(const id of ['fwImageFit','fwImageX','fwImageY']){const control=document.getElementById(id);if(control)adjustments.append(control.closest('label')||control.parentElement)}
    imageCard.querySelector('#fwPanelReplace').onclick=()=>document.getElementById('fwImage').click();imageCard.querySelector('#fwPanelClear').onclick=()=>{draft.artMode='none';persist();editor()};
    const layers=document.createElement('section');layers.className='fw-inspector-layers';layers.innerHTML='<h3>레이어</h3><div class="fw-layer-list"><div><span>◈　HANPASS Logo</span><small>잠금</small></div><button data-inspect-layer="title">T　메인 제목<small>수정 가능</small></button><button data-inspect-layer="image">▧　디자인 이미지<small>교체 가능</small></button><div><span>▱　레이아웃</span><small>잠금</small></div></div>';
    elementPane.append(layers);layers.querySelectorAll('[data-inspect-layer]').forEach(b=>b.onclick=()=>{selectElement(b.dataset.inspectLayer);document.getElementById('fw-'+b.dataset.inspectLayer)?.focus()});
    const quality=fields.querySelector('.fw-quality');pagePane.append(quality);
    tabbar.querySelectorAll('button').forEach(b=>b.onclick=()=>{const page=b.dataset.inspector==='page';elementPane.hidden=page;pagePane.hidden=!page;tabbar.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b))});
    const secondary=document.createElement('details');secondary.className='fw-extra-text';secondary.innerHTML='<summary>혜택·버튼·추가 안내</summary>';content.insertBefore(secondary,property);
    for(const key of ['offer','cta','note','period','coupon']){const input=document.getElementById('fw-'+key);if(input)secondary.append(input.closest('label'))}
    const require=document.getElementById('fwRequireNote');if(require)secondary.append(require.closest('label'));secondary.open=['offer','cta','note','period','coupon'].includes(selectedElement);
    content.prepend(property);const allText=document.createElement('div');allText.hidden=true;content.append(allText);Array.from(content.children).filter(e=>e!==property&&e!==allText).forEach(e=>allText.append(e));
    const textList=document.createElement('details');textList.className='fw-all-text';textList.innerHTML='<summary>문구 선택</summary><div class="fw-text-selector"></div>';content.append(textList);
    const refreshTextList=()=>{const list=textList.querySelector('div');list.replaceChildren();for(const [key,label] of [...Object.entries(fieldNames),...(draft.extraTexts||[]).map(x=>[x.key,'복제 문구'])]){const button=document.createElement('button');button.type='button';button.textContent=label+(draft.textStyles?.[key]?.hidden?' · 숨김':'');button.setAttribute('aria-pressed',String(selectedElement===key));button.onclick=()=>{selectElement(key);refreshTextList();property.scrollIntoView({block:'start',behavior:'smooth'});property.querySelector('textarea')?.focus({preventScroll:true})};list.append(button)}};refreshTextList();
    if(require){const notice=document.createElement('details');notice.className='fw-all-text';notice.innerHTML='<summary>안내 설정</summary>';notice.append(require.closest('label'));content.append(notice)}
    const layerList=layers.querySelector('.fw-layer-list');for(const item of draft.extraTexts||[]){const b=document.createElement('button');b.textContent='T '+item.value.slice(0,20)+(draft.textStyles?.[item.key]?.hidden?' · 숨김':'');b.onclick=()=>selectElement(item.key);layerList.append(b)}
if(studioLibrary==='assets'){tabs.hidden=true;footer.hidden=true;library.querySelector('h2').textContent='이미지·아이콘'}
  }

  function exportDialog(){
    document.getElementById('fwExportDialog')?.remove();const modal=document.createElement('dialog');modal.id='fwExportDialog';modal.className='fw-export-dialog';modal.setAttribute('aria-label','디자인 다운로드');
    modal.innerHTML='<form method="dialog"><header><h2>디자인 다운로드</h2><button aria-label="닫기">×</button></header><p>현재 작업본을 파일로 저장합니다.</p><label>파일 형식<select id="fwExportType"><option value="png">PNG · 선명한 이미지</option><option value="jpg">JPG · 작은 용량</option></select></label><label>사이즈<select id="fwExportScale"><option value="1">원본 크기</option><option value="2">2배 크기</option></select></label><div class="fw-export-summary">배경 포함 · 현재 디자인 문구 그대로</div><p id="fwExportMessage" role="status"></p><button type="button" class="primary" id="fwExportConfirm">다운로드</button></form>';document.body.append(modal);modal.showModal();modal.addEventListener('close',()=>modal.remove());
    modal.querySelector('#fwExportConfirm').onclick=async e=>{
      const b=e.currentTarget,msg=modal.querySelector('#fwExportMessage');preview();if(checks.some(x=>x.error)){msg.textContent='문구 넘침 또는 필수 안내를 수정한 뒤 다운로드해 주세요.';return}b.disabled=true;msg.textContent='파일 생성 중…';
      try{await Promise.all([document.fonts.ready,editorFontReady,brandReady,premiumReady]);const c=document.createElement('canvas'),scale=+modal.querySelector('#fwExportScale').value,type=modal.querySelector('#fwExportType').value;paint(c,draft,picture,false,scale);const blob=await new Promise(resolve=>c.toBlob(resolve,type==='jpg'?'image/jpeg':'image/png',.95));if(!blob)throw Error();const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(draft.name||'hanpass-design').replace(/[<>:"/\\|?*]/g,'_')+'-'+c.width+'x'+c.height+'.'+type;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);msg.textContent=`${c.width} × ${c.height}px ${type.toUpperCase()} 생성 완료`;status('다운로드 파일 생성 완료');flush()}catch{msg.textContent='파일을 만들지 못했습니다. 다시 시도해 주세요.'}finally{b.disabled=false}
    };
  }

  function editor(){if(!draft&&!restore()){start(1);return}if(draft.premium===undefined){draft.premium=0;draft.layout='benefit';}document.body.classList.remove('hp-home');document.body.classList.add('fw-editing');
    const f=formats[draft.format],strip=f[1]/f[2]>4;
    document.getElementById('app').innerHTML=`<div class="fw-editor"><header class="fw-top"><a href="#home" class="fw-logo"><span class="fw-brand-crop"><img src="assets/hanpass-logo-white.svg" alt="한패스"></span> <small>CREATIVE STUDIO</small></a><span id="fwStatus" role="status">편집 내용은 이 브라우저에 저장돼요</span><button id="fwDownload" class="primary">PNG 다운로드 ↓</button></header><div class="fw-editor-title"><div><button id="fwBack" class="ghost">← 크기 다시 선택</button><h1>${f[0]} <span>${f[1]} × ${f[2]}px</span></h1></div><span>문구·이미지를 드래그해 이동하세요. Delete 키로 삭제할 수 있어요.</span></div><main class="fw-workbench"><section class="fw-preview"><div class="fw-preview-label"><b>디자인 미리보기</b><span>원본 ${f[1]} × ${f[2]}px</span></div><div class="fw-canvas-wrap"><canvas id="fwCanvas" tabindex="0" aria-label="디자인 미리보기. 문구를 클릭하면 왼쪽 입력란에서 수정할 수 있습니다."></canvas></div><p>디자인의 문구를 클릭하거나 왼쪽에서 직접 편집하세요.</p><div class="fw-themes">${themes.map((t,i)=>`<button data-theme="${i}" class="${i===draft.theme?'selected':''}"><i style="background:${themeSwatch(t)}"></i>${t[0]} ${i===draft.theme?'✓':''}</button>`).join('')}</div></section><aside class="fw-fields"><h2>내 내용으로 편집</h2>${[['title','제목'],['desc','설명'],...(!strip?[['offer','혜택 문구'],['cta','버튼 문구']]:[]),['note','추가 안내']].map(([k,n])=>`<label>${n}<textarea id="fw-${k}" data-fw-field="${k}" rows="2" maxlength="300">${escaped(draft[k]||'')}</textarea></label>`).join('')}${strip?'<p class="fw-hint">얇은 배너는 제목과 설명 중심으로 구성됩니다. 혜택·버튼 문구는 넓은 규격에서 표시돼요.</p>':''}<label>글자 크기 <input id="fwScale" type="range" min="70" max="130" value="${draft.scale||100}"></label><div class="fw-colors"><label>배경색<input id="fwBg" type="color" value="${draft.bg||premiumSets[draft.premium]?.bg||themes[draft.theme][1]}"></label><label>글자색<input id="fwInk" type="color" value="${draft.ink||premiumSets[draft.premium]?.ink||themes[draft.theme][2]}"></label></div><label>이미지 바꾸기<input id="fwImage" type="file" accept="image/png,image/jpeg,image/webp"></label><button id="fwRemoveImage">기본 카드 이미지로 되돌리기</button><p class="fw-hint">이미지는 비율을 유지해 배치됩니다. 저장 파일의 크기는 선택한 규격과 같아요.</p></aside></main></div>`;
    enhanceEditor();quickChoices();studioShell();preview();document.getElementById('fwBack').onclick=()=>navigate('home');
    document.querySelectorAll('[data-fw-field]').forEach(el=>el.oninput=()=>{draft[el.dataset.fwField]=el.value;preview();persist()});
    for(const [id,key]of [['fwScale','scale'],['fwBg','bg'],['fwInk','ink']])document.getElementById(id).oninput=e=>{draft[key]=key==='scale'?+e.target.value:e.target.value;if(key==='bg')delete draft.backgroundFill;preview();persist()};
    document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{draft.theme=+b.dataset.theme;delete draft.bg;delete draft.ink;delete draft.backgroundFill;if(draft.premium!==undefined&&!b.dataset.studioTemplate){draft.bg=themes[draft.theme][1];draft.ink=themes[draft.theme][2]}persist();editor()});
    document.getElementById('fwCanvas').onclick=e=>{const r=e.target.getBoundingClientRect(),x=(e.clientX-r.left)*f[1]/r.width,y=(e.clientY-r.top)*f[2]/r.height;const hit=hits.find(a=>x>=a.x&&x<=a.x+a.w&&y>=a.y&&y<=a.y+a.h);const el=hit&&document.getElementById('fw-'+hit.key);if(el){el.focus();el.select()}};
    document.getElementById('fwImage').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>8*1024*1024)return status('8MB 이하의 이미지를 선택해 주세요.');const uploadDraft=draft;try{status('이미지 업로드 중…');const bitmap=await createImageBitmap(file);const c=document.createElement('canvas'),s=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));c.width=Math.round(bitmap.width*s);c.height=Math.round(bitmap.height*s);c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);bitmap.close();const uploadedImage=cloud?await cloud.upload(file):c.toDataURL('image/png');if(draft!==uploadDraft)return;draft.artMode='image';draft.image=uploadedImage;loadImage(draft.image);persist();editor()}catch{status('지원하는 PNG, JPG, WebP 이미지를 선택해 주세요.')}};
    document.getElementById('fwRemoveImage').onclick=()=>{draft.image='';picture=null;preview();persist()};
    document.getElementById('fwDownload').onclick=async e=>{const b=e.currentTarget;preview();if(checks.some(x=>x.error)){status('표시된 글자 넘침·필수 항목을 수정한 후 다운로드해 주세요.');document.getElementById('fwChecks').scrollIntoView({block:'nearest'});return}b.disabled=true;try{await Promise.all([document.fonts.ready,editorFontReady,brandReady,premiumReady]);const c=document.createElement('canvas');paint(c,draft,picture);const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error();const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`hanpass-${f[1]}x${f[2]}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);status(`${f[1]} × ${f[2]}px PNG 저장 완료`)}catch{status('다운로드하지 못했어요. 다시 시도해 주세요.')}finally{b.disabled=false}};
  }
  async function openSvgEditor(){try{const source=draft.svgRef?await HanpassDesignStorage.load(draft.svgRef):draft.svgDesign;await HanpassSvg.open({source,name:draft.name,onSave:async source=>{const ref=await HanpassDesignStorage.save(source);draft.svgRef=ref;delete draft.svgDesign;persist();flush();const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved?.svgRef!==ref)throw Error('디자인 목록을 저장하지 못했습니다. 파일을 내려받아 보관해 주세요.');},onClose:()=>navigate('mine')})}catch(e){notify(e.message)}}
  function bindSvgImport(){
    if(document.getElementById('fwSvgImport'))return;const top=document.querySelector('.fw-top')||document.querySelector('.hp-hero nav')||document.querySelector('#app main')||document.getElementById('app');if(!top)return;
    const button=document.createElement('button');button.id='fwSvgImport';button.className='sv-import-button';button.textContent='SVG 디자인 가져오기';button.title='피그마·일러스트에서 SVG로 내보내기 · 텍스트 윤곽선 변환 해제';
    const input=document.createElement('input');input.type='file';input.accept='.svg,image/svg+xml';input.hidden=true;input.setAttribute('aria-label','SVG 디자인 파일');top.prepend(button,input);button.onclick=()=>input.click();input.onchange=async()=>{const file=input.files[0];if(!file)return;try{status('SVG 원본을 읽는 중…');const parsed=HanpassSvg.clean(await file.text());const svgRef=await HanpassDesignStorage.save(HanpassSvg.serialize(parsed.svg));flush();draft={id:crypto.randomUUID(),format:1,theme:0,title:file.name.replace(/\.svg$/i,''),name:file.name.replace(/\.svg$/i,''),desc:'',image:'',scale:100,svgRef};picture=null;persist();flush();navigate('format-edit')}catch(e){notify(e.message);input.value=''}};
  }
  const renderBaseEditor=editor;editor=function(){if(!draft)restore();if(draft?.svgDesign||draft?.svgRef){openSvgEditor();return}renderBaseEditor();reviewEditor();polishPanels();bindSvgImport()};
  const previousNavigate=navigate;
  navigate=function(page){if(state.page==='format-edit')flush();previousNavigate(page)};
  if(cloud)cloud.listen((message,saved,result,source)=>{status(message);if(saved){const w=works.find(w=>w.id===saved.id);if(w&&w.image===source.image)w.image=saved.image;if(draft?.id===saved.id&&draft.image===source.image)draft.image=saved.image;try{localStorage.setItem(worksKey,JSON.stringify(works));if(draft)localStorage.setItem(storageKey,JSON.stringify(draft))}catch{}}});
  window.addEventListener('pagehide',flush);
  render=function(){if(state.page!=='format-edit'&&saveTimer)flush();if(state.page==='format-edit'){editor();return}document.body.classList.remove('fw-editing');baseRender();home();if(state.page==='mine'){const filters=document.querySelector('.filters');if(filters)filters.remove();const info=document.querySelector('.easy-disclaimer');if(info)info.textContent='내 디자인은 이 브라우저에 저장됩니다. 다른 PC와 자동으로 공유되지 않습니다.'}bindWorks();bindSvgImport()};
  Promise.all([document.fonts.ready,editorFontReady,brandReady,premiumReady]).then(()=>{if(state.page==='format-edit')preview();else{home();bindWorks()}});render();
})();









