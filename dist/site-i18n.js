// Interface localization only. User artwork, input values and saved design titles stay intact.
(() => {
  const languages=[['ko','한국어'],['en','English'],['vi','Tiếng Việt'],['ru','Русский'],['uz','O‘zbekcha'],['zh','简体中文'],['ja','日本語'],['ne','नेपाली'],['my','မြန်မာ'],['bn','বাংলা']];
  const valid=new Set(languages.map(x=>x[0]));
  let locale='ko';try{const stored=localStorage.getItem('hanpass-ui-language');if(valid.has(stored))locale=stored}catch{}
  const textRecords=new WeakMap(),attributeRecords=new WeakMap();
  const tables=window.HanpassLocales||{};
  const sourceKeys=Object.keys(tables.en||{}).sort((a,b)=>b.length-a.length);
  const escapeRegex=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp(sourceKeys.map(escapeRegex).join('|'),'g');
  function translate(source,language=locale){if(language==='ko'||!tables[language])return source;return source.replace(pattern,key=>tables[language][key]||key)}
  const exempt='script,style,textarea,canvas,[contenteditable],.fw-saved-info h3,.person,[data-no-localize]';
  function renderText(node){if(node.parentElement?.closest(exempt))return;let record=textRecords.get(node);if(!record||node.data!==record.rendered)record={source:node.data};const output=translate(record.source);if(output!==node.data)node.data=output;record.rendered=output;textRecords.set(node,record)}
  function renderAttribute(element,name){if(element.closest(exempt)||element.matches('[data-fw-open],[data-fw-copy]'))return;const current=element.getAttribute(name);let records=attributeRecords.get(element);if(!records){records={};attributeRecords.set(element,records)}let record=records[name];if(!record||current!==record.rendered)record={source:current};const output=translate(record.source);if(output!==current)element.setAttribute(name,output);record.rendered=output;records[name]=record}
  function addPicker(){
    const host=document.querySelector('.hp-nav')||document.querySelector('.fw-top')||document.querySelector('.topbar');
    if(!host||host.querySelector('.hp-language'))return;
    const label=document.createElement('label');label.className='hp-language';label.dataset.noLocalize='true';
    label.innerHTML='<span aria-hidden="true">◎</span><select aria-label="Language / 언어">'+languages.map(([code,name])=>'<option value="'+code+'" lang="'+code+'">'+name+'</option>').join('')+'</select>';
    const select=label.querySelector('select');select.value=locale;select.onchange=()=>setLocale(select.value);
    if(host.matches('.hp-nav'))host.insertBefore(label,host.querySelector('button'));else host.append(label);
  }
  function setFont(){
    const font={ne:'Noto Sans Devanagari',my:'Noto Sans Myanmar',bn:'Noto Sans Bengali',ja:'Noto Sans JP',zh:'Noto Sans SC'}[locale];
    document.documentElement.style.setProperty('--interface-font',font?'"'+font+'", "Noto Sans KR", Arial, sans-serif':'"Noto Sans KR", Arial, sans-serif');
    if(font&&!document.querySelector('link[data-language-font="'+locale+'"]')){const link=document.createElement('link');link.rel='stylesheet';link.dataset.languageFont=locale;link.href='https://fonts.googleapis.com/css2?family='+font.replaceAll(' ','+')+':wght@400;500;600;700;800&display=swap';document.head.append(link)}
  }
  const observation={subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','alt']};
  let queued=false;
  const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(apply)}});
  function apply(){
    queued=false;observer.disconnect();
    try{
      addPicker();document.documentElement.lang=locale==='zh'?'zh-Hans':locale;document.documentElement.dataset.uiLanguage=locale;
      document.querySelectorAll('.hp-language select').forEach(s=>{if(s.value!==locale)s.value=locale});
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode())renderText(n);
      document.querySelectorAll('[placeholder],[title],[aria-label],[alt]').forEach(e=>{for(const attr of ['placeholder','title','aria-label','alt'])if(e.hasAttribute(attr))renderAttribute(e,attr)});
    }finally{observer.observe(document.body,observation)}
  }
  function setLocale(next){if(!valid.has(next))return;locale=next;try{localStorage.setItem('hanpass-ui-language',next)}catch{}setFont();apply()}
  window.HanpassI18n={translate,setLocale,get locale(){return locale},languages};
  setFont();apply();
})();
