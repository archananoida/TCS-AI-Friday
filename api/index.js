// PipelineIQ synthetic API for Vercel Node.js Functions. No external dependencies.
const pipelines=[
{id:"orders_ingest",name:"Orders Ingestion",status:"healthy",depends_on:[]},
{id:"customers_transform",name:"Customer Transform",status:"failed",depends_on:["orders_ingest"]},
{id:"warehouse_load",name:"Warehouse Load",status:"blocked",depends_on:["customers_transform"]},
{id:"inventory_sync",name:"Inventory Sync",status:"healthy",depends_on:[]},
{id:"billing_export",name:"Billing Export",status:"failed",depends_on:["warehouse_load"]}];
const logs=[
{id:1,pipeline_id:"customers_transform",level:"ERROR",message:"DatabaseError: customer_id cannot be null"},
{id:2,pipeline_id:"customers_transform",level:"INFO",message:"Processing fictional customer batch"},
{id:3,pipeline_id:"billing_export",level:"ERROR",message:"Connection timeout while calling fictional billing API"},
{id:4,pipeline_id:"warehouse_load",level:"WARN",message:"Upstream dependency customers_transform failed"},
{id:5,pipeline_id:"orders_ingest",level:"INFO",message:"Ingested 5000 synthetic orders"},
{id:6,pipeline_id:"inventory_sync",level:"INFO",message:"Inventory sync completed"}];
const rules=[
["cannot be null","Null constraint violation","Validate required source fields and mappings; quarantine invalid rows."],
["timeout","Connection timeout","Check API availability, connectivity, retry policy and latency."],
["dependency","Upstream dependency failure","Inspect and recover upstream pipeline before retrying downstream."],
["schema","Schema mismatch","Compare schemas and validate field types."],
["file not found","Missing source file","Check source path, schedule and permissions."]];
function diagnose(id){if(!pipelines.some(p=>p.id===id))return null;for(const l of logs){if(l.pipeline_id!==id||!["ERROR","WARN"].includes(l.level))continue;for(const [pattern,cause,recommendation] of rules){if(l.message.toLowerCase().includes(pattern))return {pipeline_id:id,cause,recommendation,evidence_log_ids:[l.id],verified:false,requires_human_approval:true};}}return {pipeline_id:id,cause:"Insufficient evidence",recommendation:"Review additional logs and dependencies.",evidence_log_ids:[],verified:false,requires_human_approval:true};}
module.exports=(req,res)=>{res.setHeader("Cache-Control","no-store");if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});const u=new URL(req.url,"https://localhost");const path=u.pathname;if(path==="/api/health")return res.status(200).json({status:"ok",mode:"synthetic"});if(path==="/api/pipelines")return res.status(200).json(pipelines);if(path==="/api/logs"){const rows=logs.filter(l=>(!u.searchParams.get("pipeline_id")||l.pipeline_id.toLowerCase()===u.searchParams.get("pipeline_id").toLowerCase())&&(!u.searchParams.get("level")||l.level.toLowerCase()===u.searchParams.get("level").toLowerCase())&&l.message.toLowerCase().includes((u.searchParams.get("q")||"").toLowerCase()));return res.status(200).json(rows);}if(path.startsWith("/api/diagnose/")){const d=diagnose(decodeURIComponent(path.slice("/api/diagnose/".length)));return d?res.status(200).json(d):res.status(404).json({error:"Pipeline not found"});}return res.status(404).json({error:"Not found"});};
