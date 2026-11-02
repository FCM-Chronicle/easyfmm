import re

with open('easyfmm/teamsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Update 브레스트
pattern1 = r'("브레스트":\s*\{\s*\n\s*displayName:[^\n]+\n(?:[^\n]+\n){0,6}?\s*logoCode:\s*")[^"]+(")'
text = re.sub(pattern1, r'\g<1>SBR\g<2>', text)

# Update 파더보른
pattern2 = r'("파더보른":\s*\{\s*\n\s*displayName:[^\n]+\n(?:[^\n]+\n){0,6}?\s*logoCode:\s*")[^"]+(")'
text = re.sub(pattern2, r'\g<1>PAD\g<2>', text)

with open('easyfmm/teamsData.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated 브레스트 to SBR and 파더보른 to PAD.")

