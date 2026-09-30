import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../dist/format-workspace.js',import.meta.url),'utf8');
const context=vm.createContext({});
vm.runInContext(source.slice(source.indexOf('  function movementDelta('),source.indexOf('  function bindCanvasMovement(')),context);
const move=context.movementDelta;
test('movement clamps all edges and preserves exact keyboard increments',()=>{
 const hit={x:20,y:30,w:100,h:50};
 assert.equal(move(hit,1,0,640,284).dx,1);
 assert.equal(move(hit,10,0,640,284).dx,10);
 assert.equal(move(hit,-100,-100,640,284).dx,-20);
 assert.equal(move(hit,1000,1000,640,284).dy,204);
});
test('snapping aligns to other element edges and can be disabled',()=>{
 const hit={x:20,y:30,w:100,h:50},other={x:180,y:150,w:80,h:40};
 const snapped=move(hit,158,0,640,284,[other],5);
 assert.equal(snapped.dx,160);assert.equal(snapped.gx,180);
 assert.equal(move(hit,158,0,640,284,[other],0).dx,158);
});
test('all compact banner formats stack logo above copy and reserve artwork space',()=>{
 for(const [w,h] of [[616,136],[640,144],[840,70],[998,70],[1100,70],[260,56]]){
  const logos=[];const ctx=new Proxy({measureText:s=>({width:s.length*5,actualBoundingBoxAscent:6,actualBoundingBoxDescent:2}),drawImage:(...args)=>logos.push(args),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>k in t?t[k]:()=>{}});
  const sandbox={formats:[['banner',w,h]],themes:[['test','#ffffff','#12336b','#075cf4']],premiumSets:[],brandLogo:{naturalWidth:100},brandWhite:{naturalWidth:100},brandCards:{naturalWidth:100},window:{devicePixelRatio:1},hits:[],checks:[],fieldNames:{},contrast:()=>10,canvasFill:()=> '#fff'};
  vm.createContext(sandbox);vm.runInContext(source.slice(source.indexOf('  function wrap('),source.indexOf('  const galleryState=')),sandbox);
  sandbox.paint({getBoundingClientRect:()=>({width:w}),getContext:()=>ctx},{format:0,theme:0,title:'Welcome',desc:'Description',scale:100},null,true);
  const title=sandbox.hits.find(x=>x.key==='title'),desc=sandbox.hits.find(x=>x.key==='desc'),art=sandbox.hits.find(x=>x.key==='image');
  assert.ok(logos[0][2]+logos[0][4]<=title.y,`${w}: logo above title`);
  assert.ok(title.y+title.h<=desc.y,`${w}: title above description`);
  assert.ok(title.x+title.w<art.x,`${w}: copy separated from artwork`);
 }
});
