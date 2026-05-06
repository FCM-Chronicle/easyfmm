/**
 * scoreboard.js
 *
 * 구조 (왼쪽=홈, 오른쪽=어웨이):
 *
 *  [팀1색 배경 | 팀명(2색글자)]  [지그재그]  [2색 배경 | 점수]
 *  [점수(2색글자) | 2색 배경]  [지그재그]  [팀명(2색글자) | 팀1색 배경]
 *
 *  점수는 2번째 색 배경 위에, 팀이름 박스 밖으로 살짝 튀어나온 형태
 *
 * CSS 변수:
 *   홈:   --team-primary (1번색 배경)  / --team-secondary (2번색)
 *   어웨이: --away-team-primary / --away-team-secondary
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────
     1. CSS
  ───────────────────────────────────────── */
  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Noto+Sans+KR:wght@700;900&display=swap');

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
      filter: drop-shadow(0 4px 20px rgba(0,0,0,0.7));
    }

    /* 전체 메인 바 */
    #sb-main-bar {
      display: flex;
      align-items: stretch;
      height: 44px;
      position: relative;
      overflow: visible;
    }

    /* ─────────── 홈팀 ─────────── */
    /* 홈: 왼쪽=팀1색+팀명, 오른쪽=팀2색+점수 */
    #sb-home {
      display: flex;
      align-items: stretch;
      position: relative;
      overflow: visible;
    }

    /* 홈 팀명 칸 — 팀 1번색 배경 */
    #sb-home-name-box {
      display: flex;
      align-items: center;
      padding: 0 14px 0 14px;
      background: var(--sb-home-p, #5c1a1a);
      /* 오른쪽 끝: 지그재그를 위해 clip */
      clip-path: polygon(
        0 0,
        calc(100% - 0px) 0,
        calc(100% - 0px) 100%,
        0 100%
      );
      font-size: clamp(0.78rem, 1.7vw, 0.95rem);
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
      color: var(--sb-home-s, #ffffff);
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
      position: relative;
      z-index: 2;
    }

    /* 홈 점수 칸 — 팀 2번색 배경, 점수 위로 튀어나옴 */
    #sb-home-score-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--sb-home-s, #ffffff);
      padding: 0 10px;
      position: relative;
      z-index: 3;
      overflow: visible;
      min-width: 36px;
    }

    #sb-score-home {
      font-size: clamp(1.7rem, 4vw, 2.3rem);
      font-weight: 900;
      color: var(--sb-home-p, #5c1a1a);  /* 점수 글자 = 1번색 */
      line-height: 1;
      position: relative;
      /* 위아래로 박스 밖 튀어나옴 */
      top: -4px;
      text-shadow: none;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
      display: block;
    }

    #sb-score-home.scored {
      transform: scale(1.4);
      filter: brightness(1.3);
    }

    /* ─────────── 어웨이팀 ─────────── */
    #sb-away {
      display: flex;
      align-items: stretch;
      position: relative;
      overflow: visible;
    }

    /* 어웨이 점수 칸 — 팀 2번색 배경 */
    #sb-away-score-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--sb-away-s, #ffffff);
      padding: 0 10px;
      position: relative;
      z-index: 3;
      overflow: visible;
      min-width: 36px;
    }

    #sb-score-away {
      font-size: clamp(1.7rem, 4vw, 2.3rem);
      font-weight: 900;
      color: var(--sb-away-p, #1a2d5c);  /* 점수 글자 = 1번색 */
      line-height: 1;
      position: relative;
      top: -4px;
      text-shadow: none;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
      display: block;
    }

    #sb-score-away.scored {
      transform: scale(1.4);
      filter: brightness(1.3);
    }

    /* 어웨이 팀명 칸 — 팀 1번색 배경 */
    #sb-away-name-box {
      display: flex;
      align-items: center;
      padding: 0 14px;
      background: var(--sb-away-p, #1a2d5c);
      font-size: clamp(0.78rem, 1.7vw, 0.95rem);
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
      color: var(--sb-away-s, #ffffff);
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
      position: relative;
      z-index: 2;
    }

    /* ─────────── SVG 지그재그 오버레이 ─────────── */
    /* 홈팀 이름박스와 점수박스 사이 지그재그 */
    .sb-zigzag {
      position: absolute;
      top: 0;
      height: 100%;
      width: 20px;
      z-index: 20;
      overflow: visible;
      pointer-events: none;
    }

    /* ─────────── 시간 박스 ─────────── */
    #sb-timer-box {
      background: #0d1117;
      color: #e2e8f0;
      font-size: clamp(0.72rem, 1.4vw, 0.86rem);
      font-weight: 700;
      letter-spacing: 0.12em;
      padding: 4px 28px 5px;
      border-radius: 0 0 6px 6px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.07);
      box-shadow: 0 6px 16px rgba(0,0,0,0.45);
      min-width: 80px;
    }

    /* 득점 플래시 */
    @keyframes sb-goal-flash {
      0%   { filter: drop-shadow(0 4px 20px rgba(0,0,0,0.7)); }
      40%  { filter: drop-shadow(0 0 28px rgba(255,215,0,1)); }
      100% { filter: drop-shadow(0 4px 20px rgba(0,0,0,0.7)); }
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
     2. 지그재그 SVG 생성
     toRight=true  → 왼쪽(팀명)→오른쪽(점수) 방향 지그재그, 홈팀 우측에 사용
     toRight=false → 오른쪽(점수)→왼쪽(팀명) 방향 지그재그, 어웨이팀 좌측에 사용

     지그재그: 세로로 여러 번 꺾이는 W/Z 형태
     - 홈팀 오른쪽: 팀1색(왼쪽)과 팀2색(오른쪽) 사이 경계
     - 어웨이팀 왼쪽: 팀2색(왼쪽)과 팀1색(오른쪽) 사이 경계
  ───────────────────────────────────────── */
  function createZigzagSvg(leftColor, rightColor, toRight) {
    const W = 20;   // SVG 가로 (지그재그 폭)
    const H = 44;   // SVG 세로 (바 높이)
    const N = 4;    // 지그재그 톱니 수
    const step = H / N;

    // 지그재그 꺾임 X 좌표
    const xLeft  = 2;
    const xRight = W - 2;

    // 지그재그 경로 (위→아래)
    let pts = `0,0 `;
    for (let i = 0; i < N; i++) {
      const y1 = i * step;
      const y2 = (i + 0.5) * step;
      const y3 = (i + 1) * step;
      if (toRight) {
        // 홈팀: 왼쪽→오른쪽 방향 지그재그
        pts += `${xLeft},${y1} ${xRight},${y2} ${xLeft},${y3} `;
      } else {
        // 어웨이: 오른쪽→왼쪽 방향
        pts += `${xRight},${y1} ${xLeft},${y2} ${xRight},${y3} `;
      }
    }

    // 오른쪽 색 채우기 (오른쪽 영역)
    const rightPoly = toRight
      ? `${xLeft},0 ${W},0 ${W},${H} ${xLeft},${H} ` + pts.trim().split(' ').reverse().join(' ')
      : null;

    // 왼쪽 색 채우기
    const leftPoly = toRight ? null : null;

    // 간단하게: 두 개의 polygon으로 좌우를 채움
    // 지그재그 경계선을 기준으로 왼쪽=leftColor, 오른쪽=rightColor

    // 경계 포인트 배열 생성
    let boundaryPts = [];
    for (let i = 0; i <= N; i++) {
      const y = i * step;
      if (toRight) {
        boundaryPts.push([xLeft, y]);
        if (i < N) boundaryPts.push([xRight, y + step * 0.5]);
      } else {
        boundaryPts.push([xRight, y]);
        if (i < N) boundaryPts.push([xLeft, y + step * 0.5]);
      }
    }
    // 마지막 포인트 정리
    const lastY = H;
    if (toRight) {
      boundaryPts.push([xLeft, lastY]);
    } else {
      boundaryPts.push([xRight, lastY]);
    }

    const bStr = boundaryPts.map(p => p.join(',')).join(' ');

    // 왼쪽 폴리곤: 0,0 → boundary → 0,H
    const leftPoints = `0,0 ${bStr} 0,${H}`;
    // 오른쪽 폴리곤: W,0 → boundary(역순) → W,H
    const revB = [...boundaryPts].reverse().map(p => p.join(',')).join(' ');
    const rightPoints = `${W},0 ${bStr} ${W},${H}`;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.cssText = `display:block; overflow:visible;`;

    const polyLeft = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polyLeft.setAttribute("points", leftPoints);
    polyLeft.setAttribute("fill", leftColor);

    const polyRight = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polyRight.setAttribute("points", rightPoints);
    polyRight.setAttribute("fill", rightColor);

    svg.appendChild(polyLeft);
    svg.appendChild(polyRight);

    return svg;
  }

  /* ─────────────────────────────────────────
     3. HTML 빌드
  ───────────────────────────────────────── */
  function buildScoreboard() {
    const sb = document.createElement("div");
    sb.id = "ingame-scoreboard";
    sb.innerHTML = `
      <div id="sb-main-bar">
        <!-- 홈팀: [팀1색+팀명] [지그재그] [팀2색+점수] -->
        <div id="sb-home">
          <div id="sb-home-name-box"><span id="sb-home-name">홈팀</span></div>
          <div id="sb-home-zigzag-wrap" style="position:relative;width:20px;flex-shrink:0;"></div>
          <div id="sb-home-score-box"><span id="sb-score-home">0</span></div>
        </div>

        <!-- 어웨이팀: [팀2색+점수] [지그재그] [팀1색+팀명] -->
        <div id="sb-away">
          <div id="sb-away-score-box"><span id="sb-score-away">0</span></div>
          <div id="sb-away-zigzag-wrap" style="position:relative;width:20px;flex-shrink:0;"></div>
          <div id="sb-away-name-box"><span id="sb-away-name">어웨이팀</span></div>
        </div>
      </div>
      <div id="sb-timer-box">00:00</div>
    `;
    return sb;
  }

  /* ─────────────────────────────────────────
     4. 지그재그 SVG 삽입 (색 읽은 후 호출)
  ───────────────────────────────────────── */
  function insertZigzags() {
    const sbEl = document.getElementById("ingame-scoreboard");
    if (!sbEl) return;

    const homePrimary   = sbEl.style.getPropertyValue("--sb-home-p") || "#5c1a1a";
    const homeSecondary = sbEl.style.getPropertyValue("--sb-home-s") || "#ffffff";
    const awayPrimary   = sbEl.style.getPropertyValue("--sb-away-p") || "#1a2d5c";
    const awaySecondary = sbEl.style.getPropertyValue("--sb-away-s") || "#ffffff";

    // 홈팀 지그재그: 왼쪽=팀1색(팀명칸), 오른쪽=팀2색(점수칸), toRight=true
    const homeZZWrap = document.getElementById("sb-home-zigzag-wrap");
    if (homeZZWrap && !homeZZWrap.querySelector("svg")) {
      const svg = createZigzagSvg(homePrimary, homeSecondary, true);
      svg.style.cssText = "position:absolute;top:0;left:0;width:20px;height:44px;z-index:20;";
      homeZZWrap.appendChild(svg);
    }

    // 어웨이팀 지그재그: 왼쪽=팀2색(점수칸), 오른쪽=팀1색(팀명칸), toRight=false
    const awayZZWrap = document.getElementById("sb-away-zigzag-wrap");
    if (awayZZWrap && !awayZZWrap.querySelector("svg")) {
      const svg = createZigzagSvg(awaySecondary, awayPrimary, false);
      svg.style.cssText = "position:absolute;top:0;left:0;width:20px;height:44px;z-index:20;";
      awayZZWrap.appendChild(svg);
    }
  }

  /* ─────────────────────────────────────────
     5. 팀 색상 적용
     ✅ primary = 1번색(배경), secondary = 2번색(글자/점수배경)
  ───────────────────────────────────────── */
  function applyTeamColors() {
    const sbEl = document.getElementById("ingame-scoreboard");
    if (!sbEl) return;

    const cs = getComputedStyle(document.body);
    const homePrimary   = cs.getPropertyValue("--team-primary").trim()        || "#5c1a1a";
    const homeSecondary = cs.getPropertyValue("--team-secondary").trim()      || "#f0d000";
    const awayPrimary   = cs.getPropertyValue("--away-team-primary").trim()   || "#1a2d5c";
    const awaySecondary = cs.getPropertyValue("--away-team-secondary").trim() || "#6ecbf5";

    sbEl.style.setProperty("--sb-home-p", homePrimary);
    sbEl.style.setProperty("--sb-home-s", homeSecondary);
    sbEl.style.setProperty("--sb-away-p", awayPrimary);
    sbEl.style.setProperty("--sb-away-s", awaySecondary);

    // 지그재그 SVG 재생성 (색이 바뀔 수 있으므로)
    ["sb-home-zigzag-wrap", "sb-away-zigzag-wrap"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    });
    insertZigzags();
  }

  /* ─────────────────────────────────────────
     6. 데이터 동기화
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
     7. 타이머
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
          if (mins !== lastMinValue) { timerSec = mins * 60; lastMinValue = mins; }
          else timerSec++;
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
     8. 삽입
  ───────────────────────────────────────── */
  function insertScoreboard() {
    const container = document.getElementById("matchVisualizerContainer");
    if (!container) return false;
    if (document.getElementById("ingame-scoreboard")) return true;

    if (getComputedStyle(container).position === "static")
      container.style.position = "relative";

    const sb = buildScoreboard();
    container.appendChild(sb);
    applyTeamColors();  // 색 적용 + 지그재그 SVG 삽입
    syncData();
    startInternalTimer();

    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncData, 100);
    return true;
  }

  /* ─────────────────────────────────────────
     9. Observer들
  ───────────────────────────────────────── */
  function watchForContainer() {
    if (insertScoreboard()) return;
    const obs = new MutationObserver(() => { if (insertScoreboard()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  new MutationObserver(() => applyTeamColors())
    .observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });

  /* ─────────────────────────────────────────
     10. 초기화
  ───────────────────────────────────────── */
  injectStyle();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchForContainer);
  } else {
    watchForContainer();
  }

  new MutationObserver(() => {
    const ms = document.getElementById("matchScreen");
    if (ms && ms.classList.contains("active")) {
      setTimeout(() => {
        if (!document.getElementById("ingame-scoreboard")) insertScoreboard();
      }, 300);
    }
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });

})();
