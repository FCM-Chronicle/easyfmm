import os
import sys
import re
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

# 기본 경로 설정
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TEAMS_DATA_PATH = os.path.join(SCRIPT_DIR, 'easyfmm', 'teamsData.js')
OUTPUT_DIR = os.path.join(SCRIPT_DIR, 'easyfmm', 'assets', 'players')

CDN_BASE_URL = "https://fco.vod.nexoncdn.co.kr/jade_assets/static/players/players_27/p{pid}.png"
PNG_HEADER = b'\x89PNG\r\n\x1a\n'

def parse_teams_data(target_league="premier_league"):
    """teamsData.js 파일에서 대상 리그의 팀과 선수 목록 추출"""
    if not os.path.exists(TEAMS_DATA_PATH):
        raise FileNotFoundError(f"teamsData.js를 찾을 수 없습니다: {TEAMS_DATA_PATH}")

    with open(TEAMS_DATA_PATH, 'r', encoding='utf-8') as f:
        text = f.read()

    team_matches = list(re.finditer(r'^\s{4}"([^"]+)":\s*\{', text, re.MULTILINE))
    players = []

    for i in range(len(team_matches)):
        start = team_matches[i].start()
        end = team_matches[i+1].start() if i + 1 < len(team_matches) else len(text)
        block = text[start:end]
        tname = team_matches[i].group(1)

        m_lid = re.search(r'leagueId:\s*"([^"]+)"', block)
        lid = m_lid.group(1) if m_lid else ""

        if target_league == "all" or lid == target_league:
            for pmatch in re.finditer(r'playerid:\s*(\d+)', block):
                pid = int(pmatch.group(1))
                # 선수 이름 추출
                start_line = block.rfind('\n', 0, pmatch.start())
                end_line = block.find('\n', pmatch.end())
                line = block[start_line:end_line]
                pname_m = re.search(r'name:\s*"([^"]+)"', line)
                pname = pname_m.group(1) if pname_m else f"ID_{pid}"
                players.append({
                    "id": pid,
                    "name": pname,
                    "team": tname,
                    "league": lid
                })

    return players

def download_single_player(player, output_dir, force=False):
    """단일 선수 이미지 다운로드 (curl 사용)"""
    pid = player["id"]
    pname = player["name"]
    team = player["team"]
    filename = f"p{pid}.png"
    dest_path = os.path.join(output_dir, filename)
    temp_path = dest_path + ".tmp"

    # 이미 존재하고 정상 크기인 경우 스킵
    if not force and os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        return {"status": "skipped", "id": pid, "name": pname, "team": team}

    url = CDN_BASE_URL.format(pid=pid)

    try:
        # curl을 사용하여 다운로드 및 http_code 확인
        res = subprocess.run(
            ['curl.exe', '-s', '-w', '%{http_code}', '-o', temp_path, url],
            capture_output=True,
            text=True,
            timeout=15
        )
        http_code = res.stdout.strip()

        if http_code == "200" and os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
            # PNG 헤더 검증
            with open(temp_path, 'rb') as f:
                header = f.read(8)
            if header == PNG_HEADER:
                if os.path.exists(dest_path):
                    os.remove(dest_path)
                os.rename(temp_path, dest_path)
                return {"status": "success", "id": pid, "name": pname, "team": team, "size": os.path.getsize(dest_path)}
            else:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return {"status": "invalid_png", "id": pid, "name": pname, "team": team}
        else:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return {"status": "not_found", "http_code": http_code, "id": pid, "name": pname, "team": team}

    except Exception as e:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        return {"status": "error", "error": str(e), "id": pid, "name": pname, "team": team}

def run_download(target_league="premier_league", max_workers=16, force=False):
    print(f"=== EasyFMM 선수 이미지 다운로더 ===")
    print(f"대상 리그: {target_league}")
    print(f"저장 경로: {OUTPUT_DIR}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    players = parse_teams_data(target_league)
    print(f"추출된 선수 수: {len(players)}명")

    # 고유 ID 기준 중복 제거
    unique_players = {}
    for p in players:
        if p["id"] not in unique_players:
            unique_players[p["id"]] = p

    player_list = list(unique_players.values())
    total = len(player_list)
    print(f"다운로드 대상 선수 (고유 ID): {total}명\n")

    success_cnt = 0
    skipped_cnt = 0
    not_found_cnt = 0
    error_cnt = 0

    not_found_list = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_single_player, p, OUTPUT_DIR, force): p for p in player_list}
        done = 0
        step = 100 if total > 1000 else 50
        for f in as_completed(futures):
            done += 1
            res = f.result()
            status = res["status"]
            if status == "success":
                success_cnt += 1
            elif status == "skipped":
                skipped_cnt += 1
            elif status in ("not_found", "invalid_png"):
                not_found_cnt += 1
                not_found_list.append(res)
            else:
                error_cnt += 1

            # 주기적으로 진행 상황 출력
            if done % step == 0 or done == total:
                percent = (done / total) * 100
                print(f"[{done}/{total}] {percent:.1f}% 완료... (신규성공: {success_cnt}, 기존유지: {skipped_cnt}, 없음: {not_found_cnt})")

    print("\n" + "="*45)
    print("다운로드 작업 완료 요약")
    print("="*45)
    print(f"총 대상 선수: {total}명")
    print(f"다운로드 성공: {success_cnt}명")
    print(f"기존 파일 유지(스킵): {skipped_cnt}명")
    print(f"CDN에 이미지 없음(404 등): {not_found_cnt}명")
    print(f"기타 오류: {error_cnt}명")

    if not_found_list:
        print(f"\n* CDN에 이미지가 없는 선수 ({len(not_found_list)}명):")
        for nf in not_found_list[:15]:
            print(f"  - [{nf['team']}] {nf['name']} (ID: {nf['id']})")
        if len(not_found_list) > 15:
            print(f"  ... 외 {len(not_found_list) - 15}명")

if __name__ == '__main__':
    league = "premier_league"
    if len(sys.argv) > 1:
        league = sys.argv[1]
    workers = 32 if league == "all" else 16
    run_download(target_league=league, max_workers=workers)
    if sys.stdin.isatty():
        try:
            input("\n계속하려면 Enter 키를 누르세요...")
        except Exception:
            pass

