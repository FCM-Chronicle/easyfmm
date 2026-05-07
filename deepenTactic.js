// deepenTactic.js — PlayIntent 시스템 통합 버전 (공격 고착 버그 수정 + FW 전방대기 + clearBall 패스 우선)
// [PART 0] PlayIntent 시스템 ───────────────────────────────────────────────────────────────

const TeamIntent = {
    BUILDUP:    'buildup',
    TRANSITION: 'transition',
    PRESS:      'press',
    HOLD:       'hold',
    ALL_OUT:    'all_out',
    DEFEND:     'defend',
    SET_PIECE:  'set_piece',
};

const PlayerIntent = {
    FIND_SPACE:  'find_space',
    SUPPORT:     'support',
    PRESS_BALL:  'press_ball',
    MARK:        'mark',
    OVERLAP:     'overlap',
    PENETRATE:   'trate',
    HOLD_SHAPE:  'hold_shape',
    PRESS_ZONE:  'press_zone',
    COVER:       'cover',
};

const ROLE_INTENT_PREFERENCE = {
    AF:  [PlayerIntent.PENETRATE,  PlayerIntent.FIND_SPACE],
    P:   [PlayerIntent.PENETRATE,  PlayerIntent.FIND_SPACE],
    CF:  [PlayerIntent.SUPPORT,    PlayerIntent.FIND_SPACE],
    DLF: [PlayerIntent.SUPPORT,    PlayerIntent.FIND_SPACE],
    TM:  [PlayerIntent.SUPPORT,    PlayerIntent.HOLD_SHAPE],
    F9:  [PlayerIntent.SUPPORT,    PlayerIntent.FIND_SPACE],
    PF:  [PlayerIntent.PENETRATE,  PlayerIntent.PRESS_BALL],
    RD:  [PlayerIntent.PENETRATE,  PlayerIntent.FIND_SPACE],
    W:   [PlayerIntent.OVERLAP,    PlayerIntent.FIND_SPACE],
    IF:  [PlayerIntent.PENETRATE,  PlayerIntent.FIND_SPACE],
    WP:  [PlayerIntent.SUPPORT,    PlayerIntent.FIND_SPACE],
    IW:  [PlayerIntent.PENETRATE,  PlayerIntent.FIND_SPACE],
    SS:  [PlayerIntent.PENETRATE,  PlayerIntent.FIND_SPACE],
    BBM: [PlayerIntent.SUPPORT,    PlayerIntent.PENETRATE],
    MEZ: [PlayerIntent.PENETRATE,  PlayerIntent.OVERLAP],
    DLP: [PlayerIntent.SUPPORT,    PlayerIntent.HOLD_SHAPE],
    BWM: [PlayerIntent.PRESS_BALL, PlayerIntent.MARK],
    AP:  [PlayerIntent.SUPPORT,    PlayerIntent.FIND_SPACE],
    REG: [PlayerIntent.SUPPORT,    PlayerIntent.HOLD_SHAPE],
    CAR: [PlayerIntent.SUPPORT,    PlayerIntent.COVER],
    EG:  [PlayerIntent.SUPPORT,    PlayerIntent.FIND_SPACE],
    ANC: [PlayerIntent.HOLD_SHAPE, PlayerIntent.COVER],
    DM:  [PlayerIntent.HOLD_SHAPE, PlayerIntent.MARK],
    SV:  [PlayerIntent.PENETRATE,  PlayerIntent.SUPPORT],
    BPD: [PlayerIntent.HOLD_SHAPE, PlayerIntent.SUPPORT],
    CD:  [PlayerIntent.HOLD_SHAPE, PlayerIntent.MARK],
    NCB: [PlayerIntent.HOLD_SHAPE, PlayerIntent.COVER],
    IWB: [PlayerIntent.OVERLAP,    PlayerIntent.SUPPORT],
    CWB: [PlayerIntent.OVERLAP,    PlayerIntent.FIND_SPACE],
    LIB: [PlayerIntent.SUPPORT,    PlayerIntent.HOLD_SHAPE],
    FB:  [PlayerIntent.HOLD_SHAPE, PlayerIntent.COVER],
    WB:  [PlayerIntent.OVERLAP,    PlayerIntent.SUPPORT],
    GK:  [PlayerIntent.HOLD_SHAPE, PlayerIntent.SUPPORT],
};

class TeamIntentManager {
    constructor() {
        this.intent    = { home: TeamIntent.BUILDUP, away: TeamIntent.BUILDUP };
        this.holdTick  = { home: 0, away: 0 };
        this.playerIntents    = {};
        this.playerIntentTick = {};
        this._transitionCooldown = { home: 0, away: 0 };
    }

    update(engine) {
        this._decideTeamIntent(engine, 'home');
        this._decideTeamIntent(engine, 'away');
        this._decidePlayerIntents(engine);
        this._tickDown();
    }

    _decideTeamIntent(engine, teamId) {
        if (this.holdTick[teamId] > 0) return;

        const myScore   = teamId === 'home' ? engine.homeScore : engine.awayScore;
        const oppScore  = teamId === 'home' ? engine.awayScore : engine.homeScore;
        const scoreDiff = myScore - oppScore;
        const minute    = engine.matchTime || 0;
        const timeLeft  = 90 - minute;

        const ballX          = engine.ball.x;
        const ballOwner      = engine.ball.owner;
        const myTeamHasBall  = ballOwner && ballOwner.teamId === teamId;
        const oppHasBall     = ballOwner && ballOwner.teamId !== teamId;
        const inMyHalf       = teamId === 'home' ? (ballX < 50) : (ballX > 50);

        if (this._transitionCooldown[teamId] > 0) this._transitionCooldown[teamId]--;

        // ① 역습 감지
        const justWonBall  = myTeamHasBall && engine.ball.lastOwner && engine.ball.lastOwner.teamId !== teamId;
        const counterSpace = this._hasCounterSpace(engine, teamId);
        if (justWonBall && counterSpace && this._transitionCooldown[teamId] === 0) {
            this._set(teamId, TeamIntent.TRANSITION, 12);
            this._transitionCooldown[teamId] = 30;
            return;
        }

        // ② 총공격
        if (scoreDiff < 0 && timeLeft <= 15) { this._set(teamId, TeamIntent.ALL_OUT, 8); return; }

        // ③ 리드 유지
        if (scoreDiff > 0 && timeLeft <= 20 && myTeamHasBall) { this._set(teamId, TeamIntent.HOLD, 10); return; }

        // ④ 자진 수비
        const oppDeep = teamId === 'home' ? (ballX < 25) : (ballX > 75);
        if (oppHasBall && oppDeep) { this._set(teamId, TeamIntent.DEFEND, 6); return; }

        // ⑤ 전방 압박
        const oppInTheirHalf = teamId === 'home' ? (ballX > 60) : (ballX < 40);
        const tactic = (typeof gameData !== 'undefined') ? (gameData.currentTactic || 'balanced') : 'balanced';
        if (oppHasBall && oppInTheirHalf && ['gegenpress','tikitaka','totalFootball'].includes(tactic)) {
            this._set(teamId, TeamIntent.PRESS, 8); return;
        }

        // ⑥ 빌드업
        if (myTeamHasBall && inMyHalf) { this._set(teamId, TeamIntent.BUILDUP, 6); return; }

        this._set(teamId, TeamIntent.BUILDUP, 4);
    }

    _decidePlayerIntents(engine) {
        engine.players.forEach(p => {
            if (this.playerIntentTick[p.id] > 0) return;
            const teamIntent = this.intent[p.teamId];
            const intent     = this._resolvePlayerIntent(p, teamIntent, engine);
            this.playerIntents[p.id]    = intent;
            this.playerIntentTick[p.id] = 4 + Math.floor(Math.random() * 5);
        });
    }

    _resolvePlayerIntent(player, teamIntent, engine) {
        const prefs         = ROLE_INTENT_PREFERENCE[player.role] || [PlayerIntent.HOLD_SHAPE, PlayerIntent.SUPPORT];
        const myTeamHasBall = engine.ball.owner && engine.ball.owner.teamId === player.teamId;
        if (engine.ball.owner === player) return PlayerIntent.HOLD_SHAPE;

        switch (teamIntent) {
            case TeamIntent.TRANSITION:
                if (player.position === 'FW') return PlayerIntent.PENETRATE;
                if (player.position === 'MF') return PlayerIntent.SUPPORT;
                return PlayerIntent.HOLD_SHAPE;
            case TeamIntent.ALL_OUT:
                if (player.position === 'GK') return PlayerIntent.HOLD_SHAPE;
                if (player.position === 'DF') return PlayerIntent.SUPPORT;
                return prefs[0];
            case TeamIntent.PRESS: {
                const d = Math.hypot(player.x - engine.ball.x, player.y - engine.ball.y);
                if (d < 18 && player.position !== 'GK') return PlayerIntent.PRESS_BALL;
                return PlayerIntent.PRESS_ZONE;
            }
            case TeamIntent.HOLD:
                if (player.position === 'FW') return PlayerIntent.SUPPORT;
                if (player.position === 'MF') return PlayerIntent.SUPPORT;
                return PlayerIntent.HOLD_SHAPE;
            case TeamIntent.DEFEND:
                if (player.position === 'FW') return PlayerIntent.FIND_SPACE;
                if (player.position === 'MF') return PlayerIntent.MARK;
                return PlayerIntent.HOLD_SHAPE;
            case TeamIntent.BUILDUP:
            default:
                if (!myTeamHasBall) {
                    if (player.position === 'DF') return PlayerIntent.HOLD_SHAPE;
                    return PlayerIntent.PRESS_BALL;
                }
                return prefs[Math.floor(Math.random() * prefs.length)];
        }
    }

    _hasCounterSpace(engine, myTeamId) {
        const oppDefs = engine.players.filter(p => p.teamId !== myTeamId && p.position === 'DF');
        if (!oppDefs.length) return false;
        return myTeamId === 'home'
            ? oppDefs.some(p => p.x < 60)
            : oppDefs.some(p => p.x > 40);
    }

    _set(teamId, intent, ticks) { this.intent[teamId] = intent; this.holdTick[teamId] = ticks; }
    _tickDown() {
        ['home','away'].forEach(t => { if (this.holdTick[t] > 0) this.holdTick[t]--; });
        Object.keys(this.playerIntentTick).forEach(id => { if (this.playerIntentTick[id] > 0) this.playerIntentTick[id]--; });
    }

    getTeamIntent(teamId)    { return this.intent[teamId]; }
    getPlayerIntent(playerId){ return this.playerIntents[playerId] || PlayerIntent.HOLD_SHAPE; }
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// [PART 1] 기존 UI 관리자 (DeepTacticManager)
// ─────────────────────────────────────────────────────────────────────────────────────────
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
            <h4 style="color: #ffd700; margin-top: 0;">⚙️ 세부 전술 설정</h4>
            <div style="margin-bottom: 10px;">
                <label>수비 라인</label>
                <select id="dt-defensiveLine" style="width:100%; padding:5px; background:#333; color:white;">
                    <option value="deep"     ${dt.defensiveLine === 'deep'     ? 'selected' : ''}>내림 (Deep)</option>
                    <option value="standard" ${dt.defensiveLine === 'standard' ? 'selected' : ''}>보통</option>
                    <option value="high"     ${dt.defensiveLine === 'high'     ? 'selected' : ''}>올림 (High)</option>
                </select>
            </div>
            <div style="color: #aaa; font-size: 0.8rem;">* 나머지는 자동 적용됩니다.</div>
        `;
        document.getElementById('dt-defensiveLine').addEventListener('change', (e) => {
            gameData.deepTactics.defensiveLine = e.target.value;
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────────────────
// [신규] 런 타입 정의 / 역할 매핑
// ─────────────────────────────────────────────────────────────────────────────────────────
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
    FB:'hold_position', WB:'wide_run', GK:'hold_position'
};

function getPosByAngle(x, y, angleDeg, dist) {
    const rad = angleDeg * (Math.PI / 180);
    return {
        x: Math.max(2, Math.min(98, x + Math.cos(rad) * dist)),
        y: Math.max(2, Math.min(98, y + Math.sin(rad) * dist))
    };
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// [PART 2] RealSoccerEngine
// ─────────────────────────────────────────────────────────────────────────────────────────

const BallState = {
    LOOSE: 0, CONTROLLED: 1, IN_FLIGHT: 2, DEAD: 3
};

class SimBall {
    constructor() {
        this.x = 50; this.y = 50; this.z = 0;
        this.state = BallState.DEAD;
        this.owner = null; this.lastOwner = null;
        this.targetPos = { x: 50, y: 50 };
        this.velocity = { x: 0, y: 0 };
    }
}

class SimPlayer {
    constructor(data, teamId, role, lineStats, morale = 50, tacticMultiplier = 1.0) {
        this.id = data.name; this.name = data.name;
        this.position = data.position; this.rating = data.rating;
        this.teamId = teamId; this.role = role;
        this.x = 0; this.y = 0; this.vx = 0; this.vy = 0;
        this.baseX = 0; this.baseY = 0;
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
        const statMapping = { 'passing':'technique','shooting':'attack','defense':'defense','speed':'speed','decision':'mentality','physical':'physical' };

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
        this.lastAction = 'normal';

        this.intentMgr = new TeamIntentManager();

        this._possessionTicks = { home: 0, away: 0 };
        this._possessionForceTurnover = false;
        this._tickCounter = 0;

        // ★ [신규] 백패스 카운터 — 3연속 백패스 시 강제 전진
        this._backpassCount = { home: 0, away: 0 };
        // ★ [신규] 공 소유 지속 틱 (공격수 침투 트리거용)
        this._carrierTicks  = { home: 0, away: 0 };
        // ★ [신규] 탈취 직후 안정화 타이머
        this._stabilizeTicks = { home: 0, away: 0 };
        // ★ [신규] 공격수 침투 상태 플래그
        this._fwRunState = {};  // { playerId: 'behind' | 'short' | null }

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
        const aiStats = { attack:{stats:{}}, midfield:{stats:{}}, defense:{stats:{}} };
        const calcAvg = (players) => players.length > 0 ? Math.round(players.reduce((s,p)=>s+p.rating,0)/players.length) : 70;

        const fwOVR = calcAvg(squad.fw.filter(p=>p));
        const mfOVR = calcAvg(squad.mf.filter(p=>p));
        const dfOVR = calcAvg([...squad.df.filter(p=>p), squad.gk].filter(p=>p));
        const lines = { attack: fwOVR, midfield: mfOVR, defense: dfOVR };

        for (const [line, ovr] of Object.entries(lines)) {
            const totalPoints = ovr * 6;
            const baseValue = Math.floor(totalPoints / 6);
            let remainder = totalPoints % 6;
            ['attack','speed','technique','physical','defense','mentality'].forEach(key => {
                aiStats[line].stats[key] = baseValue + (remainder-- > 0 ? 1 : 0);
            });
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
                let role = (gameData.playerRoles && gameData.playerRoles[p.name])
                    ? gameData.playerRoles[p.name]
                    : this.getBestRoleForTactic(tactic, p.position, i);

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
            setupLine(squad.df, 20); setupLine(squad.mf, 45); setupLine(squad.fw, 78);
        } else {
            if (squad.gk) setupLine([squad.gk], 95);
            setupLine(squad.df, 80); setupLine(squad.mf, 55); setupLine(squad.fw, 22);
        }
    }

    getBestRoleForTactic(tactic, position, index) {
        if (position === 'GK') return 'GK';
        const roleMap = {
            'tikitaka':    { FW:['F9','DLF'],     MF:['DLP','AP','MEZ'],    DF:['BPD','IWB'] },
            'possession':  { FW:['DLF','CF'],     MF:['DLP','AP','CAR'],    DF:['BPD','WB'] },
            'lavolpiana':  { FW:['F9','W'],       MF:['DLP','REG','MEZ'],   DF:['BPD','IWB'] },
            'gegenpress':  { FW:['PF','AF'],      MF:['BBM','BWM','MEZ'],   DF:['CD','CWB'] },
            'totalFootball':{ FW:['CF','F9'],     MF:['BBM','MEZ','AP'],    DF:['BPD','CWB','LIB'] },
            'counter':     { FW:['AF','P'],       MF:['BWM','DLP'],         DF:['NCB','FB'] },
            'longBall':    { FW:['TM','AF'],      MF:['BWM','CM'],          DF:['NCB','CD'] },
            'twoLine':     { FW:['AF','P'],       MF:['BWM','CAR'],         DF:['CD','FB'] },
            'parkBus':     { FW:['P','TM'],       MF:['BWM','DLP'],         DF:['NCB','CD'] },
            'catenaccio':  { FW:['TM','P'],       MF:['BWM','DLP'],         DF:['NCB','LIB'] }
        };
        const defaultRoles = { FW:['AF','CF'], MF:['BBM','AP'], DF:['CD','FB'] };
        const selectedMap = roleMap[tactic] || defaultRoles;
        const candidates = selectedMap[position] || defaultRoles[position];
        return candidates[index % candidates.length];
    }

    resetPositions(kickoffTeamId = null) {
        this.ball.x = 50; this.ball.y = 50;
        this.ball.lastOwner = null;

        this._possessionTicks = { home: 0, away: 0 };
        this._possessionForceTurnover = false;
        this._backpassCount  = { home: 0, away: 0 };
        this._carrierTicks   = { home: 0, away: 0 };
        this._stabilizeTicks = { home: 0, away: 0 };
        this._fwRunState     = {};

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
            if (p !== kicker) {
                p.y = p.baseY; p.vx = 0; p.vy = 0;
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

    _updatePossessionBalance() {
        if (this.ball.state !== BallState.CONTROLLED || !this.ball.owner) return;
        const ownerTeam = this.ball.owner.teamId;
        const otherTeam = ownerTeam === 'home' ? 'away' : 'home';

        // ★ 탈취 감지 — 직전 소유팀이 바뀌었으면 안정화 타이머 부여
        if (this.ball.lastOwner && this.ball.lastOwner.teamId !== ownerTeam) {
            this._stabilizeTicks[ownerTeam] = 6;   // 약 0.5초 안정화
            this._backpassCount[ownerTeam]  = 0;
            this._carrierTicks[ownerTeam]   = 0;
        }

        this._possessionTicks[ownerTeam]++;
        this._possessionTicks[otherTeam] = Math.max(0, this._possessionTicks[otherTeam] - 1);

        this._carrierTicks[ownerTeam]++;
        if (this._stabilizeTicks[ownerTeam] > 0) this._stabilizeTicks[ownerTeam]--;

        if (this._possessionTicks[ownerTeam] > 120) {
            this._possessionForceTurnover = true;
        }
    }
    update(minute, isNewMinute) {
        this.eventsQueue = [];

        // ★ 템포 조절: 매 3틱 중 1틱은 이동 연산을 절반만 적용해 경기 흐름을 느리게
        this._tickCounter = (this._tickCounter || 0) + 1;
        const isSlowTick = (this._tickCounter % 3 === 0);

        if (this.ball.state !== BallState.DEAD) {
            this.matchTime = minute;
            this.intentMgr.update(this);
        }

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
                this.ball.state = BallState.LOOSE; this.ball.owner = null;
            }
        }

        if (this.ball.state === BallState.LOOSE && !this.pendingShot) {
            this._looseTicks = (this._looseTicks || 0) + 1;
            if (this._looseTicks >= 3) {
                this._looseTicks = 0;
                let nearestHome = null, nearestAway = null;
                let minDistHome = 999, minDistAway = 999;
                this.players.forEach(p => {
                    const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    if (p.teamId === 'home' && d < minDistHome) { minDistHome = d; nearestHome = p; }
                    if (p.teamId === 'away' && d < minDistAway) { minDistAway = d; nearestAway = p; }
                });
                if (nearestHome && nearestAway) {
                    const totalDist = minDistHome + minDistAway;
                    const homeWinChance = totalDist > 0 ? (minDistAway / totalDist) : 0.5;
                    const winner = Math.random() < homeWinChance ? nearestHome : nearestAway;
                    this.ball.state = BallState.CONTROLLED;
                    this.ball.owner = winner;
                    this.ball.x = winner.x;
                    this.ball.y = winner.y;
                    if (winner.teamId !== (this.ball.lastOwner ? this.ball.lastOwner.teamId : winner.teamId)) {
                        this._possessionTicks[winner.teamId === 'home' ? 'away' : 'home'] = 0;
                        this._possessionTicks[winner.teamId] = 0;
                    }
                } else if (nearestHome || nearestAway) {
                    const winner = nearestHome || nearestAway;
                    this.ball.state = BallState.CONTROLLED;
                    this.ball.owner = winner;
                    this.ball.x = winner.x;
                    this.ball.y = winner.y;
                }
            }
        } else { this._looseTicks = 0; }

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
            const ballSpeed = isSlowTick ? 5 : 7;
            const dx = this.ball.targetPos.x - this.ball.x;
            const dy = this.ball.targetPos.y - this.ball.y;
            const dist = Math.hypot(dx, dy);

            if (dist > ballSpeed && this.ball.targetPos) {
                const tx = this.ball.targetPos.x;
                const ty = this.ball.targetPos.y;
                this.players.forEach(p => {
                    if (p === this.ball.owner) return;
                    const dToTarget = Math.hypot(p.x - tx, p.y - ty);
                    if (dToTarget < 20) {
                        const spd = this.getEffectiveStat(p, 'speed') / 75 * 1.0;
                        const ddx = tx - p.x, ddy = ty - p.y;
                        const dd  = Math.hypot(ddx, ddy);
                        if (dd > 1) { p.x += (ddx / dd) * spd; p.y += (ddy / dd) * spd; }
                    }
                });
            }

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
            if (nearest && minDst < 5) {
                const isBallInOwnHalf = (nearest.teamId === 'home' && this.ball.x < 50) ||
                                        (nearest.teamId === 'away' && this.ball.x > 50);
                const dt = gameData.deepTactics || { defensiveLine: 'standard' };
                this.lastAction = (dt.defensiveLine === 'deep' && isBallInOwnHalf) ? 'counter_attack' : 'normal';
                this.ball.state = BallState.CONTROLLED; this.ball.owner = nearest;
                this.ball.x = nearest.x; this.ball.y = nearest.y;
            }
        }

        this._updatePossessionBalance();

        if (this.ball.state === BallState.CONTROLLED && this.ball.owner) {
            this.processBallCarrierAI(this.ball.owner);
        }
        this.processOffBallAI(isSlowTick);
        this.adjustDefensiveLines();

        return this.getSnapshot();
    }

    consumeStamina() {
        const rates = { 'FW':0.6,'MF':0.7,'DF':0.4,'GK':0.1 };
        this.players.forEach(p => {
            const rate = rates[p.position] || 0.5;
            p.stamina = Math.max(0, p.stamina - (rate * (0.8 + Math.random() * 0.4)));
        });
    }

    getSnapshot() {
        return {
            ball: { x:this.ball.x, y:this.ball.y, z:this.ball.z, state:this.ball.state },
            players: this.players.map(p => ({
                id:p.id, x:p.x, y:p.y, team:p.teamId, hasBall:(this.ball.owner === p),
                intent: this.intentMgr.getPlayerIntent(p.id),
                teamIntent: this.intentMgr.getTeamIntent(p.teamId),
            })),
            events: [...this.eventsQueue],
            isCelebration: this.celebrationTimer > 0,
            teamIntents: { home: this.intentMgr.getTeamIntent('home'), away: this.intentMgr.getTeamIntent('away') }
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ★ 2대1 / 드리블 돌파 판단 헬퍼
    // ─────────────────────────────────────────────────────────────────────────

    _find2v1PassTarget(player) {
        const isHome = player.teamId === 'home';
        const forwardDir = isHome ? 1 : -1;

        const frontDefs = this.players.filter(p =>
            p.teamId !== player.teamId &&
            (isHome ? (p.x > player.x && p.x < player.x + 14) : (p.x < player.x && p.x > player.x - 14)) &&
            Math.abs(p.y - player.y) < 12
        );
        if (frontDefs.length !== 1) return null;

        const theDef = frontDefs[0];

        const supporters = this.players.filter(p =>
            p.teamId === player.teamId &&
            p !== player &&
            p.position !== 'GK' &&
            Math.abs(p.x - player.x) < 20 &&
            Math.abs(p.y - player.y) < 25 &&
            Math.abs(p.y - theDef.y) > 6
        );
        if (!supporters.length) return null;

        supporters.sort((a, b) => Math.hypot(b.x - theDef.x, b.y - theDef.y) - Math.hypot(a.x - theDef.x, a.y - theDef.y));
        return supporters[0];
    }

    _shouldDribblePast(player) {
        const isHome = player.teamId === 'home';
        const frontDefs = this.players.filter(p =>
            p.teamId !== player.teamId &&
            (isHome ? (p.x > player.x && p.x < player.x + 10) : (p.x < player.x && p.x > player.x - 10)) &&
            Math.abs(p.y - player.y) < 8
        );
        if (frontDefs.length !== 1) return false;

        const def = frontDefs[0];
        const mySpeed  = this.getEffectiveStat(player, 'speed');
        const defSpeed = this.getEffectiveStat(def, 'speed');
        const myDecision = this.getEffectiveStat(player, 'decision');

        return (mySpeed > defSpeed + 5) && (myDecision > 60) && Math.random() < 0.45;
    }

    
processBallCarrierAI(player) {
        const isHome     = player.teamId === 'home';
        const goalX      = isHome ? 100 : 0;
        const distToGoal = Math.abs(player.x - goalX);
        const teamId     = player.teamId;

        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const nearestOpp    = this.findNearestDefender(player);
        const pressureDist  = nearestOpp ? nearestOpp.dist : 999;
        // ★ 압박 감지: 내 주변 6m 이내 상대 선수 수 계산
        const nearbyOpps = this.players.filter(p =>
            p.teamId !== teamId && Math.hypot(p.x - player.x, p.y - player.y) < 6
        ).length;
        const underPressure      = pressureDist < 8;
        const underHeavyPressure = nearbyOpps >= 2;
        const noPresssure        = pressureDist > 12 && nearbyOpps === 0;

        const teamIntent   = this.intentMgr.getTeamIntent(teamId);
        const playerIntent = this.intentMgr.getPlayerIntent(player.id);

        // ★ 탈취 직후 안정화 모드: 짧고 안전한 패스 우선
        const isStabilizing = (this._stabilizeTicks[teamId] || 0) > 0;

        // ★ 공격수 침투 여부 확인
        const fwMakingRun = this.players.some(p =>
            p.teamId === teamId && p.position === 'FW' &&
            (this._fwRunState[p.id] === 'behind' || this._fwRunState[p.id] === 'short')
        );

        // ★ 3연속 백패스 강제 전진 모드
        const backpassCount  = this._backpassCount[teamId] || 0;
        const forcedForward  = backpassCount >= 3;

        let shootThreshold  = 30;
        let shootChanceBase = 0.15;
        let passProb        = 0.55;
        let dribbleBias     = 0.0;

        // ★ 압박 상황별 의사결정 가중치 (Context-Aware)
        if (isStabilizing) {
            // 탈취 직후: 무조건 안전한 짧은 패스
            passProb = 0.95;
            shootThreshold = 15;
            shootChanceBase = 0.05;
        } else if (noPresssure) {
            // 압박 없음: 전진 패스/드리블 강하게
            passProb = 0.45;
            dribbleBias = 0.2;
            shootChanceBase += 0.05;
        } else if (underHeavyPressure) {
            // 강한 압박: 빠른 릴리즈
            passProb = 0.85;
            dribbleBias = -0.1;
        } else if (underPressure) {
            // 보통 압박
            passProb = 0.70;
        }

        // ★ 공격수가 침투 중이면 전방 패스 확률 강제 상향
        if (fwMakingRun && !isStabilizing) {
            passProb = Math.min(passProb, 0.50); // 패스 확률 낮추고
            shootChanceBase += 0.03;
            dribbleBias += 0.05;
            // findBestPassTarget에서 FW 우선 선택되도록 별도 경로 사용
        }

        // ★ 3연속 백패스: 강제 전방 모드
        if (forcedForward) {
            passProb = 0.15;
            dribbleBias = 0.4;
            shootThreshold = 40;
            shootChanceBase = 0.30;
        }

        switch (teamIntent) {
            case TeamIntent.TRANSITION:
                if (!isStabilizing) { shootThreshold = 35; shootChanceBase = 0.25; passProb = Math.min(passProb, 0.55); }
                break;
            case TeamIntent.ALL_OUT:
                if (!isStabilizing) { shootThreshold = 38; shootChanceBase = 0.30; passProb = Math.min(passProb, 0.45); dribbleBias += 0.1; }
                break;
            case TeamIntent.PRESS:
                if (!forcedForward) passProb = Math.max(passProb, 0.70);
                break;
            case TeamIntent.HOLD:
                if (!forcedForward) { shootThreshold = 22; shootChanceBase = 0.05; passProb = Math.max(passProb, 0.82); }
                break;
            case TeamIntent.DEFEND:
                if (!forcedForward) passProb = Math.max(passProb, 0.60);
                break;
        }

        switch (playerIntent) {
            case PlayerIntent.PENETRATE:  dribbleBias += 0.15; shootChanceBase += 0.05; passProb -= 0.10; break;
            case PlayerIntent.SUPPORT:    if (!forcedForward) passProb += 0.15; break;
            case PlayerIntent.FIND_SPACE: dribbleBias += 0.10; break;
            case PlayerIntent.OVERLAP:    if (!forcedForward) passProb += 0.20; break;
        }

        if (isAI) { shootThreshold += 2; shootChanceBase += 0.05; }

        // 점유 고착 패널티
        const possessionTick = this._possessionTicks[teamId] || 0;
        let turnoverRisk = 0;
        if (possessionTick > 60)  turnoverRisk = 0.05;
        if (possessionTick > 90)  turnoverRisk = 0.12;
        if (possessionTick > 120) turnoverRisk = 0.22;

        if (this._possessionForceTurnover && Math.random() < 0.35) {
            this._triggerTurnover(player);
            this._possessionForceTurnover = false;
            this._possessionTicks[teamId] = 0;
            return;
        }
        if (turnoverRisk > 0 && Math.random() < turnoverRisk) {
            this._triggerTurnover(player);
            return;
        }

        // ── 슛 판단 ──
        if (distToGoal < shootThreshold && !isStabilizing) {
            let shootChance = shootChanceBase;

            const behavior = this.getRoleBehavior(player.role)
            if (behavior.shootBias) shootChance += behavior.shootBias;

            if (distToGoal < 20) shootChance = Math.max(shootChanceBase, 0.7);
            if (distToGoal < 12) shootChance = 0.95;
            if (teamIntent === TeamIntent.ALL_OUT) shootChance = Math.min(shootChance * 1.3, 0.95);
            if (Math.random() < shootChance) { this.attemptShoot(player, goalX); return; }
        }

        // ── ★ 2대1 패스 ──
        if (!underPressure && (player.position === 'FW' || player.position === 'MF')) {
            const twoV1Target = this._find2v1PassTarget(player);
            if (twoV1Target && Math.random() < 0.72) {
                this._backpassCount[teamId] = 0;
                this.eventsQueue.push({ type:'throughpass', from:player.name, to:twoV1Target.name,
                    desc:`⚡ ${player.name}, 2대1 패스! ${twoV1Target.name}에게!` });
                this.executePass(player, twoV1Target);
                return;
            }
        }

        // ── ★ 드리블 돌파 (기술 스탯 기반 강화) ──
        if (!underPressure && distToGoal < 45 && (player.position === 'FW' || player.position === 'MF')) {
            // ★ 기술 스탯 높을수록 드리블 시도 확률 증가
            const techBonus = Math.max(0, (this.getEffectiveStat(player, 'decision') - 60) / 100);
            const dribbleAttemptChance = 0.30 + techBonus + dribbleBias;
            if (Math.random() < dribbleAttemptChance && this._shouldDribblePast(player)) {
                this._backpassCount[teamId] = 0;
                this._executeDribblePast(player, goalX);
                return;
            }
        }

        // ── ★ 3연속 백패스 강제 롱볼/스루패스 ──
        if (forcedForward) {
            const fwTarget = this.players.find(p =>
                p.teamId === teamId && p.position === 'FW' && p !== player
            );
            const longTarget = fwTarget || this.players
                .filter(p => p.teamId === teamId && p !== player && p.position !== 'GK')
                .sort((a, b) => isHome ? b.x - a.x : a.x - b.x)[0];

            if (longTarget) {
                this._backpassCount[teamId] = 0;
                this.eventsQueue.push({ type:'throughpass', from:player.name, to:longTarget.name,
                    desc:`💥 ${player.name}, 전방으로 과감한 롱볼! ${longTarget.name}!` });
                this.executePass(player, longTarget);
                return;
            }
        }

        // ── 패스 확률 보정 ──
        const isBlocked = this.checkFrontalBlock(player, goalX);
        if (isBlocked) passProb = underPressure ? 0.75 : 0.25 + dribbleBias;
        if (player.position === 'DF' || player.position === 'GK') {
            passProb = underPressure ? 0.98 : Math.max(passProb, 0.4);
        }

        // ★ 미드필더가 압박 없는데 수비수에게 백패스하려는 상황 억제
        const passMode = (teamIntent === TeamIntent.HOLD || teamIntent === TeamIntent.DEFEND) ? 'safe' : 'aggressive';

        let bestPassTarget = null;
        if (player.position === 'GK') {
            bestPassTarget = Math.random() < 0.7
                ? (this.findBestPassTarget(player, 'safe')       || this.findBestPassTarget(player, 'aggressive'))
                : (this.findBestPassTarget(player, 'aggressive') || this.findBestPassTarget(player, 'safe'));
            if (!bestPassTarget || Math.random() >= passProb) { this.clearBall(player); return; }
        } else {
            // ★ 공격수 침투 중이면 FW를 우선 탐색
            if (fwMakingRun && !isStabilizing) {
                bestPassTarget = this._findPenetratingFW(player)
                              || this.findBestPassTarget(player, 'aggressive')
                              || this.findBestPassTarget(player, 'safe');
            } else {
                bestPassTarget = this.findBestPassTarget(player, passMode)
                              || this.findBestPassTarget(player, passMode === 'aggressive' ? 'safe' : 'aggressive');
            }
        }

        // ★ 패스 방향 체크 — 백패스 카운터 업데이트
        if (bestPassTarget && Math.random() < passProb) {
            const isBackPass = isHome
                ? (bestPassTarget.x < player.x - 3)
                : (bestPassTarget.x > player.x + 3);

            if (isBackPass && !isStabilizing && noPresssure) {
                // ★ 압박 없는데 백패스: 50% 확률로 거부하고 드리블 전진
                if (Math.random() < 0.50) {
                    const moveDir = isHome ? 1 : -1;
                    player.x += moveDir * (0.8 + Math.random() * 0.6);
                    player.y += (Math.random() - 0.5) * 2;
                    this.ball.x = player.x; this.ball.y = player.y;
                    return;
                }
            }

            if (isBackPass) {
                this._backpassCount[teamId] = (this._backpassCount[teamId] || 0) + 1;
            } else {
                this._backpassCount[teamId] = 0;
            }

            this.executePass(player, bestPassTarget);
            return;
        }

        // ── 드리블/전진 ──
        const moveDir = isHome ? 1 : -1;
        const effectiveSpeed = this.getEffectiveStat(player, 'speed');
        const speedFactor = effectiveSpeed / 75;
        let moveSpeed = 0.65 * Math.max(0.7, Math.min(1.4, speedFactor));
        let moveDist  = (0.25 + Math.random() * 0.3) * speedFactor;

        if (teamIntent === TeamIntent.TRANSITION) { moveDist *= 1.3; moveSpeed = 1.2; }
        if (teamIntent === TeamIntent.ALL_OUT)    { moveDist *= 1.2; moveSpeed = 1.1; }
        if (teamIntent === TeamIntent.HOLD)       { moveDist *= 0.5; }
        if (playerIntent === PlayerIntent.PENETRATE) moveDist += 0.5;
        if (forcedForward) { moveDist *= 1.5; moveSpeed *= 1.2; }

        if (player.position === 'DF') moveDist = 0.3 + Math.random() * 0.4;
        if (player.position === 'MF' && !underPressure && !isBlocked) moveDist += 0.4;
        if (isAI && (player.position === 'FW' || player.position === 'MF')) moveDist *= 1.1;

        if (isBlocked && !underPressure) {
            player.x += moveDir * (0.8 + Math.random() * 0.6);
            player.y += (Math.random() < 0.5 ? 3.0 : -3.0) + Math.random() * 1.0;
        } else {
            player.x += moveDir * moveDist;
            player.y += (Math.random() - 0.5) * 3;
        }

        // 전진 드리블이면 백패스 카운터 리셋
        this._backpassCount[teamId] = 0;
        this.ball.lastOwner = null;
        player.x = Math.max(5, Math.min(95, player.x));
        player.y = Math.max(2, Math.min(98, player.y));
        this.ball.x = player.x; this.ball.y = player.y;

        if (Math.random() < 0.2) this.eventsQueue.push({ type:'dribble', player:player.name });
    }

    
    _executeDribblePast(player, goalX) {
        const isHome = player.teamId === 'home';
        const moveDir = isHome ? 1 : -1;

        const frontDefs = this.players.filter(p =>
            p.teamId !== player.teamId &&
            (isHome ? (p.x > player.x && p.x < player.x + 10) : (p.x < player.x && p.x > player.x - 10)) &&
            Math.abs(p.y - player.y) < 8
        );
        const def = frontDefs[0];
        const evadeY = def ? ((player.y < def.y) ? -5 : 5) : (Math.random() < 0.5 ? -4 : 4);

        const myDribble  = this.getEffectiveStat(player, 'decision') * (0.9 + Math.random() * 0.2);
        const defTackle  = def ? this.getEffectiveStat(def, 'defense') * (0.7 + Math.random() * 0.3) : 0;
        const success    = myDribble * 1.1 > defTackle;

        if (success) {
            player.x += moveDir * (2.5 + Math.random() * 1.5);
            player.y += evadeY + (Math.random() - 0.5) * 2;
            this.ball.x = player.x; this.ball.y = player.y;
            this.eventsQueue.push({ type:'dribble', player:player.name, desc:`🔥 ${player.name}, 수비수를 제치고 돌파!` });
        } else {
            if (def) {
                this.ball.owner = def; this.ball.lastOwner = player;
                this.ball.x = def.x; this.ball.y = def.y;
                this._possessionTicks[player.teamId] = 0;
                this._possessionTicks[def.teamId] = 0;
                this.eventsQueue.push({ type:'tackle', player:def.name, desc:`${def.name}, 드리블을 차단!` });
            }
        }
    }

    _triggerTurnover(player) {
        const isHome = player.teamId === 'home';
        const opponents = this.players.filter(p => p.teamId !== player.teamId);
        if (!opponents.length) return;

        let target = null;
        let minD = 999;
        opponents.forEach(p => {
            const d = Math.hypot(p.x - player.x, p.y - player.y);
            if (d < minD && d < 25) { minD = d; target = p; }
        });

        if (target) {
            const errorAngle = (Math.random() - 0.5) * 1.2;
            const noiseDist = 4 + Math.random() * 6;
            this.ball.state = BallState.IN_FLIGHT;
            this.ball.owner = null;
            this.ball.lastOwner = player;
            this.ball.targetPos = {
                x: Math.max(2, Math.min(98, target.x + Math.cos(errorAngle) * noiseDist)),
                y: Math.max(2, Math.min(98, target.y + Math.sin(errorAngle) * noiseDist))
            };
            this.eventsQueue.push({ type:'tackle', player:target.name, desc:`${player.name}, 볼을 빼앗깁니다!` });
        } else {
            this.ball.state = BallState.LOOSE;
            this.ball.owner = null;
            this.ball.lastOwner = player;
            this.ball.x = player.x + (Math.random() - 0.5) * 8;
            this.ball.y = player.y + (Math.random() - 0.5) * 8;
            this.eventsQueue.push({ type:'dribble', player:player.name, desc:`${player.name}, 볼을 흘립니다!` });
        }

        const opponentTeam = isHome ? 'away' : 'home';
        this._possessionTicks[player.teamId] = 0;
        this._possessionTicks[opponentTeam] = 0;
        this.intentMgr._transitionCooldown[opponentTeam] = 0;
    }

    findBestPassTarget(player, mode = 'aggressive') {
        const teamates = this.players.filter(p => p.teamId === player.teamId && p !== player);
        let bestTarget = null;
        let maxScore   = mode === 'aggressive' ? 10 : -50;

        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const isHome   = player.teamId === 'home';
        const forwardX = isHome ? 100 : 0;

        const teamIntent = this.intentMgr.getTeamIntent(player.teamId);
        let forwardWeight = 4.5;
        if (teamIntent === TeamIntent.HOLD)       forwardWeight = 1.0;
        if (teamIntent === TeamIntent.TRANSITION) forwardWeight = 6.5;
        if (teamIntent === TeamIntent.ALL_OUT)    forwardWeight = 7.0;
        if (teamIntent === TeamIntent.DEFEND)     forwardWeight = 2.0;

        const possessionTick = this._possessionTicks[player.teamId] || 0;
        if (possessionTick > 60) forwardWeight *= 0.8;
        if (possessionTick > 90) forwardWeight *= 0.6;

        teamates.forEach(tm => {
            const targetIntent = this.intentMgr.getPlayerIntent(tm.id);

            const distBefore = Math.abs(player.x - forwardX);
            const distAfter  = Math.abs(tm.x - forwardX);
            let forwardScore = distBefore - distAfter;

            if (mode === 'safe') {
                forwardScore *= 0.3;
            } else {
                forwardScore *= forwardWeight;
                if (distAfter > distBefore) forwardScore -= 120;
                if (isAI && forwardScore > 0) forwardScore *= 1.2;
            }

            const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
            let distScore = dist < 5 ? -30 : dist < 10 ? 10 : dist > 35 ? -(dist - 35) * 2.0 : 20;
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
            if (player.position === 'DF' && tm.position === 'MF') positionBonus = 5;
            if (player.position === 'GK' && tm.position === 'DF') positionBonus = 5;

            let intentBonus = 0;
            if (targetIntent === PlayerIntent.SUPPORT)    intentBonus += 25;
            if (targetIntent === PlayerIntent.PENETRATE)  intentBonus += 20;
            if (targetIntent === PlayerIntent.FIND_SPACE) intentBonus += 15;
            if (targetIntent === PlayerIntent.OVERLAP)    intentBonus += 30;
            if (targetIntent === PlayerIntent.HOLD_SHAPE) intentBonus -= 10;

            const totalScore = forwardScore + distScore + pressureScore - loopPenalty + positionBonus + intentBonus;
            if (totalScore > maxScore) { maxScore = totalScore; bestTarget = tm; }
        });

        return bestTarget;
    }

    clearBall(player) {
        const isHome = player.teamId === 'home';
        const forwardDir = isHome ? 1 : -1;

        const nearestOpp = this.findNearestDefender(player);
        const pressureDist = nearestOpp ? nearestOpp.dist : 999;
        const isUnderPressure = pressureDist < 7;

        if (!isUnderPressure) {
            const safeTarget = this.findBestPassTarget(player, 'safe');
            if (safeTarget) {
                this.executePass(player, safeTarget);
                return;
            }
        }

        const teammates = this.players.filter(p =>
            p.teamId === player.teamId &&
            p !== player &&
            p.position !== 'GK' &&
            (isHome ? p.x > player.x + 10 : p.x < player.x - 10)
        );

        let targetX, targetY;

        if (teammates.length > 0) {
            teammates.sort((a, b) => isHome ? b.x - a.x : a.x - b.x);
            const receiver = teammates[Math.floor(Math.random() * Math.min(2, teammates.length))];
            const errorX = (Math.random() - 0.5) * 10;
            const errorY = (Math.random() - 0.5) * 12;
            targetX = Math.max(2, Math.min(98, receiver.x + errorX));
            targetY = Math.max(2, Math.min(98, receiver.y + errorY));
        } else {
            targetX = 50 + (forwardDir * (Math.random() * 10));
            targetY = 20 + Math.random() * 60;
        }

        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null; this.ball.lastOwner = player;
        this.ball.targetPos = { x: targetX, y: targetY };
        this.eventsQueue.push({ type:'pass', from:player.name, to:'걷어내기', desc:`${player.name}, 멀리 걷어냅니다!` });
    }

    executePass(from, to) {
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.lastOwner = from; this.ball.owner = null;

        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        let accuracy = from.stats.passing;

        const forwardX = from.teamId === 'home' ? 100 : 0;
        const distToGoalFrom = Math.abs(from.x - forwardX);
        const distToGoalTo   = Math.abs(to.x - forwardX);
        const isThroughPass  = (distToGoalFrom - distToGoalTo > 5) && dist > 10 && distToGoalFrom < 60;

        const distPenalty = Math.max(0, (dist - 20) * 0.8);
        let successChance = accuracy - distPenalty;
        if (from.position === 'GK' && dist > 50) successChance -= 15;

        const possessionTick = this._possessionTicks[from.teamId] || 0;
        if (possessionTick > 60)  successChance -= 8;
        if (possessionTick > 90)  successChance -= 15;
        if (possessionTick > 120) successChance -= 25;

        let eventType = 'pass';
        let eventDesc = `${from.name}, ${to.name}에게 연결!`;
        if (isThroughPass) {
            eventType = 'throughpass'; successChance -= 20;
            if (accuracy > 75) successChance += (accuracy - 75) * 1.5;
            eventDesc = `⚡ ${from.name}, ${to.name}에게 결정적인 스루패스!`;
        }

        const isBadPass = Math.random() * 100 > successChance;
        if (isBadPass) {
            const errorMargin = dist * 0.25;
            const angle = Math.random() * Math.PI * 2;
            const errorDist = Math.random() * errorMargin + 5;
            this.ball.targetPos = {
                x: Math.max(2, Math.min(98, to.x + Math.cos(angle) * errorDist)),
                y: Math.max(2, Math.min(98, to.y + Math.sin(angle) * errorDist))
            };
            this.eventsQueue.push({ type:'pass', from:from.name, to:to.name,
                desc: isThroughPass ? `${from.name}의 스루패스가 차단됩니다.` : `${from.name}, 패스 미스!` });
        } else {
            this.ball.targetPos = { x:to.x, y:to.y };
            this.eventsQueue.push({ type:eventType, from:from.name, to:to.name, desc:eventDesc });
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
        const shotPower  = effectiveShooting * (0.8 + Math.random() * 0.4) * distFactor * angleFactor;
        const savePower  = gkRating * (0.8 + Math.random() * 0.5) + 5;
        let goalChance = Math.max(0.01, Math.min(0.55, 0.12 + (shotPower - savePower) * 0.0025));
        if (this.lastAction === 'counter_attack') goalChance *= 1.2;

        const teamIntent = this.intentMgr.getTeamIntent(shooter.teamId);
        if (teamIntent === TeamIntent.ALL_OUT)    goalChance = Math.min(goalChance * 1.15, 0.60);
        if (teamIntent === TeamIntent.TRANSITION) goalChance = Math.min(goalChance * 1.10, 0.58);

        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null;
        this.ball.targetPos = { x:goalX, y:45 + Math.random() * 10 };
        this.pendingShot = { isGoal: Math.random() < goalChance, shooter, goalX };
    }

    handleShotResult() {
        const { isGoal, shooter, goalX } = this.pendingShot;
        this.pendingShot = null;

        if (isGoal) {
            if (shooter.teamId === 'home') this.homeScore++;
            else this.awayScore++;

            const isHome   = shooter.teamId === 'home';
            const myScore  = isHome ? this.homeScore : this.awayScore;
            const oppScore = isHome ? this.awayScore : this.homeScore;

            let assister = null;
            if (this.ball.lastOwner && this.ball.lastOwner.teamId === shooter.teamId && this.ball.lastOwner.name !== shooter.name) {
                assister = this.ball.lastOwner.name;
            }

            this.celebrationType = (myScore < oppScore) ? 'quick_restart' : 'celebrate';
            this.celebrationActor  = shooter;
            const cGoalX  = isHome ? 100 : 0;
            const cornerY = shooter.y < 50 ? 0 : 100;
            this.celebrationTarget = this.celebrationType === 'quick_restart' ? { x:50,y:50 } : { x:cGoalX, y:cornerY };

            this.eventsQueue.push({ type:'goal', scorer:shooter.name, team:shooter.teamId, assister });
            this.lastScorerTeam  = shooter.teamId;
            this.celebrationTimer = 40;
            this.ball.state = BallState.DEAD;
            this.ball.lastOwner = null;
        } else {
            const opponentTeamId  = shooter.teamId === 'home' ? 'away' : 'home';
            const isHomeAttacking = shooter.teamId === 'home';
            const defenders = this.players.filter(p =>
                p.teamId === opponentTeamId && p.position !== 'GK' &&
                Math.abs(p.x - shooter.x) < 15 && Math.abs(p.y - shooter.y) < 5
            );
            const blockingDefs = defenders.filter(p => isHomeAttacking ? (p.x > shooter.x) : (p.x < shooter.x));

            if (blockingDefs.length > 0 && Math.random() < 0.35) {
                const blocker = blockingDefs[0];
                this.eventsQueue.push({ type:'block', shooter:shooter.name, blocker:blocker.name, desc:`🛡️ ${blocker.name}, 몸을 날려 슈팅을 막아냅니다!` });

                const defTeamId = blocker.teamId;
                const nearbyDefenders = this.players.filter(p =>
                    p.teamId === defTeamId && p !== blocker &&
                    Math.hypot(p.x - blocker.x, p.y - blocker.y) < 25
                );
                let bounceX, bounceY;
                if (nearbyDefenders.length > 0) {
                    const recv = nearbyDefenders[Math.floor(Math.random() * Math.min(2, nearbyDefenders.length))];
                    bounceX = recv.x + (Math.random() - 0.5) * 8;
                    bounceY = recv.y + (Math.random() - 0.5) * 8;
                } else {
                    bounceX = blocker.x + (isHomeAttacking ? -8 : 8);
                    bounceY = blocker.y + (Math.random() - 0.5) * 15;
                }
                this.ball.state = BallState.LOOSE; this.ball.owner = null;
                this.ball.x = Math.max(2, Math.min(98, bounceX));
                this.ball.y = Math.max(2, Math.min(98, bounceY));
                this._possessionTicks[shooter.teamId] = 0;
                return;
            }

            const enemyGk = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');
            if (enemyGk) {
                if (Math.random() < 0.5) {
                    this.eventsQueue.push({ type:'save', shooter:shooter.name, gk:enemyGk.name, desc:`🧤 ${enemyGk.name}, 슈팅을 펀칭으로 쳐냅니다!` });

                    const gkTeamId = enemyGk.teamId;
                    const gkTeammates = this.players.filter(p =>
                        p.teamId === gkTeamId &&
                        p !== enemyGk &&
                        (p.position === 'DF' || p.position === 'MF') &&
                        Math.hypot(p.x - enemyGk.x, p.y - enemyGk.y) < 40
                    );
                    let punchX, punchY;
                    if (gkTeammates.length > 0) {
                        gkTeammates.sort((a, b) => Math.hypot(a.x - enemyGk.x, a.y - enemyGk.y) - Math.hypot(b.x - enemyGk.x, b.y - enemyGk.y));
                        const recv = gkTeammates[Math.floor(Math.random() * Math.min(2, gkTeammates.length))];
                        punchX = recv.x + (Math.random() - 0.5) * 10;
                        punchY = recv.y + (Math.random() - 0.5) * 12;
                    } else {
                        const punchDir = gkTeamId === 'home' ? 1 : -1;
                        punchX = enemyGk.x + punchDir * (15 + Math.random() * 10);
                        punchY = enemyGk.y + (Math.random() - 0.5) * 20;
                    }
                    this.ball.state = BallState.LOOSE; this.ball.owner = null;
                    this.ball.x = Math.max(2, Math.min(98, punchX));
                    this.ball.y = Math.max(2, Math.min(98, punchY));
                    this._possessionTicks[shooter.teamId] = 0;
                } else {
                    this.eventsQueue.push({ type:'save', shooter:shooter.name, gk:enemyGk.name, desc:`🧤 ${enemyGk.name}, 안정적으로 공을 잡아냅니다.` });
                    this.ball.state = BallState.CONTROLLED; this.ball.owner = enemyGk;
                    this.ball.x = enemyGk.x; this.ball.y = enemyGk.y;
                    this._possessionTicks[shooter.teamId] = 0;
                    this._possessionTicks[enemyGk.teamId] = 0;
                }
            } else {
                this.eventsQueue.push({ type:'miss', shooter:shooter.name, desc:`🥅 ${shooter.name}의 슈팅이 골문을 벗어납니다.` });
                this.ball.state = BallState.LOOSE;
                this.ball.x = goalX === 0 ? 5 : 95; this.ball.y = 50;
                this._possessionTicks[shooter.teamId] = 0;
            }
        }
    }

    processCelebrationMovement() {
        if (!this.celebrationActor || !this.celebrationTarget) return;
        const p = this.celebrationActor;
        const dx = this.celebrationTarget.x - p.x;
        const dy = this.celebrationTarget.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1) { p.x += (dx / dist) * 1.2; p.y += (dy / dist) * 1.2; }

        if (this.celebrationType === 'quick_restart') { this.ball.x = p.x; this.ball.y = p.y; }

        this.players.forEach(tm => {
            if (tm.teamId === p.teamId && tm !== p) {
                if (this.celebrationType === 'celebrate') {
                    const d = Math.hypot(p.x - tm.x, p.y - tm.y);
                    if (d > 3) { tm.x += ((p.x - tm.x) / d) * 0.9; tm.y += ((p.y - tm.y) / d) * 0.9; }
                } else {
                    const d = Math.hypot(tm.baseX - tm.x, tm.baseY - tm.y);
                    if (d > 1) { tm.x += ((tm.baseX - tm.x) / d) * 1.0; tm.y += ((tm.baseY - tm.y) / d) * 1.0; }
                }
            }
        });
    }

    // ★ processOffBallAI — FW 전진 목표 수정 + 수비 태클 거리/확률 조정
    processOffBallAI(isSlowTick = false) {
        const attackingTeam = this.ball.owner ? this.ball.owner.teamId : null;
        let isAttackingAI = false;
        if (attackingTeam && typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAttackingAI = (attackingTeam !== userSide);
        }

        const isLooseBall = !this.ball.owner && this.ball.state === BallState.LOOSE;

        // ★ [신규] 공격수 침투 트리거:
        //   볼 소유 2틱(약 2초) 이상 경과 + 공격수가 아직 침투 안 함 → 침투 명령
        if (attackingTeam) {
            const carrierTick = this._carrierTicks[attackingTeam] || 0;
            if (carrierTick >= 2) {
                const fwPlayers = this.players.filter(p =>
                    p.teamId === attackingTeam && p.position === 'FW'
                );
                fwPlayers.forEach((fw, idx) => {
                    if (!this._fwRunState[fw.id]) {
                        // 첫 번째 FW: 뒷공간 침투, 두 번째 FW: 공 받으러 내려오기
                        this._fwRunState[fw.id] = idx === 0 ? 'behind' : 'short';
                    }
                });
            }
        }

        // ★ 압박자 선정
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

        let secondPresser = null;
        if (this.ball.owner && presser) {
            const isHome = this.ball.owner.teamId === 'home';
            const goalX = isHome ? 100 : 0;
            const distToGoal = Math.abs(this.ball.x - goalX);
            if (distToGoal < 30) {
                let minD2 = 999;
                this.players.forEach(p => {
                    if (p.teamId !== attackingTeam && p !== presser) {
                        const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                        if (d < minD2 && d < 20) { minD2 = d; secondPresser = p; }
                    }
                });
            }
        }

        let nearestHome = null, nearestAway = null;
        if (isLooseBall) {
            let minDHome = 999, minDAway = 999;
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (p.teamId === 'home') { if (d < minDHome) { minDHome = d; nearestHome = p; } }
                else                     { if (d < minDAway) { minDAway = d; nearestAway = p; } }
            });
        }

        this.players.forEach(p => {
            if (p === this.ball.owner) return;

            const dt       = gameData.deepTactics || { pressIntensity:'mid', defensiveLine:'standard' };
            const behavior = this.getRoleBehavior(p.role);

            let targetX = p.x, targetY = p.y;
            let pressDetectDist = 15;
            let sprintBonus = 1.0;
            if (dt.pressIntensity === 'high') { pressDetectDist = 25; sprintBonus = 1.2; }
            else if (dt.pressIntensity === 'low') pressDetectDist = 8;

            const effectiveSpeed = this.getEffectiveStat(p, 'speed');
            const speedFactor = effectiveSpeed / 75;
            let moveSpeed = 0.75 * Math.max(0.7, Math.min(1.4, speedFactor));

            // GK 고정
            if (p.position === 'GK') {
                const isHomeGK  = p.teamId === 'home';
                const goalLineX = isHomeGK ? 3 : 97;
                const maxAdv    = isHomeGK ? 12 : 88;
                targetX = isHomeGK
                    ? Math.max(goalLineX, Math.min(maxAdv, p.x + (this.ball.x - p.x) * 0.05))
                    : Math.min(goalLineX, Math.max(maxAdv, p.x + (this.ball.x - p.x) * 0.05));
                targetY = Math.max(38, Math.min(62, 50 + (this.ball.y - 50) * 0.25));
                const accelX = (targetX - p.x) * 0.15;
                const accelY = (targetY - p.y) * 0.15;
                p.vx = (p.vx + accelX) * 0.7; p.vy = (p.vy + accelY) * 0.7;
                p.x += p.vx; p.y += p.vy;
                return;
            }

            // 루즈볼 추적
            if (isLooseBall) {
                const isNearest = (p === nearestHome || p === nearestAway);
                if (isNearest) { targetX = this.ball.x; targetY = this.ball.y; moveSpeed = 1.0; }
            }

            const isHome       = p.teamId === 'home';
            const isTeamAttacking = attackingTeam
                ? (p.teamId === attackingTeam)
                : (isHome ? this.ball.x > 50 : this.ball.x < 50);

            // FW 수비 시 전방 대기
            if (!isTeamAttacking && p.position === 'FW') {
                const holdLineX = isHome ? 65 : 35;
                targetX = isHome
                    ? Math.max(holdLineX, p.baseX * 0.72 + this.ball.x * 0.03)
                    : Math.min(holdLineX, p.baseX * 0.72 + this.ball.x * 0.03);
                targetY = p.baseY + (this.ball.y - p.baseY) * 0.05;
                moveSpeed = 0.3;

                // 수비 중 FW 침투 상태 초기화
                this._fwRunState[p.id] = null;

                const intentOffset = this._calcIntentOffset(p);
                targetX = Math.max(2, Math.min(98, targetX + intentOffset.x));
                targetY = Math.max(2, Math.min(98, targetY + intentOffset.y));

                const accelX = (targetX - p.x) * moveSpeed * 0.08;
                const accelY = (targetY - p.y) * moveSpeed * 0.08;
                p.vx = (p.vx + accelX) * 0.7; p.vy = (p.vy + accelY) * 0.7;
                p.x += p.vx; p.y += p.vy;
                return;
            }

            if (isTeamAttacking) {
                const forwardDir = isHome ? 1 : -1;
                const isLastPasser  = (p === this.ball.lastOwner);
                const isRearDefender = p.position === 'DF' && ['CD','BPD','NCB'].includes(p.role);

                if (isLastPasser && !isRearDefender) {
                    targetX = p.x + (forwardDir * 8);
                    targetY = p.y + (this.ball.y - p.y) * 0.3;
                    moveSpeed = 0.7;

                } else if (p.position === 'FW') {
                    // ★ [신규] FW 침투 상태에 따른 목표 위치 결정
                    const runState = this._fwRunState[p.id];

                    let avoidY = 0;
                    let nearestDefender = null, minD = 999;
                    this.players.forEach(opp => {
                        if (opp.teamId !== p.teamId && (opp.position === 'DF' || opp.position === 'GK')) {
                            const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                            if (d < minD) { minD = d; nearestDefender = opp; }
                        }
                    });
                    if (nearestDefender && minD < 5) avoidY = (p.y - nearestDefender.y) > 0 ? 5 : -5;

                    if (runState === 'behind') {
                        // ★ 수비 뒷공간으로 침투 — 수비라인 바로 뒤를 목표로
                        const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
                        targetX = isHome
                            ? Math.min(defLineX + 4, 90)
                            : Math.max(defLineX - 4, 10);
                        targetY = Math.max(5, Math.min(95, p.baseY + avoidY + (Math.random() - 0.5) * 10));
                        moveSpeed = 1.1 * speedFactor * sprintBonus;

                        // 목표에 충분히 가까워지면 상태 유지 (계속 달리게)
                        const distToTarget = Math.hypot(targetX - p.x, targetY - p.y);
                        if (distToTarget < 5) this._fwRunState[p.id] = 'behind'; // 유지

                    } else if (runState === 'short') {
                        // ★ 공 받으러 내려오기 — 미드필더 라인까지 내려옴
                        const dropTargetX = isHome
                            ? Math.max(this.ball.x - 15, p.baseX * 0.7)
                            : Math.min(this.ball.x + 15, p.baseX * 0.7 + 30);
                        targetX = dropTargetX;
                        targetY = p.baseY + (this.ball.y - p.baseY) * 0.4;
                        moveSpeed = 0.9 * speedFactor;

                        // 공을 받으면 상태 리셋
                        const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                        if (distToBall < 8) this._fwRunState[p.id] = null;

                    } else {
                        // 기존 로직 (침투 명령 없을 때)
                        let pushDistance = 31;
                        if (behavior.comeShort) pushDistance = 10;
                        if (behavior.runBehind)  pushDistance = 37;

                        // p.x 대신 p.baseX를 사용하세요.
const rawTargetX = isHome
    ? Math.min(p.baseX + pushDistance, 93)
    : Math.max(p.baseX - pushDistance, 7);
targetX = rawTargetX;
                        targetY = Math.max(5, Math.min(95, p.baseY + avoidY));

                        if (behavior.runBehind) {
                            targetX = isHome ? Math.min(targetX + 5, 93) : Math.max(targetX - 5, 7);
                        }
                        moveSpeed = 0.85 * speedFactor * sprintBonus;
                    }

                } else if (p.position === 'MF') {
                    const attackBias  = behavior.attackBias  || 0;
                    const defenseBias = behavior.defenseBias || 0;
                    let ballWeight = Math.max(0.2, Math.min(0.70, 0.6 + (attackBias * 0.4) - (defenseBias * 0.3)));

                    targetX = (p.baseX * (1 - ballWeight)) + (this.ball.x * ballWeight);
                    targetY = (p.baseY * (1 - ballWeight)) + (this.ball.y * ballWeight);

                    if (attackBias > 0.2) targetX += (isHome ? 1 : -1) * attackBias * 10;
                    if (Math.abs(p.y - this.ball.y) < 3) targetY += p.y > 50 ? 4 : -4;

                    // ★ 대형 전체 전진: 공 소유 시 MF 라인을 5~8 전진
                    const lineAdvance = isHome ? 4 : -4;
                    const advancedBase = p.baseX + lineAdvance;
                    if (isHome) targetX = Math.max(targetX, advancedBase * 0.8);
                    else        targetX = Math.min(targetX, advancedBase * 1.2);

                } else {
                    if (isHome) {
                        targetX = Math.max(p.baseX, Math.min(p.baseX + 10, this.ball.x - 25));
                    } else {
                        targetX = Math.min(p.baseX, Math.max(p.baseX - 10, this.ball.x + 25));
                    }
                    targetY = p.baseY;
                }

                if (behavior.cutInside) targetY = 50 + (p.baseY - 50) * 0.5;
                else if (behavior.hugLine) targetY = p.baseY < 50 ? 5 : 95;

            } else {
                // ── 수비 로직 ──
                let shiftFactor = 0.8, yShiftFactor = 0.2;
                const isHomeDef = p.teamId === 'home';
                const inMyBox   = isHomeDef ? (this.ball.x < 22) : (this.ball.x > 78);

                if (p.position === 'MF') {
                    const defenseBias = behavior.defenseBias || 0;
                    shiftFactor = Math.max(1.2, Math.min(1.8, 1.4 + (defenseBias * 0.5)));
                    moveSpeed   = 1.3 * (1 + defenseBias) * sprintBonus;
                } else if (p.position === 'DF') { shiftFactor = 0.25; yShiftFactor = 0.05; }

                let formationX = p.currentBaseX + (this.ball.x - 50) * shiftFactor;
                if (p.position === 'DF') formationX = Math.max(p.baseX - 8, Math.min(p.baseX + 8, formationX));
                let formationY = p.baseY + (this.ball.y - 50) * yShiftFactor;

                let markTarget = null, minMarkDist = 30;
                this.players.forEach(opp => {
                    if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                        const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                        if (Math.abs(p.baseY - opp.y) > 18) return;
                        if (d < minMarkDist) { minMarkDist = d; markTarget = opp; }
                    }
                });

                if (markTarget) {
                    const goalX = p.teamId === 'home' ? 0 : 100;
                    const isShootingThreat = Math.abs(this.ball.x - goalX) < 35;

                    if ((inMyBox || isShootingThreat) && markTarget === this.ball.owner) {
                        targetX = markTarget.x; moveSpeed = 0.9 * speedFactor;
                    } else {
                        targetX = markTarget.x + (goalX - markTarget.x) * 0.02; moveSpeed = 0.6;
                    }
                    targetY = markTarget.y;

                    if (p.position === 'DF') {
                        const isPenetrating = isHome ? (targetX < formationX) : (targetX > formationX);
                        targetX = isPenetrating
                            ? (targetX * 0.9) + (formationX * 0.1)
                            : (targetX * 0.2) + (formationX * 0.8);
                    }
                } else { targetX = formationX; targetY = formationY; }

                // ── 압박 로직 ──
                if (this.ball.owner && p.position !== 'GK') {
                    const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);

                    const isHomeAttacker = this.ball.owner.teamId === 'home';
                    const goalX = isHomeAttacker ? 100 : 0;
                    const distToGoal = Math.abs(this.ball.x - goalX);
                    const inShootingRange = distToGoal < 30;

                    let forcePress = (inMyBox && p.position === 'DF' && distToBall < 15) ||
                                     (!inMyBox && p.position === 'MF' && distToBall < 22);

                    const oppPossessionTick = this._possessionTicks[attackingTeam] || 0;
                    const extraPressRange   = oppPossessionTick > 60 ? 6 : (oppPossessionTick > 30 ? 3 : 0);
                    const effectivePressDetectDist = pressDetectDist + extraPressRange;
                    const isSecondPresser = (p === secondPresser);

                    if (p === presser || distToBall < effectivePressDetectDist || forcePress || isSecondPresser) {
                        const dx = this.ball.x - p.x, dy = this.ball.y - p.y;
                        const dist = Math.hypot(dx, dy);

                        let baseSprintSpeed;
                        if (!inShootingRange) {
                            const keepDist = 7;
                            if (distToBall > keepDist + 1)      baseSprintSpeed = isSecondPresser ? 1.2 : 1.8;
                            else if (distToBall < keepDist - 1)  baseSprintSpeed = -0.5;
                            else                                  baseSprintSpeed = 0;
                        } else {
                            baseSprintSpeed = isSecondPresser ? 2.0 : 2.8;
                        }

                        const teamIntent = this.intentMgr.getTeamIntent(p.teamId);
                        const pressMultiplier = teamIntent === TeamIntent.PRESS ? 1.25 : 1.0;
                        const sprintSpeed = baseSprintSpeed * speedFactor * (dt.pressIntensity === 'high' ? 1.15 : 1.0);

                        if (dist > 0 && baseSprintSpeed !== 0) {
                            p.x += (dx / dist) * sprintSpeed * pressMultiplier;
                            p.y += (dy / dist) * sprintSpeed * pressMultiplier;
                        }

                        if (inShootingRange && distToBall < 3) {
                            this.attemptTackle(p, this.ball.owner);
                        }
                        return;
                    }
                }

                const isDeepBeaten = p.position === 'DF' &&
                    (isHomeDef ? (this.ball.x < p.x - 20) : (this.ball.x > p.x + 20)) && !inMyBox;

                if (isDeepBeaten) {
                    const retreatTargetX = isHomeDef
                        ? Math.max(p.baseX, this.ball.x - 15)
                        : Math.min(p.baseX, this.ball.x + 15);
                    const dx = retreatTargetX - p.x, dy = p.baseY - p.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 0.5) { p.x += (dx / dist) * 2.2 * speedFactor; p.y += (dy / dist) * 2.2 * speedFactor; }
                    return;
                }
            }

            const intentOffset = this._calcIntentOffset(p);
            targetX = Math.max(2, Math.min(98, targetX + intentOffset.x));
            targetY = Math.max(2, Math.min(98, targetY + intentOffset.y));

            targetX = Math.max(2, Math.min(98, targetX));
            targetY = Math.max(2, Math.min(98, targetY));

            if (!isLooseBall) { targetX += (Math.random() - 0.5) * 0.5; targetY += (Math.random() - 0.5) * 1.0; }

            const tickFactor  = isSlowTick ? 0.5 : 1.0;
            const isFW        = (p.position === 'FW');
            const accelCoef   = isFW ? 0.12 : (0.10 * tickFactor);
            const dampCoef    = isFW ? 0.70 : 0.70;
            const accelX = (targetX - p.x) * moveSpeed * accelCoef;
            const accelY = (targetY - p.y) * moveSpeed * accelCoef;
            p.vx = (p.vx + accelX) * dampCoef; p.vy = (p.vy + accelY) * dampCoef;
            p.x += p.vx; p.y += p.vy;
    
            // ★ 추가: 경기장 밖으로 나가지 못하게 강제 고정 (0~100 사이)
            p.x = Math.max(2, Math.min(98, p.x));
            p.y = Math.max(2, Math.min(98, p.y));

        });
    }

    _calcIntentOffset(player) {
        const teamIntent   = this.intentMgr.getTeamIntent(player.teamId);
        const playerIntent = this.intentMgr.getPlayerIntent(player.id);
        const isHome       = player.teamId === 'home';
        const forwardDir   = isHome ? 1 : -1;
        let ox = 0, oy = 0;

        switch (playerIntent) {
            case PlayerIntent.PENETRATE:
                ox = forwardDir * 6;
                break;
            case PlayerIntent.FIND_SPACE: {
                let minD = 999, avdx = 0, avdy = 0;
                this.players.forEach(opp => {
                    if (opp.teamId === player.teamId) return;
                    const d = Math.hypot(player.x - opp.x, player.y - opp.y);
                    if (d < minD) { minD = d; avdx = player.x - opp.x; avdy = player.y - opp.y; }
                });
                if (minD < 20 && minD > 0) {
                    const n = Math.hypot(avdx, avdy);
                    if  (n>0.1) {
                    ox = (avdx / n) * 5; oy = (avdy / n) * 5;
                    }
                }
                break;
            }
            case PlayerIntent.OVERLAP:
                ox = forwardDir * 8;
                oy = player.baseY < 50 ? -6 : 6;
                break;
            case PlayerIntent.PRESS_ZONE:
                ox = (this.ball.x - player.x) * 0.15;
                oy = (this.ball.y - player.y) * 0.15;
                break;
            case PlayerIntent.SUPPORT:
                ox = (this.ball.x - player.x) * 0.08;
                oy = (this.ball.y - player.y) * 0.08;
                break;
            case PlayerIntent.COVER:
                ox = -forwardDir * 4;
                break;
        }

        if (teamIntent === TeamIntent.ALL_OUT && player.position !== 'GK') ox += forwardDir * 4;
        if (teamIntent === TeamIntent.TRANSITION && player.position === 'FW') ox += forwardDir * 5;
        if (teamIntent === TeamIntent.HOLD) { ox *= 0.3; oy *= 0.3; }

        return { x: ox, y: oy };
    }

    checkFrontalBlock(player, goalX) {
        const forwardDir = player.teamId === 'home' ? 1 : -1;
        const checkDist = 10, checkWidth = 6;
        const minY = player.y - checkWidth, maxY = player.y + checkWidth;
        const minX = forwardDir === 1 ? player.x : player.x - checkDist;
        const maxX = forwardDir === 1 ? player.x + checkDist : player.x;
        return this.players.some(opp =>
            opp.teamId !== player.teamId && opp.x >= minX && opp.x <= maxX && opp.y >= minY && opp.y <= maxY
        );
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
            return { x: this.ball.x + (-forwardDir * 10), y: this.ball.y + (side === 'top' ? -10 : 10) };
        } else if (runType === RUN_TYPE.CHANNEL_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            return { x: defLineX + (forwardDir * 2), y: this.ball.y < 50 ? 70 : 30 };
        } else if (runType === RUN_TYPE.WIDE_RUN) {
            return { x: this.ball.x + (forwardDir * 5), y: player.baseY < 50 ? 5 : 95 };
        } else if (runType === RUN_TYPE.UNDERLAP_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            return { x: defLineX + (forwardDir * 5), y: player.baseY < 50 ? 30 : 70 };
        } else {
            return {
                x: player.baseX + (this.ball.x - player.baseX) * 0.2,
                y: player.baseY + (this.ball.y - player.baseY) * 0.2
            };
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
            opponents.sort((a,b) => b.x - a.x);
            if (opponents.length < 2) return targetPos;
            const offsideLineX = opponents[1].x;
            if (targetPos.x > Math.max(offsideLineX, this.ball.x)) targetPos.x = offsideLineX - 2;
        } else {
            opponents.sort((a,b) => a.x - b.x);
            if (opponents.length < 2) return targetPos;
            const offsideLineX = opponents[1].x;
            if (targetPos.x < Math.min(offsideLineX, this.ball.x)) targetPos.x = offsideLineX + 2;
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
                    const effectiveDefense = this.getEffectiveStat(p, 'defense');
                    if (Math.random() < 0.02 + (effectiveDefense / 700)) {
                        this.ball.state = BallState.CONTROLLED; this.ball.owner = p; this.ball.lastOwner = null;
                        this._possessionTicks[p.teamId === 'home' ? 'away' : 'home'] = 0;
                        this._possessionTicks[p.teamId] = 0;
                        this.eventsQueue.push({ type:'tackle', player:p.name, desc:`${p.name}, 날카로운 패스 차단!` });
                    }
                }
            }
        });
    }

    getRoleBehavior(role) {
        const behaviors = {
            'AF': { runBehind:true, shootBias:0.4, dribbleBias:0.1 },
            'P':  { runBehind:true, shootBias:0.5, passBias:-0.2 },
            'DLF':{ comeShort:true, shootBias:0.2, passBias:0.1 },
            'F9': { comeShort:true, dribbleBias:0.2, passBias:0.2 },
            'TM': { comeShort:true, holdUp:true },
            'W':  { hugLine:true, dribbleBias:0.2, shootBias:0.2, crossBias:0.2 },
            'IF': { cutInside:true, shootBias:0.3, dribbleBias:0.2 },
            'BBM':{ attackBias:0.3, defenseBias:0.3, pressBias:0.1 },
            'MEZ':{ cutInside:true, attackBias:0.5, defenseBias:0.1 },
            'DLP':{ comeShort:true, passBias:0.3, defenseBias:0.4 },
            'AP': { comeShort:true, passBias:0.2, dribbleBias:0.1, attackBias:0.4, defenseBias:0.1 },
            'BWM':{ pressBias:0.3, passBias:-0.1, defenseBias:0.5 },
            'REG':{ passBias:0.4, defenseBias:0.3 },
            'CAR':{ comeShort:true, defenseBias:0.4 },
            'EG': { comeShort:true, attackBias:0.3 },
            'SS': { runBehind:true, attackBias:0.6 },
            'ANC':{ defenseBias:0.6 }, 'DM':{ defenseBias:0.5 },
            'SV': { runBehind:true, attackBias:0.4, defenseBias:0.3 },
            'BPD':{ passBias:0.1 }, 'CD':{ passBias:-0.1 },
            'WB': { overlap:true, dribbleBias:0.1 }, 'FB':{ overlap:false }, 'NCB':{ passBias:-0.3 }
        };
        return behaviors[role] || {};
    }

    attemptTackle(defender, attacker) {
        // ★ 태클 확률 조정: 수비 약화(0.70→0.65), 공격 강화(1.20→1.30)
        // 수비가 항상 이기지 않도록 랜덤성 확대
        const defRoll = (this.getEffectiveStat(defender, 'defense')  * 0.65) * Math.random();
        const atkRoll = (this.getEffectiveStat(attacker, 'decision') * 1.30) * Math.random();
        if (defRoll > atkRoll) {
            this.ball.owner = defender; this.ball.lastOwner = null;
            this._possessionTicks[defender.teamId] = 0;
            this._possessionTicks[attacker.teamId] = 0;
            this.eventsQueue.push({ type:'tackle', player:defender.name, desc:`${defender.name}의 태클 성공!` });
        }
        // 실패해도 아무 일도 없음 — 공격수가 계속 볼 소유
    }

    adjustDefensiveLines() {
        const dt = gameData.deepTactics || { defensiveLine:'standard' };
        let shift = -6;
        if (dt.defensiveLine === 'high') shift = 8;
        else if (dt.defensiveLine === 'deep') shift = -16;

        this.players.forEach(p => {
            p.currentBaseX = p.position === 'DF'
                ? p.baseX + (shift * (p.teamId === 'home' ? 1 : -1))
                : p.baseX;
        });
    }

    startExitAnimation(winnerId = null) {
        this.winningTeamId = winnerId;
        this.lapAngle = 0;
        if (winnerId === 'home') {
            this.postMatchPhase = 1;
            this.players.filter(p => p.teamId === 'home').forEach((p, i) => {
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
                    const dx = p.exitTargetX - p.x, dy = p.exitTargetY - p.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 3) { p.x += (dx/dist)*0.8; p.y += (dy/dist)*0.8; allAligned = false; }
                } else { p.y -= 0.8; }
            });
            if (allAligned) { this.postMatchPhase = 2; this.lapAngle = Math.PI / 2; }
        } else if (this.postMatchPhase === 2) {
            this.lapAngle -= 0.015;
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    const a = this.lapAngle + p.lapOrder;
                    p.x += (50 + Math.cos(a)*(40+p.radiusNoise) - p.x) * 0.1;
                    p.y += (50 + Math.sin(a)*(35+p.radiusNoise) - p.y) * 0.1;
                } else { p.y -= 0.8; }
            });
            if (this.lapAngle < -Math.PI * 1.5) this.initExitMovement();
        } else if (this.postMatchPhase === 3) {
            this.players.forEach(p => {
                const dx = p.exitTargetX - p.x, dy = p.exitTargetY - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 1) { p.x += (dx/dist)*0.7; p.y += (dy/dist)*0.7; }
            });
        }
        return this.getSnapshot();
    }

    isExitAnimationDone() {
        if (this.postMatchPhase !== 3) return false;
        return this.players.every(p => p.y < -10 || p.y > 110);
    }
    
_findPenetratingFW(player) {
        const isHome = player.teamId === 'home';
        const fwList = this.players.filter(p =>
            p.teamId === player.teamId &&
            p.position === 'FW' &&
            p !== player &&
            (this._fwRunState[p.id] === 'behind' || this._fwRunState[p.id] === 'short')
        );
        if (!fwList.length) return null;

        // 가장 전방에 있는 침투 중인 FW 선택
        fwList.sort((a, b) => isHome ? b.x - a.x : a.x - b.x);
        const target = fwList[0];

        // 너무 멀면 패스 안 함 (50 이상)
        const dist = Math.hypot(player.x - target.x, player.y - target.y);
        if (dist > 50) return null;

        return target;
    }

}


// 전역 노출
window.RealSoccerEngine    = RealSoccerEngine;
window.DeepTacticManager   = DeepTacticManager;
window.TeamIntent          = TeamIntent;
window.PlayerIntent        = PlayerIntent;
window.TeamIntentManager   = TeamIntentManager;
window.ROLE_INTENT_PREFERENCE = ROLE_INTENT_PREFERENCE;

document.addEventListener('DOMContentLoaded', () => {
    const tacticsBtn = document.querySelector('[data-tab="tactics"]');
    if (tacticsBtn) {
        tacticsBtn.addEventListener('click', () => setTimeout(() => DeepTacticManager.init(), 100));
    }
    setTimeout(() => DeepTacticManager.init(), 1000);
});
