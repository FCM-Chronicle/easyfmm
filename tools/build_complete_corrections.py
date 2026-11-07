import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open("player_corrections_master.json", "r", encoding="utf-8") as f:
    master_corr = {int(k): v for k, v in json.load(f).items()}

with open("all_suspicious_database.json", "r", encoding="utf-8") as f:
    suspicious = json.load(f)

print(f"Loaded {len(master_corr)} existing master corrections.")
print(f"Loaded {len(suspicious)} suspicious items.")

# Clean function for French / Arabic / Italian fallback
def auto_clean_name(raw, curr, country):
    name = curr
    
    # 1. Fix Jr.
    if ("Jr." in raw or " Jr" in raw) and "주니어" not in name:
        name = re.sub(r'\s+르$', '', name)
        name = re.sub(r'\s+이르$', '', name)
        name = name + " 주니어"
    
    # 2. Fix dots
    name = name.replace(".", "").replace("'", "")
    
    # 3. Fix Mc / 므크
    name = name.replace("므크", "맥")
    
    # 4. Fix 츠크 (ck)
    name = name.replace("스히츠크", "시크")
    name = name.replace("얀니츠크", "야닉")
    name = name.replace("블라스츠크차크", "블라슈치코프스키")
    
    # 5. Fix French 'ou' -> '우', 'au' -> '오'
    if country in ["France", "Côte d'Ivoire", "Senegal", "Mali", "Cameroon", "Algeria", "Morocco", "Tunisia", "Burkina Faso", "Guinea", "DR Congo", "Congo", "Madagascar", "Togo", "Gabon"]:
        # Specific known patterns
        name = name.replace("코움", "쿰")
        name = name.replace("보우", "부")
        name = name.replace("노우", "누")
        name = name.replace("도우", "두")
        name = name.replace("소우", "수")
        name = name.replace("바코우", "바쿠")
        name = name.replace("티바우드", "티보")
        name = name.replace("가울트", "고")
        name = name.replace("모우스", "무스")
        name = name.replace("모우", "무")
        name = name.replace("고우", "구")
        name = name.replace("오우", "우")
        name = name.replace("치세", "시세")
        name = name.replace("야오우엔", "야우엔")
        name = name.replace("바코우케", "바쿠슈")
        name = name.replace("로로우뇬", "로루뇽")
    
    return name

# Add all suspicious to master_corr with cleaned names
new_fixes = 0
for pid, raw, curr, country, club, reason in suspicious:
    if pid not in master_corr:
        cleaned = auto_clean_name(raw, curr, country)
        master_corr[pid] = cleaned
        new_fixes += 1

print(f"Added {new_fixes} newly cleaned players to master corrections. Total now: {len(master_corr)}")

# Save updated master corrections
with open("player_corrections_master.json", "w", encoding="utf-8") as f:
    json.dump(master_corr, f, ensure_ascii=False, indent=2)

print("Saved updated player_corrections_master.json")

