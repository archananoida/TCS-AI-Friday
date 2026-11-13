// PipelineIQ local demo server — Node.js 22+, no npm dependencies.
const http=require("node:http");
const fs=require("node:fs");
const path=require("node:path");
const api=require("./api/index.js");
const root=path.resolve(__dirname,"public");
const port=Number(process.env.PORT)||3000;
const mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml"};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,"http://localhost");
 if(url.pathname.startsWith("/api/")){
  res.status=function(n){this.statusCode=n;return this};
  res.json=function(body){if(!this.headersSent){this.setHeader("Content-Type","application/json; charset=utf-8");this.end(JSON.stringify(body))}return this};
  try{await api(req,res)}catch(err){console.error("Local API error:",err.message);if(!res.headersSent)res.status(500).json({error:"Internal server error"})}
  return;
 }
 if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405).end("Method not allowed");return}
 let name;
 try{name=decodeURIComponent(url.pathname)}catch{res.writeHead(400).end("Invalid path");return}
 if(name.includes("\0")){res.writeHead(400).end("Invalid path");return}
 const file=path.resolve(root,"."+ (name==="/"?"/index.html":name));
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end("Forbidden");return}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404).end("Not found");return}
  res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
  if(req.method==="HEAD"){res.end();return}
  fs.createReadStream(file).pipe(res);
 });
});
server.listen(port,"127.0.0.1",()=>console.log("PipelineIQ local demo: http://localhost:"+port));
