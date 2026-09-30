import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.json':'application/json','.zip':'application/zip'};
http.createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const target=path.resolve(root,'.'+(pathname==='/'?'/offline.html':pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}
 const bytes=await readFile(target);
 const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
 const range=req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
 if(range){
  const start=range[1]?Number(range[1]):Math.max(0,bytes.length-Number(range[2]));
  const end=range[1]&&range[2]?Math.min(Number(range[2]),bytes.length-1):bytes.length-1;
  if(start>end||start>=bytes.length){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`}).end();return}
  res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:bytes.subarray(start,end+1));
 }else{res.writeHead(200,{...headers,'Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes)}
}catch{res.writeHead(404).end('Not found')}}).listen(4175,'127.0.0.1',()=>console.log('Hanpass browser studio: http://127.0.0.1:4175/index.html'));
