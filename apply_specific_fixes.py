import json

with open("player_corrections_master.json", "r", encoding="utf-8") as f:
    corr = json.load(f)

corr["242195"] = "마크 맥켄지"
corr["80774"] = "가에탕 바쿠슈"
corr["80773"] = "나임 사이드 음친드라"
corr["80775"] = "프레데리크 에푸엘레 은고얄라"
corr["269923"] = "제이슨 러셀로우"
corr["70038"] = "야닉 에두아르두"
corr["242534"] = "크리스티안 카세레스 주니어"
corr["79027"] = "로날드 쿠만 주니어"

with open("player_corrections_master.json", "w", encoding="utf-8") as f:
    json.dump(corr, f, ensure_ascii=False, indent=2)

print("Updated specific IDs in player_corrections_master.json")

