// leagueManager.js - 실제 축구 9개국 1부 리그 관리 시스템

const LEAGUES_CONFIG = {
    premier_league: { id: "premier_league", name: "잉글랜드 프리미어리그", country: "잉글랜드", flag: "🇬🇧", rounds: 38, leagueId: 13, tier: 1, childLeague: "efl_championship", logo: "assets/league_logos/premier_league.png" },
    efl_championship: { id: "efl_championship", name: "잉글랜드 EFL 챔피언십", country: "잉글랜드", flag: "🇬🇧", rounds: 46, leagueId: 14, tier: 2, parentLeague: "premier_league", logo: "assets/league_logos/efl_championship.png" },
    laliga: { id: "laliga", name: "스페인 라리가", country: "스페인", flag: "🇪🇸", rounds: 38, leagueId: 53, logo: "assets/league_logos/laliga.png" },
    bundesliga: { id: "bundesliga", name: "독일 분데스리가", country: "독일", flag: "🇩🇪", rounds: 34, leagueId: 19, logo: "assets/league_logos/bundesliga.png" },
    serie_a: { id: "serie_a", name: "이탈리아 세리에 A", country: "이탈리아", flag: "🇮🇹", rounds: 38, leagueId: 31, logo: "assets/league_logos/serie_a.png" },
    ligue_1: { id: "ligue_1", name: "프랑스 리그 1", country: "프랑스", flag: "🇫🇷", rounds: 34, leagueId: 16, logo: "assets/league_logos/ligue_1.png" },
    eredivisie: { id: "eredivisie", name: "네덜란드 에레디비시", country: "네덜란드", flag: "🇳🇱", rounds: 34, leagueId: 10, logo: "assets/league_logos/eredivisie.png" },
    liga_portugal: { id: "liga_portugal", name: "포르투갈 프리메이라리가", country: "포르투갈", flag: "🇵🇹", rounds: 34, leagueId: 308, logo: "assets/league_logos/liga_portugal.png" },
    super_lig: { id: "super_lig", name: "튀르키예 쉬페르리그", country: "튀르키예", flag: "🇹🇷", rounds: 34, leagueId: 68, logo: "assets/league_logos/super_lig.png" },
    kleague_1: { id: "kleague_1", name: "대한민국 K리그 1", country: "대한민국", flag: "🇰🇷", rounds: 33, leagueId: 83, logo: "assets/league_logos/kleague_1.png" }
};

// 리그 로고 HTML 생성 헬퍼 함수
function getLeagueLogoHTML(leagueId, size = 24) {
    const cfg = LEAGUES_CONFIG[leagueId];
    if (!cfg || !cfg.logo) return '';
    return `<img src="${cfg.logo}" class="league-logo" alt="${cfg.name}" style="width:${size}px; height:${size}px; object-fit:contain; vertical-align:middle; display:inline-block;" onerror="this.style.display='none'">`;
}

// 리그 로고 DOM 엘리먼트 생성 헬퍼 함수
function createLeagueLogoElement(leagueId, size = 24) {
    const cfg = LEAGUES_CONFIG[leagueId];
    if (!cfg || !cfg.logo) return document.createDocumentFragment();
    const img = document.createElement('img');
    img.src = cfg.logo;
    img.className = 'league-logo';
    img.alt = cfg.name;
    img.style.cssText = `width:${size}px; height:${size}px; object-fit:contain; vertical-align:middle; display:inline-block;`;
    img.onerror = function() { this.style.display = 'none'; };
    return img;
}

const LeagueManager = {
    activeViewLeague: null,

    // 팀이 속한 리그 식별자 반환
    getLeagueIdByTeam(teamKey) {
        if (!teamKey || !allTeams[teamKey]) return "premier_league";
        return allTeams[teamKey].leagueId || "premier_league";
    },

    // 특정 리그에 속한 팀 목록 반환
    getTeamsInLeague(leagueId) {
        return Object.keys(allTeams).filter(k => allTeams[k] && allTeams[k].leagueId === leagueId);
    },

    // 더블 라운드 로빈 스케줄 생성
    generateLeagueSchedule(leagueTeams, roundsTarget = null) {
        const schedule = [];
        const numberOfTeams = leagueTeams.length;
        if (numberOfTeams % 2 !== 0) return [];

        const rounds = numberOfTeams - 1;
        const halfSize = numberOfTeams / 2;
        const teamsCopy = [...leagueTeams];

        for (let round = 0; round < rounds; round++) {
            const roundMatches = [];
            for (let i = 0; i < halfSize; i++) {
                const home = teamsCopy[i];
                const away = teamsCopy[numberOfTeams - 1 - i];
                if (round % 2 === 0) {
                    roundMatches.push({ home: home, away: away });
                } else {
                    roundMatches.push({ home: away, away: home });
                }
            }
            schedule.push(roundMatches);

            const first = teamsCopy[0];
            const rest = teamsCopy.slice(1);
            const last = rest.pop();
            rest.unshift(last);
            teamsCopy.splice(0, teamsCopy.length, first, ...rest);
        }

        const secondHalf = schedule.map(round =>
            round.map(match => ({ home: match.away, away: match.home }))
        );

        let fullSchedule = [...schedule, ...secondHalf];

        // K리그 1 같은 33라운드 리그 처리
        if (roundsTarget && roundsTarget > fullSchedule.length) {
            const extraCount = roundsTarget - fullSchedule.length;
            const extraRounds = schedule.slice(0, extraCount);
            fullSchedule = [...fullSchedule, ...extraRounds];
        }

        return fullSchedule;
    },

    // 모든 9개 리그 스케줄 일괄 생성
    generateAllLeagueSchedules() {
        if (!gameData.schedule) gameData.schedule = {};

        const userTeam = gameData.selectedTeam;
        const userLeagueId = this.getLeagueIdByTeam(userTeam);

        Object.keys(LEAGUES_CONFIG).forEach(leagueId => {
            const config = LEAGUES_CONFIG[leagueId];
            const leagueTeams = this.getTeamsInLeague(leagueId);
            // 랜덤 셔플
            leagueTeams.sort(() => Math.random() - 0.5);
            const leagueSched = this.generateLeagueSchedule(leagueTeams, config.rounds);
            gameData.schedule[leagueId] = leagueSched;
        });

        // 기존 호환성: division1, division2, division3
        gameData.schedule.division1 = gameData.schedule[userLeagueId] || gameData.schedule["premier_league"];
        gameData.schedule.division2 = gameData.schedule["laliga"];
        gameData.schedule.division3 = gameData.schedule["bundesliga"];

        console.log("[LeagueManager] 9개국 1부 리그 전체 스케줄 생성 완료.");
    },

    // 모든 9개 리그 순위표 데이터 초기화
    initializeAllLeagueData() {
        if (!gameData.leagueData) gameData.leagueData = {};

        const userTeam = gameData.selectedTeam;
        const userLeagueId = this.getLeagueIdByTeam(userTeam);

        Object.keys(LEAGUES_CONFIG).forEach(leagueId => {
            gameData.leagueData[leagueId] = {};
            const teamsInLeague = this.getTeamsInLeague(leagueId);
            teamsInLeague.forEach(tKey => {
                gameData.leagueData[leagueId][tKey] = {
                    matches: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    points: 0,
                    goalsFor: 0,
                    goalsAgainst: 0
                };
            });
        });

        // 기존 호환 매핑: division1, division2, division3
        gameData.leagueData.division1 = gameData.leagueData[userLeagueId] || gameData.leagueData["premier_league"];
        gameData.leagueData.division2 = gameData.leagueData["laliga"];
        gameData.leagueData.division3 = gameData.leagueData["bundesliga"];

        window.league1Table = gameData.leagueData.division1;
        window.league2Table = gameData.leagueData.division2;
        window.league3Table = gameData.leagueData.division3;

        console.log("[LeagueManager] 9개국 1부 리그 순위표 완전 초기화 완료.");
    },

    // 특정 라운드의 모든 리그 AI 경기 일괄 시뮬레이션
    simulateAllLeaguesRound(round, onlyLeagueId = null) {
        if (!gameData.schedule) return;

        const leagueIds = onlyLeagueId ? [onlyLeagueId] : Object.keys(LEAGUES_CONFIG);
        const userLeagueId = (typeof gameData !== 'undefined' && gameData.selectedTeam)
            ? this.getLeagueIdByTeam(gameData.selectedTeam)
            : null;
        leagueIds.forEach(leagueId => {
            const sched = gameData.schedule[leagueId];
            if (!sched || round > sched.length || round <= 0) return;

            const roundMatches = sched[round - 1];
            if (!roundMatches || !Array.isArray(roundMatches)) return;

            const leagueTable = gameData.leagueData[leagueId];
            if (!leagueTable) return;

            roundMatches.forEach(match => {
                // 유저 경기는 이미 경기 엔진에서 처리되었으므로 스킵
                if (match.home === gameData.selectedTeam || match.away === gameData.selectedTeam) return;

                let score1 = 0;
                let score2 = 0;

                if (window.recordsSystem && typeof window.recordsSystem.simulateSingleAIMatch === 'function') {
                    // simulateSingleAIMatch 내부에서 이미 순위표(leagueTable)에 결과를 1회 반영함
                    const res = window.recordsSystem.simulateSingleAIMatch(match.home, match.away);
                    score1 = res.score1;
                    score2 = res.score2;
                    window.recordsSystem.matchRecords.push(res);
                    if (leagueId === userLeagueId && typeof window.recordsSystem.maybePostAIMatchToSNS === 'function') {
                        window.recordsSystem.maybePostAIMatchToSNS(res);
                    }
                } else {
                    // 기본 시뮬레이션 (recordsSystem이 없을 때만 여기서 순위표에 직접 반영하여 중복 2판 방지)
                    score1 = Math.floor(Math.random() * 3);
                    score2 = Math.floor(Math.random() * 3);
                    this.applyMatchResult(leagueTable, match.home, match.away, score1, score2);
                }
                match.homeScore = score1;
                match.awayScore = score2;
                match.played = true;
            });
        });

        console.log(`[LeagueManager] ${round}라운드 9개국 전체 리그 경기 시뮬레이션 완료.`);
    },

    // 경기 결과를 순위표에 반영
    applyMatchResult(table, home, away, s1, s2) {
        if (typeof table === 'string') {
            if (!gameData.leagueData) gameData.leagueData = {};
            if (!gameData.leagueData[table]) gameData.leagueData[table] = {};
            table = gameData.leagueData[table];
        }
        if (!table[home]) table[home] = { matches: 0, wins: 0, draws: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0 };
        if (!table[away]) table[away] = { matches: 0, wins: 0, draws: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0 };

        table[home].matches++;
        table[away].matches++;
        table[home].goalsFor += s1;
        table[home].goalsAgainst += s2;
        table[away].goalsFor += s2;
        table[away].goalsAgainst += s1;

        if (s1 > s2) {
            table[home].wins++;
            table[home].points += 3;
            table[away].losses++;
        } else if (s1 === s2) {
            table[home].draws++;
            table[home].points += 1;
            table[away].draws++;
            table[away].points += 1;
        } else {
            table[away].wins++;
            table[away].points += 3;
            table[home].losses++;
        }
    },

    // 리그 순위표 & 경기 일정 & 토너먼트 대진표 UI 렌더링
    renderLeagueStandingsUI() {
        const container = document.getElementById('leagueTable');
        if (!container) return;

        container.replaceChildren();

        const userLeagueId = this.getLeagueIdByTeam(gameData.selectedTeam);
        if (!this.activeViewLeague) {
            this.activeViewLeague = userLeagueId;
        }
        if (!this.activeSubView) {
            this.activeSubView = 'standings'; // 'standings' | 'schedule' | 'fa' | 'ucl'
        }

        // 0. 최상단 뷰 전환 탭 (리그 순위표 | 경기 일정표 | FA컵 토너먼트 | UCL 토너먼트)
        const modeBar = document.createElement('div');
        modeBar.className = 'league-mode-switcher';
        modeBar.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);';

        const activeCfg = LEAGUES_CONFIG[this.activeViewLeague] || { rounds: 38 };
        const modes = [
            { id: 'standings', label: '📊 리그 순위표', color: '#FBBF24' },
            { id: 'schedule', label: `📅 경기 일정표 (1~${activeCfg.rounds || 38}R)`, color: '#10B981' },
            { id: 'fa', label: '🏆 FA컵 토너먼트 대진표', color: '#F59E0B' },
            { id: 'ucl', label: '⭐ UCL 토너먼트 대진표', color: '#38BDF8' }
        ];

        modes.forEach(m => {
            const mBtn = document.createElement('button');
            const isAct = (this.activeSubView === m.id);
            mBtn.type = 'button';
            mBtn.className = `btn btn-sm ${isAct ? 'primary' : ''}`;
            mBtn.style.cssText = `padding: 9px 16px; font-size: 0.88rem; font-weight: 800; border-radius: 10px; cursor: pointer; transition: all 0.2s; ${isAct ? `background: ${m.color}; color: #090D16; border: 1px solid ${m.color}; box-shadow: 0 4px 14px rgba(0,0,0,0.3);` : 'background: rgba(30,41,59,0.75); color: #CBD5E1; border: 1px solid rgba(255,255,255,0.1);'}`;
            mBtn.textContent = m.label;
            mBtn.onclick = () => {
                this.activeSubView = m.id;
                if (typeof cupCompetitionManager !== 'undefined' && m.id === 'schedule') {
                    cupCompetitionManager.activeSeasonSchedLeague = this.activeViewLeague;
                }
                this.renderLeagueStandingsUI();
            };
            modeBar.appendChild(mBtn);
        });
        container.appendChild(modeBar);

        // 컵 토너먼트 / 경기 일정 뷰 분기
        if (this.activeSubView !== 'standings' && typeof cupCompetitionManager !== 'undefined') {
            const subWrap = document.createElement('div');
            subWrap.className = 'league-subview-content';
            const rerenderSub = () => {
                if (this.activeSubView === 'schedule') {
                    subWrap.innerHTML = cupCompetitionManager.buildSeasonScheduleHTML();
                } else if (this.activeSubView === 'fa') {
                    subWrap.innerHTML = cupCompetitionManager.buildFAContentHTML();
                } else if (this.activeSubView === 'ucl') {
                    subWrap.innerHTML = cupCompetitionManager.buildUCLContentHTML();
                }
                cupCompetitionManager.bindInteractiveControls(subWrap, rerenderSub);
            };
            rerenderSub();
            container.appendChild(subWrap);
            return;
        }

        // 1. 상단 9개 리그 선택 버튼 바
        const tabNav = document.createElement('div');
        tabNav.className = 'league-nav-tabs';
        tabNav.style.cssText = 'display: flex; gap: 6px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 14px;';

        Object.keys(LEAGUES_CONFIG).forEach(lId => {
            const cfg = LEAGUES_CONFIG[lId];
            const btn = document.createElement('button');
            const isActive = (this.activeViewLeague === lId);
            btn.className = `btn btn-sm ${isActive ? 'primary' : ''}`;
            btn.style.cssText = `white-space: nowrap; font-size: 0.85rem; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; ${isActive ? 'background: #ffd700; color: #000; font-weight: bold;' : 'background: rgba(255,255,255,0.08); color: #ccc;'}`;

            if (cfg.logo) {
                const logoImg = document.createElement('img');
                logoImg.src = cfg.logo;
                logoImg.alt = cfg.name;
                logoImg.style.cssText = 'width: 18px; height: 18px; object-fit: contain;';
                logoImg.onerror = function() { this.style.display = 'none'; };
                btn.appendChild(logoImg);
            }

            const labelSpan = document.createElement('span');
            labelSpan.textContent = cfg.name.split(' ')[1] || cfg.name;
            btn.appendChild(labelSpan);

            btn.onclick = () => {
                this.activeViewLeague = lId;
                this.renderLeagueStandingsUI();
            };
            tabNav.appendChild(btn);
        });
        container.appendChild(tabNav);

        // 2. 현재 선택된 리그 순위표 테이블
        const curLeagueId = this.activeViewLeague;
        if (!gameData.leagueData) gameData.leagueData = {};
        if (!gameData.leagueData[curLeagueId]) {
            const fallbackTeams = this.getTeamsInLeague(curLeagueId);
            if (fallbackTeams.length > 0) {
                gameData.leagueData[curLeagueId] = {};
                fallbackTeams.forEach(tKey => {
                    gameData.leagueData[curLeagueId][tKey] = {
                        matches: 0, wins: 0, draws: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0
                    };
                });
            }
        }
        const curTable = gameData.leagueData[curLeagueId] || null;

        if (!curTable) {
            const p = document.createElement('p');
            p.textContent = '순위표 데이터를 불러올 수 없습니다.';
            container.appendChild(p);
            return;
        }

        const standings = Object.keys(curTable).map(tKey => ({
            team: tKey,
            ...curTable[tKey],
            goalDiff: (curTable[tKey].goalsFor || 0) - (curTable[tKey].goalsAgainst || 0)
        })).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            return b.goalsFor - a.goalsFor;
        });

        const tableEl = document.createElement('table');
        tableEl.className = 'league-table';

        const thead = document.createElement('thead');
        const hRow = document.createElement('tr');
        ['순위', '구단', '경기', '승', '무', '패', '득점', '실점', '득실', '승점'].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            hRow.appendChild(th);
        });
        thead.appendChild(hRow);
        tableEl.appendChild(thead);

        const tbody = document.createElement('tbody');
        standings.forEach((entry, idx) => {
            const rank = idx + 1;
            const tr = document.createElement('tr');
            if (entry.team === gameData.selectedTeam) {
                tr.className = 'user-team';
            }

            // 승강제 및 플레이오프 구역 강조
            let zoneStyle = '';
            let zoneBadge = '';
            if (curLeagueId === 'premier_league') {
                if (rank <= 4) { zoneStyle = 'border-left: 3px solid #38BDF8;'; }
                else if (rank >= 18) { zoneStyle = 'border-left: 3px solid #EF4444; background: rgba(239,68,68,0.06);'; zoneBadge = '🔻'; }
            } else if (curLeagueId === 'efl_championship') {
                if (rank <= 2) { zoneStyle = 'border-left: 3px solid #10B981; background: rgba(16,185,129,0.08);'; zoneBadge = '🔺'; }
                else if (rank >= 3 && rank <= 6) { zoneStyle = 'border-left: 3px solid #F59E0B; background: rgba(245,158,11,0.07);'; zoneBadge = 'PO'; }
            }
            if (zoneStyle && entry.team !== gameData.selectedTeam) {
                tr.style.cssText += zoneStyle;
            }

            const tdRank = document.createElement('td');
            tdRank.textContent = zoneBadge ? `${rank} ${zoneBadge}` : `${rank}`;
            if (zoneBadge === '🔺') tdRank.style.color = '#34D399';
            else if (zoneBadge === 'PO') tdRank.style.color = '#FBBF24';
            else if (zoneBadge === '🔻') tdRank.style.color = '#F87171';

            const tdTeam = document.createElement('td');
            tdTeam.style.cssText = 'text-align: left; display: flex; align-items: center; gap: 8px;';
            if (typeof createTeamLogoElement === 'function') {
                tdTeam.appendChild(createTeamLogoElement(entry.team));
            }
            const nameSpan = document.createElement('span');
            nameSpan.textContent = (typeof teamNames !== 'undefined' && teamNames[entry.team]) ? teamNames[entry.team] : entry.team;
            tdTeam.appendChild(nameSpan);

            const tdMat = document.createElement('td'); tdMat.textContent = entry.matches;
            const tdW = document.createElement('td'); tdW.textContent = entry.wins;
            const tdD = document.createElement('td'); tdD.textContent = entry.draws;
            const tdL = document.createElement('td'); tdL.textContent = entry.losses;
            const tdGf = document.createElement('td'); tdGf.textContent = entry.goalsFor;
            const tdGa = document.createElement('td'); tdGa.textContent = entry.goalsAgainst;
            const tdGd = document.createElement('td'); tdGd.textContent = (entry.goalDiff > 0 ? '+' : '') + entry.goalDiff;
            const tdPts = document.createElement('td');
            tdPts.style.fontWeight = 'bold';
            tdPts.style.color = '#ffd700';
            tdPts.textContent = entry.points;

            tr.append(tdRank, tdTeam, tdMat, tdW, tdD, tdL, tdGf, tdGa, tdGd, tdPts);
            tbody.appendChild(tr);
        });
        tableEl.appendChild(tbody);
        container.appendChild(tableEl);

        // 승강제 / 플레이오프 범례 및 EFL 챔피언십 플레이오프 대진표 표시
        if (curLeagueId === 'premier_league' || curLeagueId === 'efl_championship') {
            const legend = document.createElement('div');
            legend.style.cssText = 'margin-top: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(15,23,42,0.75); border: 1px solid rgba(255,255,255,0.08); font-size: 0.82rem; color: #CBD5E1; display: flex; flex-wrap: wrap; gap: 14px; align-items: center;';
            if (curLeagueId === 'premier_league') {
                legend.innerHTML = '<span><strong style="color:#38BDF8;">1~4위</strong>: UCL 본선</span><span><strong style="color:#F87171;">18~20위 🔻</strong>: EFL 챔피언십 강등</span>';
            } else {
                legend.innerHTML = '<span><strong style="color:#34D399;">1~2위 🔺</strong>: 프리미어리그 자동 승격</span><span><strong style="color:#FBBF24;">3~6위 PO</strong>: 승격 플레이오프 (3vs6, 4vs5 홈&어웨이 준결승 → 웸블리 결승)</span>';
            }
            container.appendChild(legend);
        }

        if (curLeagueId === 'efl_championship' && typeof renderEFLPlayoffBracketCard === 'function') {
            const bracketCard = renderEFLPlayoffBracketCard(standings);
            if (bracketCard) container.appendChild(bracketCard);
        }
    }
};

window.LeagueManager = LeagueManager;
window.LEAGUES_CONFIG = LEAGUES_CONFIG;

