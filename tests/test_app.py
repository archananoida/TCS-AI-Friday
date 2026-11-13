import unittest
from backend.app import PIPELINES, diagnose, route
class PipelineTests(unittest.TestCase):
 def test_health(self): self.assertEqual(route("/api/health")[1]["status"],"ok")
 def test_pipeline_count(self): self.assertEqual(len(PIPELINES),5)
 def test_null_diagnosis(self):
  d=diagnose("customers_transform")
  self.assertEqual(d["cause"],"Null constraint violation")
  self.assertEqual(d["evidence_log_ids"],[1])
  self.assertFalse(d["verified"])
 def test_timeout_diagnosis(self): self.assertEqual(diagnose("billing_export")["cause"],"Connection timeout")
 def test_unknown_pipeline(self): self.assertIsNone(diagnose("missing"))
 def test_insufficient_evidence(self): self.assertEqual(diagnose("inventory_sync")["cause"],"Insufficient evidence")
 def test_search(self): self.assertEqual(len(route("/api/logs",{"q":["timeout"]})[1]),1)
 def test_filter(self): self.assertEqual(len(route("/api/logs",{"level":["ERROR"]})[1]),2)
if __name__=="__main__": unittest.main()
