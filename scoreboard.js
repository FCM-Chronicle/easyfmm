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
 *   CSS 변수:
 *     홈팀: --team-primary / --team-secondary
 *     어웨이팀: --away-team-primary / --away-team-secondary
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     1. CSS 주입
  ───────────────────────────────────────── */
  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;900&family=Noto+Sans+KR:wght@700;900&display=swap');

    /* ── 스코어보드 래퍼 ── */
    #ingame-scoreboard {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      user-select: none;
      font-family: 'Barlow Condensed', 'Noto Sans KR', sans-serif;
      filter: drop-shadow(0 4px 18px rgba(0,0,0,0.6));
    }

    /* ── 메인 바 ── */
    #sb-main-bar {
      display: flex;
      align-items: stretch;
      height: 48px;
      border-radius: 6px 6px 0 0;
      overflow: hidden;
      width: clamp(300px, 42vw, 500px);
      box-shadow:
        0 4px 20px rgba(0,0,0,0.55),
        0 1px 0 rgba(255,255,255,0.08) inset;
    }

    /* ── 홈 팀 영역 ── */
    #sb-home {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 14px;
      font-size: clamp(0.78rem, 1.7vw, 0.98rem);
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      /* ✅ 홈팀 전용 CSS 변수 사용 */
      background: var(--sb-home-bg, #5c1a1a);
      color: var(--sb-home-txt, #ffffff);
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }

    /* ── 어웨이 팀 영역 ── */
    #sb-away {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 14px;
      font-size: clamp(0.78rem, 1.7vw, 0.98rem);
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      /* ✅ 어웨이팀 전용 CSS 변수 사용 (홈팀과 완전히 분리) */
      background: var(--sb-away-bg, #1a2d5c);
      color: var(--sb-away-txt, #ffffff);
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }

    /* ── 중앙 점수 영역 ── */
    #sb-center {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 16px;
      background: #111827;
      flex-shrink: 0;
      position: relative;
    }

    /* 점수 숫자 */
    #sb-score-home,
    #sb-score-away {
      font-size: clamp(1.5rem, 3.6vw, 2.1rem);
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      letter-spacing: -0.02em;
      min-width: 24px;
      text-align: center;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1),
                  color 0.15s;
    }

    #sb-score-home.scored,
    #sb-score-away.scored {
      transform: scale(1.4);
      color: #ffd700;
    }

    #sb-dash {
      font-size: clamp(1rem, 2.4vw, 1.3rem);
      color: rgba(255,255,255,0.4);
      font-weight: 700;
      margin: 0 2px;
    }

    /* ── 시간 박스 ── */
    #sb-timer-box {
      background: #111827;
      color: #e2e8f0;
      font-size: clamp(0.72rem, 1.4vw, 0.88rem);
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 4px 22px 5px;
      border-radius: 0 0 6px 6px;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.07);
      box-shadow: 0 6px 16px rgba(0,0,0,0.4);
    }

    /* 득점 플래시 */
    @keyframes sb-goal-flash {
      0%   { box-shadow: 0 0 0 0 rgba(255,215,0,0.9); }
      50%  { box-shadow: 0 0 0 16px rgba(255,215,0,0); }
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
        <div id="sb-home">홈팀</div>
        <div id="sb-center">
          <span id="sb-score-home">0</span>
          <span id="sb-dash">–</span>
          <span id="sb-score-away">0</span>
        </div>
        <div id="sb-away">어웨이팀</div>
      </div>
      <div id="sb-timer-box">00:00</div>
    `;
    return sb;
  }

  /* ─────────────────────────────────────────
     3. 팀 색상 적용
     홈팀:   --team-primary  / --team-secondary
     어웨이: --away-team-primary / --away-team-secondary
     ✅ 각 팀이 완전히 독립된 CSS 변수를 사용하도록 수정
        (기존 코드에서 어웨이가 홈팀 변수를 참조하던 버그 해결)
  ───────────────────────────────────────── */
  function applyTeamColors() {
    const sbEl = document.getElementById("ingame-scoreboard");
    if (!sbEl) return;

    const cs = getComputedStyle(document.body);

    // 홈팀 색상
    const homePrimary   = cs.getPropertyValue("--team-primary").trim()     || "#5c1a1a";
    const homeSecondary = cs.getPropertyValue("--team-secondary").trim()   || "#ffffff";

    // ✅ 어웨이팀 색상 — 홈팀 변수와 완전히 분리된 별도 변수 사용
    const awayPrimary   = cs.getPropertyValue("--away-team-primary").trim()   || "#1a2d5c";
    const awaySecondary = cs.getPropertyValue("--away-team-secondary").trim() || "#ffffff";

    sbEl.style.setProperty("--sb-home-bg",  homePrimary);
    sbEl.style.setProperty("--sb-home-txt", homeSecondary);
    sbEl.style.setProperty("--sb-away-bg",  awayPrimary);
    sbEl.style.setProperty("--sb-away-txt", awaySecondary);
  }

  /* ─────────────────────────────────────────
     4. 데이터 동기화
  ───────────────────────────────────────── */
  let syncInterval = null;
  let prevHomeScore = -1;
  let prevAwayScore = -1;

  function syncData() {
    // 팀 이름
    const homeTeamEl = document.getElementById("homeTeam");
    const awayTeamEl = document.getElementById("awayTeam");
    const sbHome = document.getElementById("sb-home");
    const sbAway = document.getElementById("sb-away");
    if (homeTeamEl && sbHome) sbHome.textContent = homeTeamEl.textContent.trim() || "홈팀";
    if (awayTeamEl && sbAway) sbAway.textContent = awayTeamEl.textContent.trim() || "어웨이팀";

    // 점수 파싱 (#scoreDisplay "0 - 0" 형식)
    const scoreEl = document.getElementById("scoreDisplay");
    if (scoreEl) {
      const parts = scoreEl.textContent.split(/[-–]/);
      const h = parseInt(parts[0]) || 0;
      const a = parseInt(parts[1]) || 0;

      const sbScoreHome = document.getElementById("sb-score-home");
      const sbScoreAway = document.getElementById("sb-score-away");
      const sbCenter    = document.getElementById("sb-center");

      if (sbScoreHome && sbScoreAway && sbCenter) {
        if (h !== prevHomeScore) {
          sbScoreHome.textContent = h;
          if (prevHomeScore !== -1) flashScore(sbScoreHome, sbCenter);
          prevHomeScore = h;
        }
        if (a !== prevAwayScore) {
          sbScoreAway.textContent = a;
          if (prevAwayScore !== -1) flashScore(sbScoreAway, sbCenter);
          prevAwayScore = a;
        }
      }
    }
  }

  /* ─────────────────────────────────────────
     5. 실시간 타이머
  ───────────────────────────────────────── */
  let timerSec = 0;
  let lastMinValue = -1;
  let timerRAF = null;
  let lastRAFTime = null;

  function startInternalTimer() {
    if (timerRAF) cancelAnimationFrame(timerRAF);
    lastRAFTime = null;

    function tick(now) {
      if (lastRAFTime === null) lastRAFTime = now;
      const delta = now - lastRAFTime;

      if (delta >= 1000) {
        lastRAFTime = now - (delta % 1000);

        const timeEl = document.getElementById("matchTime");
        if (timeEl) {
          const mins = parseInt(timeEl.textContent) || 0;
          if (mins !== lastMinValue) {
            timerSec = mins * 60;
            lastMinValue = mins;
          } else {
            timerSec++;
          }
        }

        if (timerSec > 5999) timerSec = 5999;

        const sbTimer = document.getElementById("sb-timer-box");
        if (sbTimer) {
          const mm = String(Math.floor(timerSec / 60)).padStart(2, "0");
          const ss = String(timerSec % 60).padStart(2, "0");
          sbTimer.textContent = `${mm}:${ss}`;
        }
      }

      timerRAF = requestAnimationFrame(tick);
    }

    timerRAF = requestAnimationFrame(tick);
  }

  function stopInternalTimer() {
    if (timerRAF) { cancelAnimationFrame(timerRAF); timerRAF = null; }
  }

  function resetTimer() {
    stopInternalTimer();
    timerSec = 0;
    lastMinValue = -1;
    const sbTimer = document.getElementById("sb-timer-box");
    if (sbTimer) sbTimer.textContent = "00:00";
  }

  function flashScore(el, center) {
    el.classList.remove("scored");
    center.classList.remove("goal-flash");
    void el.offsetWidth;
    el.classList.add("scored");
    center.classList.add("goal-flash");
    setTimeout(() => {
      el.classList.remove("scored");
      center.classList.remove("goal-flash");
    }, 1400);
  }

  /* ─────────────────────────────────────────
     6. 경기장 컨테이너에 삽입
  ───────────────────────────────────────── */
  function insertScoreboard() {
    const container = document.getElementById("matchVisualizerContainer");
    if (!container) return false;
    if (document.getElementById("ingame-scoreboard")) return true;

    const cs = getComputedStyle(container);
    if (cs.position === "static") container.style.position = "relative";

    const sb = buildScoreboard();
    container.appendChild(sb);
    applyTeamColors();
    syncData();
    startInternalTimer();

    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncData, 100);

    return true;
  }

  /* ─────────────────────────────────────────
     7. MutationObserver – 경기장이 나타나면 삽입
  ───────────────────────────────────────── */
  function watchForContainer() {
    if (insertScoreboard()) return;

    const observer = new MutationObserver(() => {
      if (insertScoreboard()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ─────────────────────────────────────────
     8. body 속성 변경 감지 (팀 전환 시 색상 갱신)
  ───────────────────────────────────────── */
  const bodyClassObserver = new MutationObserver(() => applyTeamColors());
  bodyClassObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "style"],
  });

  /* ─────────────────────────────────────────
     9. 초기화
  ───────────────────────────────────────── */
  injectStyle();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchForContainer);
  } else {
    watchForContainer();
  }

  // 경기 화면 전환 감지
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
  screenObserver.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

})();
