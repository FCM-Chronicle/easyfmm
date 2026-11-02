import re

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'"([^"]+)":\s*\{\s*\n\s*displayName:\s*"([^"]+)",(?:[^\n]+\n){0,8}?\s*logoCode:\s*"([^"]+)"'
# Let's search line by line
lines = text.split('\n')
cur_key = None
cur_name = None
for line in lines:
    m_k = re.match(r'^\s*"([^"]+)":\s*\{', line)
    if m_k:
        cur_key = m_k.group(1)
    m_d = re.search(r'displayName:\s*"([^"]+)"', line)
    if m_d:
        cur_name = m_d.group(1)
    m_l = re.search(r'logoCode:\s*"([^"]+)"', line)
    if m_l:
        code = m_l.group(1)
        if code in ['MAR', 'CEL', 'VIG']:
            print(f"Team '{cur_key}' ('{cur_name}') -> logoCode: '{code}'")

