/**
 * scoreboard.js — Premier League / EA Sports FC Broadcast Scorebug & Live Stats Drawer
 *
 * - Top broadcast scorebug with Competition Emblem, Match Timer Capsule, Home/Away Logos & Score
 * - Periodic TV Broadcast Lower-Third Drawer showing:
 *   1) Ball Possession (%)
 *   2) Total Fouls & Tackles
 *   3) Shots & On Target
 *   4) Player to Watch / Live Key Performer
 *   5) Goal Scorer Broadcast Banner on Goal
 */

(function () {
  "use strict";

  const STYLE = `
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
      font-family: 'Pretendard Variable', 'Pretendard', 'Inter', 'Noto Sans KR', sans-serif;
      filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.58));
    }

    /* ── Main Broadcast Scorebug Bar ── */
    #sb-main-bar {
      display: flex;
      align-items: stretch;
      height: 44px;
      background: rgba(9, 13, 22, 0.94);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }

    /* ── Competition & Timer Left Capsule ── */
    #sb-clock-wing {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 13px;
      background: rgba(2, 132, 199, 0.18);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    #sb-comp-logo {
      width: 20px;
      height: 20px;
      object-fit: contain;
      display: none;
    }

    #sb-comp-tag {
      font-size: 0.68rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: #38BDF8;
      text-transform: uppercase;
    }

    #sb-timer-box {
      font-size: 0.84rem;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: 0.05em;
      font-variant-numeric: tabular-nums;
      min-width: 46px;
      text-align: center;
    }

    /* ── Team Sections ── */
    .sb-team-section {
      display: flex;
      align-items: center;
      position: relative;
      min-width: 118px;
    }

    .sb-team-logo {
      width: 24px;
      height: 24px;
      object-fit: contain;
      flex-shrink: 0;
      filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6));
    }

    .sb-name-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 14px;
      font-size: clamp(0.76rem, 1.5vw, 0.88rem);
      font-weight: 800;
      letter-spacing: -0.01em;
      white-space: nowrap;
      color: #F8FAFC;
    }

    #sb-home .sb-name-box {
      justify-content: flex-end;
      width: 100%;
    }

    #sb-away .sb-name-box {
      justify-content: flex-start;
      width: 100%;
    }

    /* ── Center Score Capsule ── */
    #sb-score-center {
      display: flex;
      align-items: center;
      background: #1E293B;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0 4px;
      flex-shrink: 0;
    }

    .sb-score-box {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 34px;
      padding: 0 4px;
    }

    .sb-score-num {
      font-size: 1.32rem;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.25s;
    }

    .sb-score-num.scored {
      transform: scale(1.3);
      color: #FBBF24;
    }

    #sb-score-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14px;
    }

    #sb-score-divider span {
      display: block;
      width: 6px;
      height: 2px;
      background: rgba(255, 255, 255, 0.35);
      border-radius: 1px;
    }

    /* ── Broadcast Lower-Third Drawer (Possession / Fouls / Player to Watch / Goal) ── */
    #sb-broadcast-drawer {
      margin-top: 5px;
      min-width: 340px;
      max-width: 480px;
      padding: 7px 16px;
      border-radius: 8px;
      background: rgba(9, 13, 22, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      opacity: 0;
      transform: translateY(-8px) scale(0.98);
      transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }

    #sb-broadcast-drawer.open {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    #sb-broadcast-drawer.mode-goal {
      background: linear-gradient(90deg, rgba(6, 78, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
      border-color: rgba(52, 211, 153, 0.5);
    }

    .sb-drawer-tag {
      font-size: 0.66rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 4px;
      background: rgba(56, 189, 248, 0.16);
      color: #38BDF8;
      white-space: nowrap;
      flex-shrink: 0;
    }

    #sb-broadcast-drawer.mode-goal .sb-drawer-tag {
      background: #10B981;
      color: #06281E;
    }

    #sb-broadcast-drawer.mode-watch .sb-drawer-tag {
      background: rgba(245, 158, 11, 0.2);
      color: #FBBF24;
    }

    .sb-drawer-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #F1F5F9;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sb-drawer-poss-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .sb-drawer-poss-track {
      flex: 1;
      height: 5px;
      background: rgba(255, 255, 255, 0.14);
      border-radius: 999px;
      overflow: hidden;
      min-width: 90px;
    }

    .sb-drawer-poss-fill {
      height: 100%;
      background: #38BDF8;
      border-radius: 999px;
      transition: width 0.35s ease;
    }

    /* ── Goal Flash Animation ── */
    @keyframes sb-goal-flash {
      0%   { filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5)); }
      35%  { filter: drop-shadow(0 0 28px rgba(52, 211, 153, 0.75)); }
      100% { filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5)); }
    }

    #ingame-scoreboard.goal-flash {
      animation: sb-goal-flash 0.8s ease-out 2;
    }

    @media (max-width: 600px) {
      #sb-main-bar { height: 38px; }
      .sb-team-section { min-width: 84px; }
      .sb-name-box { padding: 0 8px; font-size: 0.72rem; }
      #sb-broadcast-drawer { min-width: 260px; padding: 5px 10px; }
    }
  `;

  function injectStyle() {
    if (document.getElementById("sb-style")) return;
    const s = document.createElement("style");
    s.id = "sb-style";
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function buildScoreboard() {
    const sb = document.createElement("div");
    sb.id = "ingame-scoreboard";

    const mainBar = document.createElement("div");
    mainBar.id = "sb-main-bar";

    // 좌측 대회 로고 & 타이머 캡슐
    const clockWing = document.createElement("div");
    clockWing.id = "sb-clock-wing";

    const compLogo = document.createElement("img");
    compLogo.id = "sb-comp-logo";
    compLogo.alt = "";

    const compTag = document.createElement("span");
    compTag.id = "sb-comp-tag";
    compTag.textContent = "LIVE";

    const timerBox = document.createElement("div");
    timerBox.id = "sb-timer-box";
    timerBox.textContent = "00:00";

    clockWing.append(compLogo, compTag, timerBox);

    // 홈팀
    const homeSection = document.createElement("div");
    homeSection.id = "sb-home";
    homeSection.className = "sb-team-section";
    const homeNameBox = document.createElement("div");
    homeNameBox.className = "sb-name-box";
    const homeLogo = document.createElement("img");
    homeLogo.id = "sb-home-logo";
    homeLogo.className = "sb-team-logo";
    homeLogo.src = "";
    homeLogo.alt = "";
    homeLogo.style.display = "none";
    const homeName = document.createElement("span");
    homeName.id = "sb-home-name";
    homeName.textContent = "홈팀";
    homeNameBox.append(homeLogo, homeName);
    homeSection.appendChild(homeNameBox);

    // 스코어
    const scoreCenter = document.createElement("div");
    scoreCenter.id = "sb-score-center";

    const homeScoreBox = document.createElement("div");
    homeScoreBox.id = "sb-home-score-box";
    homeScoreBox.className = "sb-score-box";
    const homeScore = document.createElement("span");
    homeScore.id = "sb-score-home";
    homeScore.className = "sb-score-num";
    homeScore.textContent = "0";
    homeScoreBox.appendChild(homeScore);

    const divider = document.createElement("div");
    divider.id = "sb-score-divider";
    divider.appendChild(document.createElement("span"));

    const awayScoreBox = document.createElement("div");
    awayScoreBox.id = "sb-away-score-box";
    awayScoreBox.className = "sb-score-box";
    const awayScore = document.createElement("span");
    awayScore.id = "sb-score-away";
    awayScore.className = "sb-score-num";
    awayScore.textContent = "0";
    awayScoreBox.appendChild(awayScore);

    scoreCenter.append(homeScoreBox, divider, awayScoreBox);

    // 어웨이팀
    const awaySection = document.createElement("div");
    awaySection.id = "sb-away";
    awaySection.className = "sb-team-section";
    const awayNameBox = document.createElement("div");
    awayNameBox.className = "sb-name-box";
    const awayName = document.createElement("span");
    awayName.id = "sb-away-name";
    awayName.textContent = "어웨이팀";
    const awayLogo = document.createElement("img");
    awayLogo.id = "sb-away-logo";
    awayLogo.className = "sb-team-logo";
    awayLogo.src = "";
    awayLogo.alt = "";
    awayLogo.style.display = "none";
    awayNameBox.append(awayName, awayLogo);
    awaySection.appendChild(awayNameBox);

    mainBar.append(clockWing, homeSection, scoreCenter, awaySection);

    // 하단 중계 드로어 (점유율 · 총 파울 · 슈팅 · 주목할 선수 · 골 배너)
    const drawer = document.createElement("div");
    drawer.id = "sb-broadcast-drawer";

    const drawerTag = document.createElement("span");
    drawerTag.id = "sb-drawer-tag";
    drawerTag.className = "sb-drawer-tag";
    drawerTag.textContent = "MATCH INFO";

    const drawerBody = document.createElement("div");
    drawerBody.id = "sb-drawer-body";
    drawerBody.className = "sb-drawer-body";

    drawer.append(drawerTag, drawerBody);

    sb.append(mainBar, drawer);
    return sb;
  }

  function applyTeamColors() {
    const sbEl = document.getElementById("ingame-scoreboard");
    if (!sbEl) return;

    const cs = getComputedStyle(document.body);
    const homePrimary = cs.getPropertyValue("--team-primary").trim() || "#e74c3c";
    const awayPrimary = cs.getPropertyValue("--away-team-primary").trim() || "#3498db";

    sbEl.style.setProperty("--sb-home-p", homePrimary);
    sbEl.style.setProperty("--sb-away-p", awayPrimary);
  }

  let syncInterval = null;
  let prevHomeScore = -1;
  let prevAwayScore = -1;
  let lastLogoHomeKey = null;
  let lastLogoAwayKey = null;
  let lastDrawerMinute = -1;
  let drawerHideTimeout = null;
  let lastShownGoalTimestamp = 0;

  function applyTeamLogos() {
    const md = window.currentMatchData;
    const teams = window.allTeams;
    if (!md) return;

    const homeKey = md.homeTeam;
    const awayKey = md.awayTeam;

    if (homeKey === lastLogoHomeKey && awayKey === lastLogoAwayKey) return;

    // 대회 로고 / 태그 세팅
    const compLogo = document.getElementById("sb-comp-logo");
    const compTag = document.getElementById("sb-comp-tag");
    if (compTag && window.gameData) {
      if (window.gameData.isUCLMatch) {
        if (compLogo) {
          compLogo.src = (window.CUP_CONFIGS && window.CUP_CONFIGS.ucl && window.CUP_CONFIGS.ucl.logo)
            ? window.CUP_CONFIGS.ucl.logo
            : "assets/cup_logos/ucl.png";
          compLogo.style.display = "block";
          compLogo.onerror = function () {
            this.style.display = "none";
            if (compTag) compTag.textContent = "UCL";
          };
        }
        compTag.textContent = "";
      } else if (window.gameData.isFACupMatch) {
        let faLogo = "assets/cup_logos/fa_cup.png";
        if (typeof LeagueManager !== "undefined" && window.CUP_CONFIGS && window.CUP_CONFIGS.faCups) {
          const lid = LeagueManager.getLeagueIdByTeam(homeKey);
          if (window.CUP_CONFIGS.faCups[lid] && window.CUP_CONFIGS.faCups[lid].logo) {
            faLogo = window.CUP_CONFIGS.faCups[lid].logo;
          }
        }
        if (compLogo) {
          compLogo.src = faLogo;
          compLogo.style.display = "block";
          compLogo.onerror = function () {
            this.style.display = "none";
            if (compTag) compTag.textContent = "FA CUP";
          };
        }
        compTag.textContent = "";
      } else if (typeof LeagueManager !== "undefined" && typeof LEAGUES_CONFIG !== "undefined") {
        const lid = LeagueManager.getLeagueIdByTeam(homeKey);
        const cfg = LEAGUES_CONFIG[lid];
        if (cfg && cfg.logo && compLogo) {
          compLogo.src = cfg.logo;
          compLogo.style.display = "block";
          compLogo.onerror = function () { this.style.display = "none"; };
          compTag.textContent = "";
        } else {
          compTag.textContent = "LEAGUE";
        }
      }
    }

    const getTeamInfo = (key) => {
      if (key && key.startsWith("Legend_")) {
        const code = (window.LegendLeagueManager && window.LegendLeagueManager.legendLogoCodes && window.LegendLeagueManager.legendLogoCodes[key])
          || (window.LegendLeagueManager && window.LegendLeagueManager.legendTeams && window.LegendLeagueManager.legendTeams[key]?.logoCode)
          || "DFT";
        return { isLegend: true, logoCode: code };
      }
      return teams ? teams[key] : null;
    };

    const homeInfo = getTeamInfo(homeKey);
    const awayInfo = getTeamInfo(awayKey);
    if (!homeInfo || !awayInfo) return;

    const getLogoPath = (info) => {
      if (info.isLegend) return `assets/logo/legend/${info.logoCode}.webp`;
      if (info.teamid) return `assets/team_logos/L${info.teamid}.png`;
      return `assets/logo/${info.league || 1}/${info.logoCode || "DFT"}.webp`;
    };

    const homeLogo = document.getElementById("sb-home-logo");
    const awayLogo = document.getElementById("sb-away-logo");
    if (homeLogo) {
      homeLogo.src = getLogoPath(homeInfo);
      homeLogo.alt = homeKey;
      homeLogo.style.display = "";
      homeLogo.onerror = function () { this.style.display = "none"; };
    }
    if (awayLogo) {
      awayLogo.src = getLogoPath(awayInfo);
      awayLogo.alt = awayKey;
      awayLogo.style.display = "";
      awayLogo.onerror = function () { this.style.display = "none"; };
    }

    lastLogoHomeKey = homeKey;
    lastLogoAwayKey = awayKey;
  }

  function showBroadcastDrawer(mode, tagText, renderBodyFn, durationMs = 4400) {
    const drawer = document.getElementById("sb-broadcast-drawer");
    const tagEl = document.getElementById("sb-drawer-tag");
    const bodyEl = document.getElementById("sb-drawer-body");
    if (!drawer || !tagEl || !bodyEl) return;

    drawer.className = `open ${mode || ""}`.trim();
    tagEl.textContent = tagText;
    bodyEl.replaceChildren();
    renderBodyFn(bodyEl);

    if (drawerHideTimeout) clearTimeout(drawerHideTimeout);
    drawerHideTimeout = setTimeout(() => {
      drawer.classList.remove("open");
    }, durationMs);
  }

  function updateBroadcastDrawerCycle() {
    const md = window.currentMatchData;
    if (!md || !md.liveStats) return;
    const ls = md.liveStats;

    // 1. 득점 발생 시 즉시 골 배너 최우선 노출
    if (ls.lastGoalBanner && ls.lastGoalBanner.timestamp !== lastShownGoalTimestamp) {
      lastShownGoalTimestamp = ls.lastGoalBanner.timestamp;
      const g = ls.lastGoalBanner;
      showBroadcastDrawer("mode-goal", `⚽ GOAL · ${g.minute}'`, (body) => {
        const span = document.createElement("span");
        span.textContent = g.assister ? `${g.scorer} (도움: ${g.assister})` : `${g.scorer} 득점!`;
        body.appendChild(span);
      }, 5200);
      return;
    }

    // 2. 경기 진행 중 주기적 중계 팝업 (점유율 / 파울·태클 / 슈팅 / 주목할 선수)
    const min = md.minute || 0;
    if (min === lastDrawerMinute || min <= 0) return;

    // 2분(주목할 선수), 이후 7분 주기로 중계 그래픽 팝업
    if (min === 2 || min % 7 === 0) {
      lastDrawerMinute = min;
      const cycleIdx = (min === 2) ? 0 : (Math.floor(min / 7) % 4);

      if (cycleIdx === 0 && ls.currentSpotlight) {
        // 주목할 만한 선수 / 실시간 키플레이어
        showBroadcastDrawer("mode-watch", ls.currentSpotlight.tag || "PLAYER TO WATCH", (body) => {
          const span = document.createElement("span");
          span.textContent = ls.currentSpotlight.name;
          body.appendChild(span);
        }, 4800);
      } else if (cycleIdx === 1) {
        // 실시간 볼 점유율
        showBroadcastDrawer("mode-stat", "BALL POSSESSION", (body) => {
          const wrap = document.createElement("div");
          wrap.className = "sb-drawer-poss-wrap";

          const hTxt = document.createElement("span");
          hTxt.textContent = `${ls.possessionPct.home}%`;

          const track = document.createElement("div");
          track.className = "sb-drawer-poss-track";
          const fill = document.createElement("div");
          fill.className = "sb-drawer-poss-fill";
          fill.style.width = `${ls.possessionPct.home}%`;
          track.appendChild(fill);

          const aTxt = document.createElement("span");
          aTxt.textContent = `${ls.possessionPct.away}%`;

          wrap.append(hTxt, track, aTxt);
          body.appendChild(wrap);
        }, 4600);
      } else if (cycleIdx === 2) {
        // 총 파울 & 태클 성공
        showBroadcastDrawer("mode-stat", "FOULS & TACKLES", (body) => {
          const span = document.createElement("span");
          span.textContent = `총 파울 ${ls.fouls.home} : ${ls.fouls.away}   ·   태클 ${ls.tackles.home} : ${ls.tackles.away}`;
          body.appendChild(span);
        }, 4600);
      } else {
        // 슈팅 & 패스 통계
        showBroadcastDrawer("mode-stat", "ATTACK STATS", (body) => {
          const span = document.createElement("span");
          span.textContent = `슈팅(유효) ${ls.shots.home}(${ls.shotsOnTarget.home}) : ${ls.shots.away}(${ls.shotsOnTarget.away})  ·  패스 ${ls.passes.home} : ${ls.passes.away}`;
          body.appendChild(span);
        }, 4600);
      }
    }
  }

  function syncData() {
    const homeTeamEl = document.getElementById("homeTeam");
    const awayTeamEl = document.getElementById("awayTeam");
    const sbHomeName = document.getElementById("sb-home-name");
    const sbAwayName = document.getElementById("sb-away-name");
    if (homeTeamEl && sbHomeName) sbHomeName.textContent = homeTeamEl.textContent.trim() || "홈팀";
    if (awayTeamEl && sbAwayName) sbAwayName.textContent = awayTeamEl.textContent.trim() || "어웨이팀";

    applyTeamLogos();

    const scoreEl = document.getElementById("scoreDisplay");
    if (scoreEl) {
      const parts = scoreEl.textContent.split(/[-–]/);
      const h = parseInt(parts[0]) || 0;
      const a = parseInt(parts[1]) || 0;

      const sbScoreHome = document.getElementById("sb-score-home");
      const sbScoreAway = document.getElementById("sb-score-away");
      const sbRoot = document.getElementById("ingame-scoreboard");

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

    updateBroadcastDrawerCycle();
  }

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

  function flashScore(el, root) {
    el.classList.remove("scored");
    root.classList.remove("goal-flash");
    void el.offsetWidth;
    el.classList.add("scored");
    root.classList.add("goal-flash");

    setTimeout(() => {
      el.classList.remove("scored");
      root.classList.remove("goal-flash");
    }, 1600);
  }

  function insertScoreboard() {
    const container = document.getElementById("matchVisualizerContainer");
    if (!container) return false;

    prevHomeScore = -1;
    prevAwayScore = -1;
    lastDrawerMinute = -1;

    if (document.getElementById("ingame-scoreboard")) return true;

    if (getComputedStyle(container).position === "static")
      container.style.position = "relative";

    const sb = buildScoreboard();
    container.appendChild(sb);
    applyTeamColors();
    syncData();
    startInternalTimer();

    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncData, 100);
    return true;
  }

  function watchForContainer() {
    if (insertScoreboard()) return;
    const obs = new MutationObserver(() => {
      if (insertScoreboard()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  new MutationObserver(() => applyTeamColors())
    .observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });

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
