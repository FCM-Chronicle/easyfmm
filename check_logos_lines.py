import re

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

current_team = None
current_display = None
for i, line in enumerate(lines[:1000]):
    m_team = re.match(r'^\s*"([^"]+)":\s*\{', line)
    if m_team:
        current_team = m_team.group(1)
    m_disp = re.search(r'displayName:\s*"([^"]+)"', line)
    if m_disp:
        current_display = m_disp.group(1)
    m_logo = re.search(r'logoCode:\s*"([^"]+)"', line)
    if m_logo:
        logo = m_logo.group(1)
        if any(x in str(current_team) or x in str(current_display) for x in ['셀타', '셀틱', '비고', '마리티무']):
            print(f"Line {i+1}: Team '{current_team}' (Name: '{current_display}') -> logoCode: '{logo}'")

