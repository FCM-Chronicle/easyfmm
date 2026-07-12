// matchEngine.js
// CM-style phase-driven text match engine (legacy adapter surface preserved)
//
// COMPAT CONTRACT (do not break without updating tacticSystem.js / visibleMatch.js):
// - window.RealSoccerEngine(homeSquad, awaySquad, homeTactic, awayTactic)
// - engine.update(minute, isNewMinute) -> { ball, players, events, isCelebration, isSuspense }
// - engine.getSnapshot(), recalculateStaminaOnSub(playerOut)
// - engine.startExitAnimation(winner), updatePostMatch(), isExitAnimationDone()
// - events: goal|miss|pass|throughpass|save|block|tackle|dribble|preGoalSuspense
//   goal: { type, scorer, team, assister? }
//   miss: { type, shooter }
//   preGoalSuspense: { type, beat, totalBeats, shooter, team, intensity }

const BallState = {
    DEAD: 0,
    CONTROLLED: 1,
    IN_FLIGHT: 2,
    LOOSE: 3
};

const MatchPhase = {
    BUILD_UP: 'build_up',
    MIDFIELD: 'midfield',
    ATTACK: 'attack',
    CHANCE: 'chance',
    SUSPENSE: 'suspense',
    TURNOVER: 'turnover'
};

const TACTIC_PROFILES = {
    tikitaka:      { width: 0.82, tempo: 0.92, directness: 0.72, press: 0.78, attackRisk: 0.76, chanceRate: 0.14 },
    possession:    { width: 0.86, tempo: 0.82, directness: 0.62, press: 0.62, attackRisk: 0.68, chanceRate: 0.12 },
    lavolpiana:    { width: 0.90, tempo: 0.84, directness: 0.66, press: 0.58, attackRisk: 0.66, chanceRate: 0.13 },
    gegenpress:    { width: 0.92, tempo: 1.16, directness: 0.88, press: 1.28, attackRisk: 0.92, chanceRate: 0.16 },
    totalFootball: { width: 0.96, tempo: 1.04, directness: 0.82, press: 0.96, attackRisk: 0.88, chanceRate: 0.15 },
    counter:       { width: 1.08, tempo: 1.18, directness: 1.22, press: 0.56, attackRisk: 0.86, chanceRate: 0.17 },
    longBall:      { width: 1.05, tempo: 1.10, directness: 1.28, press: 0.50, attackRisk: 0.80, chanceRate: 0.15 },
    twoLine:       { width: 0.92, tempo: 0.92, directness: 0.86, press: 0.46, attackRisk: 0.62, chanceRate: 0.11 },
    parkBus:       { width: 0.80, tempo: 0.72, directness: 0.78, press: 0.34, attackRisk: 0.48, chanceRate: 0.09 },
    catenaccio:    { width: 0.82, tempo: 0.78, directness: 0.86, press: 0.38, attackRisk: 0.52, chanceRate: 0.08 },
    balanced:      { width: 0.92, tempo: 0.92, directness: 0.82, press: 0.62, attackRisk: 0.68, chanceRate: 0.12 }
};

const SUSPENSE_BEATS = {
    low: [
        '~~{shooter}의 슛!'
    ],
    medium: [
        '~~{shooter}의 슛!',
        '공이 골대를 향합니다!'
    ],
    high: [
        '~~{shooter}의 슛!',
        '골키퍼가 반응합니다...!'
    ]
};

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getMatchDramaConfig() {
    const defaults = { enabled: true, intensity: 'high' };
    if (typeof gameData === 'undefined') return defaults;
    if (gameData.matchDrama) {
        return {
            enabled: gameData.matchDrama.enabled !== false,
            intensity: gameData.matchDrama.intensity || 'high'
        };
    }
    if (gameData.settings && gameData.settings.immersionMode === false) {
        return { enabled: false, intensity: 'medium' };
    }
    return defaults;
}

class SimBall {
    constructor() {
        this.x = 50;
        this.y = 50;
        this.z = 0;
        this.state = BallState.CONTROLLED;
        this.owner = null;
    }
}

class SimPlayer {
    constructor(data, teamId, role, lineStats, teamMorale, tacticMultiplier) {
        this.id = data.name;
        this.name = data.name;
        this.position = data.position;
        this.rating = data.rating;
        this.teamId = teamId;
        this.role = role;
        this.x = 0;
        this.y = 0;
        this.baseX = 0;
        this.baseY = 0;
        this.stamina = (data.condition !== undefined) ? data.condition : 100;
        this.stats = this.calcStats(data, role, lineStats, teamMorale, tacticMultiplier);
    }

    calcStats(playerData, role, lineStats, teamMorale, tacticMultiplier) {
        if (!lineStats || !lineStats.attack) {
            const r = playerData.rating;
            return { passing: r, shooting: r, defense: r, speed: r, decision: r, physical: r };
        }
        const moraleFactor = 1 + ((teamMorale - 50) * 0.0005);
        let line;
        if (playerData.position === 'FW') line = 'attack';
        else if (playerData.position === 'MF') line = 'midfield';
        else line = 'defense';

        const baseStats = lineStats[line].stats;
        const finalStats = {};
        const statMapping = {
            passing: 'technique', shooting: 'attack', defense: 'defense',
            speed: 'speed', decision: 'mentality', physical: 'physical'
        };

        for (const [simStat, dnaStat] of Object.entries(statMapping)) {
            let val = TacticsManager.calculateFinalPower(baseStats[dnaStat] || playerData.rating, role, dnaStat);
            val = val * moraleFactor * tacticMultiplier;
            finalStats[simStat] = Math.round(val);
        }
        return finalStats;
    }
}

class RealSoccerEngine {
    constructor(homeSquad, awaySquad, homeTactic, awayTactic) {
        this.players = [];
        this.ball = new SimBall();
        this.matchTime = 0;
        this.eventsQueue = [];
        this.celebrationTimer = 0;
        this.lastScorerTeam = null;
        this.homeScore = 0;
        this.awayScore = 0;
        this.userStats = null;
        this.aiStats = null;
        this.teamTactics = { home: homeTactic, away: awayTactic };
        this.teamStrength = { home: 70, away: 70 };

        this.phase = MatchPhase.BUILD_UP;
        this.possessionTeam = Math.random() < 0.5 ? 'home' : 'away';
        this.attackDepth = 35;
        this.carrier = null;
        this.assister = null;
        this.defender = null;
        this.goalkeeper = null;
        this.shooter = null;

        this.suspenseTicksRemaining = 0;
        this.suspenseBeatIndex = 0;
        this.suspenseTotalBeats = 0;
        this.pendingResolution = null;
        this.isSuspenseActive = false;

        this.exitAnimActive = false;
        this.exitAnimTicks = 0;
        this.exitAnimDone = false;

        this.initTeam(homeSquad, 'home', homeTactic);
        this.initTeam(awaySquad, 'away', awayTactic);
        this.teamStrength.home = this.calcTeamStrength(homeSquad);
        this.teamStrength.away = this.calcTeamStrength(awaySquad);
        this.pickPhaseActors();
        this.resetPositions(this.possessionTeam);
        this.syncBallToCarrier();
    }

    calcTeamStrength(squad) {
        const all = [squad.gk, ...squad.df, ...squad.mf, ...squad.fw].filter(Boolean);
        if (!all.length) return 70;
        return all.reduce((s, p) => s + p.rating, 0) / all.length;
    }

    generateAIStats(squad) {
        const aiStats = { attack: { stats: {} }, midfield: { stats: {} }, defense: { stats: {} } };
        const calcAvg = (players) => players.length > 0
            ? Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length) : 70;

        const lines = {
            attack: calcAvg(squad.fw.filter(p => p)),
            midfield: calcAvg(squad.mf.filter(p => p)),
            defense: calcAvg([...squad.df.filter(p => p), squad.gk].filter(p => p))
        };

        for (const [line, ovr] of Object.entries(lines)) {
            const totalPoints = ovr * 6;
            const baseVal = Math.floor(totalPoints / 6);
            let rem = totalPoints % 6;
            ['attack', 'speed', 'technique', 'physical', 'defense', 'mentality'].forEach(k => {
                aiStats[line].stats[k] = baseVal + (rem > 0 ? 1 : 0);
                if (rem > 0) rem--;
            });
        }
        return aiStats;
    }

    getBestRoleForTactic(tactic, position, index) {
        if (position === 'GK') return 'GK';
        const roleMap = {
            tikitaka:      { FW: ['F9', 'DLF'], MF: ['DLP', 'AP'], DF: ['BPD', 'IWB'] },
            possession:    { FW: ['DLF', 'CF'], MF: ['DLP', 'AP'], DF: ['BPD', 'WB'] },
            lavolpiana:    { FW: ['F9', 'W'], MF: ['DLP', 'REG'], DF: ['BPD', 'IWB'] },
            gegenpress:    { FW: ['PF', 'AF'], MF: ['BBM', 'BWM'], DF: ['CD', 'CWB'] },
            totalFootball: { FW: ['CF', 'F9'], MF: ['BBM', 'MEZ'], DF: ['BPD', 'CWB'] },
            counter:       { FW: ['AF', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'FB'] },
            longBall:      { FW: ['TM', 'AF'], MF: ['BWM', 'CM'], DF: ['NCB', 'CD'] },
            twoLine:       { FW: ['AF', 'P'], MF: ['BWM', 'CAR'], DF: ['CD', 'FB'] },
            parkBus:       { FW: ['P', 'TM'], MF: ['BWM', 'DLP'], DF: ['NCB', 'CD'] },
            catenaccio:    { FW: ['TM', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'LIB'] }
        };
        const defaultRoles = { FW: ['AF', 'CF'], MF: ['BBM', 'AP'], DF: ['CD', 'FB'] };
        const selectedMap = roleMap[tactic] || defaultRoles;
        const candidates = selectedMap[position] || defaultRoles[position];
        return candidates[index % candidates.length];
    }

    initTeam(squad, teamId, tactic) {
        const tacticMultiplier = tactic === 'balanced' ? 0.85 : 1.0;
        const isUserTeam = (teamId === 'home' && gameData.isHomeGame) || (teamId === 'away' && !gameData.isHomeGame);

        let lineStats;
        let teamMorale = 50;
        if (isUserTeam) {
            lineStats = gameData.lineStats;
            this.userStats = lineStats;
            teamMorale = gameData.teamMorale || 50;
        } else {
            lineStats = this.aiStats || this.generateAIStats(squad);
            this.aiStats = lineStats;
            teamMorale = 60 + Math.floor(Math.random() * 31);
        }

        const setupLine = (list, baseX) => {
            const height = 100;
            list.forEach((p, i) => {
                if (!p) return;
                const role = (gameData.playerRoles && gameData.playerRoles[p.name])
                    ? gameData.playerRoles[p.name]
                    : this.getBestRoleForTactic(tactic, p.position, i);
                const simP = new SimPlayer(p, teamId, role, lineStats, teamMorale, tacticMultiplier);
                simP.baseX = baseX;
                simP.baseY = (height / (list.length + 1)) * (i + 1);
                simP.x = simP.baseX;
                simP.y = simP.baseY;
                this.players.push(simP);
            });
        };

        if (teamId === 'home') {
            if (squad.gk) setupLine([squad.gk], 5);
            setupLine(squad.df, 20);
            setupLine(squad.mf, 45);
            setupLine(squad.fw, 80);
        } else {
            if (squad.gk) setupLine([squad.gk], 95);
            setupLine(squad.df, 80);
            setupLine(squad.mf, 55);
            setupLine(squad.fw, 20);
        }
    }

    getTeamTactic(teamId) {
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            if (teamId === userSide && gameData.currentTactic) return gameData.currentTactic;
        }
        return this.teamTactics?.[teamId] || 'balanced';
    }

    getCustomSettings(teamId) {
        const cfg = { side: 'all', passing: 'short', tendency: 'balanced', width: 'middle', press: 'middle' };
        if (typeof gameData === 'undefined' || !gameData.deepTactics) return cfg;
        const dt = gameData.deepTactics;
        const userSide = gameData.isHomeGame ? 'home' : 'away';
        if (teamId !== userSide) return cfg;
        cfg.side = dt.attackingSide || 'all';
        cfg.passing = dt.passStyle || 'short';
        cfg.tendency = dt.teamTendency || 'balanced';
        cfg.width = dt.teamWidth || 'middle';
        cfg.press = dt.pressingStrength || 'middle';
        return cfg;
    }

    getTacticProfile(teamId) {
        const tactic = this.getTeamTactic(teamId);
        const base = { ...(TACTIC_PROFILES[tactic] || TACTIC_PROFILES.balanced) };
        const cfg = this.getCustomSettings(teamId);
        if (cfg.tendency === 'offensive') {
            base.attackRisk = Math.min(0.95, base.attackRisk + 0.12);
            base.tempo = Math.min(1.25, base.tempo + 0.08);
            base.chanceRate = Math.min(0.22, base.chanceRate + 0.03);
        } else if (cfg.tendency === 'defensive') {
            base.attackRisk = Math.max(0.35, base.attackRisk - 0.15);
            base.tempo = Math.max(0.60, base.tempo - 0.06);
            base.chanceRate = Math.max(0.06, base.chanceRate - 0.02);
        }
        if (cfg.passing === 'direct' || cfg.passing === 'long') base.directness = Math.min(1.3, base.directness + 0.1);
        if (cfg.press === 'high') base.press = Math.min(1.3, base.press + 0.15);
        return base;
    }

    getPlayersByTeam(teamId, position) {
        return this.players.filter(p => p.teamId === teamId && (!position || p.position === position));
    }

    pickPhaseActors() {
        const team = this.possessionTeam;
        const opp = team === 'home' ? 'away' : 'home';
        const fw = this.getPlayersByTeam(team, 'FW');
        const mf = this.getPlayersByTeam(team, 'MF');
        const df = this.getPlayersByTeam(opp, 'DF');
        const gk = this.getPlayersByTeam(opp, 'GK');

        this.carrier = pickRandom(mf.length ? mf : fw) || pickRandom(this.getPlayersByTeam(team));
        this.assister = pickRandom(mf) || pickRandom(fw);
        this.shooter = pickRandom(fw) || this.carrier;
        this.defender = pickRandom(df);
        this.goalkeeper = gk[0] || null;
        if (this.assister === this.shooter) {
            const alt = mf.find(p => p !== this.shooter) || df[0];
            this.assister = alt || null;
        }
    }

    resetPositions(kickoffTeam) {
        this.possessionTeam = kickoffTeam;
        this.phase = MatchPhase.BUILD_UP;
        this.attackDepth = kickoffTeam === 'home' ? 35 : 65;
        this.players.forEach(p => {
            p.x = p.baseX;
            p.y = p.baseY;
        });
        this.pickPhaseActors();
        this.syncBallToCarrier();
        this.ball.state = BallState.CONTROLLED;
    }

    syncBallToCarrier() {
        if (!this.carrier) return;
        this.ball.owner = this.carrier;
        this.ball.x = this.carrier.x;
        this.ball.y = this.carrier.y;
        this.ball.z = 0;
        this.ball.state = BallState.CONTROLLED;
        this.players.forEach(p => { /* hasBall computed in snapshot */ });
    }

    updateVisualPositions() {
        const isHome = this.possessionTeam === 'home';
        const depthMap = {
            [MatchPhase.BUILD_UP]: isHome ? 38 : 62,
            [MatchPhase.MIDFIELD]: isHome ? 48 : 52,
            [MatchPhase.ATTACK]: isHome ? 68 : 32,
            [MatchPhase.CHANCE]: isHome ? 82 : 18,
            [MatchPhase.SUSPENSE]: isHome ? 90 : 10
        };
        this.attackDepth = depthMap[this.phase] || this.attackDepth;

        if (this.carrier) {
            this.carrier.x = clamp(this.attackDepth + (Math.random() * 4 - 2), 5, 95);
            this.carrier.y = clamp(this.carrier.baseY + (Math.random() * 8 - 4), 8, 92);
            this.ball.x = this.carrier.x;
            this.ball.y = this.carrier.y;
        }
        if (this.shooter && this.phase === MatchPhase.SUSPENSE) {
            this.shooter.x = this.attackDepth;
            this.shooter.y = 50 + (Math.random() * 10 - 5);
            this.ball.x = this.shooter.x;
            this.ball.y = this.shooter.y;
            this.ball.z = 1.5;
            this.ball.state = BallState.IN_FLIGHT;
        }
    }

    getAttackModifier(teamId) {
        const profile = this.getTacticProfile(teamId);
        const str = this.teamStrength[teamId] || 70;
        const opp = teamId === 'home' ? 'away' : 'home';
        const oppStr = this.teamStrength[opp] || 70;
        const diff = (str - oppStr) / 100;
        return profile.attackRisk * (1 + diff * 0.35);
    }

    losePossession(reasonEvent) {
        if (reasonEvent) this.eventsQueue.push(reasonEvent);
        this.possessionTeam = this.possessionTeam === 'home' ? 'away' : 'home';
        this.phase = MatchPhase.BUILD_UP;
        this.attackDepth = this.possessionTeam === 'home' ? 35 : 65;
        this.pickPhaseActors();
        this.syncBallToCarrier();
    }

    startSuspense(resolution) {
        const drama = getMatchDramaConfig();
        const intensity = drama.enabled ? drama.intensity : 'low';
        const beats = SUSPENSE_BEATS[intensity] || SUSPENSE_BEATS.medium;
        this.pendingResolution = resolution;
        this.suspenseTotalBeats = beats.length;
        this.suspenseBeatIndex = 0;
        this.suspenseTicksRemaining = beats.length;
        this.isSuspenseActive = true;
        this.phase = MatchPhase.SUSPENSE;
        this.emitSuspenseBeat(beats, intensity);
    }

    emitSuspenseBeat(beats, intensity) {
        const template = beats[this.suspenseBeatIndex] || beats[beats.length - 1];
        const desc = template.replace('{shooter}', this.shooter ? this.shooter.name : '선수');
        this.eventsQueue.push({
            type: 'preGoalSuspense',
            beat: this.suspenseBeatIndex + 1,
            totalBeats: this.suspenseTotalBeats,
            shooter: this.shooter ? this.shooter.name : '선수',
            team: this.possessionTeam,
            intensity,
            desc
        });
    }

    processSuspenseTick() {
        this.suspenseTicksRemaining--;
        this.suspenseBeatIndex++;
        const drama = getMatchDramaConfig();
        const intensity = drama.enabled ? drama.intensity : 'low';
        const beats = SUSPENSE_BEATS[intensity] || SUSPENSE_BEATS.medium;

        if (this.suspenseTicksRemaining > 0) {
            this.emitSuspenseBeat(beats, intensity);
            this.updateVisualPositions();
            return;
        }

        this.isSuspenseActive = false;
        if (this.pendingResolution) {
            this.eventsQueue.push(this.pendingResolution);
            if (this.pendingResolution.type === 'goal') {
                this.triggerCelebration(this.possessionTeam);
            } else {
                this.losePossession();
            }
            this.pendingResolution = null;
        }
        this.updateVisualPositions();
    }

    triggerCelebration(scoringTeam) {
        this.lastScorerTeam = scoringTeam;
        this.celebrationTimer = 8;
        this.ball.state = BallState.DEAD;
        this.ball.z = 0;
    }

    resolveChance() {
        const team = this.possessionTeam;
        const profile = this.getTacticProfile(team);
        const atkMod = this.getAttackModifier(team);
        const shooter = this.shooter || this.carrier;
        const gk = this.goalkeeper;
        const roll = Math.random();

        let goalChance = 0.22 * atkMod;
        let saveChance = 0.28;
        let blockChance = 0.14;
        let missChance = 0.36;

        if (profile.directness > 1.1) goalChance += 0.04;
        if (profile.press > 1.0) blockChance += 0.04;
        goalChance = clamp(goalChance, 0.12, 0.42);

        const total = goalChance + saveChance + blockChance + missChance;
        const nGoal = goalChance / total;
        const nSave = saveChance / total;
        const nBlock = blockChance / total;

        let resolution;
        if (roll < nGoal) {
            resolution = {
                type: 'goal',
                scorer: shooter.name,
                team,
                assister: this.assister && this.assister !== shooter ? this.assister.name : null
            };
        } else if (roll < nGoal + nSave) {
            resolution = {
                type: 'save',
                gk: gk ? gk.name : '골키퍼',
                shooter: shooter.name
            };
        } else if (roll < nGoal + nSave + nBlock) {
            resolution = {
                type: 'block',
                blocker: this.defender ? this.defender.name : '수비수',
                shooter: shooter.name
            };
        } else {
            resolution = { type: 'miss', shooter: shooter.name };
        }

        const drama = getMatchDramaConfig();
        const useSuspense = drama.enabled && resolution.type === 'goal' && Math.random() < 0.85;
        if (useSuspense) {
            this.startSuspense(resolution);
        } else if (resolution.type === 'goal') {
            this.eventsQueue.push(resolution);
            this.triggerCelebration(team);
        } else {
            this.eventsQueue.push(resolution);
            this.losePossession();
        }
    }

    advancePhase() {
        const team = this.possessionTeam;
        const opp = team === 'home' ? 'away' : 'home';
        const profile = this.getTacticProfile(team);
        const oppProfile = this.getTacticProfile(opp);
        const atkMod = this.getAttackModifier(team);
        const r = Math.random();

        // [신규] 세트피스 후 슛 확률 부스트
        const setPieceBoost = this._setPieceBoost || 0;
        if (this._setPieceBoost) this._setPieceBoost = 0; // 1회 소모

        if (this.phase === MatchPhase.BUILD_UP || this.phase === MatchPhase.MIDFIELD) {
            // --- 다양한 빌드업 이벤트 ---
            if (r < 0.18 * profile.tempo) {
                this.eventsQueue.push({
                    type: 'pass',
                    from: this.carrier ? this.carrier.name : '선수',
                    to: this.assister ? this.assister.name : '동료',
                    desc: `${this.carrier ? this.carrier.name : '선수'} → ${this.assister ? this.assister.name : '동료'} 패스`
                });
            } else if (r < 0.24) {
                // [신규] 스로인
                this.eventsQueue.push({ type: 'throwin', team, player: this.carrier ? this.carrier.name : '선수' });
            } else if (r < 0.29) {
                // [신규] 골킥
                this.eventsQueue.push({ type: 'goalkick', team: opp, gk: this.goalkeeper ? this.goalkeeper.name : '골키퍼' });
                this.losePossession();
                return;
            } else if (r < 0.33) {
                if (Math.random() < oppProfile.press * 0.22) {
                    // [신규] 파울 + 프리킥 가능성
                    if (Math.random() < 0.35) {
                        const fouler = this.defender ? this.defender.name : '수비수';
                        const fouled = this.carrier ? this.carrier.name : '선수';
                        this.eventsQueue.push({ type: 'foul', fouler, fouled, team: opp });
                        // 옐로카드 15% 확률
                        if (Math.random() < 0.15) {
                            this.eventsQueue.push({ type: 'yellowcard', player: fouler, team: opp });
                        }
                        // 프리킥
                        this.eventsQueue.push({ type: 'freekick', team, player: fouled });
                        this._setPieceBoost = 0.15; // 프리킥 후 슛 확률 증가
                        return;
                    }
                    this.losePossession({
                        type: 'tackle',
                        player: this.defender ? this.defender.name : '수비수'
                    });
                    return;
                }
            } else if (r < 0.38 && Math.random() < 0.35) {
                this.eventsQueue.push({
                    type: 'dribble',
                    player: this.carrier ? this.carrier.name : '선수'
                });
            } else if (r < 0.42) {
                // [신규] 측면 돌파
                const sideRunner = this.carrier || this.assister;
                if (sideRunner) {
                    this.eventsQueue.push({ type: 'siderun', player: sideRunner.name, team });
                }
            } else if (r < 0.46) {
                // [신규] 압박 회피
                const pressurePlayer = this.carrier;
                const presser = this.defender;
                if (pressurePlayer && presser) {
                    this.eventsQueue.push({ type: 'pressureEscape', player: pressurePlayer.name, presser: presser.name });
                }
            } else if (r < 0.49) {
                // [신규] 완벽한 패스 플레이
                this.eventsQueue.push({ type: 'perfectPass', team,
                    from: this.carrier ? this.carrier.name : '선수',
                    to: this.assister ? this.assister.name : '동료' });
            }

            // 페이즈 전환
            if (Math.random() < 0.45 * profile.tempo) {
                this.phase = MatchPhase.ATTACK;
            } else if (Math.random() < 0.12 * oppProfile.press) {
                // 압박에 의한 턴오버
                if (Math.random() < 0.2) {
                    // [신규] 압박 시 파울 → 레드카드 가능성 (매우 낮음)
                    const fouler = this.defender ? this.defender.name : '수비수';
                    this.eventsQueue.push({ type: 'foul', fouler, fouled: this.carrier ? this.carrier.name : '선수', team: opp });
                    if (Math.random() < 0.03) {
                        this.eventsQueue.push({ type: 'redcard', player: fouler, team: opp });
                    } else if (Math.random() < 0.2) {
                        this.eventsQueue.push({ type: 'yellowcard', player: fouler, team: opp });
                    }
                    return;
                }
                this.losePossession({
                    type: 'tackle',
                    player: this.defender ? this.defender.name : '수비수'
                });
            }
            return;
        }

        if (this.phase === MatchPhase.ATTACK) {
            if (Math.random() < 0.22) {
                // [신규] 측면 돌파 or 중앙 돌파 다양화
                if (Math.random() < 0.4) {
                    this.eventsQueue.push({ type: 'siderun', player: this.carrier ? this.carrier.name : '선수', team });
                } else {
                    this.eventsQueue.push({
                        type: 'dribble',
                        player: this.carrier ? this.carrier.name : '선수',
                        desc: `${this.carrier ? this.carrier.name : '선수'}가 수비를 뚫고 전진합니다!`
                    });
                }
            } else if (Math.random() < 0.35 * profile.directness) {
                this.eventsQueue.push({
                    type: 'throughpass',
                    from: this.assister ? this.assister.name : this.carrier.name,
                    to: this.shooter ? this.shooter.name : '공격수'
                });
            } else if (Math.random() < 0.15) {
                // [신규] 크로스
                this.eventsQueue.push({ type: 'cross', player: this.carrier ? this.carrier.name : '선수', target: this.shooter ? this.shooter.name : '공격수', team });
            } else if (Math.random() < 0.18) {
                this.eventsQueue.push({
                    type: 'pass',
                    from: this.carrier ? this.carrier.name : '선수',
                    to: this.shooter ? this.shooter.name : '공격수',
                    desc: `${this.carrier ? this.carrier.name : '선수'}가 공격 지역으로 공을 전개합니다.`
                });
            } else if (Math.random() < 0.12) {
                // [신규] 완벽한 패스 플레이 (공격 구간)
                this.eventsQueue.push({ type: 'perfectPass', team,
                    from: this.assister ? this.assister.name : '선수',
                    to: this.shooter ? this.shooter.name : '공격수' });
            }

            // [신규] 공격 중 파울 → 프리킥/코너 분기
            if (Math.random() < 0.08) {
                const fouler = this.defender ? this.defender.name : '수비수';
                const fouled = this.carrier ? this.carrier.name : '선수';
                this.eventsQueue.push({ type: 'foul', fouler, fouled, team: opp });
                if (Math.random() < 0.18) {
                    this.eventsQueue.push({ type: 'yellowcard', player: fouler, team: opp });
                }
                // 코너 40%, 프리킥 60%
                if (Math.random() < 0.4) {
                    this.eventsQueue.push({ type: 'corner', team, player: this.carrier ? this.carrier.name : '선수' });
                    this._setPieceBoost = 0.2;
                } else {
                    this.eventsQueue.push({ type: 'freekick', team, player: fouled });
                    this._setPieceBoost = 0.15;
                }
                return;
            }

            const chanceThreshold = clamp((profile.chanceRate + setPieceBoost) * atkMod, 0.08, 0.35);
            if (Math.random() < chanceThreshold) {
                this.phase = MatchPhase.CHANCE;
            } else if (Math.random() < 0.2 * oppProfile.press) {
                this.losePossession({
                    type: 'tackle',
                    player: this.defender ? this.defender.name : '수비수'
                });
            } else if (Math.random() < 0.1) {
                // [신규] 코너킥으로 전환
                this.eventsQueue.push({ type: 'corner', team, player: this.carrier ? this.carrier.name : '선수' });
                this._setPieceBoost = 0.2;
            } else if (Math.random() < 0.15) {
                this.phase = MatchPhase.MIDFIELD;
            }
            return;
        }

        if (this.phase === MatchPhase.CHANCE) {
            if (Math.random() < 0.2) {
                this.eventsQueue.push({
                    type: 'dribble',
                    player: this.shooter ? this.shooter.name : '공격수',
                    desc: `${this.shooter ? this.shooter.name : '공격수'}! 결정적인 돌파를 시도합니다!`
                });
            }
            this.resolveChance();
        }
    }

    consumeStamina() {
        const rates = { FW: 0.6, MF: 0.7, DF: 0.4, GK: 0.1 };
        this.players.forEach(p => {
            const rate = rates[p.position] || 0.5;
            p.stamina = Math.max(0, p.stamina - (rate * (0.8 + Math.random() * 0.4)));
        });
    }

    recalculateStaminaOnSub(playerOut) {
        const userSide = gameData.isHomeGame ? 'home' : 'away';
        const lineX = { GK: 5, DF: 20, MF: 45, FW: 80 };
        const targetX = userSide === 'away'
            ? { GK: 95, DF: 80, MF: 55, FW: 20 }[playerOut.position] || 50
            : lineX[playerOut.position] || 50;
        const simP = this.players.find(p =>
            p.teamId === userSide &&
            p.position === playerOut.position &&
            Math.abs(p.baseX - targetX) < 8
        );
        if (simP) simP.stamina = 100;
    }

    startExitAnimation(winner) {
        this.exitAnimActive = true;
        this.exitAnimTicks = 0;
        this.exitAnimDone = false;
        this.exitWinner = winner;
    }

    updatePostMatch() {
        if (!this.exitAnimActive) return this.getSnapshot();
        this.exitAnimTicks++;
        const dir = this.exitWinner === 'home' ? 1 : (this.exitWinner === 'away' ? -1 : 0);
        this.players.forEach((p, i) => {
            p.x = clamp(p.x + dir * 0.8 + (i % 3) * 0.1, 0, 100);
            p.y = clamp(p.y + ((i % 2) ? 0.3 : -0.3), 5, 95);
        });
        if (this.exitAnimTicks >= 45) this.exitAnimDone = true;
        return this.getSnapshot();
    }

    isExitAnimationDone() {
        return this.exitAnimDone;
    }

    update(minute, isNewMinute) {
        this.eventsQueue = [];
        this.matchTime = minute;

        if (this.exitAnimActive && !this.exitAnimDone) {
            return this.updatePostMatch();
        }

        if (this.celebrationTimer > 0) {
            this.celebrationTimer--;
            if (this.shooter) {
                this.shooter.x = this.possessionTeam === 'home' ? 88 : 12;
                this.shooter.y = 50;
            }
            if (this.celebrationTimer <= 0) {
                const nextKickoff = this.lastScorerTeam === 'home' ? 'away' : 'home';
                this.resetPositions(nextKickoff);
            }
            return this.getSnapshot();
        }

        if (isNewMinute) this.consumeStamina();

        if (this.suspenseTicksRemaining > 0) {
            this.processSuspenseTick();
            return this.getSnapshot();
        }

        this.advancePhase();
        this.updateVisualPositions();
        return this.getSnapshot();
    }

    getSnapshot() {
        return {
            ball: {
                x: this.ball.x,
                y: this.ball.y,
                z: this.ball.z,
                state: this.ball.state
            },
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                x: p.x,
                y: p.y,
                teamId: p.teamId,
                hasBall: this.ball.owner === p,
                stamina: p.stamina
            })),
            events: [...this.eventsQueue],
            isCelebration: this.celebrationTimer > 0,
            isSuspense: this.isSuspenseActive || this.suspenseTicksRemaining > 0,
            phase: this.phase,
            possessionTeam: this.possessionTeam
        };
    }
}

window.RealSoccerEngine = RealSoccerEngine;

window.DeepTacticManager = {
    init() {
        if (!gameData.deepTactics) {
            gameData.deepTactics = {
                attackingSide: 'all',
                passStyle: 'short',
                teamTendency: 'balanced',
                teamWidth: 'middle',
                pressingStrength: 'middle'
            };
        }
        this.renderUI();
    },
    renderUI() {
        const container = document.getElementById('deepTacticsContainer');
        if (!container) {
            const tacticsTab = document.getElementById('tactics');
            if (!tacticsTab) return;
            const nc = document.createElement('div');
            nc.id = 'deepTacticsContainer';
            nc.style.cssText = 'margin-top:20px;padding:20px;background:rgba(0,0,0,0.4);border-radius:15px;border:1px solid rgba(255,255,255,0.1);';
            tacticsTab.appendChild(nc);
        }
        const el = document.getElementById('deepTacticsContainer');
        const dt = gameData.deepTactics;
        el.innerHTML = `
            <h3 style="color:#ffd700;margin-top:0;margin-bottom:18px;">세부 전술 지시</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div>
                    <label style="display:block;margin-bottom:4px;font-size:0.85rem;color:#aaa;">공격 방향</label>
                    <select id="dt-attackingSide" style="width:100%;padding:9px;background:#222;color:white;border:1px solid #444;border-radius:5px;">
                        <option value="all" ${dt.attackingSide==='all'?'selected':''}>전체</option>
                        <option value="middle" ${dt.attackingSide==='middle'?'selected':''}>중앙</option>
                        <option value="left" ${dt.attackingSide==='left'?'selected':''}>좌측</option>
                        <option value="right" ${dt.attackingSide==='right'?'selected':''}>우측</option>
                    </select>
                </div>
                <div>
                    <label style="display:block;margin-bottom:4px;font-size:0.85rem;color:#aaa;">패스 스타일</label>
                    <select id="dt-passStyle" style="width:100%;padding:9px;background:#222;color:white;border:1px solid #444;border-radius:5px;">
                        <option value="short" ${dt.passStyle==='short'?'selected':''}>짧은 패스</option>
                        <option value="long" ${dt.passStyle==='long'?'selected':''}>긴 패스</option>
                        <option value="direct" ${dt.passStyle==='direct'?'selected':''}>직접적인 패스</option>
                    </select>
                </div>
                <div>
                    <label style="display:block;margin-bottom:4px;font-size:0.85rem;color:#aaa;">팀 성향</label>
                    <select id="dt-teamTendency" style="width:100%;padding:9px;background:#222;color:white;border:1px solid #444;border-radius:5px;">
                        <option value="defensive" ${dt.teamTendency==='defensive'?'selected':''}>수비적</option>
                        <option value="balanced" ${dt.teamTendency==='balanced'?'selected':''}>균형</option>
                        <option value="offensive" ${dt.teamTendency==='offensive'?'selected':''}>공격적</option>
                    </select>
                </div>
                <div>
                    <label style="display:block;margin-bottom:4px;font-size:0.85rem;color:#aaa;">팀 너비</label>
                    <select id="dt-teamWidth" style="width:100%;padding:9px;background:#222;color:white;border:1px solid #444;border-radius:5px;">
                        <option value="narrow" ${dt.teamWidth==='narrow'?'selected':''}>좁게</option>
                        <option value="middle" ${dt.teamWidth==='middle'?'selected':''}>보통</option>
                        <option value="wide" ${dt.teamWidth==='wide'?'selected':''}>넓게</option>
                    </select>
                </div>
                <div style="grid-column:1/-1;">
                    <label style="display:block;margin-bottom:4px;font-size:0.85rem;color:#aaa;">압박 강도</label>
                    <select id="dt-pressingStrength" style="width:100%;padding:9px;background:#222;color:white;border:1px solid #444;border-radius:5px;">
                        <option value="low" ${dt.pressingStrength==='low'?'selected':''}>약하게</option>
                        <option value="middle" ${dt.pressingStrength==='middle'?'selected':''}>보통</option>
                        <option value="high" ${dt.pressingStrength==='high'?'selected':''}>강하게</option>
                    </select>
                </div>
            </div>
            <div style="margin-top:14px;color:#888;font-size:0.78rem;">
                * 세부 전술은 공격 전개, 찬스 생성, 골 직전 연출 확률에 실시간으로 영향을 줍니다.
            </div>`;
        document.getElementById('dt-attackingSide').onchange = (e) => { dt.attackingSide = e.target.value; if (window.triggerAutoSave) window.triggerAutoSave(); };
        document.getElementById('dt-passStyle').onchange = (e) => { dt.passStyle = e.target.value; if (window.triggerAutoSave) window.triggerAutoSave(); };
        document.getElementById('dt-teamTendency').onchange = (e) => { dt.teamTendency = e.target.value; if (window.triggerAutoSave) window.triggerAutoSave(); };
        document.getElementById('dt-teamWidth').onchange = (e) => { dt.teamWidth = e.target.value; if (window.triggerAutoSave) window.triggerAutoSave(); };
        document.getElementById('dt-pressingStrength').onchange = (e) => { dt.pressingStrength = e.target.value; if (window.triggerAutoSave) window.triggerAutoSave(); };
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const tacticsBtn = document.querySelector('[data-tab="tactics"]');
    if (tacticsBtn) {
        tacticsBtn.addEventListener('click', () => setTimeout(() => DeepTacticManager.init(), 100));
    }
});

window.getMatchDramaConfig = getMatchDramaConfig;
