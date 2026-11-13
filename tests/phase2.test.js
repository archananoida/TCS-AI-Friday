const assert=require("node:assert/strict");
const test=require("node:test");
const handler=require("../api/index.js");
async function call(path){let status=200,data;const res={setHeader(){},status(n){status=n;return this},json(x){data=x;return this}};await handler({method:"GET",url:path},res);return {status,data};}
test("health",async()=>assert.equal((await call("/api/health")).data.status,"ok"));
test("pipeline count",async()=>assert.equal((await call("/api/pipelines")).data.length,5));
test("evidence investigation",async()=>{let x=(await call("/api/analyze/customers_transform")).data;assert.equal(x.hypothesis,"Null constraint violation");assert.equal(x.evidence[0].id,1);assert.equal(x.generative_ai_enabled,false);assert.equal(x.verified,false);});
test("upstream dependencies",async()=>{let x=(await call("/api/analyze/warehouse_load")).data;assert.ok(x.upstream.some(p=>p.id==="customers_transform"&&p.status==="failed"));});
test("unknown pipeline",async()=>assert.equal((await call("/api/analyze/missing")).status,404));
test("log search",async()=>assert.equal((await call("/api/logs?q=timeout")).data[0].id,3));
test("history",async()=>assert.ok((await call("/api/incidents")).data.length>=3));
test("AI without key returns honest fallback",async()=>{const old=process.env.OPENAI_API_KEY;delete process.env.OPENAI_API_KEY;try{const x=(await call("/api/ai-explain/billing_export")).data;assert.equal(x.ai_status,"not_configured");assert.equal(x.ai_explanation,null);assert.equal(x.evidence[0].id,3);}finally{if(old!==undefined)process.env.OPENAI_API_KEY=old;}});

test("AI success uses structured response and remains unverified",async()=>{
 const oldKey=process.env.OPENAI_API_KEY,oldFetch=global.fetch;process.env.OPENAI_API_KEY="test-placeholder";
 try{
  global.fetch=async(url,opts)=>{assert.equal(url,"https://api.openai.com/v1/responses");assert.equal(JSON.parse(opts.body).store,false);return {ok:true,json:async()=>({status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify({summary:"Synthetic timeout",possible_root_cause:"Possible API latency",next_checks:["Check latency"],uncertainty:"Not verified"})}]}]})}};
  const x=(await call("/api/ai-explain/billing_export")).data;assert.equal(x.ai_status,"generated_unverified");assert.equal(x.ai_explanation.next_checks[0],"Check latency");assert.equal(x.verified,false);
 }finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey}
});
test("AI unauthorized response falls back without exposing secrets",async()=>{
 const oldKey=process.env.OPENAI_API_KEY,oldFetch=global.fetch;process.env.OPENAI_API_KEY="test-placeholder";
 try{global.fetch=async()=>({ok:false,status:401});const x=(await call("/api/ai-explain/billing_export")).data;assert.equal(x.ai_error_category,"authentication_failed");assert.equal(x.ai_explanation,null);assert.equal(x.evidence[0].id,3);assert.ok(!JSON.stringify(x).includes("test-placeholder"))}
 finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey}
});
test("AI provider failure returns safe fallback",async()=>{
 const oldKey=process.env.OPENAI_API_KEY,oldFetch=global.fetch;process.env.OPENAI_API_KEY="test-placeholder";
 try{global.fetch=async()=>{throw Error("network failure")};const x=(await call("/api/ai-explain/billing_export")).data;assert.equal(x.ai_status,"fallback");assert.equal(x.ai_error_category,"provider_error")}
 finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey}
});
test("non-GET request is rejected",async()=>{let status=200;await handler({method:"POST",url:"/api/pipelines"},{setHeader(){},status(n){status=n;return this},json(){}});assert.equal(status,405)});

test("all five pipelines have valid investigation and diagnosis",async()=>{
 const pipelines=(await call("/api/pipelines")).data;
 for(const p of pipelines){
  const investigation=await call("/api/analyze/"+p.id),diagnosis=await call("/api/diagnose/"+p.id);
  assert.equal(investigation.status,200);assert.equal(diagnosis.status,200);
  assert.equal(investigation.data.pipeline_id,p.id);assert.equal(diagnosis.data.pipeline_id,p.id);
  assert.equal(investigation.data.requires_human_approval,true);
  assert.equal(diagnosis.data.verified,false);
 }
});
test("filtered logs and missing routes behave correctly",async()=>{
 const logs=(await call("/api/logs?pipeline_id=billing_export&level=ERROR")).data;
 assert.equal(logs.length,1);assert.equal(logs[0].id,3);
 assert.equal((await call("/api/diagnose/not-a-pipeline")).status,404);
 assert.equal((await call("/api/ai-explain/not-a-pipeline")).status,404);
 assert.equal((await call("/api/not-a-route")).status,404);
});
