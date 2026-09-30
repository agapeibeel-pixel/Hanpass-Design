import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../dist/format-workspace.js',import.meta.url),'utf8');
function render(interactive){
 const calls=[];const ctx=new Proxy({measureText:s=>({width:s.length*8,actualBoundingBoxAscent:12,actualBoundingBoxDescent:3}),fillText(...args){calls.push({args,font:this.font,alpha:this.globalAlpha,spacing:this.letterSpacing})},createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get(t,k){return k in t?t[k]:()=>{}}});
 const sandbox={formats:[['test',640,284]],themes:[['test','#ffffff','#12336b','#075cf4']],premiumSets:[],brandLogo:{},brandWhite:{},brandCards:{},window:{devicePixelRatio:1},hits:[],checks:[],fieldNames:{title:'제목'},contrast:()=>10,canvasFill:()=> '#075cf4'};
 vm.createContext(sandbox);vm.runInContext(source.slice(source.indexOf('  function wrap('),source.indexOf('  const galleryState=')),sandbox);
 const canvas={getBoundingClientRect:()=>({width:640}),getContext:()=>ctx};
 const d={format:0,theme:0,title:'Original',desc:'Description',scale:100,textStyles:{title:{fontSize:26,italic:true,underline:true,opacity:60,letterSpacing:2,order:2},copy:{x:.1,y:.1,fontSize:20,order:1}},extraTexts:[{source:'title',key:'copy',value:'Copy'}]};
 sandbox.paint(canvas,d,null,interactive);return {calls,sandbox,canvas};
}
test('preview and export use identical text styling and layer order',()=>{const preview=render(true),exported=render(false);assert.deepEqual(preview.calls,exported.calls);const title=preview.calls.find(x=>x.args[0]==='Original');assert.match(title.font,/italic.*26px/);assert.equal(title.alpha,.6);assert.equal(title.spacing,'2px');assert.ok(preview.calls.findIndex(x=>x.args[0]==='Copy')<preview.calls.findIndex(x=>x.args[0]==='Original'));assert.ok(preview.sandbox.hits.some(x=>x.key==='copy'));assert.equal(exported.canvas.width,640)});
