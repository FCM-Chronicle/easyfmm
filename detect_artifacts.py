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

all_players = []
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
        
        all_players.append({
            "pid": pid,
            "raw": raw_name,
            "curr": current_names.get(pid, ""),
            "country": country,
            "club": club
        })

print(f"Total Tier-1 players: {len(all_players)}")

# Detect typical Italian fallback artifacts:
# 1. ' Jr.' -> '르'
# 2. 'ou' in French -> '오우' (코움, 보우, 노우, 로우, 토우, 호우, 도우, 소우, 포우)
# 3. 'au' in French -> '아우' (티바우드, 아우구스틴, etc.)
# 4. 'Mc' -> '므크'
# 5. 'ick' -> '이츠크' / '츠크'
# 6. 'ch' in French/English -> '치' / '체' / '키' where it should be '슈' / '치' / '크' (므켄치에)
# 7. 'owe' -> '로베'
# 8. 'th' -> '트' at end
# 9. dot '.' in name

artifacts = []
for p in all_players:
    c = p["curr"]
    raw = p["raw"]
    cntry = p["country"]
    
    # Check indicators
    reasons = []
    if " Jr" in raw and "주니어" not in c and "Jr" not in c:
        reasons.append("Jr_artifact")
    if "므크" in c:
        reasons.append("Mc_artifact")
    if "츠크" in c or "이츠크" in c:
        reasons.append("ick_artifact")
    if "로베" in c and "Rowe" in raw:
        reasons.append("Rowe_artifact")
    if "치에" in c and "zie" in raw:
        reasons.append("zie_artifact")
    if re.search(r'(코움|보우|노우|로우스|토우스|오우알|코우체|바코우|티바우드|오우에|도우체)', c):
        reasons.append("French_ou_au_artifact")
    if "." in c:
        reasons.append("dot_artifact")
    if "르" == c.split()[-1] and "Jr" in raw:
        reasons.append("Jr_became_le")
    
    if reasons:
        artifacts.append((p, reasons))

print(f"Total players with detected artifacts: {len(artifacts)}")
for a, r in artifacts[:30]:
    print(f"{a['pid']} | {a['raw']} ({a['country']}) -> '{a['curr']}' | {r}")

