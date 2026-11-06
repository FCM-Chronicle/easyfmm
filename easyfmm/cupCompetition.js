// cupCompetition.js - 국가별 FA컵 & UEFA 챔피언스리그(리그페이즈 포맷) 통합 관리 시스템

const CUP_CONFIGS = {
    // 1. 국가별 FA컵 설정
    faCups: {
        premier_league: {
            id: 'fa_england',
            leagueId: 'premier_league',
            name: '에미레이츠 FA컵',
            fullName: 'The Emirates FA Cup',
            country: '잉글랜드',
            flag: '🇬🇧',
            logo: 'assets/cup_logos/fa_cup.png',
            fallbackEmoji: '🏆'
        },
        laliga: {
            id: 'fa_spain',
            leagueId: 'laliga',
            name: '코파 델 레이',
            fullName: 'Copa del Rey',
            country: '스페인',
            flag: '🇪🇸',
            logo: 'assets/cup_logos/copa_del_rey.png',
            fallbackEmoji: '🏆'
        },
        bundesliga: {
            id: 'fa_germany',
            leagueId: 'bundesliga',
            name: 'DFB-포칼',
            fullName: 'DFB-Pokal',
            country: '독일',
            flag: '🇩🇪',
            logo: 'assets/cup_logos/dfb_pokal.png',
            fallbackEmoji: '🏆'
        },
        serie_a: {
            id: 'fa_italy',
            leagueId: 'serie_a',
            name: '코파 이탈리아',
            fullName: 'Coppa Italia Frecciarossa',
            country: '이탈리아',
            flag: '🇮🇹',
            logo: 'assets/cup_logos/coppa_italia.png',
            fallbackEmoji: '🏆'
        },
        ligue_1: {
            id: 'fa_france',
            leagueId: 'ligue_1',
            name: '쿠프 드 프랑스',
            fullName: 'Coupe de France',
            country: '프랑스',
            flag: '🇫🇷',
            logo: 'assets/cup_logos/coupe_de_france.png',
            fallbackEmoji: '🏆'
        },
        eredivisie: {
            id: 'fa_netherlands',
            leagueId: 'eredivisie',
            name: 'KNVB 베커',
            fullName: 'KNVB Beker',
            country: '네덜란드',
            flag: '🇳🇱',
            logo: 'assets/cup_logos/knvb_beker.png',
            fallbackEmoji: '🏆'
        },
        liga_portugal: {
            id: 'fa_portugal',
            leagueId: 'liga_portugal',
            name: '타사 드 포르투갈',
            fullName: 'Taça de Portugal',
            country: '포르투갈',
            flag: '🇵🇹',
            logo: 'assets/cup_logos/taca_portugal.png',
            fallbackEmoji: '🏆'
        },
        super_lig: {
            id: 'fa_turkey',
            leagueId: 'super_lig',
            name: '튀르키예 쿠파스',
            fullName: 'Türkiye Kupası',
            country: '튀르키예',
            flag: '🇹🇷',
            logo: 'assets/cup_logos/turkiye_kupasi.png',
            fallbackEmoji: '🏆'
        },
        kleague_1: {
            id: 'fa_korea',
            leagueId: 'kleague_1',
            name: '코리아컵',
            fullName: 'Korea Cup',
            country: '대한민국',
            flag: '🇰🇷',
            logo: 'assets/cup_logos/korea_cup.png',
            fallbackEmoji: '🏆'
        }
    },

    // 2. UEFA 챔피언스리그 설정
    ucl: {
        id: 'ucl',
        name: 'UEFA 챔피언스리그',
        fullName: 'UEFA Champions League',
        logo: 'assets/cup_logos/ucl.png',
        fallbackEmoji: '⭐'
    }
};

// 로고 렌더러 헬퍼
function getCupLogoHTML(logoPath, fallbackEmoji = '🏆', size = 26) {
    if (!logoPath) return `<span style="font-size:${size * 0.8}px; vertical-align:middle;">${fallbackEmoji}</span>`;
    return `
        <span class="cup-logo-box" style="display:inline-flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; vertical-align:middle; flex-shrink:0;">
            <img src="${logoPath}" alt="logo" style="max-width:100%; max-height:100%; object-fit:contain; display:inline-block;" onerror="this.outerHTML='${fallbackEmoji}'">
        </span>
    `;
}

class CupCompetitionManager {
    constructor() {
        this.faStages = ['R1', 'R16', 'QF', 'SF', 'FINAL'];
        this.faStageNames = {
            'R1': '1라운드 (예선전)',
            'R16': '본선 16강전',
            'QF': '8강전 (준준결승)',
            'SF': '4강전 (준결승)',
            'FINAL': '결승전 (The Final)'
        };
        // 리그 라운드 직후 열리는 FA컵 스케줄
        this.faCupSchedule = {
            6: 'R1',
            12: 'R16',
            18: 'QF',
            24: 'SF',
            30: 'FINAL'
        };

        // UCL 리그 페이즈 (8경기) + 플레이오프 + 16강 + 8강 + 4강 + 결승
        this.uclStages = ['LP1', 'LP2', 'LP3', 'LP4', 'LP5', 'LP6', 'LP7', 'LP8', 'PO', 'R16', 'QF', 'SF', 'FINAL'];
        this.uclStageNames = {
            'LP1': '리그 페이즈 1차전',
            'LP2': '리그 페이즈 2차전',
            'LP3': '리그 페이즈 3차전',
            'LP4': '리그 페이즈 4차전',
            'LP5': '리그 페이즈 5차전',
            'LP6': '리그 페이즈 6차전',
            'LP7': '리그 페이즈 7차전',
            'LP8': '리그 페이즈 최종전 (8R)',
            'PO': '16강 플레이오프',
            'R16': '본선 16강전',
            'QF': '8강전 (준준결승)',
            'SF': '4강전 (준결승)',
            'FINAL': '결승전 (The Final)'
        };
        this.uclSchedule = {
            4: 'LP1',
            8: 'LP2',
            11: 'LP3',
            15: 'LP4',
            17: 'LP5',
            21: 'LP6',
            23: 'LP7',
            26: 'LP8',
            28: 'PO',
            31: 'R16',
            33: 'QF',
            35: 'SF',
            37: 'FINAL'
        };

        // 이전 faCupManager 호환용 stageNames
        this.stageNames = this.faStageNames;
    }

    // 유저 팀의 리그에 맞는 FA컵 정보 가져오기
    getUserFACupConfig() {
        const userTeam = (typeof gameData !== 'undefined') ? gameData.selectedTeam : null;
        const leagueId = (typeof LeagueManager !== 'undefined') ? LeagueManager.getLeagueIdByTeam(userTeam) : 'premier_league';
        return CUP_CONFIGS.faCups[leagueId] || CUP_CONFIGS.faCups.premier_league;
    }

    // 팀 평점 계산 헬퍼
    getTeamRating(teamKey) {
        if (!teamKey) return 75;
        if (typeof teams !== 'undefined' && teams[teamKey] && Array.isArray(teams[teamKey])) {
            const players = teams[teamKey];
            if (players.length > 0) {
                const sum = players.reduce((acc, p) => acc + (p.rating || 75), 0);
                return Math.round(sum / players.length);
            }
        }
        if (typeof allTeams !== 'undefined' && allTeams[teamKey]) {
            return allTeams[teamKey].reputation || 78;
        }
        return 75;
    }

    // 셔플 함수
    shuffle(arr) {
        return [...arr].sort(() => Math.random() - 0.5);
    }

    // 단판 경기 시뮬레이션
    simulateMatch(team1, team2) {
        const r1 = this.getTeamRating(team1);
        const r2 = this.getTeamRating(team2);
        const diff = (r1 - r2) / 10;

        let s1 = Math.max(0, Math.floor(Math.random() * 3 + Math.max(0, diff)));
        let s2 = Math.max(0, Math.floor(Math.random() * 3 + Math.max(0, -diff)));

        if (s1 !== s2) {
            return {
                homeScore: s1,
                awayScore: s2,
                winner: s1 > s2 ? team1 : team2,
                score: `${s1} - ${s2}`,
                pk: null
            };
        }

        // 동점 시 승부차기 진행
        let pk1 = 0, pk2 = 0;
        for (let i = 0; i < 5; i++) {
            if (Math.random() < 0.75) pk1++;
            if (Math.random() < 0.75) pk2++;
        }
        while (pk1 === pk2) {
            if (Math.random() < 0.75) pk1++;
            if (Math.random() < 0.75) pk2++;
        }

        return {
            homeScore: s1,
            awayScore: s2,
            winner: pk1 > pk2 ? team1 : team2,
            score: `${s1} - ${s2}`,
            pk: `(PK ${pk1}-${pk2})`
        };
    }

    // 리그 페이즈 전용 경기 시뮬레이션 (무승부 허용)
    simulateLeaguePhaseMatch(team1, team2) {
        const r1 = this.getTeamRating(team1);
        const r2 = this.getTeamRating(team2);
        const diff = (r1 - r2) / 10;

        let s1 = Math.max(0, Math.floor(Math.random() * 3 + Math.max(0, diff)));
        let s2 = Math.max(0, Math.floor(Math.random() * 3 + Math.max(0, -diff)));

        return {
            homeScore: s1,
            awayScore: s2,
            score: `${s1} - ${s2}`
        };
    }

    // ==========================================
    // 1. 시즌 초기화 (FA컵 & UCL 리그페이즈 동시 구축)
    // ==========================================
    initSeason() {
        if (typeof allTeams === 'undefined') return;

        this.initFACup();
        this.initUCL();
        console.log('[CupCompetitionManager] 국가별 FA컵 및 UCL 리그 페이즈 초기화 완료');
    }

    // ------------------------------------------
    // 1-1. 국가별 FA컵 초기화
    // ------------------------------------------
    initFACup() {
        const userTeam = gameData.selectedTeam;
        const faConfig = this.getUserFACupConfig();
        const leagueTeams = (typeof LeagueManager !== 'undefined') ? LeagueManager.getTeamsInLeague(faConfig.leagueId) : [];

        const teamCount = leagueTeams.length;
        let seedTeams = [];
        let r1Matches = [];

        if (teamCount === 20) {
            // 20팀 리그 (EPL, 라리가, 세리에 A)
            // 하위/무작위 8팀 예선 (4경기) -> 승자 4팀 + 시드 12팀 = 16강 본선
            const shuffled = this.shuffle(leagueTeams);
            const r1Pool = shuffled.slice(0, 8);
            seedTeams = shuffled.slice(8);

            for (let i = 0; i < r1Pool.length; i += 2) {
                r1Matches.push({
                    home: r1Pool[i],
                    away: r1Pool[i + 1],
                    winner: null,
                    score: null,
                    pk: null
                });
            }
        } else if (teamCount === 18) {
            // 18팀 리그 (분데스리가, 리그 1, 에레디비시, 포르투갈, 튀르키예)
            // 4팀 예선 (2경기) -> 승자 2팀 + 시드 14팀 = 16강 본선
            const shuffled = this.shuffle(leagueTeams);
            const r1Pool = shuffled.slice(0, 4);
            seedTeams = shuffled.slice(4);

            for (let i = 0; i < r1Pool.length; i += 2) {
                r1Matches.push({
                    home: r1Pool[i],
                    away: r1Pool[i + 1],
                    winner: null,
                    score: null,
                    pk: null
                });
            }
        } else {
            // 12팀 리그 (K리그 1)
            // 8팀 예선 (4경기) -> 승자 4팀 + 시드 4팀 = 8강 본선 (R16 단계 없이 바로 QF 합류 또는 8강 시작)
            const shuffled = this.shuffle(leagueTeams);
            const r1Pool = shuffled.slice(0, 8);
            seedTeams = shuffled.slice(8); // 4팀

            for (let i = 0; i < r1Pool.length; i += 2) {
                r1Matches.push({
                    home: r1Pool[i],
                    away: r1Pool[i + 1],
                    winner: null,
                    score: null,
                    pk: null
                });
            }
        }

        const userInR1 = r1Matches.some(m => m.home === userTeam || m.away === userTeam);

        gameData.faCup = {
            config: faConfig,
            currentStage: 'R1',
            isUserActive: true,
            userEliminatedStage: null,
            champion: null,
            runnerUp: null,
            bracket: {
                'R1': r1Matches,
                'R16': [],
                'QF': [],
                'SF': [],
                'FINAL': []
            },
            seedTeams: seedTeams,
            matchPending: false
        };

        // K리그 12팀의 경우 R1 다음 바로 QF로 이동하도록 stages 조정 플래그
        if (teamCount === 12) {
            gameData.faCup.isShortBracket = true;
        }

        console.log(`[FA Cup] ${faConfig.name} (${faConfig.country}) 대진 생성 완료. 유저 1R 참가여부: ${userInR1}`);
    }

    // ------------------------------------------
    // 1-2. UEFA 챔피언스리그 (36팀 리그 페이즈) 초기화
    // ------------------------------------------
    initUCL() {
        const userTeam = gameData.selectedTeam;
        const allKeys = Object.keys(allTeams || {});

        // 유럽 리그 팀들 선별 (K리그 제외)
        const europeanTeams = allKeys.filter(k => allTeams[k].leagueId !== 'kleague_1');
        
        // 능력치/명성 순으로 정렬하여 상위 36팀 선발
        const sortedEuropean = [...europeanTeams].sort((a, b) => {
            const repA = (allTeams[a].reputation || 70);
            const repB = (allTeams[b].reputation || 70);
            return repB - repA;
        });

        let uclTeams = sortedEuropean.slice(0, 36);

        // 만약 유저 팀이 유럽 팀인데 36위 밖이면 강제로 36위에 유저 팀 포함
        const isUserEuropean = europeanTeams.includes(userTeam);
        if (isUserEuropean && !uclTeams.includes(userTeam)) {
            uclTeams[35] = userTeam;
        }

        // 4개 포트 분류 (각 포트 9팀)
        const pot1 = uclTeams.slice(0, 9);
        const pot2 = uclTeams.slice(9, 18);
        const pot3 = uclTeams.slice(18, 27);
        const pot4 = uclTeams.slice(27, 36);

        // 36개 팀 통합 리그 테이블 초기화
        const table = {};
        uclTeams.forEach(t => {
            table[t] = {
                team: t,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                gf: 0,
                ga: 0,
                gd: 0,
                points: 0
            };
        });

        // 8라운드 대진표 생성 (각 팀마다 8경기: 포트별 2팀씩, 홈 4 / 원정 4)
        const scheduleRounds = {};
        for (let r = 1; r <= 8; r++) {
            scheduleRounds[`LP${r}`] = [];
        }

        // 간단하고 공정한 8R 매칭 생성 (각 라운드당 18경기)
        // 36개 팀을 셔플하여 각 라운드마다 2팀씩 짝지음 (충돌 방지 로직)
        for (let r = 1; r <= 8; r++) {
            const roundKey = `LP${r}`;
            const shuffledRoundTeams = this.shuffle(uclTeams);
            const roundMatches = [];
            for (let i = 0; i < shuffledRoundTeams.length; i += 2) {
                roundMatches.push({
                    home: (r % 2 === 1) ? shuffledRoundTeams[i] : shuffledRoundTeams[i + 1],
                    away: (r % 2 === 1) ? shuffledRoundTeams[i + 1] : shuffledRoundTeams[i],
                    homeScore: null,
                    awayScore: null,
                    played: false
                });
            }
            scheduleRounds[roundKey] = roundMatches;
        }

        gameData.ucl = {
            config: CUP_CONFIGS.ucl,
            currentStage: 'LP1',
            teams: uclTeams,
            pots: { pot1, pot2, pot3, pot4 },
            table: table,
            schedule: scheduleRounds,
            bracket: {
                'PO': [],    // 9위~24위 16강 진출 플레이오프
                'R16': [],   // 16강
                'QF': [],    // 8강
                'SF': [],    // 4강
                'FINAL': []  // 결승
            },
            isUserActive: uclTeams.includes(userTeam),
            userEliminatedStage: uclTeams.includes(userTeam) ? null : '미참가',
            champion: null,
            runnerUp: null,
            matchPending: false
        };

        console.log(`[UCL] 36개 클럽 리그 페이즈 구축 완료. 유저(${userTeam}) 참가여부: ${gameData.ucl.isUserActive}`);
    }

    // ==========================================
    // 2. 컵 경기 일정 체크 및 세팅 (Match Flow 연동)
    // ==========================================
    checkAndSetupCupMatch() {
        if (!gameData || gameData.isWorldCupMode) return false;

        const currentRound = gameData.currentRound || 1;

        // 우선순위 1: UEFA 챔피언스리그 체크
        if (gameData.ucl) {
            const uclStage = this.uclSchedule[currentRound];
            if (uclStage && gameData.ucl.currentStage === uclStage) {
                const isUserUcl = this.checkAndSetupUCLMatch(uclStage);
                if (isUserUcl) return true;
            }
        }

        // 우선순위 2: 국가별 FA컵 체크
        if (gameData.faCup) {
            const faStage = this.faCupSchedule[currentRound];
            if (faStage && gameData.faCup.currentStage === faStage) {
                const isUserFa = this.checkAndSetupFACupMatch(faStage);
                if (isUserFa) return true;
            }
        }

        return false;
    }

    // ------------------------------------------
    // 2-1. FA컵 경기 체크
    // ------------------------------------------
    checkAndSetupFACupMatch(stage) {
        const cup = gameData.faCup;
        this.ensureFABracket(stage);

        const matches = cup.bracket[stage] || [];
        const userMatch = matches.find(m => (m.home === gameData.selectedTeam || m.away === gameData.selectedTeam) && !m.winner);

        if (userMatch && cup.isUserActive) {
            gameData.isFACupMatch = true;
            gameData.isUCLMatch = false;
            gameData.faCupStage = stage;
            gameData.cupType = 'FA';
            gameData.currentOpponent = (userMatch.home === gameData.selectedTeam) ? userMatch.away : userMatch.home;
            gameData.isHomeGame = (userMatch.home === gameData.selectedTeam);
            cup.matchPending = true;
            return true;
        } else {
            // 유저 경기 없음 -> AI 시뮬레이션 후 다음 단계 전진
            this.simulateFAStageAI(stage);
            this.advanceFANextStage();
            return false;
        }
    }

    ensureFABracket(stage) {
        const cup = gameData.faCup;
        if (cup.bracket[stage] && cup.bracket[stage].length > 0) return;

        if (stage === 'R16') {
            const r1Winners = (cup.bracket['R1'] || []).map(m => m.winner || m.home);
            const pool = this.shuffle([...cup.seedTeams, ...r1Winners]);
            const r16Matches = [];
            for (let i = 0; i < pool.length; i += 2) {
                if (pool[i + 1]) {
                    r16Matches.push({
                        home: pool[i],
                        away: pool[i + 1],
                        winner: null,
                        score: null,
                        pk: null
                    });
                }
            }
            cup.bracket['R16'] = r16Matches;
        } else if (stage === 'QF' && cup.isShortBracket && (!cup.bracket['R16'] || cup.bracket['R16'].length === 0)) {
            // K리그 12팀 특례: R1 승자 4팀 + 시드 4팀 = 8강 대진 생성
            const r1Winners = (cup.bracket['R1'] || []).map(m => m.winner || m.home);
            const pool = this.shuffle([...cup.seedTeams, ...r1Winners]);
            const qfMatches = [];
            for (let i = 0; i < pool.length; i += 2) {
                if (pool[i + 1]) {
                    qfMatches.push({
                        home: pool[i],
                        away: pool[i + 1],
                        winner: null,
                        score: null,
                        pk: null
                    });
                }
            }
            cup.bracket['QF'] = qfMatches;
        } else {
            // 이전 라운드 승자들 모음
            const prevStageIdx = this.faStages.indexOf(stage) - 1;
            const prevStage = this.faStages[prevStageIdx];
            const prevMatches = cup.bracket[prevStage] || [];

            prevMatches.forEach(m => {
                if (!m.winner) {
                    const sim = this.simulateMatch(m.home, m.away);
                    m.winner = sim.winner;
                    m.score = sim.score;
                    m.pk = sim.pk;
                }
            });

            const winners = this.shuffle(prevMatches.map(m => m.winner).filter(Boolean));
            const newMatches = [];
            for (let i = 0; i < winners.length; i += 2) {
                if (winners[i + 1]) {
                    newMatches.push({
                        home: winners[i],
                        away: winners[i + 1],
                        winner: null,
                        score: null,
                        pk: null
                    });
                }
            }
            cup.bracket[stage] = newMatches;
        }
    }

    simulateFAStageAI(stage) {
        const cup = gameData.faCup;
        if (!cup || !cup.bracket[stage]) return;

        cup.bracket[stage].forEach(m => {
            if (!m.winner) {
                const sim = this.simulateMatch(m.home, m.away);
                m.winner = sim.winner;
                m.score = sim.score;
                m.pk = sim.pk;
            }
        });
    }

    advanceFANextStage() {
        const cup = gameData.faCup;
        if (!cup) return;

        const curIdx = this.faStages.indexOf(cup.currentStage);
        if (curIdx < this.faStages.length - 1) {
            let nextStage = this.faStages[curIdx + 1];
            // K리그 12팀 단축 브래킷이면 R16 건너뛰고 QF로 점프
            if (cup.isShortBracket && nextStage === 'R16') {
                nextStage = 'QF';
            }
            cup.currentStage = nextStage;
            cup.matchPending = false;
            gameData.isFACupMatch = false;
        } else {
            const finalMatch = (cup.bracket['FINAL'] || [])[0];
            if (finalMatch) {
                cup.champion = finalMatch.winner;
                cup.runnerUp = (finalMatch.winner === finalMatch.home) ? finalMatch.away : finalMatch.home;
            }
        }
    }

    // ------------------------------------------
    // 2-2. UEFA 챔피언스리그 경기 체크
    // ------------------------------------------
    checkAndSetupUCLMatch(stage) {
        const ucl = gameData.ucl;
        const userTeam = gameData.selectedTeam;

        if (stage.startsWith('LP')) {
            // 리그 페이즈 경기
            const matches = ucl.schedule[stage] || [];
            const userMatch = matches.find(m => (m.home === userTeam || m.away === userTeam) && !m.played);

            if (userMatch && ucl.isUserActive) {
                gameData.isUCLMatch = true;
                gameData.isFACupMatch = false;
                gameData.uclStage = stage;
                gameData.cupType = 'UCL';
                gameData.currentOpponent = (userMatch.home === userTeam) ? userMatch.away : userMatch.home;
                gameData.isHomeGame = (userMatch.home === userTeam);
                ucl.matchPending = true;
                return true;
            } else {
                this.simulateUCLStageAI(stage);
                this.advanceUCLNextStage();
                return false;
            }
        } else {
            // 토너먼트 (PO, R16, QF, SF, FINAL)
            this.ensureUCLBracket(stage);
            const matches = ucl.bracket[stage] || [];
            const userMatch = matches.find(m => (m.home === userTeam || m.away === userTeam) && !m.winner);

            if (userMatch && ucl.isUserActive) {
                gameData.isUCLMatch = true;
                gameData.isFACupMatch = false;
                gameData.uclStage = stage;
                gameData.cupType = 'UCL';
                gameData.currentOpponent = (userMatch.home === userTeam) ? userMatch.away : userMatch.home;
                gameData.isHomeGame = (userMatch.home === userTeam);
                ucl.matchPending = true;
                return true;
            } else {
                this.simulateUCLStageAI(stage);
                this.advanceUCLNextStage();
                return false;
            }
        }
    }

    // UCL 순위표 정렬
    getSortedUCLTable() {
        const ucl = gameData.ucl;
        if (!ucl || !ucl.table) return [];
        return Object.values(ucl.table).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.gd !== a.gd) return b.gd - a.gd;
            if (b.gf !== a.gf) return b.gf - a.gf;
            return a.team.localeCompare(b.team);
        });
    }

    ensureUCLBracket(stage) {
        const ucl = gameData.ucl;
        if (ucl.bracket[stage] && ucl.bracket[stage].length > 0) return;

        if (stage === 'PO') {
            // 리그 페이즈 종료 후: 9위 ~ 24위 (총 16팀) 플레이오프 대진
            const sorted = this.getSortedUCLTable();
            const poTeams = sorted.slice(8, 24).map(r => r.team);
            // 9~16위(시드) vs 17~24위(비시드) 맞대결
            const seeds = this.shuffle(poTeams.slice(0, 8));
            const unseeds = this.shuffle(poTeams.slice(8, 16));

            const poMatches = [];
            for (let i = 0; i < 8; i++) {
                poMatches.push({
                    home: unseeds[i],
                    away: seeds[i],
                    winner: null,
                    score: null,
                    pk: null
                });
            }
            ucl.bracket['PO'] = poMatches;

            // 유저 탈락 체크: 만약 유저가 25위 이하면 바로 탈락 처리
            const userTeam = gameData.selectedTeam;
            const userRank = sorted.findIndex(r => r.team === userTeam) + 1;
            if (userRank > 24) {
                ucl.isUserActive = false;
                ucl.userEliminatedStage = `리그 페이즈 ${userRank}위`;
            }
        } else if (stage === 'R16') {
            // 1위 ~ 8위 직행팀 + PO 승자 8팀 = 16팀 맞대결
            const sorted = this.getSortedUCLTable();
            const top8 = this.shuffle(sorted.slice(0, 8).map(r => r.team));
            
            // PO 완료 보장
            (ucl.bracket['PO'] || []).forEach(m => {
                if (!m.winner) {
                    const sim = this.simulateMatch(m.home, m.away);
                    m.winner = sim.winner;
                    m.score = sim.score;
                    m.pk = sim.pk;
                }
            });
            const poWinners = this.shuffle((ucl.bracket['PO'] || []).map(m => m.winner));

            const r16Matches = [];
            for (let i = 0; i < 8; i++) {
                r16Matches.push({
                    home: poWinners[i],
                    away: top8[i],
                    winner: null,
                    score: null,
                    pk: null
                });
            }
            ucl.bracket['R16'] = r16Matches;
        } else {
            // 이전 토너먼트 승자들 대진
            const prevStageIdx = this.uclStages.indexOf(stage) - 1;
            const prevStage = this.uclStages[prevStageIdx];
            const prevMatches = ucl.bracket[prevStage] || [];

            prevMatches.forEach(m => {
                if (!m.winner) {
                    const sim = this.simulateMatch(m.home, m.away);
                    m.winner = sim.winner;
                    m.score = sim.score;
                    m.pk = sim.pk;
                }
            });

            const winners = this.shuffle(prevMatches.map(m => m.winner).filter(Boolean));
            const newMatches = [];
            for (let i = 0; i < winners.length; i += 2) {
                if (winners[i + 1]) {
                    newMatches.push({
                        home: winners[i],
                        away: winners[i + 1],
                        winner: null,
                        score: null,
                        pk: null
                    });
                }
            }
            ucl.bracket[stage] = newMatches;
        }
    }

    simulateUCLStageAI(stage) {
        const ucl = gameData.ucl;
        if (!ucl) return;

        if (stage.startsWith('LP')) {
            const matches = ucl.schedule[stage] || [];
            matches.forEach(m => {
                if (!m.played) {
                    const res = this.simulateLeaguePhaseMatch(m.home, m.away);
                    m.homeScore = res.homeScore;
                    m.awayScore = res.awayScore;
                    m.played = true;

                    // 테이블 갱신
                    this.updateUCLTable(m.home, m.away, res.homeScore, res.awayScore);
                }
            });
        } else {
            const matches = ucl.bracket[stage] || [];
            matches.forEach(m => {
                if (!m.winner) {
                    const sim = this.simulateMatch(m.home, m.away);
                    m.winner = sim.winner;
                    m.score = sim.score;
                    m.pk = sim.pk;
                }
            });
        }
    }

    updateUCLTable(homeTeam, awayTeam, hGoals, aGoals) {
        const ucl = gameData.ucl;
        if (!ucl || !ucl.table) return;

        const h = ucl.table[homeTeam];
        const a = ucl.table[awayTeam];
        if (!h || !a) return;

        h.played++;
        a.played++;
        h.gf += hGoals;
        h.ga += aGoals;
        h.gd = h.gf - h.ga;
        a.gf += aGoals;
        a.ga += hGoals;
        a.gd = a.gf - a.ga;

        if (hGoals > aGoals) {
            h.won++;
            h.points += 3;
            a.lost++;
        } else if (hGoals < aGoals) {
            a.won++;
            a.points += 3;
            h.lost++;
        } else {
            h.drawn++;
            a.drawn++;
            h.points += 1;
            a.points += 1;
        }
    }

    advanceUCLNextStage() {
        const ucl = gameData.ucl;
        if (!ucl) return;

        const curIdx = this.uclStages.indexOf(ucl.currentStage);
        if (curIdx < this.uclStages.length - 1) {
            let nextStage = this.uclStages[curIdx + 1];

            // 만약 유저가 리그 페이즈 1~8위로 16강 직행했다면 PO 단계는 유저 경기 없이 넘어감
            if (nextStage === 'PO' && ucl.isUserActive) {
                const sorted = this.getSortedUCLTable();
                const userRank = sorted.findIndex(r => r.team === gameData.selectedTeam) + 1;
                if (userRank >= 1 && userRank <= 8) {
                    console.log(`[UCL] 유저 팀 ${gameData.selectedTeam}은(는) 리그 ${userRank}위로 16강에 직행했습니다! PO 시드 패스`);
                }
            }

            ucl.currentStage = nextStage;
            ucl.matchPending = false;
            gameData.isUCLMatch = false;
        } else {
            const finalMatch = (ucl.bracket['FINAL'] || [])[0];
            if (finalMatch) {
                ucl.champion = finalMatch.winner;
                ucl.runnerUp = (finalMatch.winner === finalMatch.home) ? finalMatch.away : finalMatch.home;
            }
        }
    }

    // ==========================================
    // 3. 유저 경기 종료 후 처리
    // ==========================================
    handleUserMatchEnd(matchData) {
        if (gameData.isUCLMatch) {
            this.handleUserUCLMatchEnd(matchData);
        } else if (gameData.isFACupMatch) {
            this.handleUserFACupMatchEnd(matchData);
        }
    }

    handleUserFACupMatchEnd(matchData) {
        const cup = gameData.faCup;
        if (!cup) return;

        const stage = cup.currentStage;
        const userTeam = gameData.selectedTeam;
        const isUserHome = matchData.homeTeam === userTeam;
        const userScore = isUserHome ? matchData.homeScore : matchData.awayScore;
        const oppScore = isUserHome ? matchData.awayScore : matchData.homeScore;
        const oppTeam = isUserHome ? matchData.awayTeam : matchData.homeTeam;

        const matchRecord = (cup.bracket[stage] || []).find(m => m.home === userTeam || m.away === userTeam);

        if (userScore > oppScore) {
            this.processFAWin(matchRecord, userTeam, `${matchData.homeScore} - ${matchData.awayScore}`, null, stage);
        } else if (userScore < oppScore) {
            this.processFALoss(matchRecord, oppTeam, `${matchData.homeScore} - ${matchData.awayScore}`, null, stage);
        } else {
            this.runPenaltyShootout(matchData, matchRecord, userTeam, oppTeam, stage, 'FA');
        }

        this.simulateFAStageAI(stage);
        this.advanceFANextStage();
    }

    processFAWin(matchRecord, userTeam, scoreStr, pkStr, stage) {
        const cup = gameData.faCup;
        if (matchRecord) {
            matchRecord.winner = userTeam;
            matchRecord.score = scoreStr;
            matchRecord.pk = pkStr;
        }

        const prizeTable = { 'R1': 10, 'R16': 30, 'QF': 60, 'SF': 120, 'FINAL': 400 };
        const prize = prizeTable[stage] || 30;
        gameData.teamMoney = (gameData.teamMoney || 0) + prize;

        if (stage === 'FINAL') {
            cup.champion = userTeam;
            if (typeof managerSystem !== 'undefined' && gameData.managerId) {
                managerSystem.updateManagerStats(gameData.managerId, { trophy: true });
            }
            const msg = `🏆 축하합니다! ${cup.config.name} 결승에서 승리하여 컵 대회 우승 트로피를 차지했습니다!\n상금 +${prize}억원이 지급되었습니다.`;
            if (typeof alert === 'function') alert(msg);
            else console.log(msg);
        }
    }

    processFALoss(matchRecord, oppTeam, scoreStr, pkStr, stage) {
        const cup = gameData.faCup;
        if (matchRecord) {
            matchRecord.winner = oppTeam;
            matchRecord.score = scoreStr;
            matchRecord.pk = pkStr;
        }
        cup.isUserActive = false;
        cup.userEliminatedStage = stage;

        if (stage === 'FINAL') {
            cup.runnerUp = gameData.selectedTeam;
            const prize = 150;
            gameData.teamMoney = (gameData.teamMoney || 0) + prize;
            const msg = `🥈 아쉬운 준우승! ${cup.config.name} 결승전에서 석패했습니다.\n준우승 상금 +${prize}억원이 지급되었습니다.`;
            if (typeof alert === 'function') alert(msg);
            else console.log(msg);
        }
    }

    handleUserUCLMatchEnd(matchData) {
        const ucl = gameData.ucl;
        if (!ucl) return;

        const stage = ucl.currentStage;
        const userTeam = gameData.selectedTeam;

        if (stage.startsWith('LP')) {
            // 리그 페이즈 경기 종료
            const matches = ucl.schedule[stage] || [];
            const userMatch = matches.find(m => (m.home === userTeam || m.away === userTeam) && !m.played);
            if (userMatch) {
                userMatch.homeScore = matchData.homeScore;
                userMatch.awayScore = matchData.awayScore;
                userMatch.played = true;
                this.updateUCLTable(userMatch.home, userMatch.away, matchData.homeScore, matchData.awayScore);
            }

            // 승리/무승부 수당
            const isHome = matchData.homeTeam === userTeam;
            const uScore = isHome ? matchData.homeScore : matchData.awayScore;
            const oScore = isHome ? matchData.awayScore : matchData.homeScore;
            if (uScore > oScore) gameData.teamMoney = (gameData.teamMoney || 0) + 30; // UCL 승리 수당 30억
            else if (uScore === oScore) gameData.teamMoney = (gameData.teamMoney || 0) + 10; // 무승부 10억

            this.simulateUCLStageAI(stage);
            this.advanceUCLNextStage();
        } else {
            // 토너먼트 (PO, R16, QF, SF, FINAL)
            const isHome = matchData.homeTeam === userTeam;
            const uScore = isHome ? matchData.homeScore : matchData.awayScore;
            const oScore = isHome ? matchData.awayScore : matchData.homeScore;
            const oppTeam = isHome ? matchData.awayTeam : matchData.homeTeam;
            const matchRecord = (ucl.bracket[stage] || []).find(m => m.home === userTeam || m.away === userTeam);

            if (uScore > oScore) {
                this.processUCLWin(matchRecord, userTeam, `${matchData.homeScore} - ${matchData.awayScore}`, null, stage);
            } else if (uScore < oScore) {
                this.processUCLLoss(matchRecord, oppTeam, `${matchData.homeScore} - ${matchData.awayScore}`, null, stage);
            } else {
                this.runPenaltyShootout(matchData, matchRecord, userTeam, oppTeam, stage, 'UCL');
            }

            this.simulateUCLStageAI(stage);
            this.advanceUCLNextStage();
        }
    }

    processUCLWin(matchRecord, userTeam, scoreStr, pkStr, stage) {
        const ucl = gameData.ucl;
        if (matchRecord) {
            matchRecord.winner = userTeam;
            matchRecord.score = scoreStr;
            matchRecord.pk = pkStr;
        }

        const prizeTable = { 'PO': 50, 'R16': 100, 'QF': 150, 'SF': 250, 'FINAL': 800 };
        const prize = prizeTable[stage] || 50;
        gameData.teamMoney = (gameData.teamMoney || 0) + prize;

        if (stage === 'FINAL') {
            ucl.champion = userTeam;
            if (typeof managerSystem !== 'undefined' && gameData.managerId) {
                managerSystem.updateManagerStats(gameData.managerId, { trophy: true });
            }
            const msg = `⭐ 유럽 챔피언 등극! UEFA 챔피언스리그 빅이어(Big Ear)를 들어올렸습니다!\n우승 상금 +${prize}억원이 지급되었습니다.`;
            if (typeof alert === 'function') alert(msg);
            else console.log(msg);
        }
    }

    processUCLLoss(matchRecord, oppTeam, scoreStr, pkStr, stage) {
        const ucl = gameData.ucl;
        if (matchRecord) {
            matchRecord.winner = oppTeam;
            matchRecord.score = scoreStr;
            matchRecord.pk = pkStr;
        }
        ucl.isUserActive = false;
        ucl.userEliminatedStage = stage;

        if (stage === 'FINAL') {
            ucl.runnerUp = gameData.selectedTeam;
            const prize = 400;
            gameData.teamMoney = (gameData.teamMoney || 0) + prize;
            const msg = `🥈 UCL 준우승! 유럽의 정상을 눈앞에 두고 아쉽게 패배했습니다.\n준우승 상금 +${prize}억원이 지급되었습니다.`;
            if (typeof alert === 'function') alert(msg);
            else console.log(msg);
        }
    }

    runPenaltyShootout(matchData, matchRecord, userTeam, oppTeam, stage, type = 'FA') {
        let pkUser = 0, pkOpp = 0;
        for (let i = 0; i < 5; i++) {
            if (Math.random() < 0.75) pkUser++;
            if (Math.random() < 0.75) pkOpp++;
        }
        while (pkUser === pkOpp) {
            if (Math.random() < 0.75) pkUser++;
            if (Math.random() < 0.75) pkOpp++;
        }

        const userWin = pkUser > pkOpp;
        const pkText = `(PK ${pkUser}-${pkOpp})`;
        const scoreText = `${matchData.homeScore} - ${matchData.awayScore}`;

        if (userWin) {
            const msg = `[승부차기 승리!] 긴장감 넘치는 PK 승부 끝에 ${pkUser}:${pkOpp}로 승리하여 다음 라운드에 진출합니다!`;
            if (typeof alert === 'function') alert(msg);
            else console.log(msg);
            if (type === 'FA') this.processFAWin(matchRecord, userTeam, scoreText, pkText, stage);
            else this.processUCLWin(matchRecord, userTeam, scoreText, pkText, stage);
        } else {
            const msg = `[승부차기 패배] 아쉽게도 PK 승부에서 ${pkUser}:${pkOpp}로 패배하여 탈락했습니다.`;
            if (typeof alert === 'function') alert(msg);
            else console.log(msg);
            if (type === 'FA') this.processFALoss(matchRecord, oppTeam, scoreText, pkText, stage);
            else this.processUCLLoss(matchRecord, oppTeam, scoreText, pkText, stage);
        }
    }

    // ==========================================
    // 4. 모달 UI (FA컵 & UCL 탭 전환 뷰)
    // ==========================================
    openModal(defaultTab = 'fa') {
        let modal = document.getElementById('cupCompetitionModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'cupCompetitionModal';
            modal.className = 'stadium-modal-backdrop';
            document.body.appendChild(modal);
        }

        this.activeModalTab = defaultTab;
        modal.innerHTML = this.buildModalHTML();
        modal.style.display = 'flex';

        this.bindModalEvents(modal);
    }

    bindModalEvents(modal) {
        const closeBtn = modal.querySelector('.stadium-modal-close');
        if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';

        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };

        const tabBtns = modal.querySelectorAll('.cup-tab-btn');
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                const targetTab = btn.getAttribute('data-tab');
                this.activeModalTab = targetTab;
                modal.innerHTML = this.buildModalHTML();
                this.bindModalEvents(modal);
            };
        });
    }

    // 이전 faCupManager 호환 메서드
    openBracketModal() {
        this.openModal('fa');
    }

    openUCLModal() {
        this.openModal('ucl');
    }

    buildModalHTML() {
        const isFA = (this.activeModalTab !== 'ucl');
        const faConfig = this.getUserFACupConfig();
        const uclConfig = CUP_CONFIGS.ucl;

        const faLogoHTML = getCupLogoHTML(faConfig.logo, faConfig.flag, 24);
        const uclLogoHTML = getCupLogoHTML(uclConfig.logo, '⭐', 24);

        return `
        <div class="stadium-modal-content" style="max-width: 1100px; width: 95%; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="stadium-modal-header" style="flex-shrink:0;">
                <div class="stadium-title-box">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="stadium-badge" style="background: rgba(251, 191, 36, 0.15); color: #FBBF24; border-color: rgba(251, 191, 36, 0.4);">TOURNAMENT</span>
                        <h2 style="margin:0; font-size:1.35rem;">클럽 컵 대회 센터</h2>
                    </div>
                    <p class="stadium-sub" style="margin-top:4px;">국가별 공식 FA컵 토너먼트 및 유럽 챔피언스리그 리그 페이즈</p>
                </div>
                <button class="stadium-modal-close" title="닫기">&times;</button>
            </div>

            <!-- 네비게이션 탭 -->
            <div class="cup-nav-tabs" style="display:flex; gap:10px; margin: 12px 0; border-bottom: 1px solid #334155; padding-bottom: 8px; flex-shrink:0;">
                <button class="cup-tab-btn ${isFA ? 'active' : ''}" data-tab="fa" style="display:flex; align-items:center; gap:8px; padding: 8px 16px; border-radius: 8px; border: 1px solid ${isFA ? '#FBBF24' : '#334155'}; background: ${isFA ? 'rgba(251,191,36,0.12)' : '#1E293B'}; color: ${isFA ? '#FBBF24' : '#94A3B8'}; cursor:pointer; font-weight:700;">
                    ${faLogoHTML}
                    <span>${faConfig.name}</span>
                </button>
                <button class="cup-tab-btn ${!isFA ? 'active' : ''}" data-tab="ucl" style="display:flex; align-items:center; gap:8px; padding: 8px 16px; border-radius: 8px; border: 1px solid ${!isFA ? '#38BDF8' : '#334155'}; background: ${!isFA ? 'rgba(56,189,248,0.12)' : '#1E293B'}; color: ${!isFA ? '#38BDF8' : '#94A3B8'}; cursor:pointer; font-weight:700;">
                    ${uclLogoHTML}
                    <span>${uclConfig.name} (리그 페이즈)</span>
                </button>
            </div>

            <div style="flex: 1; overflow-y: auto; min-height: 0;">
                ${isFA ? this.buildFAContentHTML() : this.buildUCLContentHTML()}
            </div>
        </div>
        `;
    }

    // ------------------------------------------
    // 4-1. FA컵 모달 뷰 빌더
    // ------------------------------------------
    buildFAContentHTML() {
        const cup = gameData.faCup;
        if (!cup) return '<div style="padding:20px; text-align:center; color:#94A3B8;">FA컵 데이터가 없습니다.</div>';

        const faConfig = cup.config || this.getUserFACupConfig();
        const activeTag = cup.isUserActive 
            ? `<span class="hired-badge-permanent">생존 중 (${this.faStageNames[cup.currentStage] || '진행 중'})</span>`
            : `<span style="color:#EF4444; font-weight:700;">탈락 (${this.faStageNames[cup.userEliminatedStage] || ''})</span>`;

        const displayStages = cup.isShortBracket ? ['R1', 'QF', 'SF', 'FINAL'] : ['R1', 'R16', 'QF', 'SF', 'FINAL'];

        let stagesHTML = '';
        displayStages.forEach(stKey => {
            const matches = cup.bracket[stKey] || [];
            const stName = this.faStageNames[stKey];
            const isCurrent = cup.currentStage === stKey;

            let matchesHTML = '';
            if (matches.length === 0) {
                matchesHTML = '<div class="bracket-empty-slot">이전 라운드 진행 후 편성됩니다</div>';
            } else {
                matches.forEach(m => {
                    const isMyMatch = (m.home === gameData.selectedTeam || m.away === gameData.selectedTeam);
                    const homeName = (typeof teamNames !== 'undefined' && teamNames[m.home]) ? teamNames[m.home] : m.home;
                    const awayName = (typeof teamNames !== 'undefined' && teamNames[m.away]) ? teamNames[m.away] : m.away;
                    const homeWin = m.winner === m.home;
                    const awayWin = m.winner === m.away;

                    matchesHTML += `
                        <div class="bracket-match-node ${isMyMatch ? 'my-cup-match' : ''}">
                            <div class="node-team ${homeWin ? 'winner' : ''}">
                                <span>${homeName}</span>
                                <strong>${m.score ? m.score.split('-')[0] : ''}</strong>
                            </div>
                            <div class="node-team ${awayWin ? 'winner' : ''}">
                                <span>${awayName}</span>
                                <strong>${m.score ? m.score.split('-')[1] : ''}</strong>
                            </div>
                            ${m.pk ? `<span class="node-pk-text">${m.pk}</span>` : ''}
                        </div>
                    `;
                });
            }

            stagesHTML += `
                <div class="bracket-col ${isCurrent ? 'current-round-col' : ''}">
                    <div class="bracket-col-header">
                        <h4>${stName}</h4>
                        ${isCurrent ? '<span class="col-active-tag">진행 중</span>' : ''}
                    </div>
                    <div class="bracket-col-body">
                        ${matchesHTML}
                    </div>
                </div>
            `;
        });

        const logoHeader = getCupLogoHTML(faConfig.logo, faConfig.flag, 32);

        return `
            <div style="background:#0F172A; border-radius:10px; padding:12px 16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:12px;">
                    ${logoHeader}
                    <div>
                        <div style="font-weight:800; font-size:1.15rem; color:#F8FAFC;">${faConfig.fullName} (${faConfig.country})</div>
                        <div style="font-size:0.85rem; color:#94A3B8;">토너먼트 단판 승부 · 상태: ${activeTag}</div>
                    </div>
                </div>
                ${cup.champion ? `<div style="color:#FBBF24; font-weight:800; font-size:1rem;">🏆 우승: ${cup.champion}</div>` : ''}
            </div>

            <!-- 우승 보상 배너 -->
            <div class="facup-reward-banner">
                <div class="reward-pill">🏆 우승 상금: <strong>400억원</strong></div>
                <div class="reward-pill">🥈 준우승: <strong>150억원</strong></div>
                <div class="reward-pill">✨ 정규 리그 1위 + FA컵 동시 석권 시 <strong>[도메스틱 더블]</strong> 달성</div>
            </div>

            <!-- 브래킷 그리드 -->
            <div class="facup-bracket-scroll-wrap">
                <div class="facup-bracket-grid">
                    ${stagesHTML}
                </div>
            </div>
        `;
    }

    // ------------------------------------------
    // 4-2. UEFA 챔피언스리그 (리그페이즈 + 토너먼트) 모달 뷰 빌더
    // ------------------------------------------
    buildUCLContentHTML() {
        const ucl = gameData.ucl;
        if (!ucl) return '<div style="padding:20px; text-align:center; color:#94A3B8;">챔피언스리그 데이터가 없습니다.</div>';

        const sortedTable = this.getSortedUCLTable();
        const userTeam = gameData.selectedTeam;
        const currentStageName = this.uclStageNames[ucl.currentStage] || ucl.currentStage;

        const logoHeader = getCupLogoHTML(ucl.config.logo, '⭐', 32);

        let activeTag = '';
        if (!ucl.teams.includes(userTeam)) {
            activeTag = '<span style="color:#94A3B8; font-weight:700;">본선 미진출</span>';
        } else if (ucl.isUserActive) {
            activeTag = `<span class="hired-badge-permanent" style="background:#0284C7; color:#fff;">진출 중 (${currentStageName})</span>`;
        } else {
            activeTag = `<span style="color:#EF4444; font-weight:700;">탈락 (${this.uclStageNames[ucl.userEliminatedStage] || ucl.userEliminatedStage})</span>`;
        }

        // 36개 팀 순위표 Rows
        let tableRowsHTML = '';
        sortedTable.forEach((row, idx) => {
            const rank = idx + 1;
            const isUser = row.team === userTeam;
            let rankStyle = 'color:#94A3B8;';
            let rowBg = isUser ? 'background: rgba(56, 189, 248, 0.15);' : '';

            // 1~8위 (16강 직행 초록/파랑), 9~24위 (플레이오프 주황), 25~36위 (탈락 빨강)
            if (rank <= 8) rankStyle = 'color:#10B981; font-weight:800;';
            else if (rank <= 24) rankStyle = 'color:#F59E0B; font-weight:700;';
            else rankStyle = 'color:#64748B;';

            const displayName = (typeof teamNames !== 'undefined' && teamNames[row.team]) ? teamNames[row.team] : row.team;

            tableRowsHTML += `
                <tr style="${rowBg} border-bottom: 1px solid #1E293B;">
                    <td style="padding: 6px 8px; text-align:center; ${rankStyle}">${rank}</td>
                    <td style="padding: 6px 8px; font-weight:${isUser ? '800' : '500'}; color:${isUser ? '#38BDF8' : '#F1F5F9'};">
                        ${displayName} ${isUser ? '<span style="font-size:0.75rem; background:#0284C7; color:#fff; padding:1px 5px; border-radius:4px; margin-left:4px;">MY</span>' : ''}
                    </td>
                    <td style="padding: 6px 8px; text-align:center; color:#CBD5E1;">${row.played}</td>
                    <td style="padding: 6px 8px; text-align:center; color:#94A3B8;">${row.won}</td>
                    <td style="padding: 6px 8px; text-align:center; color:#94A3B8;">${row.drawn}</td>
                    <td style="padding: 6px 8px; text-align:center; color:#94A3B8;">${row.lost}</td>
                    <td style="padding: 6px 8px; text-align:center; color:#94A3B8;">${row.gf}:${row.ga}</td>
                    <td style="padding: 6px 8px; text-align:center; color:${row.gd > 0 ? '#10B981' : (row.gd < 0 ? '#EF4444' : '#94A3B8')};">${row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                    <td style="padding: 6px 8px; text-align:center; font-weight:800; color:#FBBF24;">${row.points}</td>
                </tr>
            `;
        });

        // 토너먼트 진행 현황 렌더 (PO, R16, QF, SF, FINAL)
        const tStages = ['PO', 'R16', 'QF', 'SF', 'FINAL'];
        let tHTML = '';
        tStages.forEach(stKey => {
            const matches = ucl.bracket[stKey] || [];
            const stName = this.uclStageNames[stKey];
            const isCurrent = ucl.currentStage === stKey;

            let matchesHTML = '';
            if (matches.length === 0) {
                matchesHTML = '<div class="bracket-empty-slot">진행 대기</div>';
            } else {
                matches.forEach(m => {
                    const isMy = (m.home === userTeam || m.away === userTeam);
                    const homeName = (typeof teamNames !== 'undefined' && teamNames[m.home]) ? teamNames[m.home] : m.home;
                    const awayName = (typeof teamNames !== 'undefined' && teamNames[m.away]) ? teamNames[m.away] : m.away;
                    const homeWin = m.winner === m.home;
                    const awayWin = m.winner === m.away;

                    matchesHTML += `
                        <div class="bracket-match-node ${isMy ? 'my-cup-match' : ''}">
                            <div class="node-team ${homeWin ? 'winner' : ''}">
                                <span>${homeName}</span>
                                <strong>${m.score ? m.score.split('-')[0] : ''}</strong>
                            </div>
                            <div class="node-team ${awayWin ? 'winner' : ''}">
                                <span>${awayName}</span>
                                <strong>${m.score ? m.score.split('-')[1] : ''}</strong>
                            </div>
                            ${m.pk ? `<span class="node-pk-text">${m.pk}</span>` : ''}
                        </div>
                    `;
                });
            }

            tHTML += `
                <div class="bracket-col ${isCurrent ? 'current-round-col' : ''}">
                    <div class="bracket-col-header">
                        <h4>${stName}</h4>
                        ${isCurrent ? '<span class="col-active-tag">진행 중</span>' : ''}
                    </div>
                    <div class="bracket-col-body">
                        ${matchesHTML}
                    </div>
                </div>
            `;
        });

        return `
            <div style="background:#0F172A; border-radius:10px; padding:12px 16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:12px;">
                    ${logoHeader}
                    <div>
                        <div style="font-weight:800; font-size:1.15rem; color:#38BDF8;">UEFA 챔피언스리그 (36개 팀 단일 리그 페이즈)</div>
                        <div style="font-size:0.85rem; color:#94A3B8;">상위 8팀 16강 직행 · 9~24위 녹아웃 PO · 상태: ${activeTag}</div>
                    </div>
                </div>
                ${ucl.champion ? `<div style="color:#FBBF24; font-weight:800; font-size:1rem;">⭐ 빅이어 챔피언: ${ucl.champion}</div>` : ''}
            </div>

            <!-- 우승 보상 배너 -->
            <div class="facup-reward-banner" style="background: linear-gradient(90deg, rgba(2, 132, 199, 0.15), rgba(56, 189, 248, 0.05)); border-color: rgba(56, 189, 248, 0.3);">
                <div class="reward-pill" style="color:#38BDF8;">⭐ 우승 상금: <strong>800억원</strong></div>
                <div class="reward-pill">🥈 준우승: <strong>400억원</strong></div>
                <div class="reward-pill">✨ 리그 + FA컵 + UCL 3개 석권 시 <strong>[유러피언 트레블(Treble)]</strong> 달성</div>
            </div>

            <!-- 리그 페이즈 테이블 & 녹아웃 토너먼트 2단 뷰 -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-top:10px;">
                <!-- 36개 팀 순위표 -->
                <div style="background:#1E293B; border:1px solid #334155; border-radius:10px; padding:12px; max-height:480px; overflow-y:auto;">
                    <div style="font-weight:800; color:#38BDF8; font-size:0.95rem; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                        <span>통합 리그 페이즈 순위표 (총 36팀)</span>
                        <span style="font-size:0.75rem; color:#94A3B8;">8경기 합산</span>
                    </div>
                    <div style="display:flex; gap:10px; font-size:0.75rem; margin-bottom:8px;">
                        <span style="color:#10B981;">■ 1~8위 16강 직행</span>
                        <span style="color:#F59E0B;">■ 9~24위 PO</span>
                        <span style="color:#64748B;">■ 25~36위 탈락</span>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                        <thead>
                            <tr style="border-bottom:1px solid #475569; color:#94A3B8;">
                                <th style="padding:4px 6px; text-align:center;">#</th>
                                <th style="padding:4px 6px; text-align:left;">클럽</th>
                                <th style="padding:4px 6px; text-align:center;">경기</th>
                                <th style="padding:4px 6px; text-align:center;">승</th>
                                <th style="padding:4px 6px; text-align:center;">무</th>
                                <th style="padding:4px 6px; text-align:center;">패</th>
                                <th style="padding:4px 6px; text-align:center;">득실</th>
                                <th style="padding:4px 6px; text-align:center;">차</th>
                                <th style="padding:4px 6px; text-align:center; color:#FBBF24;">승점</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHTML}
                        </tbody>
                    </table>
                </div>

                <!-- 토너먼트 브래킷 -->
                <div style="background:#1E293B; border:1px solid #334155; border-radius:10px; padding:12px; max-height:480px; overflow-y:auto; display:flex; flex-direction:column;">
                    <div style="font-weight:800; color:#FBBF24; font-size:0.95rem; margin-bottom:8px;">
                        녹아웃 플레이오프 & 16강 본선 토너먼트
                    </div>
                    <div class="facup-bracket-scroll-wrap" style="flex:1;">
                        <div class="facup-bracket-grid" style="min-width: 600px;">
                            ${tHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// 싱글톤 인스턴스 생성
const cupCompetitionManager = new CupCompetitionManager();
const faCupManager = cupCompetitionManager; // 기존 코드 100% 호환용 alias

if (typeof window !== 'undefined') {
    window.cupCompetitionManager = cupCompetitionManager;
    window.faCupManager = faCupManager;
    window.CUP_CONFIGS = CUP_CONFIGS;
    window.getCupLogoHTML = getCupLogoHTML;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CupCompetitionManager,
        cupCompetitionManager,
        faCupManager,
        CUP_CONFIGS,
        getCupLogoHTML
    };
}
