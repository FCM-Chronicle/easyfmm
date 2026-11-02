// deepenTactic.js  —  v3.0  COMPLETE REWRITE! (Flow-Based Architecture)
// External API preserved 100% compatible with visualizer/match UI
// ─────────────────────────────────────────────────────────────────────────────
//   window.RealSoccerEngine   (class)
//   window.DeepTacticManager  (object, .init(), .renderUI())
//   BallState                 (const object)
//   SimBall / SimPlayer       (classes)
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

// =============================================================================
// [SECTION 0]  CONSTANTS & UTILITIES
// =============================================================================

const BallState = { LOOSE: 0, CONTROLLED: 1, IN_FLIGHT: 2, DEAD: 3 };

const ROLE_BEHAVIOR = {
    // Forwards
    AF: { runBehind: 1.0, linkup: 0.2, hugLine: 0.0, pressBias: 0.9, attackBias: 1.0, defenseBias: 0.1 },
    CF: { runBehind: 0.6, linkup: 0.7, hugLine: 0.0, pressBias: 0.6, attackBias: 0.9, defenseBias: 0.2 },
    P: { runBehind: 0.95, linkup: 0.1, hugLine: 0.0, pressBias: 0.8, attackBias: 1.0, defenseBias: 0.0 },
    F9: { runBehind: 0.3, linkup: 1.0, hugLine: 0.0, pressBias: 0.5, attackBias: 0.9, defenseBias: 0.3 },
    TM: { runBehind: 0.2, linkup: 1.0, hugLine: 0.0, pressBias: 0.3, attackBias: 0.8, defenseBias: 0.2 },
    SS: { runBehind: 0.7, linkup: 0.5, hugLine: 0.2, pressBias: 0.6, attackBias: 0.95, defenseBias: 0.15 },
    PF: { runBehind: 0.5, linkup: 0.6, hugLine: 0.0, pressBias: 1.0, attackBias: 0.9, defenseBias: 0.5 },
    RD: { runBehind: 0.5, linkup: 0.5, hugLine: 0.0, pressBias: 0.7, attackBias: 0.85, defenseBias: 0.4 },
    W: { runBehind: 0.7, linkup: 0.1, hugLine: 1.0, pressBias: 0.5, attackBias: 0.9, defenseBias: 0.2 },
    IF: { runBehind: 0.8, linkup: 0.3, hugLine: 0.0, pressBias: 0.6, attackBias: 0.95, defenseBias: 0.2 },
    IW: { runBehind: 0.7, linkup: 0.3, hugLine: 0.1, pressBias: 0.6, attackBias: 0.9, defenseBias: 0.3 },
    WP: { runBehind: 0.4, linkup: 0.7, hugLine: 1.0, pressBias: 0.5, attackBias: 0.85, defenseBias: 0.3 },
    DLF: { runBehind: 0.3, linkup: 0.9, hugLine: 0.0, pressBias: 0.4, attackBias: 0.85, defenseBias: 0.3 },
    // Midfielders
    AP: { runBehind: 0.6, linkup: 0.6, hugLine: 0.0, pressBias: 0.5, attackBias: 0.95, defenseBias: 0.15 },
    AM: { runBehind: 0.6, linkup: 0.5, hugLine: 0.0, pressBias: 0.5, attackBias: 0.95, defenseBias: 0.15 },
    BBM: { runBehind: 0.8, linkup: 0.4, hugLine: 0.0, pressBias: 0.9, attackBias: 0.9, defenseBias: 0.7 },
    MEZ: { runBehind: 0.7, linkup: 0.4, hugLine: 0.3, pressBias: 0.7, attackBias: 0.9, defenseBias: 0.4 },
    CAR: { runBehind: 0.5, linkup: 0.6, hugLine: 0.0, pressBias: 0.8, attackBias: 0.85, defenseBias: 0.6 },
    REG: { runBehind: 0.3, linkup: 0.7, hugLine: 0.0, pressBias: 0.5, attackBias: 0.75, defenseBias: 0.4 },
    DLP: { runBehind: 0.1, linkup: 1.0, hugLine: 0.0, pressBias: 0.4, attackBias: 0.55, defenseBias: 0.45 },
    BWM: { runBehind: 0.3, linkup: 0.5, hugLine: 0.0, pressBias: 1.0, attackBias: 0.4, defenseBias: 0.95 },
    CM: { runBehind: 0.4, linkup: 0.5, hugLine: 0.0, pressBias: 0.6, attackBias: 0.7, defenseBias: 0.5 },
    LM: { runBehind: 0.6, linkup: 0.3, hugLine: 1.0, pressBias: 0.5, attackBias: 0.8, defenseBias: 0.4 },
    RM: { runBehind: 0.6, linkup: 0.3, hugLine: 1.0, pressBias: 0.5, attackBias: 0.8, defenseBias: 0.4 },
    WM: { runBehind: 0.5, linkup: 0.3, hugLine: 1.0, pressBias: 0.5, attackBias: 0.8, defenseBias: 0.4 },
    SV: { runBehind: 0.5, linkup: 0.5, hugLine: 0.0, pressBias: 0.6, attackBias: 0.8, defenseBias: 0.8 },
    ANC: { runBehind: 0.1, linkup: 0.8, hugLine: 0.0, pressBias: 0.7, attackBias: 0.3, defenseBias: 0.95 },
    DM: { runBehind: 0.1, linkup: 0.8, hugLine: 0.0, pressBias: 0.7, attackBias: 0.35, defenseBias: 0.9 },
    CDM: { runBehind: 0.05, linkup: 0.85, hugLine: 0.0, pressBias: 0.8, attackBias: 0.3, defenseBias: 0.95 },
    EG: { runBehind: 0.3, linkup: 0.7, hugLine: 0.0, pressBias: 0.5, attackBias: 0.7, defenseBias: 0.4 },
    // Defenders
    CD: { runBehind: 0.0, linkup: 0.2, hugLine: 0.0, pressBias: 0.5, attackBias: 0.05, defenseBias: 1.0 },
    BPD: { runBehind: 0.0, linkup: 0.4, hugLine: 0.0, pressBias: 0.4, attackBias: 0.2, defenseBias: 0.9 },
    NCB: { runBehind: 0.0, linkup: 0.1, hugLine: 0.0, pressBias: 0.6, attackBias: 0.1, defenseBias: 0.95 },
    LIB: { runBehind: 0.2, linkup: 0.4, hugLine: 0.0, pressBias: 0.3, attackBias: 0.3, defenseBias: 0.85 },
    FB: { runBehind: 0.3, linkup: 0.2, hugLine: 0.95, pressBias: 0.6, attackBias: 0.35, defenseBias: 0.85 },
    WB: { runBehind: 0.6, linkup: 0.2, hugLine: 1.0, pressBias: 0.5, attackBias: 0.55, defenseBias: 0.7 },
    CWB: { runBehind: 0.7, linkup: 0.1, hugLine: 1.0, pressBias: 0.5, attackBias: 0.7, defenseBias: 0.55 },
    IWB: { runBehind: 0.5, linkup: 0.3, hugLine: 0.3, pressBias: 0.5, attackBias: 0.5, defenseBias: 0.7 },
    GK: { runBehind: 0.0, linkup: 0.0, hugLine: 0.0, pressBias: 0.0, attackBias: 0.0, defenseBias: 1.0 }
};

const POSITION_STAT_WEIGHTS = {
    FW: { speed: 1.3, shooting: 1.5, passing: 0.9, dribble: 1.35, defense: 0.4, decision: 1.1, physical: 1.0 },
    MF: { speed: 1.0, shooting: 0.8, passing: 1.4, dribble: 1.20, defense: 0.9, decision: 1.3, physical: 0.9 },
    DF: { speed: 1.0, shooting: 0.3, passing: 0.9, dribble: 0.65, defense: 1.6, decision: 1.0, physical: 1.2 },
    GK: { speed: 0.5, shooting: 0.1, passing: 0.7, dribble: 0.20, defense: 1.8, decision: 1.1, physical: 1.0 }
};

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function deriveStatsFromOverall(overall, position) {
    const w = POSITION_STAT_WEIGHTS[position] || POSITION_STAT_WEIGHTS.MF;
    const out = {};
    for (const [k, weight] of Object.entries(w)) {
        const noise = (Math.random() - 0.5) * 4;
        out[k] = Math.max(10, Math.min(99, overall * weight + noise));
    }
    out.tackle = out.defense;
    out.dribble = Math.max(10, Math.min(99, overall * (w.dribble || 1.0) + (Math.random() - 0.5) * 4));
    return out;
}

// =============================================================================
// [SECTION 0.5]  DEEP TACTICS MANAGER  (unchanged UI)
// =============================================================================

function migrateDeepTactics() {
    if (typeof gameData === 'undefined' || !gameData.deepTactics) return false;
    const dt = gameData.deepTactics;
    const oldPress = typeof dt.pressingStrength === 'string' ? dt.pressingStrength : null;
    const oldTend = typeof dt.teamTendency === 'string' ? dt.teamTendency : null;
    const oldStyle = typeof dt.passStyle === 'string' ? dt.passStyle : null;
    const oldSide = typeof dt.attackingSide === 'string' ? dt.attackingSide : null;
    if (!('pressIntensity'in dt) && oldPress) {
        dt.pressIntensity = oldPress === 'high' ? 'high' : oldPress === 'low' ? 'low' : 'mid';
    }
    if (!('passTempo'in dt) && oldTend) {
        dt.passTempo = oldTend === 'offensive' ? 'fast' : oldTend === 'defensive' ? 'slow' : 'normal';
    }
    if (!('passLength'in dt) && oldStyle) {
        dt.passLength = oldStyle === 'long' ? 'long' : oldStyle === 'short' ? 'short' : 'mixed';
    }
    if (!('defensiveLine'in dt)) dt.defensiveLine = 'standard';
    if (!('attackFocus'in dt) && oldSide) {
        dt.attackFocus = oldSide === 'all' ? 'mixed' : oldSide;
    }
    if (typeof dt.passStyle === 'string') {
        const s = dt.passStyle;
        const r = s === 'short' ? [7, 3] : s === 'long' ? [3, 7] : [5, 5];
        dt.passStyle = { shortRatio: r[0], longRatio: r[1] };
    } else if (!dt.passStyle || typeof dt.passStyle !== 'object') {
        dt.passStyle = { shortRatio: 7, longRatio: 3 };
    }
    return true;
}

const DeepTacticManager = {
    init() {
        if (!gameData.deepTactics) {
            gameData.deepTactics = {
                attackFocus: 'mixed', passStyle: { shortRatio: 7, longRatio: 3 },
                pressIntensity: 'mid', defensiveLine: 'standard',
                passTempo: 'normal', passLength: 'mixed',
                attackStyle: 'mixed'
            };
        }
        if (!gameData.deepTactics.attackStyle) gameData.deepTactics.attackStyle = 'mixed';
        migrateDeepTactics();
        this.renderUI();
    },
    renderUI() {
        let c = document.getElementById('deepTacticsContainer');
        if (!c) {
            const t = document.getElementById('tactics');
            if (!t) return;
            c = document.createElement('div');
            c.id = 'deepTacticsContainer';
            c.style.cssText = 'margin-top:20px;padding:15px;background:rgba(255,255,255,0.05);border-radius:10px;';
            t.appendChild(c);
        }
        const dt = gameData.deepTactics;
        const fields = [
            ['defensiveLine', '수비 라인', [['deep', '딥 (Deep)'], ['standard', '표준'], ['high', '하이 (High)']]],
            ['pressIntensity', '압박 강도', [['low', '낮음'], ['mid', '보통'], ['high', '높음']]],
            ['passTempo', '패스 템포', [['slow', '느림'], ['normal', '보통'], ['fast', '빠름']]],
            ['passLength', '패스 길이', [['short', '짧게'], ['mixed', '혼합'], ['long', '길게']]],
            ['attackStyle', '공격 전개', [['counter', '역습 (Counter)'], ['mixed', '혼합 (Mixed)'], ['possession', '지공 (Possession)']]]
        ];

        c.replaceChildren();

        const title = document.createElement('h4');
        title.style.cssText = 'color:#ffd700;margin-top:0;';
        title.textContent = '심층 전술 세부 설정';
        c.appendChild(title);

        fields.forEach(([k, label, options]) => {
            const div = document.createElement('div');
            div.style.marginBottom = '10px';

            const lbl = document.createElement('label');
            lbl.style.cssText = 'display:block;margin-bottom:4px;color:#ccc;';
            lbl.textContent = label;

            const select = document.createElement('select');
            select.id = `dt-${k}`;
            select.style.cssText = 'width:100%;padding:6px 8px;background:#2a2d34;color:#f0f0f0;border:1px solid #444;border-radius:4px;outline:none;box-sizing:border-box;font-size:0.9rem;';

            options.forEach(([v, l]) => {
                const opt = document.createElement('option');
                opt.value = v;
                opt.textContent = l;
                if (dt[k] === v) opt.selected = true;
                select.appendChild(opt);
            });

            select.addEventListener('change', e => { gameData.deepTactics[k] = e.target.value; });

            div.append(lbl, select);
            c.appendChild(div);
        });

        const note = document.createElement('div');
        note.style.cssText = 'color:#aaa;font-size:0.8rem;';
        note.textContent = '* 설정은 자동 적용됩니다';
        c.appendChild(note);
    }
};

// =============================================================================
// [SECTION 1]  SIMBALL / SIMPLAYER  (v3: lean + state for flow)
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
        this._flightOrigin = { x: 50, y: 50 };
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
        this.x = 0; this.y = 0;
        this.vx = 0; this.vy = 0;
        this.baseX = 0; this.baseY = 0;
        this.slotY = 0; // New: assigned vertical slot (for MF Y spread fix!)
        this.stamina = data.condition !== undefined ? data.condition : 100;
        this._stealCooldown = 0;
        this.burstTimer = 0;
        this.forceReturnTimer = 0;
        // v3 FLOW state for off-ball runs
        this._fwMode = 'shadow';  // shadow | burst | linkup
        this._fbMode = 'hold';    // hold | overlap | underlap
        this._timer = 0;         // general timer per player
        this._markTargetId = null;
        this.stats = this._buildStats(data, role, lineStats, morale, tacticMultiplier);
    }

    _buildStats(data, role, lineStats, morale, tacticMultiplier) {
        const moraleFactor = 1 + ((morale - 50) * 0.0005);
        if (lineStats && lineStats.attack) {
            let line;
            if (data.position === 'FW') line = 'attack';
            else if (data.position === 'MF') line = 'midfield';
            else line = 'defense';
            const bs = lineStats[line].stats;
            const map = { passing: 'technique', shooting: 'attack', defense: 'defense', speed: 'speed', decision: 'mentality', physical: 'physical' };
            const fs = {};
            for (const [ss, ds] of Object.entries(map)) {
                const v = bs[ds] || data.rating;
                const finalV = (typeof TacticsManager !== 'undefined') ? TacticsManager.calculateFinalPower(v, role, ds) : v;
                fs[ss] = finalV * moraleFactor * tacticMultiplier;
            }
            fs.tackle = fs.defense;
            // [신규] 드리블 능력치 명시적 산출: 테크닉(technique)과 주력(speed) 및 공격수 추가 보정
            fs.dribble = ((fs.passing * 0.65) + (fs.speed * 0.35));
            if (data.position === 'FW') fs.dribble *= 1.1;
            return fs;
        }
        const overall = data.rating || 70;
        const d = deriveStatsFromOverall(overall, data.position);
        for (const k of Object.keys(d)) d[k] *= moraleFactor * tacticMultiplier;
        return d;
    }
}

// =============================================================================
// [SECTION 2]  REAL SOCCER ENGINE V3 — FLOW BASED ARCHITECTURE
// =============================================================================

class RealSoccerEngine {

    // ─────────────────────────────────────────────────────────────
    //  CONSTRUCTOR + TEAM INIT
    // ─────────────────────────────────────────────────────────────
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

        // Exit animation (post-match compatibility)
        this.exitAnimActive = false;
        this.exitAnimTicks = 0;
        this.exitAnimDone = false;
        this.exitWinner = null;

        //  V3 FLOW STATE (possession + phase + memories)
        this._possession = { teamId: null, duration: 0 };
        this._phase = { home: 'building', away: 'building' }; // building | progressing | finalThird | counter
        this._phaseTimer = { home: 0, away: 0 };
        this._attackProgressX = { home: 0, away: 0 }; // track how far we pushed, detect stuck
        this._attackMemories = { home: new Array(8).fill(null), away: new Array(8).fill(null) };
        this._attackMemIdx = { home: 0, away: 0 };
        this._fwBurstCooldown = 0;
        this._fwLinkupCooldown = 0;

        this.teamStrength = { home: 70, away: 70 };
        this.teamStrength.home = this.calcTeamStrength(homeSquad);
        this.teamStrength.away = this.calcTeamStrength(awaySquad);

        // [신규] 월드엔진 고도화 필드
        this.matchContext = null;
        this.awayHostility = 0.04;
        this.aiTacticState = 'initial';
        this.panicTimer = { home: 0, away: 0 };
        this.momentumBoost = { home: 0, away: 0 };

        this.initTeam(homeSquad, 'home', homeTactic);
        this.initTeam(awaySquad, 'away', awayTactic);
        this._assignVerticalSlots();
        this.resetPositions('home');
    }

    setMatchContext(ctx) {
        this.matchContext = ctx;
        if (ctx && ctx.stadiumInfo) {
            const factor = (typeof MatchTuning !== 'undefined' && MatchTuning.awayHostilityFactor !== undefined)
                ? MatchTuning.awayHostilityFactor : 1.0;
            const att = ctx.stadiumInfo.attendance || 0;
            if (att >= 60000) this.awayHostility = 0.08 * factor;
            else if (att >= 40000) this.awayHostility = 0.06 * factor;
            else if (att >= 20000) this.awayHostility = 0.04 * factor;
            else this.awayHostility = 0.02 * factor;
        }
    }

    calcTeamStrength(squad) {
        const all = [squad.gk, ...squad.df, ...squad.mf, ...squad.fw].filter(Boolean);
        if (!all.length) return 70;
        return all.reduce((s, p) => s + p.rating, 0) / all.length;
    }

    getRoleBehavior(role) { return ROLE_BEHAVIOR[role] || ROLE_BEHAVIOR.CM; }

    getEffectiveStat(p, stat) {
        let v = p.stats[stat];
        if (v === undefined) {
            if (stat === 'dribble') v = (p.stats.passing || p.rating || 70) * 0.65 + (p.stats.speed || p.rating || 70) * 0.35;
            else if (stat === 'tackle') v = p.stats.defense || p.rating || 50;
            else v = 50;
        }
        let f = 1.0;
        // [체력 방전 곡선 정밀화]
        if (p.stamina >= 75) f = 1.0;
        else if (p.stamina >= 60) f = 0.90;
        else if (p.stamina >= 45) f = 0.76;
        else if (p.stamina >= 30) f = 0.58;
        else f = 0.40; // 극단적 탈진

        // [원정 지옥 페널티] 관중 위압감에 따른 멘탈/패스/판단력 감소
        if (this.matchContext && p.teamId === 'away' && (stat === 'passing' || stat === 'decision')) {
            const pen = this.awayHostility || 0.04;
            f *= (1.0 - pen);
        }
        // [실점 후 멘탈 패닉]
        if (this.panicTimer && this.panicTimer[p.teamId] > 0 && (stat === 'defense' || stat === 'decision' || stat === 'passing')) {
            f *= 0.82; // 18% 추가 저하
        }
        // [모멘텀 부스트]
        if (this.momentumBoost && this.momentumBoost[p.teamId] > 0) {
            f *= 1.12;
        }

        return v * f;
    }

    generateAIStats(squad, tactic = 'balanced') {
        const s = { attack: { stats: {} }, midfield: { stats: {} }, defense: { stats: {} } };
        const avg = a => a.length > 0 ? Math.round(a.reduce((x, y) => x + y.rating, 0) / a.length) : 70;
        const fw = avg(squad.fw.filter(Boolean));
        const mf = avg(squad.mf.filter(Boolean));
        const df = avg([...squad.df.filter(Boolean), squad.gk].filter(Boolean));
        
        const dnaPriority = {
            tikitaka: ['technique', 'mentality', 'attack', 'speed', 'defense', 'physical'],
            possession: ['technique', 'mentality', 'physical', 'attack', 'defense', 'speed'],
            lavolpiana: ['technique', 'defense', 'mentality', 'speed', 'attack', 'physical'],
            gegenpress: ['physical', 'speed', 'defense', 'mentality', 'attack', 'technique'],
            totalFootball: ['mentality', 'technique', 'physical', 'speed', 'attack', 'defense'],
            counter: ['speed', 'attack', 'physical', 'mentality', 'defense', 'technique'],
            longBall: ['physical', 'attack', 'defense', 'speed', 'mentality', 'technique'],
            twoLine: ['speed', 'defense', 'attack', 'physical', 'mentality', 'technique'],
            parkBus: ['defense', 'physical', 'mentality', 'speed', 'attack', 'technique'],
            catenaccio: ['defense', 'mentality', 'physical', 'technique', 'attack', 'speed'],
            balanced: ['attack', 'speed', 'technique', 'physical', 'defense', 'mentality']
        };
        const priorities = dnaPriority[tactic] || dnaPriority.balanced;
        const offsets = [6, 3, 1, -1, -3, -6];

        for (const [line, ovr] of Object.entries({ attack: fw, midfield: mf, defense: df })) {
            const total = ovr * 6, base = Math.floor(total / 6);
            let rem = total % 6;
            priorities.forEach((k, i) => {
                s[line].stats[k] = base + offsets[i] + (rem-- > 0 ? 1 : 0);
            });
        }
        return s;
    }

    initTeam(squad, teamId, tactic) {
        let mul = tactic === 'balanced' ? 0.60 : 1.0;
        // 전술 상성 효과 반영 (tacticSystem.js에서 계산한 teamStrength 보정치 활용)
        if (this.teamStrength && this.teamStrength[teamId] !== undefined) {
            mul *= 1 + ((this.teamStrength[teamId] - 70) * 0.01);
        }
        const setupLine = (list, baseX) => {
            const isUser = (teamId === 'home' && gameData.isHomeGame) || (teamId === 'away' && !gameData.isHomeGame);
            let lineStats, morale = 50;
            let finalMul = mul;
            
            if (isUser) { 
                lineStats = gameData.lineStats; 
                this.userStats = lineStats; 
                morale = gameData.teamMorale; 
            } else { 
                lineStats = this.aiStats || this.generateAIStats(squad, tactic); 
                this.aiStats = lineStats; 
                morale = 20 + Math.floor(Math.random() * 71); 
                finalMul *= 1.11; // [간단한 난이도 조정] AI 팀 능력치 15% 버프
            }
            
            list.forEach((p, i) => {
                if (!p) return;
                let role = (gameData.playerRoles && gameData.playerRoles[p.name])
                    ? gameData.playerRoles[p.name]
                    : this._bestRoleForTactic(tactic, p.position, i);
                const sp = new SimPlayer(p, teamId, role, lineStats, morale, finalMul);
                sp.baseX = baseX;
                sp.baseY = (100 / (list.length + 1)) * (i + 1);
                sp.slotY = sp.baseY;
                sp.x = sp.baseX; sp.y = sp.baseY;
                this.players.push(sp);
            });
        };
        if (teamId === 'home') {
            if (squad.gk) setupLine([squad.gk], 5);
            setupLine(squad.df, 22);
            setupLine(squad.mf, 45);
            setupLine(squad.fw, 72);
        } else {
            if (squad.gk) setupLine([squad.gk], 95);
            setupLine(squad.df, 78);
            setupLine(squad.mf, 55);
            setupLine(squad.fw, 28);
        }
    }

    _bestRoleForTactic(tactic, pos, i) {
        if (pos === 'GK') return 'GK';
        const map = {
            tikitaka: { FW: ['F9', 'DLF'], MF: ['DLP', 'AP', 'MEZ'], DF: ['BPD', 'IWB'] },
            possession: { FW: ['DLF', 'CF'], MF: ['DLP', 'AP', 'CAR'], DF: ['BPD', 'WB'] },
            lavolpiana: { FW: ['F9', 'W'], MF: ['DLP', 'REG', 'MEZ'], DF: ['BPD', 'IWB'] },
            gegenpress: { FW: ['PF', 'AF'], MF: ['BBM', 'BWM', 'MEZ'], DF: ['CD', 'CWB'] },
            totalFootball: { FW: ['CF', 'F9'], MF: ['BBM', 'MEZ', 'AP'], DF: ['BPD', 'CWB', 'LIB'] },
            counter: { FW: ['AF', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'FB'] },
            longBall: { FW: ['TM', 'AF'], MF: ['BWM', 'CM'], DF: ['NCB', 'CD'] },
            twoLine: { FW: ['AF', 'P'], MF: ['BWM', 'CAR'], DF: ['CD', 'FB'] },
            parkBus: { FW: ['P', 'TM'], MF: ['BWM', 'DLP'], DF: ['NCB', 'CD'] },
            catenaccio: { FW: ['TM', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'LIB'] }
        };
        const def = { FW: ['AF', 'CF'], MF: ['BBM', 'AP'], DF: ['CD', 'FB'] };
        const m = map[tactic] || def;
        const c = m[pos] || def[pos] || ['CD'];
        return c[i % c.length];
    }

    //  NEW: Assign fixed vertical slots per position band!
    // 이게 중원 과포화 & 몰려다님을 해결하는 핵심!
    _assignVerticalSlots() {
        for (const teamId of ['home', 'away']) {
            const mfs = this.players.filter(p => p.teamId === teamId && p.position === 'MF').sort((a, b) => a.baseY - b.baseY);
            const n = mfs.length;
            for (let i = 0; i < n; i++) {
                if (n === 2) mfs[i].slotY = n === 2 ? [33, 67][i] : mfs[i].baseY;
                else if (n === 3) mfs[i].slotY = [25, 50, 75][i];
                else if (n === 4) mfs[i].slotY = [20, 40, 60, 80][i];
                else if (n === 5) mfs[i].slotY = [18, 34, 50, 66, 82][i];
                else mfs[i].slotY = mfs[i].baseY;
            }
            // CBs also have a slot for central spacing
            const dfs = this.players.filter(p => p.teamId === teamId && p.position === 'DF').sort((a, b) => a.baseY - b.baseY);
            const fbs = dfs.filter(p => ['FB', 'WB', 'CWB', 'IWB'].includes(p.role));
            const cbs = dfs.filter(p => ['CD', 'BPD', 'NCB', 'LIB'].includes(p.role));
            if (cbs.length === 2) { cbs[0].slotY = 38; cbs[1].slotY = 62; }
            if (fbs.length === 2) { fbs[0].slotY = 10; fbs[1].slotY = 90; }
            // FWs
            const fws = this.players.filter(p => p.teamId === teamId && p.position === 'FW').sort((a, b) => a.baseY - b.baseY);
            const nfw = fws.length;
            for (let i = 0; i < nfw; i++) {
                if (nfw === 2) fws[i].slotY = [40, 60][i];
                else if (nfw === 3) fws[i].slotY = [18, 50, 82][i];
                else if (nfw === 4) fws[i].slotY = [15, 38, 62, 85][i];
                else fws[i].slotY = fws[i].baseY;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  RESET / KICKOFF
    // ─────────────────────────────────────────────────────────────
    resetPositions(kickoffTeamId = null) {
        this.ball.x = 50; this.ball.y = 50;
        this.ball.lastOwner = null; this.ball._flightOrigin = { x: 50, y: 50 };
        this.ball.intendedReceiver = null;
        this._possession = { teamId: null, duration: 0 };
        this._phase = { home: 'building', away: 'building' };
        this._phaseTimer = { home: 0, away: 0 };
        this._attackProgressX = { home: 0, away: 0 };
        this._attackMemories = { home: new Array(8).fill(null), away: new Array(8).fill(null) };
        this._attackMemIdx = { home: 0, away: 0 };
        this._fwBurstCooldown = 0;
        this._fwLinkupCooldown = 0;
        this.players.forEach(p => { p.burstTimer = 0; p.forceReturnTimer = 0; p._timer = 0; p._fwMode = 'shadow'; p._fbMode = 'hold'; });

        let kicker = null;
        if (kickoffTeamId) {
            kicker = this.players.find(p => p.teamId === kickoffTeamId && p.position === 'FW')
                || this.players.find(p => p.teamId === kickoffTeamId && p.position === 'MF')
                || this.players.find(p => p.teamId === kickoffTeamId);
        }
        if (kicker) {
            this.ball.state = BallState.CONTROLLED;
            this.ball.owner = kicker;
            kicker.x = 50; kicker.y = 50; kicker.vx = 0; kicker.vy = 0;
        } else {
            this.ball.state = BallState.LOOSE;
            this.ball.owner = null;
        }
        this.players.forEach(p => {
            if (p === kicker) return;
            p.vx = 0; p.vy = 0;
            p.y = p.slotY || p.baseY;  // Use SLOT! not arbitrary baseY!
            if (p.teamId === 'home') {
                const mx = p.position === 'FW' ? 48 : (p.position === 'MF' ? 42 : 50);
                p.x = Math.min(p.baseX, mx);
            } else {
                const mn = p.position === 'FW' ? 52 : (p.position === 'MF' ? 58 : 50);
                p.x = Math.max(p.baseX, mn);
            }
        });
    }

    consumeStamina() {
        const rates = { FW: 0.6, MF: 0.7, DF: 0.4, GK: 0.1 };
        this.players.forEach(p => {
            const r = rates[p.position] || 0.5;
            p.stamina = Math.max(0, p.stamina - r * (0.8 + Math.random() * 0.4));
            if (p._stealCooldown > 0) p._stealCooldown--;
            if (p.burstTimer > 0) p.burstTimer--;
            if (p.forceReturnTimer > 0) p.forceReturnTimer--;
            if (p._timer > 0) p._timer--;
        });
    }

    getTeamTactic(teamId) {
        if (typeof gameData !== 'undefined') {
            const u = gameData.isHomeGame ? 'home' : 'away';
            if (teamId === u && gameData.currentTactic) return gameData.currentTactic;
        }
        return this.teamTactics?.[teamId] || 'balanced';
    }

    getTacticProfile(teamId) {
        const profiles = {
            tikitaka: { width: 0.82, tempo: 0.92, directness: 0.72, press: 0.78, boxPress: 0.72, attackRisk: 0.76 },
            possession: { width: 0.86, tempo: 0.82, directness: 0.62, press: 0.62, boxPress: 0.68, attackRisk: 0.68 },
            lavolpiana: { width: 0.90, tempo: 0.84, directness: 0.66, press: 0.58, boxPress: 0.64, attackRisk: 0.66 },
            gegenpress: { width: 0.92, tempo: 1.16, directness: 0.88, press: 1.28, boxPress: 1.12, attackRisk: 0.92 },
            totalFootball: { width: 0.96, tempo: 1.04, directness: 0.82, press: 0.96, boxPress: 0.88, attackRisk: 0.88 },
            counter: { width: 1.08, tempo: 1.18, directness: 1.22, press: 0.56, boxPress: 0.76, attackRisk: 0.86 },
            longBall: { width: 1.05, tempo: 1.10, directness: 1.28, press: 0.50, boxPress: 0.72, attackRisk: 0.80 },
            twoLine: { width: 0.92, tempo: 0.92, directness: 0.86, press: 0.46, boxPress: 0.82, attackRisk: 0.62 },
            parkBus: { width: 0.80, tempo: 0.72, directness: 0.78, press: 0.34, boxPress: 0.92, attackRisk: 0.48 },
            catenaccio: { width: 0.82, tempo: 0.78, directness: 0.86, press: 0.38, boxPress: 0.96, attackRisk: 0.52 },
            balanced: { width: 0.92, tempo: 0.92, directness: 0.82, press: 0.62, boxPress: 0.72, attackRisk: 0.68 }
        };
        return profiles[this.getTeamTactic(teamId)] || profiles.balanced;
    }

    _checkAIInGameTactics(minute) {
        if (minute < 65) return;
        const userSide = (this.matchContext && this.matchContext.isHomeGame) ? 'home' : 'away';
        const aiSide = userSide === 'home' ? 'away' : 'home';
        const aiScore = aiSide === 'home' ? this.homeScore : this.awayScore;
        const userScore = userSide === 'home' ? this.homeScore : this.awayScore;

        if (aiScore < userScore && this.aiTacticState !== 'allOutAttack') {
            this.aiTacticState = 'allOutAttack';
            this.teamTactics[aiSide] = 'gegenpress';
            this.eventsQueue.push({
                type: 'tactical_change',
                team: aiSide,
                desc: '🚨 [상대 전술 변경] 상대 감독이 승부수를 던집니다! 라인을 극단적으로 올리고 전원 공격(게겐프레싱)으로 전환!'
            });
        } else if (minute >= 78 && aiScore > userScore && this.aiTacticState !== 'catenaccio') {
            this.aiTacticState = 'catenaccio';
            this.teamTactics[aiSide] = 'catenaccio';
            this.eventsQueue.push({
                type: 'tactical_change',
                team: aiSide,
                desc: '🛡️ [상대 전술 변경] 상대 감독이 걸어 잠그기(카테나치오)를 지시합니다! 밀집 수비로 1골 차 리드를 지키려 합니다!'
            });
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  MAIN UPDATE LOOP
    // ─────────────────────────────────────────────────────────────
    update(minute, isNewMinute) {
        this.eventsQueue = [];
        if (isNewMinute) {
            this.consumeStamina();
            this.matchTime = minute;
            if (this.panicTimer && this.panicTimer.home > 0) this.panicTimer.home--;
            if (this.panicTimer && this.panicTimer.away > 0) this.panicTimer.away--;
            if (this.momentumBoost && this.momentumBoost.home > 0) this.momentumBoost.home--;
            if (this.momentumBoost && this.momentumBoost.away > 0) this.momentumBoost.away--;
            this._checkAIInGameTactics(minute);
        }
        this.players.forEach(p => {
            if (p._stealCooldown > 0) p._stealCooldown--;
        });

        // Exit animation (post-match)
        if (this.exitAnimActive && !this.exitAnimDone) {
            return this.updatePostMatch();
        }

        // Celebration
        if (this.celebrationTimer > 0) {
            this._processCelebration();
            this.celebrationTimer--;
            if (this.celebrationTimer <= 0) {
                const next = this.lastScorerTeam === 'home' ? 'away' : 'home';
                this.resetPositions(next);
            }
            return this.getSnapshot();
        }

        // 1) BALL FLIGHT
        if (this.ball.state === BallState.IN_FLIGHT) {
            this._stepBallFlight();
            if (this.ball.state === BallState.LOOSE && this.pendingShot) { this._handleShotResult(); return this.getSnapshot(); }
        }

        // 2) LOOSE BALL PICKUP
        if (this.ball.state === BallState.LOOSE) {
            let nearest = null, minD = 999;
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < minD) { minD = d; nearest = p; }
            });
            if (nearest && minD < 3.4) {
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = nearest;
                this.ball.intendedReceiver = null;
                this.ball.x = nearest.x; this.ball.y = nearest.y;
                this._triggerTurnover(nearest.teamId);
            }
        }

        // 3)  V3 POSSESSION + PHASE TICK (flow!)
        this._tickPossessionAndPhase();

        // 4) ON-BALL DECISION
        if (this.ball.state === BallState.CONTROLLED && this.ball.owner) {
            this._onBallDecision(this.ball.owner);
        }

        // 5) OFF-BALL AI (ALL players)
        this._processAllOffBall();

        // 6)  V3: TEAMMATE COLLISION RESOLUTION (passive, no teleport!)
        this._resolveTeammateCollisions();

        // 7) Defensive line adjust + offside enforcement (smooth)
        this._adjustDefensiveLines();
        this._enforceAllOffside();

        return this.getSnapshot();
    }

    getSnapshot() {
        return {
            ball: { x: this.ball.x, y: this.ball.y, z: this.ball.z, state: this.ball.state },
            players: this.players.map(p => ({
                id: p.id, x: p.x, y: p.y, team: p.teamId, hasBall: this.ball.owner === p
            })),
            events: [...this.eventsQueue],
            isCelebration: this.celebrationTimer > 0,
            isSuspense: false
        };
    }

    // ─────────────────────────────────────────────────────────────
    //  [V3 CORE]  POSSESSION + PHASE MANAGEMENT (FLOW)
    // ─────────────────────────────────────────────────────────────
    _tickPossessionAndPhase() {
        const teamId = this.ball.owner ? this.ball.owner.teamId
            : (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner ? this.ball.lastOwner.teamId : null);
        if (teamId && teamId === this._possession.teamId) {
            this._possession.duration++;
        } else if (teamId) {
            this._possession = { teamId, duration: 0 };
        } else {
            this._possession.duration = Math.max(0, this._possession.duration - 1);
            if (this._possession.duration <= 0) this._possession.teamId = null;
        }

        // Phase for each team: based on where ball is located when team has it
        for (const tid of ['home', 'away']) {
            const have = this._possession.teamId === tid;
            const ballX = this.ball.x;
            const myGoalX = tid === 'home' ? 0 : 100;
            const theirGoalX = 100 - myGoalX;
            const distFromMyGoal = Math.abs(ballX - myGoalX);

            if (this._phaseTimer[tid] > 0) this._phaseTimer[tid]--;
            const prev = this._phase[tid];

            if (have) {
                // Determine phase from progression
                let newPhase;
                if (distFromMyGoal < 35) newPhase = 'building';
                else if (distFromMyGoal < 70) newPhase = 'progressing';
                else newPhase = 'finalThird';
                if (newPhase !== prev) { this._phase[tid] = newPhase; this._phaseTimer[tid] = 15; }
                // Track attack progress vs stuck detection
                const prog = distFromMyGoal;
                if (prog > this._attackProgressX[tid] + 3) this._attackProgressX[tid] = prog;
            } else {
                // Not having ball: if phase was 'counter'timer, keep else revert to building
                if (prev === 'counter' && this._phaseTimer[tid] > 0) {
                    // keep
                } else if (this._phase[tid] !== 'building') {
                    this._phase[tid] = 'building';
                    this._attackProgressX[tid] = 0;
                }
            }
        }
    }

    _isAttackStuck(teamId) {
        // true if 20+ frames of possession AND no progress for 15+ frames
        if (this._possession.teamId !== teamId || this._possession.duration < 25) return false;
        const prog = teamId === 'home' ? this.ball.x : (100 - this.ball.x);
        return prog < this._attackProgressX[teamId] + 5;
    }

    _getAdvancedSupportPlayer(teamId, position) {
        const fwd = teamId === 'home' ? 1 : -1;
        const pool = this.players.filter(p => p.teamId === teamId && p.position === position && p !== this.ball.owner);
        if (!pool.length) return null;
        return pool.slice().sort((a, b) => {
            const ab = this.getRoleBehavior(a.role);
            const bb = this.getRoleBehavior(b.role);
            const ax = a.x * fwd + ((ab.attackBias || 0) + (ab.runBehind || 0)) * 8 - Math.abs(a.slotY - this.ball.y) * 0.08;
            const bx = b.x * fwd + ((bb.attackBias || 0) + (bb.runBehind || 0)) * 8 - Math.abs(b.slotY - this.ball.y) * 0.08;
            return bx - ax;
        })[0];
    }

    _findKillerPassTarget(from, phase) {
        const isHome = from.teamId === 'home';
        const goalX = isHome ? 100 : 0;
        const candidates = this.players.filter(p =>
            p.teamId === from.teamId &&
            p !== from &&
            (p.position === 'FW' || p.position === 'MF')
        );
        let best = null;
        let bestScore = -Infinity;
        for (const to of candidates) {
            const dist = Math.hypot(from.x - to.x, from.y - to.y);
            if (dist < 16 || dist > 42) continue;
            const progressive = isHome ? (to.x - from.x) : (from.x - to.x);
            if (progressive < 12) continue;
            if (this._numOpponentsAhead(to, 6, 14) > 1) continue;
            let score = this._scorePass(from, to, phase);
            if (to._fwMode === 'burst') score += 28;
            if (to.position === 'FW') score += 18;
            if (to.position === 'MF' && ['AM', 'AP', 'SS', 'MEZ', 'BBM'].includes(to.role)) score += 12;
            if (this._isReceiverBehindDefLine(from, to)) score += 16;
            if (Math.abs(to.x - goalX) < 30) score += 10;
            if (score > bestScore) { bestScore = score; best = to; }
        }
        return best ? { target: best, score: bestScore } : null;
    }

    // [NEW] Long Ball target finder (지공 모드 롱킥 시스템)
    // Finds a FW making a channel run for a long diagonal / switch of play
    _findLongBallTarget(from, phase) {
        const isHome = from.teamId === 'home';
        const tid = from.teamId;
        const goalX = isHome ? 100 : 0;
        const candidates = this.players.filter(p =>
            p.teamId === tid &&
            p !== from &&
            p.position === 'FW'
        );
        let best = null;
        let bestScore = -Infinity;
        for (const to of candidates) {
            const dist = Math.hypot(from.x - to.x, from.y - to.y);
            if (dist < 28 || dist > 68) continue;
            const progressive = isHome ? (to.x - from.x) : (from.x - to.x);
            if (progressive < 18) continue;
            // Check space around target
            const oppNear = this.players.filter(p =>
                p.teamId !== tid && p.position !== 'GK' &&
                Math.hypot(p.x - to.x, p.y - to.y) < 14
            ).length;
            if (oppNear > 2) continue;
            let score = progressive * 1.4 - oppNear * 14;
            // Prefer wide channels for long diagonal
            if (to.y < 22 || to.y > 78) score += 12;
            // Burst FW bonus
            if (to._fwMode === 'burst') score += 35;
            // Proximity to goal
            score += Math.max(0, 42 - Math.abs(to.x - goalX)) * 0.6;
            // Check lane is not too congested
            const laneBlocked = this._numOpponentsAhead(from, 10, 20) >= 3;
            if (laneBlocked) score -= 20;
            if (score > bestScore) { bestScore = score; best = to; }
        }
        return best && bestScore > 18 ? { target: best, score: bestScore } : null;
    }

    _chooseDribbleYTarget(player, phase, nDef, preferWide = false) {
        const isHome = player.teamId === 'home';
        const probeX = isHome ? player.x + 12 : player.x - 12;
        let upCrowd = 0, downCrowd = 0;
        for (const opp of this.players) {
            if (opp.teamId === player.teamId || opp.position === 'GK') continue;
            if (Math.abs(opp.x - probeX) > 16) continue;
            if (opp.y < player.y) upCrowd++;
            else downCrowd++;
        }
        let dir;
        if (preferWide) dir = player.y < 50 ? -1 : 1;
        else if (upCrowd === downCrowd) dir = nDef ? (nDef.player.y > player.y ? -1 : 1) : (player.y < 50 ? 1 : -1);
        else dir = upCrowd < downCrowd ? -1 : 1;

        let span = 8;
        if (phase === 'building') span = 5;
        else if (phase === 'progressing') span = 9;
        else span = 7;
        return clamp(player.y + dir * span, 8, 92);
    }

    _getTeamBlockLines(teamId) {
        const isHome = teamId === 'home';
        const fwd = isHome ? 1 : -1;
        const phase = this._phase[teamId];
        const dt = gameData.deepTactics || {};
        const profile = this.getTacticProfile(teamId);
        // 전술별 기본 라인 성향 (게겐프레싱=하이라인, 파크버스/카테나치오=딥라인)
        const tacticLineBias = (profile.press - 0.62) * 10;
        const lineBias = (dt.defensiveLine === 'high' ? 4 : (dt.defensiveLine === 'deep' ? -4 : 0)) + tacticLineBias;
        const ballX = this.ball.x;
        const haveBall = this._possession.teamId === teamId ||
            (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner && this.ball.lastOwner.teamId === teamId);
        const threatX = !haveBall && this.ball.state === BallState.IN_FLIGHT && this.ball.targetPos
            ? this.ball.targetPos.x
            : ballX;

        let dfX, mfX, fwX;
        if (haveBall) {
            const phasePush = phase === 'building' ? 5 : (phase === 'progressing' ? 14 : (phase === 'finalThird' ? 20 : 16));
            fwX = isHome ? clamp(ballX + 21 + phasePush, 60, 93)
                : clamp(ballX - 21 - phasePush, 7, 40);
            mfX = fwX - fwd * (phase === 'building' ? 9 : 7); // [간격 축소] 미드필더가 공격수 바로 뒤까지 높게 전진
            dfX = mfX - fwd * (phase === 'building' ? 10 : 8); // [라인 올림] 수비수 라인을 대폭 끌어올려 팀 간격 컴팩트화
        } else {
            // [FLR 수비 블록 이식]
            // CB 라인: 상대 공격이 박스(32야드 이내)로 접근 시 8~14선까지 깊숙이 내려앉아 골문을 방어하고 오프사이드 라인을 자연스럽게 확보
            if (isHome) {
                if (threatX < 32) {
                    dfX = clamp(threatX - 4.5, 8, 22);
                } else {
                    dfX = clamp(14 + lineBias + threatX * 0.22, 14, 38);
                }
                mfX = clamp(dfX + (threatX < 35 ? 7 : 11), 18, 46);
                fwX = clamp(Math.max(52, mfX + 22), 52, 70);
            } else {
                if (threatX > 68) {
                    dfX = clamp(100 - ((100 - threatX) - 4.5), 78, 92);
                } else {
                    dfX = clamp(100 - (14 + lineBias + (100 - threatX) * 0.22), 62, 86);
                }
                mfX = clamp(dfX - (threatX > 65 ? 7 : 11), 54, 82);
                fwX = clamp(Math.min(48, mfX - 22), 30, 48);
            }
        }

        return {
            dfX: clamp(dfX, 4, 96),
            mfX: clamp(mfX, 4, 96),
            fwX: clamp(fwX, 4, 96),
            haveBall
        };
    }

    // ─────────────────────────────────────────────────────────────
    //  [V3 CORE]  ON-BALL DECISION (build-up → progress → final)
    // ─────────────────────────────────────────────────────────────
    _onBallDecision(player) {
        if (player.position === 'GK') { this._gkAI(player); return; }

        const isHome = player.teamId === 'home';
        const tid = player.teamId;
        const goalX = isHome ? 100 : 0;
        const moveDir = isHome ? 1 : -1;
        const phase = this._phase[tid];
        const distToGoal = Math.abs(player.x - goalX);
        const behavior = this.getRoleBehavior(player.role);
        const onFlank = player.y < 25 || player.y > 75;
        const nDef = this._nearestOpponent(player);
        const underPressure = nDef && nDef.dist < 8;
        const effectSpeed = this.getEffectiveStat(player, 'speed');
        const isWinger = (behavior.hugLine && onFlank) || Math.abs(player.y - 50) > 20;

        // 2) PASS OR DRIBBLE based on PHASE + role!
        const teammates = this.players.filter(p => p.teamId === tid && p !== player);
        let bestPassTarget = null;
        let bestPassScore = -Infinity;
        for (const tm of teammates) {
            const s = this._scorePass(player, tm, phase);
            if (s > bestPassScore) { bestPassScore = s; bestPassTarget = tm; }
        }
        const killerPass = this._findKillerPassTarget(player, phase);
        if (killerPass && killerPass.score > bestPassScore + 6) {
            bestPassTarget = killerPass.target;
            bestPassScore = killerPass.score;
        }

        // [NEW] attackStyle integration
        const atkStyle = (typeof gameData !== 'undefined' && gameData.deepTactics) ? (gameData.deepTactics.attackStyle || 'mixed') : 'mixed';
        // Possession mode: try long ball when in progressing/finalThird
        if (atkStyle === 'possession' && (phase === 'progressing' || phase === 'finalThird' || phase === 'counter')) {
            const longBall = this._findLongBallTarget(player, phase);
            if (longBall && longBall.score > bestPassScore - 5) {
                bestPassTarget = longBall.target;
                bestPassScore = longBall.score + 18;
            }
        }
        // Counter mode: strongly prefer forward passes, boost burst FW target
        if (atkStyle === 'counter' && phase === 'counter') {
            const counterBurst = this.players.find(p =>
                p.teamId === tid && p._fwMode === 'burst' && p.position === 'FW'
            );
            if (counterBurst) {
                const cs = this._scorePass(player, counterBurst, phase);
                if (cs > bestPassScore - 12) { bestPassTarget = counterBurst; bestPassScore = cs + 25; }
            }
        }

        // Situation-first choice: compare best pass with carry value
        const passProb = this._calcPassProbV3(player, phase, underPressure, isWinger, distToGoal, nDef);
        const carryScore = this._scoreCarryChoice(player, phase, underPressure, isWinger, distToGoal, nDef);
        const passScore = bestPassScore + passProb * 18;

        // [BUG FIX] Emergency shoot: player is right at the goal line
        // Prevents freeze where player oscillates at x=97-98 and never shoots
        if (distToGoal <= 6 && player.position !== 'GK') {
            this._attemptShoot(player, goalX);
            return;
        }

        // 컷백 및 크로스 기회 감지: 엔드라인/측면에서 페널티 박스로 꺾어주거나 올려주는 찬스
        const isCutback = distToGoal <= 18 && Math.abs(player.y - 50) > 16 &&
            bestPassTarget && (Math.abs(bestPassTarget.x - goalX) <= 26) &&
            (Math.abs(bestPassTarget.y - 50) <= 24) &&
            (Math.abs(bestPassTarget.x - goalX) >= distToGoal + 2);
        const isCross = distToGoal <= 36 && Math.abs(player.y - 50) > 16 &&
            bestPassTarget && (Math.abs(bestPassTarget.x - goalX) <= 22) &&
            (Math.abs(bestPassTarget.y - 50) <= 26) &&
            (Math.abs(bestPassTarget.x - goalX) < distToGoal + 2);

        // [FLR 이식] 페널티 박스 안 (distToGoal <= 22) 피니시 결정:
        // 골문 앞에서는 슛/직접 돌파를 최우선하며, 미드필더로 공을 빼서 생기는 핑퐁 루프를 원천 차단
        if (distToGoal <= 22 && player.position !== 'GK') {
            const sc = this._shootChance(player, goalX, distToGoal);
            const shootScore = sc * 100 + (player.position === 'FW' ? 16 : 4) - (underPressure ? 10 : 0);
            const shootThreshold = distToGoal <= 8 ? 20 : (distToGoal <= 14 ? 42 : (distToGoal <= 18 ? 54 : 68));

            // 골문 앞 탭인/오픈 찬스 또는 컷백/크로스 타겟 확인
            const isPassBetterFinish = bestPassTarget && (
                isCutback || isCross ||
                ((Math.abs(bestPassTarget.x - goalX) < distToGoal - 1.2) && Math.abs(bestPassTarget.y - 50) < 22)
            );

            // [공격 다변화: 컷백 & 크로스 패턴] 각도가 좁은 곳에서는 억지 슈팅 대신 오픈 찬스의 컷백/크로스 타겟에게 우선 연결!
            if ((isCutback || isCross) && Math.abs(player.y - 50) > 16 && passScore >= carryScore - 12) {
                this._executePassV3(player, bestPassTarget, phase);
                return;
            }

            if (distToGoal <= 7 || shootScore >= shootThreshold) {
                this._attemptShoot(player, goalX);
                return;
            }

            // 슈팅이 어렵고 동료가 완벽한 찬스 위치에 있을 때 전진/컷백 패스
            if (bestPassTarget && isPassBetterFinish && passScore >= carryScore - 5) {
                this._executePassV3(player, bestPassTarget, phase);
                return;
            }

            // 박스 안에서는 뒤쪽으로 공을 빼지 않고, 직접 수비수를 제치거나 공간으로 치고 들어감
            this._dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effectSpeed);
            return;
        }

        // [공격 다변화: 기습 중거리 캐논 슈팅 (18 ~ 28)]
        if (distToGoal >= 18 && distToGoal < 29 && player.position !== 'DF' && player.position !== 'GK') {
            const effSh = this.getEffectiveStat(player, 'shooting');
            const frontCrowd = this._numOpponentsAhead(player, 10, 18);
            if (effSh >= 62 && frontCrowd <= 1 && Math.random() < 0.32) {
                this._attemptShoot(player, goalX);
                this.eventsQueue.push({ type: 'shoot', player: player.name, desc: ` ${player.name}, 아크 정면에서 벼락같은 중거리 캐논 슈팅!!` });
                return;
            }
        }

        // [사용자 요구사항] 박스 주변(distToGoal <= 28)에서 어이없는 백패스 원천 차단:
        // 전진 패스 타겟 및 컷백 타겟이 없으면 백패스를 하지 않고 과감한 슈팅이나 드리블 돌파 감행
        if (distToGoal <= 28 && player.position !== 'GK') {
            const isTargetForward = bestPassTarget && (Math.abs(bestPassTarget.x - goalX) < distToGoal - 1.2);
            if (!isTargetForward && !isCutback) {
                const sc = this._shootChance(player, goalX, distToGoal);
                if (sc > 0.30 || distToGoal <= 18) {
                    this._attemptShoot(player, goalX);
                    return;
                }
                this._dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effectSpeed);
                return;
            }
        }

        const bestPassProgressive = bestPassTarget
            ? (isHome ? bestPassTarget.x > player.x + 2 : bestPassTarget.x < player.x - 2)
            : false;
        const bestPassLateral = bestPassTarget
            ? Math.abs(bestPassTarget.x - player.x) <= 5
            : false;
        const frontCrowd = this._numOpponentsAhead(player, 10, 18);
        if (bestPassTarget && player.position !== 'DF' && !underPressure && frontCrowd <= 1 && (!bestPassProgressive || bestPassLateral) && !isCutback && !isCross) {
            this._dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effectSpeed);
            return;
        }
        if (bestPassTarget && passScore >= carryScore) {
            // [추가 검증] 박스 주변(distToGoal <= 32)에서는 컷백이 아닌 일반 백패스를 거부하고 드리블 돌파 선택
            const isBackwardPass = Math.abs(bestPassTarget.x - goalX) > distToGoal + 1;
            if (distToGoal <= 32 && isBackwardPass && !isCutback) {
                this._dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effectSpeed);
                return;
            }
            this._executePassV3(player, bestPassTarget, phase);
            return;
        }

        // 3) Tackle by opponent (low probability)
        if (nDef && nDef.dist < 6.5 && Math.random() < 0.035) {
            if (this._attemptTackle(nDef.player, player)) return;
        }

        // 4) DRIBBLE CARRY — phase/role driven! (V3: NEVER dribble in place!)
        this._dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effectSpeed);
    }

    _gkAI(gk) {
        const under = this._isUnderPressure(gk);
        const tid = gk.teamId;
        const isHome = tid === 'home';
        gk.vx *= 0.3; gk.vy *= 0.3;
        const homeX = gk.baseX || (isHome ? 5 : 95);
        gk.x += (homeX - gk.x) * 0.25 + gk.vx;
        gk.y += (clamp(50 + (this.ball.y - 50) * 0.08, 42, 58) - gk.y) * 0.25 + gk.vy;
        if (this.ball.owner === gk) { this.ball.x = gk.x; this.ball.y = gk.y; }
        const mates = this.players.filter(p => p.teamId === tid && p !== gk);
        const dfs = mates.filter(p => p.position === 'DF');
        let target = null;
        if (dfs.length) {
            target = dfs.slice().sort((a, b) => {
                const ap = ['CD', 'BPD', 'NCB'].includes(a.role) ? 0 : 1;
                const bp = ['CD', 'BPD', 'NCB'].includes(b.role) ? 0 : 1;
                if (ap !== bp) return ap - bp;
                return Math.hypot(a.x - gk.x, a.y - gk.y) - Math.hypot(b.x - gk.x, b.y - gk.y);
            })[0];
        }
        if (!target) target = mates.find(p => p.position === 'MF') || mates[0];
        if (target) { this._executePassV3(gk, target, 'building'); return; }
    }

    _isUnderPressure(player) {
        return this.players.some(p => p.teamId !== player.teamId && Math.hypot(p.x - player.x, p.y - player.y) < 8);
    }

    _nearestOpponent(player) {
        let best = null, bd = 9999;
        for (const p of this.players) {
            if (p.teamId === player.teamId) continue;
            if (p.position === 'GK') continue;
            const d = Math.hypot(p.x - player.x, p.y - player.y);
            if (d < bd) { bd = d; best = p; }
        }
        return best ? { player: best, dist: bd } : null;
    }

    // ─────────────────────────────────────────────────────────────
    //  PASS SCORING + PROBABILITY V3 (FLOW AWARE!)
    // ─────────────────────────────────────────────────────────────
    _scorePass(from, to, phase) {
        const isHome = from.teamId === 'home';
        const tid = from.teamId;
        const goalX = isHome ? 100 : 0;
        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        const dFromGoal = Math.abs(from.x - goalX);
        const dToGoal = Math.abs(to.x - goalX);
        const forward = dToGoal < dFromGoal - 1;
        const back = dToGoal > dFromGoal + 4;
        const later = !forward && !back;
        const fromUnderPressure = this.players.some(opp =>
            opp.teamId !== tid &&
            opp.position !== 'GK' &&
            Math.hypot(opp.x - from.x, opp.y - from.y) < 7.5
        );

        // Lane check
        let laneBlock = 0;
        for (const opp of this.players) {
            if (opp.teamId === tid) continue;
            if (opp.position === 'GK') continue;
            const tx = to.x - from.x, ty = to.y - from.y;
            const len2 = tx * tx + ty * ty;
            if (len2 < 0.01) continue;
            const t = clamp(((opp.x - from.x) * tx + (opp.y - from.y) * ty) / len2, 0, 1);
            const cx = from.x + t * tx, cy = from.y + t * ty;
            if (Math.hypot(opp.x - cx, opp.y - cy) < 4.5) laneBlock += 1;
        }

        // Space around receiver
        let oppNearRecv = 0;
        for (const opp of this.players) {
            if (opp.teamId === tid || opp.position === 'GK') continue;
            if (Math.hypot(opp.x - to.x, opp.y - to.y) < 9) oppNearRecv++;
        }

        let score = 0;

        // [공격 다변화: 컷백, 크로스, 사이드 체인지 전환, 2대1 원투 연계 판별]
        const isCutbackCandidate = (dFromGoal <= 18 && Math.abs(from.y - 50) > 16 && dToGoal <= 26 && Math.abs(to.y - 50) <= 24 && dToGoal >= dFromGoal + 2);
        const isCrossCandidate = (dFromGoal <= 36 && Math.abs(from.y - 50) > 16 && dToGoal <= 22 && Math.abs(to.y - 50) <= 26 && dToGoal < dFromGoal + 2);
        const isSwitchPlay = Math.abs(from.y - 50) > 18 && Math.abs(to.y - 50) > 18 && (Math.sign(from.y - 50) !== Math.sign(to.y - 50)) && dist > 28;
        const isOneTwoCandidate = from._receivedFromId && to.id === from._receivedFromId;

        // [사용자 요구사항] 박스 주변이나 안쪽(dFromGoal <= 32)에서는 하프라인 뒤로의 백패스 원천 금지!
        if (dFromGoal <= 32) {
            const isReceiverBehindHalf = isHome ? to.x < 50 : to.x > 50;
            if (isReceiverBehindHalf) return -Infinity; // 하프라인 뒤로 패스 절대 금지!
            // 컷백 찬스가 아닌 일반 백패스 중 12유닛 초과 백패스 금지!
            if (back && !isCutbackCandidate && (dToGoal - dFromGoal > 12)) return -Infinity;
        }

        // Distance penalty (very short passes ok in buildup, but not spamming)
        if (dist < 5) score -= 8;
        if (dist > 60) score -= 12;

        // [공격 다변화: 사이드 체인지 전환 패스는 Y축 감점 면제 및 노마크 시 대폭 가산, 크로스/컷백 면제]
        const yShift = Math.abs(to.y - from.y);
        if (isSwitchPlay) {
            if (oppNearRecv === 0) score += 65; // 반대편 완전 노마크 윙어 전환
            else if (oppNearRecv === 1) score += 30;
        } else if (isCrossCandidate || isCutbackCandidate) {
            // 크로스 및 컷백은 중앙 투입이므로 yShift 감점 면제
        } else {
            if (yShift > 30 && !forward) score -= 40;
            else if (yShift > 20 && !forward) score -= 20;
        }

        // Direction: huge forward bonus, hard back/lat penalty in final/progress
        if (forward) score += phase === 'building' ? 22 : (phase === 'progressing' ? 35 : 45);
        else if (later) score += (phase === 'building' ? -5 : -10);
        else if (back) {
            if (isCutbackCandidate) {
                // 컷백 패스는 백패스 감점 면제 및 최우선 공격 찬스로 가산!
                score += 90;
            } else if (phase === 'finalThird' || dFromGoal < 30) {
                score -= 140;
            } else if (fromUnderPressure && oppNearRecv === 0 && laneBlock === 0 && (to.position === 'DF' || to.position === 'MF')) {
                // 빌드업/전진 국면에서의 압박 탈출용 백패스 (티키타카)
                score += 35;
            } else {
                if (phase === 'building') score -= 36;
                else score -= 62;
            }
        }
        // GK never pass target
        if (to.position === 'GK') score -= 120;

        //  BUILDING PHASE SUBDIVISION: early vs late (fixes buildup stagnation!)
        const isHomeFr = from.teamId === 'home';
        const distFromOwnGoal = isHomeFr ? from.x : (100 - from.x);
        const inLateBuild = (phase === 'building' && distFromOwnGoal >= 22);

        // Prefer position based on phase
        if (phase === 'building') {
            if (inLateBuild && from.position !== 'GK') {
                // Late build-up (x=22~35): behave almost like progressing, push to FW!
                if (to.position === 'FW') score += 42;
                else if (to.position === 'MF') score += 22;
                else if (to.position === 'DF') score += from.position === 'DF' ? 8 : -25;
                if (to._fwMode === 'linkup') score += 22;
            } else {
                // Early build-up (GK/CB area): safe distribution to DF/MF
                if (to.position === 'DF') score += 18;
                else if (to.position === 'MF') score += 35;
                else if (to.position === 'FW') score += 12;
            }
        } else if (phase === 'progressing') {
            const isWideTarget = Math.abs(to.slotY - 50) > 18;
            if (to.position === 'FW') score += 40;
            else if (to.position === 'MF') score += (isWideTarget ? 38 : 18);
            else if (to.position === 'DF') score -= 35;
            // Burst FW trigger → through pass bonus!
            if (to._fwMode === 'burst' && to.burstTimer > 5) score += 60;
            if (to._fwMode === 'linkup') score += 10;
            // FB overlap bonus
            if (to.position === 'DF' && to._fbMode === 'overlap') score += 25;
        } else {
            // finalThird
            const isWideTarget = Math.abs(to.slotY - 50) > 18;
            if (to.position === 'FW') score += 50;
            else if (to.position === 'MF') score += (isWideTarget ? 45 : 12);
            else score -= 60;
            if (to._fwMode === 'burst') score += 75;
            
            // [공격 다변화: 측면 크로스 & 컷백 로직]
            const isWinger = Math.abs(from.y - 50) > 16;
            if (isWinger && dFromGoal <= 34) {
                if (isCutbackCandidate) {
                    score += 110; 
                } else if (isCrossCandidate && to.position === 'FW') {
                    score += 100; 
                }
            } else {
                // 일반적인 골문 앞 전진 패스 보너스
                if (Math.abs(to.y - 50) < 25 && dToGoal < 18 && forward) score += 45;
            }
        }
        // Lane
        if (laneBlock >= 2) score -= 50;
        else if (laneBlock === 1) score -= 20;
        else score += 10;
        // Space
        if (oppNearRecv === 0) score += 30;
        else if (oppNearRecv === 1) score += 10;
        else score -= 15;
        // Rating small
        score += (to.rating - 70) * 0.03;
        // [공격 다변화: 2대1 원투 기브앤고] 전진 쇄도 중인 동료에게 주는 리턴 패스는 대폭 가산!
        if (isOneTwoCandidate) {
            if (forward && (to.burstTimer > 0 || dToGoal < dFromGoal - 1)) {
                score += 70; // 2대1 원투 연계 침투!
            } else {
                score -= 100; // 제자리 핑퐁 루프만 감점
            }
        }
        if (this.ball.lastOwner === to) score -= 70;
        // Winger cross target: FW inside box → boost
        if (this.getRoleBehavior(from.role).hugLine && dToGoal < 28) {
            if (to.position === 'FW' && Math.abs(to.y - 50) < 35) score += 40;
        }
        // Escape press: favor outlet / diagonal / forward options over lazy backpasses
        if (fromUnderPressure) {
            if (forward) score += 22;
            if (back) score -= 40;  // [TUNED] Under pressure, back pass is very dangerous
            if (later && dist > 8) score += 8;
            if (to.position === 'FW') score += 18;
            else if (to.position === 'MF') score += 12;
            if (oppNearRecv === 0) score += 14;
            if (laneBlock === 0 && dist > 10) score += 10;
            // Bonus for short support pass to free nearby teammate
            if (dist < 12 && oppNearRecv === 0 && !back) score += 12;
        }
        if (phase !== 'finalThird' && to.position === 'DF' && from.position !== 'DF') score -= 10;

        // [NEW] Wing-to-wing pass: from one wide flank to the opposite wide flank
        // (e.g., left winger to right winger) — nearly impossible in real football
        const fromFarLeft  = from.y < 24;
        const fromFarRight = from.y > 76;
        const toFarLeft    = to.y < 24;
        const toFarRight   = to.y > 76;
        const isOppositeFlanks = (fromFarLeft && toFarRight) || (fromFarRight && toFarLeft);
        if (isOppositeFlanks && !isSwitchPlay) score -= 85; // Hard veto: cross-field winger-to-winger except switch play

        // [NEW] MF as playmaker: when MF has ball, boost pass to FW runs
        if (from.position === 'MF' && to.position === 'FW') {
            score += 12; // MF naturally looks for FW first
            if (to._fwMode === 'burst') score += 20; // Extra if FW is already running
        }

        // [NEW] attackStyle modifiers on pass score
        const atkStyle2 = (typeof gameData !== 'undefined' && gameData.deepTactics) ? (gameData.deepTactics.attackStyle || 'mixed') : 'mixed';
        if (atkStyle2 === 'counter' && forward && (phase === 'counter' || phase === 'progressing')) score += 22;
        if (atkStyle2 === 'possession' && !back) score += 6; // patient: reward safe options
        if (atkStyle2 === 'possession' && back && phase === 'building') score += 8; // recycling is fine
        return score;
    }

    _calcPassProbV3(player, phase, underPressure, isWinger, distToGoal, nDef) {
        const role = player.role;
        const pos = player.position;
        const isCB_def = pos === 'DF' && ['CD', 'BPD', 'NCB'].includes(role);
        const isFB = pos === 'DF' && ['FB', 'WB', 'CWB', 'IWB'].includes(role);
        const ph = player.teamId === 'home' ? player.x : (100 - player.x);
        const lateBuild = (phase === 'building' && ph >= 22);
        let p = 0.4;
        //  BUILD-UP (GK/CB/MF deep): pass a lot to get out
        if (phase === 'building') {
            if (pos === 'GK') p = 0.99;
            else if (isCB_def) {
                p = underPressure ? 0.96 : (lateBuild ? 0.7 : 0.78);
            } else if (isFB) {
                p = underPressure ? 0.92 : (lateBuild ? 0.4 : 0.55);
            } else if (pos === 'MF') {
                // Late build MF: DRIBBLE through (almost like progressing!)
                p = underPressure ? (lateBuild ? 0.72 : 0.88) : (lateBuild ? 0.34 : 0.55);
            } else {
                p = underPressure ? 0.6 : 0.42;
            }
        } else if (phase === 'progressing') {
            //  Progressing: DRIBBLE a lot to advance! MF dribble, CB mostly pass
            if (isCB_def) p = 0.9;
            else if (isFB) p = underPressure ? 0.78 : 0.32;  // FB drives!
            else if (pos === 'MF') {
                p = 0.28;  // 72% dribble to advance!
                if (underPressure) p = 0.62;
                // If MF near 65 line → look for FW burst pass → higher prob pass
                const nearFinal = (player.teamId === 'home' && player.x > 62) || (player.teamId === 'away' && player.x < 38);
                if (nearFinal) p += isWinger ? 0.38 : 0.18;
            } else {
                p = 0.25; // FW progressing: drive
                if (underPressure) p = 0.58;
            }
        } else {
            // finalThird: shoot or cross or final pass
            if (isWinger && distToGoal < 34) p = 0.88; // cross / cutback
            else if (pos === 'FW') p = 0.28; // mostly shoot/dribble
            else if (pos === 'MF') p = 0.45;
            else p = 0.5;
        }
        const dt = gameData.deepTactics || {};
        if (dt.passTempo === 'fast') p = Math.min(0.98, p + 0.06);
        if (dt.passTempo === 'slow') p = Math.max(0.12, p - 0.06);
        // 메인 전술 반영: tempo 높으면 패스 확률↑(빠른전개), directness 높으면 드리블 대신 전진패스↑
        const profile = this.getTacticProfile(player.teamId);
        p += (profile.tempo - 0.92) * 0.25;
        // [NEW] attackStyle pass probability modifier
        const atkStyle3 = dt.attackStyle || 'mixed';
        if (atkStyle3 === 'counter' && (phase === 'counter' || phase === 'progressing')) p = Math.min(0.98, p + 0.16);
        if (atkStyle3 === 'possession' && phase === 'building') p = Math.min(0.98, p + 0.14);
        if (atkStyle3 === 'possession' && underPressure) p = Math.min(0.98, p + 0.10); // quick release under pressure
        return clamp(p, 0.08, 0.98);
    }

    _scoreCarryChoice(player, phase, underPressure, isWinger, distToGoal, nDef) {
        let score = 0;
        const speed = this.getEffectiveStat(player, 'speed');
        const decision = this.getEffectiveStat(player, 'decision');
        const dribble = this.getEffectiveStat(player, 'dribble');
        const blockedAhead = this._numOpponentsAhead(player, 10, 18);
        if (phase === 'building') score += player.position === 'MF' ? 24 : 10;
        else if (phase === 'progressing') score += player.position === 'MF' ? 46 : 34;
        else score += player.position === 'FW' ? 52 : 44; // [미드필더 공격 가담] 파이널 서드에서 공을 과감하게 끌고 전진
        if (isWinger) score += 18;
        if (player.position === 'FW') score += 16;
        if (player.position !== 'DF' && !underPressure) score += 10;
        if (underPressure) score -= (dribble > 75 ? 6 : 14);
        if (blockedAhead >= 2) score -= 20;
        else if (blockedAhead === 1) score -= 6;
        // 박스 근처(distToGoal <= 28)에서 공격수의 돌파 점수 버프
        if (distToGoal <= 28) {
            score += player.position === 'FW' ? 26 : 12;
        }
        // [선수 돌파 능력 버프] 드리블 능력치에 비례한 확실한 돌파 선호 가산점 강화
        score += (dribble - 70) * 0.70 + (speed - 70) * 0.45 + (decision - 70) * 0.25;
        if (nDef) {
            const defTackle = this.getEffectiveStat(nDef.player, 'tackle') || this.getEffectiveStat(nDef.player, 'defense');
            if (dribble > defTackle) score += 22; // 수비수보다 드리블이 높으면 적극적인 1v1 돌파 시도!
            if (speed > this.getEffectiveStat(nDef.player, 'speed')) score += 18;
        }
        return score;
    }

    _executePassV3(from, to, phase) {
        this.ball.state = BallState.IN_FLIGHT;
        this.ball._flightOrigin = { x: from.x, y: from.y };
        this.ball.lastOwner = from;
        this.ball.intendedReceiver = to;
        this.ball.owner = null;
        to._receivedFromId = from.id; // 리턴 패스 핑퐁 방지용 식별자 기록
        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        const tid = from.teamId;
        const goalX = tid === 'home' ? 100 : 0;
        const dToGoalTo = Math.abs(to.x - goalX);
        const dToGoalFr = Math.abs(from.x - goalX);
        const isBehind = this._isReceiverBehindDefLine(from, to);

        // V3: record in attack memory!
        const idx = (this._attackMemIdx[tid]++) % 8;
        this._attackMemories[tid][idx] = { fromId: from.id, toId: to.id, x: to.x, t: this.matchTime * 100 + Date.now() % 100 };

        let passKind = 'safe';
        const forward = dToGoalTo < dToGoalFr - 1;
        const isCutback = dToGoalFr <= 18 && Math.abs(from.y - 50) > 16 && dToGoalTo <= 26 && Math.abs(to.y - 50) <= 24 && dToGoalTo >= dToGoalFr + 2;
        const isCross = dToGoalFr <= 36 && Math.abs(from.y - 50) > 16 && dToGoalTo <= 22 && Math.abs(to.y - 50) <= 26 && dToGoalTo < dToGoalFr + 2;
        const isThrough = isBehind && (from.position === 'MF' || from.position === 'DF') && to.position === 'FW' && dToGoalFr > dToGoalTo + 5 && dist > 10 && dist < 45 && !isCross && !isCutback;
        const isSwitchPlay = Math.abs(from.y - 50) > 18 && Math.abs(to.y - 50) > 18 && (Math.sign(from.y - 50) !== Math.sign(to.y - 50)) && dist > 28;
        const isOneTwo = from._receivedFromId && to.id === from._receivedFromId && forward;

        if (isCutback) passKind = 'cutback';
        else if (isCross) passKind = 'cross';
        else if (isThrough) passKind = 'risky';
        else if (isSwitchPlay) passKind = 'switch';
        else if (isOneTwo) passKind = 'onetwo';
        else if (dist > 30) passKind = 'lateral_long';
        
        this.ball.isCross = isCross; // 공중볼 경합/헤딩 플래그
        this.ball.isCutback = isCutback; // 컷백 즉시 슈팅 플래그
        this.ball.flightDist = Math.max(1, dist);
        this.ball.maxHeight = isCross ? 3.6 : (isSwitchPlay ? 3.2 : (dist > 30 ? 2.5 : (dist > 18 ? 1.0 : 0.1)));

        // [공격 다변화: 패스 후 쇄도] 전진 패스를 준 선수는 앞으로 가속 침투 (기브앤고 콤비네이션 연계)
        if (forward && dist < 24 && (from.position === 'FW' || from.position === 'MF')) {
            from.burstTimer = 22;
        }

        // [FLR 물리 이식] 패스 거리에 따른 실제 물리 탄도 속도 (거리 비례 동적 탄속)
        let strikeSpeed = 5.6;
        if (dist > 45) strikeSpeed = 7.6; // 긴 롱패스 / 반대전환 (7.6)
        else if (dist > 28) strikeSpeed = 6.8; // 중거리 패스 / 크로스 (6.8)
        else if (dist > 16) strikeSpeed = 6.0; // 전진/스루패스 (6.0)
        else strikeSpeed = 5.2; // 짧은 숏패스 (5.2)
        this.ball.speed = strikeSpeed;

        // accuracy
        let acc = this.getEffectiveStat(from, 'passing');
        if (to._fwMode === 'burst' && to.burstTimer > 0) acc += 25;
        if (isCross) acc += this.getRoleBehavior(from.role).hugLine ? 15 : -5;
        let distPen = Math.max(0, (dist - 20) * 0.7);
        if (passKind === 'risky') distPen *= 1.4;
        if (passKind === 'safe') distPen *= 0.7;
        if (from.position === 'GK' && dist > 40) distPen += 15;
        // [신규] 체력 고갈 시 치명적 패스 미스 페널티
        if (from.stamina < 40) distPen += 18;
        const minAcc = from.stamina < 40 ? 10 : 20;
        const success = Math.random() * 100 <= clamp(acc - distPen + (isThrough ? 6 : 0), minAcc, 99);

        if (success) {
            const lead = isThrough || (dist > 24 && (to.position === 'FW' || to._fwMode === 'burst')) ? 6 : 0;
            const moveDir = to.teamId === 'home' ? 1 : -1;
            this.ball.targetPos = {
                x: clamp(to.x + moveDir * lead, 2, 98),
                y: clamp(to.y + (to.slotY - to.y) * 0.2, 2, 98)
            };
            if (isCutback) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}, 엔드라인을 허물고 감각적인 컷백 배달!` });
            else if (isCross) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}, 문전으로 궤적 날카로운 크로스 올립니다!` });
            else if (isThrough) this.eventsQueue.push({ type: 'throughpass', from: from.name, to: to.name, desc: ` ${from.name}, 수비 뒷공간을 가르는 킬러 스루패스!` });
            else if (isSwitchPlay) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}, 반대편 빈 공간으로 시원한 사이드 체인지 롱패스!` });
            else if (isOneTwo) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}과 ${to.name}, 절묘한 2대1 원투 패스로 수비진 돌파!` });
            else this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: `${from.name}, ${to.name}에게 연결!` });
        } else {
            const err = dist * 0.22;
            const a = Math.random() * Math.PI * 2;
            const ed = Math.random() * err + 4;
            this.ball.targetPos = { x: clamp(to.x + Math.cos(a) * ed, 2, 98), y: clamp(to.y + Math.sin(a) * ed, 2, 98) };
            const ev = isThrough ? 'throughpass' : 'pass';
            const desc = isThrough ? `${from.name}의 스루패스가 차단됩니다.` : `${from.name}, 패스 미스!`;
            this.eventsQueue.push({ type: ev, from: from.name, to: to.name, desc });
        }
    }

    _isReceiverBehindDefLine(from, to) {
        const isHome = from.teamId === 'home';
        const lim = this._calcOffsideLineX(isHome);
        return isHome ? to.x > lim : to.x < lim;
    }

    // ─────────────────────────────────────────────────────────────
    //  DRIBBLE V3 (NEVER STOP!)
    // ─────────────────────────────────────────────────────────────
    _dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effSpeed) {
        const effDribble = this.getEffectiveStat(player, 'dribble');
        const sf = (effSpeed * 0.40 + effDribble * 0.60) / 75;
        const isBlockedFront = this._isFrontalBlocked(player, goalX);
        const defTackle = nDef ? (this.getEffectiveStat(nDef.player, 'tackle') || this.getEffectiveStat(nDef.player, 'defense')) : 65;
        const defSpeed = nDef ? this.getEffectiveStat(nDef.player, 'speed') : 65;
        const canBreakThrough = nDef ? ((effDribble * 0.65 + effSpeed * 0.35) >= (defTackle * 0.55 + defSpeed * 0.45) - 4) : true;
        let targetX, targetY, moveSpd;

        if (player.position === 'FW' && distToGoal < 25) {
            // [공격수 피니시 드라이브] 박스 안에서는 중앙 골문 정면(40~60)으로 거침없이 파고듦
            targetX = goalX;
            targetY = clamp(50 + (player.y - 50) * 0.25, 40, 60);
            moveSpd = 1.15 * clamp(sf, 0.95, 2.35);
            if (player.burstTimer > 0) moveSpd *= 1.30;
        } else if (isWinger) {
            // [공격 다변화: 클래식 윙어 엔드라인 돌파 vs 인버티드 윙어 중앙 컷인]
            const bhv = this.getRoleBehavior(player.role);
            const shouldCutInside = bhv.cutInside || (distToGoal < 38 && Math.random() < 0.45);
            if (shouldCutInside) {
                // 대각선으로 박스 중앙/하프스페이스를 향해 파고드는 컷인 드리블
                targetX = player.x + moveDir * 48;
                targetY = clamp(50 + (player.y - 50) * 0.35, 25, 75);
                moveSpd = 1.02 * clamp(sf, 0.9, 2.15);
            } else {
                // 터치라인을 타고 엔드라인까지 질주하는 클래식 윙어 스프린트
                targetX = player.x + moveDir * 58;
                targetY = player.y < 50 ? 8 : 92;
                moveSpd = 0.95 * clamp(sf, 0.85, 2.05);
                if (distToGoal < 35) { moveSpd *= 0.95; }
            }
        } else if (player.position === 'FW' && !underPressure && distToGoal < 65) {
            // FW drive: attack diagonal towards goal
            targetX = player.x + moveDir * 65;
            targetY = clamp(player.y + (player.y < 50 ? 8 : -8), 12, 88);
            moveSpd = 1.02 * clamp(sf, 0.9, 2.15);
        } else if (underPressure || isBlockedFront) {
            // [버그 픽스] 벌벌 떠는 현상(Trembling) 방지: 수비수와의 Y축 거리가 너무 가까울 때는 
            // 매 프레임마다 evadeSign이 반전되어 위아래로 진동하는 것을 막기 위해 기존 vy 방향을 우선하거나, 중앙을 향하도록 고정.
            let evadeSign = 1;
            if (nDef) {
                if (Math.abs(nDef.player.y - player.y) < 1.5) {
                    evadeSign = (player.vy !== 0 && Math.abs(player.vy) > 0.1) ? Math.sign(player.vy) : (player.y < 50 ? 1 : -1);
                } else {
                    evadeSign = nDef.player.y > player.y ? -1 : 1;
                }
            } else {
                evadeSign = player.y < 50 ? 1 : -1;
            }

            if (canBreakThrough) {
                // [선수 돌파 능력 버프] 수비수를 제치며 전방 대각선으로 거침없이 치고 달림 (가속 버스트 획득)
                targetX = player.x + moveDir * 46;
                targetY = player.y + evadeSign * 12;
                moveSpd = 0.92 * clamp(sf, 0.88, 2.1);
                if (player.burstTimer <= 0 && Math.random() < 0.35) {
                    player.burstTimer = 18;
                }
            } else {
                // side step then still forward
                targetY = player.y + evadeSign * 10;
                targetX = player.x + moveDir * 32;
                moveSpd = 0.78 * clamp(sf, 0.8, 1.8);
            }
        } else if (phase === 'progressing') {
            // Progressing: push hard forward
            targetX = player.x + moveDir * 52;
            targetY = clamp(player.y + (player.y < 50 ? 6 : -6), 8, 92);
            moveSpd = 0.78 * clamp(sf, 0.8, 1.8);
        } else if (phase === 'building') {
            // Building: walk forward
            targetX = player.x + moveDir * 32;
            targetY = clamp(player.y + (player.y < 50 ? 4 : -4), 10, 90);
            moveSpd = 0.55 * clamp(sf, 0.7, 1.5);
        } else {
            // finalThird: push to byline or shoot area
            targetX = player.x + moveDir * 40;
            targetY = clamp(player.y + (player.y < 50 ? 6 : -6), 10, 90);
            moveSpd = 0.75 * clamp(sf, 0.78, 1.8);
        }

        // NO BACKWARD DRIBBLING: prevent backward movement, but respect pitch boundary clamp
        // [BUG FIX] When player.x is near 97-98, forcing x+6 would exceed clamp(97), creating
        // a targetX < player.x situation that causes physics oscillation at the goal line.
        const boundX_hi = 97, boundX_lo = 3;
        if (moveDir === 1) targetX = Math.min(boundX_hi, Math.max(targetX, Math.min(player.x + 6, boundX_hi)));
        else targetX = Math.max(boundX_lo, Math.min(targetX, Math.max(player.x - 6, boundX_lo)));

        // Final MF unstuck! If player near MF band edge and free ahead, let pass through
        const isMF = player.position === 'MF';
        const nearBand = (player.teamId === 'home' && player.x > 82 && targetX > player.x)
            || (player.teamId === 'away' && player.x < 18 && targetX < player.x);
        if (isMF && nearBand && !underPressure && !this._numOpponentsAhead(player, 10, 18)) {
            targetX += moveDir * 12; // let break through
        }

        targetX = clamp(targetX, 3, 97);
        targetY = clamp(targetY, 4, 96);

        this._physicsStep(player, targetX, targetY, moveSpd);

        this.ball.x = player.x; this.ball.y = player.y; this.ball.z = 0;
        if (Math.random() < 0.26) this.eventsQueue.push({ type: 'dribble', player: player.name });
    }

    _isFrontalBlocked(player, goalX) {
        const isHome = player.teamId === 'home';
        const checkX = isHome ? player.x + 10 : player.x - 10;
        return this.players.some(p =>
            p.teamId !== player.teamId && p.position !== 'GK' &&
            Math.abs(p.x - checkX) < 10 && Math.abs(p.y - player.y) < 10
        );
    }

    _numOpponentsAhead(player, xAhead, yBand) {
        const isHome = player.teamId === 'home';
        const cx = isHome ? player.x + xAhead : player.x - xAhead;
        let n = 0;
        for (const p of this.players) {
            if (p.teamId === player.teamId || p.position === 'GK') continue;
            if (Math.abs(p.x - cx) < 15 && Math.abs(p.y - player.y) < yBand) n++;
        }
        return n;
    }

    // ─────────────────────────────────────────────────────────────
    //  SHOOT / TACKLE
    // ─────────────────────────────────────────────────────────────
    _shootChance(player, goalX, dToGoal) {
        // Angle block
        const isBlockAngle = dToGoal < 40 && this.players.some(o => {
            if (o.teamId === player.teamId) return false;
            const d = Math.hypot(o.x - player.x, o.y - player.y);
            if (d > 14) return false;
            const dot = (goalX - player.x) * (o.x - player.x) + (50 - player.y) * (o.y - player.y);
            const m1 = Math.hypot(goalX - player.x, 50 - player.y);
            const ang = Math.acos(clamp(dot / (m1 * d + 0.001), -1, 1));
            return ang < 0.3;
        });
        if (isBlockAngle && dToGoal > 16 && player.position !== 'FW' && Math.random() < 0.5) return 0;

        //  각도 페널티 (박스 외곽에서만 엄격하게 적용, 박스 안쪽에서는 슈팅 각도 관대화)
        const dY = Math.abs(player.y - 50);
        const shotAngle = Math.atan2(dY, Math.max(1, dToGoal));
        let angleFactor = 1.0;
        if (shotAngle > 1.1) angleFactor = 0.25;
        else if (shotAngle > 0.85) angleFactor = 0.55;
        else if (shotAngle > 0.6) angleFactor = 0.78;
        else if (shotAngle > 0.4) angleFactor = 0.92;
        // 박스 안쪽(골문 앞 18야드 이내)에서는 각도 페널티 완화하여 과감한 피니시 유도
        if (dToGoal <= 18) angleFactor = Math.max(angleFactor, 0.75);
        if (dToGoal <= 10) angleFactor = Math.max(angleFactor, 0.90);

        let b = 0;
        // [배속 동기화 및 사실적 골 통계] 과도한 골 수를 방지하고 경기당 2.5~3.5골의 현실적 스코어라인 유지
        if (dToGoal < 10) b = 0.78;
        else if (dToGoal < 16) b = 0.52;
        else if (dToGoal < 22) b = clamp(1 / dToGoal * 9, 0.10, 0.35);
        else if (dToGoal < 30) b = clamp(1 / dToGoal * 5, 0.03, 0.12);
        else if (dToGoal < 38) b = 0.02;
        else b = 0.005;

        if (player.position === 'FW') b *= 1.3;

        b *= angleFactor;

        // [MatchTuning 연동] 슈팅 시도 빈도 및 중거리 슈팅 조절
        const freqMod = (typeof MatchTuning !== 'undefined' && MatchTuning.shotFrequencyMultiplier !== undefined)
            ? MatchTuning.shotFrequencyMultiplier : 1.0;
        b *= freqMod;

        if (dToGoal >= 22) {
            const longMod = (typeof MatchTuning !== 'undefined' && MatchTuning.longShotSuppression !== undefined)
                ? MatchTuning.longShotSuppression : 1.0;
            b *= longMod;
        }

        return Math.min(b, 0.90);
    }

    _attemptShoot(shooter, goalX) {
        const opp = shooter.teamId === 'home' ? 'away' : 'home';
        const gk = this.players.find(p => p.teamId === opp && p.position === 'GK');
        const gkV = gk ? this.getEffectiveStat(gk, 'defense') : 65;
        const d = Math.abs(shooter.x - goalX);
        const dF = clamp(1.3 - d / 40, 0.80, 1.35);
        const dY = Math.abs(shooter.y - 50);
        let aF = 1.0;
        if (dY > 12) {
            const ang = Math.atan2(dY - 10, Math.max(2, d));
            aF = clamp(1.0 - ang * 0.35, 0.55, 1.0);
        }
        const effSh = this.getEffectiveStat(shooter, 'shooting');
        const sp = effSh * (0.85 + Math.random() * 0.35) * dF * aF;

        // [MatchTuning 연동] 골키퍼 선방 능력 배율
        const gkMod = (typeof MatchTuning !== 'undefined' && MatchTuning.gkSaveMultiplier !== undefined)
            ? MatchTuning.gkSaveMultiplier : 1.25;
        const sv = gkV * (0.85 + Math.random() * 0.35) * gkMod;
        
        // [MatchTuning 연동] 골 결정력 밸런싱
        const inBoxBonus = d <= 8 ? 0.06 : (d <= 14 ? 0.03 : 0);
        const fwBonus = shooter.position === 'FW' ? 0.03 : 0;
        const statBonus = (sp - sv) * 0.003;

        const goalMult = (typeof MatchTuning !== 'undefined' && MatchTuning.goalMultiplier !== undefined)
            ? MatchTuning.goalMultiplier : 0.85;
        const minG = (typeof MatchTuning !== 'undefined' && MatchTuning.minGoalChance !== undefined)
            ? MatchTuning.minGoalChance : 0.02;
        const maxG = (typeof MatchTuning !== 'undefined' && MatchTuning.maxGoalChance !== undefined)
            ? MatchTuning.maxGoalChance : 0.30;

        const goalChance = clamp((0.06 + inBoxBonus + fwBonus + statBonus) * goalMult, minG, maxG);

        this.ball.state = BallState.IN_FLIGHT;
        this.ball._flightOrigin = { x: shooter.x, y: shooter.y };
        this.ball.owner = null;
        this.ball.targetPos = { x: goalX, y: 44 + Math.random() * 12 };
        this.ball.flightDist = Math.max(1, Math.hypot(this.ball.targetPos.x - shooter.x, this.ball.targetPos.y - shooter.y));
        this.ball.maxHeight = 1.8;
        this.ball.speed = 8.5; // [FLR 물리 이식] 부드럽게 글라이딩하는 슛 탄속
        const isGoal = Math.random() < goalChance;
        const targetProb = clamp(0.55 + (effSh - 70) * 0.004 - (d > 18 ? 0.12 : 0), 0.38, 0.78);
        const isTarget = isGoal || (Math.random() < targetProb);
        this.pendingShot = { isGoal, isTarget, shooter, goalX };
    }

    _handleShotResult() {
        const { isGoal, isTarget, shooter, goalX } = this.pendingShot;
        this.pendingShot = null;
        if (isGoal) {
            if (shooter.teamId === 'home') this.homeScore++;
            else this.awayScore++;
            const isHome = shooter.teamId === 'home';
            const myS = isHome ? this.homeScore : this.awayScore;
            const opS = isHome ? this.awayScore : this.homeScore;
            const ast = (this.ball.lastOwner && this.ball.lastOwner.teamId === shooter.teamId && this.ball.lastOwner.name !== shooter.name)
                ? this.ball.lastOwner.name : null;
            
            this.celebrationActor = shooter;
            if (myS < opS) {
                this.celebrationType = 'quick_restart';
                this.celebrationTarget = { x: 50, y: 50 };
                this.celebrationTimer = 12; // 지고 있을 때 빠른 볼 회수 및 신속 복귀 (~0.7초)
            } else {
                const types = ['corner_slide', 'camera', 'dance', 'manager_hug', 'run_around', 'center_slide', 'inside_goal', 'siu'];
                this.celebrationType = types[Math.floor(Math.random() * types.length)];
                
                // [세리머니 템포 대폭 최적화] 기존 90~150틱(5~9초 딜레이)에서 18~26틱(약 1.0~1.5초)으로 압축하여 군더더기 없는 빠른 템포 유지
                if (this.celebrationType === 'manager_hug') { this.celebrationTarget = { x: isHome ? 35 : 65, y: 5 }; this.celebrationTimer = 26; }
                else if (this.celebrationType === 'center_slide') { this.celebrationTarget = { x: 50, y: 50 }; this.celebrationTimer = 22; }
                else if (this.celebrationType === 'inside_goal') { this.celebrationTarget = { x: isHome ? 98 : 2, y: 50 }; this.celebrationTimer = 18; }
                else if (this.celebrationType === 'camera' || this.celebrationType === 'dance') { this.celebrationTarget = { x: shooter.x, y: shooter.y < 50 ? 5 : 95 }; this.celebrationTimer = 24; }
                else if (this.celebrationType === 'siu') { this.celebrationTarget = { x: isHome ? 100 : 0, y: shooter.y < 50 ? 0 : 100 }; this.celebrationTimer = 26; }
                else if (this.celebrationType === 'run_around') { this.celebrationTarget = { x: 50, y: 50 }; this.celebrationTimer = 26; }
                else { this.celebrationTarget = { x: isHome ? 100 : 0, y: shooter.y < 50 ? 0 : 100 }; this.celebrationTimer = 22; } // corner_slide
                
                this.celebrationState = 0;
            }
            this.eventsQueue.push({ type: 'goal', scorer: shooter.name, team: shooter.teamId, assister: ast });
            this.lastScorerTeam = shooter.teamId;
            this.ball.state = BallState.DEAD; this.ball.lastOwner = null;

            // [신규] 실점 후 멘탈 패닉 및 득점팀 모멘텀 발동
            const conceding = shooter.teamId === 'home' ? 'away' : 'home';
            const pDur = (typeof MatchTuning !== 'undefined' && MatchTuning.panicDurationMinutes !== undefined)
                ? MatchTuning.panicDurationMinutes : 3;
            if (this.panicTimer) this.panicTimer[conceding] = pDur;
            if (this.momentumBoost) this.momentumBoost[shooter.teamId] = pDur;
            if (this.matchTime >= 80 && Math.abs(this.homeScore - this.awayScore) <= 1) {
                this.eventsQueue.push({
                    type: 'notice',
                    desc: '🔥 [경기 과열] 막판 극적인 골로 관중석이 폭발합니다! 수비진의 집중력이 크게 흔들립니다!'
                });
            }
        } else if (!isTarget) {
            // [사실적 축구 물리] 유효 슈팅 실패: 골문 빗나감 (골킥 전개)
            shooter.forceReturnTimer = 60;
            const opp = shooter.teamId === 'home' ? 'away' : 'home';
            this.eventsQueue.push({ type: 'miss', shooter: shooter.name, desc: ` ${shooter.name}의 슈팅이 골대를 벗어납니다!` });
            this.ball.state = BallState.LOOSE;
            this.ball.x = goalX === 0 ? 5 : 95; this.ball.y = 50;
            this._triggerTurnover(opp);
        } else {
            // 유효 슈팅: 수비수 블록 또는 GK 선방
            shooter.forceReturnTimer = 60;
            const opp = shooter.teamId === 'home' ? 'away' : 'home';
            const isHomeAtt = shooter.teamId === 'home';
            const egk = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');
            const blockers = this.players.filter(p =>
                p.teamId === opp && p.position !== 'GK' &&
                Math.abs(p.x - shooter.x) < 16 && Math.abs(p.y - shooter.y) < 6 &&
                (isHomeAtt ? p.x > shooter.x : p.x < shooter.x)
            );
            const blockChance = (typeof MatchTuning !== 'undefined' && MatchTuning.defenseBlockChance !== undefined)
                ? MatchTuning.defenseBlockChance : 0.25;
            if (blockers.length > 0 && Math.random() < blockChance) {
                const bl = blockers[0];
                this.eventsQueue.push({ type: 'block', shooter: shooter.name, blocker: bl.name, desc: ` ${bl.name}, 몸을 날려 슈팅을 막아냅니다!` });
                this.ball.state = BallState.LOOSE; this.ball.owner = null;
                this.ball.x = bl.x + (isHomeAtt ? -5 : 5); this.ball.y = bl.y + (Math.random() - 0.5) * 16;
                this._triggerTurnover(opp);
                return;
            }
            if (egk) {
                const gkBase = egk.teamId === 'home' ? 5 : 95;
                egk.x = gkBase; egk.y = clamp(this.ball.targetPos.y, 32, 68);
                this.ball.x = egk.x; this.ball.y = egk.y;
                if (Math.random() < 0.20) {
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: egk.name, desc: ` ${egk.name}, 슈팅을 펀칭!` });
                    this.ball.state = BallState.LOOSE; this.ball.owner = null;
                    this.ball.x = egk.x + (isHomeAtt ? -10 : 10); this.ball.y = egk.y + (Math.random() - 0.5) * 32;
                    this._triggerTurnover(opp);
                } else {
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: egk.name, desc: ` ${egk.name}, 안정적으로 캐치!` });
                    this.ball.state = BallState.CONTROLLED; this.ball.owner = egk;
                    this.ball.x = egk.x; this.ball.y = egk.y;
                    this._triggerTurnover(opp);
                }
            } else {
                this.eventsQueue.push({ type: 'miss', shooter: shooter.name, desc: ` ${shooter.name}의 슈팅이 벗어납니다!` });
                this.ball.state = BallState.LOOSE;
                this.ball.x = goalX === 0 ? 5 : 95; this.ball.y = 50;
            }
        }
    }

    _triggerTurnover(winningTeamId) {
        this._attackProgressX = { home: 0, away: 0 };
        const losing = winningTeamId === 'home' ? 'away' : 'home';
        const atkStyle = (typeof gameData !== 'undefined' && gameData.deepTactics) ? (gameData.deepTactics.attackStyle || 'mixed') : 'mixed';
        // Auto set counter phase for winner (duration varies by attackStyle)
        this._phase[winningTeamId] = 'counter';
        const counterDuration = atkStyle === 'counter' ? 65 : (atkStyle === 'possession' ? 8 : 30);
        this._phaseTimer[winningTeamId] = counterDuration;
        this._attackMemories[winningTeamId] = new Array(8).fill(null);
        this._attackMemIdx[winningTeamId] = 0;
        // trigger burst for forwards of winning team (more bursts in counter, fewer in possession)
        const burstCount = atkStyle === 'counter' ? 3 : (atkStyle === 'possession' ? 1 : 2);
        const burstDur = atkStyle === 'counter' ? 48 : 28;
        const toBurst = this.players.filter(p => p.teamId === winningTeamId && (p.position === 'FW' || (p.position === 'MF' && this.getRoleBehavior(p.role).runBehind > 0.6)))
            .sort((a, b) => Math.hypot(b.x - (winningTeamId === 'home' ? 100 : 0), b.y - 50) - Math.hypot(a.x - (winningTeamId === 'home' ? 100 : 0), a.y - 50))
            .slice(0, burstCount);
        for (const p of toBurst) { if (p.position === 'FW') { p._fwMode = 'burst'; p.burstTimer = burstDur; p._timer = burstDur; } }
    }

    // ─────────────────────────────────────────────────────────────
    //  BALL FLIGHT STEP + INTERCEPTION
    // ─────────────────────────────────────────────────────────────
    _stepBallFlight() {
        const BS = this.ball.speed || 7.0; // [FLR 물리 이식] 패스/슈팅 유형별 다이내믹 탄속 적용 (사람이 따라잡지 못하는 실제 볼 속도)
        const dx = this.ball.targetPos.x - this.ball.x;
        const dy = this.ball.targetPos.y - this.ball.y;
        const d = Math.hypot(dx, dy);
        if (d <= BS) {
            this.ball.x = this.ball.targetPos.x;
            this.ball.y = this.ball.targetPos.y;
            this.ball.z = 0;
            this.ball.state = BallState.LOOSE;
            if (this.pendingShot) return;
            // Intended receiver auto pickup if close
            const r = this.ball.intendedReceiver;
            if (r && Math.hypot(r.x - this.ball.x, r.y - this.ball.y) < 8.5) {
                // [공격 다변화: 크로스 다이렉트 헤더/발리 슈팅]
                if (this.ball.isCross && (r.position === 'FW' || r.position === 'MF') && Math.random() < 0.85) {
                    this.ball.isCross = false;
                    this.ball.isCutback = false;
                    const isHome = r.teamId === 'home';
                    const goalX = isHome ? 100 : 0;
                    this._attemptShoot(r, goalX);
                    const finishType = Math.random() < 0.5 ? '다이렉트 고공 헤더' : '환상적인 논스톱 발리';
                    this.eventsQueue.push({ type: 'shoot', player: r.name, desc: ` ${r.name}, 크로스를 받아 ${finishType} 슛!!` });
                    return;
                }
                // [공격 다변화: 컷백 다이렉트 논스톱 슈팅]
                if (this.ball.isCutback) {
                    this.ball.isCross = false;
                    this.ball.isCutback = false;
                    const isHome = r.teamId === 'home';
                    const goalX = isHome ? 100 : 0;
                    this._attemptShoot(r, goalX);
                    this.eventsQueue.push({ type: 'shoot', player: r.name, desc: ` ${r.name}, 컷백을 받아 지체 없이 논스톱 슈팅!!` });
                    return;
                }

                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = r;
                this.ball.intendedReceiver = null;
                this.ball.isCross = false; // 플래그 초기화
                this.ball.isCutback = false;
                this.ball.x = r.x; this.ball.y = r.y;
                this.ball.z = 0;
            }
        } else {
            const r = BS / d;
            this.ball.x += dx * r;
            this.ball.y += dy * r;
            // [FLR 이식] 3D 포물선 탄도학 (Parabolic Arc) 계산
            const totalD = this.ball.flightDist || 1;
            const curD = Math.hypot(this.ball.x - this.ball._flightOrigin.x, this.ball.y - this.ball._flightOrigin.y);
            const u = clamp(curD / totalD, 0, 1);
            const h = this.ball.maxHeight || 0;
            this.ball.z = Math.max(0, 4 * h * u * (1 - u));
            this._checkInFlightInterception();
        }
    }

    _checkInFlightInterception() {
        if (this.pendingShot) return;
        // [FLR 탄도학] 머리 위로 넘어가는 높은 포물선(z > 2.0) 롱패스/크로스는 지상 가로채기 불가
        if (this.ball.z > 2.0) return;
        const bx = this.ball.x, by = this.ball.y;
        const ox = this.ball._flightOrigin.x, oy = this.ball._flightOrigin.y;
        const tx = this.ball.targetPos.x, ty = this.ball.targetPos.y;
        this.players.forEach(p => {
            if (this.ball.lastOwner && p.teamId === this.ball.lastOwner.teamId) return;
            if (p._stealCooldown > 0) return;
            const db = Math.hypot(p.x - bx, p.y - by);
            if (db > 5.5) return;
            const flx = tx - ox, fly = ty - oy;
            const fL2 = flx * flx + fly * fly;
            let traj = 0;
            if (fL2 > 0.001) traj = clamp(((p.x - ox) * flx + (p.y - oy) * fly) / fL2, 0, 1);
            const nx = ox + traj * flx, ny = oy + traj * fly;
            const prox = Math.hypot(p.x - nx, p.y - ny);
            const ts = this.getEffectiveStat(p, 'tackle') || this.getEffectiveStat(p, 'defense');
            const ss = this.getEffectiveStat(p, 'speed');
            const pB = Math.max(0, (5.5 - prox) / 5.5);
            // [TUNED] Slightly increased interception probability
            const chance = 0.005 + ts / 3800 + ss / 5800 + pB * 0.030;
            if (Math.random() < chance) {
                this.ball.state = BallState.CONTROLLED; this.ball.owner = p;
                this.ball.intendedReceiver = null; this.ball.lastOwner = null;
                p._stealCooldown = 14;
                this.eventsQueue.push({ type: 'tackle', player: p.name, desc: `${p.name}, 날카로운 패스 차단!` });
                this._triggerTurnover(p.teamId);
            }
        });
    }

    _attemptTackle(tackler, carrier) {
        if (tackler._stealCooldown > 0) return false;
        const tackleStat = this.getEffectiveStat(tackler, 'tackle') || this.getEffectiveStat(tackler, 'defense');
        const dribbleStat = this.getEffectiveStat(carrier, 'dribble');
        const speedStat = this.getEffectiveStat(carrier, 'speed');
        
        // [선수 돌파 능력 버프] 태클 수치 vs (드리블 75% + 주력 25%) 대결
        const statDiff = tackleStat - (dribbleStat * 0.75 + speedStat * 0.25);
        let chance = 0.18 + statDiff * 0.004; // 기본 태클 확률 하향 조정 (돌파 성공률 버프)
        
        // 박스 안쪽(oppGoalX 기준 25 미만)에서는 페널티킥/파울 위험으로 수비수가 조심하므로 돌파 성공률 대폭 상승
        const oppGoalX = tackler.teamId === 'home' ? 0 : 100;
        if (Math.abs(carrier.x - oppGoalX) < 25) {
            chance -= 0.10;
        }
        // 캐리어가 가속 질주(burst) 중이면 돌파 관성으로 태클 회피력 추가
        if (carrier.burstTimer > 0) {
            chance -= 0.08;
        }
        
        if (Math.random() < clamp(chance, 0.04, 0.45)) {
            // 태클 성공
            this.ball.state = BallState.CONTROLLED;
            this.ball.owner = tackler;
            this.ball.lastOwner = null;
            this.ball.intendedReceiver = null;
            tackler._stealCooldown = 20;
            this.eventsQueue.push({ type: 'tackle', player: tackler.name, desc: ` ${tackler.name}, 깔끔한 태클로 공을 탈취합니다!` });
            this._triggerTurnover(tackler.teamId);
            return true;
        } else {
            // 태클 실패 (볼 캐리어가 화려하게 제쳐냄!)
            tackler._stealCooldown = 38; // 수비수 역동작 딜레이 부여
            carrier.burstTimer = 24; // 탈압박 가속 버스트 지속시간 증가
            
            // 능력치(드리블 70 이상)에 따라 개인기 연출 발생
            if (dribbleStat >= 70 && Math.random() < 0.55) {
                const skills = ['STEP_OVER', 'BODY_FEINT', 'ROULETTE', 'ELASTICO', 'LA_CROQUETA', 'MARSEILLE_TURN'];
                const skillId = skills[Math.floor(Math.random() * skills.length)];
                this.eventsQueue.push({
                    type: 'dribble',
                    player: carrier.name,
                    skillId: skillId,
                    desc: ` ${carrier.name}, 화려한 개인기로 수비를 완벽히 제쳐냅니다!`
                });
            }
            return false;
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  OFF-BALL AI V3 (TEMPLATE + TRIGGER BASED)
    // ─────────────────────────────────────────────────────────────
    _processAllOffBall() {
        let attacking = null;
        if (this.ball.owner) attacking = this.ball.owner.teamId;
        else if (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner) attacking = this.ball.lastOwner.teamId;
        const isLoose = !this.ball.owner && this.ball.state === BallState.LOOSE;
        let nearestH = null, nearestA = null, dH = 999, dA = 999;
        if (isLoose) {
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (p.teamId === 'home' && d < dH) { dH = d; nearestH = p; }
                if (p.teamId === 'away' && d < dA) { dA = d; nearestA = p; }
            });
        }
        let presser = null;
        if (this.ball.owner && attacking) {
            let mD = 999;
            this.players.forEach(p => {
                if (p.teamId === attacking) return;
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < mD) { mD = d; presser = p; }
            });
        }
        this.players.forEach(p => {
            if (p === this.ball.owner) return;
            if (p.position === 'GK') { this._gkOffBall(p); return; }

            const behavior = this.getRoleBehavior(p.role);
            const effSpd = this.getEffectiveStat(p, 'speed');
            const speedFactor = effSpd / 75;
            const isHome = p.teamId === 'home';
            const fwd = isHome ? 1 : -1;
            const oppHas = this.ball.owner && this.ball.owner.teamId !== p.teamId;
            const oppInFlight = this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner && this.ball.lastOwner.teamId !== p.teamId;
            const isDefending = oppHas || oppInFlight;
            const isAttacking = !isDefending && (p.teamId === attacking);

            let tx = p.x, ty = p.y, ms = 0.2 * clamp(speedFactor, 0.7, 1.5);

            if (isLoose) {
                const lines = this._getTeamBlockLines(p.teamId);
                const nr = (p === nearestH || p === nearestA);
                if (nr) { tx = this.ball.x; ty = this.ball.y; ms = 0.6; }
                else {
                    tx = p.position === 'FW' ? lines.fwX : (p.position === 'MF' ? lines.mfX : lines.dfX);
                    ty = p.slotY + (this.ball.y - p.slotY) * 0.12;
                    ms = 0.2;
                }
                this._physicsStep(p, tx, ty, ms);
                return;
            }

            if (this.ball.state === BallState.IN_FLIGHT && p === this.ball.intendedReceiver) {
                tx = this.ball.targetPos.x; ty = this.ball.targetPos.y; ms = 0.85;
                this._physicsStep(p, tx, ty, ms); return;
            }

            if (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner === p && p.position !== 'DF') {
                const lines = this._getTeamBlockLines(p.teamId);
                const chaseX = p.position === 'FW' ? lines.fwX - fwd * 3 : lines.mfX - fwd * 1;
                tx = isHome ? Math.min(p.x + 8, chaseX) : Math.max(p.x - 8, chaseX);
                ty = p.slotY + (this.ball.y - p.slotY) * 0.18;
                ms = 0.28;
                this._physicsStep(p, tx, ty, ms); return;
            }

            if (isAttacking) {
                //  V3: Template based movement!
                if (p.position === 'FW') this._offBallFW_V3(p, isHome, fwd, behavior, speedFactor);
                else if (p.position === 'MF') this._offBallMF_V3(p, isHome, fwd, behavior, speedFactor, attacking);
                else if (p.position === 'DF') this._offBallDF_V3(p, isHome, fwd, behavior, speedFactor, attacking);
                return;
            } else if (isDefending) {
                this._offBallDefend_V3(p, presser, isHome, speedFactor, ms, behavior);
                return;
            }
            this._physicsStep(p, tx, ty, ms);
        });
    }

    _gkOffBall(gk) {
        const isHome = gk.teamId === 'home';
        const homeX = gk.baseX || (isHome ? 5 : 95);
        gk.vx *= 0.3; gk.vy *= 0.3;
        gk.x += (homeX - gk.x) * 0.2 + gk.vx;
        gk.y += (clamp(50 + (this.ball.y - 50) * 0.08, 42, 58) - gk.y) * 0.2 + gk.vy;
    }

    // ═══════════════════════════════════════════════════════════════
    //  OFF-BALL FW V3 (trigger-based modes: shadow / burst / linkup)
    // ═══════════════════════════════════════════════════════════════
    _offBallFW_V3(p, isHome, fwd, bhv, sf) {
        const tid = p.teamId;
        const phase = this._phase[tid];
        const lines = this._getTeamBlockLines(tid);
        const oppDFs = this.players.filter(q => q.teamId !== tid && q.position === 'DF' && q.position !== 'GK');
        const teamFWs = this.players
            .filter(q => q.teamId === tid && q.position === 'FW' && q !== this.ball.owner)
            .slice()
            .sort((a, b) => {
                const ra = this.getRoleBehavior(a.role);
                const rb = this.getRoleBehavior(b.role);
                const runDiff = (rb.runBehind + rb.attackBias * 0.3) - (ra.runBehind + ra.attackBias * 0.3);
                if (Math.abs(runDiff) > 0.02) return runDiff;
                return Math.abs(a.slotY - this.ball.y) - Math.abs(b.slotY - this.ball.y);
            });
        const fwRank = Math.max(0, teamFWs.indexOf(p));
        const isPrimaryRunner = fwRank === 0;
        // Opponent defensive line x
        let defLineX = isHome ? (oppDFs.length ? Math.min(...oppDFs.map(q => q.x)) : 80) : (oppDFs.length ? Math.max(...oppDFs.map(q => q.x)) : 20);
        const offX = this._calcOffsideLineX(isHome);

        //  PHASE-BASED ABS_MIN: FW MUST NOT cluster in midfield!
        // (Fixes: V3 bug where both teams FW hung around x=45~46)
        let ABS_MIN;
        if (phase === 'building') {
            ABS_MIN = isHome ? 56 : 44;
        } else if (phase === 'progressing' || phase === 'counter') {
            ABS_MIN = isHome ? 60 : 40;
        } else {
            ABS_MIN = isHome ? 68 : 32;
        }
        //  ABS_MIN vs Offside Safe-Zone Mediation
        // Rule: if offside line is too deep (opp D-line dropped back), we still
        // don't want FW dropping below a midfield threshold. So we bound:
        //   home ABS_MIN ∈ [ midfieldThreshold=54 , min(phaseABS, offX-5) ]
        //   away ABS_MIN ∈ [ max(phaseABS, offX+5) , midfieldThreshold=46 ]
        // This guarantees FW stays at least 4 units in front of midfield line
        // while still respecting offside physics when possible.
        const MID_THRESH = isHome ? 54 : 46;
        const OFFSIDE_BOUND = isHome ? (offX - 5) : (offX + 5);
        ABS_MIN = isHome
            ? Math.max(Math.min(ABS_MIN, OFFSIDE_BOUND), MID_THRESH)
            : Math.min(Math.max(ABS_MIN, OFFSIDE_BOUND), MID_THRESH);

        //  BURST TRIGGER (when to run behind)
        if (p._fwMode !== 'burst' && this._fwBurstCooldown <= 0 && isPrimaryRunner) {
            const carriers = this.players.filter(q => q.teamId === tid && this.ball.owner === q);
            const carr = carriers[0];
            // [EXPANDED] Original zone: MF zone (x>62). Now also triggers when carrier is MF position
            // regardless of position — so FWs burst when MF picks up ball in central midfield
            const rightZone = carr && (
                (isHome && carr.x > 62 && carr.x < 80) || (!isHome && carr.x < 38 && carr.x > 20)
            );
            // [NEW] MF carrier zone: even from deep midfield, FW should make runs
            const mfCarrierZone = carr && carr.position === 'MF' && (
                (isHome && carr.x > 50) || (!isHome && carr.x < 50)
            );
            const burstBiasOk = bhv.runBehind > 0.45;
            const phaseOk = phase === 'progressing' || phase === 'finalThird' || phase === 'counter';
            const laneOpen = !this._numOpponentsAhead(p, 8, 16);
            const carrUnder = carr ? this._isUnderPressure(carr) : false;
            if (carr && (rightZone || mfCarrierZone) && burstBiasOk && phaseOk && (laneOpen || carrUnder)) {
                p._fwMode = 'burst';
                p.burstTimer = 32; // slightly longer when triggered by MF
                p._timer = 32;
                this._fwBurstCooldown = 8;
            }
        }
        if (this._fwBurstCooldown > 0) this._fwBurstCooldown--;

        //  LINKUP TRIGGER (when STUCK and behavior.linkup high)
        if (p._fwMode !== 'linkup' && p._fwMode !== 'burst' && this._fwLinkupCooldown <= 0) {
            const carr = this.ball.owner && this.ball.owner.teamId === tid ? this.ball.owner : null;
            const carrUnder = carr ? this._isUnderPressure(carr) : false;
            if ((this._isAttackStuck(tid) || carrUnder) && bhv.linkup >= 0.6 && !isPrimaryRunner) {
                p._fwMode = 'linkup';
                p._timer = 40;
                this._fwLinkupCooldown = 25;
            }
        }
        if (this._fwLinkupCooldown > 0) this._fwLinkupCooldown--;

        // Mode timeout
        if (p._timer <= 0 && p._fwMode !== 'shadow') { p._fwMode = 'shadow'; }

        let tx, ty, ms = 0.46 * clamp(sf, 0.82, 1.75);

        // ---- Range normalization helpers: ensure lo <= hi before clamp ----
        // (Fixes stuck tx when offside line dropped below ABS_MIN)
        const hh = (v, lo, hi) => { const L = Math.min(lo, hi), H = Math.max(lo, hi); return clamp(v, L, H); };
        const aa = (v, lo, hi) => { const L = Math.min(lo, hi), H = Math.max(lo, hi); return clamp(v, L, H); };

        const isBoxAttacking = phase === 'finalThird' || (isHome ? this.ball.x > 62 : this.ball.x < 38);
        const nearSign = this.ball.y < 50 ? -1 : 1;
        const isBallSide = (p.slotY < 50 && nearSign < 0) || (p.slotY >= 50 && nearSign > 0);

        if (isBoxAttacking) {
            // [FLR 이식 & 공격 버프] 파이널 서드 박스 침투 (Box-Wave Pattern)
            // 공격수들이 페널티 박스(x >= 83.5 / x <= 16.5) 안쪽으로 빠르고 저돌적으로 쇄도
            if (isPrimaryRunner) {
                // 니어 포스트 / 골문 앞 5~10야드 정면 공간으로 전력 쇄도 (피니시 최우선 타겟)
                tx = isHome ? hh(offX - 0.8, 89.5, 94.5) : aa(offX + 0.8, 5.5, 10.5);
                ty = clamp(50 + nearSign * 3.5, 43, 57);
                ms = 0.95 * clamp(sf, 0.9, 2.0);
            } else if (!isBallSide) {
                // 반대편(Far-side) 공격수: 파 포스트로 깊게 침투하여 크로스/세컨드볼 피니시
                tx = isHome ? hh(offX - 1.0, 88.5, 93.5) : aa(offX + 1.0, 6.5, 11.5);
                ty = nearSign < 0 ? 59 : 41;
                ms = 0.92 * clamp(sf, 0.9, 1.95);
            } else {
                // 볼 사이드 윙어/공격수: 측면 크로스 공급 또는 페널티 스팟 컷백 타겟 침투
                if (bhv.hugLine || Math.abs(p.slotY - 50) > 22) {
                    tx = isHome ? clamp(this.ball.x + 3, 84, 92) : clamp(this.ball.x - 3, 8, 16);
                    ty = p.slotY < 50 ? 12 : 88;
                    ms = 0.82 * clamp(sf, 0.85, 1.8);
                } else {
                    // 페널티 스팟 컷백/세컨드볼 피니시를 위한 트레일러 침투 (83.5~86.5 정면)
                    tx = isHome ? hh(offX - 2.5, 83.5, 86.5) : aa(offX + 2.5, 13.5, 16.5);
                    ty = clamp(50 + nearSign * 2.0, 46, 54);
                    ms = 0.90 * clamp(sf, 0.85, 1.9);
                }
            }
        } else if (p._fwMode === 'burst') {
            // Sprint behind defensive line, just before offside
            tx = isHome ? hh(defLineX + 12, 58, offX - 1.5)
                : aa(defLineX - 12, offX + 1.5, 42);
            const curve = Math.sin(p._timer * 0.35) * (this.getRoleBehavior(p.role).hugLine ? 3 : 8);
            ty = clamp(p.slotY + curve + (50 - p.slotY) * 0.15, p.slotY - 14, p.slotY + 14);
            if (this.getRoleBehavior(p.role).hugLine) ty = p.slotY < 50 ? 10 : 90;
            ms = 0.88 * clamp(sf, 0.9, 1.9);
        } else if (p._fwMode === 'linkup') {
            // Drop between midfield and defense to receive
            const linkBase = isPrimaryRunner ? lines.mfX + fwd * 8 : lines.mfX + fwd * 4;
            const drop = isHome ? Math.max(linkBase, defLineX - 18) : Math.min(linkBase, defLineX + 18);
            tx = isHome ? hh(drop, ABS_MIN - 4, 90) : aa(drop, 10, ABS_MIN + 4);
            ty = clamp(p.slotY * 0.55 + this.ball.y * 0.45, p.slotY - 12, p.slotY + 12);
            ms = 0.48 * clamp(sf, 0.75, 1.7);
        } else {
            // Shadow mode: DEFENSE LINE SHADOW (1-3 behind D line)
            let sLo, sHi;
            if (isHome) {
                sLo = ABS_MIN;
                sHi = Math.max(offX - 2, ABS_MIN);
                tx = hh(defLineX + 1, sLo, sHi);
            } else {
                sLo = Math.min(offX + 2, ABS_MIN);
                sHi = ABS_MIN;
                tx = aa(defLineX - 1, sLo, sHi);
            }
            const followW = 0.18;
            ty = clamp(p.slotY + (this.ball.y - 50) * followW, p.slotY - 10, p.slotY + 10);
            if (bhv.hugLine) ty = p.slotY < 50 ? 12 : 88;
            ms = 0.34 * clamp(sf, 0.7, 1.5);
        }

        // 빌드업/중원 전진 시에만 서포트 클램프 적용 (박스 침투 시에는 절대 억제하지 않음)
        if (!isBoxAttacking) {
            if (!isPrimaryRunner) {
                const supportX = lines.fwX - fwd * (bhv.linkup >= 0.6 ? 6 : 4);
                tx = isHome ? Math.min(tx, supportX) : Math.max(tx, supportX);
                ty = clamp(ty + (this.ball.y - p.slotY) * 0.12, p.slotY - 12, p.slotY + 12);
            } else {
                const leadX = lines.fwX + fwd * 4;
                tx = isHome ? Math.max(tx, leadX) : Math.min(tx, leadX);
            }
        }

        // ABSOLUTE FLOOR
        tx = isHome ? Math.max(tx, ABS_MIN) : Math.min(tx, ABS_MIN);
        tx = clamp(tx, 4, 96);
        ty = clamp(ty, 4, 96);
        this._physicsStep(p, tx, ty, ms);
    }

    // ═══════════════════════════════════════════════════════════════
    //  OFF-BALL MF V3 (SLOT FIXED! NO OVERSATURATION!)
    // ═══════════════════════════════════════════════════════════════
    _offBallMF_V3(p, isHome, fwd, bhv, sf, attackingTeamId) {
        const tid = p.teamId;
        const phase = this._phase[tid];
        const lines = this._getTeamBlockLines(tid);
        const isDM = ['DM', 'CDM', 'ANC'].includes(p.role);
        const isAM = ['AP', 'AM', 'SS', 'BBM', 'MEZ'].includes(p.role);
        const mates = this.players.filter(q => q.teamId === tid && q !== p);
        const advancedMF = this._getAdvancedSupportPlayer(tid, 'MF');

        let tx = lines.mfX;
        if (phase === 'building') tx += fwd * (isDM ? -6 : (isAM ? 2 : 0));
        else if (phase === 'progressing') tx += fwd * (isDM ? -2 : (isAM ? 6 : 2));
        else if (phase === 'finalThird') tx += fwd * (isDM ? 1 : (isAM ? 10 : 4));
        else tx += fwd * (isDM ? 0 : 5);
        if (lines.haveBall) {
            if (!isDM) tx += fwd * (isAM ? 4 : 3);
            if (phase === 'progressing' || phase === 'finalThird') tx += fwd * 2;
            if (advancedMF === p && !isDM) tx += fwd * (phase === 'building' ? 2 : 5);
        }

        //  MF HARD STOP: Must stay behind frontmost FW during buildup, but can reach box edge in finalThird
        const fws = mates.filter(q => q.position === 'FW');
        if (phase === 'finalThird') {
            const isWideMF = Math.abs(p.slotY - 50) > 20;
            const maxAllowed = isHome ? (isWideMF ? 92 : (isAM ? 85 : 80)) : (isWideMF ? 8 : (isAM ? 15 : 20));
            tx = isHome ? Math.min(tx, maxAllowed) : Math.max(tx, maxAllowed);
        } else if (fws.length) {
            const frontFW = isHome ? Math.max(...fws.map(q => q.x)) : Math.min(...fws.map(q => q.x));
            const limit = isHome ? frontFW - 5 : frontFW + 5;
            tx = isHome ? Math.min(tx, limit) : Math.max(tx, limit);
        } else {
            const mx = isHome ? 80 : 20;
            tx = isHome ? Math.min(tx, mx) : Math.max(tx, mx);
        }

        // DM: Always 5 behind highest CB
        const cbs = mates.filter(q => q.position === 'DF' && ['CD', 'BPD', 'NCB', 'LIB'].includes(q.role));
        if (isDM && cbs.length) {
            const hiCB = isHome ? Math.max(...cbs.map(q => q.x)) : Math.min(...cbs.map(q => q.x));
            tx = isHome ? Math.min(tx, hiCB + 7) : Math.max(tx, hiCB - 7);
        }

        //  Y: USE ASSIGNED SLOT! (no ball.y clustering!)
        let ty = p.slotY;  // <— THIS IS THE FIX! MF ALWAYS goes to its slot first!
        // Only the MF CLOSEST to ball's Y gets +-6 toward ball
        const teamMFs = this.players.filter(q => q.teamId === tid && q.position === 'MF');
        const closestToBallY = teamMFs.slice().sort((a, b) => Math.abs(a.slotY - this.ball.y) - Math.abs(b.slotY - this.ball.y))[0];
        if (closestToBallY === p && !bhv.hugLine) {
            ty += clamp(this.ball.y - ty, -8, 8);
            tx += fwd * (phase === 'building' ? 2 : 5);
        }
        if (bhv.hugLine) ty = p.slotY < 50 ? 12 : 88;

        // FB overlap trigger: if attacking FB overlap, inside MF slides out? (simpler: MEZ/CM slight shift)
        if (bhv.cutInside || p.role === 'MEZ') {
            ty = 50 + (p.slotY - 50) * 0.45;
        }

        // [NEW] Support run: if ball carrier is isolated (under pressure), nearby MF drifts closer
        // to offer a short pass outlet — prevents dangerous backpasses
        const ballOwner = this.ball.owner;
        if (ballOwner && ballOwner.teamId === tid && ballOwner !== p) {
            const carrierIsolated = this._isUnderPressure(ballOwner);
            const distToCarrier = Math.hypot(p.x - ballOwner.x, p.y - ballOwner.y);
            const noForwardFree = this._numOpponentsAhead(ballOwner, 8, 18) >= 3;
            if (carrierIsolated && noForwardFree && distToCarrier > 6 && distToCarrier < 22) {
                // Move to a support position: slightly behind & to the side of the carrier
                const supportX = isHome ? Math.min(ballOwner.x - 3, tx) : Math.max(ballOwner.x + 3, tx);
                const supportY = p.slotY + (ballOwner.y - p.slotY) * 0.5;
                tx = tx * 0.45 + supportX * 0.55;
                ty = ty * 0.55 + supportY * 0.45;
            }
        }

        // [신규] 측면 돌파 시 컷백 타겟 침투 (MF - 특히 공격형 미드필더 AM, SS 등)
        let ms = 0.38 * clamp(sf, 0.7, 1.6);
        const carr = this.ball.owner && this.ball.owner.teamId === tid ? this.ball.owner : null;
        const isWingerCrossSituation = carr && Math.abs(carr.y - 50) > 22 && (isHome ? carr.x > 75 : carr.x < 25);
        if (isWingerCrossSituation && (isAM || p.role === 'CM')) {
            // 박스 아크 서클 정면 부근(x: 82~85, y: 46~54)으로 쇄도하여 컷백 및 세컨볼 논스톱 슈팅 준비
            const cutbackTx = isHome ? 83.5 : 16.5;
            const cutbackTy = clamp(50 + (carr.y < 50 ? -3 : 3), 46, 54);
            tx = (tx * 0.3) + (cutbackTx * 0.7);
            ty = (ty * 0.3) + (cutbackTy * 0.7);
            ms = 0.85 * clamp(sf, 0.85, 1.9); // 침투 가속!
        }

        tx = clamp(tx, 4, 96);
        ty = clamp(ty, 4, 96);
        this._physicsStep(p, tx, ty, ms);
    }

    // ═══════════════════════════════════════════════════════════════
    //  OFF-BALL DF V3 (compact block + FB overlap state machine)
    // ═══════════════════════════════════════════════════════════════
    _offBallDF_V3(p, isHome, fwd, bhv, sf, attackingId) {
        const tid = p.teamId;
        const phase = this._phase[tid];
        const lines = this._getTeamBlockLines(tid);
        const isCB = ['CD', 'BPD', 'NCB', 'LIB'].includes(p.role);
        const isFB = ['FB', 'WB', 'CWB', 'IWB'].includes(p.role);
        const mates = this.players.filter(q => q.teamId === tid && q !== p);
        const teamMFs = mates.filter(q => q.position === 'MF');
        const mfFront = teamMFs.length
            ? (isHome ? Math.max(...teamMFs.map(q => q.x)) : Math.min(...teamMFs.map(q => q.x)))
            : (isHome ? 45 : 55);

        // FB state choice: deterministic by side/phase instead of random.
        if (isFB) {
            const sameSide = (p.slotY < 50 && this.ball.y < 45) || (p.slotY > 50 && this.ball.y > 55);
            // [FIX] Coordinate both FBs: if the OTHER FB is already overlapping, this one holds back
            // Prevents the "one FB up, one FB down"asymmetric look
            const otherFB = mates.find(q => q.position === 'DF' && ['FB', 'WB', 'CWB', 'IWB'].includes(q.role));
            const otherOverlapping = otherFB && (otherFB._fbMode === 'overlap' || otherFB._fbMode === 'underlap');
            if (phase === 'building') p._fbMode = 'hold';
            else if (otherOverlapping) p._fbMode = 'hold'; // [NEW] If partner FB is up, stay back
            else if (phase === 'finalThird' && sameSide && bhv.attackBias >= 0.5) p._fbMode = 'overlap';
            else if (phase === 'progressing' && sameSide && (bhv.cutInside || p.role === 'IWB')) p._fbMode = 'underlap';
            else if (phase === 'progressing' && sameSide) p._fbMode = 'overlap';
            else p._fbMode = 'hold';
        }

        let tx, ty;
        if (isCB) {
            tx = lines.dfX + fwd * (phase === 'building' ? -2 : 0);
            const mfCap = isHome ? mfFront - 7 : mfFront + 7;
            tx = isHome ? Math.min(tx, mfCap) : Math.max(tx, mfCap);
            tx = clamp(tx, isHome ? 8 : 20, isHome ? 80 : 92);
            // CB 횡방향 고유 레인 고정 (LCB: 36~46, RCB: 54~64)
            const isLeftCB = p.slotY < 50;
            ty = isLeftCB ? clamp(p.slotY, 36, 46) : clamp(p.slotY, 54, 64);

            // Keep 14-22 vertical gap from other CB
            const otherCBs = mates.filter(q => q.position === 'DF' && ['CD', 'BPD', 'NCB', 'LIB'].includes(q.role));
            for (const o of otherCBs) {
                const dY = ty - o.y; const a = Math.abs(dY); const s = dY >= 0 ? 1 : -1;
                if (a < 14) ty = o.y + s * 14;
            }
            // [TUNED] CB return speed increased so they can run back faster than FBs
            const isRetreating = isHome ? (tx < p.x - 2) : (tx > p.x + 2);
            const cbSpd = isRetreating ? 0.45 : 0.35;
            this._physicsStep(p, tx, ty, cbSpd * clamp(sf, 0.7, 1.5)); return;
        }
        if (isFB) {
            // Y: Keep EXTREME WIDE (never center!)
            ty = p.slotY < 50 ? 12 : 88;
            if (p._fbMode === 'underlap') ty = p.slotY < 50 ? 28 : 72;
            let xShift = 0;
            if (phase === 'building') xShift = 2;
            else if (phase === 'progressing') xShift = p._fbMode === 'hold' ? 6 : (p._fbMode === 'overlap' ? 12 : 10);
            else if (phase === 'finalThird') xShift = p._fbMode === 'hold' ? 6 : (p._fbMode === 'overlap' ? 14 : 10);
            else xShift = 6;
            tx = lines.dfX + fwd * xShift;

            // [FLR 이식: 풀백 오버랩 한계선] 공격 시 풀백은 절대 볼보다 앞서거나 엔드라인(78선 초과)까지 혼자 치고 올라가지 않음!
            const maxAdvFB = isHome ? Math.min(this.ball.x - 2, 78) : Math.max(this.ball.x + 2, 22);
            if (p._fbMode === 'overlap') {
                tx = isHome ? Math.min(tx, maxAdvFB) : Math.max(tx, maxAdvFB);
            } else {
                // 반대편 홀드 풀백은 레스트 디펜스(수비 전환 대비) 위치 유지
                const restDefX = lines.dfX + fwd * 4;
                tx = isHome ? Math.min(tx, restDefX) : Math.max(tx, restDefX);
            }
            tx = clamp(tx, 8, 92);
            const ms = (p._fbMode === 'overlap' ? 0.35 : 0.25) * clamp(sf, 0.65, 1.25);
            this._physicsStep(p, tx, ty, ms); return;
        }
        // Fallback
        this._physicsStep(p, p.baseX, p.slotY, 0.3);
    }

    // ═══════════════════════════════════════════════════════════════
    //  OFF-BALL DEFEND V3 (zone-first + controlled aggro)
    // ═══════════════════════════════════════════════════════════════
    _offBallDefend_V3(p, presser, isHome, sf, ms, bhv) {
        const tid = p.teamId;
        const fwd = isHome ? 1 : -1;
        const lines = this._getTeamBlockLines(tid);
        const dt = gameData.deepTactics || {};
        const profile = this.getTacticProfile(tid);
        // 전술별 압박 성향을 세부설정에 곱연산으로 반영
        let pressInt = dt.pressIntensity || 'mid';
        if (profile.press > 1.05 && pressInt !== 'high') pressInt = 'high';
        else if (profile.press < 0.45 && pressInt !== 'low') pressInt = 'low';
        const ballX = this.ball.x, ballY = this.ball.y;
        const inOwnThird = isHome ? ballX < 33 : ballX > 67;
        const dBall = Math.hypot(p.x - ballX, p.y - ballY);
        const pressIsMe = (presser === p);
        const owner = this.ball.owner;

        if (owner && owner.teamId !== tid && p._stealCooldown <= 0) {
            // [FLR 이식: Single Presser Rule]
            // 전담 압박자(pressIsMe)만 적극적 태클을 시도하고, 2차 수비수(커버/스크린)는 오직 초근접 충돌(1.6) 시에만 시도.
            // 7명이 동시에 몰려들어 태클을 난사하는 빗장 수비 떼태클을 원천 방지!
            const canTackle = pressIsMe ? (dBall < 3.2) : (dBall < 1.6);
            if (canTackle && this._attemptTackle(p, owner)) return;
        }

        // 1) FW DEFENSE (공격수 수비 시 하프라인 선까지 천천히 내려와 대기)
        if (p.position === 'FW') {
            p.burstTimer = 0; p._fwMode = 'shadow';
            const isCentralST = ['ST', 'CF', 'AF', 'P', 'TM', 'DLF'].includes(p.role);
            // 수비 시 하프라인(48~52) 부근까지 천천히 복귀하여 대형 유지 및 역습 준비
            const baseFWX = isCentralST ? (lines.fwX + fwd * 2) : lines.fwX;
            let tx = isHome ? clamp(baseFWX, 48, 65) : clamp(baseFWX, 35, 52);
            let ty = p.slotY;
            let s = 0.13; // 천천히 조깅하듯 하프라인 선까지 복귀

            // 상대 진영에서 볼이 가까울 때만 전방 압박
            const ballInOppHalf = isHome ? ballX > 50 : ballX < 50;
            if (pressInt === 'high' && ballInOppHalf && dBall < 14 && Math.random() < (bhv.pressBias || 0.5) * 0.7) {
                tx = ballX; ty = ballY; s = 0.45;
            }
            this._physicsStep(p, tx, ty, s);
            return;
        }

        // 2) MF DEFENSE (FLR 이식: 미드필더는 박스 앞 아크로 깊숙이 내려와 수비벽 형성, 수비 전환 시 전력질주)
        if (p.position === 'MF') {
            const isDM = ['DM', 'BWM', 'A', 'HB', 'DLP'].includes(p.role);
            let tx = lines.mfX;
            if (isDM) tx -= fwd * 3; // 수비형 미드필더는 센터백 바로 앞(22선)까지 하강
            let ty = p.slotY;

            const ballInOurHalf = isHome ? ballX < 52 : ballX > 48;
            // 우리 진영 수비 시 미드필더는 전력 질주로 복귀 (ms = 0.65)
            let ms = (ballInOurHalf ? 0.65 : 0.45) * clamp(sf, 0.8, 1.6);

            // 볼 캐리어와 가까우면 즉각 볼 탈환 도전
            if (pressIsMe && dBall < 16) {
                tx = ballX; ty = ballY; ms = 0.70;
            } else {
                // 볼 위치에 맞춰 패스 길목 차단 (좌우 압축)
                ty += clamp((ballY - ty) * 0.4, -10, 10);
            }
            this._physicsStep(p, clamp(tx, 4, 96), clamp(ty, 4, 96), ms);
            return;
        }

        // 3) DF DEFENSE (FLR 이식: 백포 라인 일체화 + 옹기종기 뭉침 및 엔드라인 급발진 완전 제거)
        if (p.position === 'DF') {
            const isCB = ['CD', 'BPD', 'NCB', 'LIB'].includes(p.role);
            const isFB_role = ['FB', 'WB', 'CWB', 'IWB'].includes(p.role);
            const tidDFs = this.players.filter(q => q.teamId === tid && q.position === 'DF');
            let tx = lines.dfX;
            // 풀백은 센터백 라인보다 1.5 유닛만 앞서며 동일 수비 블록 형성 (FLR: line + 1.1)
            if (isFB_role) tx += fwd * 1.5;
            let ty = p.slotY;
            ms = 0.42 * clamp(sf, 0.7, 1.6);

            if (isCB) {
                const isLeftCB = p.slotY < 50;
                // CB: defend line first, only step when ball enters CB corridor.
                const centralThreat = Math.abs(ballY - p.slotY) < 14 || Math.abs(ballY - 50) < 10;
                if (inOwnThird && dBall < 9 && centralThreat && pressIsMe) {
                    const stepX = isHome ? Math.min(ballX + 1.0, lines.dfX + 2.0) : Math.max(ballX - 1.0, lines.dfX - 2.0);
                    tx = stepX; ty += clamp(ballY - ty, -3, 3); ms = 0.48;
                } else {
                    // Mark nearest opposite FW: 좌/우 CB가 각자의 담당 구역 공격수만 마킹하여 옹기종기 뭉침 원천 방지
                    const oppFW = this._findMarkTargetForDF(p, 'FW');
                    if (oppFW) {
                        const markW = clamp(0.35 + (inOwnThird ? 0.2 : 0), 0.2, 0.55);
                        ty = p.slotY * (1 - markW) + oppFW.y * markW;
                        const markX = isHome ? (oppFW.x - 2) : (oppFW.x + 2);
                        tx = isHome ? clamp(markX, lines.dfX - 2, lines.dfX + 2.0)
                                    : clamp(markX, lines.dfX - 2.0, lines.dfX + 2);
                    }
                }
                // 좌/우 CB의 고유 횡방향 구역 고정 (LCB: 34~46, RCB: 54~66)
                ty = isLeftCB ? clamp(ty, 34, 46) : clamp(ty, 54, 66);

                // Keep CB gap (최소 15 이상 유지하여 옹기종기 겹침 방지)
                const otherCB = tidDFs.filter(q => q !== p && ['CD', 'BPD', 'NCB', 'LIB'].includes(q.role));
                for (const o of otherCB) {
                    const dY = ty - o.y; const a = Math.abs(dY); const s = dY >= 0 ? 1 : -1;
                    if (a < 15) ty = o.y + s * 15;
                }
            } else if (isFB_role) {
                // FB: [급발진 방지] 우리 진영(inOwnThird)에서만, 볼이 자기 측면 근처일 때만 제한적 압박
                const sameSide = (p.slotY < 50 && ballY < 42) || (p.slotY > 50 && ballY > 58);
                const shouldChase = sameSide && inOwnThird && (pressIsMe || dBall < 7.5);
                if (shouldChase) {
                    // 수비 라인(lines.dfX)에서 최대 +-2.5 범위 내에서만 반응 (적 진영 엔드라인으로 급발진 절대 방지!)
                    tx = isHome ? clamp(ballX, lines.dfX - 1.5, lines.dfX + 2.5)
                                : clamp(ballX, lines.dfX - 2.5, lines.dfX + 1.5);
                    ty = clamp(ballY, p.slotY - 8, p.slotY + 8);
                    ms = 0.50;
                } else {
                    // FLR 채널 홀드 및 약측 턱인 (FB_WEAK_SIDE_TUCK):
                    // 볼이 반대편에 있으면 약간 좁혀서(20/80) 뒷공간 커버, 자기 쪽이면 터치라인 채널(12/88) 홀드
                    if (sameSide) {
                        ty = p.slotY < 50 ? 12 : 88;
                    } else {
                        ty = p.slotY < 50 ? 20 : 80;
                    }
                }
                // 풀백 측면 가드 클램프
                ty = clamp(ty, p.slotY < 50 ? 8 : 74, p.slotY < 50 ? 26 : 92);
            }

            this._physicsStep(p, clamp(tx, 2, 90), clamp(ty, 3, 97), ms);
            return;
        }
    }

    _findMarkTargetForDF(p, kind) {
        const opps = this.players.filter(q => q.teamId !== p.teamId && q.position !== 'GK');
        if (kind === 'FW') {
            const isLeft = p.slotY < 50;
            // 좌측 CB는 y <= 52, 우측 CB는 y >= 48의 공격수만 마킹하여 동일 대상 중복 마킹 방지
            return opps.filter(o => o.position === 'FW' && (isLeft ? o.y <= 52 : o.y >= 48))
                .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0] || null;
        } else {
            // wide
            return opps.filter(o =>
                ((p.slotY < 50 && o.y < 35) || (p.slotY > 50 && o.y > 65)) &&
                (o.position === 'FW' || o.position === 'MF')
            ).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0] || null;
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  PHYSICS + COLLISION V3 (MINIMAL CLAMPS, SMOOTH)
    // ─────────────────────────────────────────────────────────────
    _physicsStep(p, desiredX, desiredY, accel) {
        const accelEff = clamp(accel, 0.1, 1.8);
        const dx = clamp(desiredX - p.x, -16, 16);
        const dy = clamp(desiredY - p.y, -14, 14);
        const dvx = dx * accelEff * 0.065;
        const dvy = dy * accelEff * 0.065;
        p.vx = p.vx * 0.68 + dvx;
        p.vy = p.vy * 0.68 + dvy;
        // [FLR 물리 비율 이식] 볼 속도(7~11) 대비 인간 최고 속도(1.1~1.8) 현실적 밸런싱
        // 패스/크로스 비행 중 선수가 반대편 박스까지 달려가는 비현실적 축지법 완전 방지
        const maxSpd = 1.05 + accelEff * 0.75;
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > maxSpd) {
            const s = maxSpd / (spd || 1);
            p.vx *= s;
            p.vy *= s;
        }
        p.x += p.vx;
        p.y += p.vy;
        // ONLY clamp for PITCH BOUNDARIES. Position band enforcement done via desiredX only!
        if (p.x < 2) { p.x = 2; if (p.vx < 0) p.vx *= 0.25; }
        if (p.x > 98) { p.x = 98; if (p.vx > 0) p.vx *= 0.25; }
        if (p.y < 2) { p.y = 2; if (p.vy < 0) p.vy *= 0.25; }
        if (p.y > 98) { p.y = 98; if (p.vy > 0) p.vy *= 0.25; }
    }

    _resolveTeammateCollisions() {
        // Pair-wise soft repulsion (prevents all stacking / oversaturation)
        const MIN = 4.8;
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                const a = this.players[i], b = this.players[j];
                if (a.teamId !== b.teamId) continue;
                const dx = b.x - a.x, dy = b.y - a.y;
                const d = Math.hypot(dx, dy);
                if (d < MIN && d > 0.01) {
                    const overlap = MIN - d;
                    const nx = dx / d, ny = dy / d;
                    // Push apart — Y preferred to keep X structure
                    a.x -= nx * overlap * 0.3;
                    a.y -= ny * overlap * 0.7;
                    b.x += nx * overlap * 0.3;
                    b.y += ny * overlap * 0.7;
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  DEFENSIVE LINES + OFFSIDE (SMOOTH)
    // ─────────────────────────────────────────────────────────────
    _adjustDefensiveLines() {
        // Defensive line height enforcement for CBs: keep tight band
        for (const tid of ['home', 'away']) {
            const cbs = this.players.filter(p => p.teamId === tid && p.position === 'DF' && ['CD', 'BPD', 'NCB', 'LIB'].includes(p.role));
            if (cbs.length < 2) continue;
            const xs = cbs.map(q => q.x);
            const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
            const maxDev = 6; // CBs max 6 X apart
            const lines = this._getTeamBlockLines(tid);
            for (const cb of cbs) {
                if (Math.abs(cb.x - mean) > maxDev) {
                    // gentle pull toward mean (no hard teleport!)
                    cb.x += (mean - cb.x) * 0.05;
                }
                if (!lines.haveBall) {
                    // Defensive retreat sync: CBs must recover with the line, not hang high
                    cb.x += (lines.dfX - cb.x) * 0.08;
                }
            }
            // [FLR 이식] 옹기종기 뭉침 방지: CB 간 최소 횡방향 간격(16) 강제
            cbs.sort((a, b) => a.y - b.y);
            const cb1 = cbs[0], cb2 = cbs[1];
            const dy = cb2.y - cb1.y;
            if (dy < 16) {
                const push = (16 - dy) * 0.5;
                cb1.y -= push * 0.15;
                cb2.y += push * 0.15;
            }
        }
    }

    _calcOffsideLineX(isHomeFW) {
        const opp = isHomeFW ? 'away' : 'home';
        //  DEFENDERS-ONLY OFFSIDE LINE (realistic + trackback bug immune)
        // FIFA rule = 2nd-to-last player including GK.
        // We use DF + GK pool only: this matches reality because forward players
        // pressing high should NOT artificially flatten the offside trap line.
        // This also removes the offside distortion caused by lazy FWs stuck in midfield.
        const defs = this.players.filter(p =>
            p.teamId === opp && (p.position === 'GK' || p.position === 'DF')
        );
        // If defensive pool too small (e.g. red cards), fall back to all outfield + GK
        let pool;
        if (defs.length >= 2) {
            pool = defs;
        } else {
            pool = this.players.filter(p => p.teamId === opp);
        }
        if (pool.length < 2) return isHomeFW ? 95 : 5;
        // 상대 골문으로부터의 거리 순으로 정렬: 
        // Home FW는 골문(x=100)에 가까운 순(내림차순 b-a), Away FW는 골문(x=0)에 가까운 순(오름차순 a-b)
        const xs = pool.map(p => p.x).slice().sort((a, b) => isHomeFW ? b - a : a - b);
        const secondLastDef = xs[1];
        // [FIFA 규칙 & FLR 이식] 공이 수비수보다 골문에 더 가까울 때는 공의 위치가 오프사이드 기준선이 됨
        // (볼 캐리어가 수비라인을 뚫고 들어갔을 때 뒤따르는 동료가 억울하게 오프사이드로 끌려나오는 현상 방지)
        return isHomeFW ? Math.max(secondLastDef, this.ball.x) : Math.min(secondLastDef, this.ball.x);
    }

    _enforceAllOffside() {
        for (const p of this.players) {
            if (p.position !== 'FW') continue;
            const isHomeFW = p.teamId === 'home';
            const lim = this._calcOffsideLineX(isHomeFW);
            const bad = isHomeFW ? p.x > lim : p.x < lim;
            if (bad) {
                const t = isHomeFW ? lim - 1.5 : lim + 1.5;
                // SMOOTH: accelerate toward line, no teleport!
                p.vx = p.vx * 0.35 + (t - p.x) * 0.28;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  CELEBRATION + MISC
    // ─────────────────────────────────────────────────────────────
    _processCelebration() {
        if (!this.celebrationActor) return;
        const a = this.celebrationActor, t = this.celebrationTarget;
        const tx = t ? t.x : 50, ty = t ? t.y : 50;
        this.celebrationState = (this.celebrationState || 0) + 1;
        
        this.players.forEach((p, i) => {
            if (p.teamId === a.teamId) {
                if (p === a) {
                    if (this.celebrationType === 'run_around') {
                        const phase = this.celebrationState;
                        let targetX = 50, targetY = 50;
                        if (phase < 8) { targetX = p.teamId === 'home' ? 95 : 5; targetY = 10; }
                        else if (phase < 16) { targetX = 50; targetY = 15; }
                        else { targetX = 50; targetY = 50; }
                        this._physicsStep(p, targetX, targetY, 0.95);
                    } else if (this.celebrationType === 'siu') {
                        if (this.celebrationState < 12) {
                            this._physicsStep(p, tx, ty, 0.95);
                        } else if (this.celebrationState < 20) {
                            const ang = this.celebrationState * 0.75;
                            p.x += Math.cos(ang) * 1.5; p.y += Math.sin(ang) * 1.5;
                        } else {
                            p.vx = 0; p.vy = 0;
                        }
                    } else if (this.celebrationType === 'center_slide' || this.celebrationType === 'corner_slide' || this.celebrationType === 'inside_goal') {
                        if (this.celebrationState < 12) this._physicsStep(p, tx, ty, 1.0);
                        else { p.x += (tx - p.x) * 0.1; p.y += (ty - p.y) * 0.1; }
                    } else {
                        this._physicsStep(p, tx, ty, 0.85);
                    }
                } else if (p.position === 'GK') {
                    // GK stays back and just jumps
                    if (this.celebrationType !== 'quick_restart') {
                        if (this.celebrationState % 8 < 4) p.y -= 0.6; else p.y += 0.6;
                        p.x += (p.baseX - p.x) * 0.15;
                    } else {
                        this._physicsStep(p, p.baseX, p.slotY, 0.5);
                    }
                } else {
                    if (this.celebrationType === 'dance') {
                        if (i % 2 === 0 && i < 10) {
                            const r = 4;
                            const ang = (i * Math.PI) / 3 + this.celebrationState * 0.2;
                            this._physicsStep(p, clamp(tx + Math.cos(ang) * r, 4, 96), clamp(ty + Math.sin(ang) * r, 4, 96), 0.75);
                        } else {
                            const r = 10 + (i % 3) * 4;
                            this._physicsStep(p, clamp(tx + Math.cos(i) * r, 4, 96), clamp(ty + Math.sin(i) * r, 4, 96), 0.4);
                        }
                    } else if (this.celebrationType === 'manager_hug') {
                        if (i % 3 === 0) {
                            const r = 4 + (i%3)*2;
                            this._physicsStep(p, clamp(tx + Math.random()*r - r/2, 4, 96), clamp(ty + Math.random()*r, 4, 96), 0.7);
                        } else {
                            this._physicsStep(p, p.baseX, p.slotY, 0.35);
                        }
                    } else if (this.celebrationType === 'siu') {
                         if (this.celebrationState < 18) {
                            const r = 8 + (i%5)*2;
                            this._physicsStep(p, clamp(a.x + Math.cos(i) * r, 4, 96), clamp(a.y + Math.sin(i) * r, 4, 96), 0.65);
                         } else {
                            if (this.celebrationState % 8 < 4) p.y -= 1; else p.y += 1;
                         }
                    } else if (this.celebrationType === 'quick_restart') {
                         this._physicsStep(p, p.baseX, p.slotY, 0.55);
                    } else {
                        const targetX = (this.celebrationState > 10) ? a.x : tx;
                        const targetY = (this.celebrationState > 10) ? a.y : ty;
                        const r = 6 + Math.random() * 5;
                        const ang = Math.random() * Math.PI * 2;
                        this._physicsStep(p, clamp(targetX + Math.cos(ang) * r, 4, 96), clamp(targetY + Math.sin(ang) * r, 4, 96), 0.65);
                    }
                }
            } else {
                this._physicsStep(p, p.baseX, p.slotY, 0.35);
            }
        });
    }

    // [신규] 세리머니 즉시 스킵 (화면 클릭 또는 조작 시 지체없이 경기 속개)
    skipCelebration() {
        if (this.celebrationTimer > 0) {
            this.celebrationTimer = 0;
            this.celebrationActor = null;
            this.celebrationTarget = null;
            this.celebrationType = null;
            const next = this.lastScorerTeam === 'home' ? 'away' : 'home';
            this.resetPositions(next);
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  COMPATIBILITY API (tacticSystem.js hooks)
    // ─────────────────────────────────────────────────────────────
    recalculateStaminaOnSub(player) {
        if (!player) return;
        const targetName = typeof player === 'string' ? player : (player.name || player.id);
        const simP = this.players.find(p => p.id === targetName || p.name === targetName);
        if (simP) {
            simP.stamina = (typeof player === 'object' && player.condition !== undefined) ? player.condition : 100;
        }
    }

    applyTacticBoost(userTeamId, boostPercent) {
        this.players.forEach(p => {
            const factor = p.teamId === userTeamId ? (1 + boostPercent) : (1 - boostPercent * 0.6);
            for (const k in p.stats) {
                if (typeof p.stats[k] === 'number') p.stats[k] *= factor;
            }
        });
    }

    startExitAnimation(winner) {
        this.exitAnimActive = true;
        this.exitAnimTicks = 0;
        this.exitAnimDone = false;
        this.exitWinner = winner;
        
        this.exitGroups = [];
        let pool = [...this.players];
        pool.sort(() => Math.random() - 0.5);
        while(pool.length > 0) {
            const groupSize = Math.floor(Math.random() * 3) + 3;
            const groupPlayers = pool.splice(0, groupSize);
            let cx = 0, cy = 0;
            groupPlayers.forEach(p => { cx += p.x; cy += p.y; });
            cx /= groupPlayers.length; cy /= groupPlayers.length;
            this.exitGroups.push({ players: groupPlayers, cx, cy, tx: 50 + (Math.random() * 10 - 5) });
        }
    }

    updatePostMatch() {
        if (!this.exitAnimActive) return this.getSnapshot();
        this.exitAnimTicks++;
        
        this.exitGroups.forEach(g => {
            g.cx += (g.tx - g.cx) * 0.05;
            g.cy += (100 - g.cy) * 0.02;
            g.players.forEach((p, idx) => {
                const ang = (idx * Math.PI * 2) / g.players.length + this.exitAnimTicks * 0.02;
                const r = 4;
                const ptx = g.cx + Math.cos(ang) * r;
                const pty = g.cy + Math.sin(ang) * r;
                p.x += (ptx - p.x) * 0.1;
                p.y += (pty - p.y) * 0.1;
            });
        });
        
        if (this.exitAnimTicks >= 150) this.exitAnimDone = true;
        return this.getSnapshot();
    }

    isExitAnimationDone() {
        return this.exitAnimDone;
    }

}

// =============================================================================
// [SECTION END]  EXPORTS (window globals — required compatibility!)
// =============================================================================

if (typeof window !== 'undefined') {
    window.RealSoccerEngine = RealSoccerEngine;
    window.DeepTacticManager = DeepTacticManager;
    window.BallState = BallState;
    window.SimBall = SimBall;
    window.SimPlayer = SimPlayer;
}
