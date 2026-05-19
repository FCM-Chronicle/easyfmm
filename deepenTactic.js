// deepenTactic.js  —  v2.0  (full rewrite, drop-in compatible)
// ─────────────────────────────────────────────────────────────────────────────
// External API preserved:
//   window.RealSoccerEngine   (class)
//   window.DeepTacticManager  (object, .init(), .renderUI())
//   BallState                 (const object)
//   SimBall / SimPlayer       (classes)
//   RUN_TYPE / ROLE_RUN_TYPE  (const objects)
//   getPosByAngle()           (function)
// ─────────────────────────────────────────────────────────────────────────────

// =============================================================================
// [SECTION 0]  CONSTANTS & UTILITY
// =============================================================================

const BallState = {
    LOOSE:      0,
    CONTROLLED: 1,
    IN_FLIGHT:  2,
    DEAD:       3
};

const RUN_TYPE = {
    STRIKER_RUN:   'striker_run',
    SUPPORT_RUN:   'support_run',
    CHANNEL_RUN:   'channel_run',
    WIDE_RUN:      'wide_run',
    UNDERLAP_RUN:  'underlap_run',
    HOLD_POSITION: 'hold_position',
};

const ROLE_RUN_TYPE = {
    AF:'striker_run', CF:'support_run', P:'striker_run',
    DLF:'support_run', TM:'hold_position', F9:'support_run',
    PF:'channel_run', RD:'channel_run', W:'wide_run', IF:'underlap_run',
    WP:'support_run', IW:'underlap_run',
    BBM:'striker_run', MEZ:'underlap_run', DLP:'hold_position',
    BWM:'hold_position', AP:'support_run', REG:'hold_position',
    CAR:'support_run', EG:'hold_position', SS:'striker_run',
    ANC:'hold_position', DM:'hold_position', SV:'striker_run',
    BPD:'support_run', CD:'hold_position', NCB:'hold_position',
    IWB:'underlap_run', CWB:'wide_run', LIB:'support_run',
    FB:'hold_position', WB:'wide_run',
    GK:'hold_position'
};

function getPosByAngle(x, y, angleDeg, dist) {
    const rad = angleDeg * (Math.PI / 180);
    return {
        x: Math.max(2, Math.min(98, x + Math.cos(rad) * dist)),
        y: Math.max(2, Math.min(98, y + Math.sin(rad) * dist))
    };
}

// Position-based stat weight tables for "overall → derived stats"
// Each position maps stat-key → weight [0..2] (1.0 = neutral)
const POSITION_STAT_WEIGHTS = {
    FW: { speed: 1.3, shooting: 1.5, passing: 0.9, defense: 0.4, decision: 1.1, physical: 1.0 },
    MF: { speed: 1.0, shooting: 0.8, passing: 1.4, defense: 0.9, decision: 1.3, physical: 0.9 },
    DF: { speed: 1.0, shooting: 0.3, passing: 0.9, defense: 1.6, decision: 1.0, physical: 1.2 },
    GK: { speed: 0.5, shooting: 0.1, passing: 0.7, defense: 1.8, decision: 1.1, physical: 1.0 }
};

// Derive individual stats from a single overall value
function deriveStatsFromOverall(overall, position) {
    const weights = POSITION_STAT_WEIGHTS[position] || POSITION_STAT_WEIGHTS.MF;
    const derived = {};
    for (const [stat, w] of Object.entries(weights)) {
        // Add small noise so players feel distinct
        const noise = (Math.random() - 0.5) * 4;
        derived[stat] = Math.max(10, Math.min(99, overall * w + noise));
    }
    // tackle% mirrors defense for compatibility
    derived.tackle = derived.defense;
    return derived;
}

// Clamp helper
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// =============================================================================
// [SECTION 1]  DEEP TACTIC MANAGER  (UI, preserved interface)
// =============================================================================

const DeepTacticManager = {
    init() {
        if (!gameData.deepTactics) {
            gameData.deepTactics = {
                attackFocus:    'mixed',
                passStyle:      { shortRatio: 7, longRatio: 3 },
                pressIntensity: 'mid',      // low | mid | high
                defensiveLine:  'standard', // deep | standard | high
                passTempo:      'normal',   // slow | normal | fast
                passLength:     'mixed'     // short | mixed | long
            };
        }
        this.renderUI();
    },

    renderUI() {
        let container = document.getElementById('deepTacticsContainer');
        if (!container) {
            const tacticsTab = document.getElementById('tactics');
            if (!tacticsTab) return;
            container = document.createElement('div');
            container.id = 'deepTacticsContainer';
            container.style.cssText = `margin-top:20px;padding:15px;background:rgba(255,255,255,0.05);border-radius:10px;`;
            tacticsTab.appendChild(container);
        }
        const dt = gameData.deepTactics;
        container.innerHTML = `
            <h4 style="color:#ffd700;margin-top:0;">심층 전술 세부 설정</h4>

            <div style="margin-bottom:10px;">
                <label style="display:block;margin-bottom:4px;color:#ccc;">수비 라인</label>
                <select id="dt-defensiveLine" style="width:100%;padding:5px;background:#333;color:white;">
                    <option value="deep"     ${dt.defensiveLine==='deep'     ?'selected':''}>딥 (Deep)</option>
                    <option value="standard" ${dt.defensiveLine==='standard' ?'selected':''}>표준</option>
                    <option value="high"     ${dt.defensiveLine==='high'     ?'selected':''}>하이 (High)</option>
                </select>
            </div>

            <div style="margin-bottom:10px;">
                <label style="display:block;margin-bottom:4px;color:#ccc;">압박 강도</label>
                <select id="dt-pressIntensity" style="width:100%;padding:5px;background:#333;color:white;">
                    <option value="low"  ${dt.pressIntensity==='low'  ?'selected':''}>낮음</option>
                    <option value="mid"  ${dt.pressIntensity==='mid'  ?'selected':''}>보통</option>
                    <option value="high" ${dt.pressIntensity==='high' ?'selected':''}>높음</option>
                </select>
            </div>

            <div style="margin-bottom:10px;">
                <label style="display:block;margin-bottom:4px;color:#ccc;">패스 템포</label>
                <select id="dt-passTempo" style="width:100%;padding:5px;background:#333;color:white;">
                    <option value="slow"   ${dt.passTempo==='slow'   ?'selected':''}>느림</option>
                    <option value="normal" ${dt.passTempo==='normal' ?'selected':''}>보통</option>
                    <option value="fast"   ${dt.passTempo==='fast'   ?'selected':''}>빠름</option>
                </select>
            </div>

            <div style="margin-bottom:10px;">
                <label style="display:block;margin-bottom:4px;color:#ccc;">패스 길이</label>
                <select id="dt-passLength" style="width:100%;padding:5px;background:#333;color:white;">
                    <option value="short" ${dt.passLength==='short' ?'selected':''}>짧게</option>
                    <option value="mixed" ${dt.passLength==='mixed' ?'selected':''}>혼합</option>
                    <option value="long"  ${dt.passLength==='long'  ?'selected':''}>길게</option>
                </select>
            </div>

            <div style="color:#aaa;font-size:0.8rem;">* 설정은 자동 적용됩니다</div>
        `;
        ['defensiveLine','pressIntensity','passTempo','passLength'].forEach(key => {
            document.getElementById(`dt-${key}`)
                .addEventListener('change', e => { gameData.deepTactics[key] = e.target.value; });
        });
    }
};

// =============================================================================
// [SECTION 2]  SIM BALL
// =============================================================================

class SimBall {
    constructor() {
        this.x = 50; this.y = 50; this.z = 0;
        this.state = BallState.DEAD;
        this.owner = null;
        this.intendedReceiver = null;
        this.lastOwner = null;
        this.targetPos = { x: 50, y: 50 };
        this.velocity = { x: 0, y: 0 };
        // trajectory cache for in-flight interception
        this._flightOrigin = { x: 50, y: 50 };
    }
}

// =============================================================================
// [SECTION 3]  SIM PLAYER
// =============================================================================

class SimPlayer {
    constructor(data, teamId, role, lineStats, morale = 50, tacticMultiplier = 1.0) {
        this.id   = data.name;
        this.name = data.name;
        this.position = data.position;
        this.rating   = data.rating;
        this.teamId   = teamId;
        this.role     = role;

        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.baseX = 0; this.baseY = 0;

        this.stamina = (data.condition !== undefined) ? data.condition : 100;
        this._markTargetId = null;

        // Tactic-level state
        this.forceReturnTimer = 0;
        this.burstTimer       = 0;

        // Steal cooldown (anti-exploit)
        this._stealCooldown = 0;

        // Turnover recovery state: 'immediate' | 'delayed' | 'frozen'
        this._recoveryMode  = null;
        this._recoveryDelay = 0;

        this.stats = this._buildStats(data, role, lineStats, morale, tacticMultiplier);
    }

    _buildStats(playerData, role, lineStats, morale, tacticMultiplier) {
        const moraleFactor = 1 + ((morale - 50) * 0.0005);

        // ── Path A: rich lineStats object (user team) ──
        if (lineStats && lineStats.attack) {
            let line;
            if (playerData.position === 'FW')      line = 'attack';
            else if (playerData.position === 'MF')  line = 'midfield';
            else                                     line = 'defense';

            const baseStats = lineStats[line].stats;
            const statMapping = {
                passing:  'technique', shooting: 'attack', defense: 'defense',
                speed:    'speed',     decision: 'mentality', physical: 'physical'
            };
            const finalStats = {};
            for (const [simStat, dnaStat] of Object.entries(statMapping)) {
                const baseVal = baseStats[dnaStat] || playerData.rating;
                let val = (typeof TacticsManager !== 'undefined')
                    ? TacticsManager.calculateFinalPower(baseVal, role, dnaStat)
                    : baseVal;
                finalStats[simStat] = val * moraleFactor * tacticMultiplier;
            }
            finalStats.tackle = finalStats.defense;
            return finalStats;
        }

        // ── Path B: overall-only (AI team) ──
        const overall = playerData.rating || 70;
        const derived = deriveStatsFromOverall(overall, playerData.position);
        // Apply tactic + morale multipliers
        for (const k of Object.keys(derived)) {
            derived[k] = derived[k] * moraleFactor * tacticMultiplier;
        }
        return derived;
    }
}

// =============================================================================
// [SECTION 4]  REAL SOCCER ENGINE
// =============================================================================

class RealSoccerEngine {

    // ─────────────────────────────────────────────────────────────
    // 4.1  CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────
    constructor(homeSquad, awaySquad, homeTactic = 'balanced', awayTactic = 'balanced') {
        this.players    = [];
        this.ball       = new SimBall();
        this.matchTime  = 0;
        this.eventsQueue = [];
        this.pendingShot = null;

        this.celebrationTimer  = 0;
        this.celebrationActor  = null;
        this.celebrationTarget = null;
        this.celebrationType   = null;
        this.lastScorerTeam    = null;

        this.homeScore = 0;
        this.awayScore = 0;
        this.userStats = null;
        this.aiStats   = null;

        this.teamTactics = { home: homeTactic, away: awayTactic };

        // Attack-route state machine (per team)
        this._attackRoute = { home: null, away: null };
        this._attackRouteTimer = { home: 0, away: 0 };

        this.initTeam(homeSquad, 'home', homeTactic);
        this.initTeam(awaySquad, 'away', awayTactic);
        this.resetPositions('home');
    }

    // ─────────────────────────────────────────────────────────────
    // 4.2  STAT HELPERS
    // ─────────────────────────────────────────────────────────────
    getEffectiveStat(player, statName) {
        let val = player.stats[statName];
        if (val === undefined) return 50;
        let factor = 1.0;
        if      (player.stamina < 50) factor = 0.50;
        else if (player.stamina < 60) factor = 0.75;
        else if (player.stamina < 70) factor = 0.90;
        return val * factor;
    }

    // ─────────────────────────────────────────────────────────────
    // 4.3  AI STAT GENERATION  (for opponent squad)
    // ─────────────────────────────────────────────────────────────
    generateAIStats(squad) {
        const aiStats = {
            attack:   { stats: {} },
            midfield: { stats: {} },
            defense:  { stats: {} }
        };
        const calcAvg = arr => arr.length > 0
            ? Math.round(arr.reduce((s, p) => s + p.rating, 0) / arr.length)
            : 70;
        const fwOVR = calcAvg(squad.fw.filter(Boolean));
        const mfOVR = calcAvg(squad.mf.filter(Boolean));
        const dfOVR = calcAvg([...squad.df.filter(Boolean), squad.gk].filter(Boolean));

        for (const [line, ovr] of Object.entries({ attack: fwOVR, midfield: mfOVR, defense: dfOVR })) {
            const total  = ovr * 6;
            let   remain = total % 6;
            const base   = Math.floor(total / 6);
            for (const key of ['attack','speed','technique','physical','defense','mentality']) {
                aiStats[line].stats[key] = base + (remain-- > 0 ? 1 : 0);
            }
        }
        return aiStats;
    }

    // ─────────────────────────────────────────────────────────────
    // 4.4  TEAM INIT
    // ─────────────────────────────────────────────────────────────
    initTeam(squad, teamId, tactic) {
        const tacticMultiplier = tactic === 'balanced' ? 0.85 : 1.0;

        const setupLine = (list, baseX) => {
            const isUserTeam = (teamId === 'home' &&  gameData.isHomeGame)
                            || (teamId === 'away' && !gameData.isHomeGame);
            let lineStats, teamMorale = 50;

            if (isUserTeam) {
                lineStats  = gameData.lineStats;
                this.userStats = lineStats;
                teamMorale = gameData.teamMorale;
            } else {
                lineStats  = this.aiStats || this.generateAIStats(squad);
                this.aiStats  = lineStats;
                teamMorale = 60 + Math.floor(Math.random() * 31);
            }

            list.forEach((p, i) => {
                if (!p) return;
                let role = (gameData.playerRoles && gameData.playerRoles[p.name])
                    ? gameData.playerRoles[p.name]
                    : this.getBestRoleForTactic(tactic, p.position, i);

                const simP = new SimPlayer(p, teamId, role, lineStats, teamMorale, tacticMultiplier);
                simP.baseX = baseX;
                simP.baseY = (100 / (list.length + 1)) * (i + 1);
                simP.x = simP.baseX;
                simP.y = simP.baseY;
                this.players.push(simP);
            });
        };

        if (teamId === 'home') {
            if (squad.gk) setupLine([squad.gk], 5);
            setupLine(squad.df, 20);
            setupLine(squad.mf, 42);
            setupLine(squad.fw, 72);
        } else {
            if (squad.gk) setupLine([squad.gk], 95);
            setupLine(squad.df, 80);
            setupLine(squad.mf, 58);
            setupLine(squad.fw, 28);
        }
    }

    getBestRoleForTactic(tactic, position, index) {
        if (position === 'GK') return 'GK';
        const roleMap = {
            tikitaka:     { FW:['F9','DLF'],       MF:['DLP','AP','MEZ'],     DF:['BPD','IWB']       },
            possession:   { FW:['DLF','CF'],        MF:['DLP','AP','CAR'],     DF:['BPD','WB']        },
            lavolpiana:   { FW:['F9','W'],          MF:['DLP','REG','MEZ'],    DF:['BPD','IWB']       },
            gegenpress:   { FW:['PF','AF'],         MF:['BBM','BWM','MEZ'],    DF:['CD','CWB']        },
            totalFootball:{ FW:['CF','F9'],         MF:['BBM','MEZ','AP'],     DF:['BPD','CWB','LIB'] },
            counter:      { FW:['AF','P'],          MF:['BWM','DLP'],          DF:['NCB','FB']        },
            longBall:     { FW:['TM','AF'],         MF:['BWM','CM'],           DF:['NCB','CD']        },
            twoLine:      { FW:['AF','P'],          MF:['BWM','CAR'],          DF:['CD','FB']         },
            parkBus:      { FW:['P','TM'],          MF:['BWM','DLP'],          DF:['NCB','CD']        },
            catenaccio:   { FW:['TM','P'],          MF:['BWM','DLP'],          DF:['NCB','LIB']       }
        };
        const def = { FW:['AF','CF'], MF:['BBM','AP'], DF:['CD','FB'] };
        const m   = roleMap[tactic] || def;
        const candidates = m[position] || def[position] || ['CD'];
        return candidates[index % candidates.length];
    }

    // ─────────────────────────────────────────────────────────────
    // 4.5  RESET / KICKOFF
    // ─────────────────────────────────────────────────────────────
    resetPositions(kickoffTeamId = null) {
        this.ball.x = 50; this.ball.y = 50;
        this.ball.lastOwner = null;
        this.ball._flightOrigin = { x: 50, y: 50 };

        let kicker = null;
        if (kickoffTeamId) {
            kicker = this.players.find(p => p.teamId === kickoffTeamId && p.position === 'FW')
                  || this.players.find(p => p.teamId === kickoffTeamId && p.position === 'MF')
                  || this.players.find(p => p.teamId === kickoffTeamId);
        }
        if (kicker) {
            this.ball.state = BallState.CONTROLLED;
            this.ball.owner = kicker;
            kicker.x = 50; kicker.y = 50;
        } else {
            this.ball.state = BallState.LOOSE;
            this.ball.owner = null;
        }

        this.players.forEach(p => {
            if (p === kicker) return;
            p.y = p.baseY; p.vx = 0; p.vy = 0;
            if (p.teamId === 'home') {
                const mx = p.position === 'MF' ? 40 : 48;
                p.x = Math.min(p.baseX, mx);
            } else {
                const mn = p.position === 'MF' ? 60 : 52;
                p.x = Math.max(p.baseX, mn);
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 4.6  MAIN UPDATE LOOP
    // ─────────────────────────────────────────────────────────────
    update(minute, isNewMinute) {
        this.eventsQueue = [];
        if (isNewMinute) this.consumeStamina();

        // Tick steal cooldowns
        this.players.forEach(p => { if (p._stealCooldown > 0) p._stealCooldown--; });

        // Celebration phase
        if (this.celebrationTimer > 0) {
            this.processCelebrationMovement();
            this.celebrationTimer--;
            if (this.celebrationTimer <= 0) {
                const next = this.lastScorerTeam === 'home' ? 'away' : 'home';
                this.resetPositions(next);
            }
            return this.getSnapshot();
        }

        // Ball flight
        if (this.ball.state === BallState.IN_FLIGHT) {
            const BALL_SPEED = 4.2;
            const dx = this.ball.targetPos.x - this.ball.x;
            const dy = this.ball.targetPos.y - this.ball.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= BALL_SPEED) {
                this.ball.x = this.ball.targetPos.x;
                this.ball.y = this.ball.targetPos.y;
                this.ball.state = BallState.LOOSE;
                if (this.pendingShot) { this.handleShotResult(); return this.getSnapshot(); }
            } else {
                const ratio = BALL_SPEED / dist;
                this.ball.x += dx * ratio;
                this.ball.y += dy * ratio;
                this.checkInterception();   // in-flight interception every frame
            }
        }

        // Loose ball pickup
        if (this.ball.state === BallState.LOOSE) {
            let nearest = null, minD = 999;
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < minD) { minD = d; nearest = p; }
            });
            if (nearest && minD < 2.5) {
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = nearest;
                this.ball.intendedReceiver = null;
                this.ball.x = nearest.x; this.ball.y = nearest.y;
            }
        }

        // On-ball decision
        if (this.ball.state === BallState.CONTROLLED && this.ball.owner) {
            this.processBallCarrierAI(this.ball.owner);
        }

        this.processOffBallAI();
        this.adjustDefensiveLines();

        return this.getSnapshot();
    }

    // ─────────────────────────────────────────────────────────────
    // 4.7  STAMINA
    // ─────────────────────────────────────────────────────────────
    consumeStamina() {
        const rates = { FW: 0.6, MF: 0.7, DF: 0.4, GK: 0.1 };
        this.players.forEach(p => {
            const r = rates[p.position] || 0.5;
            p.stamina = Math.max(0, p.stamina - r * (0.8 + Math.random() * 0.4));
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 4.8  SNAPSHOT
    // ─────────────────────────────────────────────────────────────
    getSnapshot() {
        return {
            ball: { x: this.ball.x, y: this.ball.y, z: this.ball.z, state: this.ball.state },
            players: this.players.map(p => ({
                id:      p.id,
                x:       p.x,
                y:       p.y,
                team:    p.teamId,
                hasBall: (this.ball.owner === p)
            })),
            events:        [...this.eventsQueue],
            isCelebration: this.celebrationTimer > 0
        };
    }

    // ─────────────────────────────────────────────────────────────
    // 4.9  TACTIC HELPERS
    // ─────────────────────────────────────────────────────────────
    getTeamTactic(teamId) {
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            if (teamId === userSide && gameData.currentTactic) return gameData.currentTactic;
        }
        return this.teamTactics?.[teamId] || 'balanced';
    }

    isGegenpressTeam(teamId) { return this.getTeamTactic(teamId) === 'gegenpress'; }

    getTacticProfile(teamId) {
        const profiles = {
            tikitaka:     { width:0.82, tempo:0.92, directness:0.72, press:0.78, boxPress:0.72, attackRisk:0.76 },
            possession:   { width:0.86, tempo:0.82, directness:0.62, press:0.62, boxPress:0.68, attackRisk:0.68 },
            lavolpiana:   { width:0.90, tempo:0.84, directness:0.66, press:0.58, boxPress:0.64, attackRisk:0.66 },
            gegenpress:   { width:0.92, tempo:1.16, directness:0.88, press:1.28, boxPress:1.12, attackRisk:0.92 },
            totalFootball:{ width:0.96, tempo:1.04, directness:0.82, press:0.96, boxPress:0.88, attackRisk:0.88 },
            counter:      { width:1.08, tempo:1.18, directness:1.22, press:0.56, boxPress:0.76, attackRisk:0.86 },
            longBall:     { width:1.05, tempo:1.10, directness:1.28, press:0.50, boxPress:0.72, attackRisk:0.80 },
            twoLine:      { width:0.92, tempo:0.92, directness:0.86, press:0.46, boxPress:0.82, attackRisk:0.62 },
            parkBus:      { width:0.80, tempo:0.72, directness:0.78, press:0.34, boxPress:0.92, attackRisk:0.48 },
            catenaccio:   { width:0.82, tempo:0.78, directness:0.86, press:0.38, boxPress:0.96, attackRisk:0.52 },
            balanced:     { width:0.92, tempo:0.92, directness:0.82, press:0.62, boxPress:0.72, attackRisk:0.68 }
        };
        return profiles[this.getTeamTactic(teamId)] || profiles.balanced;
    }

    // ─────────────────────────────────────────────────────────────
    // 4.10  ATTACK ROUTE SELECTION
    // ─────────────────────────────────────────────────────────────
    _selectAttackRoute(teamId) {
        const dt       = gameData.deepTactics || {};
        const profile  = this.getTacticProfile(teamId);
        const haswinger = this.players.some(p =>
            p.teamId === teamId && this.getRoleBehavior(p.role).hugLine
        );

        let w1 = 0.35;
        let w2 = haswinger ? 0.40 : 0.20;
        let w3 = (dt.pressIntensity === 'high') ? 0.45
               : (dt.pressIntensity === 'low')  ? 0.15 : 0.25;

        if (dt.passLength === 'long')  { w1 += 0.10; w2 += 0.05; }
        if (dt.passLength === 'short') { w1 -= 0.10; w3 += 0.05; }

        const total = w1 + w2 + w3;
        const roll  = Math.random() * total;
        if      (roll < w1)        return 'through_pass';
        else if (roll < w1 + w2)   return 'cross';
        else                       return 'press_steal_shot';
    }

    _getOrSelectRoute(teamId) {
        if (this._attackRouteTimer[teamId] > 0) {
            this._attackRouteTimer[teamId]--;
            return this._attackRoute[teamId];
        }
        const route = this._selectAttackRoute(teamId);
        this._attackRoute[teamId]       = route;
        this._attackRouteTimer[teamId]  = 12 + Math.floor(Math.random() * 10);
        return route;
    }

    // ─────────────────────────────────────────────────────────────
    // 4.11  ON-BALL DECISION SCORING
    // ─────────────────────────────────────────────────────────────
    _scorePassOption(from, to, gameState) {
        const isHome  = from.teamId === 'home';
        const goalX   = isHome ? 100 : 0;
        const dist    = Math.hypot(from.x - to.x, from.y - to.y);
        const distToGoalFrom = Math.abs(from.x - goalX);
        const distToGoalTo   = Math.abs(to.x   - goalX);
        const isForward      = distToGoalTo < distToGoalFrom;

        let enemyInLane = false;
        for (const opp of this.players) {
            if (opp.teamId === from.teamId) continue;
            const tx = to.x - from.x, ty = to.y - from.y;
            const len2 = tx * tx + ty * ty;
            if (len2 < 0.001) continue;
            const t = clamp(((opp.x - from.x) * tx + (opp.y - from.y) * ty) / len2, 0, 1);
            const cx = from.x + t * tx, cy = from.y + t * ty;
            if (Math.hypot(opp.x - cx, opp.y - cy) < 5) { enemyInLane = true; break; }
        }

        const spaceAhead = !this.players.some(opp => {
            if (opp.teamId === from.teamId) return false;
            const aheadX = isHome ? to.x + 8 : to.x - 8;
            return Math.hypot(opp.x - aheadX, opp.y - to.y) < 6;
        });

        const dt = gameData.deepTactics || {};
        let passTypeScore = 0;
        if (dt.passLength === 'short' && dist > 25)  passTypeScore -= 15;
        if (dt.passLength === 'long'  && dist < 10)  passTypeScore -= 10;

        let score = 0;
        if (enemyInLane) score -= 18;
        if (isForward) score += 16;
        else           score -=  8;
        score += (to.rating - 70) * 0.04;

        const stateWeight = {
            buildup: isForward ? 6 : 10,
            counter: isForward ? 22 : 2,
            attack:  isForward ? 18 : 4
        };
        score += stateWeight[gameState] || 10;
        if (spaceAhead) score += 5;

        const distToGoalAfter = Math.abs(to.x - goalX);
        if (distToGoalAfter < 20) score += 4;

        const nearDef = this.findNearestDefender(to);
        if (nearDef && from.rating > nearDef.player.rating + 5) score += 3;

        score += passTypeScore;
        if (this.ball.lastOwner === to) score -= 40;
        score += (Math.random() - 0.5) * 6;

        return score;
    }

    _getGameState(teamId) {
        const isHome = teamId === 'home';
        const ballX  = this.ball.x;
        if ((isHome && ballX > 65) || (!isHome && ballX < 35)) return 'attack';
        if (this.ball.lastOwner && this.ball.lastOwner.teamId !== teamId &&
            this.ball.state === BallState.CONTROLLED) return 'counter';
        return 'buildup';
    }

    // ─────────────────────────────────────────────────────────────
    // 4.12  PASS TEMPO MODIFIERS
    // ─────────────────────────────────────────────────────────────
    _getTempoModifiers() {
        const tempo = gameData.deepTactics?.passTempo || 'normal';
        if (tempo === 'fast') return { scanSpeedBonus: 1.3, passSuccessModifier: -5 };
        if (tempo === 'slow') return { scanSpeedBonus: 0.7, passSuccessModifier:  5 };
        return { scanSpeedBonus: 1.0, passSuccessModifier: 0 };
    }

    // ─────────────────────────────────────────────────────────────
    // 4.13  BALL CARRIER AI
    // ─────────────────────────────────────────────────────────────
    processBallCarrierAI(player) {
        if (player.position === 'GK') {
            this.processGoalkeeperAI(player, this._isUnderPressure(player));
            return;
        }

        const isHome      = player.teamId === 'home';
        const goalX       = isHome ? 100 : 0;
        const distToGoal  = Math.abs(player.x - goalX);
        const behavior    = this.getRoleBehavior(player.role);
        const isOnFlank   = player.y < 25 || player.y > 75;
        const nearestOpp  = this.findNearestDefender(player);
        const pressureDist = nearestOpp ? nearestOpp.dist : 999;
        const underPressure = pressureDist < 8;
        const moveDir     = isHome ? 1 : -1;
        const effectiveSpeed = this.getEffectiveStat(player, 'speed');
        const isWingerOnFlank = behavior.hugLine && isOnFlank;

        let shootChance = this._calcShootChance(player, goalX, distToGoal);
        if (shootChance > 0 && Math.random() < shootChance) {
            this.attemptShoot(player, goalX);
            return;
        }

        const gameState   = this._getGameState(player.teamId);
        const tempoMod    = this._getTempoModifiers();
        const teammates   = this.players.filter(p => p.teamId === player.teamId && p !== player);
        const route       = this._getOrSelectRoute(player.teamId);

        let scoredOptions = teammates.map(tm => ({
            player: tm,
            score:  this._scorePassOption(player, tm, gameState)
        }));

        scoredOptions.forEach(opt => {
            const tm = opt.player;
            if (route === 'through_pass') {
                if (tm.burstTimer > 5) opt.score += 30;
            } else if (route === 'cross') {
                if (this.getRoleBehavior(tm.role).hugLine) opt.score += 20;
                else if (tm.position === 'FW' && Math.abs(tm.y - 50) < 25) opt.score += 15;
            } else if (route === 'press_steal_shot') {
                if (Math.abs(tm.x - goalX) < Math.abs(player.x - goalX)) opt.score += 10;
            }
        });

        scoredOptions.sort((a, b) => b.score - a.score);
        const bestTarget = scoredOptions[0]?.player || null;

        let passProb = this._calcPassProb(player, underPressure, isWingerOnFlank, distToGoal, tempoMod);

        if (bestTarget && Math.random() < passProb) {
            this._executePassStyled(player, bestTarget, gameState);
            return;
        }

        if (nearestOpp && nearestOpp.dist < 7 && Math.random() < 0.05) {
            if (this.attemptTackle(nearestOpp.player, player)) return;
        }

        this._dribbleCarry(player, goalX, distToGoal, nearestOpp, underPressure, moveDir, effectiveSpeed, isWingerOnFlank);
    }

    _isUnderPressure(player) {
        return this.players.some(p =>
            p.teamId !== player.teamId &&
            Math.hypot(p.x - player.x, p.y - player.y) < 8
        );
    }

    _calcShootChance(player, goalX, distToGoal) {
        const isAngleBlocked = distToGoal < 35 && this.players.some(opp => {
            if (opp.teamId === player.teamId) return false;
            const d = Math.hypot(opp.x - player.x, opp.y - player.y);
            if (d > 10) return false;
            const dot   = (goalX - player.x) * (opp.x - player.x) + (50 - player.y) * (opp.y - player.y);
            const mag1  = Math.hypot(goalX - player.x, 50 - player.y);
            const mag2  = d;
            const angle = Math.acos(clamp(dot / (mag1 * mag2 + 0.001), -1, 1));
            return angle < 0.28;
        });

        if (isAngleBlocked && distToGoal > 12 && Math.random() < 0.8) return 0;

        let base = 0;
        if      (distToGoal < 12) base = 0.95;
        else if (distToGoal < 18) base = clamp(1 / distToGoal * 14, 0, 0.75);
        else if (distToGoal < 28) base = clamp(1 / distToGoal * 5,  0, 0.06);
        else if (distToGoal < 35) base = clamp(1 / distToGoal * 1,  0, 0.012);

        return Math.min(base, 0.95);
    }

    _calcPassProb(player, underPressure, isWingerOnFlank, distToGoal, tempoMod) {
        let prob = 0.5;
        const profile = this.getTacticProfile(player.teamId);

        if (player.position === 'DF') {
            prob = underPressure ? 0.98 : 0.40;
        } else if (isWingerOnFlank && distToGoal > 25) {
            prob = 0.58;
        } else {
            prob = 0.15;
            if (underPressure) prob = 0.75;
        }

        prob = clamp(prob * (0.86 + profile.directness * 0.22), 0.05, 0.96);
        if (tempoMod.scanSpeedBonus > 1) prob = Math.min(prob + 0.05, 0.96);

        return prob;
    }

    _executePassStyled(from, to, gameState) {
        const isHome   = from.teamId === 'home';
        const goalX    = isHome ? 100 : 0;
        const dist     = Math.hypot(from.x - to.x, from.y - to.y);
        const distToGoalTo   = Math.abs(to.x - goalX);
        const distToGoalFrom = Math.abs(from.x - goalX);
        const isBehindLine   = this._isReceiverBehindDefLine(from, to);
        const dt             = gameData.deepTactics || {};

        let passKind = 'safe';
        if (isBehindLine && dist > 10 && distToGoalFrom > distToGoalTo) passKind = 'risky';
        else if (dt.passLength === 'long' || dist > 30) passKind = 'lateral_long';

        this.executePass(from, to, passKind);
    }

    _isReceiverBehindDefLine(from, to) {
        const isHome = from.teamId === 'home';
        const oppFieldPlayers = this.players.filter(p => p.teamId !== from.teamId && p.position !== 'GK');
        if (!oppFieldPlayers.length) return false;
        if (isHome) {
            const sorted = oppFieldPlayers.map(p => p.x).sort((a, b) => a - b);
            const lineX  = sorted.length >= 2 ? sorted[1] : sorted[0];
            return to.x > lineX;
        } else {
            const sorted = oppFieldPlayers.map(p => p.x).sort((a, b) => b - a);
            const lineX  = sorted.length >= 2 ? sorted[1] : sorted[0];
            return to.x < lineX;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 4.14  DRIBBLE / CARRY
    // ─────────────────────────────────────────────────────────────
    _dribbleCarry(player, goalX, distToGoal, nearestOpp, underPressure, moveDir, effectiveSpeed, isWingerOnFlank) {
        const speedFactor   = effectiveSpeed / 75;
        const isBlocked     = this.checkFrontalBlock(player, goalX);
        const canOutrun     = nearestOpp
            ? effectiveSpeed > this.getEffectiveStat(nearestOpp.player, 'speed') + 5
            : true;
        const isOneOnOne    = (nearestOpp?.dist ?? 999) > 15;

        let moveSpeed = 0.32 * clamp(speedFactor, 0.7, 1.4);
        let targetX   = player.x + moveDir * 22;
        let targetY   = player.y;

        if (isWingerOnFlank) {
            targetY   = player.y < 50 ? 4 : 96;
            moveSpeed = 0.58;
        } else if (isOneOnOne && !isBlocked && player.position === 'FW') {
            targetX   = player.x + moveDir * 35;
            moveSpeed = 0.55 * speedFactor;
        } else if (isBlocked) {
            if (canOutrun && Math.random() < 0.65) {
                targetX   = player.x + moveDir * 28;
                moveSpeed *= 1.4;
            } else {
                const offset = 7;
                targetY = nearestOpp
                    ? (player.y < nearestOpp.player.y ? player.y - offset : player.y + offset)
                    : player.y + (Math.random() < 0.5 ? offset : -offset);
                targetX   = player.x + moveDir * 15;
                moveSpeed *= 1.5;
            }
        }

        targetY = clamp(targetY, 2, 98);
        const aX = (targetX - player.x) * moveSpeed * 0.1;
        const aY = (targetY - player.y)  * moveSpeed * 0.1;
        player.vx = (player.vx + aX) * 0.7;
        player.vy = (player.vy + aY) * 0.7;
        player.x  = clamp(player.x + player.vx, 5, 95);
        player.y  = clamp(player.y + player.vy, 2, 98);
        this.ball.lastOwner = null;
        this.ball.x = player.x; this.ball.y = player.y;

        if (Math.random() < 0.2) this.eventsQueue.push({ type:'dribble', player: player.name });
    }

    // ─────────────────────────────────────────────────────────────
    // 4.15  GOALKEEPER AI
    // ─────────────────────────────────────────────────────────────
    processGoalkeeperAI(gk, underPressure) {
        this.keepGoalkeeperHome(gk);

        const closestAttacker = this.players
            .filter(p => p.teamId !== gk.teamId && p.position === 'FW')
            .sort((a, b) => Math.hypot(a.x - gk.x, a.y - gk.y) - Math.hypot(b.x - gk.x, b.y - gk.y))[0];

        if (closestAttacker) {
            const distAtt = Math.hypot(closestAttacker.x - gk.x, closestAttacker.y - gk.y);
            if (distAtt < 20 && this.ball.owner === closestAttacker) {
                const isHome = gk.teamId === 'home';
                const advanceDir = isHome ? 1 : -1;
                const advanceX = clamp(gk.x + advanceDir * 2, isHome ? 5 : 85, isHome ? 15 : 95);
                gk.x = advanceX;
                gk.y = 50 + (closestAttacker.y - 50) * 0.4;
                if (this.ball.owner === gk) { this.ball.x = gk.x; this.ball.y = gk.y; }
                return;
            }
        }

        const safeTarget      = this._findGKPassTarget(gk, 'safe');
        const aggressiveTarget = this._findGKPassTarget(gk, 'aggressive');

        let target;
        if (underPressure) {
            target = safeTarget || aggressiveTarget;
        } else {
            target = (aggressiveTarget && Math.random() < 0.7)
                ? aggressiveTarget
                : (safeTarget || aggressiveTarget);
        }

        if (target) { this.executePass(gk, target, 'safe'); return; }
        this.clearBall(gk);
    }

    _findGKPassTarget(gk, mode) {
        const teammates = this.players.filter(p => p.teamId === gk.teamId && p !== gk);
        const isHome    = gk.teamId === 'home';
        const forwardX  = isHome ? 100 : 0;

        if (mode === 'safe') {
            const dfs = teammates.filter(p => p.position === 'DF');
            if (dfs.length) {
                return dfs.sort((a, b) =>
                    Math.hypot(a.x-gk.x,a.y-gk.y) - Math.hypot(b.x-gk.x,b.y-gk.y)
                )[0];
            }
            const mfs = teammates.filter(p => p.position === 'MF');
            if (mfs.length) {
                return mfs.sort((a, b) =>
                    Math.hypot(a.x-gk.x,a.y-gk.y) - Math.hypot(b.x-gk.x,b.y-gk.y)
                )[0];
            }
        } else {
            let best = null, bestScore = -Infinity;
            teammates.forEach(tm => {
                if (tm.position === 'GK') return;
                const dist = Math.hypot(gk.x - tm.x, gk.y - tm.y);
                if (dist > 50) return;
                const fwScore  = Math.abs(tm.x - forwardX) < Math.abs(gk.x - forwardX) ? 30 : -10;
                let   pressScore = 0;
                this.players.forEach(opp => {
                    if (opp.teamId !== gk.teamId) {
                        const d = Math.hypot(tm.x - opp.x, tm.y - opp.y);
                        if (d < 12) pressScore -= (12 - d) * 3;
                    }
                });
                const distScore = dist < 8 ? 20 : dist > 35 ? -(dist-35)*1.5 : 15;
                const total = fwScore + pressScore + distScore;
                if (total > bestScore) { bestScore = total; best = tm; }
            });
            return best;
        }
        return null;
    }

    keepGoalkeeperHome(gk) {
        const homeX = gk.baseX || (gk.teamId === 'home' ? 5 : 95);
        gk.x = homeX;
        gk.y = clamp(50 + (this.ball.y - 50) * 0.08, 42, 58);
        gk.vx = 0; gk.vy *= 0.2;
        if (this.ball.owner === gk) { this.ball.x = gk.x; this.ball.y = gk.y; }
    }

    // ─────────────────────────────────────────────────────────────
    // 4.16  PASS EXECUTION
    // ─────────────────────────────────────────────────────────────
    executePass(from, to, passKind = 'safe') {
        this.ball.state = BallState.IN_FLIGHT;
        this.ball._flightOrigin = { x: from.x, y: from.y };
        this.ball.lastOwner         = from;
        this.ball.intendedReceiver  = to;
        this.ball.owner             = null;

        const dist     = Math.hypot(from.x - to.x, from.y - to.y);
        const tempoMod = this._getTempoModifiers();
        let   accuracy = this.getEffectiveStat(from, 'passing');
        if (to.burstTimer > 0) accuracy += 30;
        accuracy += tempoMod.passSuccessModifier;

        let distPenalty = Math.max(0, (dist - 20) * 0.8);
        if (passKind === 'risky')  distPenalty *= 1.4;
        if (passKind === 'safe')   distPenalty *= 0.7;

        const isHome         = from.teamId === 'home';
        const forwardX       = isHome ? 100 : 0;
        const isBehindLine   = this._isReceiverBehindDefLine(from, to);
        const isThroughPass  = isBehindLine
            && (Math.abs(from.x - forwardX) > Math.abs(to.x - forwardX) + 5)
            && dist > 10 && dist <= 40
            && Math.abs(from.x - forwardX) < 65;

        let successChance = accuracy - distPenalty;
        if (from.position === 'GK' && dist > 50) successChance -= 15;
        if (isThroughPass && accuracy > 75)       successChance += (accuracy - 75) * 1.5;
        if (isThroughPass && to.burstTimer > 0)   successChance += 15;

        const isBadPass = Math.random() * 100 > successChance;
        const eventType = isThroughPass ? 'throughpass' : 'pass';

        if (isBadPass) {
            const errorMargin = dist * 0.25;
            const angle  = Math.random() * Math.PI * 2;
            const errDst = Math.random() * errorMargin + 5;
            this.ball.targetPos = {
                x: clamp(to.x + Math.cos(angle) * errDst, 2, 98),
                y: clamp(to.y + Math.sin(angle) * errDst, 2, 98)
            };
            this.eventsQueue.push({ type: eventType, from: from.name, to: to.name,
                desc: isThroughPass ? `${from.name}의 스루패스가 차단됩니다.` : `${from.name}, 패스 미스!` });
        } else {
            this.ball.targetPos = { x: to.x, y: to.y };
            const desc = isThroughPass
                ? `⚡ ${from.name}, ${to.name}에게 결정적인 스루패스!`
                : `${from.name}, ${to.name}에게 연결!`;
            this.eventsQueue.push({ type: eventType, from: from.name, to: to.name, desc });
        }
    }

    clearBall(player) {
        const isHome   = player.teamId === 'home';
        const fwd      = isHome ? 1 : -1;
        this.ball.state = BallState.IN_FLIGHT;
        this.ball._flightOrigin = { x: player.x, y: player.y };
        this.ball.owner     = null;
        this.ball.lastOwner = player;
        this.ball.targetPos = {
            x: clamp(50 + fwd * (Math.random() * 10), 2, 98),
            y: 20 + Math.random() * 60
        };
        this.eventsQueue.push({ type:'pass', from: player.name, to:'걷어내기',
            desc:`${player.name}, 위험 지역을 벗어나게 걷어냅니다.` });
    }

    // ─────────────────────────────────────────────────────────────
    // 4.17  SHOOTING
    // ─────────────────────────────────────────────────────────────
    attemptShoot(shooter, goalX) {
        const oppTeamId = shooter.teamId === 'home' ? 'away' : 'home';
        const gk        = this.players.find(p => p.teamId === oppTeamId && p.position === 'GK');
        const gkRating  = gk ? this.getEffectiveStat(gk, 'defense') : 60;
        const dist      = Math.abs(shooter.x - goalX);

        const distFactor  = Math.max(0.7, 1.3 - dist / 40);
        const distY       = Math.abs(shooter.y - 50);
        let   angleFactor = 1.0;
        if (distY > 8) {
            const angle = Math.atan2(distY, Math.max(1, dist));
            angleFactor = angle > 1.2 ? 0.15 : angle > 0.9 ? 0.4 : angle > 0.6 ? 0.7 : 0.9;
        }

        const effectiveShooting = this.getEffectiveStat(shooter, 'shooting');
        const shotPower  = effectiveShooting * (0.8 + Math.random() * 0.4) * distFactor * angleFactor;
        const savePower  = gkRating * (0.8 + Math.random() * 0.5) + 5;
        let   goalChance = clamp(0.25 + (shotPower - savePower) * 0.0045, 0.04, 0.95);

        this.ball.state = BallState.IN_FLIGHT;
        this.ball._flightOrigin = { x: shooter.x, y: shooter.y };
        this.ball.owner     = null;
        this.ball.targetPos = { x: goalX, y: 45 + Math.random() * 10 };
        this.pendingShot    = { isGoal: Math.random() < goalChance, shooter, goalX };
    }

    handleShotResult() {
        const { isGoal, shooter, goalX } = this.pendingShot;
        this.pendingShot = null;

        if (isGoal) {
            if (shooter.teamId === 'home') this.homeScore++;
            else                           this.awayScore++;

            this.ball.intendedReceiver = null;
            const isHome   = shooter.teamId === 'home';
            const myScore  = isHome ? this.homeScore : this.awayScore;
            const oppScore = isHome ? this.awayScore : this.homeScore;
            const assister = (this.ball.lastOwner && this.ball.lastOwner.teamId === shooter.teamId
                           && this.ball.lastOwner.name !== shooter.name)
                ? this.ball.lastOwner.name : null;

            this.celebrationType   = myScore < oppScore ? 'quick_restart' : 'celebrate';
            this.celebrationActor  = shooter;
            if (this.celebrationType === 'quick_restart') {
                this.celebrationTarget = { x: 50, y: 50 };
            } else {
                this.celebrationTarget = { x: isHome ? 100 : 0, y: shooter.y < 50 ? 0 : 100 };
            }

            this.eventsQueue.push({ type:'goal', scorer: shooter.name, team: shooter.teamId, assister });
            this.lastScorerTeam   = shooter.teamId;
            this.celebrationTimer = 40;
            this.ball.state = BallState.DEAD; this.ball.lastOwner = null;

            this._triggerTurnoverRecovery(shooter.teamId === 'home' ? 'away' : 'home');

        } else {
            this.ball.intendedReceiver = null;
            shooter.forceReturnTimer = 60;

            const oppTeamId = shooter.teamId === 'home' ? 'away' : 'home';
            const isHomeAtt = shooter.teamId === 'home';
            const enemyGk   = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');

            const blockers = this.players.filter(p =>
                p.teamId === oppTeamId && p.position !== 'GK'
                && Math.abs(p.x - shooter.x) < 15 && Math.abs(p.y - shooter.y) < 5
                && (isHomeAtt ? p.x > shooter.x : p.x < shooter.x)
            );
            if (blockers.length > 0 && Math.random() < 0.1) {
                const blocker = blockers[0];
                this.eventsQueue.push({ type:'block', shooter: shooter.name, blocker: blocker.name,
                    desc:`🛡️ ${blocker.name}, 몸을 날려 슈팅을 막아냅니다!` });
                this.ball.state = BallState.LOOSE; this.ball.owner = null;
                this.ball.x = blocker.x + (isHomeAtt ? -5 :  5);
                this.ball.y = blocker.y + (Math.random() - 0.5) * 15;
                return;
            }

            if (enemyGk) {
                const gkBaseX    = enemyGk.teamId === 'home' ? 5 : 95;
                const newGkY     = clamp(this.ball.targetPos.y, 35, 65);
                enemyGk.x = gkBaseX; enemyGk.y = newGkY;
                this.ball.x = enemyGk.x; this.ball.y = enemyGk.y;

                if (Math.random() < 0.15) {
                    this.eventsQueue.push({ type:'save', shooter: shooter.name, gk: enemyGk.name,
                        desc:`🧤 ${enemyGk.name}, 슈팅을 펀칭으로 쳐냅니다!` });
                    this.ball.state = BallState.LOOSE; this.ball.owner = null;
                    this.ball.x = enemyGk.x + (isHomeAtt ? -10 : 10);
                    this.ball.y = enemyGk.y + (Math.random() - 0.5) * 30;
                } else {
                    this.eventsQueue.push({ type:'save', shooter: shooter.name, gk: enemyGk.name,
                        desc:`🧤 ${enemyGk.name}, 안정적으로 공을 잡아냅니다.` });
                    this.ball.state = BallState.CONTROLLED; this.ball.owner = enemyGk;
                    this.ball.x = enemyGk.x; this.ball.y = enemyGk.y;
                }
            } else {
                this.eventsQueue.push({ type:'miss', shooter: shooter.name,
                    desc:`🥅 ${shooter.name}의 슈팅이 골문을 벗어납니다.` });
                this.ball.state = BallState.LOOSE;
                this.ball.x = goalX === 0 ? 5 : 95; this.ball.y = 50;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 4.18  TURNOVER REACTION
    // ─────────────────────────────────────────────────────────────
    _triggerTurnoverRecovery(losingTeamId) {
        this.players.forEach(p => {
            if (p.teamId !== losingTeamId) return;
            if      (p.position === 'DF') { p._recoveryMode = 'immediate'; p._recoveryDelay = 0; }
            else if (p.position === 'MF') {
                const roll = Math.random();
                if (roll < 0.6)       { p._recoveryMode = 'delayed';   p._recoveryDelay = 4 + Math.floor(Math.random() * 6); }
                else if (roll < 0.85) { p._recoveryMode = 'hold';      p._recoveryDelay = 8; }
                else                  { p._recoveryMode = 'immediate'; p._recoveryDelay = 0; }
            } else if (p.position === 'FW') {
                p._recoveryMode  = 'frozen';
                p._recoveryDelay = 6 + Math.floor(Math.random() * 8);
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 4.19  IN-FLIGHT INTERCEPTION
    // ─────────────────────────────────────────────────────────────
    checkInterception() {
        if (this.ball.state !== BallState.IN_FLIGHT) return;
        if (this.pendingShot) return;

        const bx = this.ball.x, by = this.ball.y;
        const ox = this.ball._flightOrigin.x, oy = this.ball._flightOrigin.y;
        const tx = this.ball.targetPos.x,     ty = this.ball.targetPos.y;

        this.players.forEach(p => {
            if (this.ball.lastOwner && p.teamId === this.ball.lastOwner.teamId) return;
            if (p._stealCooldown > 0) return;

            const distToBall = Math.hypot(p.x - bx, p.y - by);
            if (distToBall > 6) return;

            const flx = tx - ox, fly = ty - oy;
            const fLen2 = flx * flx + fly * fly;
            let traj = 0;
            if (fLen2 > 0.001) {
                traj = clamp(((p.x - ox) * flx + (p.y - oy) * fly) / fLen2, 0, 1);
            }
            const nearX = ox + traj * flx, nearY = oy + traj * fly;
            const proximity = Math.hypot(p.x - nearX, p.y - nearY);

            const tackleStat = this.getEffectiveStat(p, 'tackle') || this.getEffectiveStat(p, 'defense');
            const speedStat  = this.getEffectiveStat(p, 'speed');
            const proximityBonus = Math.max(0, (6 - proximity) / 6);
            const chance = 0.004 + (tackleStat / 3000) + (speedStat / 5000) + proximityBonus * 0.025;

            if (Math.random() < chance) {
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = p;
                this.ball.intendedReceiver = null;
                this.ball.lastOwner = null;
                p._stealCooldown = 20;
                this.eventsQueue.push({ type:'tackle', player: p.name,
                    desc:`${p.name}, 날카로운 패스 차단!` });

                const losingTeam = (p.teamId === 'home') ? 'away' : 'home';
                this._triggerTurnoverRecovery(losingTeam);
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 4.20  OFF-BALL AI
    // ─────────────────────────────────────────────────────────────
    processOffBallAI() {
        let attackingTeam = null;
        if (this.ball.owner) attackingTeam = this.ball.owner.teamId;
        else if (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner)
            attackingTeam = this.ball.lastOwner.teamId;

        const isLoose = !this.ball.owner && this.ball.state === BallState.LOOSE;

        let nearestHome = null, nearestAway = null;
        if (isLoose) {
            let dH = 999, dA = 999;
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (p.teamId === 'home' && d < dH) { dH = d; nearestHome = p; }
                if (p.teamId === 'away' && d < dA) { dA = d; nearestAway = p; }
            });
        }

        let presser = null;
        if (this.ball.owner && attackingTeam) {
            let minD = 999;
            this.players.forEach(p => {
                if (p.teamId === attackingTeam) return;
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < minD) { minD = d; presser = p; }
            });
        }

        this.players.forEach(p => {
            if (p === this.ball.owner) return;

            // ── Recovery mode tick ──
            if (p._recoveryDelay > 0) {
                p._recoveryDelay--;
                if (p._recoveryMode === 'frozen') {
                    p.vx *= 0.3; p.vy *= 0.3;
                    p.x += p.vx; p.y += p.vy;
                    return;
                }
                if (p._recoveryMode === 'hold' || p._recoveryMode === 'delayed') {
                    const ax = (p.baseX - p.x) * 0.02;
                    const ay = (p.baseY - p.y) * 0.02;
                    p.vx = (p.vx + ax) * 0.7; p.vy = (p.vy + ay) * 0.7;
                    p.x += p.vx; p.y += p.vy;
                    return;
                }
            }
            if (p._recoveryDelay <= 0 && p._recoveryMode) p._recoveryMode = null;

            const behavior     = this.getRoleBehavior(p.role);
            const effectiveSpd = this.getEffectiveStat(p, 'speed');
            const speedFactor  = effectiveSpd / 75;
            let   moveSpeed    = 0.22 * clamp(speedFactor, 0.7, 1.4);

            // ── FW는 상대팀이 공을 가지고 있으면 무조건 수비 복귀 ──
            // attackingTeam 에 관계없이 공 소유 팀이 상대팀이면 수비 처리
            const oppHasBall = this.ball.owner && this.ball.owner.teamId !== p.teamId;
            const oppInFlight = this.ball.state === BallState.IN_FLIGHT &&
                                this.ball.lastOwner && this.ball.lastOwner.teamId !== p.teamId;
            const isDefending = oppHasBall || oppInFlight;

            const isAttacking  = !isDefending && (p.teamId === attackingTeam);
            const isHome       = p.teamId === 'home';
            const forwardDir   = isHome ? 1 : -1;
            const isHomeDef    = isHome;

            let targetX = p.x, targetY = p.y;

            // ──────────────────────────────────────────────────────────
            if (isLoose) {
                const isNearest = (p === nearestHome || p === nearestAway);
                if (isNearest) {
                    targetX = this.ball.x; targetY = this.ball.y; moveSpeed = 0.55;
                } else {
                    targetX = p.baseX + (this.ball.x - p.baseX) * 0.15;
                    targetY = p.baseY + (this.ball.y - p.baseY) * 0.15;
                    moveSpeed = 0.15;
                }

            } else if (isAttacking) {
                // ── ATTACKING OFF-BALL ──

                if (this.ball.state === BallState.IN_FLIGHT && p === this.ball.intendedReceiver) {
                    targetX = this.ball.targetPos.x; targetY = this.ball.targetPos.y; moveSpeed = 0.7;

                } else if (p === this.ball.lastOwner && p.position !== 'GK' &&
                           !['CD','BPD','NCB'].includes(p.role)) {
                    targetX = p.x + forwardDir * 15;
                    targetY = p.y + (this.ball.y - p.y) * 0.3;
                    moveSpeed = 0.4;

                } else if (p.position === 'FW') {
                    this._processAttackingFWMovement(p, isHome, forwardDir, speedFactor, behavior);
                    return;

                } else if (p.position === 'MF') {
                    const ab = behavior.attackBias || 0;
                    const db = behavior.defenseBias || 0;
                    let ballW = clamp(0.6 + ab * 0.4 - db * 0.3, 0.2, 0.95);
                    targetX = p.baseX * (1 - ballW) + this.ball.x * ballW;
                    targetY = p.baseY * (1 - ballW) + this.ball.y * ballW;
                    if (ab > 0.3) targetX += forwardDir * ab * 12;
                    if (Math.abs(p.y - this.ball.y) < 3) targetY += (p.y > 50 ? 4 : -4);
                    const mfMaxX = isHome ? 74 : 26;
                    targetX = isHome ? Math.min(targetX, mfMaxX) : Math.max(targetX, mfMaxX);

                    const dt = gameData.deepTactics || {};
                    const pressOK = dt.pressIntensity === 'high' || behavior.pressBias > 0.2;
                    if (pressOK && this.ball.owner && this.ball.owner.teamId !== p.teamId) {
                        const dBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                        if (dBall < 20) { targetX = this.ball.x; targetY = this.ball.y; moveSpeed = 0.4; }
                    }

                } else if (p.position === 'DF') {
                    this._processAttackingDFMovement(p, isHome, forwardDir);
                    return;

                } else if (p.position === 'GK') {
                    targetX = p.baseX; targetY = clamp(50 + (this.ball.y - 50) * 0.05, 40, 60);
                }

                if (behavior.cutInside) targetY = 50 + (p.baseY - 50) * 0.5;
                else if (behavior.hugLine) targetY = p.baseY < 50 ? 5 : 95;

            } else {
                // ── DEFENSIVE OFF-BALL ──
                this._processDefensiveMovement(p, presser, isHomeDef, speedFactor, moveSpeed, behavior);
                return;
            }

            this._applyMovement(p, targetX, targetY, moveSpeed);
        });
    }

    _processAttackingFWMovement(p, isHome, forwardDir, speedFactor, behavior) {
        if (!p.burstTimer) p.burstTimer = 0;
        if (!p.forceReturnTimer) p.forceReturnTimer = 0;

        // ── [FIX 1] 공격수 위치 절대 하드캡 ──
        // home FW: x는 반드시 38~96 사이 / away FW: x는 반드시 4~62 사이
        const FW_MIN_X = isHome ? 38 : 4;
        const FW_MAX_X = isHome ? 96 : 62;

        // 오프사이드 라인 계산
        const offsideLimitX = this._calcOffsideLineX(isHome);

        // forceReturnTimer가 있으면 무조건 복귀
        if (p.forceReturnTimer > 0) {
            p.forceReturnTimer--;
            p.burstTimer = 0;
            const safeX = this._getSafeReturnX(p, isHome);
            this._pullBackFW(p, safeX, isHome, speedFactor, 0.9 * speedFactor);
            // 하드캡 적용
            p.x = clamp(p.x, FW_MIN_X, FW_MAX_X);
            return;
        }

        // ── [FIX 1] 공이 뒤에 있으면 즉시 복귀 (기준 강화) ──
        // 이전: ball.x < p.x - 20 → 개선: ball.x < p.x - 10 (더 민감하게)
        const ballFarBehind = isHome ? this.ball.x < p.x - 10 : this.ball.x > p.x + 10;
        const hasFriendlyBall = this.ball.owner && this.ball.owner.teamId === p.teamId;
        if (ballFarBehind) {
            const safeX = this._getSafeReturnX(p, isHome);
            const pullSpeed = ballFarBehind ? 1.1 * speedFactor : 0.9 * speedFactor;
            this._pullBackFW(p, safeX, isHome, speedFactor, pullSpeed);
            // 하드캡 적용
            p.x = clamp(p.x, FW_MIN_X, FW_MAX_X);
            return;
        }

        // Burst logic
        if (p.burstTimer > 0) p.burstTimer--;
        if (p.burstTimer === 0) {
            const isCentralFW = !behavior.hugLine;
            let burstChance = hasFriendlyBall && this.ball.owner?.position !== 'FW'
                ? (isCentralFW ? 0.14 : 0.06)
                : (isCentralFW ? 0.04 : 0.02);
            if (behavior.runBehind) burstChance *= 1.5;
            if (Math.random() < burstChance) p.burstTimer = 30;
        }

        const isCentralFW = !behavior.hugLine;
        const ballPushX   = this.ball.x + forwardDir * 18;
        let   targetX     = ballPushX;

        if (isCentralFW) {
            const cfTargetX = isHome
                ? Math.min(this.ball.x + 12, offsideLimitX - 2)
                : Math.max(this.ball.x - 12, offsideLimitX + 2);
            targetX = isHome ? Math.max(targetX, cfTargetX) : Math.min(targetX, cfTargetX);
        } else {
            const fwMinX = isHome ? this.ball.x + 5 : this.ball.x - 5;
            targetX = isHome ? Math.max(targetX, fwMinX) : Math.min(targetX, fwMinX);
        }

        let moveSpeed = 0.28 * speedFactor;
        if (p.burstTimer > 0) moveSpeed = 0.4 * speedFactor;

        // 오프사이드 라인 적용
        targetX = isHome
            ? Math.min(targetX, offsideLimitX - 1)
            : Math.max(targetX, offsideLimitX + 1);

        this._enforceOffsideLine(p, isHome);

        const nearOpp  = this.findNearestDefender(p);
        const avoidY   = (nearOpp && nearOpp.dist < 4)
            ? (p.y > nearOpp.player.y ? 4 : -4) : 0;
        const yRange   = isCentralFW ? 20 : 6;
        const yBallPull = isCentralFW ? (this.ball.y - p.baseY) * 0.30 : 0;
        let   targetY  = clamp(p.baseY + avoidY + yBallPull, p.baseY - yRange, p.baseY + yRange);

        if (behavior.hugLine) { targetY = p.baseY < 50 ? 5 : 95; targetX += forwardDir * 8; }

        // 오프사이드 + 하드캡 이중 적용
        targetX = isHome
            ? Math.min(targetX, offsideLimitX - 1)
            : Math.max(targetX, offsideLimitX + 1);
        targetX = clamp(targetX, FW_MIN_X, FW_MAX_X);

        this._applyMovement(p, targetX, targetY, moveSpeed);

        // ── [FIX 1] 이동 후에도 반드시 하드캡 재적용 (velocity 누적 방지) ──
        p.x = clamp(p.x, FW_MIN_X, FW_MAX_X);
        if (isHome  && p.vx < 0 && p.x <= FW_MIN_X) p.vx = 0;
        if (!isHome && p.vx > 0 && p.x >= FW_MAX_X) p.vx = 0;
    }

    _processAttackingDFMovement(p, isHome, forwardDir) {
        const dt          = gameData.deepTactics || {};
        const lineTactic  = dt.defensiveLine || 'standard';
        let   safetyDist  = lineTactic === 'high' ? 14 : lineTactic === 'deep' ? 32 : 22;
        let   targetX;
        if (isHome) targetX = clamp(Math.max(p.baseX, this.ball.x - safetyDist), 0, 75);
        else        targetX = clamp(Math.min(p.baseX, this.ball.x + safetyDist), 25, 100);

        const isCB     = ['CD','BPD','NCB'].includes(p.role);
        const targetY  = isCB
            ? clamp(p.baseY * 0.15 + 50 * 0.85, 35, 65)
            : p.baseY;
        this._applyMovement(p, targetX, targetY, 0.22);
    }

    _processDefensiveMovement(p, presser, isHomeDef, speedFactor, moveSpeed, behavior) {
        const isHome = p.teamId === 'home';
        const dt     = gameData.deepTactics || {};

        if (p.position === 'FW') {
            // ── [FIX 3] 수비 시 FW 하프라인 복귀 강화 ──
            p.burstTimer = 0;

            // 하프라인 목표값 (home FW → 최대 46, away FW → 최소 54)
            const HALFLINE_HOME = 46;
            const HALFLINE_AWAY = 54;
            const halflineTarget = isHome ? HALFLINE_HOME : HALFLINE_AWAY;

            // 하프라인을 이미 넘어선 경우 강제 급속 복귀
            const overHalfline = isHome ? p.x > halflineTarget : p.x < halflineTarget;
            if (overHalfline) {
                const pullDir = isHome ? -1 : 1;
                // 얼마나 넘어섰는지에 비례해서 속도 증가
                const excess = isHome ? (p.x - halflineTarget) : (halflineTarget - p.x);
                const pullSpeed = clamp(3.5 + excess * 0.15, 3.5, 7.0) * speedFactor;
                p.x += pullDir * pullSpeed;
                p.vx = pullDir * pullSpeed * 0.5;
            }

            // 하드캡: 절대로 하프라인 너머에 남아있지 않음
            if (isHome)  p.x = Math.min(p.x, halflineTarget + 0.5);
            else         p.x = Math.max(p.x, halflineTarget - 0.5);
            // velocity도 반대 방향이면 0으로
            if (isHome && p.vx > 0)  p.vx = 0;
            if (!isHome && p.vx < 0) p.vx = 0;

            // Y축은 baseY로 천천히 복귀
            this._applyMovement(p, halflineTarget, p.baseY, 0.7 * speedFactor);

            // 이동 후 재확인
            if (isHome)  p.x = Math.min(p.x, halflineTarget + 0.5);
            else         p.x = Math.max(p.x, halflineTarget - 0.5);
            return;
        }

        // MF defensive: role-dependent (hold OR press)
        if (p.position === 'MF') {
            const pressIntensity = dt.pressIntensity || 'mid';
            const shiftF = clamp(0.95 + (behavior.defenseBias||0)*0.1 - (behavior.attackBias||0)*0.2, 0.6, 1.1);
            moveSpeed = 0.22 * (1 + (behavior.defenseBias||0));

            const shouldPress = behavior.pressBias > 0.2
                || pressIntensity === 'high'
                || (pressIntensity === 'mid' && behavior.defenseBias > 0.3);

            if (shouldPress && this.ball.owner && this.ball.owner.teamId !== p.teamId) {
                const dBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (dBall < 25) {
                    this._stepTowardBall(p, speedFactor, presser);
                    return;
                }
            }
            const refBallX  = this.pendingShot ? 50 : clamp(this.ball.x, 30, 70);
            const formationX = p.baseX + (refBallX - 50) * shiftF;
            const formationY = p.baseY + (this.ball.y - 50) * 0.2;
            this._applyMovement(p, formationX, formationY, moveSpeed);
            return;
        }

        // DF: maintain defensive line
        if (p.position === 'DF') {
            const lineTactic = dt.defensiveLine || 'standard';
            const lineOffset = lineTactic === 'high' ? -10 : lineTactic === 'deep' ? 10 : 0;
            const isSpecial  = !!this.pendingShot;
            const refBallX   = isSpecial ? 50 : clamp(this.ball.x, 30, 70);
            const shiftF     = 0.75;
            let   formationX = p.baseX + (refBallX - 50) * shiftF + lineOffset * (isHome ? -1 : 1);
            let   formationY = p.baseY + (this.ball.y - 50) * 0.05;

            const isCB = ['CD','BPD','NCB'].includes(p.role);
            let markTarget = null;
            if (!isSpecial) {
                const alreadyMarked = new Set(
                    this.players
                        .filter(a => a.teamId === p.teamId && a !== p && typeof a._markTargetId === 'string')
                        .map(a => a._markTargetId)
                );
                let minM = 999;
                this.players.forEach(opp => {
                    if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                        if (alreadyMarked.has(opp.id)) return;
                        if (isCB) {
                            const ob = this.getRoleBehavior(opp.role);
                            if (ob.hugLine || opp.y < 20 || opp.y > 80) return;
                        }
                        const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                        const inDanger = isHome ? opp.x < 40 : opp.x > 60;
                        if (inDanger && d < minM) { minM = d; markTarget = opp; }
                    }
                });
                p._markTargetId = markTarget ? markTarget.id : null;
            }

            if (markTarget) {
                const gX     = isHome ? 0 : 100;
                const markX  = markTarget.x + (gX - markTarget.x) * 0.15;
                const isPen  = isHome ? markX < formationX : markX > formationX;
                const finalX = isPen
                    ? markX * 0.85 + formationX * 0.15
                    : markX * 0.3  + formationX * 0.7;
                this._applyMovement(p, finalX, markTarget.y, 0.35);
            } else {
                if (this.ball.owner && !isSpecial) {
                    const dB = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    const inOwnHalf = isHome ? this.ball.x < 35 : this.ball.x > 65;
                    const shouldStep = (p === presser) || (inOwnHalf && dB < 15);
                    if (shouldStep) {
                        this._stepTowardBall(p, speedFactor, presser);
                        return;
                    }
                }
                const beaten = isHome ? this.ball.x < p.x - 2 : this.ball.x > p.x + 2;
                if (beaten && !isSpecial) {
                    const rX = this.ball.x + (isHome ? -15 : 15);
                    const dx = rX - p.x, dy = this.ball.y - p.y;
                    const d  = Math.hypot(dx, dy);
                    if (d > 0) { p.x += (dx/d)*2.2*speedFactor; p.y += (dy/d)*2.2*speedFactor; }
                    return;
                }
                this._applyMovement(p, formationX, formationY, 0.22);
            }
            return;
        }

        // GK
        if (p.position === 'GK') {
            const gX = isHome ? 5 : 95;
            this._applyMovement(p, gX, clamp(50 + (this.ball.y - 50) * 0.05, 40, 60), 0.22);
        }
    }

    _stepTowardBall(p, speedFactor, presser) {
        const isHome = p.teamId === 'home';
        const iX = this.ball.x * 0.9 + (isHome ? 0 : 100) * 0.1;
        const dx = iX - p.x, dy = (this.ball.y * 0.9 + 50 * 0.1) - p.y;
        const d  = Math.hypot(dx, dy);
        const sS = 2.3 * speedFactor;
        if (d > 0) { p.x += (dx/d)*sS; p.y += (dy/d)*sS; }

        const dB = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
        const tC = dB < 2 ? 0.2 : dB < 5 ? 0.1 : 0.05;
        if (dB < 5 && p._stealCooldown === 0 && Math.random() < tC) {
            this.attemptTackle(p, this.ball.owner);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 4.21  MOVEMENT HELPERS
    // ─────────────────────────────────────────────────────────────
    _applyMovement(p, targetX, targetY, moveSpeed) {
        // ── [FIX 2] CB 간격 보정 강화 ──
        const isCB = ['CD','BPD','NCB'].includes(p.role);
        if (isCB && p.position === 'DF') {
            const otherCBs = this.players.filter(q =>
                q.teamId === p.teamId && q !== p &&
                ['CD','BPD','NCB'].includes(q.role) && q.position === 'DF'
            );
            for (const cb2 of otherCBs) {
                const CB_GAP_MIN = 6;   // CB끼리 최소 Y 간격 (기존 4 → 6으로 상향)
                const CB_GAP_MAX = 14;  // CB끼리 최대 Y 간격 (기존 12 → 14로 소폭 상향, 하드캡 강화)
                const dy  = targetY - cb2.y;
                const abs = Math.abs(dy);
                const dir = dy >= 0 ? 1 : -1;

                if (abs < CB_GAP_MIN) {
                    targetY = cb2.y + dir * CB_GAP_MIN;
                } else if (abs > CB_GAP_MAX) {
                    targetY = cb2.y + dir * CB_GAP_MAX;
                }

                // ── [FIX 2] 실제 p.y 교정 + velocity 완전 억제 ──
                const dyActual = p.y - cb2.y;
                if (Math.abs(dyActual) > CB_GAP_MAX) {
                    // 한 번에 교정 (gap_max 정확히 맞춤)
                    p.y  = cb2.y + (dyActual >= 0 ? 1 : -1) * CB_GAP_MAX;
                    p.vy = 0;  // velocity 완전 리셋 (기존엔 *0.05 → 누적 가능했음)
                }
            }
        } else if (p.position === 'DF') {
            const allDF = this.players.filter(q => q.teamId === p.teamId && q !== p && q.position === 'DF');
            for (const tm of allDF) {
                const dy  = targetY - tm.y;
                const abs = Math.abs(dy);
                const dir = dy >= 0 ? 1 : -1;
                if (abs < 2.0) targetY = tm.y + dir * 2.0;
            }
        }

        // Collision avoidance with all teammates
        const allTM = this.players.filter(q => q.teamId === p.teamId && q !== p);
        for (const tm of allTM) {
            const d = Math.hypot(targetX - tm.x, targetY - tm.y);
            if (d < 5) {
                const a = Math.atan2(targetY - tm.y, targetX - tm.x);
                targetX += Math.cos(a) * (5 - d) * 0.5;
                targetY += Math.sin(a) * (5 - d) * 0.5;
            }
        }

        targetX = clamp(targetX, 2, 98);
        targetY = clamp(targetY, 2, 98);

        const aX = (targetX - p.x) * moveSpeed * 0.1;
        const aY = (targetY - p.y) * moveSpeed * 0.1;
        p.vx = (p.vx + aX) * 0.7;
        p.vy = (p.vy + aY) * 0.7;
        p.x += p.vx;
        p.y += p.vy;
    }

    _getSafeReturnX(p, isHome) {
        // ── [FIX 3] FW 복귀 목표값 강화 ──
        // 무조건 하프라인(46/54) 이하로 복귀시킴
        const HALFLINE_HOME = 46;
        const HALFLINE_AWAY = 54;

        const ourTeam = this.players.filter(q => q.teamId === p.teamId && q !== p);
        if (isHome) {
            const sorted = ourTeam.map(q => q.x).sort((a, b) => a - b);
            const teamRef = sorted[1] ?? sorted[0] ?? 30;
            // 팀 최저선 또는 하프라인 중 더 뒤쪽으로 (더 보수적으로)
            return clamp(Math.min(teamRef, p.baseX, HALFLINE_HOME), 10, HALFLINE_HOME);
        } else {
            const sorted = ourTeam.map(q => q.x).sort((a, b) => b - a);
            const teamRef = sorted[1] ?? sorted[0] ?? 70;
            return clamp(Math.max(teamRef, p.baseX, HALFLINE_AWAY), HALFLINE_AWAY, 90);
        }
    }

    _pullBackFW(p, safeX, isHome, speedFactor, moveSpeed) {
        this._applyMovement(p, safeX, p.baseY, moveSpeed);
        const tooFar = isHome ? p.x > safeX + 2 : p.x < safeX - 2;
        if (tooFar) {
            const pullDir = isHome ? -1 : 1;
            p.x += pullDir * 4.0 * speedFactor;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 4.22  DEFENSIVE LINE ADJUSTMENT
    // ─────────────────────────────────────────────────────────────
    adjustDefensiveLines() {
        // Line shift is applied in _processDefensiveMovement/formationX calc above.
    }

    // ─────────────────────────────────────────────────────────────
    // 4.23  OFFSIDE HELPERS
    // ─────────────────────────────────────────────────────────────
    _calcOffsideLineX(isHomeFW) {
        const defendingTeamId = isHomeFW ? 'away' : 'home';
        const defenders = this.players.filter(q => q.teamId === defendingTeamId);
        if (isHomeFW) {
            const sorted = defenders.map(q => q.x).sort((a, b) => a - b);
            return Math.min(sorted[1] ?? sorted[0] ?? 90, 88);
        } else {
            const sorted = defenders.map(q => q.x).sort((a, b) => b - a);
            return Math.max(sorted[1] ?? sorted[0] ?? 10, 12);
        }
    }

    _enforceOffsideLine(player, isHomeFW) {
        const limit   = this._calcOffsideLineX(isHomeFW);
        const offside = isHomeFW ? player.x > limit : player.x < limit;
        if (offside) {
            player.x  = isHomeFW ? Math.min(player.x, limit - 1) : Math.max(player.x, limit + 1);
            player.vx *= 0.1;
        }
        return limit;
    }

    applyOffsideCheck(targetPos, player) {
        const oppTeamId = player.teamId === 'home' ? 'away' : 'home';
        const opponents = this.players.filter(p => p.teamId === oppTeamId);
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

    // ─────────────────────────────────────────────────────────────
    // 4.24  MISC HELPERS
    // ─────────────────────────────────────────────────────────────
    checkFrontalBlock(player, goalX) {
        const fwd = player.teamId === 'home' ? 1 : -1;
        const checkDist = 8, checkWidth = 4;
        const minY = player.y - checkWidth, maxY = player.y + checkWidth;
        const minX = fwd === 1 ? player.x          : player.x - checkDist;
        const maxX = fwd === 1 ? player.x + checkDist : player.x;
        return this.players.some(opp =>
            opp.teamId !== player.teamId &&
            opp.x >= minX && opp.x <= maxX &&
            opp.y >= minY && opp.y <= maxY
        );
    }

    findBestPassTarget(player, mode = 'aggressive') {
        const gameState = mode === 'safe' ? 'buildup' : this._getGameState(player.teamId);
        const teammates = this.players.filter(p => p.teamId === player.teamId && p !== player);
        if (!teammates.length) return null;
        return teammates
            .map(tm => ({ tm, score: this._scorePassOption(player, tm, gameState) * (mode === 'safe' ? -1 : 1) }))
            .sort((a, b) => b.score - a.score)[0].tm;
    }

    findNearestDefender(attacker) {
        let nearest = null, minD = 999;
        this.players.forEach(p => {
            if (p.teamId !== attacker.teamId) {
                const d = Math.hypot(p.x - attacker.x, p.y - attacker.y);
                if (d < minD) { minD = d; nearest = p; }
            }
        });
        return nearest ? { player: nearest, dist: minD } : null;
    }

    attemptTackle(defender, attacker) {
        if (!attacker) return false;
        if (defender._stealCooldown > 0) return false;

        const defStat  = this.getEffectiveStat(defender, 'defense');
        const atkStat  = this.getEffectiveStat(attacker,  'decision');
        const atkSpeed = this.getEffectiveStat(attacker,  'speed');
        const speedBonus = (atkSpeed / 100) * 30;

        if (defStat * Math.random() > (atkStat + speedBonus) * Math.random()) {
            this.ball.owner = defender;
            this.ball.lastOwner = null;
            defender._stealCooldown = 20;
            this.eventsQueue.push({ type:'tackle', player: defender.name,
                desc:`${defender.name}의 태클 성공!` });
            this._triggerTurnoverRecovery(attacker.teamId);
            return true;
        }
        return false;
    }

    getRoleBehavior(role) {
        const behaviors = {
            AF:  { runBehind:true,  shootBias:0.2, dribbleBias:0.1 },
            P:   { runBehind:true,  shootBias:0.3, passBias:-0.2 },
            DLF: { comeShort:true,  passBias:0.1 },
            F9:  { comeShort:true,  dribbleBias:0.1, passBias:0.1 },
            TM:  { comeShort:true,  holdUp:true },
            CF:  { comeShort:true,  shootBias:0.1 },
            W:   { hugLine:true,    dribbleBias:0.2, crossBias:0.2 },
            IF:  { cutInside:true,  shootBias:0.1, dribbleBias:0.2 },
            IW:  { cutInside:true,  dribbleBias:0.15 },
            WP:  { hugLine:true,    passBias:0.1 },
            PF:  { runBehind:true,  pressBias:0.3 },
            BBM: { pressBias:0.1,   attackBias:0.3, defenseBias:0.3 },
            MEZ: { cutInside:true,  attackBias:0.5, defenseBias:0.1 },
            DLP: { comeShort:true,  passBias:0.3, defenseBias:0.4 },
            AP:  { comeShort:true,  passBias:0.2, dribbleBias:0.1, attackBias:0.4, defenseBias:0.1 },
            BWM: { pressBias:0.3,   passBias:-0.1, defenseBias:0.5 },
            REG: { passBias:0.4,    defenseBias:0.3 },
            CAR: { comeShort:true,  defenseBias:0.4 },
            EG:  { comeShort:true,  attackBias:0.3 },
            SS:  { runBehind:true,  attackBias:0.6 },
            ANC: { defenseBias:0.6 },
            DM:  { defenseBias:0.5 },
            SV:  { runBehind:true,  attackBias:0.4, defenseBias:0.3 },
            BPD: { passBias:0.1 },
            CD:  { passBias:-0.1 },
            NCB: { passBias:-0.3 },
            WB:  { hugLine:true, overlap:true, dribbleBias:0.1 },
            CWB: { hugLine:true, overlap:true, dribbleBias:0.15 },
            FB:  { overlap:false },
            IWB: { cutInside:true },
            LIB: { passBias:0.1, defenseBias:0.2 },
            GK:  {}
        };
        return behaviors[role] || {};
    }

    getDefensiveLineX(opposingTeamId) {
        const rel = this.players.filter(p => p.teamId === opposingTeamId && p.position !== 'GK');
        const xs  = rel.map(p => p.x);
        if (!xs.length) return opposingTeamId === 'away' ? 80 : 20;
        return opposingTeamId === 'away' ? Math.min(...xs) : Math.max(...xs);
    }

    calcOffBallTarget(player, runType, roleStats) {
        const isHome     = player.teamId === 'home';
        const forwardDir = isHome ? 1 : -1;
        const attackBonus = (roleStats.attack || 0) * 10;
        switch (runType) {
            case RUN_TYPE.STRIKER_RUN: {
                const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
                return { x: defLineX + forwardDir * (5 + attackBonus), y: this.ball.y + (Math.random() - 0.5) * 20 };
            }
            case RUN_TYPE.SUPPORT_RUN:
                return { x: this.ball.x - forwardDir * 10, y: this.ball.y + (player.baseY < 50 ? -10 : 10) };
            case RUN_TYPE.CHANNEL_RUN: {
                const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
                return { x: defLineX + forwardDir * 2, y: this.ball.y < 50 ? 70 : 30 };
            }
            case RUN_TYPE.WIDE_RUN:
                return { x: this.ball.x + forwardDir * 5, y: player.baseY < 50 ? 5 : 95 };
            case RUN_TYPE.UNDERLAP_RUN: {
                const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
                return { x: defLineX + forwardDir * 5, y: player.baseY < 50 ? 30 : 70 };
            }
            default:
                return { x: player.baseX + (this.ball.x - player.baseX) * 0.2,
                         y: player.baseY + (this.ball.y - player.baseY) * 0.2 };
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 4.25  CELEBRATION & POST-MATCH
    // ─────────────────────────────────────────────────────────────
    processCelebrationMovement() {
        if (!this.celebrationActor || !this.celebrationTarget) return;
        const p  = this.celebrationActor;
        const tg = this.celebrationTarget;
        const dx = tg.x - p.x, dy = tg.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1) { const s = 1.2; p.x += (dx/dist)*s; p.y += (dy/dist)*s; }
        if (this.celebrationType === 'quick_restart') { this.ball.x = p.x; this.ball.y = p.y; }
        this.players.forEach(tm => {
            if (tm.teamId !== p.teamId || tm === p) return;
            if (this.celebrationType === 'celebrate') {
                const ddx = p.x - tm.x, ddy = p.y - tm.y, d = Math.hypot(ddx, ddy);
                if (d > 3) { tm.x += (ddx/d)*0.9; tm.y += (ddy/d)*0.9; }
            } else {
                const ddx = tm.baseX - tm.x, ddy = tm.baseY - tm.y, d = Math.hypot(ddx, ddy);
                if (d > 1) { tm.x += (ddx/d)*1.0; tm.y += (ddy/d)*1.0; }
            }
        });
    }

    startExitAnimation(winnerId = null) {
        this.winningTeamId = winnerId;
        this.lapAngle = 0;
        if (winnerId === 'home') {
            this.postMatchPhase = 1;
            this.players.filter(p => p.teamId === 'home').forEach((p, i) => {
                p.lapOrder     = i * 0.2;
                p.radiusNoise  = (Math.random() - 0.5) * 6;
                const startA   = Math.PI / 2 + p.lapOrder;
                p.exitTargetX  = 50 + Math.cos(startA) * (35 + p.radiusNoise);
                p.exitTargetY  = 50 + Math.sin(startA) * (30 + p.radiusNoise);
            });
            this.players.filter(p => p.teamId !== 'home').forEach(p => {
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
                    const dx = p.exitTargetX - p.x, dy = p.exitTargetY - p.y;
                    const d  = Math.hypot(dx, dy);
                    if (d > 3) { p.x += (dx/d)*0.8; p.y += (dy/d)*0.8; allAligned = false; }
                } else { p.y -= 0.8; }
            });
            if (allAligned) { this.postMatchPhase = 2; this.lapAngle = Math.PI / 2; }
        } else if (this.postMatchPhase === 2) {
            this.lapAngle -= 0.015;
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    const a = this.lapAngle + p.lapOrder;
                    const tX = 50 + Math.cos(a) * (40 + p.radiusNoise);
                    const tY = 50 + Math.sin(a) * (35 + p.radiusNoise);
                    p.x += (tX - p.x) * 0.1; p.y += (tY - p.y) * 0.1;
                } else { p.y -= 0.8; }
            });
            if (this.lapAngle < -Math.PI * 1.5) this.initExitMovement();
        } else if (this.postMatchPhase === 3) {
            this.players.forEach(p => {
                const dx = p.exitTargetX - p.x, dy = p.exitTargetY - p.y;
                const d  = Math.hypot(dx, dy);
                if (d > 1) { p.x += (dx/d)*0.7; p.y += (dy/d)*0.7; }
            });
        }
        return this.getSnapshot();
    }

    isExitAnimationDone() {
        if (this.postMatchPhase !== 3) return false;
        return this.players.every(p => p.y < -10 || p.y > 110);
    }
}

// =============================================================================
// [SECTION 5]  GLOBAL REGISTRATION
// =============================================================================

window.RealSoccerEngine   = RealSoccerEngine;
window.DeepTacticManager  = DeepTacticManager;

document.addEventListener('DOMContentLoaded', () => {
    const tacticsBtn = document.querySelector('[data-tab="tactics"]');
    if (tacticsBtn) tacticsBtn.addEventListener('click', () => setTimeout(() => DeepTacticManager.init(), 100));
    setTimeout(() => DeepTacticManager.init(), 1000);
});
