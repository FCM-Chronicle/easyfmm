/**
 * scoreboard.js
 * 경기장 UI 내부 상단 중앙에 스코어보드를 삽입합니다.
 * visibleMatch.js 가 경기장을 렌더링한 직후에 호출되거나,
 * MutationObserver 로 경기장 컨테이너가 생성되면 자동으로 삽입됩니다.
 *
 * 의존 요소 (기존 HTML):
 *   #matchVisualizerContainer  – 경기장 컨테이너
 *   #scoreDisplay              – "0 - 0" 형식 점수 텍스트
 *   #matchTime                 – "0분" 형식 경기 시간 텍스트
 *   #homeTeam / #awayTeam      – 팀 이름
 *   CSS 변수 --team-primary / --team-secondary  (style.css 팀 테마)
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     1. CSS 주입
  ───────────────────────────────────────── */
  const STYLE = `
    /* Google Fonts – Barlow Condensed (숫자/이름), Noto Sans KR (한글) */
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Noto+Sans+KR:wght@700;900&display=swap');

    /* ── 스코어보드 래퍼 ── */
    #ingame-scoreboard {
      position: absolute;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      user-select: none;
      font-family: 'Barlow Condensed', 'Noto Sans KR', sans-serif;
      filter: drop-shadow(0 6px 24px rgba(0,0,0,0.55));
    }

    /* ── 메인 바 ── */
    #sb-main-bar {
      display: flex;
      align-items: stretch;
      height: 52px;
      border-radius: 50px;
      overflow: hidden;
      min-width: 340px;
      max-width: 520px;
      width: clamp(300px, 42vw, 480px);
      box-shadow:
        0 2px 0 rgba(255,255,255,0.18) inset,
        0 -2px 0 rgba(0,0,0,0.25) inset,
        0 8px 32px rgba(0,0,0,0.5),
        0 2px 8px rgba(0,0,0,0.4);
    }

    /* ── 홈 / 어웨이 팀 영역 ── */
    .sb-team {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      font-size: clamp(0.8rem, 1.8vw, 1rem);
      font-weight: 900;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      position: relative;
    }

    /* 홈: 팀 1번색 배경, 2번색 텍스트 */
    #sb-home {
      background: var(--sb-home-bg, #1a3a6e);
      color: var(--sb-home-txt, #ffd700);
      /* 오른쪽 끝은 센터 박스에 자연스럽게 이어짐 */
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
      border-right: 1px solid rgba(0,0,0,0.2);
    }

    /* 어웨이: 팀 1번색 배경, 2번색 텍스트 */
    #sb-away {
      background: var(--sb-away-bg, #8b1a1a);
      color: var(--sb-away-txt, #ffffff);
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
      border-left: 1px solid rgba(0,0,0,0.2);
    }

    /* ── 중앙 점수 영역 ── */
    #sb-center {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 14px;
      background: #1a0d2e;       /* 진한 보라 */
      background: linear-gradient(160deg, #23103a 0%, #150926 100%);
      flex-shrink: 0;
      position: relative;
      box-shadow:
        2px 0 8px rgba(0,0,0,0.4) inset,
        -2px 0 8px rgba(0,0,0,0.4) inset;
    }

    /* 리그 로고 자리 (작은 원) */
    #sb-league-icon {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffd700 0%, #f39c12 100%);
      flex-shrink: 0;
      box-shadow: 0 0 6px rgba(255,215,0,0.6);
    }

    /* 점수 숫자 */
    #sb-score-home,
    #sb-score-away {
      font-size: clamp(1.4rem, 3.5vw, 2rem);
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      letter-spacing: -0.02em;
      text-shadow: 0 0 12px rgba(255,255,255,0.3);
      min-width: 26px;
      text-align: center;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1),
                  color 0.15s;
    }

    #sb-score-home.scored,
    #sb-score-away.scored {
      transform: scale(1.35);
      color: #ffd700;
    }

    #sb-dash {
      font-size: clamp(1rem, 2.5vw, 1.4rem);
      color: rgba(255,255,255,0.35);
      font-weight: 700;
    }

    /* ── 시간 박스 ── */
    #sb-timer-box {
      background: linear-gradient(160deg, #23103a 0%, #150926 100%);
      color: #ffffff;
      font-size: clamp(0.7rem, 1.4vw, 0.88rem);
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 4px 18px 6px;
      border-radius: 0 0 14px 14px;
      box-shadow:
        0 6px 16px rgba(0,0,0,0.45),
        0 1px 0 rgba(255,255,255,0.07) inset;
      /* 상단은 메인 바에 딱 붙음 */
      margin-top: 0;
      min-width: 76px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    /* 득점 플래시 애니메이션 */
    @keyframes sb-goal-flash {
      0%   { box-shadow: 0 0 0 0 rgba(255,215,0,0.9); }
      50%  { box-shadow: 0 0 0 14px rgba(255,215,0,0); }
      100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); }
    }

    #sb-center.goal-flash {
      animation: sb-goal-flash 0.6s ease-out 2;
    }
  `;

  function injectStyle() {
    if (document.getElementById("sb-style")) return;
    const s = document.createElement("style");
    s.id = "sb-style";
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────
     2. 스코어보드 HTML 구성
  ───────────────────────────────────────── */
  function buildScoreboard() {
    const sb = document.createElement("div");
    sb.id = "ingame-scoreboard";
    sb.innerHTML = `
      <div id="sb-main-bar">
        <div class="sb-team" id="sb-home">홈팀</div>
        <div id="sb-center">
          <div id="sb-league-icon"></div>
          <span id="sb-score-home">0</span>
          <span id="sb-dash">–</span>
          <span id="sb-score-away">0</span>
        </div>
        <div class="sb-team" id="sb-away">어웨이팀</div>
      </div>
      <div id="sb-timer-box">00:00</div>
    `;
    return sb;
  }

  /* ─────────────────────────────────────────
     3. 팀 색상 읽기
     style.css 의 --team-primary/--team-secondary,
     또는 body 클래스의 CSS 변수를 읽어서 스코어보드에 적용
  ───────────────────────────────────────── */
  function applyTeamColors() {
    const root = document.documentElement;
    const body = document.body;

    // getComputedStyle 로 현재 활성화된 변수 읽기
    const cs = getComputedStyle(body);
    const p1 = cs.getPropertyValue("--team-primary").trim()  || "#1a3a6e";
    const p2 = cs.getPropertyValue("--team-secondary").trim() || "#ffd700";

    // 어웨이는 팀 색상이 없으니 p1/p2 의 보색-feel 어두운 버전 fallback
    const sbEl = document.getElementById("ingame-scoreboard");
    if (!sbEl) return;

    // CSS 변수를 스코어보드 루트에 설정
    sbEl.style.setProperty("--sb-home-bg",  p1);
    sbEl.style.setProperty("--sb-home-txt", p2);

    // 어웨이팀용: 약간 어둡게 변환 (p1을 약간 변형해서 구분)
    sbEl.style.setProperty("--sb-away-bg",  darkenColor(p1, 0.35));
    sbEl.style.setProperty("--sb-away-txt", p2);
  }

  /** hex/rgb 색을 어둡게 만드는 헬퍼 */
  function darkenColor(color, amount) {
    // hex 처리
    if (color.startsWith("#")) {
      let r = parseInt(color.slice(1,3),16);
      let g = parseInt(color.slice(3,5),16);
      let b = parseInt(color.slice(5,7),16);
      r = Math.max(0, Math.round(r * (1 - amount)));
      g = Math.max(0, Math.round(g * (1 - amount)));
      b = Math.max(0, Math.round(b * (1 - amount)));
      return `rgb(${r},${g},${b})`;
    }
    // rgba/rgb 처리
    const m = color.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      return `rgb(${Math.max(0,Math.round(m[0]*(1-amount)))},${Math.max(0,Math.round(m[1]*(1-amount)))},${Math.max(0,Math.round(m[2]*(1-amount)))})`;
    }
    return color;
  }

  /* ─────────────────────────────────────────
     4. 기존 DOM 에서 데이터 동기화
  ───────────────────────────────────────── */
  let lastScore = "";
  let syncInterval = null;

  function syncData() {
    const sbHome = document.getElementById("sb-home");
    const sbAway = document.getElementById("sb-away");
    const sbScoreHome = document.getElementById("sb-score-home");
    const sbScoreAway = document.getElementById("sb-score-away");
    const sbTimer    = document.getElementById("sb-timer-box");
    const sbCenter   = document.getElementById("sb-center");

    if (!sbHome) return;

    // ─ 팀 이름 ─
    const homeEl = document.getElementById("homeTeam");
    const awayEl = document.getElementById("awayTeam");
    if (homeEl) sbHome.textContent = homeEl.textContent.trim();
    if (awayEl) sbAway.textContent = awayEl.textContent.trim();

    // ─ 점수 ─
    const scoreEl = document.getElementById("scoreDisplay");
    if (scoreEl) {
      const raw = scoreEl.textContent.replace(/\s/g, "");
      // 형식: "2 - 1" 또는 "2-1"
      const parts = raw.split(/[-–]/);
      if (parts.length === 2) {
        const hs = parts[0].trim();
        const as = parts[1].trim();

        if (raw !== lastScore) {
          // 득점 애니메이션
          const prevParts = lastScore.split(/[-–]/);
          if (prevParts[0] && hs !== prevParts[0].trim()) flashScore(sbScoreHome, sbCenter);
          if (prevParts[1] && as !== prevParts[1].trim()) flashScore(sbScoreAway, sbCenter);
          lastScore = raw;
        }

        sbScoreHome.textContent = hs;
        sbScoreAway.textContent = as;
      }
    }

    // ─ 경기 시간 ─
    const timeEl = document.getElementById("matchTime");
    if (timeEl && sbTimer) {
      const raw = timeEl.textContent.trim(); // e.g. "45분" or "45"
      const mins = parseInt(raw) || 0;
      const mm = String(Math.floor(mins)).padStart(2,"0");
      const ss = "00"; // 원본에 초 정보 없으면 00
      sbTimer.textContent = `${mm}:${ss}`;
    }

    // ─ 팀 색상 재적용 (팀 변경 시 대응) ─
    applyTeamColors();
  }

  function flashScore(el, center) {
    el.classList.remove("scored");
    center.classList.remove("goal-flash");
    void el.offsetWidth; // reflow
    el.classList.add("scored");
    center.classList.add("goal-flash");
    setTimeout(() => {
      el.classList.remove("scored");
      center.classList.remove("goal-flash");
    }, 1400);
  }

  /* ─────────────────────────────────────────
     5. 경기장 컨테이너에 삽입
  ───────────────────────────────────────── */
  function insertScoreboard() {
    const container = document.getElementById("matchVisualizerContainer");
    if (!container) return false;
    if (document.getElementById("ingame-scoreboard")) return true; // 이미 있음

    // 경기장 컨테이너가 position: relative 인지 확인
    const cs = getComputedStyle(container);
    if (cs.position === "static") {
      container.style.position = "relative";
    }

    const sb = buildScoreboard();
    container.appendChild(sb);
    applyTeamColors();
    syncData();

    // 주기적 동기화 (100ms)
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncData, 100);

    return true;
  }

  /* ─────────────────────────────────────────
     6. MutationObserver – 경기장이 나타나면 삽입
  ───────────────────────────────────────── */
  function watchForContainer() {
    // 이미 존재하면 즉시 삽입
    if (insertScoreboard()) return;

    const observer = new MutationObserver(() => {
      if (insertScoreboard()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ─────────────────────────────────────────
     7. body 클래스 변경 감지 (팀 전환 시 색상 갱신)
  ───────────────────────────────────────── */
  const bodyClassObserver = new MutationObserver(() => {
    applyTeamColors();
  });
  bodyClassObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });

  /* ─────────────────────────────────────────
     8. 초기화
  ───────────────────────────────────────── */
  injectStyle();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchForContainer);
  } else {
    watchForContainer();
  }

  // 경기 화면 전환 감지 (screen 클래스 토글)
  const screenObserver = new MutationObserver(() => {
    const matchScreen = document.getElementById("matchScreen");
    if (matchScreen && matchScreen.classList.contains("active")) {
      setTimeout(() => {
        if (!document.getElementById("ingame-scoreboard")) {
          insertScoreboard();
        }
      }, 300);
    }
  });
  screenObserver.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });

})();
