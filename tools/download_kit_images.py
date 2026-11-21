import os
import sys
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

# 기본 경로 설정 (tools 폴더 기준 상위 폴더가 프로젝트 루트)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)

# teamsData.js 경로 자동 탐색 (루트 또는 easyfmm 하위)
TEAMS_DATA_PATH = os.path.join(ROOT_DIR, 'teamsData.js')
if not os.path.exists(TEAMS_DATA_PATH):
    TEAMS_DATA_PATH = os.path.join(SCRIPT_DIR, 'easyfmm', 'teamsData.js')

OUTPUT_DIR = os.path.join(ROOT_DIR, 'assets', 'kits')

CDN_BASE_URL = "https://cdn.fctoolshub.com/game_assets/fc27/kits/{teamid}_{kit_type}.png"
PNG_HEADER = b'\x89PNG\r\n\x1a\n'

KIT_LABELS = {
    0: "홈(Home)",
    1: "어웨이(Away)",
    2: "골키퍼(GK)",
    3: "서드(Third)"
}

def parse_teams_for_kits(target_league="all"):
    """teamsData.js에서 teamid가 있는 모든 구단 추출"""
    if not os.path.exists(TEAMS_DATA_PATH):
        raise FileNotFoundError(f"teamsData.js를 찾을 수 없습니다: {TEAMS_DATA_PATH}")

    with open(TEAMS_DATA_PATH, 'r', encoding='utf-8') as f:
        text = f.read()

    team_matches = list(re.finditer(r'^\s{4}"([^"]+)":\s*\{', text, re.MULTILINE))
    teams = []

    for i in range(len(team_matches)):
        start = team_matches[i].start()
        end = team_matches[i+1].start() if i + 1 < len(team_matches) else len(text)
        block = text[start:end]
        tkey = team_matches[i].group(1)

        m_tid = re.search(r'teamid:\s*(\d+)', block)
        if not m_tid:
            continue
        tid = int(m_tid.group(1))

        m_lid = re.search(r'leagueId:\s*"([^"]+)"', block)
        lid = m_lid.group(1) if m_lid else ""

        m_dname = re.search(r'displayName:\s*"([^"]+)"', block)
        dname = m_dname.group(1) if m_dname else tkey

        if target_league == "all" or lid == target_league:
            teams.append({
                "teamid": tid,
                "key": tkey,
                "name": dname,
                "league": lid
            })

    return teams

def download_single_kit(job, output_dir, force=False):
    """단일 유니폼 이미지 다운로드 (curl 사용)"""
    tid = job["teamid"]
    tname = job["name"]
    ktype = job["kit_type"]
    filename = f"{tid}_{ktype}.png"
    dest_path = os.path.join(output_dir, filename)
    temp_path = dest_path + ".tmp"

    if not force and os.path.exists(dest_path) and os.path.getsize(dest_path) > 500:
        return {"status": "skipped", "teamid": tid, "name": tname, "kit_type": ktype, "filename": filename}

    url = CDN_BASE_URL.format(teamid=tid, kit_type=ktype)

    try:
        res = subprocess.run(
            ['curl.exe', '-s', '-L', '-w', '%{http_code}', '-o', temp_path, url],
            capture_output=True,
            text=True,
            timeout=15
        )
        http_code = res.stdout.strip()

        if http_code == "200" and os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
            with open(temp_path, 'rb') as f:
                header = f.read(8)
            if header == PNG_HEADER:
                if os.path.exists(dest_path):
                    os.remove(dest_path)
                os.rename(temp_path, dest_path)
                return {
                    "status": "success",
                    "teamid": tid,
                    "name": tname,
                    "kit_type": ktype,
                    "filename": filename,
                    "size": os.path.getsize(dest_path)
                }
            else:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return {"status": "invalid_png", "teamid": tid, "name": tname, "kit_type": ktype, "filename": filename}
        else:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return {"status": "not_found", "http_code": http_code, "teamid": tid, "name": tname, "kit_type": ktype, "filename": filename}

    except Exception as e:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        return {"status": "error", "error": str(e), "teamid": tid, "name": tname, "kit_type": ktype, "filename": filename}

def run_download(target_league="all", include_third=False, max_workers=24, force=False):
    print("=== EasyFMM FC 27 유니폼(Kits) 이미지 다운로더 ===")
    print(f"대상 리그: {target_league}")
    print(f"저장 경로: {OUTPUT_DIR}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    teams = parse_teams_for_kits(target_league)
    # 중복 teamid 제거
    unique_teams = {}
    for t in teams:
        if t["teamid"] not in unique_teams:
            unique_teams[t["teamid"]] = t

    team_list = list(unique_teams.values())
    kit_types = [0, 1, 2, 3] if include_third else [0, 1, 2]

    jobs = []
    for t in team_list:
        for kt in kit_types:
            jobs.append({
                "teamid": t["teamid"],
                "name": t["name"],
                "league": t["league"],
                "kit_type": kt
            })

    total = len(jobs)
    print(f"대상 구단: {len(team_list)}개 팀 / 유니폼 종류: {', '.join(KIT_LABELS[k] for k in kit_types)}")
    print(f"총 다운로드 작업 수: {total}개\n")

    success_cnt = 0
    skipped_cnt = 0
    not_found_cnt = 0
    error_cnt = 0
    not_found_list = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_single_kit, job, OUTPUT_DIR, force): job for job in jobs}
        done = 0
        step = 30
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

            if done % step == 0 or done == total:
                percent = (done / total) * 100 if total > 0 else 100
                print(f"[{done}/{total}] {percent:.1f}% 완료... (성공: {success_cnt}, 스킵: {skipped_cnt}, 없음: {not_found_cnt})")

    print("\n" + "=" * 50)
    print("유니폼 다운로드 완료 요약")
    print("=" * 50)
    print(f"총 요청 파일: {total}개")
    print(f"신규 다운로드 성공: {success_cnt}개")
    print(f"기존 파일 유지(스킵): {skipped_cnt}개")
    print(f"CDN에 이미지 없음(404 등): {not_found_cnt}개")
    print(f"기타 오류: {error_cnt}개")

    if not_found_list:
        print(f"\n* CDN에 유니폼이 없는 항목 ({len(not_found_list)}개 중 최대 15개 표시):")
        for nf in not_found_list[:15]:
            klabel = KIT_LABELS.get(nf['kit_type'], str(nf['kit_type']))
            print(f"  - {nf['name']} (ID: {nf['teamid']}) - {klabel} [{nf['filename']}]")

if __name__ == '__main__':
    league = "all"
    include_third = ("--third" in sys.argv)
    force = ("--force" in sys.argv)
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if args:
        league = args[0]
    run_download(target_league=league, include_third=include_third, force=force)
