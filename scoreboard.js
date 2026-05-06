/**
 * scoreboard.js
 * 경기장 UI 내부 상단 중앙에 스코어보드를 삽입합니다.
 *
 * 의존 요소 (기존 HTML):
 *   #matchVisualizerContainer  – 경기장 컨테이너
 *   #scoreDisplay              – "0 - 0" 형식 점수 텍스트
 *   #matchTime                 – "0분" 형식 경기 시간 텍스트
 *   #homeTeam / #awayTeam      – 팀 이름
 *   CSS 변수:
 *     홈팀:   --team-primary (배경색) / --team-secondary (글자색)
 *     어웨이: --away-team-primary (배경색) / --away-team-secondary (글자색)
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     1. CSS 주입
  ───────────────────────────────────────── */
  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Noto+Sans+KR:wght@700;900&display=swap');

    /* ── 전체 래퍼 ── */
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
      filter: drop-shadow(0 4px 18px rgba(0,0,0,0.65));
    }

    /* ── 메인 바 ── */
    #sb-main-bar {
      display: flex;
      align-items: center;
      height: 44px;
      overflow: visible;          /* 숫자가 박스 밖으로 튀어나올 수 있도록 */
      width: clamp(280px, 40vw, 460px);
      position: relative;
    }

    /* ══════════════════════════════════════
       홈팀 박스
       - clip-path: 오른쪽 끝을 사선으로 잘라 지그재그 효과
       - overflow: visible → 자식 #sb-score-home이 clip 바깥으로 나올 수 있음
    ══════════════════════════════════════ */
    #sb-home {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 38px 0 14px;   /* 오른쪽 여백: 숫자 공간 */
      /* 오른쪽 끝 사선 */
      clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%);
      font-size: clamp(0.78rem, 1.7vw, 0.95rem);
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: visible;
      /* ✅ primary = 배경, secondary = 글자 */
      background: var(--sb-home-bg, #5c1a1a);
      color: var(--sb-home-txt, #ffffff);
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
      position: relative;
      z-index: 2;
    }

    /* 홈팀 점수: 박스 오른쪽 경계를 넘어 튀어나옴 */
    #sb-score-home {
      position: absolute;
      /* clip-path로 잘린 박스 안에 있지만 숫자 자체는 더 오른쪽에 */
      right: -2px;
      top: 50%;
      transform: translateY(-50%);
      font-size: clamp(1.6rem, 3.8vw, 2.2rem);
      font-weight: 900;
      color: var(--sb-home-txt, #ffffff);
      line-height: 1;
      z-index: 10;
      text-shadow:
        0 0 10px rgba(0,0,0,0.9),
        0 2px 8px rgba(0,0,0,0.7);
      min-width: 30px;
      text-align: center;
      /* clip-path 영향 안 받도록 position absolute + z-index 높임 */
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), color 0.15s;
    }

    #sb-score-home.scored {
      transform: translateY(-50%) scale(1.4);
      color: #ffd700;
    }

    /* ══════════════════════════════════════
       어웨이팀 박스
       - clip-path: 왼쪽 끝을 사선으로 잘라 홈팀과 반대 지그재그
    ══════════════════════════════════════ */
    #sb-away {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 14px 0 38px;   /* 왼쪽 여백: 숫자 공간 */
      /* 왼쪽 끝 사선 (홈팀과 반대 방향) */
      clip-path: polygon(0 0, 100% 0, 100% 100%, 16px 100%);
      font-size: clamp(0.78rem, 1.7vw, 0.95rem);
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: visible;
      /* ✅ 어웨이 전용 변수 — 홈팀과 완전히 분리 */
      background: var(--sb-away-bg, #1a2d5c);
      color: var(--sb-away-txt, #ffffff);
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
      position: relative;
      z-index: 2;
    }

    /* 어웨이팀 점수: 박스 왼쪽 경계를 넘어 튀어나옴 */
    #sb-score-away {
      position: absolute;
      left: -2px;
      top: 50%;
      transform: translateY(-50%);
      font-size: clamp(1.6rem, 3.8vw, 2.2rem);
      font-weight: 900;
      color: var(--sb-away-txt, #ffffff);
      line-height: 1;
      z-index: 10;
      text-shadow:
        0 0 10px rgba(0,0,0,0.9),
        0 2px 8px rgba(0,0,0,0.7);
      min-width: 30px;
      text-align: center;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), color 0.15s;
    }

    #sb-score-away.scored {
      transform: translateY(-50%) scale(1.4);
      color: #ffd700;
    }

    /* ── 중앙 구분선 (두 팀 사이) ── */
    #sb-divider {
      width: 4px;
      height: 100%;
      background: #0d1117;
      flex-shrink: 0;
      position: relative;
      z-index: 5;
    }

    /* ── 시간 박스 ── */
    #sb-timer-box {
      background: #0d1117;
      color: #e2e8f0;
      font-size: clamp(0.72rem, 1.4vw, 0.86rem);
      font-weight: 700;
      letter-spacing: 0.12em;
      padding: 4px 28px 5px;
      border-radius: 0 0 6px 6px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 6px 16px rgba(0,0,0,0.45);
      min-width: 80px;
    }

    /* ── 득점 플래시 ── */
    @keyframes sb-goal-flash {
      0%   { filter: drop-shadow(0 4px 18px rgba(0,0,0,0.65)); }
      40%  { filter: drop-shadow(0 0 24px rgba(255,215,0,1)); }
      100% { filter: drop-shadow(0 4px 18px rgba(0,0,0,0.65)); }
    }

    #ingame-scoreboard.goal-flash {
      animation: sb-goal-flash 0.7s ease-out 2;
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
     2. 스코어보드 HTML
     점수 숫자를 각 팀 박스 내부에 absolute 배치 →
     clip-path로 잘린 박스 경계를 시각적으로 넘어 튀어나옴
  ───────────────────────────────────────── */
  function buildScoreboard() {
    const sb = document.createElement("div");
    sb.id = "ingame-scoreboard";
    sb.innerHTML = `
      <div id="sb-main-bar">
        <div id="sb-home">
          <span id="sb-home-name">홈팀</span>
          <span id="sb-score-home">0</span>
        </div>
        <div id="sb-divider"></div>
        <div id="sb-away">
          <span id="sb-score-away">0</span>
          <span id="sb-away-name">어웨이팀</span>
        </div>
      </div>
      <div id="sb-timer-box">00:00</div>
    `;
    return sb;
  }

  /* ─────────────────────────────────────────
     3. 팀 색상 적용
     ✅ primary = 배경, secondary = 글자 (이전 코드의 반전 버그 수정)
     ✅ 어웨이 = --away-team-primary / --away-team-secondary (홈과 완전 분리)
  ───────────────────────────────────────── */
  function applyTeamColors() {
    const sbEl = document.getElementById("ingame-scoreboard");
    if (!sbEl) return;

    const cs = getComputedStyle(document.body);

    const homeBg  = cs.getPropertyValue("--team-primary").trim()        || "#5c1a1a";
    const homeTxt = cs.getPropertyValue("--team-secondary").trim()      || "#ffffff";
    const awayBg  = cs.getPropertyValue("--away-team-primary").trim()   || "#1a2d5c";
    const awayTxt = cs.getPropertyValue("--away-team-secondary").trim() || "#ffffff";

    sbEl.style.setProperty("--sb-home-bg",  homeBg);
    sbEl.style.setProperty("--sb-home-txt", homeTxt);
    sbEl.style.setProperty("--sb-away-bg",  awayBg);
    sbEl.style.setProperty("--sb-away-txt", awayTxt);
  }

  /* ─────────────────────────────────────────
     4. 데이터 동기화
  ───────────────────────────────────────── */
  let syncInterval  = null;
  let prevHomeScore = -1;
  let prevAwayScore = -1;

  function syncData() {
    const homeTeamEl = document.getElementById("homeTeam");
    const awayTeamEl = document.getElementById("awayTeam");
    const sbHomeName = document.getElementById("sb-home-name");
    const sbAwayName = document.getElementById("sb-away-name");
    if (homeTeamEl && sbHomeName) sbHomeName.textContent = homeTeamEl.textContent.trim() || "홈팀";
    if (awayTeamEl && sbAwayName) sbAwayName.textContent = awayTeamEl.textContent.trim() || "어웨이팀";

    const scoreEl = document.getElementById("scoreDisplay");
    if (scoreEl) {
      const parts = scoreEl.textContent.split(/[-–]/);
      const h = parseInt(parts[0]) || 0;
      const a = parseInt(parts[1]) || 0;

      const sbScoreHome = document.getElementById("sb-score-home");
      const sbScoreAway = document.getElementById("sb-score-away");
      const sbRoot      = document.getElementById("ingame-scoreboard");

      if (sbScoreHome && sbScoreAway) {
        if (h !== prevHomeScore) {
          sbScoreHome.textContent = h;
          if (prevHomeScore !== -1) flashScore(sbScoreHome, sbRoot);
          prevHomeScore = h;
        }
        if (a !== prevAwayScore) {
          sbScoreAway.textContent = a;
          if (prevAwayScore !== -1) flashScore(sbScoreAway, sbRoot);
          prevAwayScore = a;
        }
      }
    }
  }

  /* ─────────────────────────────────────────
     5. 실시간 타이머
  ───────────────────────────────────────── */
  let timerSec     = 0;
  let lastMinValue = -1;
  let timerRAF     = null;
  let lastRAFTime  = null;

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

  function flashScore(el, root) {
    el.classList.remove("scored");
    root.classList.remove("goal-flash");
    void el.offsetWidth;
    el.classList.add("scored");
    root.classList.add("goal-flash");
    setTimeout(() => {
      el.classList.remove("scored");
      root.classList.remove("goal-flash");
    }, 1500);
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

  const screenObserver = new MutationObserver(() => {
    const matchScreen = document.getElementById("matchScreen");
    if (matchScreen && matchScreen.classList.contains("active")) {
      setTimeout(() => {
        if (!document.getElementById("ingame-scoreboard")) insertScoreboard();
      }, 300);
    }
  });
  screenObserver.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

})();
