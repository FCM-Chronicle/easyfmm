import sys
import csv
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

csv_path = "players.csv - players.csv.csv"

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

current_names = {}
for m in re.finditer(r'playerid:\s*(\d+).*?name:\s*"([^"]+)"', text):
    pid = int(m.group(1))
    current_names[pid] = m.group(2)
for m in re.finditer(r'name:\s*"([^"]+)".*?playerid:\s*(\d+)', text):
    pid = int(m.group(2))
    current_names[pid] = m.group(1)

english_countries = [
    "England", "Scotland", "Wales", "Northern Ireland", "Ireland", "Republic of Ireland",
    "United States", "Canada", "Australia", "New Zealand", "Jamaica", "South Africa"
]

eng_players = []
with open(csv_path, mode="r", encoding="utf-8", errors="replace") as f:
    reader = csv.reader(f)
    for cols in reader:
        if not cols or len(cols) < 11:
            continue
        try:
            pid = int(cols[0].strip())
        except ValueError:
            continue
        club = cols[7].strip()
        if club not in clubs:
            continue
        known_as = cols[1].strip()
        first_name = cols[2].strip()
        last_name = cols[3].strip()
        raw_name = known_as if known_as else f"{first_name} {last_name}".strip()
        country = cols[9].strip()
        
        if country in english_countries:
            c_name = current_names.get(pid, "")
            eng_players.append({
                "pid": pid,
                "raw": raw_name,
                "current": c_name,
                "country": country,
                "club": club
            })

print(f"Total English-speaking players: {len(eng_players)}")

with open('english_players_to_fix.json', 'w', encoding='utf-8') as f:
    json.dump(eng_players, f, ensure_ascii=False, indent=2)

print("Saved to english_players_to_fix.json")

