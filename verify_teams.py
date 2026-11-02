import re

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

print('File length:', len(text))
print('Has UTF-8 BOM:', text.startswith('\ufeff'))

# Check specific clubs
for club in ['AFC_본머스', '첼시', 'ACF_피오렌티나', '아스날', '아스톤_빌라', '울산_HD_FC']:
    idx = text.find(f'"{club}":')
    print(f'Club {club} found at: {idx}')

# Search for any bad patterns
bad_patterns = ['구무른', '라크로이크', '모이세 케안', '와은비스사카', '음크긴', '스코트트', '히르르', '브로오크스', '위르르', '가은노은']
for bp in bad_patterns:
    if bp in text:
        print(f'WARNING: Found bad pattern: {bp}')
    else:
        print(f'OK: No {bp}')

