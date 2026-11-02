import sys
import csv
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

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

all_p = []
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
        c_name = current_names.get(pid, "")
        all_p.append((pid, raw_name, c_name, country, club))

print(f"Total Tier-1 players: {len(all_p)}")

# Find all suspicious players across all clubs
suspicious = []
for p in all_p:
    pid, raw, curr, country, club = p
    
    # 1. Any player whose name ends with '르' but raw had 'Jr'
    if ("Jr" in raw or "jr" in raw) and "주니어" not in curr:
        suspicious.append((pid, raw, curr, country, club, "Jr"))
    # 2. Any player with '므크'
    elif "므크" in curr:
        suspicious.append((pid, raw, curr, country, club, "Mc"))
    # 3. Any player with '츠크' or '이츠크'
    elif "츠크" in curr:
        suspicious.append((pid, raw, curr, country, club, "ck"))
    # 4. Any player with '.' or "'"
    elif "." in curr or "'" in curr:
        suspicious.append((pid, raw, curr, country, club, "dot/apostrophe"))
    # 5. French/African player with '코움', '보우', '노우', '도우', '소우', '로우스', '바코우', '티바우'
    elif re.search(r'(코움|보우|노우|도우|소우|바코우|티바우|모우|고우|오우)', curr) and country in ["France", "Côte d'Ivoire", "Senegal", "Mali", "Cameroon", "Algeria", "Morocco", "Tunisia", "Burkina Faso", "Guinea", "DR Congo", "Congo"]:
        suspicious.append((pid, raw, curr, country, club, "French_ou"))
    # 6. Any English player with Italian J (야...) or Italian ending (스텔레, 둔크, etc.)
    elif country in ["England", "Scotland", "Wales", "Northern Ireland", "Ireland", "Republic of Ireland", "United States", "Canada", "Australia"] and (re.search(r'^(야|요|유)', curr) or re.search(r'(스텔레|둔크|로베|치에|베아틀|플레트|캄베|아보트|카드비|에아벤|부로베|엠민그|네아베|고베르|빈데르|움프레이|므푸니|비피엘|드라케|에스케이|이모알)', curr)):
        suspicious.append((pid, raw, curr, country, club, "English_italian"))

print(f"Found {len(suspicious)} suspicious players across the entire database.")
with open('all_suspicious_database.json', 'w', encoding='utf-8') as f:
    json.dump(suspicious, f, ensure_ascii=False, indent=2)

