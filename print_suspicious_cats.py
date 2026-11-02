import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('all_suspicious_database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_cat = {}
for item in data:
    cat = item[5]
    by_cat.setdefault(cat, []).append(item)

for cat, items in by_cat.items():
    print(f"\n=== Category: {cat} ({len(items)} players) ===")
    for it in items[:15]:
        print(f"  {it[0]} | {it[1]} ({it[3]}, {it[4]}) -> '{it[2]}'")

