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

const history=[
{incident_id:"INC-101",pipeline_id:"customers_transform",symptom:"customer_id cannot be null",resolution:"Correct source mapping and quarantine incomplete rows"},
{incident_id:"INC-102",pipeline_id:"billing_export",symptom:"Connection timeout",resolution:"Validate API health and adjust retry backoff"},
{incident_id:"INC-103",pipeline_id:"warehouse_load",symptom:"Upstream dependency failed",resolution:"Restore upstream transform before resuming load"}
];
function analyze(id){
 const p=pipelines.find(x=>x.id===id);if(!p)return null;
 const d=diagnose(id);const own=logs.filter(x=>x.pipeline_id===id);
 const upstream=[];const seen=new Set();function walk(x){for(const parent of x.depends_on){if(seen.has(parent))continue;seen.add(parent);const node=pipelines.find(y=>y.id===parent);if(node){upstream.push({id:node.id,status:node.status});walk(node)}}}walk(p);
 const related=history.filter(x=>x.pipeline_id===id||x.symptom.toLowerCase().includes(d.cause.toLowerCase()));
 const impact=pipelines.filter(x=>x.depends_on.includes(id)).map(x=>x.id);
 const confidence=d.evidence_log_ids.length? (upstream.some(x=>x.status==="failed")?0.8:0.7):0.15;
 return {pipeline_id:id,engine:"evidence-rules",generative_ai_enabled:false,summary:p.name+" is "+p.status+". "+d.cause+".",hypothesis:d.cause,confidence,confidence_basis:d.evidence_log_ids.length?"Matching synthetic log signature; not an independently verified cause":"No matching error signature",recommended_steps:[d.recommendation,"Review linked evidence and verify the hypothesis before taking action."],evidence:own.filter(x=>d.evidence_log_ids.includes(x.id)),upstream,immediate_downstream_impact:impact,similar_incidents:related,verified:false,requires_human_approval:true};
}
module.exports=(req,res)=>{res.setHeader("Cache-Control","no-store");if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});const u=new URL(req.url,"https://localhost");const path=u.searchParams.has("requested")?"/api/"+u.searchParams.get("requested"):u.pathname;if(path==="/api/health")return res.status(200).json({status:"ok",mode:"synthetic"});if(path==="/api/pipelines")return res.status(200).json(pipelines);if(path.startsWith("/api/analyze/")){const d=analyze(decodeURIComponent(path.slice("/api/analyze/".length)));return d?res.status(200).json(d):res.status(404).json({error:"Pipeline not found"});}if(path==="/api/incidents")return res.status(200).json(history);if(path==="/api/logs"){const rows=logs.filter(l=>(!u.searchParams.get("pipeline_id")||l.pipeline_id.toLowerCase()===u.searchParams.get("pipeline_id").toLowerCase())&&(!u.searchParams.get("level")||l.level.toLowerCase()===u.searchParams.get("level").toLowerCase())&&l.message.toLowerCase().includes((u.searchParams.get("q")||"").toLowerCase()));return res.status(200).json(rows);}if(path.startsWith("/api/diagnose/")){const d=diagnose(decodeURIComponent(path.slice("/api/diagnose/".length)));return d?res.status(200).json(d):res.status(404).json({error:"Pipeline not found"});}return res.status(404).json({error:"Not found"});};
