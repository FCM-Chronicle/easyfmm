import json

with open("player_corrections_master.json", "r", encoding="utf-8") as f:
    corr = json.load(f)

corr["73506"] = "시모 부자이디"
corr["76282"] = "유네스 에브누탈리브"
corr["80816"] = "브래들리 버로스"
corr["80893"] = "아담 바쿠네"
corr["81410"] = "아뎀 아루스"
corr["231005"] = "치에도지 오그베네"
corr["231969"] = "루슬란 말리노우스키"
corr["232693"] = "치도지 아와지엠"
corr["252466"] = "데비드 부아"
corr["256788"] = "이스마엘 부라"

with open("player_corrections_master.json", "w", encoding="utf-8") as f:
    json.dump(corr, f, ensure_ascii=False, indent=2)

print("Updated 10 players in player_corrections_master.json")

