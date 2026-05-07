// deepenTactic.js
// [PART 1] 기존 UI 관리자 (DeepTacticManager) - 유지
const DeepTacticManager = {
    init() {
        if (!gameData.deepTactics) {
            gameData.deepTactics = {
                attackFocus: 'mixed',
                passStyle: { shortRatio: 7, longRatio: 3 },
                pressIntensity: 'mid',
                defensiveLine: 'standard'
            };
        }
        this.renderUI();
    },
    renderUI() {
        // ... (기존 UI 코드 유지 - 아래는 간략화) ...
        const container = document.getElementById('deepTacticsContainer');
        if (!container) {
            const tacticsTab = document.getElementById('tactics');
            if (!tacticsTab) return;
            const newContainer = document.createElement('div');
            newContainer.id = 'deepTacticsContainer';
            newContainer.style.cssText = `margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;`;
            tacticsTab.appendChild(newContainer);
        }
        const dt = gameData.deepTactics;
        const el = document.getElementById('deepTacticsContainer');
        el.innerHTML = `
            <h4 style="color: #ffd700; margin-top: 0;">⚙️ 세부 전술 설정</h4>
            <div style="margin-bottom: 10px;">
                <label>수비 라인</label>
                <select id="dt-defensiveLine" style="width:100%; padding:5px; background:#333; color:white;">
                    <option value="deep" ${dt.defensiveLine === 'deep' ? 'selected' : ''}>내림 (Deep)</option>
                    <option value="standard" ${dt.defensiveLine === 'standard' ? 'selected' : ''}>보통</option>
                    <option value="high" ${dt.defensiveLine === 'high' ? 'selected' : ''}>올림 (High)</option>
                </select>
            </div>
            <div style="color: #aaa; font-size: 0.8rem;">* 나머지는 자동 적용됩니다.</div>
        `;
        document.getElementById('dt-defensiveLine').addEventListener('change', (e) => {
            gameData.deepTactics.defensiveLine = e.target.value;
        });
    }
};

// [신규] 런 타입 정의
const RUN_TYPE = {
    STRIKER_RUN: 'striker_run',
    SUPPORT_RUN: 'support_run',
    CHANNEL_RUN: 'channel_run',
    WIDE_RUN:    'wide_run',
    UNDERLAP_RUN:'underlap_run',
    HOLD_POSITION:'hold_position',
};

// [신규] 역할별 런 타입 매핑
const ROLE_RUN_TYPE = {
    AF: RUN_TYPE.STRIKER_RUN, CF: RUN_TYPE.SUPPORT_RUN, P: RUN_TYPE.STRIKER_RUN,
    DLF: RUN_TYPE.SUPPORT_RUN, TM: RUN_TYPE.HOLD_POSITION, F9: RUN_TYPE.SUPPORT_RUN,
    PF: RUN_TYPE.CHANNEL_RUN, RD: RUN_TYPE.CHANNEL_RUN, W: RUN_TYPE.WIDE_RUN, IF: RUN_TYPE.UNDERLAP_RUN,
    WP: RUN_TYPE.SUPPORT_RUN, IW: RUN_TYPE.UNDERLAP_RUN,
    BBM: RUN_TYPE.STRIKER_RUN, MEZ: RUN_TYPE.UNDERLAP_RUN, DLP: RUN_TYPE.HOLD_POSITION,
    BWM: RUN_TYPE.HOLD_POSITION, AP: RUN_TYPE.SUPPORT_RUN, REG: RUN_TYPE.HOLD_POSITION,
    CAR: RUN_TYPE.SUPPORT_RUN, EG: RUN_TYPE.HOLD_POSITION, SS: RUN_TYPE.STRIKER_RUN,
    ANC: RUN_TYPE.HOLD_POSITION, DM: RUN_TYPE.HOLD_POSITION, SV: RUN_TYPE.STRIKER_RUN,
    BPD: RUN_TYPE.SUPPORT_RUN, CD: RUN_TYPE.HOLD_POSITION, NCB: RUN_TYPE.HOLD_POSITION,
    IWB: RUN_TYPE.UNDERLAP_RUN, CWB: RUN_TYPE.WIDE_RUN, LIB: RUN_TYPE.SUPPORT_RUN,
    FB: RUN_TYPE.HOLD_POSITION, WB: RUN_TYPE.WIDE_RUN,
    GK: RUN_TYPE.HOLD_POSITION
};

function getPosByAngle(x, y, angleDeg, dist) {
    const rad = angleDeg * (Math.PI / 180);
    return {
        x: Math.max(2, Math.min(98, x + Math.cos(rad) * dist)),
        y: Math.max(2, Math.min(98, y + Math.sin(rad) * dist))
    };
}

// =========================================================================================
// [PART 2] 리얼 사커 엔진 (RealSoccerEngine)
// =========================================================================================

const BallState = {
    LOOSE: 0,
    CONTROLLED: 1,
    IN_FLIGHT: 2,
    DEAD: 3
};

class SimBall {
    constructor() {
        this.x = 50;
        this.y = 50;
        this.z = 0;
        this.state = BallState.DEAD;
        this.owner = null;
        this.lastOwner = null;
        this.targetPos = { x: 50, y: 50 };
        this.velocity = { x: 0, y: 0 };
    }
}

class SimPlayer {
    constructor(data, teamId, role, lineStats, morale = 50, tacticMultiplier = 1.0) {
        this.id = data.name;
        this.name = data.name;
        this.position = data.position;
        this.rating = data.rating;
        this.teamId = teamId;
        this.role = role;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.baseX = 0;
        this.baseY = 0;
        this.stamina = (data.condition !== undefined) ? data.condition : 100;
        this.stats = this.mapDNAStats(data, role, lineStats, morale, tacticMultiplier);
    }

    mapDNAStats(playerData, role, lineStats, morale, tacticMultiplier) {
        if (!lineStats || !lineStats.attack) {
            return { speed: playerData.rating, passing: playerData.rating, shooting: playerData.rating, defense: playerData.rating, decision: playerData.rating };
        }

        const moraleFactor = 1 + ((morale - 50) * 0.0005);

        let line;
        if (playerData.position === 'FW') line = 'attack';
        else if (playerData.position === 'MF') line = 'midfield';
        else line = 'defense';

        const baseStats = lineStats[line].stats;

        const finalStats = {};
        const statMapping = {
            'passing': 'technique', 'shooting': 'attack', 'defense': 'defense', 'speed': 'speed', 'decision': 'mentality',
            'physical': 'physical'
        };

        for (const [simStat, dnaStat] of Object.entries(statMapping)) {
            const baseStatValue = baseStats[dnaStat] || playerData.rating;
            let statVal = TacticsManager.calculateFinalPower(baseStatValue, role, dnaStat);
            statVal = statVal * moraleFactor;
            statVal = statVal * tacticMultiplier;
            finalStats[simStat] = statVal;
        }
        
        return finalStats;
    }
}

class RealSoccerEngine {
    constructor(homeSquad, awaySquad, homeTactic = 'balanced', awayTactic = 'balanced') {
        this.players = [];
        this.ball = new SimBall();
        this.matchTime = 0;
        this.eventsQueue = [];
        this.pendingShot = null;
        this.celebrationTimer = 0;
        this.celebrationActor = null;
        this.celebrationTarget = null;
        this.celebrationType = null;
        this.lastScorerTeam = null;
        this.homeScore = 0;
        this.awayScore = 0;
        this.userStats = null;
        this.aiStats = null;
        this.lastAction = 'normal';

        this.initTeam(homeSquad, 'home', homeTactic);
        this.initTeam(awaySquad, 'away', awayTactic);
        
        this.resetPositions('home');
    }

    getEffectiveStat(player, statName) {
        let val = player.stats[statName];
        if (val === undefined) return 50;

        let factor = 1.0;
        if (player.stamina < 50) factor = 0.5;
        else if (player.stamina < 60) factor = 0.75;
        else if (player.stamina < 70) factor = 0.9;

        return val * factor;
    }

    generateAIStats(squad) {
        const aiStats = {
            attack: { stats: {} },
            midfield: { stats: {} },
            defense: { stats: {} }
        };

        const calcAvg = (players) => players.length > 0 ? Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length) : 70;

        const fwOVR = calcAvg(squad.fw.filter(p => p));
        const mfOVR = calcAvg(squad.mf.filter(p => p));
        const dfOVR = calcAvg([...squad.df.filter(p => p), squad.gk].filter(p => p));

        const lines = { attack: fwOVR, midfield: mfOVR, defense: dfOVR };

        for (const [line, ovr] of Object.entries(lines)) {
            const totalPoints = ovr * 6;
            const baseValue = Math.floor(totalPoints / 6);
            let remainder = totalPoints % 6;
            const statKeys = ['attack', 'speed', 'technique', 'physical', 'defense', 'mentality'];
            
            statKeys.forEach(key => {
                aiStats[line].stats[key] = baseValue;
                if (remainder > 0) {
                    aiStats[line].stats[key]++;
                    remainder--;
                }
            });
        }
        return aiStats;
    }

    initTeam(squad, teamId, tactic) {
        const tacticMultiplier = tactic === 'balanced' ? 0.85 : 1.0;

        const setupLine = (list, baseX) => {
            const height = 100;

            const isUserTeam = (teamId === 'home' && gameData.isHomeGame) || (teamId === 'away' && !gameData.isHomeGame);
            let lineStats;
            let teamMorale = 50;

            if (isUserTeam) {
                lineStats = gameData.lineStats;
                this.userStats = lineStats;
                teamMorale = gameData.teamMorale;
            } else {
                lineStats = this.aiStats || this.generateAIStats(squad);
                this.aiStats = lineStats;
                teamMorale = 60 + Math.floor(Math.random() * 31);
            }

            list.forEach((p, i) => {
                if (!p) return;
                
                let role = null;
                if (gameData.playerRoles && gameData.playerRoles[p.name]) {
                    role = gameData.playerRoles[p.name];
                } 
                
                if (!role) {
                    role = this.getBestRoleForTactic(tactic, p.position, i);
                }

                const simP = new SimPlayer(p, teamId, role, lineStats, teamMorale, tacticMultiplier);
                simP.currentBaseX = baseX;
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
            setupLine(squad.fw, 70);
        } else {
            if (squad.gk) setupLine([squad.gk], 95);
            setupLine(squad.df, 80);
            setupLine(squad.mf, 55);
            setupLine(squad.fw, 30);
        }
    }

    getBestRoleForTactic(tactic, position, index) {
        if (position === 'GK') return 'GK';

        const roleMap = {
            'tikitaka': { FW: ['F9', 'DLF'], MF: ['DLP', 'AP', 'MEZ'], DF: ['BPD', 'IWB'] },
            'possession': { FW: ['DLF', 'CF'], MF: ['DLP', 'AP', 'CAR'], DF: ['BPD', 'WB'] },
            'lavolpiana': { FW: ['F9', 'W'], MF: ['DLP', 'REG', 'MEZ'], DF: ['BPD', 'IWB'] },
            'gegenpress': { FW: ['PF', 'AF'], MF: ['BBM', 'BWM', 'MEZ'], DF: ['CD', 'CWB'] },
            'totalFootball': { FW: ['CF', 'F9'], MF: ['BBM', 'MEZ', 'AP'], DF: ['BPD', 'CWB', 'LIB'] },
            'counter': { FW: ['AF', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'FB'] },
            'longBall': { FW: ['TM', 'AF'], MF: ['BWM', 'CM'], DF: ['NCB', 'CD'] },
            'twoLine': { FW: ['AF', 'P'], MF: ['BWM', 'CAR'], DF: ['CD', 'FB'] },
            'parkBus': { FW: ['P', 'TM'], MF: ['BWM', 'DLP'], DF: ['NCB', 'CD'] },
            'catenaccio': { FW: ['TM', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'LIB'] }
        };

        const defaultRoles = { FW: ['AF', 'CF'], MF: ['BBM', 'AP'], DF: ['CD', 'FB'] };

        let selectedMap = roleMap[tactic];
        if (!selectedMap) selectedMap = defaultRoles;

        const candidates = selectedMap[position] || defaultRoles[position];
        return candidates[index % candidates.length];
    }

    resetPositions(kickoffTeamId = null) {
        this.ball.x = 50; this.ball.y = 50;
        this.ball.lastOwner = null;
        
        let kicker = null;
        if (kickoffTeamId) {
            kicker = this.players.find(p => p.teamId === kickoffTeamId && p.position === 'FW');
            if (!kicker) kicker = this.players.find(p => p.teamId === kickoffTeamId && p.position === 'MF');
            if (!kicker) kicker = this.players.find(p => p.teamId === kickoffTeamId);
        }

        if (kicker) {
            this.ball.state = BallState.CONTROLLED;
            this.ball.owner = kicker;
            kicker.x = 50;
            kicker.y = 50;
        } else {
            this.ball.state = BallState.LOOSE;
            this.ball.owner = null;
        }
        
        this.players.forEach(p => {
            if (p !== kicker) {
                p.y = p.baseY;
                p.vx = 0; p.vy = 0;
                
                if (p.teamId === 'home') {
                    const maxLine = p.position === 'MF' ? 40 : 48;
                    p.x = Math.min(p.baseX, maxLine);
                } else {
                    const minLine = p.position === 'MF' ? 60 : 52;
                    p.x = Math.max(p.baseX, minLine);
                }
            }
        });
    }

    update(minute, isNewMinute) {
        this.eventsQueue = [];

        if (this.ball.state === BallState.DEAD && this.celebrationTimer <= 0 && !this.pendingShot) {
            this._deadTicks = (this._deadTicks || 0) + 1;
            if (this._deadTicks >= 2) { this._deadTicks = 0; this.resetPositions(this.lastScorerTeam === 'home' ? 'away' : 'home'); }
            return this.getSnapshot();
        }
        if (this.ball.state !== BallState.DEAD) this._deadTicks = 0;

        if (this.ball.state === BallState.IN_FLIGHT) {
            const tx = this.ball.targetPos ? this.ball.targetPos.x : null;
            const ty = this.ball.targetPos ? this.ball.targetPos.y : null;
            if (tx === null || tx === undefined || isNaN(tx) || isNaN(ty)) {
                this.ball.state = BallState.LOOSE;
                this.ball.owner = null;
            }
        }

        if (this.ball.state === BallState.LOOSE && !this.pendingShot) {
            this._looseTicks = (this._looseTicks || 0) + 1;
            if (this._looseTicks >= 5) {
                this._looseTicks = 0;
                let nearest = null;
                let minDst = 999;
                this.players.forEach(p => {
                    const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    if (d < minDst) { minDst = d; nearest = p; }
                });
                if (nearest) {
                    this.ball.state = BallState.CONTROLLED;
                    this.ball.owner = nearest;
                    this.ball.x = nearest.x;
                    this.ball.y = nearest.y;
                }
            }
        } else {
            this._looseTicks = 0;
        }

        if (isNewMinute) {
            this.consumeStamina();
        }

        if (this.celebrationTimer > 0) {
            this.processCelebrationMovement();
            this.celebrationTimer--;
            if (this.celebrationTimer <= 0) {
                const nextKickoff = this.lastScorerTeam === 'home' ? 'away' : 'home';
                this.resetPositions(nextKickoff);
            }
            return this.getSnapshot();
        }

        if (this.ball.state === BallState.IN_FLIGHT) {
            const ballSpeed = 11;
            const dx = this.ball.targetPos.x - this.ball.x;
            const dy = this.ball.targetPos.y - this.ball.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= ballSpeed) {
                this.ball.x = this.ball.targetPos.x;
                this.ball.y = this.ball.targetPos.y;
                this.ball.state = BallState.LOOSE;

                if (this.pendingShot) {
                    this.handleShotResult();
                    return this.getSnapshot();
                }
            } else {
                const ratio = ballSpeed / dist;
                this.ball.x += dx * ratio;
                this.ball.y += dy * ratio;
                this.checkInterception();
            }
        }

        if (this.ball.state === BallState.LOOSE) {
            let nearest = null;
            let minDst = 999;
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < minDst) { minDst = d; nearest = p; }
            });

            if (nearest && minDst < 5) {
                const isBallInOwnHalf = (nearest.teamId === 'home' && this.ball.x < 50) ||
                                        (nearest.teamId === 'away' && this.ball.x > 50);
                const dt = gameData.deepTactics || { defensiveLine: 'standard' };
                if (dt.defensiveLine === 'deep' && isBallInOwnHalf) {
                    this.lastAction = 'counter_attack';
                } else {
                    this.lastAction = 'normal';
                }
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = nearest;
                this.ball.x = nearest.x;
                this.ball.y = nearest.y;
            }
        }

        if (this.ball.state === BallState.CONTROLLED && this.ball.owner) {
            this.processBallCarrierAI(this.ball.owner);
        }
        this.processOffBallAI();
        this.adjustDefensiveLines();

        return this.getSnapshot();
    }
    
    consumeStamina() {
        const rates = { 'FW': 0.6, 'MF': 0.7, 'DF': 0.4, 'GK': 0.1 };
        this.players.forEach(p => {
            const rate = rates[p.position] || 0.5;
            p.stamina = Math.max(0, p.stamina - (rate * (0.8 + Math.random() * 0.4)));
        });
    }

    getSnapshot() {
        return {
            ball: { x: this.ball.x, y: this.ball.y, z: this.ball.z, state: this.ball.state },
            players: this.players.map(p => ({
                id: p.id, x: p.x, y: p.y, team: p.teamId, hasBall: (this.ball.owner === p)
            })),
            events: [...this.eventsQueue],
            isCelebration: this.celebrationTimer > 0
        };
    }

    processBallCarrierAI(player) {
        const isHome = player.teamId === 'home';
        const goalX = isHome ? 100 : 0;
        const distToGoal = Math.abs(player.x - goalX);
        
        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const nearestOpp = this.findNearestDefender(player);
        const pressureDist = nearestOpp ? nearestOpp.dist : 999;
        const underPressure = pressureDist < 8;

        let shootThreshold = 30;
        if (isAI) shootThreshold = 32;

        if (distToGoal < shootThreshold) { 
            let shootChance = 0.15; 
            if (distToGoal < 20) shootChance = 0.7;
            if (distToGoal < 12) shootChance = 0.95;
            if (isAI) shootChance += 0.05;

            if (Math.random() < shootChance) {
                this.attemptShoot(player, goalX);
                return;
            }
        }

        let passProb = 0.5;
        const isBlocked = this.checkFrontalBlock(player, goalX);

        if (isBlocked) {
            // 막혀 있어도 옆이나 뒤로 패스해서 탈출 시도
            passProb = underPressure ? 0.85 : 0.55;
        } else {
            if (player.position === 'DF' || player.position === 'GK') {
                passProb = underPressure ? 0.98 : 0.4; 
            } else {
                // FW/MF: 전방 패스 우선 — 패스 확률을 높여야 공이 앞으로 전진
                passProb = 0.55;
                if (typeof gameData !== 'undefined' && gameData.currentTactic === 'tikitaka') passProb = 0.75;
                if (isAI && !isBlocked) passProb -= 0.05;
            }
        }

        let bestPassTarget = null;

        if (player.position === 'GK') {
            if (Math.random() < 0.7) {
                bestPassTarget = this.findBestPassTarget(player, 'safe');
                if (!bestPassTarget) bestPassTarget = this.findBestPassTarget(player, 'aggressive');
            } else {
                bestPassTarget = this.findBestPassTarget(player, 'aggressive');
                if (!bestPassTarget) bestPassTarget = this.findBestPassTarget(player, 'safe');
            }
            
            if (!bestPassTarget || Math.random() >= passProb) {
                this.clearBall(player);
                return;
            }
        } else {
            bestPassTarget = this.findBestPassTarget(player, 'aggressive');
            if (!bestPassTarget) bestPassTarget = this.findBestPassTarget(player, 'safe');
        }

        if (bestPassTarget && Math.random() < passProb) { 
            this.executePass(player, bestPassTarget);
            return;
        }

        const nearestDef = this.findNearestDefender(player);
        if (nearestDef && nearestDef.dist < 7) {
            if (Math.random() < 0.4) {
                this.attemptTackle(nearestDef.player, player);
                return;
            }
        }

        const moveDir = isHome ? 1 : -1;
        const effectiveSpeed = this.getEffectiveStat(player, 'speed');
        const speedFactor = effectiveSpeed / 75;
        let moveSpeed = 0.7 * Math.max(0.7, Math.min(1.4, speedFactor));
        
        let moveDist = (0.25 + Math.random() * 0.3) * speedFactor;
        if (player.position === 'DF') moveDist = (0.5 + Math.random() * 0.5); 
        if (player.position === 'MF' && !underPressure && !isBlocked) moveDist += 0.6;
        if (isAI && (player.position === 'FW' || player.position === 'MF')) moveDist *= 1.1;
        if (passProb <= 0.1 && (player.position === 'FW' || player.position === 'MF')) {
            moveDist += 1.0;
            moveSpeed = 1.5;
        }

        if (isBlocked && !underPressure) {
            player.x += moveDir * (Math.random() * 0.8);
            player.y += (Math.random() < 0.5 ? 6.5 : -6.5) + (Math.random() * 2.0);
        } else {
            player.x += moveDir * moveDist; 
            player.y += (Math.random() - 0.5) * 4;
        }

        this.ball.lastOwner = null;
        
        player.x = Math.max(5, Math.min(95, player.x));
        player.y = Math.max(2, Math.min(98, player.y));

        this.ball.x = player.x;
        this.ball.y = player.y;
        
        if (Math.random() < 0.2) {
            this.eventsQueue.push({ type: 'dribble', player: player.name });
        }
    }

    findBestPassTarget(player, mode = 'aggressive') {
        const teamates = this.players.filter(p => p.teamId === player.teamId && p !== player);
        let bestTarget = null;
        let maxScore = mode === 'aggressive' ? 10 : -50;

        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const isHome = player.teamId === 'home';
        const forwardX = isHome ? 100 : 0;

        teamates.forEach(tm => {
            const distBefore = Math.abs(player.x - forwardX);
            const distAfter = Math.abs(tm.x - forwardX);
            let forwardScore = (distBefore - distAfter); 
            
            if (mode === 'safe') {
                forwardScore *= 0.3;
            } else {
                forwardScore *= 3.0;
                if (distAfter > distBefore) forwardScore -= 40;  // 80→40: 백패스 허용도 살짝 올림
                if (isAI && forwardScore > 0) forwardScore *= 1.2;
            }

            const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
            let distScore = 0;
            if (dist < 5) distScore = -30;           // 너무 바짝 붙어있을 때만 패널티
            else if (dist < 10) distScore = 10;      // 단거리 패스도 허용
            else if (dist > 35) distScore = -(dist - 35) * 2.0;
            else distScore = 20;

            if (dist > 20 && distAfter > distBefore) distScore -= 100;
            if (player.position === 'DF' && tm.position === 'FW' && dist > 35) distScore -= 40;
            if (player.position === 'FW' && distAfter > distBefore) {
                if (tm.position === 'GK') distScore -= 500;
                else if (tm.position === 'DF' && dist > 15) distScore -= 150;
            }

            let pressureScore = 0;
            this.players.forEach(opp => {
                if (opp.teamId !== player.teamId) {
                    const d = Math.hypot(tm.x - opp.x, tm.y - opp.y);
                    if (d < 15) pressureScore -= (15 - d) * 3;
                }
            });
            if (mode === 'safe') pressureScore *= 2.0;

            let loopPenalty = 0;
            if (this.ball.lastOwner === tm) loopPenalty = mode === 'aggressive' ? 150 : 40;
            if (mode === 'aggressive' && player.position === 'MF' && tm.position === 'DF') loopPenalty += 80; 

            let positionBonus = 0;
            if (player.position === 'DF') {
                if (tm.position === 'MF') positionBonus = 5;
                else if (tm.position === 'DF') positionBonus = 3;
            }
            if (player.position === 'GK' && tm.position === 'DF') positionBonus = 5;

            let linkupBonus = 0;
            const targetBehavior = this.getRoleBehavior(tm.role);
            if (targetBehavior.comeShort && tm.position === 'FW') linkupBonus += 35;
            if (targetBehavior.attackBias > 0.2 && tm.position === 'MF') linkupBonus += 20;

            const totalScore = forwardScore + distScore + pressureScore - loopPenalty + positionBonus + linkupBonus;
            if (totalScore > maxScore) {
                maxScore = totalScore;
                bestTarget = tm;
            }
        });

        return bestTarget;
    }

    clearBall(player) {
        const isHome = player.teamId === 'home';
        const forwardDir = isHome ? 1 : -1;
        const targetX = 50 + (forwardDir * (Math.random() * 10)); 
        const targetY = 20 + Math.random() * 60;
        
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null;
        this.ball.lastOwner = player;
        this.ball.targetPos = { x: targetX, y: targetY };
        this.eventsQueue.push({ type: 'pass', from: player.name, to: '걷어내기', desc: `${player.name}, 멀리 걷어냅니다!` });
    }

    executePass(from, to) {
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.lastOwner = from;
        this.ball.owner = null;
        
        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        let accuracy = from.stats.passing;

        const forwardX = from.teamId === 'home' ? 100 : 0;
        const distToGoalFrom = Math.abs(from.x - forwardX);
        const distToGoalTo = Math.abs(to.x - forwardX);
        const isThroughPass = (distToGoalFrom - distToGoalTo > 5) && dist > 10 && distToGoalFrom < 60;
        
        const distPenalty = Math.max(0, (dist - 20) * 0.8);
        let successChance = accuracy - distPenalty;
        if (from.position === 'GK' && dist > 50) successChance -= 15;

        let eventType = 'pass';
        let eventDesc = `${from.name}, ${to.name}에게 연결!`;

        if (isThroughPass) {
            eventType = 'throughpass';
            successChance -= 20; 
            if (accuracy > 75) successChance += (accuracy - 75) * 1.5; 
            eventDesc = `⚡ ${from.name}, ${to.name}에게 결정적인 스루패스!`;
        }

        const roll = Math.random() * 100;
        const isBadPass = roll > successChance;

        if (isBadPass) {
            const errorMargin = dist * 0.25;
            const angle = Math.random() * Math.PI * 2;
            const errorDist = Math.random() * errorMargin + 5;
            const targetX = Math.max(2, Math.min(98, to.x + Math.cos(angle) * errorDist));
            const targetY = Math.max(2, Math.min(98, to.y + Math.sin(angle) * errorDist));
            this.ball.targetPos = { x: targetX, y: targetY };
            const failDesc = isThroughPass ? `${from.name}의 스루패스가 차단됩니다.` : `${from.name}, 패스 미스!`;
            this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: failDesc });
        } else {
            this.ball.targetPos = { x: to.x, y: to.y };
            this.eventsQueue.push({ type: eventType, from: from.name, to: to.name, desc: eventDesc });
        }
    }

    attemptShoot(shooter, goalX) {
        const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
        const gk = this.players.find(p => p.teamId === opponentTeamId && p.position === 'GK');
        const gkRating = gk ? gk.stats.defense : 60;

        const dist = Math.abs(shooter.x - goalX);
        const distFactor = Math.max(0.7, 1.3 - (dist / 40));

        const distY = Math.abs(shooter.y - 50);
        let angleFactor = 1.0;
        if (distY > 8) {
            const angle = Math.atan2(distY, Math.max(1, dist)); 
            if (angle > 1.2) angleFactor = 0.15;
            else if (angle > 0.9) angleFactor = 0.4;
            else if (angle > 0.6) angleFactor = 0.7;
            else angleFactor = 0.9;
        }

        const effectiveShooting = this.getEffectiveStat(shooter, 'shooting');
        const shotPower = effectiveShooting * (0.8 + Math.random() * 0.4) * distFactor * angleFactor;
        const savePower = gkRating * (0.8 + Math.random() * 0.5) + 5; 
        const powerDiff = shotPower - savePower;
        
        let goalChance = 0.12 + (powerDiff * 0.0025);
        goalChance = Math.max(0.01, Math.min(0.55, goalChance));
        if (this.lastAction === 'counter_attack') goalChance *= 1.2;

        let isGoal = Math.random() < goalChance;
        
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null;
        this.ball.targetPos = { x: goalX, y: 45 + Math.random() * 10 };
        this.pendingShot = { isGoal, shooter, goalX };
    }

    handleShotResult() {
        const { isGoal, shooter, goalX } = this.pendingShot;
        this.pendingShot = null;

        if (isGoal) {
            if (shooter.teamId === 'home') this.homeScore++;
            else this.awayScore++;

            const isHome = shooter.teamId === 'home';
            const myScore = isHome ? this.homeScore : this.awayScore;
            const oppScore = isHome ? this.awayScore : this.homeScore;
            
            let assister = null;
            if (this.ball.lastOwner && this.ball.lastOwner.teamId === shooter.teamId && this.ball.lastOwner.name !== shooter.name) {
                assister = this.ball.lastOwner.name;
            }
            
            this.celebrationType = (myScore < oppScore) ? 'quick_restart' : 'celebrate';
            this.celebrationActor = shooter;
            
            if (this.celebrationType === 'quick_restart') {
                this.celebrationTarget = { x: 50, y: 50 };
            } else {
                const goalX = isHome ? 100 : 0;
                const cornerY = (shooter.y < 50) ? 0 : 100; 
                this.celebrationTarget = { x: goalX, y: cornerY };
            }

            this.eventsQueue.push({ type: 'goal', scorer: shooter.name, team: shooter.teamId, assister });
            this.lastScorerTeam = shooter.teamId;
            this.celebrationTimer = 40;
            this.ball.state = BallState.DEAD;
            this.ball.lastOwner = null;
        } else {
            const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
            const isHomeAttacking = shooter.teamId === 'home';

            const defenders = this.players.filter(p => 
                p.teamId === opponentTeamId && p.position !== 'GK' &&
                Math.abs(p.x - shooter.x) < 15 && Math.abs(p.y - shooter.y) < 5
            );
            const blockingDefenders = defenders.filter(p => isHomeAttacking ? (p.x > shooter.x) : (p.x < shooter.x));

            if (blockingDefenders.length > 0 && Math.random() < 0.35) {
                const blocker = blockingDefenders[0];
                this.eventsQueue.push({ type: 'block', shooter: shooter.name, blocker: blocker.name, desc: `🛡️ ${blocker.name}, 몸을 날려 슈팅을 막아냅니다!` });
                this.ball.state = BallState.LOOSE;
                this.ball.owner = null;
                this.ball.x = blocker.x + (isHomeAttacking ? -5 : 5);
                this.ball.y = blocker.y + (Math.random() - 0.5) * 15;
                return;
            }

            const enemyGk = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');
            if (enemyGk) {
                if (Math.random() < 0.5) {
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: enemyGk.name, desc: `🧤 ${enemyGk.name}, 슈팅을 펀칭으로 쳐냅니다!` });
                    this.ball.state = BallState.LOOSE;
                    this.ball.owner = null;
                    this.ball.x = enemyGk.x + (isHomeAttacking ? -10 : 10);
                    this.ball.y = enemyGk.y + (Math.random() - 0.5) * 30;
                } else {
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: enemyGk.name, desc: `🧤 ${enemyGk.name}, 안정적으로 공을 잡아냅니다.` });
                    this.ball.state = BallState.CONTROLLED;
                    this.ball.owner = enemyGk;
                    this.ball.x = enemyGk.x;
                    this.ball.y = enemyGk.y;
                }
            } else {
                this.eventsQueue.push({ type: 'miss', shooter: shooter.name, desc: `🥅 ${shooter.name}의 슈팅이 골문을 벗어납니다.` });
                this.ball.state = BallState.LOOSE;
                this.ball.x = goalX === 0 ? 5 : 95;
                this.ball.y = 50;
            }
        }
    }

    processCelebrationMovement() {
        if (!this.celebrationActor || !this.celebrationTarget) return;

        const p = this.celebrationActor;
        const target = this.celebrationTarget;
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 1) {
            const speed = 1.2;
            p.x += (dx / dist) * speed;
            p.y += (dy / dist) * speed;
        }

        if (this.celebrationType === 'quick_restart') {
            this.ball.x = p.x;
            this.ball.y = p.y;
        }

        this.players.forEach(tm => {
            if (tm.teamId === p.teamId && tm !== p) {
                if (this.celebrationType === 'celebrate') {
                    const ddx = p.x - tm.x;
                    const ddy = p.y - tm.y;
                    const d = Math.hypot(ddx, ddy);
                    if (d > 3) { tm.x += (ddx / d) * 0.9; tm.y += (ddy / d) * 0.9; }
                } else {
                    const ddx = tm.baseX - tm.x;
                    const ddy = tm.baseY - tm.y;
                    const d = Math.hypot(ddx, ddy);
                    if (d > 1) { tm.x += (ddx / d) * 1.0; tm.y += (ddy / d) * 1.0; }
                }
            }
        });
    }

    processOffBallAI() {
        const attackingTeam = this.ball.owner ? this.ball.owner.teamId : null;
        let isChasingLooseBall = false;
        
        let isAttackingAI = false;
        if (attackingTeam && typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAttackingAI = (attackingTeam !== userSide);
        }

        const isLooseBall = !this.ball.owner && this.ball.state === BallState.LOOSE;
        
        let presser = null;
        if (this.ball.owner) {
            let minD = 999;
            this.players.forEach(p => {
                if (p.teamId !== attackingTeam) {
                    const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    if (d < minD) { minD = d; presser = p; }
                }
            });
        }

        let nearestHome = null;
        let nearestAway = null;
        if (isLooseBall) {
             let minDHome = 999;
             let minDAway = 999;
             this.players.forEach(p => {
                 const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                 if (p.teamId === 'home') {
                     if (d < minDHome) { minDHome = d; nearestHome = p; }
                 } else {
                     if (d < minDAway) { minDAway = d; nearestAway = p; }
                 }
             });
        }

        this.players.forEach(p => {
            if (p === this.ball.owner) return;

            const dt = gameData.deepTactics || { pressIntensity: 'mid', defensiveLine: 'standard' };
            const behavior = this.getRoleBehavior(p.role);

            let targetX = p.x;
            let targetY = p.y;
            
            let pressDetectDist = 8;
            let sprintBonus = 1.0;
            if (dt.pressIntensity === 'high') {
                pressDetectDist = 20;
                sprintBonus = 1.2;
            } else if (dt.pressIntensity === 'low') {
                pressDetectDist = 4;
            }

            const effectiveSpeed = this.getEffectiveStat(p, 'speed');
            const speedFactor = effectiveSpeed / 75;
            let moveSpeed = 1.0 * Math.max(0.7, Math.min(1.4, speedFactor));

            // ─── GK: 항상 골라인 근처 고정 ───────────────────────────────────
            if (p.position === 'GK') {
                const isHomeGK = p.teamId === 'home';
                const goalLineX  = isHomeGK ? 3  : 97;
                const maxAdvance = isHomeGK ? 12 : 88;

                targetX = isHomeGK
                    ? Math.max(goalLineX, Math.min(maxAdvance, p.x + (this.ball.x - p.x) * 0.05))
                    : Math.min(goalLineX, Math.max(maxAdvance, p.x + (this.ball.x - p.x) * 0.05));

                targetY = 50 + (this.ball.y - 50) * 0.25;
                targetY = Math.max(38, Math.min(62, targetY));

                const accelX = (targetX - p.x) * 0.15;
                const accelY = (targetY - p.y) * 0.15;
                p.vx = (p.vx + accelX) * 0.7;
                p.vy = (p.vy + accelY) * 0.7;
                p.x += p.vx;
                p.y += p.vy;
                return;
            }

            // ─── 루즈볼 추적 ────────────────────────────────────────────────
            if (isLooseBall) {
                const isNearest = (p === nearestHome || p === nearestAway);
                if (isNearest) {
                    targetX = this.ball.x;
                    targetY = this.ball.y;
                    moveSpeed = 1.1;
                    isChasingLooseBall = true;
                }
            }

            const isHome = p.teamId === 'home';
            const isTeamAttacking = attackingTeam ? (p.teamId === attackingTeam) : (isHome ? this.ball.x > 50 : this.ball.x < 50);

            if (isTeamAttacking) {
                const forwardDir = isHome ? 1 : -1;
                
                const isLastPasser = (p === this.ball.lastOwner);
                const isRearDefender = p.position === 'DF' && ['CD', 'BPD', 'NCB'].includes(p.role);

                if (isLastPasser && !isRearDefender) {
                    targetX = p.x + (forwardDir * 15);
                    targetY = p.y + (this.ball.y - p.y) * 0.3;
                    moveSpeed = 0.8;
                } 
                else if (p.position === 'FW') {
                    let nearestDefender = null;
                    let minDist = 999;
                    this.players.forEach(opp => {
                        if (opp.teamId !== p.teamId && (opp.position === 'DF' || opp.position === 'GK')) {
                            const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                            if (d < minDist) { minDist = d; nearestDefender = opp; }
                        }
                    });

                    let avoidY = 0;
                    if (nearestDefender && minDist < 5) {
                        avoidY = (p.y - nearestDefender.y) > 0 ? 5 : -5;
                    }

                    // [수정] pushDistance 증가: 공격수가 더 깊이 전진하도록
                    let pushDistance = 32;
                    if (isAttackingAI) pushDistance = 32;
                    if (behavior.comeShort) pushDistance = 8;
                    if (behavior.runBehind) pushDistance = 38;

                    const rawTargetX = this.ball.x + (forwardDir * pushDistance);
                    const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');

                    // [수정] 오프사이드 트랩 클램프 완화: defLineX ± 5 (기존 -3)
                    if (isHome) {
                        targetX = Math.min(rawTargetX, defLineX + 5);
                    } else {
                        targetX = Math.max(rawTargetX, defLineX - 5);
                    }

                    targetY = p.baseY + avoidY;
                    targetY = Math.max(5, Math.min(95, targetY));
                    
                    if (behavior.runBehind) {
                        if (isHome) targetX = Math.min(targetX + 5, defLineX + 8);
                        else         targetX = Math.max(targetX - 5, defLineX - 8);
                    }
                    
                    moveSpeed = 0.6 * speedFactor * sprintBonus;

                } else if (p.position === 'MF') {
                    const attackBias = behavior.attackBias || 0;
                    const defenseBias = behavior.defenseBias || 0;

                    let ballWeight = 0.6 + (attackBias * 0.4) - (defenseBias * 0.3);
                    ballWeight = Math.max(0.2, Math.min(0.70, ballWeight));

                    targetX = (p.baseX * (1 - ballWeight)) + (this.ball.x * ballWeight);
                    targetY = (p.baseY * (1 - ballWeight)) + (this.ball.y * ballWeight);

                    if (attackBias > 0.2) {
                        targetX += (forwardDir * attackBias * 10);
                    }

                    const fwPlayers = this.players.filter(fw => fw.teamId === p.teamId && fw.position === 'FW');
                    if (fwPlayers.length > 0) {
                        const fwFrontX = isHome
                            ? Math.max(...fwPlayers.map(fw => fw.x))
                            : Math.min(...fwPlayers.map(fw => fw.x));
                        if (isHome) targetX = Math.min(targetX, fwFrontX - 3);
                        else         targetX = Math.max(targetX, fwFrontX + 3);
                    }
                    
                    if (Math.abs(p.y - this.ball.y) < 3) targetY += (p.y > 50 ? 4 : -4);

                } else {
                    // DF 공격 시 전진 한계
                    if (isHome) {
                        const maxAdvanceX = p.baseX + 10;
                        targetX = Math.min(maxAdvanceX, this.ball.x - 25);
                        targetX = Math.max(p.baseX, targetX);
                    } else {
                        const minAdvanceX = p.baseX - 10;
                        targetX = Math.max(minAdvanceX, this.ball.x + 25);
                        targetX = Math.min(p.baseX, targetX);
                    }
                    targetY = p.baseY;
                }

                if (behavior.cutInside) {
                    targetY = 50 + (p.baseY - 50) * 0.5;
                } else if (behavior.hugLine) {
                    targetY = p.baseY < 50 ? 5 : 95;
                }

            } else {
                // ─── 수비 시 ────────────────────────────────────────────────
                let shiftFactor = 0.8;
                let yShiftFactor = 0.2;
                
                const isHomeDef = p.teamId === 'home';
                const inMyBox = isHomeDef ? (this.ball.x < 22) : (this.ball.x > 78);
                
                if (p.position === 'MF') {
                    const defenseBias = behavior.defenseBias || 0;
                    shiftFactor = 1.25 + (defenseBias * 0.4); 
                    shiftFactor = Math.max(1.1, Math.min(1.6, shiftFactor));
                    moveSpeed = 1.1 * (1 + defenseBias) * sprintBonus; 
                } else if (p.position === 'FW') {
                    shiftFactor = 0.45; 
                    moveSpeed = 0.85 * sprintBonus;
                } else if (p.position === 'DF') {
                    shiftFactor = 0.25;
                    yShiftFactor = 0.05;
                }

                const ballXShift = (this.ball.x - 50) * shiftFactor;
                let formationX = p.currentBaseX + ballXShift;

                if (p.position === 'DF') {
                    formationX = Math.max(p.baseX - 8, Math.min(p.baseX + 8, formationX));
                }

                let formationY = p.baseY + (this.ball.y - 50) * yShiftFactor;

                let markTarget = null;
                let minMarkDist = 30;
                this.players.forEach(opp => {
                    if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                        const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                        if (Math.abs(p.baseY - opp.y) > 18) return;
                        if (d < minMarkDist) { minMarkDist = d; markTarget = opp; }
                    }
                });

                if (markTarget) {
                    const goalX = p.teamId === 'home' ? 0 : 100;
                    const distToGoal = Math.abs(this.ball.x - goalX);
                    const isShootingThreat = distToGoal < 35;

                    if ((inMyBox || isShootingThreat) && markTarget === this.ball.owner) {
                        targetX = markTarget.x;
                        moveSpeed = 0.9 * speedFactor;
                    } else {
                        targetX = markTarget.x + (goalX - markTarget.x) * 0.02; 
                        moveSpeed = 0.6;
                    }
                    targetY = markTarget.y; 

                    if (p.position === 'DF') {
                        const isHome = p.teamId === 'home';
                        const isPenetrating = isHome ? (targetX < formationX) : (targetX > formationX);
                        if (!isPenetrating) {
                            targetX = (targetX * 0.2) + (formationX * 0.8);
                        } else {
                            targetX = (targetX * 0.9) + (formationX * 0.1);
                        }
                    }
                } else {
                    targetX = formationX;
                    targetY = formationY;
                }

                // 압박
                if (this.ball.owner && p.position !== 'GK') {
                    const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    
                    let forcePress = false;
                    if (inMyBox && p.position === 'DF' && distToBall < 15) forcePress = true;
                    if (!inMyBox && p.position === 'MF' && distToBall < 18) forcePress = true;

                    if (p === presser || distToBall < pressDetectDist || forcePress) {
                        const dx = this.ball.x - p.x;
                        const dy = this.ball.y - p.y;
                        const dist = Math.hypot(dx, dy);
                        const sprintSpeed = 3.4 * speedFactor * (dt.pressIntensity === 'high' ? 1.15 : 1.0); 

                        if (dist > 0) {
                            p.x += (dx / dist) * sprintSpeed;
                            p.y += (dy / dist) * sprintSpeed;
                        }
                        
                        let tackleChance = 0.5;
                        if (distToBall < 2) tackleChance = 0.9;
                        if (distToBall < 5 && Math.random() < tackleChance) {
                            this.attemptTackle(p, this.ball.owner);
                        }
                        return; 
                    }
                }

                const isDeepBeaten = p.position === 'DF' && 
                    (isHomeDef ? (this.ball.x < p.x - 20) : (this.ball.x > p.x + 20)) && 
                    !inMyBox;

                if (isDeepBeaten) {
                    const retreatTargetX = isHomeDef 
                        ? Math.max(p.baseX, this.ball.x - 15) 
                        : Math.min(p.baseX, this.ball.x + 15);
                    const retreatTargetY = p.baseY;

                    const dx = retreatTargetX - p.x;
                    const dy = retreatTargetY - p.y;
                    const dist = Math.hypot(dx, dy);
                    const retreatSpeed = 2.8 * speedFactor;

                    if (dist > 0.5) {
                        p.x += (dx / dist) * retreatSpeed;
                        p.y += (dy / dist) * retreatSpeed;
                    }
                    return;
                }
            }

            // 아군끼리 간격 유지
            const teammates = this.players.filter(tm => tm.teamId === p.teamId && tm !== p);
            for (const tm of teammates) {
                const dist = Math.hypot(targetX - tm.x, targetY - tm.y);
                let separationDist = 5;
                if (p.position === 'DF' && tm.position === 'DF') separationDist = 9;

                if (dist < separationDist) {
                    const angle = Math.atan2(targetY - tm.y, targetX - tm.x);
                    const push = (separationDist - dist) * 0.5;
                    targetX += Math.cos(angle) * push;
                    targetY += Math.sin(angle) * push;
                }
            }

            targetY = Math.max(2, Math.min(98, targetY));
            targetX = Math.max(2, Math.min(98, targetX));

            if (!isLooseBall) {
                targetX += (Math.random() - 0.5) * 0.5;
                targetY += (Math.random() - 0.5) * 1.0;
            }

            const accelX = (targetX - p.x) * moveSpeed * 0.12;
            const accelY = (targetY - p.y) * moveSpeed * 0.12;

            p.vx = (p.vx + accelX) * 0.7;
            p.vy = (p.vy + accelY) * 0.7;

            p.x += p.vx;
            p.y += p.vy;
        });
    }

    checkFrontalBlock(player, goalX) {
        const forwardDir = player.teamId === 'home' ? 1 : -1;
        const checkDist = 10;
        const checkWidth = 6;

        const minY = player.y - checkWidth;
        const maxY = player.y + checkWidth;
        const minX = forwardDir === 1 ? player.x : player.x - checkDist;
        const maxX = forwardDir === 1 ? player.x + checkDist : player.x;

        return this.players.some(opp => {
            if (opp.teamId === player.teamId) return false;
            return (opp.x >= minX && opp.x <= maxX && opp.y >= minY && opp.y <= maxY);
        });
    }

    calcOffBallTarget(player, runType, roleStats) {
        const isHome = player.teamId === 'home';
        const forwardDir = isHome ? 1 : -1;
        const attackBonus = (roleStats.attack || 0) * 10;

        if (runType === RUN_TYPE.STRIKER_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            const penetrationDepth = 5 + attackBonus; 
            return { x: defLineX + (forwardDir * penetrationDepth), y: this.ball.y + (Math.random() - 0.5) * 20 };
        }
        else if (runType === RUN_TYPE.SUPPORT_RUN) {
            const side = player.baseY < 50 ? 'top' : 'bottom';
            const backDirX = -forwardDir;
            const sideDirY = side === 'top' ? -1 : 1;
            return { x: this.ball.x + (backDirX * 10), y: this.ball.y + (sideDirY * 10) };
        }
        else if (runType === RUN_TYPE.CHANNEL_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            const targetY = this.ball.y < 50 ? 70 : 30; 
            return { x: defLineX + (forwardDir * 2), y: targetY }; 
        }
        else if (runType === RUN_TYPE.WIDE_RUN) {
            const sideY = player.baseY < 50 ? 5 : 95;
            return { x: this.ball.x + (forwardDir * 5), y: sideY };
        }
        else if (runType === RUN_TYPE.UNDERLAP_RUN) {
            const halfSpaceY = player.baseY < 50 ? 30 : 70;
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            return { x: defLineX + (forwardDir * 5), y: halfSpaceY };
        }
        else {
            const ballInfluence = 0.2;
            return {
                x: player.baseX + (this.ball.x - player.baseX) * ballInfluence,
                y: player.baseY + (this.ball.y - player.baseY) * ballInfluence
            };
        }
    }

    getDefensiveLineX(opposingTeamId) {
        let relevantPlayers = this.players.filter(p => p.teamId === opposingTeamId && p.position !== 'GK');
        if (opposingTeamId === 'away') {
            const xs = relevantPlayers.map(p => p.x);
            return Math.min(...xs); 
        } else {
            const xs = relevantPlayers.map(p => p.x);
            return Math.max(...xs);
        }
    }

    applyOffsideCheck(targetPos, player) {
        const opposingTeamId = player.teamId === 'home' ? 'away' : 'home';
        const opponents = this.players.filter(p => p.teamId === opposingTeamId);
        
        if (player.teamId === 'home') {
            opponents.sort((a, b) => b.x - a.x);
            if (opponents.length < 2) return targetPos;
            const offsideLineX = opponents[1].x; 
            const limitX = Math.max(offsideLineX, this.ball.x);
            if (targetPos.x > limitX) targetPos.x = limitX - 2; 
        } else {
            opponents.sort((a, b) => a.x - b.x);
            if (opponents.length < 2) return targetPos;
            const offsideLineX = opponents[1].x;
            const limitX = Math.min(offsideLineX, this.ball.x);
            if (targetPos.x < limitX) targetPos.x = limitX + 2;
        }
        return targetPos;
    }

    findNearestDefender(attacker) {
        let nearest = null;
        let minDst = 999;
        this.players.forEach(p => {
            if (p.teamId !== attacker.teamId) {
                const d = Math.hypot(p.x - attacker.x, p.y - attacker.y);
                if (d < minDst) { minDst = d; nearest = p; }
            }
        });
        return nearest ? { player: nearest, dist: minDst } : null;
    }

    checkInterception() {
        this.players.forEach(p => {
            if (!this.ball.owner && this.ball.state === BallState.IN_FLIGHT && !this.pendingShot) {
                if (this.ball.lastOwner && p.teamId === this.ball.lastOwner.teamId) return;
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < 3) {
                    const effectiveDefense = this.getEffectiveStat(p, 'defense');
                    const interceptChance = 0.05 + (effectiveDefense / 400); 
                    if (Math.random() < interceptChance) {
                        this.ball.state = BallState.CONTROLLED;
                        this.ball.owner = p;
                        this.ball.lastOwner = null;
                        this.eventsQueue.push({ type: 'tackle', player: p.name, desc: `${p.name}, 날카로운 패스 차단!` });
                    }
                }
            }
        });
    }

    getRoleBehavior(role) {
        const behaviors = {
            'AF': { runBehind: true, shootBias: 0.2, dribbleBias: 0.1 },
            'P':  { runBehind: true, shootBias: 0.3, passBias: -0.2 },
            'DLF':{ comeShort: true, passBias: 0.1 },
            'F9': { comeShort: true, dribbleBias: 0.1, passBias: 0.1 },
            'TM': { comeShort: true, holdUp: true },
            'W':  { hugLine: true, dribbleBias: 0.2, crossBias: 0.2 },
            'IF': { cutInside: true, shootBias: 0.1, dribbleBias: 0.2 },
            'BBM': { runBehind: false, pressBias: 0.1, attackBias: 0.3, defenseBias: 0.3 },
            'MEZ': { cutInside: true, attackBias: 0.5, defenseBias: 0.1 },
            'DLP': { comeShort: true, passBias: 0.3, defenseBias: 0.4 },
            'AP':  { comeShort: true, passBias: 0.2, dribbleBias: 0.1, attackBias: 0.4, defenseBias: 0.1 },
            'BWM': { pressBias: 0.3, passBias: -0.1, defenseBias: 0.5 },
            'REG': { passBias: 0.4, defenseBias: 0.3 },
            'CAR': { comeShort: true, defenseBias: 0.4 },
            'EG':  { comeShort: true, attackBias: 0.3 },
            'SS':  { runBehind: true, attackBias: 0.6 },
            'ANC': { defenseBias: 0.6 },
            'DM':  { defenseBias: 0.5 },
            'SV':  { runBehind: true, attackBias: 0.4, defenseBias: 0.3 },
            'BPD': { passBias: 0.1 },
            'CD':  { passBias: -0.1 },
            'WB':  { overlap: true, dribbleBias: 0.1 },
            'FB':  { overlap: false },
            'NCB': { passBias: -0.3 }
        };
        return behaviors[role] || {};
    }

    attemptTackle(defender, attacker) {
        const defStat = this.getEffectiveStat(defender, 'defense');
        const atkStat = this.getEffectiveStat(attacker, 'decision');
        const defRoll = (defStat * 1.05) * Math.random();
        const atkRoll = atkStat * Math.random();

        if (defRoll > atkRoll) {
            this.ball.owner = defender;
            this.ball.lastOwner = null;
            this.eventsQueue.push({ type: 'tackle', player: defender.name, desc: `${defender.name}의 태클 성공!` });
        }
    }

    adjustDefensiveLines() {
        const dt = gameData.deepTactics || { defensiveLine: 'standard' };
        // [수정] standard 기본값을 -6으로 내림 (기존 0)
        let shift = -6;
        if (dt.defensiveLine === 'high') shift = 8;
        else if (dt.defensiveLine === 'deep') shift = -16;

        this.players.forEach(p => {
            if (p.position === 'DF') {
                const teamDir = p.teamId === 'home' ? 1 : -1;
                p.currentBaseX = p.baseX + (shift * teamDir);
            } else {
                p.currentBaseX = p.baseX;
            }
        });
    }

    startExitAnimation(winnerId = null) {
        this.winningTeamId = winnerId;
        this.lapAngle = 0;

        if (winnerId === 'home') {
            this.postMatchPhase = 1;
            const homePlayers = this.players.filter(p => p.teamId === 'home');
            homePlayers.forEach((p, i) => {
                p.lapOrder = i * 0.2;
                p.radiusNoise = (Math.random() - 0.5) * 6;
                const startAngle = Math.PI / 2 + p.lapOrder; 
                p.exitTargetX = 50 + Math.cos(startAngle) * (35 + p.radiusNoise);
                p.exitTargetY = 50 + Math.sin(startAngle) * (30 + p.radiusNoise);
            });
            const awayPlayers = this.players.filter(p => p.teamId !== 'home');
            awayPlayers.forEach(p => {
                p.exitTargetX = 50 + (Math.random() - 0.5) * 40;
                p.exitTargetY = -20;
            });
        } else {
            this.initExitMovement();
        }
    }

    initExitMovement() {
        this.postMatchPhase = 3;
        const exitY = Math.random() < 0.5 ? -20 : 120;
        this.players.forEach(p => {
            p.exitTargetX = 50 + (Math.random() - 0.5) * 10;
            p.exitTargetY = exitY;
        });
    }

    updatePostMatch() {
        if (this.postMatchPhase === 1) {
            let allAligned = true;
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    const dx = p.exitTargetX - p.x;
                    const dy = p.exitTargetY - p.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 3) {
                        p.x += (dx / dist) * 0.8;
                        p.y += (dy / dist) * 0.8;
                        allAligned = false; 
                    }
                } else {
                    p.y -= 0.8;
                }
            });
            if (allAligned) {
                this.postMatchPhase = 2;
                this.lapAngle = Math.PI / 2;
            }
        }
        else if (this.postMatchPhase === 2) {
            this.lapAngle -= 0.015;
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    const currentAngle = this.lapAngle + p.lapOrder;
                    const radiusX = 40 + p.radiusNoise;
                    const radiusY = 35 + p.radiusNoise;
                    const targetX = 50 + Math.cos(currentAngle) * radiusX;
                    const targetY = 50 + Math.sin(currentAngle) * radiusY;
                    p.x += (targetX - p.x) * 0.1;
                    p.y += (targetY - p.y) * 0.1;
                } else {
                    p.y -= 0.8; 
                }
            });
            if (this.lapAngle < -Math.PI * 1.5) this.initExitMovement(); 
        }
        else if (this.postMatchPhase === 3) {
            this.players.forEach(p => {
                const dx = p.exitTargetX - p.x;
                const dy = p.exitTargetY - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 1) {
                    p.x += (dx / dist) * 0.7;
                    p.y += (dy / dist) * 0.7;
                }
            });
        }
        return this.getSnapshot();
    }

    isExitAnimationDone() {
        if (this.postMatchPhase !== 3) return false;
        return this.players.every(p => p.y < -10 || p.y > 110);
    }
}

// 전역 노출
window.RealSoccerEngine = RealSoccerEngine;
window.DeepTacticManager = DeepTacticManager;

document.addEventListener('DOMContentLoaded', () => {
    const tacticsBtn = document.querySelector('[data-tab="tactics"]');
    if (tacticsBtn) {
        tacticsBtn.addEventListener('click', () => setTimeout(() => DeepTacticManager.init(), 100));
    }
    setTimeout(() => DeepTacticManager.init(), 1000);
});
