import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

targets = ['Celta', 'Marítimo', 'Brest', 'Paderborn', 'Alanyaspor', 'Gençlerbirliği', 'Braga', 'Amed']
for t in targets:
    for k, v in clubs.items():
        if t.lower() in k.lower() or t.lower() in v.get('name', '').lower():
            print(f"Key: {k} | Name: {v.get('name')} | Logo: {v.get('logo')}")
