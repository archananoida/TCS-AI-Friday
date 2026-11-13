"""PipelineIQ: synthetic pipeline monitoring and evidence-based diagnostics."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import json
import os

PIPELINES = [
 {"id":"orders_ingest","name":"Orders Ingestion","status":"healthy","depends_on":[]},
 {"id":"customers_transform","name":"Customer Transform","status":"failed","depends_on":["orders_ingest"]},
 {"id":"warehouse_load","name":"Warehouse Load","status":"blocked","depends_on":["customers_transform"]},
 {"id":"inventory_sync","name":"Inventory Sync","status":"healthy","depends_on":[]},
 {"id":"billing_export","name":"Billing Export","status":"failed","depends_on":["warehouse_load"]},
]
LOGS = [
 {"id":1,"pipeline_id":"customers_transform","level":"ERROR","message":"DatabaseError: customer_id cannot be null"},
 {"id":2,"pipeline_id":"customers_transform","level":"INFO","message":"Processing fictional customer batch"},
 {"id":3,"pipeline_id":"billing_export","level":"ERROR","message":"Connection timeout while calling fictional billing API"},
 {"id":4,"pipeline_id":"warehouse_load","level":"WARN","message":"Upstream dependency customers_transform failed"},
 {"id":5,"pipeline_id":"orders_ingest","level":"INFO","message":"Ingested 5000 synthetic orders"},
 {"id":6,"pipeline_id":"inventory_sync","level":"INFO","message":"Inventory sync completed"},
]
RULES = [
 ("cannot be null","Null constraint violation","Validate required source fields and mappings; quarantine invalid rows."),
 ("timeout","Connection timeout","Check API availability, connectivity, retry policy and latency."),
 ("dependency","Upstream dependency failure","Inspect and recover upstream pipeline before retrying downstream."),
 ("schema","Schema mismatch","Compare schemas and validate field types."),
 ("file not found","Missing source file","Check source path, schedule and permissions."),
]
def diagnose(pipeline_id):
 if pipeline_id not in {p["id"] for p in PIPELINES}: return None
 for log in LOGS:
  if log["pipeline_id"] != pipeline_id or log["level"] not in ("ERROR","WARN"): continue
  for pattern,cause,fix in RULES:
   if pattern in log["message"].lower():
    return {"pipeline_id":pipeline_id,"cause":cause,"recommendation":fix,"evidence_log_ids":[log["id"]],"verified":False,"requires_human_approval":True}
 return {"pipeline_id":pipeline_id,"cause":"Insufficient evidence","recommendation":"Review additional logs and dependencies.","evidence_log_ids":[],"verified":False,"requires_human_approval":True}
def route(path,query=None):
 query=query or {}
 if path=="/api/health": return 200,{"status":"ok","mode":"synthetic"}
 if path=="/api/pipelines": return 200,PIPELINES
 if path=="/api/logs":
  rows=LOGS
  for key in ("pipeline_id","level"):
   value=query.get(key,[None])[0]
   if value: rows=[r for r in rows if r[key].lower()==value.lower()]
  term=query.get("q",[""])[0].lower()
  return 200,[r for r in rows if term in r["message"].lower()]
 if path.startswith("/api/diagnose/"):
  result=diagnose(path.split("/")[-1])
  return (200,result) if result else (404,{"error":"Pipeline not found"})
 return 404,{"error":"Not found"}
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  parsed=urlparse(self.path)
  if parsed.path in ("/","/index.html"):
   body=Path(__file__).resolve().parent.parent.joinpath("frontend/index.html").read_bytes()
   content_type="text/html; charset=utf-8";status=200
  else:
   status,data=route(parsed.path,parse_qs(parsed.query))
   body=json.dumps(data).encode();content_type="application/json"
  self.send_response(status)
  self.send_header("Content-Type",content_type)
  self.send_header("Content-Length",str(len(body)))
  self.send_header("Cache-Control","no-store")
  self.end_headers();self.wfile.write(body)
if __name__=="__main__":
 host=os.environ.get("HOST","127.0.0.1");port=int(os.environ.get("PORT","8000"))
 print(f"PipelineIQ at http://{host}:{port}",flush=True)
 ThreadingHTTPServer((host,port),Handler).serve_forever()
