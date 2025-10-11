// records.js
// 개인기록 시스템 구현
// gameData, teams, teamNames, allTeams 객체가 이미 정의되어 있다고 가정    
// 개인기록 시스템 (리그별)
class RecordsSystem {
    constructor() {
        this.playerStats = new Map();
        this.matchRecords = [];
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        Object.keys(teams).forEach(teamKey => {
            teams[teamKey].forEach(player => {
                this.initializePlayer(player.name, teamKey, player.position);
            });
        });

        this.initialized = true;
        console.log('개인기록 시스템이 초기화되었습니다.');
    }

    initializePlayer(playerName, teamKey, position) {
        if (!this.playerStats.has(playerName)) {
            this.playerStats.set(playerName, {
                name: playerName,
                team: teamKey,
                position: position,
                goals: 0,
                assists: 0,
                matches: 0
            });
        }
    }

    addGoal(scorerName, assisterName = null, teamKey) {
        if (this.playerStats.has(scorerName)) {
            const scorerStats = this.playerStats.get(scorerName);
            scorerStats.goals++;
        } else {
            const player = this.findPlayerByName(scorerName, teamKey);
            if (player) {
                this.initializePlayer(scorerName, teamKey, player.position);
                const scorerStats = this.playerStats.get(scorerName);
                if (scorerStats) scorerStats.goals++;
            }
        }

        if (assisterName && this.playerStats.has(assisterName)) {
            const assisterStats = this.playerStats.get(assisterName);
            assisterStats.assists++;
        } else if (assisterName) {
            const player = this.findPlayerByName(assisterName, teamKey);
            if (player) {
                this.initializePlayer(assisterName, teamKey, player.position);
                const assisterStats = this.playerStats.get(assisterName);
                if (assisterStats) assisterStats.assists++;
            }
        }
    }

    addMatchAppearance(playerName, teamKey) {
        if (this.playerStats.has(playerName)) {
            const playerStats = this.playerStats.get(playerName);
            playerStats.matches++;
        } else {
            const player = this.findPlayerByName(playerName, teamKey);
            if (player) {
                this.initializePlayer(playerName, teamKey, player.position);
                const playerStats = this.playerStats.get(playerName);
                if (playerStats) playerStats.matches++;
            }
        }
    }

    findPlayerByName(playerName, teamKey) {
        if (teams[teamKey]) {
            return teams[teamKey].find(p => p.name === playerName);
        }

        for (const [key, teamPlayers] of Object.entries(teams)) {
            const player = teamPlayers.find(p => p.name === playerName);
            if (player) return player;
        }

        return null;
    }

    getTopScorers(limit = 5) {
        const scorers = Array.from(this.playerStats.values())
            .filter(player => player.goals > 0)
            .sort((a, b) => {
                if (b.goals !== a.goals) return b.goals - a.goals;
                return b.assists - a.assists;
            })
            .slice(0, limit);

        return scorers;
    }

    getTopAssisters(limit = 5) {
        const assisters = Array.from(this.playerStats.values())
            .filter(player => player.assists > 0)
            .sort((a, b) => {
                if (b.assists !== a.assists) return b.assists - a.assists;
                return b.goals - a.goals;
            })
            .slice(0, limit);

        return assisters;
    }

    recordUserMatchStats(matchEvents) {
        this.addMatchAppearancesForUserTeam();

        matchEvents.forEach(event => {
            if (event.type === 'goal') {
                this.addGoal(event.scorer, event.assister,
                    event.team === teamNames[gameData.selectedTeam] ? gameData.selectedTeam : gameData.currentOpponent);
            }
        });

        this.simulateAllLeaguesMatches();
        this.updateRecordsDisplay();
    }

    simulateAllLeaguesMatches() {
        console.log('=== 모든 리그의 AI 팀 경기 결과 ===');
        for (let league = 1; league <= 3; league++) {
            const leagueTeams = Object.keys(allTeams).filter(teamKey =>
                allTeams[teamKey].league === league &&
                teamKey !== gameData.selectedTeam &&
                teamKey !== gameData.currentOpponent
            );

            if (leagueTeams.length >= 2) {
                console.log(`\n--- ${league}부리그 ---`);
                this.simulateLeagueMatches(leagueTeams, league);
            }
        }
        console.log('========================');
    }

    simulateLeagueMatches(leagueTeams, league) {
        for (let i = 0; i < leagueTeams.length - 1; i += 2) {
            const team1 = leagueTeams[i];
            const team2 = leagueTeams[i + 1];

            const matchResult = this.simulateSingleAIMatch(team1, team2);
            this.matchRecords.push(matchResult);

            console.log(`${team1} ${matchResult.score1} - ${matchResult.score2} ${team2}`);
            matchResult.goals.forEach(goal => {
                let goalLog = `  ⚽ ${goal.minute}분: ${goal.scorer}`;
                if (goal.assister) {
                    goalLog += ` (도움: ${goal.assister})`;
                }
                goalLog += ` [${goal.team}]`;
                console.log(goalLog);
            });
        }
    }

  simulateSingleAIMatch(team1Key, team2Key) {
    const team1Rating = this.calculateAITeamRating(team1Key);
    const team2Rating = this.calculateAITeamRating(team2Key);
    const ratingDiff = team1Rating - team2Rating;
    const upsetOccurs = Math.random() < 0.08;
    let team1WinChance = 0.33;
    let team2WinChance = 0.33;
    let drawChance = 0.34;

    if (ratingDiff > 0) {
        const advantage = Math.min(0.3, ratingDiff / 150);
        team1WinChance += advantage;
        team2WinChance -= advantage * 0.7;
        drawChance -= advantage * 0.3;

        if (upsetOccurs) {
            const upsetBonus = 0.15 + (Math.random() * 0.15);
            team2WinChance += upsetBonus;
            team1WinChance -= upsetBonus * 0.6;
            drawChance -= upsetBonus * 0.4;
        }
    } else if (ratingDiff < 0) {
        const advantage = Math.min(0.3, Math.abs(ratingDiff) / 100);
        team2WinChance += advantage;
        team1WinChance -= advantage * 0.7;
        drawChance -= advantage * 0.3;

        if (upsetOccurs) {
            const upsetBonus = 0.15 + (Math.random() * 0.15);
            team1WinChance += upsetBonus;
            team2WinChance -= upsetBonus * 0.6;
            drawChance -= upsetBonus * 0.4;
        }
    }

    team1WinChance = Math.max(0.05, team1WinChance);
    team2WinChance = Math.max(0.05, team2WinChance);
    drawChance = Math.max(0.05, drawChance);
    const total = team1WinChance + team2WinChance + drawChance;
    team1WinChance /= total;
    team2WinChance /= total;
    drawChance /= total;
    const resultRoll = Math.random();
    let score1, score2;

    if (resultRoll < team1WinChance) {
        [score1, score2] = this.generateRealisticScore(true, upsetOccurs && ratingDiff < 0);
    } else if (resultRoll < team1WinChance + team2WinChance) {
        [score2, score1] = this.generateRealisticScore(true, upsetOccurs && ratingDiff > 0);
    } else {
        [score1, score2] = this.generateDrawScore();
    }

    const goals = this.generateGoalEvents(team1Key, team2Key, score1, score2);
    goals.forEach(goal => {
        this.addGoal(goal.scorer, goal.assister, goal.team);
    });

    this.addMatchAppearancesForTeam(team1Key);
    this.addMatchAppearancesForTeam(team2Key);

    // 리그 테이블 업데이트 추가
    this.updateLeagueTableForAIMatch(team1Key, team2Key, score1, score2);

    return {
        team1: team1Key,
        team2: team2Key,
        score1: score1,
        score2: score2,
        goals: goals,
        minute: 90
    };
}

// 리그 테이블 업데이트 메서드 (Records System 클래스에 추가)
updateLeagueTableForAIMatch(team1Key, team2Key, score1, score2) {
    // updateLeagueTableForAIMatch 함수 맨 첫 줄에 이것만 추가
    console.log(`리그 테이블 업데이트 호출: ${team1Key} vs ${team2Key}`);

    // 팀들의 리그 확인
    const team1League = allTeams[team1Key]?.league || 1;
    const team2League = allTeams[team2Key]?.league || 1;
    
    if (team1League !== team2League) {
        console.log(`리그가 다름: ${team1Key}(${team1League}부) vs ${team2Key}(${team2League}부)`);
        return;
    }
    
    // 해당 리그 테이블 가져오기
    let leagueTable;
    if (team1League === 1) {
        if (typeof league1Table === 'undefined') window.league1Table = {};
        leagueTable = league1Table;
    } else if (team1League === 2) {
        if (typeof league2Table === 'undefined') window.league2Table = {};
        leagueTable = league2Table;
    } else if (team1League === 3) {
        if (typeof league3Table === 'undefined') window.league3Table = {};
        leagueTable = league3Table;
    }
    
    if (!leagueTable) {
        console.log(`${team1League}부리그 테이블을 찾을 수 없음`);
        return;
    }
    
    // 팀 통계 업데이트
    [team1Key, team2Key].forEach((teamKey, index) => {
        const teamScore = index === 0 ? score1 : score2;
        const opponentScore = index === 0 ? score2 : score1;
        
        // 팀 데이터 초기화
        if (!leagueTable[teamKey]) {
            leagueTable[teamKey] = {
                matches: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                points: 0,
                goalsFor: 0,
                goalsAgainst: 0
            };
        }
        
        const teamStats = leagueTable[teamKey];
        teamStats.matches++;
        teamStats.goalsFor += teamScore;
        teamStats.goalsAgainst += opponentScore;
        
        if (teamScore > opponentScore) {
            teamStats.wins++;
            teamStats.points += 3;
        } else if (teamScore === opponentScore) {
            teamStats.draws++;
            teamStats.points += 1;
        } else {
            teamStats.losses++;
        }
    });
    
    console.log(`${team1League}부리그 테이블 업데이트: ${team1Key} ${score1}-${score2} ${team2Key}`);
}

    calculateAITeamRating(teamKey) {
        const teamPlayers = teams[teamKey];
        if (!teamPlayers || teamPlayers.length === 0) return 70;
        const sortedPlayers = teamPlayers.sort((a, b) => b.rating - a.rating);
        const topPlayers = sortedPlayers.slice(0, 11);
        const totalRating = topPlayers.reduce((sum, player) => sum + player.rating, 0);
        return totalRating / topPlayers.length;
    }

    generateRealisticScore(isWin, isUpset) {
        if (isUpset) {
            const winScore = Math.floor(Math.random() * 2) + 1;
            const loseScore = Math.floor(Math.random() * 2);
            return [winScore, loseScore];
        }

        const goalType = Math.random();
        if (goalType < 0.4) {
            return [1, 0];
        } else if (goalType < 0.7) {
            return [2, Math.random() < 0.5 ? 0 : 1];
        } else if (goalType < 0.9) {
            return [Math.floor(Math.random() * 2) + 2, Math.floor(Math.random() * 2)];
        } else {
            return [Math.floor(Math.random() * 3) + 2, Math.floor(Math.random() * 3)];
        }
    }

    generateDrawScore() {
        const drawType = Math.random();
        if (drawType < 0.4) {
            return [0, 0];
        } else if (drawType < 0.7) {
            return [1, 1];
        } else if (drawType < 0.9) {
            return [2, 2];
        } else {
            const drawScore = Math.floor(Math.random() * 2) + 3;
            return [drawScore, drawScore];
        }
    }

    generateGoalEvents(team1Key, team2Key, score1, score2) {
        const goals = [];
        const totalGoals = score1 + score2;
        const goalTimes = [];
        for (let i = 0; i < totalGoals; i++) {
            goalTimes.push(Math.floor(Math.random() * 86) + 5);
        }
        goalTimes.sort((a, b) => a - b);
        let team1Goals = 0;
        let team2Goals = 0;

        goalTimes.forEach((minute, index) => {
            let scoringTeam;
            if (team1Goals < score1 && team2Goals < score2) {
                scoringTeam = Math.random() < 0.5 ? team1Key : team2Key;
            } else if (team1Goals < score1) {
                scoringTeam = team1Key;
            } else {
                scoringTeam = team2Key;
            }

            if (scoringTeam === team1Key) {
                team1Goals++;
            } else {
                team2Goals++;
            }
            const goalEvent = this.generateSingleGoal(scoringTeam, minute);
            goals.push(goalEvent);
        });
        return goals;
    }

    generateSingleGoal(teamKey, minute) {
        const teamPlayers = teams[teamKey];
        if (!teamPlayers || teamPlayers.length === 0) {
            return {
                minute: minute,
                team: teamKey,
                scorer: "알 수 없는 선수",
                assister: null
            };
        }

        const forwards = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);
        const midfielders = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
        const defenders = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
        const scorerPool = [];

        forwards.slice(0, 3).forEach(player => {
            for (let i = 0; i < 75; i++) scorerPool.push(player);
        });

        midfielders.slice(0, 3).forEach(player => {
            for (let i = 0; i < 21; i++) scorerPool.push(player);
        });

        defenders.slice(0, 4).forEach(player => {
            for (let i = 0; i < 4; i++) scorerPool.push(player);
        });

        const scorer = scorerPool[Math.floor(Math.random() * scorerPool.length)];
        let assister = null;

        if (Math.random() < 0.85) {
            const assisterPool = [];
            forwards.slice(0, 3).filter(p => p.name !== scorer.name).forEach(player => {
                for (let i = 0; i < 50; i++) assisterPool.push(player);
            });
            midfielders.slice(0, 3).filter(p => p.name !== scorer.name).forEach(player => {
                for (let i = 0; i < 45; i++) assisterPool.push(player);
            });
            defenders.slice(0, 4).filter(p => p.name !== scorer.name).forEach(player => {
                for (let i = 0; i < 5; i++) assisterPool.push(player);
            });

            if (assisterPool.length > 0) {
                assister = assisterPool[Math.floor(Math.random() * assisterPool.length)];
            }
        }

        return {
            minute: minute,
            team: teamKey,
            scorer: scorer ? scorer.name : "알 수 없는 선수",
            assister: assister ? assister.name : null
        };
    }

    addMatchAppearancesForTeam(teamKey) {
        const teamPlayers = teams[teamKey];
        if (!teamPlayers) return;

        const gks = teamPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
        const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
        const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
        const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);
        const starters = [];

        if (gks.length > 0) starters.push(gks[0]);
        for (let i = 0; i < 4 && i < dfs.length; i++) starters.push(dfs[i]);
        for (let i = 0; i < 3 && i < mfs.length; i++) starters.push(mfs[i]);
        for (let i = 0; i < 3 && i < fws.length; i++) starters.push(fws[i]);

        starters.forEach(player => {
            this.addMatchAppearance(player.name, teamKey);
        });
    }

    addMatchAppearancesForUserTeam() {
        const squad = gameData.squad;

        if (squad.gk) this.addMatchAppearance(squad.gk.name, gameData.selectedTeam);
        squad.df.forEach(player => {
            if (player) this.addMatchAppearance(player.name, gameData.selectedTeam);
        });
        squad.mf.forEach(player => {
            if (player) this.addMatchAppearance(player.name, gameData.selectedTeam);
        });
        squad.fw.forEach(player => {
            if (player) this.addMatchAppearance(player.name, gameData.selectedTeam);
        });
    }

    updateRecordsDisplay() {
        const topScorers = this.getTopScorers(5);
        const topAssisters = this.getTopAssisters(5);
        this.displayTopScorers(topScorers);
        this.displayTopAssisters(topAssisters);
    }

    displayTopScorers(topScorers) {
        const container = document.getElementById('topScorers');
        if (!container) return;
        container.innerHTML = '';
        if (topScorers.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">아직 기록이 없습니다.</p>';
            return;
        }

        topScorers.forEach((player, index) => {
            const isUserPlayer = player.team === gameData.selectedTeam;
            const rankingItem = document.createElement('div');
            rankingItem.className = `ranking-item ${isUserPlayer ? 'user-player' : ''}`;
            rankingItem.innerHTML = `
                <div class="player-rank">${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-team">${teamNames[player.team] || '알 수 없음'}</div>
                </div>
                <div class="player-stats">${player.goals}</div>
            `;
            container.appendChild(rankingItem);
        });
    }

    displayTopAssisters(topAssisters) {
        const container = document.getElementById('topAssisters');
        if (!container) return;
        container.innerHTML = '';
        if (topAssisters.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">아직 기록이 없습니다.</p>';
            return;
        }

        topAssisters.forEach((player, index) => {
            const isUserPlayer = player.team === gameData.selectedTeam;
            const rankingItem = document.createElement('div');
            rankingItem.className = `ranking-item ${isUserPlayer ? 'user-player' : ''}`;
            rankingItem.innerHTML = `
                <div class="player-rank">${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-team">${teamNames[player.team] || '알 수 없음'}</div>
                </div>
                <div class="player-stats">${player.assists}</div>
            `;
            container.appendChild(rankingItem);
        });
    }

    getSaveData() {
        return {
            playerStats: Array.from(this.playerStats.entries()),
            matchRecords: this.matchRecords,
            initialized: this.initialized
        };
    }

    loadSaveData(saveData) {
        if (saveData.playerStats) {
            this.playerStats = new Map(saveData.playerStats);
        }
        if (saveData.matchRecords) {
            this.matchRecords = saveData.matchRecords;
        }
        if (saveData.initialized) {
            this.initialized = saveData.initialized;
        }
    }

    resetSeason() {
        this.playerStats.clear();
        this.matchRecords = [];
        this.initialized = false;
        console.log('개인기록이 리셋되었습니다.');
    }
}

// 리그별 개인기록 시스템
class LeagueBasedRecordsSystem extends RecordsSystem {
    constructor() {
        super();
        this.leagueStats = {
            division1: new Map(),
            division2: new Map(), 
            division3: new Map()
        };
    }

    initialize() {
        if (this.initialized) return;
        
        // 리그 전환 버튼 추가
        this.addLeagueSwitchButtons();
        
        // 부모 클래스의 initialize 호출
        super.initialize();
    }

    // 선수 초기화 시 리그별로 분류
    initializePlayer(playerName, teamKey, position) {
        // 기존 전체 통계
        super.initializePlayer(playerName, teamKey, position);
        
        // 리그별 통계
        if (allTeams && allTeams[teamKey]) {
            const league = allTeams[teamKey].league;
            const divisionKey = `division${league}`;
            
            if (!this.leagueStats[divisionKey].has(playerName)) {
                this.leagueStats[divisionKey].set(playerName, {
                    name: playerName,
                    team: teamKey,
                    position: position,
                    league: league,
                    goals: 0,
                    assists: 0,
                    matches: 0
                });
            }
        }
    }

    // 골 기록 추가 (리그별)
    addGoal(scorerName, assisterName = null, teamKey) {
        // 기존 전체 통계 업데이트
        super.addGoal(scorerName, assisterName, teamKey);
        
        // 리그별 통계 업데이트
        if (allTeams && allTeams[teamKey]) {
            const league = allTeams[teamKey].league;
            const divisionKey = `division${league}`;
            
            // 득점자 리그별 기록
            if (this.leagueStats[divisionKey].has(scorerName)) {
                const scorerStats = this.leagueStats[divisionKey].get(scorerName);
                scorerStats.goals++;
            } else {
                const player = this.findPlayerByName(scorerName, teamKey);
                if (player) {
                    this.initializePlayer(scorerName, teamKey, player.position);
                    const scorerStats = this.leagueStats[divisionKey].get(scorerName);
                    if (scorerStats) scorerStats.goals++;
                }
            }

            // 어시스트 리그별 기록
            if (assisterName && this.leagueStats[divisionKey].has(assisterName)) {
                const assisterStats = this.leagueStats[divisionKey].get(assisterName);
                assisterStats.assists++;
            } else if (assisterName) {
                const player = this.findPlayerByName(assisterName, teamKey);
                if (player) {
                    this.initializePlayer(assisterName, teamKey, player.position);
                    const assisterStats = this.leagueStats[divisionKey].get(assisterName);
                    if (assisterStats) assisterStats.assists++;
                }
            }
        }
    }

    // 경기 출전 기록 추가 (리그별)
    addMatchAppearance(playerName, teamKey) {
        // 기존 전체 통계 업데이트
        super.addMatchAppearance(playerName, teamKey);
        
        // 리그별 통계 업데이트
        if (allTeams && allTeams[teamKey]) {
            const league = allTeams[teamKey].league;
            const divisionKey = `division${league}`;
            
            if (this.leagueStats[divisionKey].has(playerName)) {
                const playerStats = this.leagueStats[divisionKey].get(playerName);
                playerStats.matches++;
            } else {
                const player = this.findPlayerByName(playerName, teamKey);
                if (player) {
                    this.initializePlayer(playerName, teamKey, player.position);
                    const playerStats = this.leagueStats[divisionKey].get(playerName);
                    if (playerStats) playerStats.matches++;
                }
            }
        }
    }

    // 리그별 득점왕 순위
    getTopScorersByLeague(league, limit = 5) {
        const divisionKey = `division${league}`;
        if (!this.leagueStats[divisionKey]) return [];
        
        const scorers = Array.from(this.leagueStats[divisionKey].values())
            .filter(player => player.goals > 0)
            .sort((a, b) => {
                if (b.goals !== a.goals) return b.goals - a.goals;
                return b.assists - a.assists;
            })
            .slice(0, limit);

        return scorers;
    }

    // 리그별 도움왕 순위
    getTopAssistersByLeague(league, limit = 5) {
        const divisionKey = `division${league}`;
        if (!this.leagueStats[divisionKey]) return [];
        
        const assisters = Array.from(this.leagueStats[divisionKey].values())
            .filter(player => player.assists > 0)
            .sort((a, b) => {
                if (b.assists !== a.assists) return b.assists - a.assists;
                return b.goals - a.goals;
            })
            .slice(0, limit);

        return assisters;
    }

    // 리그 정보 포함한 득점왕 표시
    displayTopScorersWithLeague(topScorers, league) {
        const container = document.getElementById('topScorers');
        if (!container) return;
        
        container.innerHTML = '';
        
        // 리그 헤더 추가
        const leagueHeader = document.createElement('div');
        leagueHeader.className = 'league-records-header';
        leagueHeader.innerHTML = `<h5>${league}부리그 득점왕</h5>`;
        container.appendChild(leagueHeader);
        
        if (topScorers.length === 0) {
            container.innerHTML += '<p style="text-align: center; opacity: 0.7;">아직 기록이 없습니다.</p>';
            return;
        }
        
        topScorers.forEach((player, index) => {
            const isUserPlayer = player.team === gameData.selectedTeam;
            const rankingItem = document.createElement('div');
            rankingItem.className = `ranking-item ${isUserPlayer ? 'user-player' : ''}`;
            
            rankingItem.innerHTML = `
                <div class="player-rank">${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-team">${teamNames[player.team] || player.team}</div>
                </div>
                <div class="player-stats">${player.goals}</div>
            `;
            
            container.appendChild(rankingItem);
        });
    }

    // 리그 정보 포함한 도움왕 표시
    displayTopAssistersWithLeague(topAssisters, league) {
        const container = document.getElementById('topAssisters');
        if (!container) return;
        
        container.innerHTML = '';
        
        // 리그 헤더 추가
        const leagueHeader = document.createElement('div');
        leagueHeader.className = 'league-records-header';
        leagueHeader.innerHTML = `<h5>${league}부리그 도움왕</h5>`;
        container.appendChild(leagueHeader);
        
        if (topAssisters.length === 0) {
            container.innerHTML += '<p style="text-align: center; opacity: 0.7;">아직 기록이 없습니다.</p>';
            return;
        }
        
        topAssisters.forEach((player, index) => {
            const isUserPlayer = player.team === gameData.selectedTeam;
            const rankingItem = document.createElement('div');
            rankingItem.className = `ranking-item ${isUserPlayer ? 'user-player' : ''}`;
            
            rankingItem.innerHTML = `
                <div class="player-rank">${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-team">${teamNames[player.team] || player.team}</div>
                </div>
                <div class="player-stats">${player.assists}</div>
            `;
            
            container.appendChild(rankingItem);
        });
    }

    // 리그 전환 버튼 추가
    addLeagueSwitchButtons() {
        const recordsContent = document.querySelector('.records-content');
        if (!recordsContent) return;
        
        // 기존 버튼 제거
        const existingButtons = recordsContent.querySelector('.league-switch-buttons');
        if (existingButtons) {
            existingButtons.remove();
        }
        
        // 새 버튼 추가
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'league-switch-buttons';
        buttonContainer.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        `;
        
        for (let i = 1; i <= 3; i++) {
            const button = document.createElement('button');
            button.className = `league-switch-btn ${i === gameData.currentLeague ? 'active' : ''}`;
            button.textContent = `${i}부리그`;
            button.style.cssText = `
                padding: 8px 16px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                background: ${i === gameData.currentLeague ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            button.addEventListener('click', () => {
                this.switchToLeague(i);
            });
            
            buttonContainer.appendChild(button);
        }
        
        recordsContent.insertBefore(buttonContainer, recordsContent.firstChild);
    }

    // 리그 전환
    switchToLeague(league) {
        const topScorers = this.getTopScorersByLeague(league, 5);
        const topAssisters = this.getTopAssistersByLeague(league, 5);
        
        this.displayTopScorersWithLeague(topScorers, league);
        this.displayTopAssistersWithLeague(topAssisters, league);
        
        // 버튼 활성화 상태 업데이트
        document.querySelectorAll('.league-switch-btn').forEach((btn, index) => {
            btn.classList.toggle('active', index + 1 === league);
            btn.style.background = index + 1 === league ? 
                'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';
        });
    }

    // 개인기록 표시 업데이트 (리그별)
    updateRecordsDisplay() {
        // 현재 사용자의 리그 확인
        const userLeague = gameData.currentLeague || 1;
        
        // 사용자 리그의 기록 표시
        const topScorers = this.getTopScorersByLeague(userLeague, 5);
        const topAssisters = this.getTopAssistersByLeague(userLeague, 5);
        
        this.displayTopScorersWithLeague(topScorers, userLeague);
        this.displayTopAssistersWithLeague(topAssisters, userLeague);
    }

    // 저장 데이터 준비 (리그별 포함)
    getSaveData() {
        const baseData = super.getSaveData();
        const leagueData = {};
        
        Object.keys(this.leagueStats).forEach(divisionKey => {
            leagueData[divisionKey] = Array.from(this.leagueStats[divisionKey].entries());
        });
        
        return {
            ...baseData,
            leagueStats: leagueData
        };
    }

    // 저장 데이터 로드 (리그별 포함)
    loadSaveData(saveData) {
        super.loadSaveData(saveData);
        
        if (saveData.leagueStats) {
            Object.keys(saveData.leagueStats).forEach(divisionKey => {
                this.leagueStats[divisionKey] = new Map(saveData.leagueStats[divisionKey]);
            });
        }
    }

    // 시즌 리셋 (리그별 포함)
    resetSeason() {
        super.resetSeason();
        
        Object.keys(this.leagueStats).forEach(divisionKey => {
            this.leagueStats[divisionKey].clear();
        });
        
        console.log('리그별 개인기록이 리셋되었습니다.');
    }
}

// 리그 기반 개인기록 시스템 인스턴스
const leagueBasedRecordsSystem = new LeagueBasedRecordsSystem();

// 기존 함수들 업데이트
function initializeRecordsSystem() {
    leagueBasedRecordsSystem.initialize();
}

function updateRecordsAfterMatch(matchData) {
    leagueBasedRecordsSystem.recordUserMatchStats(matchData.events || []);
}

function updateRecordsTab() {
    leagueBasedRecordsSystem.updateRecordsDisplay();
}

// 전역으로 함수들 노출
window.recordsSystem = leagueBasedRecordsSystem;
window.leagueBasedRecordsSystem = leagueBasedRecordsSystem;
window.initializeRecordsSystem = initializeRecordsSystem;
window.updateRecordsAfterMatch = updateRecordsAfterMatch;
window.updateRecordsTab = updateRecordsTab;
