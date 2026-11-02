import sys
import csv
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('tier1_clubs.json', 'r', encoding='utf-8') as f:
    clubs = json.load(f)

csv_path = "players.csv - players.csv.csv"

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
        all_players.append((pid, raw_name, country, club))

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

current_names = {}
for m in re.finditer(r'playerid:\s*(\d+).*?name:\s*"([^"]+)"', text):
    pid = int(m.group(1))
    current_names[pid] = m.group(2)

# Also check alternative order
for m in re.finditer(r'name:\s*"([^"]+)".*?playerid:\s*(\d+)', text):
    pid = int(m.group(2))
    current_names[pid] = m.group(1)

# Check all suspicious names
suspicious = []
for pid, raw_name, country, club in all_players:
    c_name = current_names.get(pid, "")
    # Check if c_name has latin
    has_latin = bool(re.search(r'[a-zA-Z]', c_name))
    # Check if c_name has weird symbols like ., ', Y, x
    has_weird = bool(re.search(r'[\.\'Yx]', c_name))
    # Check if English player has italian-like endings (스텔레, 둔크, 인셀, 도일레, etc.)
    is_eng = country in ["England", "Scotland", "Wales", "Northern Ireland", "Ireland", "United States", "Canada", "Australia"]
    has_ita_artifact = False
    if is_eng:
        if re.search(r'(스텔레|둔크|인셀|도일레|비케르스|발콤베|포테르|루이스포테르|로베|므크|오마\.오니|오\'릴레위|엠민그스|카신|다비드)', c_name):
            has_ita_artifact = True
    
    if has_latin or has_weird or has_ita_artifact or country in ["Greece", "Ukraine", "Russia", "Bulgaria", "Belarus"]:
        suspicious.append((pid, raw_name, c_name, country, club))

print(f"Total suspicious players: {len(suspicious)}")
with open('suspicious_players.json', 'w', encoding='utf-8') as f:
    json.dump(suspicious, f, ensure_ascii=False, indent=2)
print("Saved to suspicious_players.json")

