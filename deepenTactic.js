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
        this.intendedReceiver = null;
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
            'passing': 'technique', 'shooting': 'attack', 'defense': 'defense',
            'speed': 'speed', 'decision': 'mentality', 'physical': 'physical'
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
                if (remainder > 0) { aiStats[line].stats[key]++; remainder--; }
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
            setupLine(squad.mf, 42);
            setupLine(squad.fw, 72); // FW baseX = 72
        } else {
            if (squad.gk) setupLine([squad.gk], 95);
            setupLine(squad.df, 80);
            setupLine(squad.mf, 58);
            setupLine(squad.fw, 28); // FW baseX = 28
        }
    }

    getBestRoleForTactic(tactic, position, index) {
        if (position === 'GK') return 'GK';
        const roleMap = {
            'tikitaka':     { FW: ['F9', 'DLF'], MF: ['DLP', 'AP', 'MEZ'], DF: ['BPD', 'IWB'] },
            'possession':   { FW: ['DLF', 'CF'], MF: ['DLP', 'AP', 'CAR'], DF: ['BPD', 'WB'] },
            'lavolpiana':   { FW: ['F9', 'W'],   MF: ['DLP', 'REG', 'MEZ'], DF: ['BPD', 'IWB'] },
            'gegenpress':   { FW: ['PF', 'AF'],  MF: ['BBM', 'BWM', 'MEZ'], DF: ['CD', 'CWB'] },
            'totalFootball':{ FW: ['CF', 'F9'],  MF: ['BBM', 'MEZ', 'AP'],  DF: ['BPD', 'CWB', 'LIB'] },
            'counter':      { FW: ['AF', 'P'],   MF: ['BWM', 'DLP'],        DF: ['NCB', 'FB'] },
            'longBall':     { FW: ['TM', 'AF'],  MF: ['BWM', 'CM'],         DF: ['NCB', 'CD'] },
            'twoLine':      { FW: ['AF', 'P'],   MF: ['BWM', 'CAR'],        DF: ['CD', 'FB'] },
            'parkBus':      { FW: ['P', 'TM'],   MF: ['BWM', 'DLP'],        DF: ['NCB', 'CD'] },
            'catenaccio':   { FW: ['TM', 'P'],   MF: ['BWM', 'DLP'],        DF: ['NCB', 'LIB'] }
        };
        const defaultRoles = { FW: ['AF', 'CF'], MF: ['BBM', 'AP'], DF: ['CD', 'FB'] };
        let selectedMap = roleMap[tactic] || defaultRoles;
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
            const ballSpeed = 4.2;
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
            if (nearest && minDst < 2.5) {
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = nearest;
                this.ball.intendedReceiver = null;
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
        const behavior = this.getRoleBehavior(player.role);
        
        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const isOnFlank = player.y < 25 || player.y > 75;

        const nearestOpp = this.findNearestDefender(player);
        const pressureDist = nearestOpp ? nearestOpp.dist : 999;
        const underPressure = pressureDist < 8;
        const moveDir = isHome ? 1 : -1;

        const effectiveSpeed = this.getEffectiveStat(player, 'speed');
        const speedFactor = effectiveSpeed / 75;
        const oppSpeed = nearestOpp ? this.getEffectiveStat(nearestOpp.player, 'speed') : 0;
        const canOutrun = effectiveSpeed > oppSpeed + 5;

        const isWingerOnFlank = behavior.hugLine && isOnFlank;

        let isAngleBlocked = false;
        if (distToGoal < 35) {
            isAngleBlocked = this.players.some(opp => {
                if (opp.teamId === player.teamId) return false;
                const d = Math.hypot(opp.x - player.x, opp.y - player.y);
                if (d > 10) return false;
                const dot = (goalX - player.x) * (opp.x - player.x) + (50 - player.y) * (opp.y - player.y);
                const mag1 = Math.hypot(goalX - player.x, 50 - player.y);
                const mag2 = Math.hypot(opp.x - player.x, opp.y - player.y);
                const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
                return angle < 0.28;
            });
        }

        let shootThreshold = 30;
        if (isAI) shootThreshold = 32;

        if (isAngleBlocked && distToGoal > 12 && Math.random() < 0.8) {
            shootThreshold = 0;
        }

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
        const runner = this.players.find(p => p.teamId === player.teamId && p.burstTimer > 10);
        if (runner && distToGoal > 30) {
            passProb = (canOutrun && (behavior.dribbleBias || 0) > 0) ? 0.35 : 0.9;
        }

        const isBlocked = this.checkFrontalBlock(player, goalX);
        if (isBlocked) {
            passProb = isWingerOnFlank ? 0.05 : (underPressure ? 0.75 : 0.05);
        } else {
            if (player.position === 'DF' || player.position === 'GK') {
                passProb = underPressure ? 0.98 : 0.4;
            } else {
                passProb = (isWingerOnFlank && distToGoal > 25) ? 0.001 : 0.15;
                if (isAngleBlocked) passProb = 0.85;
                if (behavior.hugLine && isOnFlank && distToGoal < 25) {
                    const targetInBox = this.players.find(p => p.teamId === player.teamId && p.position === 'FW' && Math.abs(p.y - 50) < 18);
                    if (targetInBox && Math.random() < 0.7) {
                        this.executePass(player, targetInBox);
                        return;
                    }
                }
                if (typeof gameData !== 'undefined' && gameData.currentTactic === 'tikitaka') passProb = 0.25;
            }
        }

        let bestPassTarget = null;
        if (player.position === 'GK') {
            if (Math.random() < 0.5) {
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

        if (nearestOpp && nearestOpp.dist < 7 && Math.random() < 0.05) {
            if (this.attemptTackle(nearestOpp.player, player)) return;
        }

        let moveSpeed = 0.32 * Math.max(0.7, Math.min(1.4, speedFactor));
        let targetX = player.x + (moveDir * 22);
        let targetY = player.y;

        if (behavior.hugLine && isOnFlank) {
            targetY = player.y < 50 ? 4 : 96;
            moveSpeed = 0.58;
        } else if (isBlocked) {
            if (canOutrun && Math.random() < 0.65) {
                targetX = player.x + (moveDir * 28);
                moveSpeed *= 1.4;
            } else {
                let evadeOffset = 7;
                if (nearestOpp) {
                    targetY = player.y < nearestOpp.player.y ? player.y - evadeOffset : player.y + evadeOffset;
                } else {
                    targetY = player.y + (Math.random() < 0.5 ? evadeOffset : -evadeOffset);
                }
                targetX = player.x + (moveDir * 15);
                moveSpeed *= 1.5;
            }
        }

        targetY = Math.max(2, Math.min(98, targetY));
        const accelX = (targetX - player.x) * moveSpeed * 0.1;
        const accelY = (targetY - player.y) * moveSpeed * 0.1;
        player.vx = (player.vx + accelX) * 0.7;
        player.vy = (player.vy + accelY) * 0.7;
        player.x += player.vx;
        player.y += player.vy;

        this.ball.lastOwner = null;
        player.x = Math.max(5, Math.min(95, player.x));
        player.y = Math.max(2, Math.min(98, player.y));
        this.ball.x = player.x;
        this.ball.y = player.y;
        if (Math.random() < 0.2) this.eventsQueue.push({ type: 'dribble', player: player.name });
    }

    findBestPassTarget(player, mode = 'aggressive') {
        const teamates = this.players.filter(p => p.teamId === player.teamId && p !== player);
        let bestTarget = null;
        let maxScore = mode === 'aggressive' ? 0 : -50;

        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const isHome = player.teamId === 'home';
        const forwardX = isHome ? 100 : 0;

        const nearbyOppsCount = this.players.filter(p =>
            p.teamId !== player.teamId &&
            Math.hypot(p.x - player.x, p.y - player.y) < 15
        ).length;

        teamates.forEach(tm => {
            const distBefore = Math.abs(player.x - forwardX);
            const distAfter = Math.abs(tm.x - forwardX);
            let forwardScore = (distBefore - distAfter);

            if (tm.burstTimer > 0) forwardScore += 150;

            const isPenetrating = tm.position === 'FW' && (isHome ? tm.vx > 0.1 : tm.vx < -0.1);
            if (isPenetrating) forwardScore += 35;

            let switchBonus = 0;
            if (nearbyOppsCount >= 1 && Math.abs(player.y - tm.y) > 35) switchBonus = 40;

            if (mode === 'safe') {
                forwardScore *= 0.5;
            } else {
                forwardScore *= 8.0;
                if (distAfter > distBefore) forwardScore -= 40;
                if (isAI && forwardScore > 0) forwardScore *= 1.5;
            }

            const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
            let distScore = 0;
            if (dist < 10) distScore = -50;
            else if (dist > 25) distScore = -(dist - 25) * 2.0;
            else distScore = 40;

            if (dist > 20 && distAfter > distBefore) distScore -= 200;
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
            if (this.ball.lastOwner === tm) loopPenalty = mode === 'aggressive' ? 60 : 20;

            let positionBonus = 0;
            if (player.position === 'DF') {
                if (tm.position === 'MF') positionBonus = 5;
                else if (tm.position === 'DF') positionBonus = 3;
            }
            if (player.position === 'GK' && tm.position === 'DF') positionBonus = 5;

            const totalScore = forwardScore + distScore + pressureScore - loopPenalty + positionBonus + switchBonus;
            if (totalScore > maxScore) { maxScore = totalScore; bestTarget = tm; }
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
        this.ball.intendedReceiver = to;
        this.ball.owner = null;
        
        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        let accuracy = from.stats.passing;

        if (to.burstTimer > 0) accuracy += 30;

        const forwardX = from.teamId === 'home' ? 100 : 0;
        const distToGoalFrom = Math.abs(from.x - forwardX);
        const distToGoalTo = Math.abs(to.x - forwardX);

        const MAX_THROUGH_PASS_DIST = 35;
        const isThroughPass = (distToGoalFrom - distToGoalTo > 5) && dist > 10 && distToGoalFrom < 60 && dist <= MAX_THROUGH_PASS_DIST;
        
        const distPenalty = Math.max(0, (dist - 20) * 0.8);
        let successChance = accuracy - distPenalty;
        
        if (from.position === 'GK' && dist > 50) successChance -= 15;

        let eventType = 'pass';
        let eventDesc = `${from.name}, ${to.name}에게 연결!`;

        if (isThroughPass) {
            eventType = 'throughpass';
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

        // ─────────────────────────────────────────────────────────────
        // [수정] 골 확률 상향
        // 기존: 기본 22%, 최대 72%
        // 변경: 기본 30%, 최대 82%
        // powerDiff 반영률: 0.004 → 0.005 (스탯 차이가 더 잘 반영됨)
        // ─────────────────────────────────────────────────────────────
        let goalChance = 0.30 + (powerDiff * 0.005);
        goalChance = Math.max(0.05, Math.min(0.82, goalChance));

        let isGoal = Math.random() < goalChance;
        
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null;
        this.ball.targetPos = { x: goalX, y: 45 + Math.random() * 10 };

        this.pendingShot = {
            isGoal: isGoal,
            shooter: shooter,
            goalX: goalX
        };
    }

    handleShotResult() {
        const { isGoal, shooter, goalX } = this.pendingShot;
        this.pendingShot = null;

        if (isGoal) {
            if (shooter.teamId === 'home') this.homeScore++;
            else this.awayScore++;

            this.ball.intendedReceiver = null;
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

            this.eventsQueue.push({ type: 'goal', scorer: shooter.name, team: shooter.teamId, assister: assister });
            this.lastScorerTeam = shooter.teamId;
            this.celebrationTimer = 40;
            this.ball.state = BallState.DEAD;
            this.ball.lastOwner = null;
        } else {
            this.ball.intendedReceiver = null;
            const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
            const isHomeAttacking = shooter.teamId === 'home';

            const enemyGk = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');

            const defenders = this.players.filter(p =>
                p.teamId === opponentTeamId && p.position !== 'GK' &&
                Math.abs(p.x - shooter.x) < 15 && Math.abs(p.y - shooter.y) < 5
            );
            const blockingDefenders = defenders.filter(p => isHomeAttacking ? (p.x > shooter.x) : (p.x < shooter.x));

            if (blockingDefenders.length > 0 && Math.random() < 0.1) {
                const blocker = blockingDefenders[0];
                this.eventsQueue.push({ type: 'block', shooter: shooter.name, blocker: blocker.name, desc: `🛡️ ${blocker.name}, 몸을 날려 슈팅을 막아냅니다!` });
                this.ball.state = BallState.LOOSE;
                this.ball.owner = null;
                this.ball.x = blocker.x + (isHomeAttacking ? -5 : 5);
                this.ball.y = blocker.y + (Math.random() - 0.5) * 15;
                return;
            }

            if (enemyGk) {
                const shotTargetY = this.ball.targetPos.y;
                const gkBaseX = enemyGk.teamId === 'home' ? 5 : 95;
                const maxGkSlide = 15;
                const newGkY = Math.max(50 - maxGkSlide, Math.min(50 + maxGkSlide, shotTargetY));
                enemyGk.x = gkBaseX;
                enemyGk.y = newGkY;
                this.ball.x = enemyGk.x;
                this.ball.y = enemyGk.y;

                if (Math.random() < 0.15) {
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
        if (dist > 1) { const speed = 1.2; p.x += (dx / dist) * speed; p.y += (dy / dist) * speed; }
        if (this.celebrationType === 'quick_restart') { this.ball.x = p.x; this.ball.y = p.y; }
        this.players.forEach(tm => {
            if (tm.teamId === p.teamId && tm !== p) {
                if (this.celebrationType === 'celebrate') {
                    const ddx = p.x - tm.x; const ddy = p.y - tm.y; const d = Math.hypot(ddx, ddy);
                    if (d > 3) { tm.x += (ddx / d) * 0.9; tm.y += (ddy / d) * 0.9; }
                } else {
                    const ddx = tm.baseX - tm.x; const ddy = tm.baseY - tm.y; const d = Math.hypot(ddx, ddy);
                    if (d > 1) { tm.x += (ddx / d) * 1.0; tm.y += (ddy / d) * 1.0; }
                }
            }
        });
    }

    processOffBallAI() {
        let attackingTeam = null;
        if (this.ball.owner) attackingTeam = this.ball.owner.teamId;
        else if (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner) attackingTeam = this.ball.lastOwner.teamId;
        
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
            let minDHome = 999; let minDAway = 999;
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (p.teamId === 'home') { if (d < minDHome) { minDHome = d; nearestHome = p; } }
                else { if (d < minDAway) { minDAway = d; nearestAway = p; } }
            });
        }

        this.players.forEach(p => {
            if (p === this.ball.owner) return;
            const behavior = this.getRoleBehavior(p.role);
            let targetX = p.x;
            let targetY = p.y;
            const effectiveSpeed = this.getEffectiveStat(p, 'speed');
            const speedFactor = effectiveSpeed / 75;
            let moveSpeed = 0.22 * Math.max(0.7, Math.min(1.4, speedFactor));

            if (isLooseBall) {
                const isNearest = (p === nearestHome || p === nearestAway);
                if (isNearest) { targetX = this.ball.x; targetY = this.ball.y; moveSpeed = 0.55; }
                else {
                    const ballInfluence = 0.15;
                    targetX = p.baseX + (this.ball.x - p.baseX) * ballInfluence;
                    targetY = p.baseY + (this.ball.y - p.baseY) * ballInfluence;
                    moveSpeed = 0.15;
                }
            }
            else if (p.teamId === attackingTeam) {
                const isHome = p.teamId === 'home';
                const forwardDir = isHome ? 1 : -1;
                
                if (this.ball.state === BallState.IN_FLIGHT && p === this.ball.intendedReceiver) {
                    targetX = this.ball.targetPos.x; targetY = this.ball.targetPos.y; moveSpeed = 0.7;
                } else {
                    const isLastPasser = (p === this.ball.lastOwner);
                    const isRearDefender = p.position === 'GK' || (p.position === 'DF' && ['CD', 'BPD', 'NCB'].includes(p.role));

                    if (isLastPasser && !isRearDefender) {
                        targetX = p.x + (forwardDir * 15);
                        targetY = p.y + (this.ball.y - p.y) * 0.3;
                        moveSpeed = 0.4;
                    }
                    else if (p.position === 'FW') {
                        if (!p.burstTimer) p.burstTimer = 0;
                        const oppDefLineX = this.getDefensiveLineX(p.teamId === 'home' ? 'away' : 'home');

                        if (p.burstTimer > 0) {
                            targetX = oppDefLineX + (forwardDir * 15);
                            moveSpeed = 0.35;
                            p.burstTimer--;
                        } else {
                            let ballPushX = this.ball.x + (forwardDir * 25);
                            targetX = isHome ? Math.min(oppDefLineX - 1.5, ballPushX) : Math.max(oppDefLineX + 1.5, ballPushX);

                            // ─────────────────────────────────────────────────────
                            // [수정] FW 최소 전진 라인 강화
                            // 기존: home 70 / away 30
                            // 변경: home 75 / away 25
                            // → 중앙 공격수(CF 등)가 반드시 상대 페널티 지역 근처에 위치
                            //   MF 라인(42/58)과 확실히 분리됨
                            // ─────────────────────────────────────────────────────
                            const fwMinX = isHome ? 75 : 25;
                            targetX = isHome ? Math.max(targetX, fwMinX) : Math.min(targetX, fwMinX);

                            const ballCarrier = this.ball.owner;
                            let burstChance = (ballCarrier && ballCarrier.teamId === p.teamId && ballCarrier.position !== 'FW') ? 0.08 : 0.03;
                            if (behavior.runBehind && Math.random() < burstChance) p.burstTimer = 45;
                        }

                        const nearOpp = this.findNearestDefender(p);
                        let avoidY = 0;
                        if (nearOpp && nearOpp.dist < 4) {
                            avoidY = (p.y > nearOpp.player.y) ? 4 : -4;
                        }
                        targetY = Math.max(p.baseY - 6, Math.min(p.baseY + 6, p.baseY + avoidY));

                        if (p.burstTimer > 0) targetX = oppDefLineX + (forwardDir * 15);
                        if (behavior.hugLine) { targetY = p.baseY < 50 ? 5 : 95; targetX += (forwardDir * 8); }

                        moveSpeed = 0.25 * speedFactor;
                    } else if (p.position === 'MF') {
                        const attackBias = behavior.attackBias || 0;
                        const defenseBias = behavior.defenseBias || 0;
                        let ballWeight = 0.6 + (attackBias * 0.4) - (defenseBias * 0.3);
                        ballWeight = Math.max(0.2, Math.min(0.95, ballWeight));
                        targetX = (p.baseX * (1 - ballWeight)) + (this.ball.x * ballWeight);
                        targetY = (p.baseY * (1 - ballWeight)) + (this.ball.y * ballWeight);
                        if (attackBias > 0.3) targetX += (forwardDir * attackBias * 12);
                        if (Math.abs(p.y - this.ball.y) < 3) targetY += (p.y > 50 ? 4 : -4);

                        // ─────────────────────────────────────────────────────
                        // [수정] MF 최대 전진 라인 제한
                        // MF가 FW 영역(home: 75 이상 / away: 25 이하)까지 올라가지 않도록 캡
                        // → BBM, MEZ 같은 공격적 MF도 FW 자리를 침범하지 않음
                        // ─────────────────────────────────────────────────────
                        const mfMaxX = isHome ? 74 : 26;
                        targetX = isHome ? Math.min(targetX, mfMaxX) : Math.max(targetX, mfMaxX);

                    } else if (p.position === 'DF') {
                        const lineTactic = gameData.deepTactics?.defensiveLine || 'standard';
                        let safetyDist = 22;
                        if (lineTactic === 'high') safetyDist = 14;
                        else if (lineTactic === 'deep') safetyDist = 32;
                        if (isHome) targetX = Math.min(75, Math.max(p.baseX, this.ball.x - safetyDist));
                        else targetX = Math.max(25, Math.min(p.baseX, this.ball.x + safetyDist));
                        if (Math.abs(this.ball.x - (isHome ? 0 : 100)) < 45) targetY = p.baseY < 50 ? 12 : 88;
                        else targetY = p.baseY;
                    } else if (p.position === 'GK') {
                        targetX = p.baseX;
                        targetY = 50 + (this.ball.y - 50) * 0.05;
                    }
                    if (behavior.cutInside) targetY = 50 + (p.baseY - 50) * 0.5;
                    else if (behavior.hugLine) targetY = p.baseY < 50 ? 5 : 95;
                }
            } else {
                // 수비 전환
                const isHomeDef = p.teamId === 'home';

                if (p.position === 'FW') {
                    const opposingTeamId = p.teamId === 'home' ? 'away' : 'home';
                    const opponents = this.players.filter(q => q.teamId === opposingTeamId && q.position !== 'GK');

                    if (opponents.length > 0) {
                        let offsideLineX;
                        if (isHomeDef) {
                            const homeField = this.players.filter(q => q.teamId === 'home' && q.position !== 'GK');
                            const sortedX = homeField.map(q => q.x).sort((a, b) => b - a);
                            offsideLineX = sortedX.length >= 2 ? sortedX[1] : (sortedX[0] ?? 20);
                            targetX = Math.min(p.x, offsideLineX + 2);
                            moveSpeed = 0.45 * speedFactor;
                        } else {
                            const awayField = this.players.filter(q => q.teamId === 'away' && q.position !== 'GK');
                            const sortedX = awayField.map(q => q.x).sort((a, b) => a - b);
                            offsideLineX = sortedX.length >= 2 ? sortedX[1] : (sortedX[0] ?? 80);
                            targetX = Math.max(p.x, offsideLineX - 2);
                            moveSpeed = 0.45 * speedFactor;
                        }
                        targetY = p.baseY;
                    } else {
                        targetX = p.baseX; targetY = p.baseY; moveSpeed = 0.35;
                    }
                } else {
                    let shiftFactor = 0.7;
                    let yShiftFactor = 0.2;
                    if (p.position === 'MF') {
                        shiftFactor = Math.max(0.6, Math.min(1.1, 0.95 + (behavior.defenseBias || 0) * 0.1 - (behavior.attackBias || 0) * 0.2));
                        moveSpeed = 0.22 * (1 + (behavior.defenseBias || 0));
                    } else if (p.position === 'DF') { shiftFactor = 0.75; yShiftFactor = 0.05; }

                    const isGKPossession = this.ball.owner && this.ball.owner.position === 'GK';
                    const refBallX = (this.pendingShot || isGKPossession) ? 50 : Math.max(30, Math.min(70, this.ball.x));
                    const isSpecialCase = (this.pendingShot || isGKPossession);
                    let formationX = p.baseX + (refBallX - 50) * shiftFactor;
                    let formationY = p.baseY + ((this.pendingShot ? 50 : this.ball.y) - 50) * yShiftFactor;
                    let markTarget = null;
                    if (!isSpecialCase) {
                        let minM = 30;
                        this.players.forEach(opp => {
                            if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                                const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                                if (Math.abs(p.baseY - opp.y) <= 18 && d < minM) { minM = d; markTarget = opp; }
                            }
                        });
                    }
                    if (markTarget && p.position !== 'GK') {
                        const gX = p.teamId === 'home' ? 0 : 100;
                        targetX = markTarget.x + (gX - markTarget.x) * 0.1; targetY = markTarget.y; moveSpeed = 0.06;
                        if (p.position === 'DF') {
                            const isPen = p.teamId === 'home' ? (targetX < formationX) : (targetX > formationX);
                            targetX = isPen ? (targetX * 0.9 + formationX * 0.1) : (targetX * 0.2 + formationX * 0.8);
                        }
                    } else { targetX = formationX; targetY = formationY; }

                    if (p.position === 'GK') {
                        const gX = p.teamId === 'home' ? 5 : 95;
                        targetX = gX;
                        targetY = 50 + (this.ball.y - 50) * 0.05;
                    }
                    if (this.ball.owner && p.position !== 'GK' && !isSpecialCase) {
                        const dB = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                        const shouldStep = (p === presser) || ((isHomeDef ? this.ball.x < 35 : this.ball.x > 65) && dB < 15 && p.position === 'DF');
                        if (shouldStep) {
                            const iX = (this.ball.x * 0.9) + (isHomeDef ? 0 : 100) * 0.1;
                            const dx = iX - p.x; const dy = (this.ball.y * 0.9 + 50 * 0.1) - p.y;
                            const d = Math.hypot(dx, dy); const sS = 2.3 * speedFactor;
                            if (d > 0) { p.x += (dx / d) * sS; p.y += (dy / d) * sS; }
                            let tC = dB < 2 ? 0.2 : 0.05;
                            if (dB < 5 && Math.random() < tC) this.attemptTackle(p, this.ball.owner);
                            return;
                        }
                    }
                    const isBeaten = p.position === 'DF' && !isSpecialCase && (isHomeDef ? (this.ball.x < p.x - 2) : (this.ball.x > p.x + 2));
                    if (isBeaten && !isSpecialCase) {
                        const rX = this.ball.x + (isHomeDef ? -15 : 15); const dx = rX - p.x; const dy = this.ball.y - p.y;
                        const d = Math.hypot(dx, dy); const rS = 2.2 * speedFactor;
                        if (d > 0) { p.x += (dx / d) * rS; p.y += (dy / d) * rS; }
                        return;
                    }
                }
            }

            const teammates = this.players.filter(tm => tm.teamId === p.teamId && tm !== p);
            for (const tm of teammates) {
                const d = Math.hypot(targetX - tm.x, targetY - tm.y);
                let sD = (p.position === 'DF' && tm.position === 'DF') ? 9 : 5;
                if (d < sD) {
                    const a = Math.atan2(targetY - tm.y, targetX - tm.x);
                    targetX += Math.cos(a) * (sD - d) * 0.5; targetY += Math.sin(a) * (sD - d) * 0.5;
                }
            }
            targetY = Math.max(2, Math.min(98, targetY)); targetX = Math.max(2, Math.min(98, targetX));
            const aX = (targetX - p.x) * moveSpeed * 0.1; const aY = (targetY - p.y) * moveSpeed * 0.1;
            p.vx = (p.vx + aX) * 0.7; p.vy = (p.vy + aY) * 0.7;
            p.x += p.vx; p.y += p.vy;
        });
    }

    checkFrontalBlock(player, goalX) {
        const forwardDir = player.teamId === 'home' ? 1 : -1;
        const checkDist = 8;
        const checkWidth = 4;
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
        } else if (runType === RUN_TYPE.SUPPORT_RUN) {
            const side = player.baseY < 50 ? 'top' : 'bottom';
            const backDirX = -forwardDir;
            const sideDirY = side === 'top' ? -1 : 1;
            return { x: this.ball.x + (backDirX * 10), y: this.ball.y + (sideDirY * 10) };
        } else if (runType === RUN_TYPE.CHANNEL_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            const targetY = this.ball.y < 50 ? 70 : 30;
            return { x: defLineX + (forwardDir * 2), y: targetY };
        } else if (runType === RUN_TYPE.WIDE_RUN) {
            const sideY = player.baseY < 50 ? 5 : 95;
            return { x: this.ball.x + (forwardDir * 5), y: sideY };
        } else if (runType === RUN_TYPE.UNDERLAP_RUN) {
            const halfSpaceY = player.baseY < 50 ? 30 : 70;
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            return { x: defLineX + (forwardDir * 5), y: halfSpaceY };
        } else {
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
            const ballX = this.ball.x;
            const limitX = Math.max(offsideLineX, ballX);
            if (targetPos.x > limitX) targetPos.x = limitX - 2;
        } else {
            opponents.sort((a, b) => a.x - b.x);
            if (opponents.length < 2) return targetPos;
            const offsideLineX = opponents[1].x;
            const ballX = this.ball.x;
            const limitX = Math.min(offsideLineX, ballX);
            if (targetPos.x < limitX) targetPos.x = limitX + 2;
        }
        return targetPos;
    }

    findNearestDefender(attacker) {
        let nearest = null; let minDst = 999;
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
                    const interceptChance = 0.01 + (effectiveDefense / 2500);
                    if (Math.random() < interceptChance) {
                        this.ball.state = BallState.CONTROLLED;
                        this.ball.owner = p;
                        this.ball.intendedReceiver = null;
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
        const atkSpeed = this.getEffectiveStat(attacker, 'speed');
        const speedBonus = (atkSpeed / 100) * 30;
        const defRoll = defStat * Math.random();
        const atkRoll = (atkStat + speedBonus) * Math.random();
        if (attacker && defRoll > atkRoll) {
            this.ball.owner = defender;
            this.ball.lastOwner = null;
            this.eventsQueue.push({ type: 'tackle', player: defender.name, desc: `${defender.name}의 태클 성공!` });
            return true;
        }
        return false;
    }

    adjustDefensiveLines() {
        const lineShift = gameData.deepTactics.defensiveLine === 'high' ? -10 : (gameData.deepTactics.defensiveLine === 'deep' ? 10 : 0);
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
                    const dx = p.exitTargetX - p.x; const dy = p.exitTargetY - p.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 3) { p.x += (dx / dist) * 0.8; p.y += (dy / dist) * 0.8; allAligned = false; }
                } else { p.y -= 0.8; }
            });
            if (allAligned) { this.postMatchPhase = 2; this.lapAngle = Math.PI / 2; }
        } else if (this.postMatchPhase === 2) {
            this.lapAngle -= 0.015;
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    const currentAngle = this.lapAngle + p.lapOrder;
                    const radiusX = 40 + p.radiusNoise; const radiusY = 35 + p.radiusNoise;
                    const targetX = 50 + Math.cos(currentAngle) * radiusX;
                    const targetY = 50 + Math.sin(currentAngle) * radiusY;
                    p.x += (targetX - p.x) * 0.1; p.y += (targetY - p.y) * 0.1;
                } else { p.y -= 0.8; }
            });
            if (this.lapAngle < -Math.PI * 1.5) { this.initExitMovement(); }
        } else if (this.postMatchPhase === 3) {
            this.players.forEach(p => {
                const dx = p.exitTargetX - p.x; const dy = p.exitTargetY - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 1) { const speed = 0.7; p.x += (dx / dist) * speed; p.y += (dy / dist) * speed; }
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
