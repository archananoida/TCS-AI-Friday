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
