import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open("player_corrections_master.json", "r", encoding="utf-8") as f:
    corr = json.load(f)

check_ids = [242534, 242195, 252937, 70038, 80695, 80694, 80774, 84466, 80773, 80775, 234236]
for cid in check_ids:
    print(f"{cid}: {corr.get(str(cid), 'NOT FOUND')}")

