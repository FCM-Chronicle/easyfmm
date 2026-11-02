import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

# 1. Update tier1_clubs.json
with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

logo_updates = {
    'Celta': 'VIG',
    'Marítimo da Madeira': 'MTM',
    'Stade Brestois 29': 'SBR',
    'SC Paderborn 07': 'PAD',
    'Alanyaspor': 'AYN',
    'Gençlerbirliği': 'GBR',
    'SC Braga': 'BRG',
    'Amed Sportif Faaliyetler': 'AMD'
}

for club_key, new_logo in logo_updates.items():
    if club_key in clubs:
        old = clubs[club_key].get('logo')
        clubs[club_key]['logo'] = new_logo
        print(f"Updated tier1_clubs.json: {club_key} -> {old} to {new_logo}")

with open('tier1_clubs.json', 'w', encoding='utf-8') as f:
    json.dump(clubs, f, ensure_ascii=False, indent=2)

# 2. Update easyfmm/teamsData.js directly
with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Map team keys to new logoCodes
team_key_updates = {
    '셀타_비고': 'VIG',
    '마리티무': 'MTM',
    '스타드_브레스트': 'SBR',
    'SC_파더보른': 'PAD',
    '알라냐스포르': 'AYN',
    '겐츨레르비를리이': 'GBR',
    'SC_브라가': 'BRG',
    '아메드': 'AMD'
}

for t_key, new_code in team_key_updates.items():
    pattern = rf'("{t_key}":\s*\{{\s*\n\s*displayName:[^\n]+\n(?:[^\n]+\n){{0,6}}?\s*logoCode:\s*")[^"]+(")'
    new_text = re.sub(pattern, rf'\g<1>{new_code}\g<2>', text)
    if new_text != text:
        print(f"Updated easyfmm/teamsData.js: '{t_key}' -> logoCode: '{new_code}'")
        text = new_text

with open('easyfmm/teamsData.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished updating club logos in both files.")
