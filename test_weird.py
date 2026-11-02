import sys
import csv
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open("player_corrections_master.json", "r", encoding="utf-8") as f:
    player_corrections = {int(k): v for k, v in json.load(f).items()}
player_corrections[268131] = "시제이 이건라일리"

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

csv_path = "players.csv - players.csv.csv"

# Load current teamsData.js player names by playerid
with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

current_names = {}
for m in re.finditer(r'playerid:\s*(\d+).*?name:\s*"([^"]+)"', text):
    pid = int(m.group(1))
    current_names[pid] = m.group(2)
for m in re.finditer(r'name:\s*"([^"]+)".*?playerid:\s*(\d+)', text):
    pid = int(m.group(2))
    current_names[pid] = m.group(1)

unresolved_weird = []
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
        
        final_name = player_corrections.get(pid, current_names.get(pid, ""))
        if re.search(r'[\.\'Yx]', final_name):
            unresolved_weird.append((pid, raw_name, final_name, country, club))

print(f"Unresolved players with weird chars (. ' Y x): {len(unresolved_weird)}")
for u in unresolved_weird:
    print(u)

