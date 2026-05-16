// deepenTactic.js
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
            <h4 style="color: #ffd700; margin-top: 0;">심층 전술 세부 설정</h4>
            <div style="margin-bottom: 10px;">
                <label>수비 라인</label>
                <select id="dt-defensiveLine" style="width:100%; padding:5px; background:#333; color:white;">
                    <option value="deep" ${dt.defensiveLine === 'deep' ? 'selected' : ''}>딥 (Deep)</option>
                    <option value="standard" ${dt.defensiveLine === 'standard' ? 'selected' : ''}>표준</option>
                    <option value="high" ${dt.defensiveLine === 'high' ? 'selected' : ''}>하이 (High)</option>
                </select>
            </div>
            <div style="color: #aaa; font-size: 0.8rem;">* 설정은 자동 적용됩니다</div>
        `;
        document.getElementById('dt-defensiveLine').addEventListener('change', (e) => {
            gameData.deepTactics.defensiveLine = e.target.value;
        });
    }
};

const RUN_TYPE = {
    STRIKER_RUN: 'striker_run',
    SUPPORT_RUN: 'support_run',
    CHANNEL_RUN: 'channel_run',
    WIDE_RUN:    'wide_run',
    UNDERLAP_RUN:'underlap_run',
    HOLD_POSITION:'hold_position',
};

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
        this.x = 50; this.y = 50; this.z = 0;
        this.state = BallState.DEAD;
        this.owner = null; this.intendedReceiver = null; this.lastOwner = null;
        this.targetPos = { x: 50, y: 50 };
        this.velocity = { x: 0, y: 0 };
    }
}

class SimPlayer {
    constructor(data, teamId, role, lineStats, morale = 50, tacticMultiplier = 1.0) {
        this.id = data.name; this.name = data.name; this.position = data.position;
        this.rating = data.rating; this.teamId = teamId; this.role = role;
        this.x = 0; this.y = 0; this.vx = 0; this.vy = 0;
        this.baseX = 0; this.baseY = 0;
        this.stamina = (data.condition !== undefined) ? data.condition : 100;
        this._markTargetId = null;
        this.stats = this.mapDNAStats(data, role, lineStats, morale, tacticMultiplier);
        this.forceReturnTimer = 0;
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
            statVal = statVal * moraleFactor * tacticMultiplier;
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
        this.teamTactics = { home: homeTactic, away: awayTactic };

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
        const aiStats = { attack: { stats: {} }, midfield: { stats: {} }, defense: { stats: {} } };
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
            statKeys.forEach(key => { aiStats[line].stats[key] = baseValue; if (remainder > 0) { aiStats[line].stats[key]++; remainder--; } });
        }
        return aiStats;
    }

    initTeam(squad, teamId, tactic) {
        const tacticMultiplier = tactic === 'balanced' ? 0.85 : 1.0;
        const setupLine = (list, baseX) => {
            const height = 100;
            const isUserTeam = (teamId === 'home' && gameData.isHomeGame) || (teamId === 'away' && !gameData.isHomeGame);
            let lineStats, teamMorale = 50;
            if (isUserTeam) {
                lineStats = gameData.lineStats; this.userStats = lineStats; teamMorale = gameData.teamMorale;
            } else {
                lineStats = this.aiStats || this.generateAIStats(squad); this.aiStats = lineStats;
                teamMorale = 60 + Math.floor(Math.random() * 31);
            }
            list.forEach((p, i) => {
                if (!p) return;
                let role = null;
                if (gameData.playerRoles && gameData.playerRoles[p.name]) role = gameData.playerRoles[p.name];
                if (!role) role = this.getBestRoleForTactic(tactic, p.position, i);
                const simP = new SimPlayer(p, teamId, role, lineStats, teamMorale, tacticMultiplier);
                simP.baseX = baseX;
                simP.baseY = (height / (list.length + 1)) * (i + 1);
                simP.x = simP.baseX; simP.y = simP.baseY;
                this.players.push(simP);
            });
        };
        if (teamId === 'home') {
            if (squad.gk) setupLine([squad.gk], 5);
            setupLine(squad.df, 20); setupLine(squad.mf, 42); setupLine(squad.fw, 72);
        } else {
            if (squad.gk) setupLine([squad.gk], 95);
            setupLine(squad.df, 80); setupLine(squad.mf, 58); setupLine(squad.fw, 28);
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
        this.ball.x = 50; this.ball.y = 50; this.ball.lastOwner = null;
        let kicker = null;
        if (kickoffTeamId) {
            kicker = this.players.find(p => p.teamId === kickoffTeamId && p.position === 'FW');
            if (!kicker) kicker = this.players.find(p => p.teamId === kickoffTeamId && p.position === 'MF');
            if (!kicker) kicker = this.players.find(p => p.teamId === kickoffTeamId);
        }
        if (kicker) {
            this.ball.state = BallState.CONTROLLED; this.ball.owner = kicker;
            kicker.x = 50; kicker.y = 50;
        } else {
            this.ball.state = BallState.LOOSE; this.ball.owner = null;
        }
        this.players.forEach(p => {
            if (p !== kicker) {
                p.y = p.baseY; p.vx = 0; p.vy = 0;
                if (p.teamId === 'home') { const maxLine = p.position === 'MF' ? 40 : 48; p.x = Math.min(p.baseX, maxLine); }
                else { const minLine = p.position === 'MF' ? 60 : 52; p.x = Math.max(p.baseX, minLine); }
            }
        });
    }

    update(minute, isNewMinute) {
        this.eventsQueue = [];
        if (isNewMinute) this.consumeStamina();

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
                this.ball.x = this.ball.targetPos.x; this.ball.y = this.ball.targetPos.y;
                this.ball.state = BallState.LOOSE;
                if (this.pendingShot) { this.handleShotResult(); return this.getSnapshot(); }
            } else {
                const ratio = ballSpeed / dist;
                this.ball.x += dx * ratio; this.ball.y += dy * ratio;
                this.checkInterception();
            }
        }

        if (this.ball.state === BallState.LOOSE) {
            let nearest = null, minDst = 999;
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < minDst) { minDst = d; nearest = p; }
            });
            if (nearest && minDst < 2.5) {
                this.ball.state = BallState.CONTROLLED; this.ball.owner = nearest;
                this.ball.intendedReceiver = null; this.ball.x = nearest.x; this.ball.y = nearest.y;
            }
        }

        if (this.ball.state === BallState.CONTROLLED && this.ball.owner) this.processBallCarrierAI(this.ball.owner);
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
            players: this.players.map(p => ({ id: p.id, x: p.x, y: p.y, team: p.teamId, hasBall: (this.ball.owner === p) })),
            events: [...this.eventsQueue],
            isCelebration: this.celebrationTimer > 0
        };
    }

    processBallCarrierAI(player) {
        const isHome = player.teamId === 'home';
        const goalX = isHome ? 100 : 0;
        const distToGoal = Math.abs(player.x - goalX);
        const behavior = this.getRoleBehavior(player.role);
        const isOnFlank = player.y < 25 || player.y > 75;
        const nearestOpp = this.findNearestDefender(player);
        const pressureDist = nearestOpp ? nearestOpp.dist : 999;
        const underPressure = pressureDist < 8;
        const moveDir = isHome ? 1 : -1;
        const effectiveSpeed = this.getEffectiveStat(player, 'speed');
        const oppSpeed = nearestOpp ? this.getEffectiveStat(nearestOpp.player, 'speed') : 0;
        const canOutrun = effectiveSpeed > oppSpeed + 5;
        const isWingerOnFlank = behavior.hugLine && isOnFlank;

        if (player.position === 'GK') {
            this.processGoalkeeperAI(player, underPressure);
            return;
        }

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

        const isOneOnOne = pressureDist > 15;

        if (isAngleBlocked && distToGoal > 12 && Math.random() < 0.8) {
            // 앵글 막힘 → 슛 건너뜀
        } else {
            let shootChance = 0;
            if (distToGoal < 12)       shootChance = 0.95;
            else if (distToGoal < 18)  shootChance = 0.75;
            else if (distToGoal < 28)  shootChance = isOneOnOne ? 0.06 : 0.018;
            else if (distToGoal < 35)  shootChance = isOneOnOne ? 0.012 : 0.0;
            if (shootChance > 0 && Math.random() < shootChance) {
                this.attemptShoot(player, goalX);
                return;
            }
        }

        let passProb = 0.5;

        const isBlocked = this.checkFrontalBlock(player, goalX);

        if (isBlocked) {
            if (isWingerOnFlank) {
                const centralTarget = this.players.find(p =>
                    p.teamId === player.teamId && p.position === 'FW'
                    && p.y > 28 && p.y < 72
                    && !this.getRoleBehavior(p.role).hugLine
                );
                if (centralTarget) {
                    this.executePass(player, centralTarget);
                    return;
                }
                const mfTarget = this.findBestPassTarget(player, 'safe');
                if (mfTarget) {
                    this.executePass(player, mfTarget);
                    return;
                }
            }
            passProb = underPressure ? 0.75 : 0.05;
        } else {
            if (player.position === 'DF' || player.position === 'GK') {
                passProb = underPressure ? 0.98 : 0.4;
            } else {
                if (isWingerOnFlank && distToGoal > 25) {
                    const centralFW = this.players.find(p =>
                        p.teamId === player.teamId && p.position === 'FW'
                        && p.y > 28 && p.y < 72
                        && !this.getRoleBehavior(p.role).hugLine
                    );
                    passProb = centralFW ? 0.75 : 0.20;
                } else {
                    passProb = 0.15;
                }
                if (isAngleBlocked) passProb = 0.85;
                if (behavior.hugLine && isOnFlank && distToGoal < 30) {
                    const targetInBox = this.players.find(p =>
                        p.teamId === player.teamId && p.position === 'FW'
                        && Math.abs(p.y - 50) < 22
                    );
                    if (targetInBox && Math.random() < 0.65) { this.executePass(player, targetInBox); return; }
                }
                if (behavior.hugLine && isOnFlank && distToGoal > 25) {
                    passProb = isAngleBlocked ? 0.80 : 0.58;
                }
                if (typeof gameData !== 'undefined' && gameData.currentTactic === 'tikitaka') {
                    passProb = 0.25;
                }
            }
        }

        const runner = this.players.find(p => p.teamId === player.teamId && p.burstTimer > 10);
        const tacticProfile = this.getTacticProfile(player.teamId);
        if (runner && distToGoal > 30) {
            passProb = Math.max(passProb, 0.72 + tacticProfile.directness * 0.18);
        }
        passProb = Math.max(0.05, Math.min(0.96, passProb * (0.86 + tacticProfile.directness * 0.22)));

        let bestPassTarget = null;

        if (player.position === 'GK') {
            // GK는 processGoalkeeperAI에서 처리됨 (위에서 이미 return)
            bestPassTarget = this._findGKPassTarget(player, 'safe');
            if (!bestPassTarget) bestPassTarget = this._findGKPassTarget(player, 'aggressive');
            if (bestPassTarget) { this.executePass(player, bestPassTarget); return; }
            this.clearBall(player); return;
        } else {
            bestPassTarget = this.findBestPassTarget(player, 'aggressive');
            if (!bestPassTarget) bestPassTarget = this.findBestPassTarget(player, 'safe');
        }

        if (bestPassTarget && Math.random() < passProb) { this.executePass(player, bestPassTarget); return; }

        const nearestDef = this.findNearestDefender(player);
        if (nearestDef && nearestDef.dist < 7) {
            if (Math.random() < 0.05) {
                if (this.attemptTackle(nearestDef.player, player)) return;
            }
        }

        const speedFactor = effectiveSpeed / 75;
        let moveSpeed = 0.32 * Math.max(0.7, Math.min(1.4, speedFactor));
        let targetX = player.x + (moveDir * 22);
        let targetY = player.y;

        if (behavior.hugLine && isOnFlank) {
            targetY = player.y < 50 ? 4 : 96;
            moveSpeed = 0.58;
        } else if (isOneOnOne && !isBlocked && player.position === 'FW') {
            targetX = player.x + (moveDir * 35);
            moveSpeed = 0.55 * speedFactor;
        } else if (isBlocked) {
            if (canOutrun && Math.random() < 0.65) {
                targetX = player.x + (moveDir * 28); moveSpeed *= 1.4;
            } else {
                let evadeOffset = 7;
                if (nearestOpp) targetY = player.y < nearestOpp.player.y ? player.y - evadeOffset : player.y + evadeOffset;
                else targetY = player.y + (Math.random() < 0.5 ? evadeOffset : -evadeOffset);
                targetX = player.x + (moveDir * 15); moveSpeed *= 1.5;
            }
        }

        targetY = Math.max(2, Math.min(98, targetY));
        const accelX = (targetX - player.x) * moveSpeed * 0.1;
        const accelY = (targetY - player.y) * moveSpeed * 0.1;
        player.vx = (player.vx + accelX) * 0.7; player.vy = (player.vy + accelY) * 0.7;
        player.x += player.vx; player.y += player.vy;
        this.ball.lastOwner = null;
        player.x = Math.max(5, Math.min(95, player.x)); player.y = Math.max(2, Math.min(98, player.y));
        this.ball.x = player.x; this.ball.y = player.y;
        if (Math.random() < 0.2) this.eventsQueue.push({ type: 'dribble', player: player.name });
    }

    // =========================================================
    // [수정] GK 패스 우선 처리 — 걷어내기는 정말 패스 대상 없을 때만
    // =========================================================
    processGoalkeeperAI(gk, underPressure) {
        this.keepGoalkeeperHome(gk);

        // 안전 패스와 전진 패스 대상 탐색
        const safeTarget = this._findGKPassTarget(gk, 'safe');
        const aggressiveTarget = this._findGKPassTarget(gk, 'aggressive');

        // 패스 대상이 있으면 무조건 패스 (압박 여부 무관)
        // 압박받으면 안전 패스 우선, 여유 있으면 전진 패스 선호
        let target;
        if (underPressure) {
            target = safeTarget || aggressiveTarget;
        } else {
            // 여유 있을 때: 70% 확률로 전진, 30%로 안전
            target = (aggressiveTarget && Math.random() < 0.7)
                ? aggressiveTarget
                : (safeTarget || aggressiveTarget);
        }

        if (target) {
            this.executePass(gk, target);
            return;
        }

        // 패스 대상이 정말 아무도 없을 때만 걷어내기
        this.clearBall(gk);
    }

    _findGKPassTarget(gk, mode) {
        const teammates = this.players.filter(p => p.teamId === gk.teamId && p !== gk);
        const isHome = gk.teamId === 'home';
        const forwardX = isHome ? 100 : 0;

        if (mode === 'safe') {
            const dfs = teammates.filter(p => p.position === 'DF');
            if (dfs.length > 0) {
                dfs.sort((a, b) => Math.hypot(a.x - gk.x, a.y - gk.y) - Math.hypot(b.x - gk.x, b.y - gk.y));
                return dfs[0];
            }
            const mfs = teammates.filter(p => p.position === 'MF');
            if (mfs.length > 0) {
                mfs.sort((a, b) => Math.hypot(a.x - gk.x, a.y - gk.y) - Math.hypot(b.x - gk.x, b.y - gk.y));
                return mfs[0];
            }
        } else {
            let best = null, bestScore = -Infinity;
            teammates.forEach(tm => {
                if (tm.position === 'GK') return;
                const dist = Math.hypot(gk.x - tm.x, gk.y - tm.y);
                if (dist > 50) return;
                const forwardScore = Math.abs(tm.x - forwardX) < Math.abs(gk.x - forwardX) ? 30 : -10;
                let pressureScore = 0;
                this.players.forEach(opp => {
                    if (opp.teamId !== gk.teamId) {
                        const d = Math.hypot(tm.x - opp.x, tm.y - opp.y);
                        if (d < 12) pressureScore -= (12 - d) * 3;
                    }
                });
                const distScore = dist < 8 ? 20 : (dist > 35 ? -(dist - 35) * 1.5 : 15);
                const total = forwardScore + pressureScore + distScore;
                if (total > bestScore) { bestScore = total; best = tm; }
            });
            return best;
        }
        return null;
    }

    keepGoalkeeperHome(gk) {
        const homeX = gk.baseX || (gk.teamId === 'home' ? 5 : 95);
        gk.x = homeX;
        gk.y = Math.max(42, Math.min(58, 50 + (this.ball.y - 50) * 0.08));
        gk.vx = 0;
        gk.vy *= 0.2;
        if (this.ball.owner === gk) {
            this.ball.x = gk.x;
            this.ball.y = gk.y;
        }
    }

    getTeamTactic(teamId) {
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            if (teamId === userSide && gameData.currentTactic) return gameData.currentTactic;
        }
        return this.teamTactics?.[teamId] || 'balanced';
    }

    isGegenpressTeam(teamId) {
        return this.getTeamTactic(teamId) === 'gegenpress';
    }

    getTacticProfile(teamId) {
        const tactic = this.getTeamTactic(teamId);
        const profiles = {
            tikitaka:      { width: 0.82, tempo: 0.92, directness: 0.72, press: 0.78, boxPress: 0.72, attackRisk: 0.76 },
            possession:    { width: 0.86, tempo: 0.82, directness: 0.62, press: 0.62, boxPress: 0.68, attackRisk: 0.68 },
            lavolpiana:    { width: 0.90, tempo: 0.84, directness: 0.66, press: 0.58, boxPress: 0.64, attackRisk: 0.66 },
            gegenpress:    { width: 0.92, tempo: 1.16, directness: 0.88, press: 1.28, boxPress: 1.12, attackRisk: 0.92 },
            totalFootball: { width: 0.96, tempo: 1.04, directness: 0.82, press: 0.96, boxPress: 0.88, attackRisk: 0.88 },
            counter:       { width: 1.08, tempo: 1.18, directness: 1.22, press: 0.56, boxPress: 0.76, attackRisk: 0.86 },
            longBall:      { width: 1.05, tempo: 1.10, directness: 1.28, press: 0.50, boxPress: 0.72, attackRisk: 0.80 },
            twoLine:       { width: 0.92, tempo: 0.92, directness: 0.86, press: 0.46, boxPress: 0.82, attackRisk: 0.62 },
            parkBus:       { width: 0.80, tempo: 0.72, directness: 0.78, press: 0.34, boxPress: 0.92, attackRisk: 0.48 },
            catenaccio:    { width: 0.82, tempo: 0.78, directness: 0.86, press: 0.38, boxPress: 0.96, attackRisk: 0.52 },
            balanced:      { width: 0.92, tempo: 0.92, directness: 0.82, press: 0.62, boxPress: 0.72, attackRisk: 0.68 }
        };
        return profiles[tactic] || profiles.balanced;
    }

    findBestPassTarget(player, mode = 'aggressive') {
        const teamates = this.players.filter(p => p.teamId === player.teamId && p !== player);
        let bestTarget = null;
        let maxScore = -Infinity;
        const isHome = player.teamId === 'home';
        const forwardX = isHome ? 100 : 0;
        const passerOnFlank = player.y < 25 || player.y > 75;
        const passerIsWide = passerOnFlank || this.getRoleBehavior(player.role).hugLine;

        const oppFieldPlayers = this.players.filter(p => p.teamId !== player.teamId && p.position !== 'GK');
        let oppDefLineX;
        if (isHome) {
            const sorted = oppFieldPlayers.map(p => p.x).sort((a, b) => a - b);
            oppDefLineX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 85);
        } else {
            const sorted = oppFieldPlayers.map(p => p.x).sort((a, b) => b - a);
            oppDefLineX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 15);
        }

        const nearbyOppsCount = this.players.filter(p =>
            p.teamId !== player.teamId && Math.hypot(p.x - player.x, p.y - player.y) < 15
        ).length;

        const playerBehavior = this.getRoleBehavior(player.role);

        teamates.forEach(tm => {
            const distBefore = Math.abs(player.x - forwardX);
            const distAfter = Math.abs(tm.x - forwardX);
            let forwardScore = (distBefore - distAfter);

            const isBehindDefLine = isHome ? (tm.x > oppDefLineX) : (tm.x < oppDefLineX);

            const weHaveBall = this.ball.owner && this.ball.owner.teamId === player.teamId;
            const ballInFlight = this.ball.state === BallState.IN_FLIGHT
                && this.ball.lastOwner && this.ball.lastOwner.teamId === player.teamId;
            const ourPossession = weHaveBall || ballInFlight;

            const isIsolatedFW = tm.position === 'FW' && !ourPossession && isBehindDefLine;

            if (tm.burstTimer > 0 && ourPossession) forwardScore += isBehindDefLine ? 300 : 150;

            if (isIsolatedFW) forwardScore -= 400;

            const isPenetrating = tm.position === 'FW' && (isHome ? tm.vx > 0.1 : tm.vx < -0.1);
            if (isPenetrating && ourPossession) forwardScore += 35;

            const isCentralFWTarget = tm.position === 'FW'
                && tm.y > 28 && tm.y < 72
                && !this.getRoleBehavior(tm.role).hugLine;

            let switchBonus = 0;
            if (isCentralFWTarget && passerOnFlank) switchBonus = 250;
            else if (nearbyOppsCount >= 1 && Math.abs(player.y - tm.y) > 35 && !isCentralFWTarget) switchBonus = -100;

            if (mode === 'safe') {
                forwardScore *= 0.5;
            } else {
                forwardScore *= 8.0;
                if (distAfter > distBefore) forwardScore -= 40;
            }

            const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
            let distScore = 0;

            const isShortPassToCentralFW = isCentralFWTarget && passerOnFlank && dist < 10;
            if (isShortPassToCentralFW) distScore = 10;
            else if (dist < 10) distScore = -50;
            else if (dist > 25) distScore = -(dist - 25) * 2.0;
            else distScore = 40;

            if (isBehindDefLine && tm.burstTimer > 0 && ourPossession) {
                if (dist > 25) distScore = -(dist - 25) * 0.5;
                if (dist > 40) distScore = -(dist - 40) * 1.5;
            }

            if (isCentralFWTarget && dist > 10 && dist <= 35) distScore = Math.max(distScore, 20);

            if (dist > 20 && distAfter > distBefore) distScore -= 200;
            if (player.position === 'DF' && tm.position === 'FW' && dist > 35) distScore -= 40;
            if ((player.position === 'DF' || player.position === 'GK') && isIsolatedFW && dist > 25) distScore -= 300;
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

            if (isBehindDefLine && tm.burstTimer > 0 && ourPossession) pressureScore *= 0.3;
            else if (mode === 'safe') pressureScore *= 2.0;

            let loopPenalty = 0;
            if (this.ball.lastOwner === tm) loopPenalty = mode === 'aggressive' ? 120 : 60;

            const tmBehavior = this.getRoleBehavior(tm.role);
            if (playerBehavior.hugLine && tmBehavior.hugLine) {
                if (Math.abs(player.y - tm.y) > 40) loopPenalty += 600;
                if (Math.sign(player.y - 50) === Math.sign(tm.y - 50)) loopPenalty += 300;
            }

            let positionBonus = 0;
            if (player.position === 'DF') {
                if (tm.position === 'MF') positionBonus = 5;
                else if (tm.position === 'DF') positionBonus = 3;
            }
            if (player.position === 'GK' && tm.position === 'DF') positionBonus = 5;
            if (passerOnFlank && tm.position === 'FW' && isCentralFWTarget) positionBonus += 120;
            if (passerOnFlank && tm.position === 'MF') positionBonus += 70;
            if (player.position !== 'GK' && tm.position === 'FW' && isCentralFWTarget) positionBonus += 90;
            if (player.position === 'MF' && tm.position === 'FW' && isCentralFWTarget) positionBonus += 180;
            if (tm.position === 'MF' && (isHome ? tm.x > 78 : tm.x < 22)) positionBonus -= 180;

            if (isCentralFWTarget) {
                if (passerOnFlank)                   positionBonus += 150;
                else if (player.position === 'MF')   positionBonus += 80;
                else if (player.position === 'FW')   positionBonus += 50;
            }

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
        this.ball.state = BallState.IN_FLIGHT; this.ball.owner = null; this.ball.lastOwner = player;
        this.ball.targetPos = { x: targetX, y: targetY };
        this.eventsQueue.push({ type: 'pass', from: player.name, to: '걷어내기', desc: `${player.name}, 위험 지역을 벗어나게 걷어냅니다.` });
    }

    executePass(from, to) {
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.lastOwner = from; this.ball.intendedReceiver = to; this.ball.owner = null;
        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        let accuracy = from.stats.passing;
        if (to.burstTimer > 0) accuracy += 30;

        const isHome = from.teamId === 'home';
        const forwardX = isHome ? 100 : 0;
        const distToGoalFrom = Math.abs(from.x - forwardX);
        const distToGoalTo = Math.abs(to.x - forwardX);

        const oppFieldPlayers = this.players.filter(p => p.teamId !== from.teamId && p.position !== 'GK');
        let oppDefLineX;
        if (isHome) {
            const sorted = oppFieldPlayers.map(p => p.x).sort((a, b) => a - b);
            oppDefLineX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 85);
        } else {
            const sorted = oppFieldPlayers.map(p => p.x).sort((a, b) => b - a);
            oppDefLineX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 15);
        }
        const isReceiverBehindDefLine = isHome ? (to.x > oppDefLineX) : (to.x < oppDefLineX);
        const MAX_THROUGH_PASS_DIST = 40;
        const isThroughPass = isReceiverBehindDefLine
            && (distToGoalFrom - distToGoalTo > 5) && dist > 10
            && distToGoalFrom < 65 && dist <= MAX_THROUGH_PASS_DIST;

        const distPenalty = Math.max(0, (dist - 20) * 0.8);
        let successChance = accuracy - distPenalty;
        if (from.position === 'GK' && dist > 50) successChance -= 15;

        let eventType = 'pass';
        let eventDesc = `${from.name}, ${to.name}에게 연결!`;
        if (isThroughPass) {
            eventType = 'throughpass';
            if (accuracy > 75) successChance += (accuracy - 75) * 1.5;
            if (to.burstTimer > 0) successChance += 15;
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
            this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: isThroughPass ? `${from.name}의 스루패스가 차단됩니다.` : `${from.name}, 패스 미스!` });
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
        let goalChance = 0.25 + (powerDiff * 0.0045);
        goalChance = Math.max(0.04, Math.min(0.76, goalChance));
        this.ball.state = BallState.IN_FLIGHT; this.ball.owner = null;
        this.ball.targetPos = { x: goalX, y: 45 + Math.random() * 10 };
        this.pendingShot = { isGoal: Math.random() < goalChance, shooter, goalX };
    }

    handleShotResult() {
        const { isGoal, shooter, goalX } = this.pendingShot;
        this.pendingShot = null;
        if (isGoal) {
            if (shooter.teamId === 'home') this.homeScore++; else this.awayScore++;
            this.ball.intendedReceiver = null;
            const isHome = shooter.teamId === 'home';
            const myScore = isHome ? this.homeScore : this.awayScore;
            const oppScore = isHome ? this.awayScore : this.homeScore;
            let assister = null;
            if (this.ball.lastOwner && this.ball.lastOwner.teamId === shooter.teamId && this.ball.lastOwner.name !== shooter.name)
                assister = this.ball.lastOwner.name;
            this.celebrationType = (myScore < oppScore) ? 'quick_restart' : 'celebrate';
            this.celebrationActor = shooter;
            if (this.celebrationType === 'quick_restart') {
                this.celebrationTarget = { x: 50, y: 50 };
            } else {
                const gX = isHome ? 100 : 0;
                const cornerY = (shooter.y < 50) ? 0 : 100;
                this.celebrationTarget = { x: gX, y: cornerY };
            }
            this.eventsQueue.push({ type: 'goal', scorer: shooter.name, team: shooter.teamId, assister });
            this.lastScorerTeam = shooter.teamId;
            this.celebrationTimer = 40;
            this.ball.state = BallState.DEAD; this.ball.lastOwner = null;
        } else {
            this.ball.intendedReceiver = null;
            shooter.forceReturnTimer = 60;
            const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
            const isHomeAttacking = shooter.teamId === 'home';
            const enemyGk = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');
            const defenders = this.players.filter(p =>
                p.teamId === opponentTeamId && p.position !== 'GK'
                && Math.abs(p.x - shooter.x) < 15 && Math.abs(p.y - shooter.y) < 5
            );
            const blockingDefenders = defenders.filter(p => isHomeAttacking ? (p.x > shooter.x) : (p.x < shooter.x));
            if (blockingDefenders.length > 0 && Math.random() < 0.1) {
                const blocker = blockingDefenders[0];
                this.eventsQueue.push({ type: 'block', shooter: shooter.name, blocker: blocker.name, desc: `🛡️ ${blocker.name}, 몸을 날려 슈팅을 막아냅니다!` });
                this.ball.state = BallState.LOOSE; this.ball.owner = null;
                this.ball.x = blocker.x + (isHomeAttacking ? -5 : 5);
                this.ball.y = blocker.y + (Math.random() - 0.5) * 15;
                return;
            }
            if (enemyGk) {
                const shotTargetY = this.ball.targetPos.y;
                const gkBaseX = enemyGk.teamId === 'home' ? 5 : 95;
                const maxGkSlide = 15;
                const newGkY = Math.max(50 - maxGkSlide, Math.min(50 + maxGkSlide, shotTargetY));
                enemyGk.x = gkBaseX; enemyGk.y = newGkY;
                this.ball.x = enemyGk.x; this.ball.y = enemyGk.y;
                if (Math.random() < 0.15) {
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: enemyGk.name, desc: `🧤 ${enemyGk.name}, 슈팅을 펀칭으로 쳐냅니다!` });
                    this.ball.state = BallState.LOOSE; this.ball.owner = null;
                    this.ball.x = enemyGk.x + (isHomeAttacking ? -10 : 10);
                    this.ball.y = enemyGk.y + (Math.random() - 0.5) * 30;
                } else {
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: enemyGk.name, desc: `🧤 ${enemyGk.name}, 안정적으로 공을 잡아냅니다.` });
                    this.ball.state = BallState.CONTROLLED; this.ball.owner = enemyGk;
                    this.ball.x = enemyGk.x; this.ball.y = enemyGk.y;
                }
            } else {
                this.eventsQueue.push({ type: 'miss', shooter: shooter.name, desc: `🥅 ${shooter.name}의 슈팅이 골문을 벗어납니다.` });
                this.ball.state = BallState.LOOSE;
                this.ball.x = goalX === 0 ? 5 : 95; this.ball.y = 50;
            }
        }
    }

    processCelebrationMovement() {
        if (!this.celebrationActor || !this.celebrationTarget) return;
        const p = this.celebrationActor;
        const target = this.celebrationTarget;
        const dx = target.x - p.x, dy = target.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1) { const speed = 1.2; p.x += (dx / dist) * speed; p.y += (dy / dist) * speed; }
        if (this.celebrationType === 'quick_restart') { this.ball.x = p.x; this.ball.y = p.y; }
        this.players.forEach(tm => {
            if (tm.teamId === p.teamId && tm !== p) {
                if (this.celebrationType === 'celebrate') {
                    const ddx = p.x - tm.x, ddy = p.y - tm.y, d = Math.hypot(ddx, ddy);
                    if (d > 3) { tm.x += (ddx / d) * 0.9; tm.y += (ddy / d) * 0.9; }
                } else {
                    const ddx = tm.baseX - tm.x, ddy = tm.baseY - tm.y, d = Math.hypot(ddx, ddy);
                    if (d > 1) { tm.x += (ddx / d) * 1.0; tm.y += (ddy / d) * 1.0; }
                }
            }
        });
    }

    processOffBallAI() {
        let attackingTeam = null;
        if (this.ball.owner) attackingTeam = this.ball.owner.teamId;
        else if (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner) attackingTeam = this.ball.lastOwner.teamId;
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

        let nearestHome = null, nearestAway = null;
        if (isLooseBall) {
            let minDHome = 999, minDAway = 999;
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (p.teamId === 'home') { if (d < minDHome) { minDHome = d; nearestHome = p; } }
                else { if (d < minDAway) { minDAway = d; nearestAway = p; } }
            });
        }

        this.players.forEach(p => {
            if (p === this.ball.owner) return;
            const behavior = this.getRoleBehavior(p.role);
            let targetX = p.x, targetY = p.y;
            const effectiveSpeed = this.getEffectiveStat(p, 'speed');
            const speedFactor = effectiveSpeed / 75;
            let moveSpeed = 0.22 * Math.max(0.7, Math.min(1.4, speedFactor));

            const isAttacking = (p.teamId === attackingTeam);
            const isHomeDef = p.teamId === 'home';

            if (isLooseBall) {
                const isNearest = (p === nearestHome || p === nearestAway);
                if (isNearest) { targetX = this.ball.x; targetY = this.ball.y; moveSpeed = 0.55; }
                else {
                    targetX = p.baseX + (this.ball.x - p.baseX) * 0.15;
                    targetY = p.baseY + (this.ball.y - p.baseY) * 0.15;
                    moveSpeed = 0.15;
                }
            } else if (isAttacking) {
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
                    } else if (p.position === 'FW') {
                        if (!p.burstTimer) p.burstTimer = 0;
                        if (!p.forceReturnTimer) p.forceReturnTimer = 0;

                        if (p.forceReturnTimer > 0) {
                            p.forceReturnTimer--;
                            p.burstTimer = 0;
                            const isHomeFW = p.teamId === 'home';
                            const ourTeamPlayers = this.players.filter(q => q.teamId === p.teamId && q !== p);
                            let safeReturnX;
                            if (isHomeFW) {
                                const sorted = ourTeamPlayers.map(q => q.x).sort((a, b) => a - b);
                                safeReturnX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 30);
                                safeReturnX = Math.min(safeReturnX, p.baseX);
                            } else {
                                const sorted = ourTeamPlayers.map(q => q.x).sort((a, b) => b - a);
                                safeReturnX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 70);
                                safeReturnX = Math.max(safeReturnX, p.baseX);
                            }
                            targetX = safeReturnX;
                            targetY = p.baseY;
                            moveSpeed = 0.8 * speedFactor;

                            const isHomeFW2 = (p.teamId === 'home');
                            const tooFarForward = isHomeFW2 ? (p.x > safeReturnX + 2) : (p.x < safeReturnX - 2);
                            if (tooFarForward) {
                                const pullDir = isHomeFW2 ? -1 : 1;
                                const pullSpeed = 4.0 * speedFactor;
                                p.x += pullDir * pullSpeed;
                            }
                        } else {
                            const isCentralFW = !behavior.hugLine;
                            const offsideLimitX = this._calcOffsideLineX(isHome);

                            if (p.burstTimer > 0) p.burstTimer--;
                            if (p.burstTimer === 0) {
                                const ballCarrier = this.ball.owner;
                                const hasFriendlyBall = ballCarrier && ballCarrier.teamId === p.teamId;
                                let burstChance = hasFriendlyBall && ballCarrier.position !== 'FW'
                                    ? (isCentralFW ? 0.14 : 0.06)
                                    : (isCentralFW ? 0.04 : 0.02);
                                if (behavior.runBehind) burstChance *= 1.5;
                                if (Math.random() < burstChance) p.burstTimer = 30;
                            }

                            let ballPushX = this.ball.x + (forwardDir * 18);
                            targetX = ballPushX;

                            const ballCarrier = this.ball.owner;
                            const hasFriendlyBall = ballCarrier && ballCarrier.teamId === p.teamId;
                            const ballBehind = isHome ? (this.ball.x < p.x - 10) : (this.ball.x > p.x + 10);

                            if (!hasFriendlyBall && ballBehind) {
                                const ourTeamPlayers = this.players.filter(q => q.teamId === p.teamId && q !== p);
                                let safeReturnX;
                                if (isHome) {
                                    const sorted = ourTeamPlayers.map(q => q.x).sort((a, b) => a - b);
                                    safeReturnX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 30);
                                    safeReturnX = Math.min(safeReturnX, p.baseX);
                                } else {
                                    const sorted = ourTeamPlayers.map(q => q.x).sort((a, b) => b - a);
                                    safeReturnX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 70);
                                    safeReturnX = Math.max(safeReturnX, p.baseX);
                                }
                                targetX = safeReturnX;
                                targetY = p.baseY;
                                moveSpeed = 0.9 * speedFactor;

                                const tooFarForward = isHome ? (p.x > safeReturnX + 1) : (p.x < safeReturnX - 1);
                                if (tooFarForward) {
                                    const pullDir = isHome ? -1 : 1;
                                    p.x += pullDir * 5.0 * speedFactor;
                                    p.vx = pullDir * 2.0;
                                }
                            } else if (isCentralFW) {
                                const cfTargetX = isHome
                                    ? Math.min(this.ball.x + 12, offsideLimitX - 2)
                                    : Math.max(this.ball.x - 12, offsideLimitX + 2);
                                targetX = isHome ? Math.max(targetX, cfTargetX) : Math.min(targetX, cfTargetX);
                            } else {
                                const fwMinX = isHome
                                    ? Math.max(this.ball.x - 10, this.ball.x + 5)
                                    : Math.min(this.ball.x + 10, this.ball.x - 5);
                                targetX = isHome ? Math.max(targetX, fwMinX) : Math.min(targetX, fwMinX);
                            }

                            if (p.burstTimer > 0) moveSpeed = 0.4 * speedFactor;

                            targetX = isHome
                                ? Math.min(targetX, offsideLimitX - 1)
                                : Math.max(targetX, offsideLimitX + 1);

                            this._enforceOffsideLine(p, isHome);

                            const nearOpp = this.findNearestDefender(p);
                            let avoidY = 0;
                            if (nearOpp && nearOpp.dist < 4) avoidY = (p.y > nearOpp.player.y) ? 4 : -4;

                            const yRange = isCentralFW ? 20 : 6;
                            const yBallPull = isCentralFW ? (this.ball.y - p.baseY) * 0.30 : 0;
                            targetY = Math.max(
                                p.baseY - yRange,
                                Math.min(p.baseY + yRange, p.baseY + avoidY + yBallPull)
                            );
                            if (behavior.hugLine) { targetY = p.baseY < 50 ? 5 : 95; targetX += (forwardDir * 8); }

                            targetX = isHome
                                ? Math.min(targetX, offsideLimitX - 1)
                                : Math.max(targetX, offsideLimitX + 1);

                            moveSpeed = 0.28 * speedFactor;
                        }
                    } else if (p.position === 'MF') {
                        const attackBias = behavior.attackBias || 0;
                        const defenseBias = behavior.defenseBias || 0;
                        let ballWeight = 0.6 + (attackBias * 0.4) - (defenseBias * 0.3);
                        ballWeight = Math.max(0.2, Math.min(0.95, ballWeight));
                        targetX = (p.baseX * (1 - ballWeight)) + (this.ball.x * ballWeight);
                        targetY = (p.baseY * (1 - ballWeight)) + (this.ball.y * ballWeight);
                        if (attackBias > 0.3) targetX += (forwardDir * attackBias * 12);
                        if (Math.abs(p.y - this.ball.y) < 3) targetY += (p.y > 50 ? 4 : -4);
                        const mfMaxX = isHome ? 74 : 26;
                        targetX = isHome ? Math.min(targetX, mfMaxX) : Math.max(targetX, mfMaxX);
                    } else if (p.position === 'DF') {
                        const lineTactic = gameData.deepTactics?.defensiveLine || 'standard';
                        let safetyDist = 22;
                        if (lineTactic === 'high') safetyDist = 14;
                        else if (lineTactic === 'deep') safetyDist = 32;
                        const isHome2 = p.teamId === 'home';
                        if (isHome2) targetX = Math.min(75, Math.max(p.baseX, this.ball.x - safetyDist));
                        else targetX = Math.max(25, Math.min(p.baseX, this.ball.x + safetyDist));

                        const isCB = ['CD', 'BPD', 'NCB'].includes(p.role);
                        if (isCB) {
                            const centralY = 50;
                            const tightness = 0.85;
                            targetY = p.baseY * (1 - tightness) + centralY * tightness;
                            targetY = Math.max(35, Math.min(65, targetY));
                        } else {
                            targetY = p.baseY;
                        }
                    } else if (p.position === 'GK') {
                        targetX = p.baseX;
                        targetY = 50 + (this.ball.y - 50) * 0.05;
                    }
                    if (behavior.cutInside) targetY = 50 + (p.baseY - 50) * 0.5;
                    else if (behavior.hugLine) targetY = p.baseY < 50 ? 5 : 95;
                }

            } else {
                // ─── 수비 전환 ───
                if (p.position === 'FW') {
                    p.burstTimer = 0;

                    const isHomeFW = (p.teamId === 'home');
                    const ourTeamPlayers = this.players.filter(q => q.teamId === p.teamId && q !== p);
                    let safeReturnX;
                    if (isHomeFW) {
                        const sorted = ourTeamPlayers.map(q => q.x).sort((a, b) => a - b);
                        safeReturnX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 30);
                        safeReturnX = Math.min(safeReturnX, p.baseX);
                        safeReturnX = Math.max(safeReturnX, 10);
                    } else {
                        const sorted = ourTeamPlayers.map(q => q.x).sort((a, b) => b - a);
                        safeReturnX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 70);
                        safeReturnX = Math.max(safeReturnX, p.baseX);
                        safeReturnX = Math.min(safeReturnX, 90);
                    }

                    targetX = safeReturnX;
                    targetY = p.baseY;
                    moveSpeed = 0.7 * speedFactor;

                    const tooFarForward = isHomeFW ? (p.x > safeReturnX + 5) : (p.x < safeReturnX - 5);
                    if (tooFarForward) {
                        const pullDir = isHomeFW ? -1 : 1;
                        const pullSpeed = 3.5 * speedFactor;
                        p.x += pullDir * pullSpeed;
                        p.vx = pullDir * pullSpeed * 0.5;
                    }

                    if (isHomeFW) {
                        p.x = Math.min(p.x, safeReturnX);
                        if (p.vx > 0) p.vx = 0;
                    } else {
                        p.x = Math.max(p.x, safeReturnX);
                        if (p.vx < 0) p.vx = 0;
                    }

                } else {
                    let shiftFactor = 0.7, yShiftFactor = 0.2;
                    if (p.position === 'MF') {
                        shiftFactor = Math.max(0.6, Math.min(1.1, 0.95 + (behavior.defenseBias || 0) * 0.1 - (behavior.attackBias || 0) * 0.2));
                        moveSpeed = 0.22 * (1 + (behavior.defenseBias || 0));
                    } else if (p.position === 'DF') { shiftFactor = 0.75; yShiftFactor = 0.05; }

                    const isGKPossession = this.ball.owner && this.ball.owner.position === 'GK';
                    const refBallX = (this.pendingShot || isGKPossession) ? 50 : Math.max(30, Math.min(70, this.ball.x));
                    const isSpecialCase = (this.pendingShot || isGKPossession);
                    let formationX = p.baseX + (refBallX - 50) * shiftFactor;
                    let formationY = p.baseY + ((this.pendingShot ? 50 : this.ball.y) - 50) * yShiftFactor;

                    const isCB = ['CD', 'BPD', 'NCB'].includes(p.role);

                    let markTarget = null;
                    if (!isSpecialCase && p.position === 'DF') {
                        const alreadyMarked = new Set();
                        this.players.forEach(ally => {
                            if (ally.teamId === p.teamId && ally !== p && ally.position === 'DF'
                                && typeof ally._markTargetId === 'string') {
                                alreadyMarked.add(ally._markTargetId);
                            }
                        });

                        let minM = 999;
                        this.players.forEach(opp => {
                            if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                                if (alreadyMarked.has(opp.id)) return;

                                // =========================================================
                                // [수정] CB는 중앙 공격수만 마크, 윙어(hugLine) 제외
                                // =========================================================
                                if (isCB) {
                                    const oppBehavior = this.getRoleBehavior(opp.role);
                                    if (oppBehavior.hugLine) return; // 윙어 마킹 제외
                                    // 중앙 영역(Y: 25~75)에 있는 공격수만 마크
                                    if (opp.y < 20 || opp.y > 80) return;
                                }

                                const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                                const inDangerZone = isHomeDef ? (opp.x < 40) : (opp.x > 60);
                                if (inDangerZone && d < minM) { minM = d; markTarget = opp; }
                            }
                        });
                        p._markTargetId = markTarget ? markTarget.id : null;

                    } else if (!isSpecialCase && p.position !== 'GK') {
                        let minM = 30;
                        this.players.forEach(opp => {
                            if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                                const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                                if (Math.abs(p.y - opp.y) <= 20 && d < minM) { minM = d; markTarget = opp; }
                            }
                        });
                    }

                    if (markTarget && p.position !== 'GK') {
                        const gX = p.teamId === 'home' ? 0 : 100;
                        const markX = markTarget.x + (gX - markTarget.x) * 0.15;
                        const markY = markTarget.y;
                        targetX = markX; targetY = markY;
                        moveSpeed = p.position === 'DF' ? 0.35 : 0.06;

                        if (p.position === 'DF') {
                            const isPen = p.teamId === 'home' ? (targetX < formationX) : (targetX > formationX);
                            targetX = isPen
                                ? (targetX * 0.85 + formationX * 0.15)
                                : (targetX * 0.3 + formationX * 0.7);
                        }
                    } else { targetX = formationX; targetY = formationY; }

                    if (p.position === 'GK') {
                        const gX = p.teamId === 'home' ? 5 : 95;
                        targetX = gX; targetY = 50 + (this.ball.y - 50) * 0.05;
                    }
                    if (this.ball.owner && p.position !== 'GK' && !isSpecialCase) {
                        const dB = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                        const shouldStep = (p === presser) || ((isHomeDef ? this.ball.x < 35 : this.ball.x > 65) && dB < 15 && p.position === 'DF');
                        if (shouldStep) {
                            const iX = (this.ball.x * 0.9) + (isHomeDef ? 0 : 100) * 0.1;
                            const dx = iX - p.x, dy = (this.ball.y * 0.9 + 50 * 0.1) - p.y;
                            const d = Math.hypot(dx, dy), sS = 2.3 * speedFactor;
                            if (d > 0) { p.x += (dx / d) * sS; p.y += (dy / d) * sS; }
                            let tC = dB < 2 ? 0.2 : 0.05;
                            if (dB < 5 && Math.random() < tC) this.attemptTackle(p, this.ball.owner);
                            return;
                        }
                    }
                    const isBeaten = p.position === 'DF' && !isSpecialCase && (isHomeDef ? (this.ball.x < p.x - 2) : (this.ball.x > p.x + 2));
                    if (isBeaten && !isSpecialCase) {
                        const rX = this.ball.x + (isHomeDef ? -15 : 15), dx = rX - p.x, dy = this.ball.y - p.y;
                        const d = Math.hypot(dx, dy), rS = 2.2 * speedFactor;
                        if (d > 0) { p.x += (dx / d) * rS; p.y += (dy / d) * rS; }
                        return;
                    }
                }
            }

            // CB 간격 보정
            const MIN_DF_GAP = 2.0;
            const MAX_DF_GAP = 4.0;
            const isMarkingCB = p.position === 'DF' && typeof p._markTargetId === 'string';
            const isCB = ['CD', 'BPD', 'NCB'].includes(p.role);
            const teammates = this.players.filter(tm => tm.teamId === p.teamId && tm !== p);
            for (const tm of teammates) {
                if (p.position === 'DF' && tm.position === 'DF') {
                    const isOtherCB = ['CD', 'BPD', 'NCB'].includes(tm.role);
                    const gapMin = (isCB && isOtherCB) ? 2.0 : (isMarkingCB ? 1.5 : MIN_DF_GAP);
                    const gapMax = (isCB && isOtherCB) ? 4.0 : 6.0;

                    const dyT = targetY - tm.y;
                    const absT = Math.abs(dyT);
                    const dirT = dyT >= 0 ? 1 : -1;

                    if (absT < gapMin) targetY = tm.y + dirT * gapMin;
                    else if (absT > gapMax) targetY = tm.y + dirT * gapMax;

                    if (isCB && isOtherCB) {
                        const dyP = p.y - tm.y;
                        const absP = Math.abs(dyP);
                        const dirP = dyP >= 0 ? 1 : -1;
                        if (absP > gapMax + 0.5) {
                            p.y = tm.y + dirP * (gapMax + 0.5);
                            p.vy *= 0.1;
                        }
                    }
                    continue;
                }
                const d = Math.hypot(targetX - tm.x, targetY - tm.y);
                if (d < 5) {
                    const a = Math.atan2(targetY - tm.y, targetX - tm.x);
                    targetX += Math.cos(a) * (5 - d) * 0.5; targetY += Math.sin(a) * (5 - d) * 0.5;
                }
            }

            targetY = Math.max(2, Math.min(98, targetY)); targetX = Math.max(2, Math.min(98, targetX));
            const aX = (targetX - p.x) * moveSpeed * 0.1, aY = (targetY - p.y) * moveSpeed * 0.1;
            p.vx = (p.vx + aX) * 0.7; p.vy = (p.vy + aY) * 0.7;
            p.x += p.vx; p.y += p.vy;
        });
    }

    _calcOffsideLineX(isHomeFW) {
        const defendingTeamId = isHomeFW ? 'away' : 'home';
        const allDefenders = this.players.filter(q => q.teamId === defendingTeamId);
        let offsideLimitX;
        if (isHomeFW) {
            const sorted = allDefenders.map(q => q.x).sort((a, b) => a - b);
            offsideLimitX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 90);
            offsideLimitX = Math.min(offsideLimitX, 88);
        } else {
            const sorted = allDefenders.map(q => q.x).sort((a, b) => b - a);
            offsideLimitX = sorted.length >= 2 ? sorted[1] : (sorted[0] ?? 10);
            offsideLimitX = Math.max(offsideLimitX, 12);
        }
        return offsideLimitX;
    }

    _enforceOffsideLine(player, isHomeFW) {
        const offsideLimitX = this._calcOffsideLineX(isHomeFW);
        const isOffside = isHomeFW ? (player.x > offsideLimitX) : (player.x < offsideLimitX);
        if (isOffside) {
            if (isHomeFW) {
                player.x = Math.min(player.x, offsideLimitX - 1);
            } else {
                player.x = Math.max(player.x, offsideLimitX + 1);
            }
            player.vx *= 0.1;
        }
        return offsideLimitX;
    }

    checkFrontalBlock(player, goalX) {
        const forwardDir = player.teamId === 'home' ? 1 : -1;
        const checkDist = 8, checkWidth = 4;
        const minY = player.y - checkWidth, maxY = player.y + checkWidth;
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
            return { x: defLineX + (forwardDir * (5 + attackBonus)), y: this.ball.y + (Math.random() - 0.5) * 20 };
        } else if (runType === RUN_TYPE.SUPPORT_RUN) {
            const side = player.baseY < 50 ? 'top' : 'bottom';
            return { x: this.ball.x + (-forwardDir * 10), y: this.ball.y + (side === 'top' ? -1 : 1) * 10 };
        } else if (runType === RUN_TYPE.CHANNEL_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            return { x: defLineX + (forwardDir * 2), y: this.ball.y < 50 ? 70 : 30 };
        } else if (runType === RUN_TYPE.WIDE_RUN) {
            return { x: this.ball.x + (forwardDir * 5), y: player.baseY < 50 ? 5 : 95 };
        } else if (runType === RUN_TYPE.UNDERLAP_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            return { x: defLineX + (forwardDir * 5), y: player.baseY < 50 ? 30 : 70 };
        } else {
            return { x: player.baseX + (this.ball.x - player.baseX) * 0.2, y: player.baseY + (this.ball.y - player.baseY) * 0.2 };
        }
    }

    getDefensiveLineX(opposingTeamId) {
        const relevant = this.players.filter(p => p.teamId === opposingTeamId && p.position !== 'GK');
        const xs = relevant.map(p => p.x);
        return opposingTeamId === 'away' ? Math.min(...xs) : Math.max(...xs);
    }

    applyOffsideCheck(targetPos, player) {
        const opposingTeamId = player.teamId === 'home' ? 'away' : 'home';
        const opponents = this.players.filter(p => p.teamId === opposingTeamId);
        if (player.teamId === 'home') {
            opponents.sort((a, b) => b.x - a.x);
            if (opponents.length < 2) return targetPos;
            const limitX = Math.max(opponents[1].x, this.ball.x);
            if (targetPos.x > limitX) targetPos.x = limitX - 2;
        } else {
            opponents.sort((a, b) => a.x - b.x);
            if (opponents.length < 2) return targetPos;
            const limitX = Math.min(opponents[1].x, this.ball.x);
            if (targetPos.x < limitX) targetPos.x = limitX + 2;
        }
        return targetPos;
    }

    findNearestDefender(attacker) {
        let nearest = null, minDst = 999;
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
                    const interceptChance = 0.01 + (this.getEffectiveStat(p, 'defense') / 2500);
                    if (Math.random() < interceptChance) {
                        this.ball.state = BallState.CONTROLLED; this.ball.owner = p;
                        this.ball.intendedReceiver = null; this.ball.lastOwner = null;
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
            'BBM':{ runBehind: false, pressBias: 0.1, attackBias: 0.3, defenseBias: 0.3 },
            'MEZ':{ cutInside: true, attackBias: 0.5, defenseBias: 0.1 },
            'DLP':{ comeShort: true, passBias: 0.3, defenseBias: 0.4 },
            'AP': { comeShort: true, passBias: 0.2, dribbleBias: 0.1, attackBias: 0.4, defenseBias: 0.1 },
            'BWM':{ pressBias: 0.3, passBias: -0.1, defenseBias: 0.5 },
            'REG':{ passBias: 0.4, defenseBias: 0.3 },
            'CAR':{ comeShort: true, defenseBias: 0.4 },
            'EG': { comeShort: true, attackBias: 0.3 },
            'SS': { runBehind: true, attackBias: 0.6 },
            'ANC':{ defenseBias: 0.6 },
            'DM': { defenseBias: 0.5 },
            'SV': { runBehind: true, attackBias: 0.4, defenseBias: 0.3 },
            'BPD':{ passBias: 0.1 },
            'CD': { passBias: -0.1 },
            'WB': { hugLine: true, overlap: true, dribbleBias: 0.1 },
            'CWB':{ hugLine: true, overlap: true, dribbleBias: 0.15 },
            'FB': { overlap: false },
            'IWB':{ cutInside: true },
            'NCB':{ passBias: -0.3 }
        };
        return behaviors[role] || {};
    }

    attemptTackle(defender, attacker) {
        const defStat = this.getEffectiveStat(defender, 'defense');
        const atkStat = this.getEffectiveStat(attacker, 'decision');
        const atkSpeed = this.getEffectiveStat(attacker, 'speed');
        const speedBonus = (atkSpeed / 100) * 30;
        if (attacker && defStat * Math.random() > (atkStat + speedBonus) * Math.random()) {
            this.ball.owner = defender; this.ball.lastOwner = null;
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
                p.lapOrder = i * 0.2; p.radiusNoise = (Math.random() - 0.5) * 6;
                const startAngle = Math.PI / 2 + p.lapOrder;
                p.exitTargetX = 50 + Math.cos(startAngle) * (35 + p.radiusNoise);
                p.exitTargetY = 50 + Math.sin(startAngle) * (30 + p.radiusNoise);
            });
            this.players.filter(p => p.teamId !== 'home').forEach(p => {
                p.exitTargetX = 50 + (Math.random() - 0.5) * 40; p.exitTargetY = -20;
            });
        } else { this.initExitMovement(); }
    }

    initExitMovement() {
        this.postMatchPhase = 3;
        const exitY = Math.random() < 0.5 ? -20 : 120;
        this.players.forEach(p => { p.exitTargetX = 50 + (Math.random() - 0.5) * 10; p.exitTargetY = exitY; });
    }

    updatePostMatch() {
        if (this.postMatchPhase === 1) {
            let allAligned = true;
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    const dx = p.exitTargetX - p.x, dy = p.exitTargetY - p.y, dist = Math.hypot(dx, dy);
                    if (dist > 3) { p.x += (dx / dist) * 0.8; p.y += (dy / dist) * 0.8; allAligned = false; }
                } else { p.y -= 0.8; }
            });
            if (allAligned) { this.postMatchPhase = 2; this.lapAngle = Math.PI / 2; }
        } else if (this.postMatchPhase === 2) {
            this.lapAngle -= 0.015;
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    const currentAngle = this.lapAngle + p.lapOrder;
                    const targetX = 50 + Math.cos(currentAngle) * (40 + p.radiusNoise);
                    const targetY = 50 + Math.sin(currentAngle) * (35 + p.radiusNoise);
                    p.x += (targetX - p.x) * 0.1; p.y += (targetY - p.y) * 0.1;
                } else { p.y -= 0.8; }
            });
            if (this.lapAngle < -Math.PI * 1.5) this.initExitMovement();
        } else if (this.postMatchPhase === 3) {
            this.players.forEach(p => {
                const dx = p.exitTargetX - p.x, dy = p.exitTargetY - p.y, dist = Math.hypot(dx, dy);
                if (dist > 1) { p.x += (dx / dist) * 0.7; p.y += (dy / dist) * 0.7; }
            });
        }
        return this.getSnapshot();
    }

    isExitAnimationDone() {
        if (this.postMatchPhase !== 3) return false;
        return this.players.every(p => p.y < -10 || p.y > 110);
    }
}

// 전역 등록
window.RealSoccerEngine = RealSoccerEngine;
window.DeepTacticManager = DeepTacticManager;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    const tacticsBtn = document.querySelector('[data-tab="tactics"]');
    if (tacticsBtn) tacticsBtn.addEventListener('click', () => setTimeout(() => DeepTacticManager.init(), 100));
    setTimeout(() => DeepTacticManager.init(), 1000);
});
