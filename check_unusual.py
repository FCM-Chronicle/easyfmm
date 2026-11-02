import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all player lines
matches = re.findall(r'\{\s*name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)"', text)
print(f"Total extracted players from teamsData.js: {len(matches)}")

# Check for any names with double final consonants or unusual patterns
unusual = []
for name, pos, country in matches:
    # Check for English or Scottish or Irish players
    if country in ["잉글랜드", "스코틀랜드", "웨일스", "북아일랜드", "아일랜드"]:
        # check if contains unnatural syllables like 간논, 르르, 트트, 은, 음 at odd places
        if re.search(r'(트트|르르|스스|크크|프프|간논|노은|가은|도아크)', name):
            unusual.append((name, country))

print(f"Unusual English names count: {len(unusual)}")
for u in unusual[:30]:
    print(u)

