# -*- coding: utf-8 -*-
# build_full_database_hangulize.py
import sys
import os
import csv
import json
import re

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("hangulize_repo"))
sys.path.insert(0, os.path.abspath("python_embed"))

from hangulize import hangulize, get_lang

print("=== STARTING FULL DATABASE GENERATION WITH HANGULIZE ===")

# 1. Load Data Files
with open("tier1_clubs.json", "r", encoding="utf-8") as f:
    clubs = json.load(f)

with open("tier1_countries.json", "r", encoding="utf-8") as f:
    countries = json.load(f)

with open("master_known_players.json", "r", encoding="utf-8") as f:
    known_players = json.load(f)

with open("master_top_stars.json", "r", encoding="utf-8") as f:
    top_stars = json.load(f)
    known_players.update(top_stars)

with open("master_tokens.json", "r", encoding="utf-8") as f:
    tokens = json.load(f)
    first_names_dict = tokens.get("firstNames", {})
    surnames_dict = tokens.get("surnames", {})

with open("korean_syllables_complete.json", "r", encoding="utf-8") as f:
    k_syllables = json.load(f)

with open("trans_kleague_foreigners.json", "r", encoding="utf-8") as f:
    k_foreigners = json.load(f)

with open("player_corrections_master.json", "r", encoding="utf-8") as f:
    player_corrections = {int(k): v for k, v in json.load(f).items()}

# Comprehensive English & French names lexicon
eng_fra_dict = {
    # English Surnames
    "Scott": "스콧", "Smith": "스미스", "Hill": "힐", "Brooks": "브룩스", "Dennis": "데니스",
    "Tavernier": "태버니어", "Aarons": "에런스", "Christie": "크리스티", "Doak": "도크",
    "Jebbison": "제비슨", "Akinmboni": "아킨본", "Forster": "포스터", "Cook": "쿡",
    "Soler": "솔레르", "Kerkez": "케르케즈", "Semenyo": "세메뇨", "Evanilson": "이바니우송",
    "Sinisterra": "시니스테라", "Kluivert": "클라위버르트", "Billing": "빌링", "Adams": "애덤스",
    "Mepham": "메팜", "Zabarnyi": "자바르니", "Senesi": "세네시", "Kelly": "켈리",
    "Moore": "무어", "Travers": "트래버스", "Anthony": "앤서니", "Marcondes": "마르콘데스",
    "Lowe": "로우", "Rothwell": "로스웰", "Kilkenny": "킬케니", "Pearson": "피어슨",
    "Greenwood": "그린우드", "Clarke": "클라크", "Hughes": "휴즈", "Taylor": "테일러",
    "Ward": "워드", "Davies": "데이비스", "Edwards": "에드워즈", "Evans": "에반스",
    "Collins": "콜린스", "Stewart": "스튜어트", "Sanchez": "산체스", "Morris": "모리스",
    "Rogers": "로저스", "Reed": "리드", "Cook": "쿡", "Morgan": "모건", "Bell": "벨",
    "Murphy": "머피", "Bailey": "베일리", "Cooper": "쿠퍼", "Richardson": "리처드슨",
    "Cox": "콕스", "Howard": "하워드", "Ward": "워드", "Torres": "토레스", "Peterson": "피터슨",
    "Gray": "그레이", "Ramirez": "라미레스", "James": "제임스", "Watson": "왓슨",
    "Brooks": "브룩스", "Kelly": "켈리", "Sanders": "샌더스", "Price": "프라이스",
    "Bennett": "베넷", "Wood": "우드", "Barnes": "반스", "Ross": "로스", "Henderson": "헨더슨",
    "Coleman": "콜먼", "Jenkins": "젠킨스", "Perry": "페리", "Powell": "파월", "Long": "롱",
    "Patterson": "패터슨", "Hughes": "휴즈", "Flores": "플로레스", "Washington": "워싱턴",
    "Butler": "버틀러", "Simmons": "시몬스", "Foster": "포스터", "Gonzales": "곤살레스",
    "Bryant": "브라이언트", "Alexander": "알렉산더", "Russell": "러셀", "Griffin": "그리핀",
    "Diaz": "디아스", "Hayes": "헤이즈", "Myers": "마이어스", "Ford": "포드", "Hamilton": "해밀턴",
    "Graham": "그레이엄", "Sullivan": "설리반", "Wallace": "월리스", "Woods": "우즈", "Cole": "콜",
    "West": "웨스트", "Jordan": "조던", "Owens": "오웬스", "Reynolds": "레이놀즈", "Fisher": "피셔",
    "Ellis": "엘리스", "Harrison": "해리슨", "Gibson": "깁슨", "Mcdonald": "맥도널드", "Cruz": "크루스",
    "Marshall": "마샬", "Ortiz": "오르티스", "Gomez": "고메스", "Murray": "머레이", "Freeman": "프리먼",
    "Wells": "웰스", "Webb": "웹", "Simpson": "심슨", "Tucker": "터커", "Porter": "포터",
    "Hunter": "헌터", "Hicks": "힉스", "Crawford": "크로포드", "Henry": "앙리", "Boyd": "보이드",
    "Mason": "메이슨", "Morales": "모랄레스", "Kennedy": "케네디", "Warren": "워렌", "Dixon": "딕슨",
    "Ramos": "라모스", "Reyes": "레예스", "Burns": "번스", "Gordon": "고든", "Shaw": "쇼",
    "Holmes": "홈즈", "Rice": "라이스", "Robertson": "로버트슨", "Hunt": "헌트", "Black": "블랙",
    "Daniels": "다니엘스", "Palmer": "파머", "Mills": "밀스", "Nichols": "니콜스", "Grant": "그랜트",
    "Knight": "나이트", "Ferguson": "퍼거슨", "Rose": "로즈", "Stone": "스톤", "Hawkins": "호킨스",
    "Dunn": "던", "Perkins": "퍼킨스", "Hudson": "허드슨", "Spencer": "스펜서", "Gardner": "가드너",
    "Stephens": "스티븐스", "Payne": "페인", "Pierce": "피어스", "Berry": "베리", "Matthews": "매튜스",
    "Arnold": "아놀드", "Wagner": "바그너", "Willis": "윌리스", "Ray": "레이", "Watkins": "왓킨스",
    "Olson": "올슨", "Carroll": "캐럴", "Duncan": "던컨", "Snyder": "스나이더", "Hart": "하트",
    "Cunningham": "커닝엄", "Bradley": "브래들리", "Lane": "레인", "Andrews": "앤드류스",
    "Ruiz": "루이스", "Harper": "하퍼", "Fox": "폭스", "Riley": "라일리", "Armstrong": "암스트롱",
    "Carpenter": "카펜터", "Weaver": "위버", "Greene": "그린", "Lawrence": "로렌스", "Elliott": "엘리엇",
    "Chavez": "차베스", "Sims": "심스", "Austin": "오스틴", "Peters": "피터스", "Kelley": "켈리",
    "Franklin": "프랭클린", "Lawson": "로슨", "Fields": "필즈", "Gutierrez": "구티에레스",
    "Ryan": "라이언", "Schmidt": "슈미트", "Carr": "카", "Vasquez": "바스케스", "Castillo": "카스티요",
    "Wheeler": "휠러", "Chapman": "채프먼", "Oliver": "올리버", "Montgomery": "몽고메리",
    "Richards": "리차즈", "Williamson": "윌리엄슨", "Johnston": "존스턴", "Banks": "뱅크스",
    "Meyer": "마이어", "Bishop": "비숍", "Mccoy": "맥코이", "Howell": "하웰", "Alvarez": "알바레스",
    "Morrison": "모리슨", "Hansen": "한센", "Fernandez": "페르난데스", "Garza": "가르자",
    "Harvey": "하비", "Little": "리틀", "Burton": "버튼", "Stanley": "스탠리", "Nguyen": "응우옌",
    "George": "조지", "Jacobs": "제이콥스", "Reid": "리드", "Kim": "김", "Fuller": "풀러",
    "Lynch": "린치", "Dean": "딘", "Gilbert": "길버트", "Garrett": "개럿", "Romero": "로메로",
    "Welch": "웰치", "Larson": "라슨", "Owen": "오웬", "Bowman": "보우먼", "Medina": "메디나",
    "Fowler": "파울러", "Davidson": "데이비드슨", "Mcbride": "맥브라이드", "Davidson": "데이비드슨",
    # French Surnames
    "Truffert": "트뤼페르", "Kroupi": "크루피", "Adli": "아들리", "Diakité": "디아키테",
    "Diakite": "디아키테", "Cherki": "셰르키", "Barcola": "바르콜라", "Doué": "두에",
    "Doue": "두에", "Kalimuendo": "칼리무엔도", "Wahi": "와히", "Le Fée": "르 페",
    "Le Fee": "르 페", "Bourigeaud": "부리고", "Blas": "블라스", "Gouiri": "구이리",
    "Terrier": "테리에", "Theate": "테아트", "Omari": "오마리", "Truffert": "트뤼페르",
    "Mandanda": "만단다", "Samba": "삼바", "Danso": "단소", "Medina": "메디나",
    "Frankowski": "프란코프스키", "Gradit": "그라디", "Abdul Samed": "압둘 사메드",
    "Sotoca": "소토카", "Saïd": "사이드", "Said": "사이드", "Thomasson": "토마손",
    "Fulgini": "풀지니", "Lopes": "로페스", "Caqueret": "카크레", "Tolisso": "톨리소",
    "Lacazette": "라카제트", "Tagliafico": "탈리아피코", "Mata": "마타", "O'Brien": "오브라이언",
    "Benrahma": "벤라흐마", "Nuamah": "누아마", "Fofana": "포파나", "Mangala": "망갈라",
    "Clauss": "클로스", "Balerdi": "발레르디", "Mbemba": "음벰바", "Merlin": "메를랭",
    "Rongier": "롱지에", "Veretout": "베레투", "Harit": "하리트", "Aubameyang": "오바메양",
    "Moukoko": "무코코", "Greenwood": "그린우드", "Højbjerg": "호이비에르", "Kondogbia": "콘도그비아",
    # English First Names
    "Alex": "알렉스", "Adam": "아담", "Daniel": "다니엘", "James": "제임스", "Amine": "아민",
    "Juanlu": "후안루", "Matai": "마타이", "Álvaro": "알바로", "Alvaro": "알바로", "Eli": "엘리",
    "Ben": "벤", "Julio": "훌리오", "Fraser": "프레이저", "Ryan": "라이언", "David": "다비드",
    "Max": "막스", "Will": "윌", "Bafodé": "바포데", "Bafode": "바포데", "Marcus": "마커스",
    "Lewis": "루이스", "Callum": "칼럼", "Dominic": "도미닉", "Jacob": "제이콥", "Harvey": "하비",
    "Joe": "조", "Sean": "숀", "Tino": "티노", "Dan": "댄", "Fabian": "파비안", "Nick": "닉",
    "Kieran": "키어런", "Lloyd": "로이드", "Matt": "맷", "Martin": "마르틴", "Sandro": "산드로",
    "Bruno": "브루누", "Joelinton": "조엘린톤", "Alexander": "알렉산더", "Anthony": "앤서니",
    "Miguel": "미겔", "Harry": "해리", "John": "존", "Jack": "잭", "Phil": "필", "Kyle": "카일",
    "Cole": "콜", "Reece": "리스", "Declan": "데클란", "Bukayo": "부카요", "Mason": "메이슨"
}

# Country to Hangulize language code mapping
country_to_lang = {
    # Spanish
    "Spain": "spa", "Argentina": "spa", "Uruguay": "spa", "Colombia": "spa",
    "Chile": "spa", "Mexico": "spa", "Peru": "spa", "Venezuela": "spa",
    "Ecuador": "spa", "Paraguay": "spa", "Bolivia": "spa", "Costa Rica": "spa",
    # Italian
    "Italy": "ita", "San Marino": "ita",
    # German
    "Germany": "deu", "Austria": "deu", "Switzerland": "deu", "Liechtenstein": "deu",
    # Portuguese
    "Portugal": "por", "Brazil": "por", "Angola": "por", "Mozambique": "por",
    "Cape Verde": "por", "Guinea-Bissau": "por",
    # Dutch
    "Holland": "nld", "Netherlands": "nld", "Belgium": "nld", "Suriname": "nld",
    # Turkish
    "Turkey": "tur", "Azerbaijan": "aze",
    # Nordic
    "Sweden": "swe", "Iceland": "isl", "Norway": "swe", "Denmark": "swe", "Finland": "fin",
    # Slavic & Eastern European
    "Poland": "pol", "Czech Republic": "ces", "Slovakia": "slk", "Romania": "ron",
    "Hungary": "hun", "Croatia": "hbs", "Serbia": "hbs", "Bosnia and Herzegovina": "hbs",
    "Montenegro": "hbs", "Slovenia": "slv", "Bulgaria": "bul", "Russia": "rus",
    "Ukraine": "ukr", "Belarus": "bel", "Greece": "ell"
}

def normalize_text(text):
    if not text:
        return ""
    s = text.replace('\u00F0', 'd').replace('\u00D0', 'D')
    s = s.replace('\u00FE', 'th').replace('\u00DE', 'Th')
    s = s.replace('\u00E6', 'ae').replace('\u00C6', 'Ae')
    s = s.replace('\u00F8', 'o').replace('\u00D8', 'O')
    s = s.replace('\u00DF', 'ss')
    return s

def translate_word_hangulize(word, country):
    if not word or not word.strip():
        return ""
    w = word.strip().strip(".,'\"")
    if not w:
        return ""
    
    # 1. Check exact dictionary
    if w in known_players:
        return known_players[w]
    if w in eng_fra_dict:
        return eng_fra_dict[w]
    if w in surnames_dict:
        return surnames_dict[w]
    if w in first_names_dict:
        return first_names_dict[w]
    
    # 2. Check if already Korean
    if re.search(r'[\uAC00-\uD7A3]', w):
        return w
    
    # 3. Use Hangulize if country maps to supported language
    lang_code = country_to_lang.get(country)
    if lang_code:
        try:
            res = hangulize(w, lang_code)
            if res and len(res.strip()) > 0:
                return res.strip()
        except Exception:
            pass
    
    # 4. Default fallback: Hangulize with Italian/Spanish (very natural phonetic loanword)
    try:
        res = hangulize(w, "ita")
        if res and len(res.strip()) > 0:
            return res.strip()
    except Exception:
        pass
    
    return w

def translate_player(p_id, raw_name, country):
    # 0. Master corrections by player ID
    if p_id in player_corrections:
        return player_corrections[p_id]
    
    id_str = str(p_id)
    if id_str in player_corrections:
        return player_corrections[id_str]
    
    # 1. K-League foreigners
    if id_str in k_foreigners:
        return k_foreigners[id_str]
    
    # 2. Master stars
    if raw_name in known_players:
        return known_players[raw_name]
    
    # 3. Korean player romanization
    if country in ["Korea Republic", "South Korea", "Korea DPR"]:
        camel_split = re.sub(r'([a-z])([A-Z])', r'\1 \2', raw_name)
        parts = re.split(r'[\s\-]+', camel_split.lower())
        k_name = ""
        all_matched = True
        for part in parts:
            if part in k_syllables:
                k_name += k_syllables[part]
            else:
                all_matched = False
                break
        if all_matched and len(k_name) >= 2:
            return k_name
    
    # 4. Multi-word translation
    clean_name = normalize_text(raw_name)
    words = clean_name.split()
    translated_words = []
    
    for w in words:
        if "-" in w:
            sub_parts = w.split("-")
            sub_trans = [translate_word_hangulize(sp, country) for sp in sub_parts]
            translated_words.append("".join(sub_trans))
        else:
            translated_words.append(translate_word_hangulize(w, country))
    
    clean_korean = " ".join(translated_words).strip().replace(".", "").replace("'", "")
    if ("Jr." in raw_name or " Jr" in raw_name) and not clean_korean.endswith("주니어"):
        clean_korean = re.sub(r'\s+르$', '', clean_korean)
        clean_korean = re.sub(r'\s+이르$', '', clean_korean)
        clean_korean = clean_korean + " 주니어"
    clean_korean = clean_korean.replace("므크", "맥")
    clean_korean = clean_korean.replace("스히츠크", "시크")
    clean_korean = clean_korean.replace("얀니츠크", "야닉")
    if "Rowe" in raw_name:
        clean_korean = clean_korean.replace("로베", "로우")
    if "McKenzie" in raw_name:
        clean_korean = clean_korean.replace("므켄치에", "맥켄지")
    return clean_korean

# 2. Parse players.csv strictly
print("Parsing players.csv...")
csv_path = os.path.abspath("players.csv - players.csv.csv")

players_by_club = {}
processed_count = 0

with open(csv_path, mode="r", encoding="utf-8", errors="replace") as f:
    reader = csv.reader(f)
    for cols in reader:
        if not cols or len(cols) < 11:
            continue
        try:
            player_id = int(cols[0].strip())
        except ValueError:
            continue
        
        club_name = cols[7].strip()
        if club_name not in clubs:
            continue
        
        known_as = cols[1].strip()
        first_name = cols[2].strip()
        last_name = cols[3].strip()
        raw_full_name = known_as if known_as else f"{first_name} {last_name}".strip()
        
        try:
            ovr = int(cols[4].strip())
        except ValueError:
            ovr = 70
        
        raw_pos = cols[5].strip()
        country = cols[9].strip()
        dob = cols[16].strip() if len(cols) > 16 else ""
        traits_str = cols[17].strip() if len(cols) > 17 else ""
        
        legacy_pos = "MF"
        if raw_pos == "GK":
            legacy_pos = "GK"
        elif raw_pos in ["CB", "LB", "RB", "LWB", "RWB"]:
            legacy_pos = "DF"
        elif raw_pos in ["CDM", "CM", "CAM", "LM", "RM"]:
            legacy_pos = "MF"
        elif raw_pos in ["ST", "CF", "LW", "RW"]:
            legacy_pos = "FW"
        
        birth_year = 2000
        if len(dob) >= 4:
            try:
                birth_year = int(dob[:4])
            except ValueError:
                pass
        age = max(16, min(42, 2026 - birth_year))
        
        korean_name = translate_player(player_id, raw_full_name, country)
        k_country = countries.get(country, country)
        
        traits = [t.strip() for t in traits_str.split(",") if t.strip()] if traits_str else []
        
        def safe_int(idx, default=70):
            if len(cols) > idx:
                try:
                    return int(cols[idx].strip())
                except ValueError:
                    return default
            return default
        
        pace = safe_int(18)
        shooting = safe_int(19)
        passing = safe_int(20)
        dribbling = safe_int(21)
        defending = safe_int(22)
        physical = safe_int(23)
        
        pref_foot = cols[11].strip() if len(cols) > 11 and cols[11].strip() else "Right"
        weak_foot = safe_int(12, 3)
        skill_moves = safe_int(13, 3)
        
        val = round(max(5.0, ((ovr / 70.0) ** 4.5) * 20.0), 1)
        wage = round(max(0.1, ((ovr / 70.0) ** 3.8) * 0.7), 2)
        potential = min(99, ovr + max(0, int((30 - age) * 0.7)))
        
        player_obj = {
            "name": korean_name,
            "position": legacy_pos,
            "country": k_country,
            "age": age,
            "rating": ovr,
            "playerid": player_id,
            "detailPosition": raw_pos,
            "potential": potential,
            "value": val,
            "weeklyWage": wage,
            "preferredFoot": pref_foot,
            "weakFoot": weak_foot,
            "skillMoves": skill_moves,
            "attributes": {
                "pace": pace,
                "shooting": shooting,
                "passing": passing,
                "dribbling": dribbling,
                "defending": defending,
                "physical": physical
            },
            "traits": traits
        }
        
        if club_name not in players_by_club:
            players_by_club[club_name] = []
        players_by_club[club_name].append(player_obj)
        processed_count += 1

print(f"Processed {processed_count} players across {len(players_by_club)} Tier-1 clubs.")

# 3. Assemble teamsData.js
lines = [
    "// easyfmm - FC 27 Real Football World (162 Clubs with Hangulize)",
    "const allTeams = {"
]

for club_key, club_data in clubs.items():
    c_key_safe = club_data.get("key") or club_data.get("name", "").replace(" ", "_") or club_key.replace(" ", "_")
    c_korean_name = club_data.get("name") or c_key_safe.replace("_", " ")
    c_city = club_data.get("city", "")
    c_country = club_data.get("country", "")
    c_league_id = club_data.get("leagueId", "premier_league")
    c_logo = club_data.get("logo", "GEN")
    c_budget = club_data.get("budget", 300)
    c_val = club_data.get("val", 3000)
    c_st_name = club_data.get("stName", f"{c_korean_name} Stadium")
    c_st_cap = club_data.get("stCap", 30000)
    
    p_list = players_by_club.get(club_key, [])
    sorted_players = sorted(p_list, key=lambda x: x["rating"], reverse=True)
    
    # Ensure at least 1 GK
    gk_count = sum(1 for p in sorted_players if p["position"] == "GK")
    if gk_count < 1:
        sorted_players.append({
            "name": f"{c_korean_name} GK",
            "position": "GK",
            "country": c_country,
            "age": 25,
            "rating": 72,
            "playerid": 900000 + (c_budget % 1000),
            "detailPosition": "GK",
            "potential": 76,
            "value": 15.0,
            "weeklyWage": 0.5,
            "preferredFoot": "Right",
            "weakFoot": 3,
            "skillMoves": 1,
            "attributes": { "pace": 68, "shooting": 65, "passing": 68, "dribbling": 70, "defending": 40, "physical": 70 },
            "traits": []
        })
    
    lines.append(f'    "{c_key_safe}": {{')
    lines.append(f'        displayName: "{c_korean_name}",')
    lines.append(f'        city: "{c_city}",')
    lines.append(f'        country: "{c_country}",')
    lines.append(f'        leagueId: "{c_league_id}",')
    lines.append('        league: 1,')
    lines.append(f'        logoCode: "{c_logo}",')
    lines.append(f'        budget: {c_budget},')
    lines.append(f'        clubValue: {c_val},')
    lines.append(f'        stadium: {{ name: "{c_st_name}", capacity: {c_st_cap} }},')
    lines.append(f'        description: "{c_country} {c_korean_name}",')
    lines.append('        players: [')
    
    for p in sorted_players:
        traits_json = json.dumps(p["traits"], ensure_ascii=False)
        attrs = p["attributes"]
        attrs_str = f"{{ pace: {attrs['pace']}, shooting: {attrs['shooting']}, passing: {attrs['passing']}, dribbling: {attrs['dribbling']}, defending: {attrs['defending']}, physical: {attrs['physical']} }}"
        p_line = f'            {{ name: "{p["name"]}", position: "{p["position"]}", country: "{p["country"]}", age: {p["age"]}, rating: {p["rating"]}, playerid: {p["playerid"]}, detailPosition: "{p["detailPosition"]}", potential: {p["potential"]}, value: {p["value"]}, weeklyWage: {p["weeklyWage"]}, preferredFoot: "{p["preferredFoot"]}", weakFoot: {p["weakFoot"]}, skillMoves: {p["skillMoves"]}, attributes: {attrs_str}, traits: {traits_json} }},'
        lines.append(p_line)
    
    lines.append('        ]')
    lines.append('    },')

# 4. Append preserved teams and icons from backup
backup_path = os.path.abspath("easyfmm_backup_initial/teamsData.js")
with open(backup_path, "r", encoding="utf-8") as f:
    backup_text = f.read()

with open("preserved_teams.json", "r", encoding="utf-8") as f:
    preserved_teams = json.load(f)

print("Appending preserved teams...")
for team_name in preserved_teams:
    search_key = f'"{team_name}":'
    start_idx = backup_text.find(search_key)
    if start_idx >= 0:
        line_start = backup_text.rfind("\n", 0, start_idx)
        line_start = 0 if line_start < 0 else line_start + 1
        closing_marker = "    },"
        end_idx = backup_text.find(closing_marker, start_idx)
        if end_idx > start_idx:
            team_block = backup_text[line_start:end_idx + len(closing_marker)]
            lines.append(team_block)
            print(f"Preserved team appended: {team_name}")

lines.append("};")
lines.append("")

icon_idx = backup_text.find("iconPlayersList")
if icon_idx > 0:
    prev_line = backup_text.rfind("\n", 0, icon_idx)
    before_prev = backup_text.rfind("\n", 0, prev_line) if prev_line > 0 else prev_line
    icon_part = backup_text[before_prev + 1:]
    lines.append(icon_part)
    print("Appended iconPlayersList and teams export from backup.")

dest_path = os.path.abspath("easyfmm/teamsData.js")
final_content = "\ufeff" + "\n".join(lines)
with open(dest_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print(f"SUCCESS: Generated {dest_path} with UTF-8 BOM. File size: {len(final_content) / (1024*1024):.2f} MB")

