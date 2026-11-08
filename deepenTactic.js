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
    AF: { runBehind: 1.0, linkup: 0.2, hugLine: 0.0, pressBias: 0.9, attackBias: 1.0, defenseBias: 0.1, cutInside: false, dropDeep: false, lateRun: false, overlap: false },
    CF: { runBehind: 0.7, linkup: 0.7, hugLine: 0.0, pressBias: 0.6, attackBias: 0.9, defenseBias: 0.2, cutInside: false, dropDeep: false, lateRun: false, overlap: false },
    P:  { runBehind: 1.0, linkup: 0.05, hugLine: 0.0, pressBias: 0.8, attackBias: 1.0, defenseBias: 0.0, cutInside: false, dropDeep: false, lateRun: false, overlap: false },
    F9: { runBehind: 0.25, linkup: 1.0, hugLine: 0.0, pressBias: 0.5, attackBias: 0.9, defenseBias: 0.3, cutInside: false, dropDeep: true, lateRun: false, overlap: false, throughBallBias: 1.0 },
    TM: { runBehind: 0.2, linkup: 1.0, hugLine: 0.0, pressBias: 0.4, attackBias: 0.85, defenseBias: 0.2, cutInside: false, dropDeep: true, postPlay: true, overlap: false },
    SS: { runBehind: 0.9, linkup: 0.4, hugLine: 0.1, pressBias: 0.7, attackBias: 1.0, defenseBias: 0.15, cutInside: true, dropDeep: false, lateRun: true, overlap: false },
    PF: { runBehind: 0.6, linkup: 0.6, hugLine: 0.0, pressBias: 1.0, attackBias: 0.9, defenseBias: 0.5, cutInside: false, dropDeep: false, lateRun: false, overlap: false },
    RD: { runBehind: 0.8, linkup: 0.4, hugLine: 0.0, pressBias: 0.7, attackBias: 0.95, defenseBias: 0.2, cutInside: true, dropDeep: false, lateRun: true, overlap: false },
    W:  { runBehind: 0.8, linkup: 0.1, hugLine: 1.0, pressBias: 0.5, attackBias: 0.9, defenseBias: 0.2, cutInside: false, dropDeep: false, crossBias: 1.0, overlap: false },
    IF: { runBehind: 0.85, linkup: 0.3, hugLine: 0.1, pressBias: 0.6, attackBias: 0.95, defenseBias: 0.2, cutInside: true, dropDeep: false, longShotBias: 0.8, overlap: false },
    IW: { runBehind: 0.75, linkup: 0.4, hugLine: 0.15, pressBias: 0.6, attackBias: 0.9, defenseBias: 0.3, cutInside: true, dropDeep: false, longShotBias: 0.8, overlap: false },
    WP: { runBehind: 0.4, linkup: 0.8, hugLine: 0.8, pressBias: 0.5, attackBias: 0.85, defenseBias: 0.3, cutInside: false, dropDeep: false, throughBallBias: 0.9, overlap: false },
    DLF: { runBehind: 0.3, linkup: 0.95, hugLine: 0.0, pressBias: 0.4, attackBias: 0.85, defenseBias: 0.3, cutInside: false, dropDeep: true, overlap: false },
    // Midfielders
    AP:  { runBehind: 0.6, linkup: 0.7, hugLine: 0.0, pressBias: 0.5, attackBias: 0.95, defenseBias: 0.15, cutInside: false, dropDeep: false, lateRun: true, longShotBias: 0.9, throughBallBias: 1.0 },
    AM:  { runBehind: 0.7, linkup: 0.6, hugLine: 0.0, pressBias: 0.5, attackBias: 0.95, defenseBias: 0.15, cutInside: false, dropDeep: false, lateRun: true, longShotBias: 0.85 },
    BBM: { runBehind: 0.85, linkup: 0.5, hugLine: 0.0, pressBias: 0.9, attackBias: 0.9, defenseBias: 0.7, cutInside: false, dropDeep: false, lateRun: true, boxToBox: true },
    MEZ: { runBehind: 0.8, linkup: 0.5, hugLine: 0.4, pressBias: 0.7, attackBias: 0.9, defenseBias: 0.4, cutInside: true, dropDeep: false, lateRun: true },
    CAR: { runBehind: 0.4, linkup: 0.7, hugLine: 0.3, pressBias: 0.8, attackBias: 0.8, defenseBias: 0.6, cutInside: false, dropDeep: false, lateRun: false },
    REG: { runBehind: 0.2, linkup: 0.85, hugLine: 0.0, pressBias: 0.5, attackBias: 0.75, defenseBias: 0.4, cutInside: false, dropDeep: false, switchPlay: true, throughBallBias: 1.0 },
    DLP: { runBehind: 0.1, linkup: 1.0, hugLine: 0.0, pressBias: 0.4, attackBias: 0.55, defenseBias: 0.45, cutInside: false, dropDeep: false, switchPlay: true, throughBallBias: 1.0 },
    BWM: { runBehind: 0.3, linkup: 0.5, hugLine: 0.0, pressBias: 1.0, attackBias: 0.4, defenseBias: 0.95, cutInside: false, dropDeep: false, lateRun: false },
    CM:  { runBehind: 0.4, linkup: 0.6, hugLine: 0.0, pressBias: 0.6, attackBias: 0.7, defenseBias: 0.5, cutInside: false, dropDeep: false, lateRun: false },
    LM:  { runBehind: 0.7, linkup: 0.3, hugLine: 1.0, pressBias: 0.5, attackBias: 0.8, defenseBias: 0.4, cutInside: false, dropDeep: false, crossBias: 0.9 },
    RM:  { runBehind: 0.7, linkup: 0.3, hugLine: 1.0, pressBias: 0.5, attackBias: 0.8, defenseBias: 0.4, cutInside: false, dropDeep: false, crossBias: 0.9 },
    WM:  { runBehind: 0.5, linkup: 0.4, hugLine: 0.9, pressBias: 0.5, attackBias: 0.8, defenseBias: 0.4, cutInside: false, dropDeep: false, crossBias: 0.8 },
    SV:  { runBehind: 0.6, linkup: 0.5, hugLine: 0.0, pressBias: 0.6, attackBias: 0.8, defenseBias: 0.8, cutInside: false, dropDeep: false, lateRun: true },
    ANC: { runBehind: 0.05, linkup: 0.8, hugLine: 0.0, pressBias: 0.7, attackBias: 0.25, defenseBias: 0.95, cutInside: false, dropDeep: false },
    DM:  { runBehind: 0.1, linkup: 0.8, hugLine: 0.0, pressBias: 0.7, attackBias: 0.35, defenseBias: 0.9, cutInside: false, dropDeep: false },
    CDM: { runBehind: 0.05, linkup: 0.85, hugLine: 0.0, pressBias: 0.8, attackBias: 0.3, defenseBias: 0.95, cutInside: false, dropDeep: false },
    EG:  { runBehind: 0.2, linkup: 0.8, hugLine: 0.0, pressBias: 0.4, attackBias: 0.75, defenseBias: 0.3, cutInside: false, dropDeep: false, throughBallBias: 1.0 },
    // Defenders
    CD:  { runBehind: 0.0, linkup: 0.2, hugLine: 0.0, pressBias: 0.5, attackBias: 0.05, defenseBias: 1.0, cutInside: false, dropDeep: false, overlap: false },
    BPD: { runBehind: 0.0, linkup: 0.5, hugLine: 0.0, pressBias: 0.4, attackBias: 0.2, defenseBias: 0.9, cutInside: false, dropDeep: false, switchPlay: true, throughBallBias: 0.8 },
    NCB: { runBehind: 0.0, linkup: 0.1, hugLine: 0.0, pressBias: 0.6, attackBias: 0.05, defenseBias: 0.95, cutInside: false, dropDeep: false, overlap: false },
    LIB: { runBehind: 0.2, linkup: 0.5, hugLine: 0.0, pressBias: 0.4, attackBias: 0.35, defenseBias: 0.85, cutInside: false, dropDeep: false, overlap: true },
    FB:  { runBehind: 0.4, linkup: 0.3, hugLine: 0.95, pressBias: 0.6, attackBias: 0.4, defenseBias: 0.85, cutInside: false, dropDeep: false, overlap: true },
    WB:  { runBehind: 0.7, linkup: 0.3, hugLine: 1.0, pressBias: 0.6, attackBias: 0.6, defenseBias: 0.7, cutInside: false, dropDeep: false, overlap: true, crossBias: 1.0 },
    CWB: { runBehind: 0.8, linkup: 0.2, hugLine: 1.0, pressBias: 0.6, attackBias: 0.75, defenseBias: 0.55, cutInside: false, dropDeep: false, overlap: true, crossBias: 1.0 },
    IWB: { runBehind: 0.6, linkup: 0.4, hugLine: 0.2, pressBias: 0.6, attackBias: 0.6, defenseBias: 0.7, cutInside: true, dropDeep: false, overlap: true, underlap: true },
    GK:  { runBehind: 0.0, linkup: 0.0, hugLine: 0.0, pressBias: 0.0, attackBias: 0.0, defenseBias: 1.0, cutInside: false, dropDeep: false, overlap: false }
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
// =============================================================================
// [SECTION 0.5]  6대 코어 전술 시스템 & DEEP TACTICS MANAGER
// =============================================================================

function getDefaultTacticSettings(tacticPreset = 'balanced') {
    const presets = {
        gegenpress:    { buildUp: 'short',  defensiveLine: 'high', pressIntensity: 'aggressive', offensiveTrans: 'counter', defensiveTrans: 'counterpress', passLength: 'mixed',  tempo: 'fast',     width: 'wide' },
        tikitaka:      { buildUp: 'short',  defensiveLine: 'high', pressIntensity: 'aggressive', offensiveTrans: 'hold',    defensiveTrans: 'counterpress', passLength: 'short',  tempo: 'standard', width: 'narrow' },
        possession:    { buildUp: 'short',  defensiveLine: 'mid',  pressIntensity: 'balanced',   offensiveTrans: 'hold',    defensiveTrans: 'regroup',      passLength: 'short',  tempo: 'slow',     width: 'standard' },
        longBall:      { buildUp: 'direct', defensiveLine: 'low',  pressIntensity: 'cautious',   offensiveTrans: 'counter', defensiveTrans: 'regroup',      passLength: 'direct', tempo: 'fast',     width: 'wide' },
        twoLine:       { buildUp: 'direct', defensiveLine: 'mid',  pressIntensity: 'balanced',   offensiveTrans: 'counter', defensiveTrans: 'regroup',      passLength: 'direct', tempo: 'fast',     width: 'standard' },
        parkBus:       { buildUp: 'direct', defensiveLine: 'low',  pressIntensity: 'cautious',   offensiveTrans: 'counter', defensiveTrans: 'regroup',      passLength: 'direct', tempo: 'fast',     width: 'narrow' },
        catenaccio:    { buildUp: 'direct', defensiveLine: 'low',  pressIntensity: 'balanced',   offensiveTrans: 'counter', defensiveTrans: 'regroup',      passLength: 'mixed',  tempo: 'slow',     width: 'narrow' },
        lavolpiana:    { buildUp: 'back3',  defensiveLine: 'mid',  pressIntensity: 'balanced',   offensiveTrans: 'hold',    defensiveTrans: 'regroup',      passLength: 'mixed',  tempo: 'standard', width: 'wide' },
        totalFootball: { buildUp: 'short',  defensiveLine: 'high', pressIntensity: 'aggressive', offensiveTrans: 'counter', defensiveTrans: 'counterpress', passLength: 'mixed',  tempo: 'fast',     width: 'wide' },
        counter:       { buildUp: 'direct', defensiveLine: 'low',  pressIntensity: 'balanced',   offensiveTrans: 'counter', defensiveTrans: 'regroup',      passLength: 'direct', tempo: 'fast',     width: 'wide' },
        balanced:      { buildUp: 'short',  defensiveLine: 'mid',  pressIntensity: 'balanced',   offensiveTrans: 'counter', defensiveTrans: 'regroup',      passLength: 'mixed',  tempo: 'standard', width: 'standard' }
    };
    return Object.assign({}, presets[tacticPreset] || presets.balanced);
}

function getTeamTacticSettings(teamId, tacticPreset = 'balanced') {
    if (typeof gameData !== 'undefined' && gameData) {
        const isUserTeam = (teamId === 'home' && gameData.isHomeGame) || (teamId === 'away' && !gameData.isHomeGame);
        if (isUserTeam && gameData.tacticSettings) {
            const def = getDefaultTacticSettings(gameData.currentTactic || tacticPreset);
            return Object.assign({}, def, gameData.tacticSettings);
        }
    }
    return getDefaultTacticSettings(tacticPreset);
}

function migrateDeepTactics() {
    if (typeof gameData === 'undefined' || !gameData) return false;
    if (!gameData.tacticSettings) {
        const cur = gameData.currentTactic || 'balanced';
        gameData.tacticSettings = getDefaultTacticSettings(cur);
    }
    if (!gameData.deepTactics) {
        gameData.deepTactics = {
            attackFocus: 'mixed', passStyle: { shortRatio: 7, longRatio: 3 },
            pressIntensity: 'mid', defensiveLine: 'standard',
            passTempo: 'normal', passLength: 'mixed',
            attackStyle: 'mixed'
        };
    }
    const dt = gameData.deepTactics;
    const ts = gameData.tacticSettings;
    // 동기화
    if (ts.defensiveLine === 'high') dt.defensiveLine = 'high';
    else if (ts.defensiveLine === 'low') dt.defensiveLine = 'deep';
    else dt.defensiveLine = 'standard';

    if (ts.pressIntensity === 'aggressive') dt.pressIntensity = 'high';
    else if (ts.pressIntensity === 'cautious') dt.pressIntensity = 'low';
    else dt.pressIntensity = 'mid';

    if (ts.tempo === 'fast') dt.passTempo = 'fast';
    else if (ts.tempo === 'slow') dt.passTempo = 'slow';
    else dt.passTempo = 'normal';

    if (ts.passLength === 'direct') dt.passLength = 'long';
    else if (ts.passLength === 'short') dt.passLength = 'short';
    else dt.passLength = 'mixed';

    dt.attackStyle = (ts.offensiveTrans === 'counter') ? 'counter' : (ts.buildUp === 'direct' ? 'counter' : 'possession');
    return true;
}

const DeepTacticManager = {
    init() {
        migrateDeepTactics();
        this.renderUI();
    },
    renderUI() {
        // tactics.js의 신규 6대 전술 UI가 tacticsContent에 렌더링되므로 레거시 컨테이너는 숨김 처리
        let c = document.getElementById('deepTacticsContainer');
        if (c) c.style.display = 'none';
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
        this.rawPlayer = data;
        this.id = data.name;
        this.name = data.name;
        this.position = data.position;
        this.detailPosition = data.detailPosition || data.position;
        this.rating = data.rating || 70;
        this.teamId = teamId;
        this.role = role;
        this.attributes = data.attributes || null;
        this.traits = Array.isArray(data.traits) ? data.traits : [];
        this.preferredFoot = data.preferredFoot || 'Right';
        this.weakFoot = data.weakFoot !== undefined ? data.weakFoot : 3;
        this.skillMoves = data.skillMoves !== undefined ? data.skillMoves : 3;
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
        this._dribbleDistance = 0;
        this._kickoffTicks = 0;
        this.stats = this._buildStats(data, role, lineStats, morale, tacticMultiplier);
    }

    _buildStats(data, role, lineStats, morale, tacticMultiplier) {
        const moraleFactor = 1 + ((morale - 50) * 0.0005);
        let out = {};

        // 1. 선수의 실제 attributes 6대 스탯이 있는 경우 최우선 직결!
        if (data.attributes && typeof data.attributes === 'object') {
            const a = data.attributes;
            out.speed = Number(a.pace) || data.rating || 70;
            out.shooting = Number(a.shooting) || data.rating || 70;
            out.passing = Number(a.passing) || data.rating || 70;
            out.dribble = Number(a.dribbling) || data.rating || 70;
            out.defense = Number(a.defending) || data.rating || 70;
            out.tackle = Number(a.defending) || data.rating || 70;
            out.physical = Number(a.physical) || data.rating || 70;
            out.decision = Math.round((out.passing * 0.35) + (out.defense * 0.35) + ((data.rating || 70) * 0.3));
        }
        // 2. 레거시 lineStats가 있는 경우 (하위 호환)
        else if (lineStats && lineStats.attack) {
            let line;
            if (data.position === 'FW') line = 'attack';
            else if (data.position === 'MF') line = 'midfield';
            else line = 'defense';
            const bs = lineStats[line].stats;
            const map = { passing: 'technique', shooting: 'attack', defense: 'defense', speed: 'speed', decision: 'mentality', physical: 'physical' };
            for (const [ss, ds] of Object.entries(map)) {
                const v = bs[ds] || data.rating || 70;
                out[ss] = (typeof TacticsManager !== 'undefined') ? TacticsManager.calculateFinalPower(v, role, ds) : v;
            }
            out.tackle = out.defense;
            out.dribble = ((out.passing * 0.65) + (out.speed * 0.35));
            if (data.position === 'FW') out.dribble *= 1.1;
        }
        // 3. 둘 다 없는 경우 폴백
        else {
            const overall = data.rating || 70;
            out = deriveStatsFromOverall(overall, data.position);
        }

        // 4. FM 롤(Role)에 따른 스탯 가중치 보정
        if (typeof TacticsManager !== 'undefined' && role) {
            const rData = TacticsManager.getRoleData(role);
            if (rData) {
                if (rData.attack) out.shooting *= (1 + rData.attack * 0.25);
                if (rData.technique) {
                    out.passing *= (1 + rData.technique * 0.25);
                    out.dribble *= (1 + rData.technique * 0.2);
                }
                if (rData.mobility) out.speed *= (1 + rData.mobility * 0.25);
                if (rData.defense) {
                    out.defense *= (1 + rData.defense * 0.25);
                    out.tackle *= (1 + rData.defense * 0.25);
                }
                if (rData.physical) out.physical *= (1 + rData.physical * 0.25);
                if (rData.mentality) out.decision *= (1 + rData.mentality * 0.25);
            }
        }

        // 5. 특성(Traits)에 따른 고유 시너지 스탯 보너스
        const traits = Array.isArray(data.traits) ? data.traits : [];
        if (traits.some(t => t.includes('스피드스터') || t.includes('래피드'))) out.speed += 3;
        if (traits.some(t => t.includes('파워슛') || t.includes('예리한 감아차기'))) out.shooting += 3;
        if (traits.some(t => t.includes('패스 마스터') || t.includes('핑 패스') || t.includes('긴 패스'))) out.passing += 3;
        if (traits.some(t => t.includes('테크니션') || t.includes('퍼스트 터치'))) out.dribble += 3;
        if (traits.some(t => t.includes('견제') || t.includes('예측') || t.includes('가로막기'))) out.defense += 3;
        if (traits.some(t => t.includes('공중의 성벽') || t.includes('강력한 어깨') || t.includes('행동대장'))) out.physical += 3;

        for (const k of Object.keys(out)) {
            out[k] = Math.max(15, Math.min(99, out[k] * moraleFactor * tacticMultiplier));
        }
        return out;
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
        this.pendingOffside = null; // [신규] 공식 오프사이드 판정 및 VAR 취소 연출용 객체

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
        this.tacticSettings = {
            home: getTeamTacticSettings('home', homeTactic),
            away: getTeamTacticSettings('away', awayTactic)
        };

        // Exit animation (post-match compatibility)
        this.exitAnimActive = false;
        this.exitAnimTicks = 0;
        this.exitAnimDone = false;
        this.exitWinner = null;
        this.postMatchRecoveryApplied = false;

        //  V3 FLOW STATE (possession + phase + memories)
        this._possession = { teamId: null, duration: 0 };
        this._phase = { home: 'building', away: 'building' }; // building | progressing | finalThird | counter
        this._phaseTimer = { home: 0, away: 0 };
        this._attackProgressX = { home: 0, away: 0 }; // track how far we pushed, detect stuck
        this._attackMemories = { home: new Array(8).fill(null), away: new Array(8).fill(null) };
        this._attackMemIdx = { home: 0, away: 0 };
        this._fwBurstCooldown = 0;
        this._fwLinkupCooldown = 0;
        this._postKickoffDefRealignTicks = 32;

        this.teamStrength = { home: 70, away: 70 };
        this.teamStrength.home = this.calcTeamStrength(homeSquad);
        this.teamStrength.away = this.calcTeamStrength(awaySquad);

        // [전술 상성 및 무전술 페널티를 teamStrength에 직접 선반영]
        const homeAdv = this.calcTacticAdvantage(homeTactic, awayTactic);
        const awayAdv = this.calcTacticAdvantage(awayTactic, homeTactic);
        this.teamStrength.home += homeAdv;
        this.teamStrength.away += awayAdv;

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
        if (!squad) return 70;
        const all = Array.isArray(squad)
            ? squad
            : [squad.gk, ...(squad.df || []), ...(squad.mf || []), ...(squad.fw || [])].filter(Boolean);
        if (!all.length) return 70;
        return all.reduce((s, p) => s + (p.rating || 70), 0) / all.length;
    }

    calcTacticAdvantage(myTactic, oppTactic) {
        if (!myTactic) myTactic = 'balanced';
        if (!oppTactic) oppTactic = 'balanced';

        // 1. 무전술 페널티: 현대 축구에서 전술 없이 개인 기량만으로는 조직적인 팀을 이길 수 없음
        if (myTactic === 'balanced' && oppTactic !== 'balanced') {
            return -16; // 무전술 체급 하락
        }
        if (myTactic !== 'balanced' && oppTactic === 'balanced') {
            return 14; // 무전술 상대 전술적 압도
        }
        if (myTactic === 'balanced' && oppTactic === 'balanced') {
            return 0;
        }

        const effectiveMap = {
            gegenpress: ["tikitaka", "possession", "lavolpiana"],
            twoLine: ["gegenpress", "totalFootball"],
            lavolpiana: ["parkBus", "catenaccio", "twoLine", "longBall"],
            longBall: ["gegenpress", "totalFootball"],
            possession: ["parkBus", "catenaccio", "twoLine", "longBall"],
            parkBus: ["gegenpress", "totalFootball"],
            catenaccio: ["gegenpress", "totalFootball"],
            totalFootball: ["tikitaka", "possession", "catenaccio", "parkBus"],
            tikitaka: ["parkBus", "catenaccio", "twoLine", "longBall"],
            counter: ["gegenpress", "totalFootball"]
        };

        const ineffectiveMap = {
            gegenpress: ["parkBus", "longBall", "catenaccio", "twoLine", "counter"],
            twoLine: ["tikitaka", "possession", "lavolpiana"],
            lavolpiana: ["gegenpress", "totalFootball"],
            longBall: ["tikitaka", "possession", "lavolpiana"],
            possession: ["gegenpress", "totalFootball"],
            parkBus: ["tikitaka", "possession", "lavolpiana"],
            catenaccio: ["tikitaka", "possession", "lavolpiana"],
            totalFootball: ["twoLine", "longBall", "counter"],
            tikitaka: ["gegenpress", "totalFootball"],
            counter: ["tikitaka", "possession", "lavolpiana"]
        };

        if (effectiveMap[myTactic]?.includes(oppTactic)) return 14;
        if (ineffectiveMap[myTactic]?.includes(oppTactic)) return -14;
        return 0;
    }

    getMidfieldStrength(teamId) {
        const mfs = this.players.filter(p => p.teamId === teamId && p.position === 'MF');
        if (!mfs.length) return 70;
        const total = mfs.reduce((acc, p) => {
            const pass = this.getEffectiveStat(p, 'passing');
            const def = this.getEffectiveStat(p, 'defense');
            const phy = this.getEffectiveStat(p, 'physical');
            return acc + (pass * 0.4 + def * 0.3 + phy * 0.3);
        }, 0);
        return total / mfs.length;
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
        // [실점 후 반응 페이스]
        // 실점 팀을 무너뜨리는 패널티 대신, 짧은 시간 동안 판단과 패스
        // 선택을 적극적으로 만들어 추격전이 시작될 수 있게 한다.
        if (this.panicTimer && this.panicTimer[p.teamId] > 0 && (stat === 'defense' || stat === 'decision' || stat === 'passing')) {
            f *= stat === 'defense' ? 0.98 : 1.08;
        }

        return v * f;
    }

    generateAIStats(squad, tactic = 'balanced') {
        const s = { attack: { stats: {} }, midfield: { stats: {} }, defense: { stats: {} } };
        const avg = a => a.length > 0 ? Math.round(a.reduce((x, y) => x + (y.rating || 70), 0) / a.length) : 70;
        let fwList = [], mfList = [], dfList = [], gkObj = null;

        if (squad && squad.squadLines) {
            const sl = squad.squadLines;
            gkObj = sl.GK && sl.GK[0];
            dfList = [...(sl.DF || [])];
            (sl.DM || []).forEach(p => {
                if (!p) return;
                const dp = ((p.detailPosition || p.position) || '').toUpperCase();
                if (['LWB', 'RWB', 'DF', 'CB', 'LB', 'RB'].includes(dp)) dfList.push(p);
                else mfList.push(p);
            });
            (sl.CM || []).forEach(p => { if (p) mfList.push(p); });
            (sl.AM || []).forEach(p => {
                if (!p) return;
                const dp = ((p.detailPosition || p.position) || '').toUpperCase();
                if (['LW', 'RW', 'ST', 'CF', 'FW'].includes(dp)) fwList.push(p);
                else { mfList.push(p); fwList.push(p); }
            });
            (sl.TOP || []).forEach(p => { if (p) fwList.push(p); });
        } else if (Array.isArray(squad)) {
            fwList = squad.filter(p => p && p.position === 'FW');
            mfList = squad.filter(p => p && p.position === 'MF');
            dfList = squad.filter(p => p && p.position === 'DF');
            gkObj = squad.find(p => p && p.position === 'GK');
        } else if (squad) {
            fwList = (squad.fw || []).filter(Boolean);
            mfList = (squad.mf || []).filter(Boolean);
            dfList = (squad.df || []).filter(Boolean);
            gkObj = squad.gk;
        }
        const fw = avg(fwList);
        const mf = avg(mfList);
        const df = avg([...dfList, gkObj].filter(Boolean));
        
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

    _getPlayerLateralOrder(player) {
        if (!player) return 50;
        const dp = ((player.detailPosition || player.position) || '').toUpperCase();
        if (['LB', 'LWB'].includes(dp)) return 10;
        if (['LW', 'LM'].includes(dp)) return 15;
        if (['LCB', 'LCM'].includes(dp)) return 35;
        if (['CB', 'CCB', 'CDM', 'CM', 'CAM', 'CF', 'ST', 'GK'].includes(dp)) return 50;
        if (['RCB', 'RCM'].includes(dp)) return 65;
        if (['RW', 'RM'].includes(dp)) return 85;
        if (['RB', 'RWB'].includes(dp)) return 90;
        return 50;
    }

    _sortLinePlayersLeftToRight(players) {
        if (!Array.isArray(players) || players.length <= 1) return players || [];
        return [...players].sort((a, b) => this._getPlayerLateralOrder(a) - this._getPlayerLateralOrder(b));
    }

    _calcLineSlotY(linePos, sortedList, idx, player) {
        const n = sortedList.length;
        if (n <= 1) return 50;

        if (linePos === 'GK') return 50;

        if (linePos === 'DF') {
            if (n === 4) return [10, 37, 63, 90][idx];
            if (n === 3) return [28, 50, 72][idx];
            if (n === 5) return [8, 28, 50, 72, 92][idx];
            return (100 / (n + 1)) * (idx + 1);
        }

        if (linePos === 'DM') {
            if (n === 1) return 50;
            if (n === 2) {
                const lat0 = this._getPlayerLateralOrder(sortedList[0]);
                const lat1 = this._getPlayerLateralOrder(sortedList[1]);
                if (lat0 <= 20 && lat1 >= 80) return [10, 90][idx];
                return [37, 63][idx];
            }
            if (n === 3) return [10, 50, 90][idx];
            return (100 / (n + 1)) * (idx + 1);
        }

        if (linePos === 'CM') {
            if (n === 1) return 50;
            if (n === 2) return [37, 63][idx];
            if (n === 3) return [26, 50, 74][idx];
            if (n === 4) return [12, 38, 62, 88][idx];
            if (n === 5) return [10, 30, 50, 70, 90][idx];
            return (100 / (n + 1)) * (idx + 1);
        }

        if (linePos === 'AM') {
            if (n === 1) return 50;
            if (n === 2) {
                const isWideWingers = sortedList.every(p => {
                    const pdp = ((p.detailPosition || p.position) || '').toUpperCase();
                    return ['LW', 'RW', 'LM', 'RM'].includes(pdp) || (this._getPlayerLateralOrder(p) <= 25 || this._getPlayerLateralOrder(p) >= 75);
                });
                if (isWideWingers) return [15, 85][idx];
                return [36, 64][idx];
            }
            if (n === 3) return [15, 50, 85][idx];
            if (n === 4) return [12, 38, 62, 88][idx];
            return (100 / (n + 1)) * (idx + 1);
        }

        if (linePos === 'TOP') {
            if (n === 1) return 50;
            if (n === 2) return [37, 63][idx];
            if (n === 3) return [25, 50, 75][idx];
            return (100 / (n + 1)) * (idx + 1);
        }

        if (linePos === 'MF') {
            if (n === 4) return [12, 38, 62, 88][idx];
            if (n === 3) return [26, 50, 74][idx];
            if (n === 2) return [37, 63][idx];
            if (n === 5) return [10, 30, 50, 70, 90][idx];
        }
        if (linePos === 'FW') {
            if (n === 3) return [15, 50, 85][idx];
            if (n === 2) return [37, 63][idx];
            if (n === 1) return 50;
        }

        return (100 / (n + 1)) * (idx + 1);
    }

    initTeam(squad, teamId, tactic) {
        // 전술 상성은 경기 의사결정과 경합에 반영하며, 선수의 원래 능력치에는
        // 적용하지 않는다. 상대 전술에 따라 속도 같은 개인 스탯이 급락하면
        // 같은 선수가 경기마다 걷는 것처럼 보이게 된다.
        const mul = 1.0;
        const hasGameData = (typeof gameData !== 'undefined' && gameData);
        const isUser = hasGameData
            ? ((teamId === 'home' && gameData.isHomeGame) || (teamId === 'away' && !gameData.isHomeGame))
            : (teamId === 'home');

        const setupLine = (list, baseX, linePos = null) => {
            let lineStats, morale = 50;
            let finalMul = mul;
            
            if (isUser && hasGameData) { 
                lineStats = gameData.lineStats || this.generateAIStats(squad, tactic); 
                this.userStats = lineStats; 
                morale = gameData.teamMorale || 75; 
            } else { 
                lineStats = (isUser ? this.userStats : this.aiStats) || this.generateAIStats(squad, tactic); 
                if (isUser) this.userStats = lineStats;
                else this.aiStats = lineStats; 
                morale = 65 + Math.floor(Math.random() * 21); // AI 팀 안정적인 사기 유지 (65~85)
            }
            
            // 라인 내 좌우 순서 정렬 (LB -> LCB -> RCB -> RB / LW -> CAM -> RW 등)
            const sortedList = this._sortLinePlayersLeftToRight((list || []).filter(Boolean));

            sortedList.forEach((p, i) => {
                if (!p) return;
                // 세부 정보 보충 (allTeams 참조)
                if (!p.attributes && typeof allTeams !== 'undefined') {
                    for (const t in allTeams) {
                        const found = (allTeams[t].players || []).find(x => x.name === p.name);
                        if (found && found.attributes) {
                            ['attributes', 'traits', 'detailPosition', 'otherPositions', 'preferredFoot', 'weakFoot', 'skillMoves'].forEach(k => {
                                if (p[k] === undefined && found[k] !== undefined) p[k] = found[k];
                            });
                            break;
                        }
                    }
                }
                // [선수 롤(Role) 배정 정상화] 선수 객체의 p.role 최우선 -> 유저 지정 롤 -> 포지션/세부포지션 맞춤 최적 롤
                let role = p.role;
                if (!role || role === 'None' || !ROLE_BEHAVIOR[role]) {
                    role = (typeof gameData !== 'undefined' && gameData.playerRoles && gameData.playerRoles[p.name])
                        ? gameData.playerRoles[p.name]
                        : this._bestRoleForTactic(tactic, linePos || p.position, i, sortedList.length, p.detailPosition);
                }
                const sp = new SimPlayer(p, teamId, role, lineStats, morale, finalMul);
                sp.linePos = linePos;
                sp._hasCustomSlot = true;
                sp.detailPosition = ((p.detailPosition || p.position) || '').toUpperCase();
                sp.otherPositions = p.otherPositions || [];

                let resolvedPos = 'MF';
                if (linePos === 'GK') {
                    resolvedPos = 'GK';
                } else if (linePos === 'DF') {
                    resolvedPos = 'DF';
                } else if (linePos === 'DM') {
                    const dp = sp.detailPosition;
                    resolvedPos = ['LWB', 'RWB', 'DF', 'CB', 'LB', 'RB'].includes(dp) ? 'DF' : 'MF';
                } else if (linePos === 'CM') {
                    resolvedPos = 'MF';
                } else if (linePos === 'AM') {
                    const dp = sp.detailPosition;
                    resolvedPos = ['LW', 'RW', 'FW', 'ST', 'CF'].includes(dp) ? 'FW' : 'MF';
                } else if (linePos === 'TOP' || linePos === 'FW') {
                    resolvedPos = 'FW';
                } else if (['GK', 'DF', 'MF', 'FW'].includes(p.position)) {
                    resolvedPos = p.position;
                }
                sp.position = resolvedPos; // 모든 라인 선수의 포지션을 GK, DF, MF, FW 4대 핵심 포지션으로 완전 정규화
                sp.baseX = baseX;
                sp.slotY = this._calcLineSlotY(linePos, sortedList, i, p);
                sp.baseY = sp.slotY;
                sp.x = sp.baseX;
                sp.y = sp.slotY;
                this.players.push(sp);
            });
        };
        if (!squad) return;
        if (Array.isArray(squad)) {
            const list = squad.filter(Boolean);
            const gk = list.find(p => p.position === 'GK') || list[0];
            const outfield = list.filter(p => p !== gk);
            const df = outfield.filter(p => p.position === 'DF').slice(0, 4);
            const mf = outfield.filter(p => p.position === 'MF').slice(0, 4);
            const fw = outfield.filter(p => p.position === 'FW').slice(0, 3);
            squad = { gk, df, mf, fw };
        }
        const lines = (squad && squad.squadLines) || (isUser && hasGameData && gameData.squadLines ? gameData.squadLines : null);
        if (lines) {
            if (teamId === 'home') {
                if (lines.GK && lines.GK.length > 0) setupLine(lines.GK, 3.2, 'GK');
                if (lines.DF && lines.DF.length > 0) setupLine(lines.DF, 22, 'DF');
                if (lines.DM && lines.DM.length > 0) setupLine(lines.DM, 34, 'DM');
                if (lines.CM && lines.CM.length > 0) setupLine(lines.CM, 44, 'CM');
                if (lines.AM && lines.AM.length > 0) setupLine(lines.AM, 58, 'AM');
                if (lines.TOP && lines.TOP.length > 0) setupLine(lines.TOP, 72, 'TOP');
            } else {
                if (lines.GK && lines.GK.length > 0) setupLine(lines.GK, 96.8, 'GK');
                if (lines.DF && lines.DF.length > 0) setupLine(lines.DF, 78, 'DF');
                if (lines.DM && lines.DM.length > 0) setupLine(lines.DM, 66, 'DM');
                if (lines.CM && lines.CM.length > 0) setupLine(lines.CM, 56, 'CM');
                if (lines.AM && lines.AM.length > 0) setupLine(lines.AM, 42, 'AM');
                if (lines.TOP && lines.TOP.length > 0) setupLine(lines.TOP, 28, 'TOP');
            }
        } else {
            if (teamId === 'home') {
                if (squad.gk) setupLine([squad.gk], 3.2, 'GK');
                setupLine(squad.df, 22, 'DF');
                setupLine(squad.mf, 45, 'MF');
                setupLine(squad.fw, 72, 'FW');
            } else {
                if (squad.gk) setupLine([squad.gk], 96.8, 'GK');
                setupLine(squad.df, 78, 'DF');
                setupLine(squad.mf, 55, 'MF');
                setupLine(squad.fw, 28, 'FW');
            }
        }
    }

    _bestRoleForTactic(tactic, pos, i, lineLen = 4, detailPos = '') {
        if (pos === 'GK') return 'GK';
        const dp = (detailPos || '').toUpperCase();

        // 1. 세부 포지션(detailPosition)이 명시되어 있는 경우 최우선 매칭!
        if (['LB', 'LWB'].includes(dp)) {
            if (tactic === 'tikitaka' || tactic === 'lavolpiana') return 'IWB';
            if (tactic === 'gegenpress' || tactic === 'totalFootball') return 'CWB';
            if (tactic === 'possession') return 'WB';
            return 'FB';
        }
        if (['RB', 'RWB'].includes(dp)) {
            if (tactic === 'tikitaka' || tactic === 'lavolpiana') return 'IWB';
            if (tactic === 'gegenpress' || tactic === 'totalFootball') return 'CWB';
            if (tactic === 'possession') return 'WB';
            return 'FB';
        }
        if (['CB', 'SW'].includes(dp)) {
            if (tactic === 'tikitaka' || tactic === 'possession' || tactic === 'totalFootball') return 'BPD';
            return 'CD';
        }
        if (['LW', 'LM'].includes(dp)) {
            if (tactic === 'tikitaka' || tactic === 'possession') return 'IW';
            if (tactic === 'counter' || tactic === 'gegenpress') return 'IF';
            return 'W';
        }
        if (['RW', 'RM'].includes(dp)) {
            if (tactic === 'tikitaka' || tactic === 'possession') return 'IW';
            if (tactic === 'counter' || tactic === 'gegenpress') return 'IF';
            return 'W';
        }
        if (['CAM', 'AM'].includes(dp)) {
            if (tactic === 'gegenpress' || tactic === 'counter') return 'SS';
            return 'AP';
        }
        if (['CDM', 'DM'].includes(dp)) {
            if (tactic === 'tikitaka' || tactic === 'possession') return 'DLP';
            return 'DM';
        }
        if (['ST', 'CF'].includes(dp)) {
            if (tactic === 'tikitaka' || tactic === 'totalFootball') return 'F9';
            if (tactic === 'longBall') return 'TM';
            if (tactic === 'counter') return 'AF';
            return 'CF';
        }

        // 2. 라인 내 물리적 위치(좌/중앙/우)에 따른 정밀 롤 배정
        if (pos === 'DF') {
            if (lineLen === 4) {
                if (i === 0) return (tactic === 'gegenpress' ? 'CWB' : (tactic === 'tikitaka' ? 'IWB' : 'WB'));
                if (i === 1) return (tactic === 'tikitaka' || tactic === 'possession' ? 'BPD' : 'CD');
                if (i === 2) return 'CD';
                if (i === 3) return (tactic === 'gegenpress' ? 'CWB' : (tactic === 'tikitaka' ? 'IWB' : 'WB'));
            } else if (lineLen === 5) {
                if (i === 0) return 'CWB';
                if (i === 4) return 'CWB';
                return (i === 2 && tactic === 'tikitaka' ? 'LIB' : 'CD');
            } else if (lineLen === 3) {
                return (i === 1 && tactic === 'tikitaka' ? 'LIB' : (i === 0 ? 'BPD' : 'CD'));
            }
            return (i === 0 || i === lineLen - 1) ? 'FB' : 'CD';
        }

        if (pos === 'MF') {
            if (lineLen === 4) {
                // 4-4-2 등: 양쪽 날개(LM/RM)는 반드시 윙어 롤!
                if (i === 0) return (tactic === 'tikitaka' ? 'IW' : (tactic === 'counter' ? 'IF' : 'W'));
                if (i === 1) return (tactic === 'tikitaka' ? 'DLP' : 'BBM');
                if (i === 2) return (tactic === 'tikitaka' ? 'AP' : 'CM');
                if (i === 3) return (tactic === 'tikitaka' ? 'IW' : (tactic === 'counter' ? 'IF' : 'W'));
            } else if (lineLen === 3) {
                if (i === 0) return 'MEZ';
                if (i === 1) return (tactic === 'tikitaka' ? 'DLP' : 'BWM');
                if (i === 2) return (tactic === 'tikitaka' ? 'AP' : 'BBM');
            } else if (lineLen === 5) {
                if (i === 0) return 'W';
                if (i === 1) return 'MEZ';
                if (i === 2) return 'DLP';
                if (i === 3) return 'AP';
                if (i === 4) return 'W';
            }
            return (i === 0 || i === lineLen - 1) ? 'W' : 'CM';
        }

        if (pos === 'FW') {
            if (lineLen === 3) {
                // 4-3-3: LW, ST, RW
                if (i === 0) return (tactic === 'tikitaka' ? 'IW' : 'IF');
                if (i === 1) return (tactic === 'tikitaka' ? 'F9' : (tactic === 'longBall' ? 'TM' : 'AF'));
                if (i === 2) return (tactic === 'tikitaka' ? 'IW' : 'IF');
            } else if (lineLen === 2) {
                // 투톱
                if (i === 0) return (tactic === 'tikitaka' ? 'F9' : (tactic === 'longBall' ? 'TM' : 'AF'));
                if (i === 1) return (tactic === 'counter' ? 'P' : 'CF');
            }
            return (tactic === 'longBall' ? 'TM' : 'AF');
        }

        return 'CM';
    }

    // 5선 라인 기반 슬롯 보존 및 레거시 스쿼드 fallback
    _assignVerticalSlots() {
        for (const teamId of ['home', 'away']) {
            const teamPlayers = this.players.filter(p => p.teamId === teamId);
            // 만약 이미 squadLines를 통해 slotY가 정밀 지정되어 있다면 보존!
            const hasCustomSlots = teamPlayers.some(p => p._hasCustomSlot && p.slotY);
            if (hasCustomSlots) continue;

            // 레거시 스쿼드(라인 구분 없는 경우)를 위한 안전망 fallback
            const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => (this._getPlayerLateralOrder(a) - this._getPlayerLateralOrder(b)) || (a.baseY - b.baseY));
            if (dfs.length === 4) { dfs[0].slotY = 10; dfs[1].slotY = 37; dfs[2].slotY = 63; dfs[3].slotY = 90; }
            else if (dfs.length === 5) { dfs[0].slotY = 8; dfs[1].slotY = 28; dfs[2].slotY = 50; dfs[3].slotY = 72; dfs[4].slotY = 92; }
            else if (dfs.length === 3) { dfs[0].slotY = 28; dfs[1].slotY = 50; dfs[2].slotY = 72; }
            else { dfs.forEach((p, idx) => { p.slotY = (100 / (dfs.length + 1)) * (idx + 1); }); }

            const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => (this._getPlayerLateralOrder(a) - this._getPlayerLateralOrder(b)) || (a.baseY - b.baseY));
            const n = mfs.length;
            if (n === 4) { mfs[0].slotY = 12; mfs[1].slotY = 38; mfs[2].slotY = 62; mfs[3].slotY = 88; }
            else if (n === 3) { mfs[0].slotY = 26; mfs[1].slotY = 50; mfs[2].slotY = 74; }
            else if (n === 5) { mfs[0].slotY = 10; mfs[1].slotY = 30; mfs[2].slotY = 50; mfs[3].slotY = 70; mfs[4].slotY = 90; }
            else if (n === 2) { mfs[0].slotY = 37; mfs[1].slotY = 63; }
            else { mfs.forEach((p, idx) => { p.slotY = (100 / (n + 1)) * (idx + 1); }); }

            const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => (this._getPlayerLateralOrder(a) - this._getPlayerLateralOrder(b)) || (a.baseY - b.baseY));
            const nfw = fws.length;
            if (nfw === 3) { fws[0].slotY = 15; fws[1].slotY = 50; fws[2].slotY = 85; }
            else if (nfw === 2) { fws[0].slotY = 37; fws[1].slotY = 63; }
            else if (nfw === 1) { fws[0].slotY = 50; }
            else { fws.forEach((p, idx) => { p.slotY = (100 / (nfw + 1)) * (idx + 1); }); }
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
        this._postKickoffDefRealignTicks = 32;
        this.players.forEach(p => {
            p.burstTimer = 0;
            p.forceReturnTimer = 0;
            p._timer = 0;
            p._fwMode = 'shadow';
            p._fbMode = 'hold';
            p._stealCooldown = 0;
            p._protectionTicks = 0;
            p._ballHoldTicks = 0;
            p._dribbleCommit = 0;
            p._dribbleDistance = 0;
            p._kickoffTicks = 0;
            p._postPassSupportTicks = 0;
            p._postPassSupportTarget = null;
            p._isTriangleSupport = false;
        });

        let kicker = null;
        if (kickoffTeamId) {
            kicker = this.players.find(p => p.teamId === kickoffTeamId && p.position === 'FW')
                || this.players.find(p => p.teamId === kickoffTeamId && p.position === 'MF')
                || this.players.find(p => p.teamId === kickoffTeamId);
        }
        if (kicker) {
            this.ball.state = BallState.CONTROLLED;
            this.ball.owner = kicker;
            kicker._kickoffTicks = 24;
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
                if (p.position === 'GK') p.x = 3.2;
                else if (p.position === 'FW') p.x = Math.min(p.baseX, 46);
                else if (p.position === 'MF') p.x = Math.min(p.baseX, 38);
                else p.x = Math.min(p.baseX, 22);
            } else {
                if (p.position === 'GK') p.x = 96.8;
                else if (p.position === 'FW') p.x = Math.max(p.baseX, 54);
                else if (p.position === 'MF') p.x = Math.max(p.baseX, 62);
                else p.x = Math.max(p.baseX, 78);
            }
        });
    }

    consumeStamina() {
        // 분당 소모량: 90분 뒤에도 역할별 활동량 차이는 남기되,
        // MF/FW가 후반에 능력치 40% 이하로 급락하지 않도록 완화한다.
        const rates = { FW: 0.34, MF: 0.38, DF: 0.24, GK: 0.05 };
        this.players.forEach(p => {
            const r = rates[p.position] || 0.5;
            p.stamina = Math.max(0, p.stamina - r * (0.8 + Math.random() * 0.4));
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

    // ─────────────────────────────────────────────────────────────
    //  [6단계] 상대 전술 프로파일 실시간 판별
    // ─────────────────────────────────────────────────────────────
    _getOpponentTacticalProfile(tid) {
        const opp = (tid === 'home' ? 'away' : 'home');
        const oppTactic = this.getTeamTactic(opp);
        const oppTSet = (this.tacticSettings && this.tacticSettings[opp]) || {};
        const oppDFs = this.players.filter(p => p.teamId === opp && p.position === 'DF');

        // 1. 수비 라인 높이 판별 (하이라인 vs 로우블록)
        let isHighLine = oppTSet.defensiveLine === 'high' || oppTactic === 'gegenpress' || oppTactic === 'totalFootball';
        let isLowBlock = oppTSet.defensiveLine === 'low' || oppTactic === 'catenaccio' || oppTactic === 'parkBus';
        if (oppDFs.length) {
            const avgDfX = oppDFs.reduce((sum, p) => sum + p.x, 0) / oppDFs.length;
            if (opp === 'home') {
                if (avgDfX >= 44) isHighLine = true;
                if (avgDfX <= 26) isLowBlock = true;
            } else {
                if (avgDfX <= 56) isHighLine = true;
                if (avgDfX >= 74) isLowBlock = true;
            }
        }

        // 2. 압박 강도 판별
        const isAggressivePress = oppTSet.pressIntensity === 'aggressive' || oppTactic === 'gegenpress' || oppTactic === 'totalFootball';
        const isCautiousPress = oppTSet.pressIntensity === 'cautious' || oppTactic === 'catenaccio' || oppTactic === 'parkBus';

        // 3. 중앙 밀집도 판별 (중앙 32~68 채널에 위치한 상대 미드필더/수비수 수)
        const centralDefendersCount = this.players.filter(p => p.teamId === opp && p.position !== 'GK' && p.y >= 32 && p.y <= 68).length;
        const isCentralDense = centralDefendersCount >= 6 || oppTSet.width === 'narrow' || oppTactic === 'catenaccio' || oppTactic === 'parkBus';

        // 4. 빌드업 스타일 판별
        const isDirectOpponent = oppTactic === 'longBall' || oppTactic === 'twoLine' || oppTactic === 'counter' || oppTSet.buildUp === 'direct';
        const isPossessionOpponent = oppTactic === 'tikitaka' || oppTactic === 'possession' || oppTSet.buildUp === 'short';

        return {
            opp,
            oppTactic,
            oppTSet,
            isHighLine,
            isLowBlock,
            isAggressivePress,
            isCautiousPress,
            isCentralDense,
            isDirectOpponent,
            isPossessionOpponent
        };
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

        // Exit animation (post-match)
        if (this.exitAnimActive && !this.exitAnimDone) {
            return this.updatePostMatch();
        }

        // Celebration (세리머니 중에는 쿨다운/난수 시드 등 인게임 물리 상태를 변경하지 않아 배속/스킵 여부와 무관하게 100% 동일한 결과 보장)
        if (this.celebrationTimer > 0) {
            this._processCelebration();
            this.celebrationTimer--;
            if (this.celebrationTimer <= 0) {
                const next = this.lastScorerTeam === 'home' ? 'away' : 'home';
                this.resetPositions(next);
            }
            return this.getSnapshot(true);
        }

        this.players.forEach(p => {
            if (p._stealCooldown > 0) p._stealCooldown--;
            if (p._protectionTicks > 0) p._protectionTicks--;
            if (p.burstTimer > 0) p.burstTimer--;
            if (p.forceReturnTimer > 0) p.forceReturnTimer--;
            if (p._timer > 0) p._timer--;
            if (p._kickoffTicks > 0) p._kickoffTicks--;
            if (p._postPassSupportTicks > 0) p._postPassSupportTicks--;
        });
        if (this._postKickoffDefRealignTicks > 0) this._postKickoffDefRealignTicks--;

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

    getSnapshot(forceCelebration = false) {
        return {
            ball: { x: this.ball.x, y: this.ball.y, z: this.ball.z, state: this.ball.state },
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                x: p.x,
                y: p.y,
                team: p.teamId,
                teamId: p.teamId,
                position: p.position,
                hasBall: this.ball.owner === p,
                stamina: Math.max(0, Math.min(100, Math.round(p.stamina || 100)))
            })),
            events: [...this.eventsQueue],
            isCelebration: forceCelebration || this.celebrationTimer > 0,
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

            if (have && prev === 'counter' && this._phaseTimer[tid] > 0) {
                // 실제 역습 전술만 짧은 전환 상태를 유지한다.
                const prog = distFromMyGoal;
                if (prog > this._attackProgressX[tid] + 3) this._attackProgressX[tid] = prog;
            } else if (have) {
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
            if (dist < 14 || dist > 36) continue;
            // 가로지르는 대각선 장거리 스루패스 억제: 동일/인접 채널(y차이 26 이하)로만 침투 패스
            if (Math.abs(to.y - from.y) > 26) continue;
            const progressive = isHome ? (to.x - from.x) : (from.x - to.x);
            if (progressive < 10) continue;
            if (this._numOpponentsAhead(to, 6, 14) > 1) continue;
            let score = this._scorePass(from, to, phase);
            if (to._fwMode === 'burst') score += 24;
            if (to.position === 'FW' || ['LW', 'RW', 'ST', 'CF'].includes(to.detailPosition)) score += 16;
            if (['CAM', 'AM'].includes(to.detailPosition) || (to.position === 'MF' && ['AM', 'AP', 'SS', 'MEZ', 'BBM'].includes(to.role))) score += 14;
            if (['LW', 'RW'].includes(to.detailPosition) && Math.abs(to.slotY - 50) > 22 && Math.abs(to.y - from.y) <= 22) score += 10;
            if (['CAM', 'AM'].includes(from.detailPosition) || ['AP', 'AM', 'DLP'].includes(from.role)) score += 15;
            if (this._isReceiverBehindDefLine(from, to)) score += 14;
            if (Math.abs(to.x - goalX) < 30) score += 10;
            if (score > bestScore) { bestScore = score; best = to; }
        }
        return best ? { target: best, score: bestScore } : null;
    }

    // [NEW] Long Ball target finder (지공 모드 롱킥 시스템)
    // Finds a FW in the same/adjacent channel (피치를 가로지르는 대각선 롱볼 자제)
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
            if (dist < 24 || dist > 52) continue;
            if (Math.abs(to.y - from.y) > 26) continue; // 가로지르는 장거리 대각선 패스 차단
            const progressive = isHome ? (to.x - from.x) : (from.x - to.x);
            if (progressive < 16) continue;
            // Check space around target
            const oppNear = this.players.filter(p =>
                p.teamId !== tid && p.position !== 'GK' &&
                Math.hypot(p.x - to.x, p.y - to.y) < 14
            ).length;
            if (oppNear > 2) continue;
            let score = progressive * 1.3 - oppNear * 14 - Math.abs(to.y - from.y) * 0.8;
            // Burst FW bonus
            if (to._fwMode === 'burst') score += 25;
            // Proximity to goal
            score += Math.max(0, 42 - Math.abs(to.x - goalX)) * 0.6;
            // Check lane is not too congested
            const laneBlocked = this._numOpponentsAhead(from, 10, 20) >= 3;
            if (laneBlocked) score -= 20;
            if (score > bestScore) { bestScore = score; best = to; }
        }
        return best && bestScore > 22 ? { target: best, score: bestScore } : null;
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
        const tSet = (this.tacticSettings && this.tacticSettings[teamId]) || {};
        const profile = this.getTacticProfile(teamId);
        // 팀별 고유 전술 라인 성향 반영
        const tacticLineBias = (profile.press - 0.62) * 10;
        const lineBias = (tSet.defensiveLine === 'high' ? 4 : (tSet.defensiveLine === 'low' ? -4 : 0)) + tacticLineBias;
        const ballX = this.ball.x;
        const haveBall = this._possession.teamId === teamId ||
            (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner && this.ball.lastOwner.teamId === teamId);
        const threatX = !haveBall && this.ball.state === BallState.IN_FLIGHT && this.ball.targetPos
            ? this.ball.targetPos.x
            : ballX;

        let dfX, mfX, fwX;
        if (haveBall) {
            // [미드필더 과도한 최전방 쏠림 방지: 미드필더는 중원/박스 외곽(2선)을 지키고 공격수와 명확한 간격 유지]
            if (phase === 'building') {
                mfX = isHome ? clamp(ballX + 11, 26, 46) : clamp(ballX - 11, 54, 74);
                fwX = isHome ? clamp(mfX + 16, 46, 66) : clamp(mfX - 16, 34, 54);
            } else if (phase === 'progressing') {
                mfX = isHome ? clamp(ballX + 6, 36, 58) : clamp(ballX - 6, 42, 64);
                fwX = isHome ? clamp(ballX + 20, 56, 82) : clamp(ballX - 20, 18, 44);
            } else {
                const phasePush = phase === 'finalThird' ? 22 : 16;
                fwX = isHome ? clamp(ballX + 16 + phasePush, 74, 93)
                    : clamp(ballX - 16 - phasePush, 7, 26);
                // 파이널 서드에서도 미드필더 기본선은 박스 바깥 중원(50~64)에 위치하여 전원이 골문 앞으로 몰리지 않게 함!
                mfX = isHome ? clamp(ballX - 4, 48, 64) : clamp(ballX + 4, 36, 52);
            }
            // [안정적 레스트 디펜스] 공격 시 수비 라인은 전술 라인 설정에 맞춰 적정선(30~43) 유지
            const highCapHome = tSet.defensiveLine === 'high' ? 45 : (tSet.defensiveLine === 'low' ? 36 : 41);
            const highCapAway = tSet.defensiveLine === 'high' ? 55 : (tSet.defensiveLine === 'low' ? 64 : 59);
            dfX = isHome
                ? clamp(ballX > 50 ? 36 + (ballX - 50) * 0.14 : 26 + ballX * 0.20, 26, highCapHome)
                : clamp(ballX < 50 ? 64 - (50 - ballX) * 0.14 : 74 - (100 - ballX) * 0.20, highCapAway, 74);
        } else {
            // [하이 프레싱 & 다이내믹 수비 블록: 상대 공격수와 수비라인 간 유격 최소화 및 콤팩트 유지]
            if (isHome) {
                if (threatX < 28) {
                    dfX = clamp(threatX - 3.5, 7, 22);
                    mfX = clamp(dfX + 6.5, 13, 28);
                    fwX = clamp(mfX + 15, 30, 48);
                } else {
                    dfX = clamp(22 + lineBias + (threatX - 28) * 0.44, 18, 46);
                    mfX = clamp(dfX + 8.0, 26, 54);
                    fwX = clamp(Math.max(mfX + 13, threatX - 4), 38, 76);
                }
            } else {
                if (threatX > 72) {
                    dfX = clamp(threatX + 3.5, 78, 93);
                    mfX = clamp(dfX - 6.5, 72, 87);
                    fwX = clamp(mfX - 15, 52, 70);
                } else {
                    dfX = clamp(78 - lineBias - (72 - threatX) * 0.44, 54, 82);
                    mfX = clamp(dfX - 8.0, 46, 74);
                    fwX = clamp(Math.min(mfX - 13, threatX + 4), 24, 62);
                }
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
        const underPressure = nDef && nDef.dist < 4.8;
        const effectSpeed = this.getEffectiveStat(player, 'speed');
        const effDrib = this.getEffectiveStat(player, 'dribble');
        const isWinger = (behavior.hugLine && onFlank) || Math.abs(player.y - 50) > 20 || ['LW', 'RW', 'LM', 'RM'].includes(player.detailPosition);
        const isFlankWinger = isWinger || ['LW', 'RW', 'LM', 'RM'].includes(player.detailPosition);
        const isConfidentDribbler = isFlankWinger || player.position === 'FW' || effDrib >= 72 || ['AM', 'AP', 'MEZ', 'BBM', 'SS', 'IW', 'IF', 'W', 'CWB', 'WB'].includes(player.role);

        // [1단계] 패스 후보를 확인하기 전에 드리블을 강제하지 않는다.
        // 열린 공간이어도 팀의 첫 선택은 패스/재순환이어야 하며, 드리블은
        // 아래의 상황·역할 비교 로직을 통과한 경우에만 실행한다.
        if (!player._ballHoldTicks) player._ballHoldTicks = 0;
        player._dribbleCommit = 0;

        // 2) PASS OR DRIBBLE based on PHASE + role!
        const teammates = this.players.filter(p => p.teamId === tid && p !== player);
        let bestPassTarget = null;
        let bestPassScore = -Infinity;
        for (const tm of teammates) {
            const s = this._scorePass(player, tm, phase);
            if (s > bestPassScore) { bestPassScore = s; bestPassTarget = tm; }
        }

        // 빌드업/중원에서는 수비에 둘러싸인 전방보다 안전한 3선·2선 순환을 우선한다.
        if (phase !== 'finalThird' && bestPassTarget) {
            const targetPressure = this.players.filter(opp =>
                opp.teamId !== tid &&
                opp.position !== 'GK' &&
                Math.hypot(opp.x - bestPassTarget.x, opp.y - bestPassTarget.y) < 9
            ).length;
            if (!bestPassTarget || (bestPassTarget.position === 'FW' && targetPressure >= 2)) {
                const safeTarget = this._findSafeCirculationTarget(player, phase);
                if (safeTarget) {
                    bestPassTarget = safeTarget;
                    bestPassScore = this._scorePass(player, safeTarget, phase);
                }
            }
        }
        if (!bestPassTarget || !Number.isFinite(bestPassScore)) {
            const safeTarget = this._findSafeCirculationTarget(player, phase);
            if (safeTarget) {
                bestPassTarget = safeTarget;
                bestPassScore = this._scorePass(player, safeTarget, phase);
            }
        }

        const killerPass = this._findKillerPassTarget(player, phase);
        if (killerPass && killerPass.score > bestPassScore + 6) {
            bestPassTarget = killerPass.target;
            bestPassScore = killerPass.score;
        }

        // [팀별 공격 스타일 & 전환 전술 연동]
        const myTactic = this.getTeamTactic(tid);
        const myTSet = (this.tacticSettings && this.tacticSettings[tid]) || {};
        const isCounterStyle = myTactic === 'counter' ||
            (myTSet.offensiveTrans === 'counter' && ['longBall', 'twoLine', 'gegenpress', 'totalFootball'].includes(myTactic));
        const isLongBallTactic = myTactic === 'longBall' || myTactic === 'twoLine' || myTSet.passLength === 'direct';

        if (isLongBallTactic && (phase === 'building' || phase === 'progressing' || phase === 'counter')) {
            const longBall = this._findLongBallTarget(player, phase);
            if (longBall && (player.position === 'DF' || longBall.score > bestPassScore + 5)) {
                bestPassTarget = longBall.target;
                bestPassScore = longBall.score + 10;
            }
        }
        if (isCounterStyle && myTactic !== 'longBall' && myTactic !== 'twoLine' &&
            (phase === 'counter' || phase === 'progressing')) {
            const counterBurst = this.players.find(p =>
                p.teamId === tid && p !== player && p.position === 'FW' && (p._fwMode === 'burst' || p.burstTimer > 0)
            ) || this.players.find(p => p.teamId === tid && p !== player && p.position === 'FW');
            if (counterBurst) {
                const cs = this._scorePass(player, counterBurst, phase);
                if (cs > bestPassScore - 15) {
                    bestPassTarget = counterBurst;
                    bestPassScore = cs + 28;
                }
            }
        }

        // Situation-first choice: compare best pass with carry value
        const passProb = this._calcPassProbV3(player, phase, underPressure, isWinger, distToGoal, nDef);
        const carryScore = this._scoreCarryChoice(player, phase, underPressure, isWinger, distToGoal, nDef);
        const bestTargetIsSupport = bestPassTarget &&
            Math.hypot(player.x - bestPassTarget.x, player.y - bestPassTarget.y) <= 24 &&
            this.players.filter(opp =>
                opp.teamId !== tid && opp.position !== 'GK' &&
                Math.hypot(opp.x - bestPassTarget.x, opp.y - bestPassTarget.y) < 9
            ).length <= 1;
        const combinationBonus = player.position === 'FW' && bestTargetIsSupport
            ? (underPressure ? 24 : 14)
            : 0;
        const passScore = bestPassScore + combinationBonus + (passProb - 0.5) * 10;
        const isShortCombinationTactic = myTactic === 'tikitaka' || myTactic === 'possession';
        const isBuildUpFirstTactic = isShortCombinationTactic || myTactic === 'lavolpiana' || isLongBallTactic;

        // 킥오프 직후에는 스트라이커가 혼자 질주하지 않고 먼저 빌드업을 시작한다.
        if (player._kickoffTicks > 0 && bestPassTarget && Number.isFinite(bestPassScore)) {
            this._executePassV3(player, bestPassTarget, phase);
            return;
        }

        // [6단계] 역습 전환 시 스트라이커 단독 질주 억제 & 열린 전방 동료에게 즉시 킬패스 방출
        if (phase === 'counter' && bestPassTarget && Number.isFinite(bestPassScore)) {
            const isFwd = Math.abs(bestPassTarget.x - goalX) < distToGoal - 2.0;
            if (isFwd && !underPressure) {
                this._executePassV3(player, bestPassTarget, phase);
                return;
            }
        }
        const carryPassIsTooDeep = bestPassTarget &&
            Math.abs(bestPassTarget.x - goalX) > distToGoal + 8;
        const longCarryPassChance = bestPassTarget && player._dribbleDistance > 20
            ? clamp((player._dribbleDistance - 20) * 0.012, 0, 0.38)
            : 0;
        if (longCarryPassChance > 0 && !carryPassIsTooDeep &&
            passScore >= carryScore - 18 && Math.random() < longCarryPassChance) {
            this._executePassV3(player, bestPassTarget, phase);
            return;
        }

        // [긴급 슈팅] 골문 4.5m 바로 앞 (확실한 탭인 상황)
        if (distToGoal <= 4.5 && player.position !== 'GK') {
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
        const bestPassIsRetreat = bestPassTarget &&
            Math.abs(bestPassTarget.x - goalX) > distToGoal + 1.5 &&
            !isCutback && !isCross;

        // 티키타카/점유는 안전한 연결 후보가 있으면 개인 돌파보다 삼각형
        // 순환을 먼저 선택한다. 전진·횡패스만 즉시 사용하고 깊은 백패스는 제외한다.
        if (isShortCombinationTactic && bestPassTarget && Number.isFinite(bestPassScore) &&
            !bestPassIsRetreat && (!underPressure || bestPassScore >= carryScore - 10) &&
            passScore >= carryScore - 14) {
            this._executePassV3(player, bestPassTarget, phase);
            return;
        }

        // [슈팅 난사 억제 및 완성도 높은 피니시]
        // 페널티 박스 안 (distToGoal <= 22) 의사결정:
        if (distToGoal <= 22 && player.position !== 'GK') {
            // 수비수가 바로 코앞(2.8m 이내)에 밀착했을 때만 슈팅 전 블로킹 태클 경합
            if (nDef && nDef.dist < 2.8) {
                const defTackleStat = this.getEffectiveStat(nDef.player, 'tackle') || this.getEffectiveStat(nDef.player, 'defense');
                if (Math.random() * 100 < clamp(28 + (defTackleStat - 65) * 0.40, 20, 58)) {
                    if (this._attemptTackle(nDef.player, player)) return;
                }
            }

            const sc = this._shootChance(player, goalX, distToGoal);
            const shootScore = sc * 100 + (player.position === 'FW' ? 14 : 4) - (underPressure ? 12 : 0);
            const shootThreshold = distToGoal <= 7 ? 38 : (distToGoal <= 13 ? 52 : (distToGoal <= 18 ? 64 : 76));

            // 컷백이나 크로스 타겟이 열려 있으면 억지 슛 대신 패스 우선!
            if ((isCutback || isCross) && Math.abs(player.y - 50) > 16 && passScore >= carryScore - 15) {
                this._executePassV3(player, bestPassTarget, phase);
                return;
            }

            // 골문 앞 탭인/오픈 찬스 타겟 확인 (뒤로 물러나는 패스는 절대 더 나은 피니시가 아님)
            const isTargetForwardOrBox = bestPassTarget && (
                isCutback || isCross ||
                ((Math.abs(bestPassTarget.x - goalX) <= distToGoal + 1.0) && Math.abs(bestPassTarget.y - 50) <= 24)
            );
            const isPassBetterFinish = bestPassTarget && (
                isCutback || isCross ||
                ((Math.abs(bestPassTarget.x - goalX) < distToGoal - 1.5) && Math.abs(bestPassTarget.y - 50) < 20)
            );

            // 공격수가 박스 안(17m 이내)에서 더 나은 패스 타겟이 없고 정면이 열려있으면 과감히 슈팅 마무리
            const fwFinishBonus = (player.position === 'FW' && distToGoal <= 17 && !isPassBetterFinish && !this._isFrontalBlocked(player, goalX)) ? 8 : 0;
            if (distToGoal <= 6 || (shootScore + fwFinishBonus) >= shootThreshold) {
                this._attemptShoot(player, goalX);
                return;
            }

            // 슈팅 각이 안 나오고 동료가 더 좋은 전방/박스 내 위치에 있을 때만 패스 (박스 밖 백패스 원천 차단!)
            if (bestPassTarget && isTargetForwardOrBox && (isPassBetterFinish || passScore >= carryScore - 4)) {
                this._executePassV3(player, bestPassTarget, phase);
                return;
            }

            // 박스 안 드리블 시 근접 수비수의 태클 저지 체크
            if (nDef && nDef.dist < 4.4) {
                const defTackleStat = this.getEffectiveStat(nDef.player, 'tackle') || this.getEffectiveStat(nDef.player, 'defense');
                if (Math.random() * 100 < clamp(26 + (defTackleStat - 65) * 0.40, 18, 56)) {
                    if (this._attemptTackle(nDef.player, player)) return;
                }
            }

            // 수비수를 제치거나 각도를 열기 위한 침착한 드리블 돌파
            this._dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effectSpeed);
            return;
        }

        // [공격 다변화: 아크 정면 중거리 슈팅 & ZD 감아차기 (18 ~ 30) - 난사 억제]
        // 난사를 원천 방지하고 경기당 1~2회 정도 진짜 각도가 열렸을 때만 시도
        if (distToGoal >= 18 && distToGoal < 30 && player.position !== 'DF' && player.position !== 'GK') {
            const effSh = this.getEffectiveStat(player, 'shooting');
            const frontCrowd = this._numOpponentsAhead(player, 8, 16);
            const oppTSet = (this.tacticSettings && this.tacticSettings[tid === 'home' ? 'away' : 'home']) || {};
            const isOppLowBlock = oppTSet.defensiveLine === 'low' || this.players.filter(q => q.teamId !== tid && q.position === 'DF' && Math.abs(q.x - goalX) < 22).length >= 4;
            const traits = player.traits || [];
            const hasFinesse = traits.some(t => t.includes('예리한 감아차기') || t.includes('감아차기'));
            const hasPowerShot = traits.some(t => t.includes('파워슛') || t.includes('빨랫줄 슈팅'));
            const isLongShotRole = behavior.longShotBias || ['AP', 'AM', 'BBM', 'IW', 'IF', 'SS'].includes(player.role);

            let longShotProb = (effSh >= 78 ? 0.08 : 0.03);
            if (isOppLowBlock) longShotProb += 0.05;
            if (hasFinesse || hasPowerShot) longShotProb += 0.06;
            if (isLongShotRole) longShotProb += 0.04;
            if (frontCrowd >= 2 || underPressure) longShotProb -= 0.15;

            if (effSh >= 68 && Math.random() < longShotProb) {
                this._attemptShoot(player, goalX);
                if (hasFinesse) {
                    this.eventsQueue.push({ type: 'shoot', player: player.name, desc: ` ${player.name}, 수비 틈 사이로 환상적인 궤적의 ZD 감아차기 슈팅!!` });
                } else if (hasPowerShot) {
                    this.eventsQueue.push({ type: 'shoot', player: player.name, desc: ` ${player.name}, 아크 정면에서 골문을 찢을 듯한 벼락 레이저 파워슛!!` });
                } else {
                    this.eventsQueue.push({ type: 'shoot', player: player.name, desc: ` ${player.name}, 상대 밀집 수비를 뚫지 않고 아크 정면에서 기습 중거리 슈팅!!` });
                }
                return;
            }
        }

        // 수비수의 근접 가로채기 및 태클 (드리블/패스 전 압박 경합)
        if (nDef && nDef.dist < 4.5) {
            const defTackleStat = this.getEffectiveStat(nDef.player, 'tackle') || this.getEffectiveStat(nDef.player, 'defense');
            const distBonus = Math.max(0, (4.5 - nDef.dist) * 5.5);
            const baseTackleTryChance = 28 + ((defTackleStat - 65) * 0.42) + distBonus;
            if (Math.random() * 100 < clamp(baseTackleTryChance, 20, 65)) {
                if (this._attemptTackle(nDef.player, player)) return;
            }
        }

        const frontCrowd = this._numOpponentsAhead(player, 10, 18);
        const roleCanCarry = player.position === 'FW' ||
            isFlankWinger ||
            ['CM', 'BBM', 'MEZ'].includes(player.role) ||
            ['AM', 'AP', 'SS', 'IW', 'IF', 'W', 'WB', 'CWB'].includes(player.role);
        const isCentralForward = player.position === 'FW' && !isFlankWinger;
        const clearForwardRun = !underPressure && frontCrowd === 0 &&
            !this._isFrontalBlocked(player, goalX);

        // 전방이 완전히 비었고 수비수 한 명만 제치면 골문과 마주하는 경우에는
        // 안전한 후퇴 패스가 carry 판단을 덮어쓰지 못하게 한다.
        const hasClear1v1Runway = !underPressure &&
            frontCrowd === 0 &&
            !this._isFrontalBlocked(player, goalX) &&
            distToGoal > 14 &&
            player.position !== 'DF';
        if (hasClear1v1Runway && bestPassIsRetreat) {
            if (!roleCanCarry) {
                if (bestPassTarget) this._executePassV3(player, bestPassTarget, phase);
                return;
            }
            player._dribbleCommit = 2;
            if (player.burstTimer <= 0 && isConfidentDribbler) player.burstTimer = 10;
            this._dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effectSpeed);
            return;
        }

        // 앞이 열려있거나 측면 윙어가 1v1 찬스를 맞이했을 때는 자신감 있게 전진 드리블 선택 (패스와 균형 유지)
        const midfielderCarryBias = ['CM', 'BBM', 'MEZ'].includes(player.role) &&
            !underPressure && frontCrowd === 0 && phase !== 'finalThird' &&
            carryScore >= passScore - 10;
        const wingerDribbleBias = isFlankWinger && (!underPressure || nDef.dist >= 4.0) && frontCrowd <= 1 && distToGoal <= 62 && carryScore >= passScore - 12;
        const forwardDribbleBias = isCentralForward && clearForwardRun &&
            (distToGoal <= 28 || carryScore >= passScore + 8);
        if (bestPassTarget && player.position !== 'DF' && (!isCutback && !isCross) &&
            roleCanCarry &&
            (!isBuildUpFirstTactic || passScore < carryScore - 16) &&
            (wingerDribbleBias || midfielderCarryBias || forwardDribbleBias)) {
            player._dribbleCommit = isFlankWinger ? 2 : 1;
            if (player.burstTimer <= 0 && isConfidentDribbler && !underPressure && frontCrowd <= 1) player.burstTimer = 9;
            this._dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effectSpeed);
            return;
        }

        // [4단계] 볼 순환(Circulation) & 패스 전개 (패스 우선순위: 전진 > 지원 > 원투 > 재순환 > 최후 수단 드리블)
        if (bestPassTarget && Number.isFinite(bestPassScore) && (
            passScore >= carryScore - (isShortCombinationTactic ? 20 : 6) ||
            player.position === 'DF' || underPressure || (isBuildUpFirstTactic && phase === 'building'))) {
            const isBackwardPass = Math.abs(bestPassTarget.x - goalX) > distToGoal + 1.5;
            // 전방(골문 28m 이내) 공격 자원이 백패스를 선택하려 할 때, 더 좋은 전방 대안이 있으면 전방 우선!
            if ((player.position === 'FW' || distToGoal <= 28) && isBackwardPass && !isCutback && !isCross) {
                let forwardAlt = null;
                let forwardAltScore = -Infinity;
                for (const tm of teammates) {
                    const tmDistToGoal = Math.abs(tm.x - goalX);
                    if (tmDistToGoal <= distToGoal + 1.5) {
                        const s = this._scorePass(player, tm, phase);
                        if (s > forwardAltScore) {
                            forwardAltScore = s;
                            forwardAlt = tm;
                        }
                    }
                }
                if (forwardAlt && forwardAltScore >= 25) {
                    this._executePassV3(player, forwardAlt, phase);
                    return;
                }
                // 전진 선택지가 없으면 무리한 억지 드리블 대신 안전한 2선/3선 재순환 실행
                this._executePassV3(player, bestPassTarget, phase);
                return;
            }
            this._executePassV3(player, bestPassTarget, phase);
            return;
        }

        // 4) 최후의 수단: 패스 선택지가 전혀 없거나 극도로 불리할 때만 드리블 carry / 볼 보호
        if (bestPassTarget && Number.isFinite(bestPassScore) && !roleCanCarry) {
            this._executePassV3(player, bestPassTarget, phase);
            return;
        }
        if (bestPassTarget && Number.isFinite(bestPassScore) && (player.position === 'FW' && (underPressure || frontCrowd >= 2))) {
            // [6단계] 고립된 스트라이커(ST)는 무리한 단독 돌파 대신 원터치 벽패스/지원 패스 선택!
            this._executePassV3(player, bestPassTarget, phase);
            return;
        }
        if (bestPassTarget && Number.isFinite(bestPassScore) && (!underPressure && frontCrowd >= 2)) {
            // 전방이 밀집 수비로 꽉 막혔을 때는 무리한 단독 드리블 대신 패스 선택!
            this._executePassV3(player, bestPassTarget, phase);
            return;
        }
        player._dribbleCommit = player.position === 'DF' ? 0 : 1;
        if (player.burstTimer <= 0 && isConfidentDribbler && !underPressure) player.burstTimer = 8;
        this._dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effectSpeed);
    }

    _gkAI(gk) {
        const under = this._isUnderPressure(gk);
        const tid = gk.teamId;
        const isHome = tid === 'home';
        gk.vx *= 0.3; gk.vy *= 0.3;
        const homeX = gk.baseX || (isHome ? 3.2 : 96.8);
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
        return this.players.some(p => p.teamId !== player.teamId && Math.hypot(p.x - player.x, p.y - player.y) < 4.8);
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

    _findSafeCirculationTarget(from, phase) {
        const teammates = this.players.filter(p =>
            p.teamId === from.teamId &&
            p !== from &&
            p.position !== 'GK' &&
            (p.position === 'DF' || p.position === 'MF')
        );
        let best = null;
        let bestScore = -Infinity;
        let fallback = null;
        let fallbackScore = -Infinity;
        for (const to of teammates) {
            const score = this._scorePass(from, to, phase);
            if (!Number.isFinite(score)) continue;
            const nearOpponents = this.players.filter(opp =>
                opp.teamId !== from.teamId &&
                opp.position !== 'GK' &&
                Math.hypot(opp.x - to.x, opp.y - to.y) < 9
            ).length;

            const goalX = from.teamId === 'home' ? 100 : 0;
            const fromDist = Math.abs(from.x - goalX);
            const toDist = Math.abs(to.x - goalX);
            const isBackwardOrLateral = toDist >= fromDist - 1;
            const supportBonus = isBackwardOrLateral ? 28 : 0;
            const sameChannelBonus = Math.abs(to.y - from.y) <= 26 ? 10 : 0;
            const safeScore = score + supportBonus + sameChannelBonus - nearOpponents * 20;
            if (safeScore > fallbackScore) {
                fallbackScore = safeScore;
                fallback = to;
            }
            if (nearOpponents >= 2) continue;
            if (safeScore > bestScore) {
                bestScore = safeScore;
                best = to;
            }
        }
        return best || fallback;
    }

    // ─────────────────────────────────────────────────────────────
    //  PASS SCORING + PROBABILITY V3 (FLOW AWARE!)
    // ─────────────────────────────────────────────────────────────
    _scorePass(from, to, phase) {
        const isHome = from.teamId === 'home';
        const tid = from.teamId;
        const tSettings = (this.tacticSettings && this.tacticSettings[tid]) ? this.tacticSettings[tid] : {};
        const goalX = isHome ? 100 : 0;
        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        const dFromGoal = Math.abs(from.x - goalX);
        const dToGoal = Math.abs(to.x - goalX);
        const forward = dToGoal < dFromGoal - 1;
        const back = dToGoal > dFromGoal + 1.5;
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
        // 패스 길목이 막힌 패스는 전진/순환 의도와 무관하게 선택하지 않는다.
        // 후보가 모두 막히면 상위 의사결정에서 드리블 또는 안전한 백패스로 전환한다.
        if (laneBlock > 0) return -Infinity;

        // Space around receiver
        let oppNearRecv = 0;
        for (const opp of this.players) {
            if (opp.teamId === tid || opp.position === 'GK') continue;
            if (Math.hypot(opp.x - to.x, opp.y - to.y) < 9) oppNearRecv++;
        }

        const isDirectBuildUp = tSettings.buildUp === 'direct' || tSettings.passLength === 'direct';
        const isLinkupTarget = to._fwMode === 'linkup' || to._comingShort;
        const isBurstTarget = to._fwMode === 'burst' || to.burstTimer > 0;
        if (phase === 'building' && to.position === 'FW' && !isDirectBuildUp && !isLinkupTarget) {
            if (!isBurstTarget) return -Infinity;
        }
        let score = 0;
        if (oppNearRecv >= 2) {
            if (phase !== 'finalThird' && to.position === 'FW' && !isLinkupTarget && !isBurstTarget) {
                return -Infinity;
            }
            score -= (phase === 'finalThird' ? 24 : 50);
        }
        if (oppNearRecv >= 3 && phase !== 'finalThird') return -Infinity;

        // [공격 다변화: 컷백, 크로스, 사이드 체인지 전환, 2대1 원투 연계 판별]
        const isCutbackCandidate = (dFromGoal <= 18 && Math.abs(from.y - 50) > 16 && dToGoal <= 26 && Math.abs(to.y - 50) <= 24 && dToGoal >= dFromGoal + 2);
        const isCrossCandidate = (dFromGoal <= 36 && Math.abs(from.y - 50) > 16 && dToGoal <= 22 && Math.abs(to.y - 50) <= 26 && dToGoal < dFromGoal + 2);
        const isSwitchPlay = Math.abs(from.y - 50) > 18 && Math.abs(to.y - 50) > 18 && (Math.sign(from.y - 50) !== Math.sign(to.y - 50)) && dist > 28;
        const isOneTwoCandidate = from._receivedFromId && to.id === from._receivedFromId;

        // [4단계] 후퇴 패스 정상화: 과도한 후퇴만 제한하고 적당한 후퇴/재순환은 허용
        if (back && !isCutbackCandidate) {
            if (dFromGoal <= 18 && (dToGoal - dFromGoal > 10 || to.position === 'DF')) return -Infinity;
            if (from.position === 'FW' && to.position === 'DF' && dToGoal - dFromGoal > 16) return -Infinity;
            if (to.position === 'GK' && dFromGoal <= 55) return -Infinity;
        }

        // [장거리 패스 감점 강화 & 탁구 축구 억제]
        if (dist < 5) score -= 8;
        if (dist > 45) score -= ((dist - 45) * 1.8 + 24);
        else if (dist > 28) score -= ((dist - 28) * 1.1 + 8);

        // [가로지르는 패스(Cross-field / 대각선 횡단 패스) 대폭 억제 및 인접 채널 연계 우대]
        const yShift = Math.abs(to.y - from.y);
        const isSameOrAdjChannel = yShift <= 26;
        const isShortCombination = dist >= 5 && dist <= 24 && yShift <= 24 && laneBlock === 0;
        const isSafeSupportTarget = oppNearRecv <= 1 && isShortCombination;
        if (isCrossCandidate || isCutbackCandidate) {
            // 박스 안 크로스 및 컷백은 중앙 투입이므로 yShift 감점 면제
        } else {
            if (yShift > 38) score -= (75 + (yShift - 38) * 2.0);
            else if (yShift > 24) score -= (34 + (yShift - 24) * 1.5);
            else if (yShift > 15) score -= (10 + (yShift - 15) * 0.8);
            else if (dist <= 22) score += 18; // 같은 레인/인접 채널 짧은 연계 우대
        }

        // [밑에서 받으러 오는 선수(Check-to-Ball / Link-up) 패스 우대]
        if ((to._fwMode === 'linkup' || to._comingShort) && isSameOrAdjChannel && dist >= 6 && dist <= 26 && laneBlock === 0 && !back) {
            score += 36;
        }

        // 공격수도 고립되면 돌파보다 벽패스/원투패스를 선택할 수 있어야 한다.
        if (from.position === 'FW' && isSafeSupportTarget) {
            if (to.position === 'MF') score += 26;
            else if (to.position === 'FW') score += 18;
            else if (to.position === 'DF' && fromUnderPressure) score += 14;
        }
        if (from.position === 'FW' && isOneTwoCandidate && !back) score += 22;

        // [4단계] 삼각형 유지 보너스: from과 to 사이에 제3의 아군이 삼각형(열린 패스 각도)을 형성할 때
        const matesPool = this.players.filter(p => p.teamId === tid && p !== from && p !== to && p.position !== 'GK');
        const hasTriangleSupport = matesPool.some(tm => {
            const d1 = Math.hypot(from.x - tm.x, from.y - tm.y);
            const d2 = Math.hypot(to.x - tm.x, to.y - tm.y);
            if (d1 < 5 || d1 > 22 || d2 < 5 || d2 > 22) return false;
            const area = Math.abs((to.x - from.x) * (tm.y - from.y) - (to.y - from.y) * (tm.x - from.x));
            return area > 24;
        });
        if (hasTriangleSupport && dist <= 24 && laneBlock === 0) {
            score += 16;
        }

        // [볼 순환(Possession Circulation) & 전개 템포 조절]
        const isFrontBlocked = this._isFrontalBlocked(from, goalX);
        const frontDefCount = this._numOpponentsAhead(from, 8, 14);
        const myTSet = (this.tacticSettings && this.tacticSettings[tid]) || {};
        const isLowTempo = myTSet.tempo === 'low' || myTSet.tempo === 'normal';

        if (forward) {
            score += phase === 'building' ? 20 : (phase === 'progressing' ? 32 : 40);
        } else if (later) {
            // 횡패스: 피치를 길게 가로지르지 않는 인접 동료(yShift <= 22)에게만 순환 보너스 부여
            if ((isFrontBlocked || frontDefCount >= 2) && yShift <= 22) {
                if (oppNearRecv === 0) score += 30;
                else score += 12;
            } else {
                score += (isLowTempo && yShift <= 18 ? 8 : -6);
            }
        } else if (back) {
            if (isCutbackCandidate) {
                score += 95; // 컷백 패스는 최우선 찬스로 가산!
            } else if (from.position === 'FW') {
                // 공격수가 전방이 막혔거나 압박을 받을 때, 열린 2선 미드필더에게 내주는 짧은 재순환은 적극 장려!
                const isShortDropBack = (to.position === 'MF' || ['DM', 'CM', 'AM'].includes(to.role)) &&
                    dist <= 22 && oppNearRecv <= 1 && laneBlock === 0 && (dToGoal - dFromGoal <= 14);
                if ((isFrontBlocked || frontDefCount >= 2 || fromUnderPressure) && isShortDropBack) {
                    score += 38; // 2선 원투/재순환 찬스 가산
                } else if (dFromGoal <= 22) {
                    score -= 90; // 박스 안 슛 찬스에서 불필요한 백패스는 감점
                } else {
                    score -= (isLowTempo ? 10 : 25);
                }
            } else if (dFromGoal <= 32 && !isCutbackCandidate) {
                const isRecycleToMid = to.position === 'MF' && dist <= 20 && oppNearRecv <= 1;
                if ((isFrontBlocked || frontDefCount >= 2 || fromUnderPressure) && isRecycleToMid) {
                    score += 32;
                } else {
                    score -= 35;
                }
            } else if ((isFrontBlocked || frontDefCount >= 2 || fromUnderPressure) && oppNearRecv === 0 && laneBlock === 0 && yShift <= 22) {
                // 중원/후방에서 전방이 밀집 수비로 꽉 막혔을 때만 인접 노마크 동료에게 재정비 빌드업 패스!
                score += 42;
                if (isLowTempo) score += 14;
            } else if (phase === 'building' && yShift <= 22) {
                score += (oppNearRecv === 0 ? 20 : -15);
            } else {
                score -= (isLowTempo ? 12 : 28);
            }
        }

        // [4단계] 전술별 패스 의도 차별화
        const tactic = this.getTeamTactic(tid);
        if (tactic === 'tikitaka') {
            if (isOneTwoCandidate && !back) score += 28;
            if (isBurstTarget && forward && isSameOrAdjChannel) score += 26;
            if (hasTriangleSupport && dist <= 20) score += 20;
            if (dist >= 6 && dist <= 18 && oppNearRecv <= 1) score += 22;
            if (dist > 28) score -= 25;
        } else if (tactic === 'possession') {
            if (later && dist <= 24 && yShift <= 22 && oppNearRecv <= 1) score += 24;
            if (back && oppNearRecv <= 1 && laneBlock === 0 && dist <= 22) score += 26;
            if (hasTriangleSupport && dist <= 22) score += 18;
            if (forward && dist > 26) score -= 14;
        } else if (tactic === 'lavolpiana') {
            if (from.position === 'DF' && to.position === 'MF' && forward && yShift <= 26) score += 28;
            if (from.position === 'MF' && to.position === 'DF' && back && yShift <= 22) score += 18;
            if (from.position === 'DF' && ['DM', 'CDM', 'DLP', 'REG'].includes(to.role)) score += 34;
            if (['DM', 'CDM', 'DLP', 'REG'].includes(from.role) && (to.position === 'MF' || to.role.includes('B'))) score += 30;
        } else if (tactic === 'counter' || tactic === 'longBall') {
            if (forward && dist >= 14) score += 22;
            if (isBurstTarget && forward) score += 22;
            if (later && dist < 12) score -= 6;
            if (tactic === 'longBall' && isFrontBlocked && oppNearRecv <= 1 && dist <= 22) score += 20;
        }

        // [6단계] 상대 전술 상성 판별 및 맞춤 패스 선택
        const oppProfile = this._getOpponentTacticalProfile(tid);

        // 1) 상대 하이라인 공략: 뒷공간 침투 패스, 빠른 전방 전환
        if (oppProfile.isHighLine) {
            if (forward && (to._fwMode === 'burst' || to.burstTimer > 0)) {
                score += 36; // 뒷공간 킬패스 최우선 가산!
            } else if (forward && dist >= 16 && (to.position === 'FW' || ['W', 'IW', 'IF'].includes(to.role))) {
                score += 26;
            }
            if (back && !isCutbackCandidate) score -= 12;
        }

        // 2) 상대 로우블록(밀집 수비) 공략: 측면 벌리기, 컷백, 2선 중거리/세컨드볼 연계
        if (oppProfile.isLowBlock) {
            if (isCutbackCandidate) score += 35; // 컷백 최우선
            if (Math.abs(to.y - 50) > 18 && isSameOrAdjChannel) score += 28; // 측면 벌리기
            const isLateSecondWave = to.position === 'MF' && ['AM', 'CM', 'BBM', 'SS'].includes(to.role) && dToGoal >= 18 && dToGoal <= 28;
            if (isLateSecondWave) score += 28; // 2선 쇄도 자원 활용
            if (forward && dist < 18 && oppNearRecv >= 2 && !isBurstTarget) score -= 30; // 좁은 중앙 틈새 억지 투입 방지
            if (later && oppNearRecv <= 1 && dist <= 22) score += 22; // 블록을 흔들기 위한 횡순환
        }

        // 3) 상대 강한 전방 압박(게겐프레싱) 공략: 원터치 연계, 후방 안전 탈출, 반대전환
        if (oppProfile.isAggressivePress) {
            if (isOneTwoCandidate && !back) score += 32; // 원터치 리턴 패스 탈압박
            if (isSwitchPlay) score += 34; // 압박이 쏠린 반대편 약점으로 대각 전환
            if (back && to.position !== 'FW' && oppNearRecv <= 1 && laneBlock === 0) score += 24; // 후방 안전 재순환
        }

        // 4) 상대 중앙 밀집(Narrow Defense) 공략: 측면 공간 활용
        if (oppProfile.isCentralDense && !oppProfile.isLowBlock) {
            if (Math.abs(to.y - 50) > 20) score += 26; // 측면으로 벌리는 패스
            if (isSwitchPlay) score += 28;
            if (Math.abs(from.y - 50) <= 15 && Math.abs(to.y - 50) <= 15 && forward && oppNearRecv >= 2) score -= 25;
        }

        // 5) 경기 상황별(스코어 & 시간) 전술 동적 보정
        const myScore = (tid === 'home' ? this.homeScore : this.awayScore) || 0;
        const oppScore = (tid === 'home' ? this.awayScore : this.homeScore) || 0;
        const scoreDiff = myScore - oppScore;

        if (scoreDiff >= 1) {
            // 앞서고 있을 때: 무리한 전진보다 점유와 안전한 재순환 강화
            if ((later || back) && oppNearRecv <= 1 && laneBlock === 0 && dist <= 24) score += 18;
            if (forward && dist > 32) score -= 14;
        } else if (scoreDiff <= -1) {
            // 뒤지고 있을 때: 과감한 전진 패스와 박스 침투 우선
            if (forward && (to.position === 'FW' || isBurstTarget)) score += 22;
            if (back && !isCutbackCandidate) score -= 16;
        }

        // 수비에 둘러싸인 수신자는 빌드업에서 패스 후보가 되지 않는다.
        // GK never pass target
        if (to.position === 'GK') score -= 120;

        //  BUILDING PHASE SUBDIVISION: early vs late (fixes buildup stagnation!)
        const isHomeFr = from.teamId === 'home';
        const distFromOwnGoal = isHomeFr ? from.x : (100 - from.x);
        const inLateBuild = (phase === 'building' && distFromOwnGoal >= 22);

        // Prefer position based on phase
        if (phase === 'building') {
            if (inLateBuild && from.position !== 'GK') {
                // 늦은 빌드업에서도 먼저 MF/DF를 거쳐 전진한다. FW 직행은
                // 링크업 또는 명시적인 다이렉트 전술일 때만 허용한다.
                if (to.position === 'FW' && (to._fwMode === 'linkup' || tSettings.passLength === 'direct')) {
                    score += (isSameOrAdjChannel ? 22 : 6);
                } else if (to.position === 'MF') score += (isSameOrAdjChannel ? 28 : 8);
                else if (to.position === 'DF') score += from.position === 'DF' ? 8 : -25;
                if (to._fwMode === 'linkup' && isSameOrAdjChannel) score += 28;
            } else {
                // Early build-up (GK/CB area)
                const isDirectBuildup = tSettings.buildUp === 'direct' || tSettings.passLength === 'direct';
                if (isDirectBuildup) {
                    // [다이렉트 빌드업 / 카운터] 같은 사이드 전방 FW 및 측면 윙어에게 연결
                    if (to.position === 'FW' && isSameOrAdjChannel) score += 50;
                    else if (to.position === 'MF' && Math.abs(to.slotY - 50) > 18 && isSameOrAdjChannel) score += 42;
                    else if (to.position === 'MF') score += 12;
                    else if (to.position === 'DF') score += 8;
                } else {
                    // 짧은 빌드업: 밑으로 받으러 온 인접 MF/DF 분배
                    if (to.position === 'DF' && isSameOrAdjChannel) score += 18;
                    else if (to.position === 'MF' && isSameOrAdjChannel) score += 38;
                    else if (to.position === 'FW' && isSameOrAdjChannel) score += (to._fwMode === 'linkup' ? 32 : 12);
                }
            }
        } else if (phase === 'progressing') {
            const isWideTarget = Math.abs(to.slotY - 50) > 18;
            const isWingerTarget = ['W', 'IW', 'IF', 'LM', 'RM'].includes(to.role);
            if (to.position === 'FW') score += (isSameOrAdjChannel ? 40 : 12);
            else if (to.position === 'MF') {
                if (isSameOrAdjChannel) score += (isWingerTarget ? 48 : (isWideTarget ? 34 : 24));
                else score += 6;
            }
            
            // [오버래핑 윙백/풀백 특급 지원] 같은 사이드에서 오버래핑 중인 풀백에게만 대폭 가산!
            if (to._fbMode === 'overlap' && isSameOrAdjChannel) score += 70;
            else if (to.position === 'DF') score -= 35;

            // Burst / Linkup FW trigger
            if (isBurstTarget && isSameOrAdjChannel) score += 42;
            if (to._fwMode === 'linkup' && isSameOrAdjChannel) score += 42;
        } else {
            // finalThird
            const isWideTarget = Math.abs(to.slotY - 50) > 18;
            const isWingerTarget = ['W', 'IW', 'IF', 'LM', 'RM'].includes(to.role);
            if (to.position === 'FW') score += 50;
            else if (to.position === 'MF' && (!back || isCutbackCandidate)) {
                if (isSameOrAdjChannel) score += (isWingerTarget ? 46 : (isWideTarget ? 40 : 16));
                else score += 8;
            }
            
            // 파이널 서드 오버래핑 풀백 크로스 연계 가산 (같은 사이드 전방 침투 시에만 가산)
            if (to._fbMode === 'overlap' && isSameOrAdjChannel && (!back || isCutbackCandidate)) score += 75;
            else if (to.position === 'DF') score -= 60;

            if (isBurstTarget && isSameOrAdjChannel) score += 65;
            
            // [공격 다변화: 측면 크로스 & 컷백 로직 - 윙어/윙백 활약 극대화]
            const isWingerOrWB = Math.abs(from.y - 50) > 16 || from._fbMode === 'overlap' || ['W', 'IW', 'IF', 'WB', 'CWB', 'LM', 'RM'].includes(from.role);
            if (isWingerOrWB && dFromGoal <= 34) {
                const isTargetFinisher = to.position === 'FW' || ['SS', 'BBM', 'AM'].includes(to.role);
                if (isCutbackCandidate && isTargetFinisher) {
                    score += 125; // 컷백 최우선 찬스!
                } else if (isCrossCandidate && isTargetFinisher) {
                    score += 115; // 크로스 최우선 찬스!
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
            if (later && dist > 8 && isSameOrAdjChannel) score += 8;
            if (to.position === 'FW' && isSameOrAdjChannel) score += 18;
            else if (to.position === 'MF' && !back && isSameOrAdjChannel) score += 14;
            if (oppNearRecv === 0 && !back && isSameOrAdjChannel) score += 14;
            if (laneBlock === 0 && dist > 10 && !back && isSameOrAdjChannel) score += 10;
            // Bonus for short support pass to free nearby teammate
            if (dist < 14 && oppNearRecv === 0 && !back && isSameOrAdjChannel) score += 16;
        }
        if (phase !== 'finalThird' && to.position === 'DF' && from.position !== 'DF') score -= 10;

        // [NEW] Wing-to-wing pass: from one wide flank to the opposite wide flank
        // (e.g., left winger to right winger) — nearly impossible in real football
        const fromFarLeft  = from.y < 28;
        const fromFarRight = from.y > 72;
        const toFarLeft    = to.y < 28;
        const toFarRight   = to.y > 72;
        const isOppositeFlanks = (fromFarLeft && toFarRight) || (fromFarRight && toFarLeft);
        if (isOppositeFlanks) score -= 110; // 반대편 터치라인으로 가로지르는 패스 강력 억제

        // ─────────────────────────────────────────────────────────────
        // [인과관계 전술 엔진] 6대 전술 & 중원 우회 & 3자 패스 & 롤 시너지
        // ─────────────────────────────────────────────────────────────
        const oppTeamId = from.teamId === 'home' ? 'away' : 'home';

        // 1. 중원 전력 비교 (인과관계 판정)
        const myMidStr = this.getMidfieldStrength(from.teamId);
        const oppMidStr = this.getMidfieldStrength(oppTeamId);
        const isMidOutmatched = oppMidStr > (myMidStr + 2.5);

        // 2. [중원 우회 (Bypass Midfield)]
        // 중앙이 밀리는데 감독이 [다이렉트 빌드업 / 다이렉트 패스 / 넓은 너비]를 지시한 경우:
        // 후방에서 중앙 미드필더를 거치지 않고 같은 사이드의 측면 윙어/풀백이나 타겟맨에게 투입!
        const isBypassTactics = tSettings.buildUp === 'direct' || tSettings.passLength === 'direct' || tSettings.width === 'wide';
        const isWideTarget = Math.abs(to.y - 50) > 22 || ['W', 'IW', 'IF', 'CWB', 'WB', 'FB', 'LM', 'RM'].includes(to.role);
        const isTargetMan = to.role === 'TM' || (to.traits && to.traits.some(t => t.includes('공중의 성벽') || t.includes('강력한 어깨')));

        if (isMidOutmatched && isBypassTactics && !back) {
            if ((isWideTarget && isSameOrAdjChannel) || isTargetMan) {
                score += 48; // 상대 막강 중원을 우회하는 같은 채널 측면/타겟 패스 우대!
                if (isTargetMan) score += 20;
            } else if (to.position === 'MF' && Math.abs(to.y - 50) < 18) {
                score -= 35; // 상대 중원 한가운데로 주는 무모한 패스 자제
            }
        }

        // 3. [측면 3자 패스 (Triangular Combination Play)]
        // 풀백(DF) - 윙어(FW) - 미드필더(MF) 간의 유기적 측면 삼각 연계 (같은 사이드, 백패스 제외)
        const isTriangular = !back && isSameOrAdjChannel && (
                             (from.position === 'DF' && to.position === 'FW' && isWideTarget) ||
                             (from.position === 'FW' && to.position === 'DF' && to._fbMode === 'overlap') ||
                             (from.position === 'FW' && to.position === 'MF' && ['BBM', 'SS', 'MEZ', 'AM'].includes(to.role))
                             );
        if (isTriangular && (tSettings.width === 'wide' || tSettings.tempo === 'fast' || tSettings.buildUp !== 'direct')) {
            score += 48; // 측면 3자 패스 가산점!
        }

        // 4. [롤 특화: 펄스나인(F9) & 타겟맨(TM) 연계 후 윙어/2선 킬패스]
        const fromBhv = this.getRoleBehavior(from.role);
        if (fromBhv.dropDeep || from.role === 'F9' || from.role === 'TM' || from.role === 'DLF') {
            if ((to.position === 'FW' || to.role === 'SS' || to.role === 'BBM') && to !== from && isSameOrAdjChannel && (to._fwMode === 'burst' || dToGoal < dFromGoal)) {
                score += 75; // F9/타겟맨이 수비를 끌어낸 뒤 쇄도하는 윙어에게 찌르는 킬패스!
            }
        }

        // 5. [롤 특화: 딥라잉 플레이메이커(DLP) / 레지스타(REG) / BPD의 반대전환 패스 절제]
        if ((fromBhv.switchPlay || ['DLP', 'REG', 'BPD'].includes(from.role)) && fromUnderPressure && oppNearRecv === 0 && laneBlock === 0) {
            const isSwitch = Math.abs(from.y - to.y) > 36 && forward;
            if (isSwitch && isWideTarget) {
                score += 18; // 압박 시에만 제한적으로 허용 (무분별한 대각선 횡단 패스 방지)
            }
        }

        // 6. [미드필더의 분산 연계] 같은 채널의 윙어, 오버래핑 풀백, 2선 쇄도, 밑으로 내려온 공격수에게 골고루 분배
        if (from.position === 'MF' && isSameOrAdjChannel) {
            if (isWideTarget) score += 22; // 같은 사이드 윙어/와이드MF에게 볼 배급
            if (to.role === 'SS' || to.role === 'BBM') score += 20; // 2선 쇄도 자원에게 연결
            if (to.position === 'DF' && to._fbMode === 'overlap') score += 30; // 오버래핑 풀백 지원
            if (to.position === 'FW') {
                if (to._fwMode === 'linkup') score += 28; // 밑으로 받으러 내려온 공격수 발밑 배급!
                else if (to._fwMode === 'burst') score += 20;
                else score += 10;
            }
        }

        // 7. [전술 설정 반영]
        if (tSettings.offensiveTrans === 'counter' && forward && (phase === 'counter' || phase === 'progressing')) score += 25;
        if (tSettings.passLength === 'short' && dist < 18 && !back) score += 18;
        if (tSettings.passLength === 'direct' && dist > 24 && forward && isSameOrAdjChannel) score += 24;
        if (tSettings.width === 'wide' && isWideTarget && !back && isSameOrAdjChannel) score += 20;
        if (tSettings.width === 'narrow' && !isWideTarget && forward) score += 18;

        return score;
    }

    _calcPassProbV3(player, phase, underPressure, isWinger, distToGoal, nDef) {
        const role = player.role;
        const pos = player.position;
        const isCB_def = pos === 'DF' && ['CD', 'BPD', 'NCB'].includes(role);
        const isFB = pos === 'DF' && ['FB', 'WB', 'CWB', 'IWB'].includes(role);
        const ph = player.teamId === 'home' ? player.x : (100 - player.x);
        const lateBuild = (phase === 'building' && ph >= 22);
        const tSt = (this.tacticSettings && this.tacticSettings[player.teamId]) ? this.tacticSettings[player.teamId] : {};
        let p = 0.4;

        // BUILD-UP
        if (phase === 'building') {
            if (pos === 'GK') p = 0.99;
            else if (isCB_def) {
                p = underPressure ? 0.96 : (lateBuild ? 0.72 : 0.82);
            } else if (isFB) {
                p = underPressure ? 0.92 : (lateBuild ? 0.45 : 0.60);
            } else if (pos === 'MF') {
                p = underPressure ? (lateBuild ? 0.78 : 0.90) : (lateBuild ? 0.45 : 0.65);
            } else {
                p = underPressure ? 0.65 : 0.45;
            }
        } else if (phase === 'progressing') {
            // [자신감 있는 볼 운반 & 드리블 빈도 상향]
            if (isCB_def) p = 0.88;
            else if (isFB) p = underPressure ? 0.72 : 0.35;
            else if (pos === 'MF') {
                p = isWinger ? 0.30 : 0.44;
                if (tSt.tempo === 'fast' || tSt.passLength === 'direct') p += 0.14;
                if (tSt.tempo === 'slow') p -= 0.15;
                if (underPressure) p += 0.15;
                const nearFinal = (player.teamId === 'home' && player.x > 60) || (player.teamId === 'away' && player.x < 40);
                if (nearFinal) p += isWinger ? -0.08 : 0.08; // 윙어는 상대 진영 진입 시 더욱 과감히 돌파!
            } else {
                p = 0.24;
                if (underPressure) p = 0.45;
            }
        } else {
            // finalThird: 깊숙이 파고든 뒤 크로스/컷백, 그 전에는 과감한 돌파!
            if (isWinger && distToGoal < 16) p = 0.76; // 엔드라인 깊숙이 진입 시 크로스/컷백
            else if (isWinger) p = 0.28; // 박스 외곽~측면에서는 자신감 있게 1v1 드리블 돌파!
            else if (pos === 'FW') p = 0.22; // 공격수는 적극적인 돌파 & 피니시
            else if (pos === 'MF') p = 0.42;
            else p = 0.45;
        }

        if (tSt.tempo === 'fast') p = Math.min(0.98, p + 0.08);
        if (tSt.tempo === 'slow') p = Math.max(0.15, p - 0.08);

        const profile = this.getTacticProfile(player.teamId);
        p += (profile.tempo - 0.92) * 0.25;

        if (tSt.offensiveTrans === 'counter' && (phase === 'counter' || phase === 'progressing')) p = Math.min(0.98, p + 0.12);
        if (tSt.buildUp === 'direct' && phase === 'building') p = Math.min(0.98, p + 0.20); // 롱볼 빌드업 즉시 롱패스!
        if (underPressure) p = Math.min(0.98, p + 0.06);
        return clamp(p, 0.08, 0.96);
    }

    _scoreCarryChoice(player, phase, underPressure, isWinger, distToGoal, nDef) {
        const isDefender = player.position === 'DF';
        const isHoldingMidfielder = player.position === 'MF' &&
            ['DM', 'CDM', 'ANC', 'DLP', 'BWM', 'REG', 'HB'].includes(player.role);
        const isCentralMidfielder = player.position === 'MF' &&
            ['CM', 'BBM', 'MEZ', 'REG'].includes(player.role);
        const isProgressiveMidfielder = player.position === 'MF' &&
            ['CM', 'BBM', 'MEZ'].includes(player.role);
        const isCreativeAttacker = player.position === 'MF' &&
            ['AM', 'AP', 'SS', 'IW', 'IF', 'W'].includes(player.role);
        const isCarryRole = player.position === 'FW' || isWinger || isCreativeAttacker ||
            isProgressiveMidfielder ||
            ['WB', 'CWB'].includes(player.role);
        if (isDefender && !['BPD', 'LIB'].includes(player.role)) return -55;
        if (isHoldingMidfielder) return -28;
        const tactic = this.getTeamTactic(player.teamId);
        let score = 18;
        const speed = this.getEffectiveStat(player, 'speed');
        const decision = this.getEffectiveStat(player, 'decision');
        const dribble = this.getEffectiveStat(player, 'dribble');
        const blockedAhead = this._numOpponentsAhead(player, 10, 16);
        const isFlankWinger = isWinger || ['LW', 'RW', 'LM', 'RM'].includes(player.detailPosition);

        if (phase === 'building') score += player.position === 'MF' ? 6 : 2;
        else if (phase === 'progressing') score += player.position === 'MF' ? 12 : 10;
        else score += player.position === 'FW' ? 16 : 12;

        // 포지션 및 측면 공간 보너스는 1대1 상황을 만들 때만 제한적으로 적용한다.
        if (isFlankWinger) score += 10;
        else if (player.position === 'FW') score += 3;
        else if (player.position === 'MF' && ['AM', 'AP', 'MEZ', 'BBM', 'SS', 'IW', 'IF', 'W'].includes(player.role)) score += 6;
        if (Math.abs(player.y - 50) > 20 && !underPressure) score += 5;

        // 압박 및 수비 밀집도에 따른 합리적 판단 (압박 시 패스 우선)
        if (underPressure) score += (dribble >= 82 ? -14 : -30);
        else if (player.position !== 'DF') score += 3;

        // 역할별 운반 원칙: 중앙 미드필더는 전진로가 명확할 때만,
        // 공격 역할과 윙어는 1대1 또는 열린 채널에서만 운반한다.
        if (!isCarryRole) score -= 24;
        if (isCentralMidfielder) score -= blockedAhead === 0 ? 0 : 14;
        if (isProgressiveMidfielder && !underPressure && blockedAhead === 0) {
            score += phase === 'progressing' ? 10 : 5;
        }
        if (isCreativeAttacker && blockedAhead <= 1 && !underPressure) score += 7;

        if (blockedAhead >= 2) score -= 32;
        else if (blockedAhead === 1) score -= 10;
        else if (blockedAhead === 0 && !underPressure) score += 10;

        if (distToGoal <= 28 && !underPressure && blockedAhead <= 1) {
            score += (player.position === 'FW' || isFlankWinger) ? 4 : 4;
        }
        // 선수 능력치는 유지하되, 전술적 패스 구조를 압도하지 않도록 완만하게 반영한다.
        score += (dribble - 70) * 0.45 + (speed - 70) * 0.30 + (decision - 70) * 0.15;
        if (tactic === 'possession' || tactic === 'tikitaka' || tactic === 'lavolpiana') score -= 18;
        if ((tactic === 'possession' || tactic === 'tikitaka') && !isCarryRole) score -= 10;
        if ((tactic === 'longBall' || tactic === 'twoLine') && phase === 'building') score -= 14;
        if (tactic === 'counter' && phase === 'building') score -= 8;
        if (tactic === 'counter' && phase === 'counter') score += 5;
        if (nDef && !underPressure && blockedAhead <= 1) {
            const defTackle = this.getEffectiveStat(nDef.player, 'tackle') || this.getEffectiveStat(nDef.player, 'defense');
            if (dribble > defTackle + 4) score += 7;
            if (speed > this.getEffectiveStat(nDef.player, 'speed') + 4) score += 6;
        }
        return score;
    }

    _executePassV3(from, to, phase) {
        from._ballHoldTicks = 0;
        from._dribbleCommit = 0;
        from._dribbleDistance = 0;
        from._postPassSupportTicks = 28;
        from._postPassSupportTarget = to;
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

        // V3: record in attack memory! (Date.now() 제거하여 배속 여부와 무관한 순수 결정론적 시간 기록)
        const idx = (this._attackMemIdx[tid]++) % 8;
        this._attackMemories[tid][idx] = { fromId: from.id, toId: to.id, x: to.x, t: this.matchTime * 100 + idx };

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

        // [FIFA 공식 오프사이드 규칙 정밀 판정 (패스 방출 순간 기준)]
        const isHomeAttacking = tid === 'home';
        const offsideLineX = this._calcOffsideLineX(isHomeAttacking);
        const inOpponentHalf = isHomeAttacking ? (to.x > 50) : (to.x < 50);
        const isForwardPass = isHomeAttacking ? (to.x > from.x + 0.5) : (to.x < from.x - 0.5);
        const isPastOffsideLine = isHomeAttacking ? (to.x > offsideLineX + 0.35) : (to.x < offsideLineX - 0.35);
        const isPotentialOffside = inOpponentHalf && isForwardPass && isPastOffsideLine && !isCutback;

        if (isPotentialOffside) {
            const opp = tid === 'home' ? 'away' : 'home';
            const oppTSet = (this.tacticSettings && this.tacticSettings[opp]) || {};
            const isOppHighLine = oppTSet.defensiveLine === 'high';
            
            const toDec = this.getEffectiveStat(to, 'decision');
            const toSpd = this.getEffectiveStat(to, 'speed');
            const toTraits = to.traits || [];
            const hasLineBreakTrait = toTraits.some(t => t.includes('라인') || t.includes('침투') || t.includes('스피드') || t.includes('오프더볼'));
            
            let onsideSaveProb = ((toDec + toSpd) * 0.32) + (hasLineBreakTrait ? 20 : 0);
            if (isOppHighLine) onsideSaveProb -= 12; // 상대가 하이라인 오프사이드 트랩 시 트랩에 더 잘 걸림!
            if (this.getTeamTactic(opp) === 'balanced') onsideSaveProb += 22; // 무전술 팀은 라인 통솔 부재로 오프사이드 트랩 실패 급증!
            
            const beatsTrap = (Math.random() * 100 < clamp(onsideSaveProb, 20, 85));
            if (!beatsTrap) {
                this.pendingOffside = {
                    receiver: to,
                    passer: from,
                    x: to.x,
                    y: to.y,
                    teamId: tid
                };
            } else {
                this.pendingOffside = null; // 찰나의 온사이드 인정 (라인 브레이킹 성공!)
            }
        } else {
            this.pendingOffside = null;
        }

        // [패스 타이밍 맞춤 침투 vs 발밑 연계 구분]
        // 스루패스이거나 이미 뒷공간 침투(burst) 중인 선수에게만 가속 침투를 걸어주고, 밑으로 받으러 온 선수(linkup/comingShort)는 발밑으로 연결!
        const isCheckingToBall = to._fwMode === 'linkup' || to._comingShort;
        if (!isCheckingToBall && (isThrough || (forward && to._fwMode === 'burst'))) {
            to.burstTimer = 24;
            to._fwMode = 'burst';
        }

        // [FLR 물리 이식] 패스 거리에 따른 실제 물리 탄도 속도 (거리 비례 동적 탄속 - 템포 완화)
        let strikeSpeed = 4.4;
        if (dist > 45) strikeSpeed = 5.6; // 긴 롱패스 / 반대전환 (5.6)
        else if (dist > 28) strikeSpeed = 5.0; // 중거리 패스 / 크로스 (5.0)
        else if (dist > 16) strikeSpeed = 4.5; // 전진/스루패스 (4.5)
        else strikeSpeed = 3.9; // 짧은 숏패스 / 볼 순환 (3.9)
        this.ball.speed = strikeSpeed;

        // accuracy
        let acc = this.getEffectiveStat(from, 'passing');
        if (to._fwMode === 'burst' && to.burstTimer > 0) acc += 8; // 과도한 침투 보너스 축소 (일방적 뒤공간 털림 완화)
        if (isCheckingToBall && dist <= 24) acc += 10; // 밑으로 받으러 온 동료에게 주는 발밑 패스 정확도 보너스
        if (isCross) acc += this.getRoleBehavior(from.role).hugLine ? 15 : -5;
        let distPen = Math.max(0, (dist - 20) * 0.7);
        if (passKind === 'risky') distPen *= 1.4;
        if (passKind === 'safe') distPen *= 0.7;
        if (from.position === 'GK' && dist > 40) distPen += 15;
        // [신규] 체력 고갈 시 치명적 패스 미스 페널티
        if (from.stamina < 40) distPen += 18;

        // [무전술 페널티: 패스 조직력 붕괴]
        const myTactic = this.getTeamTactic(tid);
        const oppTactic = this.getTeamTactic(tid === 'home' ? 'away' : 'home');
        if (myTactic === 'balanced') {
            distPen += 14; // 약속된 패스 플레이 부재로 인한 패스 미스 대폭 증가
        }
        // [전술 상성 패스 보정]
        // 티키타카가 밀집 수비(카테나치오/두줄수비/역습)를 상대할 때 좁은 틈새 킬패스 보너스
        if (myTactic === 'tikitaka' && ['catenaccio', 'twoLine', 'parkBus'].includes(oppTactic)) {
            distPen -= 8;
        }
        // 게겐프레싱 상대로 후방 빌드업(점유율/라볼피아나) 시 강한 전방 압박으로 패스 미스 증가
        if (oppTactic === 'gegenpress' && ['possession', 'lavolpiana'].includes(myTactic)) {
            distPen += 12;
        }

        // [중원 전력 차이 압박 (원인과 결과 축구)]
        // 상대 중원이 강할 때 무지성 중앙 패스 감점 완화 (일방적 가패/슈팅 0개 방지)
        const oppMid = this.getMidfieldStrength(tid === 'home' ? 'away' : 'home');
        const myMid = this.getMidfieldStrength(tid);
        const isMidOutmatched = oppMid > (myMid + 4.0);
        const tSettings = (this.tacticSettings && this.tacticSettings[tid]) ? this.tacticSettings[tid] : {};
        const isBypass = tSettings.buildUp === 'direct' || tSettings.passLength === 'direct' || tSettings.width === 'wide';
        if (isMidOutmatched && !isBypass && (from.position === 'MF' || to.position === 'MF')) {
            const midDiff = Math.min(8, Math.max(0, oppMid - myMid - 4.0));
            distPen += midDiff * 0.7; // 무한 끊김 방지를 위해 완화
        }

        // [수비 진영 압박 탈출 보너스 (수->공 전환 구제: 유저 피드백)]
        // 밀리는 팀이 수비 진영(골문 38m 이내)에서 전방 공격수/미드필더로 길게 찌를 때 성공률 대폭 보장
        const isHome = tid === 'home';
        const ownGoalX = isHome ? 0 : 100;
        const distFromOwnGoal = Math.abs(from.x - ownGoalX);
        const isDefensiveThirdOutlet = distFromOwnGoal <= 38 && forward && dist >= 20 && (to.position === 'FW' || to.position === 'MF');
        if (isDefensiveThirdOutlet) {
            distPen = Math.max(0, distPen - 18);
            acc += 16; // 압박 라인을 훌쩍 넘기는 시원한 탈출 롱패스 가산
        }
        const minAcc = from.stamina < 40 ? 10 : 20;
        const success = Math.random() * 100 <= clamp(acc - distPen + (isThrough ? 6 : 0), minAcc, 99);

        if (success) {
            const lead = isCheckingToBall ? -1.0 : (isThrough ? 3.5 : (dist > 24 && to._fwMode === 'burst' ? 2.5 : 0));
            const moveDir = to.teamId === 'home' ? 1 : -1;
            this.ball.targetPos = {
                x: clamp(to.x + moveDir * lead, 2, 98),
                y: clamp(isCheckingToBall ? to.y : (to.y + (to.slotY - to.y) * 0.15), 2, 98)
            };
            this.ball._flightOrigin = { x: from.x, y: from.y };
            this.ball.flightDist = Math.max(1, Math.hypot(this.ball.targetPos.x - from.x, this.ball.targetPos.y - from.y));
            // [3D 포물선 탄도학] 롱패스/크로스/역습 롱킥 시 머리 위를 넘기는 포물선 높이(z) 부여
            if (isCross || dist > 26 || (isThrough && dist > 18)) {
                this.ball.maxHeight = Math.min(3.2, 2.1 + dist * 0.025);
            } else {
                this.ball.maxHeight = 0;
            }
            const isF9Link = (from.role === 'F9' || from.role === 'TM') && (to.position === 'FW' || to.role === 'SS');
            const isBypassLong = dist > 32 && (from.position === 'DF' || from.position === 'GK') && (to.position === 'FW' || Math.abs(to.y - 50) > 24);
            const isTriangularPlay = (from.position === 'DF' && to.position === 'FW' && Math.abs(to.y - 50) > 22) || (from.position === 'FW' && to.position === 'DF' && to._fbMode === 'overlap');
            const isFBOverlapThrough = to._fbMode === 'overlap' || (['WB', 'CWB'].includes(to.role) && forward);
            const isWingCutback = (['W', 'IW', 'IF', 'WB', 'CWB'].includes(from.role) || Math.abs(from.y - 50) > 18) && isCutback;
            const isWingCross = (['W', 'IW', 'IF', 'WB', 'CWB'].includes(from.role) || Math.abs(from.y - 50) > 18) && isCross;

            if (isWingCutback) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}, 측면을 완전히 허물고 박스 안으로 완벽한 컷백 배달!` });
            else if (isWingCross) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}, 터치라인을 찢고 문전으로 날카로운 택배 크로스 투입!` });
            else if (isFBOverlapThrough) this.eventsQueue.push({ type: 'throughpass', from: from.name, to: to.name, desc: ` ${from.name}, 폭풍 오버래핑하는 윙백 ${to.name}의 앞 공간으로 킬러패스!` });
            else if (isCutback) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}, 엔드라인을 허물고 감각적인 컷백 배달!` });
            else if (isCross) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}, 문전으로 궤적 날카로운 크로스 올립니다!` });
            else if (isF9Link) this.eventsQueue.push({ type: 'throughpass', from: from.name, to: to.name, desc: ` ${from.name}, 수비수를 유인하고 쇄도하는 ${to.name}에게 킬패스 연결!` });
            else if (isThrough) this.eventsQueue.push({ type: 'throughpass', from: from.name, to: to.name, desc: ` ${from.name}, 수비 뒷공간을 가르는 킬러 스루패스!` });
            else if (isBypassLong) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}, 상대 중원을 우회하여 측면의 ${to.name}에게 다이렉트 롱킥!` });
            else if (isTriangularPlay) this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: ` ${from.name}과 ${to.name}, 물 흐르듯 이어지는 유기적인 측면 3자 패스!` });
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
    //  DRIBBLE V3 (REALISTIC BALL-CARRY SPEED & CONTROLLED BREAKTHROUGH)
    // ─────────────────────────────────────────────────────────────
    _dribbleV3(player, goalX, moveDir, phase, underPressure, isWinger, distToGoal, nDef, effSpeed) {
        const startX = player.x;
        const startY = player.y;
        const effDribble = this.getEffectiveStat(player, 'dribble');
        const sf = (effSpeed * 0.45 + effDribble * 0.55) / 76;
        const isBlockedFront = this._isFrontalBlocked(player, goalX);
        const defTackle = nDef ? (this.getEffectiveStat(nDef.player, 'tackle') || this.getEffectiveStat(nDef.player, 'defense')) : 65;
        const defSpeed = nDef ? this.getEffectiveStat(nDef.player, 'speed') : 65;
        const canBreakThrough = nDef ? ((effDribble * 0.60 + effSpeed * 0.40) >= (defTackle * 0.55 + defSpeed * 0.45) + 2) : true;
        let targetX, targetY, moveSpd;

        if (player.position === 'FW' && distToGoal < 28) {
            // [공격수 박스 근처 드리블] 수비수보다 과도하게 빠르지 않은 현실적 템포로 각도 오픈
            targetX = goalX;
            targetY = clamp(50 + (player.y - 50) * 0.30, 36, 64);
            moveSpd = 0.86 * clamp(sf, 0.80, 1.48);
            if (player.burstTimer > 0) moveSpd *= 1.08;
        } else if (isWinger || ['W', 'IW', 'IF', 'WB', 'CWB', 'IWB', 'LM', 'RM'].includes(player.role) || player._fbMode === 'overlap') {
            const bhv = this.getRoleBehavior(player.role);
            const isInsideCutter = ['IW', 'IF'].includes(player.role) || bhv.cutInside || player._fbMode === 'underlap' || distToGoal < 22;
            if (isInsideCutter) {
                targetX = goalX;
                targetY = clamp(50 + (player.y - 50) * 0.32, 26, 74);
                moveSpd = 0.88 * clamp(sf, 0.80, 1.50);
                if (player.burstTimer <= 0 && !underPressure && Math.random() < 0.18) player.burstTimer = 8;
            } else {
                targetX = player.x + moveDir * 48;
                targetY = player.y < 50 ? 8 : 92;
                moveSpd = 0.90 * clamp(sf, 0.82, 1.52);
                if (player.burstTimer <= 0 && !underPressure && Math.random() < 0.18) player.burstTimer = 8;
            }
        } else if (player.position === 'FW' && !underPressure && distToGoal < 70) {
            targetX = goalX;
            targetY = clamp(50 + (player.y - 50) * 0.45, 18, 82);
            moveSpd = 0.85 * clamp(sf, 0.80, 1.46);
            if (player.burstTimer <= 0 && Math.random() < 0.15) player.burstTimer = 8;
        } else if (underPressure || isBlockedFront) {
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
                targetX = player.x + moveDir * 32;
                targetY = player.y + evadeSign * 9;
                moveSpd = 0.80 * clamp(sf, 0.78, 1.42);
                if (player.burstTimer <= 0) {
                    player.burstTimer = 6;
                }
            } else {
                targetY = player.y + evadeSign * 10;
                targetX = player.x + moveDir * 22;
                moveSpd = 0.70 * clamp(sf, 0.72, 1.30);
            }
        } else if (phase === 'progressing') {
            targetX = player.x + moveDir * 40;
            targetY = clamp(player.y + (50 - player.y) * 0.15, 8, 92);
            moveSpd = 0.78 * clamp(sf, 0.76, 1.38);
        } else if (phase === 'building') {
            targetX = player.x + moveDir * 28;
            targetY = clamp(player.y + (player.y < 50 ? 4 : -4), 10, 90);
            moveSpd = 0.66 * clamp(sf, 0.72, 1.25);
        } else {
            targetX = goalX;
            targetY = clamp(50 + (player.y - 50) * 0.40, 16, 84);
            moveSpd = 0.82 * clamp(sf, 0.78, 1.42);
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
        player._dribbleDistance = (player._dribbleDistance || 0) +
            Math.hypot(player.x - startX, player.y - startY);

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
        // [배속 동기화 및 사실적 골 통계] 과도한 골 수를 방지하고 경기당 평균 2~3골, 최대 5골 내외의 현실적 스코어라인 유지
        if (dToGoal < 10) b = 0.78;
        else if (dToGoal < 16) b = 0.56;
        else if (dToGoal < 22) b = clamp(1 / dToGoal * 8.5, 0.14, 0.36);
        else if (dToGoal < 30) b = clamp(1 / dToGoal * 4.5, 0.03, 0.12);
        else if (dToGoal < 38) b = 0.015;
        else b = 0.004;

        if (player.position === 'FW') b *= 1.25;

        b *= angleFactor;

        // [MatchTuning 연동] 슈팅 시도 빈도 및 중거리 슈팅 조절
        const freqMod = (typeof MatchTuning !== 'undefined' && MatchTuning.shotFrequencyMultiplier !== undefined)
            ? MatchTuning.shotFrequencyMultiplier : 0.85;
        b *= freqMod;

        if (dToGoal >= 22) {
            const longMod = (typeof MatchTuning !== 'undefined' && MatchTuning.longShotSuppression !== undefined)
                ? MatchTuning.longShotSuppression : 0.42;
            b *= longMod;
        }

        return Math.min(b, 0.88);
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

        // [MatchTuning 연동] 골키퍼 선방 능력 배율 (GK defense 스탯 99 과보정을 0.86으로 정규화)
        const gkMod = (typeof MatchTuning !== 'undefined' && MatchTuning.gkSaveMultiplier !== undefined)
            ? MatchTuning.gkSaveMultiplier : 1.05;
        const sv = gkV * 0.86 * (0.85 + Math.random() * 0.30) * gkMod;
        
        // [골 결정력 현실화: 평균 득점은 유지하되 점수 차가 커질수록 추격 여지를 남긴다.]
        const inBoxBonus = d <= 7 ? 0.10 : (d <= 13 ? 0.06 : (d <= 19 ? 0.025 : -0.035));
        const fwBonus = shooter.position === 'FW' ? 0.025 : (shooter.position === 'MF' ? 0.012 : 0);
        const statBonus = clamp((sp - sv) * 0.0045, -0.06, 0.08);

        // 슈팅 관련 특성 보유 시 추가 골 결정력 가산
        const traits = shooter.traits || [];
        const hasShootingTrait = traits.some(t => t.includes('감아차기') || t.includes('파워슛') || t.includes('슈팅') || t.includes('피니셔'));
        const traitBonus = hasShootingTrait ? 0.02 : 0;

        // 직전 연계가 컷백이나 크로스 원터치 피니시인 경우 가산
        const isCutbackFinish = this.ball && this.ball.isCutback;
        const isCrossFinish = this.ball && this.ball.isCross;
        const patternBonus = isCutbackFinish ? 0.04 : (isCrossFinish ? 0.03 : 0);

        // 1:1 단독 찬스 보너스
        const nearbyDefs = this.players.filter(p => p.teamId === opp && p.position !== 'GK' && Math.hypot(p.x - shooter.x, p.y - shooter.y) < 7.0);
        const isOneOnOne = nearbyDefs.length === 0 && d <= 16;
        const bigChanceBonus = isOneOnOne ? 0.04 : 0;

        const goalMult = (typeof MatchTuning !== 'undefined' && MatchTuning.goalMultiplier !== undefined)
            ? MatchTuning.goalMultiplier : 1.0;
        const minG = (typeof MatchTuning !== 'undefined' && MatchTuning.minGoalChance !== undefined)
            ? MatchTuning.minGoalChance : 0.025;
        const maxG = (typeof MatchTuning !== 'undefined' && MatchTuning.maxGoalChance !== undefined)
            ? MatchTuning.maxGoalChance : 0.28;

        let goalChance = clamp((0.07 + inBoxBonus + fwBonus + statBonus + traitBonus + patternBonus + bigChanceBonus) * goalMult, minG, maxG);

        // [다득점 과열 방지 댐핑: 경기 총 득점이 많아져도 최대 5골 내외로 제한]
        const totalMatchGoals = (this.homeScore || 0) + (this.awayScore || 0);
        const myTeamScore = shooter.teamId === 'home' ? (this.homeScore || 0) : (this.awayScore || 0);
        const oppTeamScore = shooter.teamId === 'home' ? (this.awayScore || 0) : (this.homeScore || 0);
        const scoreGap = myTeamScore - oppTeamScore;
        if (scoreGap >= 3) goalChance *= 0.72;
        else if (scoreGap === 2) goalChance *= 0.86;
        else if (scoreGap === 1) goalChance *= 0.94;
        else if (scoreGap < 0) goalChance += Math.min(0.03, Math.abs(scoreGap) * 0.012);
        if (totalMatchGoals === 3) {
            goalChance *= 0.55;
        } else if (totalMatchGoals === 4) {
            goalChance *= 0.72;
        } else if (totalMatchGoals >= 5) {
            goalChance *= 0.40;
        }
        goalChance = clamp(goalChance, minG, maxG);

        this.ball.state = BallState.IN_FLIGHT;
        this.ball._flightOrigin = { x: shooter.x, y: shooter.y };
        this.ball.owner = null;
        this.ball.targetPos = { x: goalX, y: 44 + Math.random() * 12 };
        this.ball.flightDist = Math.max(1, Math.hypot(this.ball.targetPos.x - shooter.x, this.ball.targetPos.y - shooter.y));
        this.ball.maxHeight = 1.8;
        this.ball.speed = 6.2; // [템포 완화] 너무 휙 날아가지 않고 골망을 가르는 궤적이 선명히 보이는 슛 탄속
        const isGoal = Math.random() < goalChance;
        const targetProb = clamp(0.65 + (effSh - 70) * 0.005 - (d > 18 ? 0.10 : 0), 0.45, 0.88);
        const isTarget = isGoal || (Math.random() < targetProb);
        this.pendingShot = { isGoal, isTarget, shooter, goalX };
    }

    _handleShotResult() {
        const { isGoal, isTarget, shooter, goalX } = this.pendingShot;
        this.pendingShot = null;

        // [신규] 슈터가 오프사이드 위치였거나 오프사이드 패스를 받아 때린 슈팅의 골 취소 처리 (VAR)
        if (isGoal && this.pendingOffside && (this.pendingOffside.receiver === shooter || this.pendingOffside.passer === shooter)) {
            this._handleOffsideGoalDisallowed(this.pendingOffside, shooter);
            return;
        }
        this.pendingOffside = null;

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
                ? MatchTuning.panicDurationMinutes : 6;
            if (this.panicTimer) this.panicTimer[conceding] = pDur;
            if (this.momentumBoost) this.momentumBoost[shooter.teamId] = 0;
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
            const egk = this.players.find(p => p.teamId === opp && p.position === 'GK');
            this.eventsQueue.push({ type: 'miss', shooter: shooter.name, desc: ` ${shooter.name}의 슈팅이 골대를 벗어납니다!` });
            if (egk) {
                egk.x = goalX === 0 ? 3.2 : 96.8; egk.y = 50;
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = egk;
                this.ball.x = egk.x; this.ball.y = egk.y;
            } else {
                this.ball.state = BallState.LOOSE;
                this.ball.x = goalX === 0 ? 3.2 : 96.8; this.ball.y = 50;
            }
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
                ? MatchTuning.defenseBlockChance : 0.30;
            if (blockers.length > 0 && Math.random() < blockChance) {
                const bl = blockers[0];
                this.eventsQueue.push({ type: 'block', shooter: shooter.name, blocker: bl.name, desc: ` ${bl.name}, 몸을 날려 슈팅을 막아냅니다!` });
                this.ball.state = BallState.LOOSE; this.ball.owner = null;
                this.ball.x = bl.x + (isHomeAtt ? -5 : 5); this.ball.y = bl.y + (Math.random() - 0.5) * 16;
                this._triggerTurnover(opp);
                return;
            }
            if (egk) {
                const gkBase = egk.teamId === 'home' ? 3.2 : 96.8;
                egk.x = gkBase; egk.y = clamp(this.ball.targetPos.y, 40, 60);
                this.ball.x = egk.x; this.ball.y = egk.y;
                if (Math.random() < 0.18) {
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
                this.ball.x = goalX === 0 ? 3.2 : 96.8; this.ball.y = 50;
            }
        }
    }

    _handleOffsideWhistle(offsideData) {
        this.pendingOffside = null;
        this.pendingShot = null;
        const { receiver, passer, x, y, teamId } = offsideData;
        const opp = teamId === 'home' ? 'away' : 'home';
        const oppGK = this.players.find(p => p.teamId === opp && p.position === 'GK');

        this.eventsQueue.push({
            type: 'offside',
            player: receiver.name,
            desc: `🚩 삐빅! 부심의 깃발이 올라갑니다. ${receiver.name}의 오프사이드 반칙! 상대팀의 간접 프리킥으로 경기가 재개됩니다.`
        });

        this.ball.state = BallState.CONTROLLED;
        const freeKicker = this.players.find(p => p.teamId === opp && p.position === 'DF') || oppGK;
        this.ball.owner = freeKicker;
        this.ball.intendedReceiver = null;
        this.ball.isCross = false;
        this.ball.isCutback = false;
        this.ball.x = clamp(x, 10, 90);
        this.ball.y = clamp(y, 10, 90);
        this.ball.z = 0;
        if (freeKicker) {
            freeKicker.x = this.ball.x;
            freeKicker.y = this.ball.y;
        }
        this._triggerTurnover(opp);
    }

    _handleOffsideGoalDisallowed(offsideData, shooter) {
        this.pendingOffside = null;
        this.pendingShot = null;
        const opp = shooter.teamId === 'home' ? 'away' : 'home';
        const oppGK = this.players.find(p => p.teamId === opp && p.position === 'GK');

        this.eventsQueue.push({
            type: 'offside',
            player: shooter.name,
            desc: `🚨 [VAR 판독] ${shooter.name}의 슈팅이 골망을 갈랐으나, 침투 순간 오프사이드 위치로 판명되어 득점이 취소됩니다!`
        });

        this.ball.state = BallState.CONTROLLED;
        this.ball.owner = oppGK;
        this.ball.intendedReceiver = null;
        this.ball.isCross = false;
        this.ball.isCutback = false;
        this.ball.x = oppGK ? oppGK.x : (shooter.teamId === 'home' ? 95 : 5);
        this.ball.y = oppGK ? oppGK.y : 50;
        this.ball.z = 0;
        this._triggerTurnover(opp);
    }

    _triggerTurnover(winningTeamId) {
        this._attackProgressX = { home: 0, away: 0 };
        const losing = winningTeamId === 'home' ? 'away' : 'home';
        const winTactic = this.getTeamTactic(winningTeamId);
        const winTSet = (this.tacticSettings && this.tacticSettings[winningTeamId]) || {};
        const isCounterTeam = winTactic === 'counter' ||
            (winTSet.offensiveTrans === 'counter' && ['longBall', 'twoLine', 'gegenpress', 'totalFootball'].includes(winTactic));
        const isPossessionTeam = winTactic === 'possession' || winTactic === 'tikitaka' || winTSet.offensiveTrans === 'hold';

        // [볼 탈환 후 보호] 탈환 직후 첫 터치/패스를 위한 짧은 보호 (과도한 무적 상태 방지)
        if (this.ball.owner) {
            this.ball.owner._protectionTicks = 3;
            this.ball.owner._dribbleDistance = 0;
        }

        // 공을 뺏긴 팀(losing): 오버랩/침투 모드 즉시 해제 및 수비 복귀
        this.players.filter(p => p.teamId === losing).forEach(p => {
            p.burstTimer = 0;
            if (p._fwMode === 'burst') p._fwMode = 'normal';
            if (p.position === 'DF') p._fbMode = 'hold';
        });

        // 볼 탈환 팀의 전환 모드 가동. 역습 전술이 아니면 먼저 진형을 안정화한다.
        this._phase[winningTeamId] = isCounterTeam ? 'counter' : 'building';
        const counterDuration = isCounterTeam ? 35 : (isPossessionTeam ? 10 : 30);
        this._phaseTimer[winningTeamId] = isCounterTeam ? counterDuration : 0;
        this._attackMemories[winningTeamId] = new Array(8).fill(null);
        this._attackMemIdx[winningTeamId] = 0;

        // 역습 전술 팀만 다수의 전방 침투를 사용한다.
        const burstCount = isCounterTeam ? 2 : 0;
        const burstDur = 48;
        const toBurst = this.players.filter(p => p.teamId === winningTeamId && (p.position === 'FW' || (p.position === 'MF' && this.getRoleBehavior(p.role).runBehind > 0.6)))
            .sort((a, b) => Math.hypot(b.x - (winningTeamId === 'home' ? 100 : 0), b.y - 50) - Math.hypot(a.x - (winningTeamId === 'home' ? 100 : 0), a.y - 50))
            .slice(0, burstCount);
        for (const p of toBurst) {
            p._fwMode = 'burst';
            p.burstTimer = burstDur;
            p._timer = burstDur;
        }
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
                // [공식 오프사이드 판정] 패스 순간 오프사이드 위치에 있던 선수가 볼을 터치하는 순간 부심 깃발 & 휘슬!
                if (this.pendingOffside && this.pendingOffside.receiver === r) {
                    this._handleOffsideWhistle(this.pendingOffside);
                    return;
                }
                // [공격 다변화: 크로스 공중볼 경합 및 다이렉트 헤더/발리 슈팅]
                if (this.ball.isCross && (r.position === 'FW' || r.position === 'MF')) {
                    this.ball.isCross = false;
                    this.ball.isCutback = false;
                    const nearCB = this.players.find(p =>
                        p.teamId !== r.teamId && p.position !== 'GK' &&
                        Math.hypot(p.x - this.ball.x, p.y - this.ball.y) < 4.8
                    );
                    if (nearCB) {
                        const attAir = (this.getEffectiveStat(r, 'physical') * 0.6 + this.getEffectiveStat(r, 'shooting') * 0.4);
                        const defAir = (this.getEffectiveStat(nearCB, 'physical') * 0.55 + this.getEffectiveStat(nearCB, 'defense') * 0.45);
                        if (Math.random() < clamp(0.46 + (defAir - attAir) * 0.01, 0.25, 0.72)) {
                            // 수비수 공중볼 헤더 클리어링 성공!
                            this.ball.state = BallState.CONTROLLED;
                            this.ball.owner = nearCB;
                            this.ball.intendedReceiver = null;
                            this.ball.x = nearCB.x; this.ball.y = nearCB.y; this.ball.z = 0;
                            nearCB._protectionTicks = 3;
                            this.eventsQueue.push({ type: 'tackle', player: nearCB.name, desc: ` ${nearCB.name}, 높은 타점의 헤더로 위험한 크로스를 걷어냅니다!` });
                            this._triggerTurnover(nearCB.teamId);
                            return;
                        }
                    }
                    if (Math.random() < 0.68) {
                        const isHome = r.teamId === 'home';
                        const goalX = isHome ? 100 : 0;
                        this._attemptShoot(r, goalX);
                        const finishType = Math.random() < 0.5 ? '다이렉트 고공 헤더' : '환상적인 논스톱 발리';
                        this.eventsQueue.push({ type: 'shoot', player: r.name, desc: ` ${r.name}, 크로스를 받아 ${finishType} 슛!!` });
                        return;
                    }
                }
                // [공격 다변화: 컷백 수비 차단 및 논스톱 슈팅]
                if (this.ball.isCutback) {
                    this.ball.isCross = false;
                    this.ball.isCutback = false;
                    const nearDef = this.players.find(p =>
                        p.teamId !== r.teamId && p.position !== 'GK' &&
                        Math.hypot(p.x - this.ball.x, p.y - this.ball.y) < 4.2
                    );
                    if (nearDef && Math.random() < 0.38) {
                        this.ball.state = BallState.CONTROLLED;
                        this.ball.owner = nearDef;
                        this.ball.intendedReceiver = null;
                        this.ball.x = nearDef.x; this.ball.y = nearDef.y; this.ball.z = 0;
                        nearDef._protectionTicks = 3;
                        this.eventsQueue.push({ type: 'tackle', player: nearDef.name, desc: ` ${nearDef.name}, 결정적인 컷백 패스를 끝까지 따라붙어 차단합니다!` });
                        this._triggerTurnover(nearDef.teamId);
                        return;
                    }
                    const isHome = r.teamId === 'home';
                    const goalX = isHome ? 100 : 0;
                    this._attemptShoot(r, goalX);
                    this.eventsQueue.push({ type: 'shoot', player: r.name, desc: ` ${r.name}, 컷백을 받아 지체 없이 논스톱 슈팅!!` });
                    return;
                }

                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = r;
                this.ball.intendedReceiver = null;
                r._dribbleDistance = 0;
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
            if (db > 4.5) return;
            const flx = tx - ox, fly = ty - oy;
            const fL2 = flx * flx + fly * fly;
            let traj = 0;
            if (fL2 > 0.001) traj = clamp(((p.x - ox) * flx + (p.y - oy) * fly) / fL2, 0, 1);
            const nx = ox + traj * flx, ny = oy + traj * fly;
            const prox = Math.hypot(p.x - nx, p.y - ny);
            const ts = this.getEffectiveStat(p, 'tackle') || this.getEffectiveStat(p, 'defense');
            const ss = this.getEffectiveStat(p, 'speed');
            const pB = Math.max(0, (4.5 - prox) / 4.5);
            // [패스 길목 차단 인터셉트: 순수 수비 스탯 & 위치 선점 대결]
            const chance = 0.035 + (Math.max(0, ts - 50) * 0.002) + (Math.max(0, ss - 50) * 0.0015) + (pB * 0.10);
            if (Math.random() < chance) {
                this.ball.state = BallState.CONTROLLED; this.ball.owner = p;
                this.ball.intendedReceiver = null; this.ball.lastOwner = null;
                p._stealCooldown = 12;
                p._protectionTicks = 6;
                this.eventsQueue.push({ type: 'tackle', player: p.name, desc: `${p.name}, 날카로운 패스 차단!` });
                this._triggerTurnover(p.teamId);
            }
        });
    }

    _attemptTackle(tackler, carrier) {
        if (tackler._stealCooldown > 0) return false;
        if (carrier._protectionTicks && carrier._protectionTicks > 0) return false; // 탈환 직후 보호
        const tackleStat = this.getEffectiveStat(tackler, 'tackle') || this.getEffectiveStat(tackler, 'defense');
        const dribbleStat = this.getEffectiveStat(carrier, 'dribble');
        const speedStat = this.getEffectiveStat(carrier, 'speed');
        
        // [태클 vs 드리블 밸런스 정상화: 드리블이 무적처럼 수비를 다 뚫지 못하도록 현실적 경합 확률 적용]
        const statDiff = tackleStat - (dribbleStat * 0.62 + speedStat * 0.38);
        const carryDistance = carrier._dribbleDistance || 0;
        let chance = 0.38 + (statDiff * 0.011) + Math.max(0, carryDistance - 8) * 0.006;
        
        // [전술 상성 및 무전술 태클 영향도]
        const tacklerTactic = this.getTeamTactic(tackler.teamId);
        const carrierTactic = this.getTeamTactic(carrier.teamId);
        if (tacklerTactic === 'balanced') chance -= 0.12; // 협력 수비 부재로 탈취율 감소
        if (carrierTactic === 'balanced') chance += 0.12; // 패스 탈출구 부재로 쉽게 뺏김
        if (tacklerTactic === 'gegenpress' && ['possession', 'tikitaka', 'balanced'].includes(carrierTactic)) chance += 0.08; // 전방 압박 우위
        
        // 박스 안쪽 신중한 수비
        const oppGoalX = tackler.teamId === 'home' ? 0 : 100;
        if (Math.abs(carrier.x - oppGoalX) < 18) {
            chance -= 0.02;
        }
        // 캐리어가 가속 질주(burst) 중이면 소폭의 관성만 부여
        if (carrier.burstTimer > 0) {
            chance -= 0.03;
        }
        
        if (Math.random() < clamp(chance, 0.20, 0.82)) {
            // 태클 성공
            carrier._ballHoldTicks = 0;
            carrier._dribbleCommit = 0;
            this.ball.state = BallState.CONTROLLED;
            this.ball.owner = tackler;
            this.ball.lastOwner = null;
            this.ball.intendedReceiver = null;
            tackler._stealCooldown = 10;
            tackler._protectionTicks = 3; // 탈환 직후 즉시 재탈취 방지
            carrier._stealCooldown = 16;  // 방금 뺏긴 선수가 0초만에 다시 뺏지 못하도록 쿨다운 부여
            this.eventsQueue.push({ type: 'tackle', player: tackler.name, desc: ` ${tackler.name}, 날카로운 태클로 공을 완벽히 탈취합니다!` });
            this._triggerTurnover(tackler.teamId);
            return true;
        } else {
            // 태클 실패 (볼 캐리어가 1차 수비를 제쳐냈으나, 커버 수비수는 곧바로 태클 가능하도록 무적 시간 최소화)
            tackler._stealCooldown = 14;
            carrier.burstTimer = 8;
            carrier._protectionTicks = 2;
            carrier._dribbleCommit = 1;
            
            // 능력치(드리블 70 이상)에 따라 개인기 연출 발생
            if (dribbleStat >= 70 && Math.random() < 0.45) {
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
        let support1 = null, support2 = null;
        if (attacking) {
            let mD = 999;
            const refX = (this.ball.state === BallState.IN_FLIGHT && this.ball.targetPos) ? this.ball.targetPos.x : this.ball.x;
            const refY = (this.ball.state === BallState.IN_FLIGHT && this.ball.targetPos) ? this.ball.targetPos.y : this.ball.y;
            this.players.forEach(p => {
                if (p.teamId === attacking || p.position === 'GK') return;
                const d = Math.hypot(p.x - refX, p.y - refY);
                if (d < mD) {
                    mD = d; presser = p;
                }
            });

            // [4단계] 삼각형 유지: 공 가진 선수 주변에 최소 2개의 지원 선택지(support1, support2) 상시 확보
            const carr = this.ball.owner || (this.ball.state === BallState.IN_FLIGHT ? this.ball.intendedReceiver : null);
            const mates = this.players.filter(p =>
                p.teamId === attacking && p !== carr && p.position !== 'GK' && p.burstTimer <= 0
            );
            mates.sort((a, b) => Math.hypot(a.x - refX, a.y - refY) - Math.hypot(b.x - refX, b.y - refY));
            if (mates.length > 0) support1 = mates[0];
            if (mates.length > 1) {
                support2 = mates.find(m => m !== support1 && (Math.sign(m.y - refY) !== Math.sign(support1.y - refY) || Math.abs(m.y - support1.y) > 12)) || mates[1];
            }
        }
        this.players.forEach(p => {
            if (p === this.ball.owner) return;
            if (p.position === 'GK') { this._gkOffBall(p); return; }

            p._isTriangleSupport = (p === support1 || p === support2);
            p._supportRole = (p === support1 ? 1 : (p === support2 ? 2 : 0));

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
                if (nr) {
                    // 루즈볼은 가장 가까운 단 1명만 전력 질주하여 획득
                    tx = this.ball.x; ty = this.ball.y; ms = 0.95 * clamp(speedFactor, 0.85, 1.8);
                } else {
                    // 나머지 선수들은 포메이션 대형 유지 (우르르 몰려가지 않음!)
                    tx = p.position === 'FW' ? lines.fwX : (p.position === 'MF' ? lines.mfX : lines.dfX);
                    ty = p.slotY + clamp((this.ball.y - p.slotY) * 0.15, -6, 6);
                    ms = 0.40;
                }
                this._physicsStep(p, tx, ty, ms);
                return;
            }

            if (this.ball.state === BallState.IN_FLIGHT && p === this.ball.intendedReceiver) {
                tx = this.ball.targetPos.x; ty = this.ball.targetPos.y; ms = 0.95;
                this._physicsStep(p, tx, ty, ms); return;
            }

            // [4단계] 패스 직후 움직임: 패스한 선수가 멈추지 않고 삼각형을 유지하며 재지원 위치로 이동
            if (p._postPassSupportTicks > 0 && p._postPassSupportTarget && p.position !== 'GK') {
                const to = p._postPassSupportTarget;
                if (p.burstTimer > 0) {
                    tx = isHome ? to.x + 6 : to.x - 6;
                    ty = p.slotY;
                    ms = 0.88 * clamp(speedFactor, 0.85, 1.8);
                } else {
                    const side = (p.y <= to.y ? -1 : 1);
                    tx = isHome ? (to.x - 4.5) : (to.x + 4.5);
                    ty = clamp(to.y + side * 10, 8, 92);
                    ms = 0.65 * clamp(speedFactor, 0.8, 1.6);
                }
                this._physicsStep(p, tx, ty, ms);
                return;
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
        const goalX = isHome ? 0 : 100;
        const goalLineX = isHome ? 3.2 : 96.8;
        const ballDistToGoal = Math.abs(this.ball.x - goalX);
        const oppCarrier = (this.ball.owner && this.ball.owner.teamId !== gk.teamId) ? this.ball.owner : null;

        // [키퍼 전진 타이밍 현실화]
        // 볼이 멀거나 수비수가 커버 중일 때는 절대 일찍 튀어나오지 않고 골라인(3.2 / 96.8)을 침착하게 사수!
        // 오직 상대 공격수가 골문 코앞(10.5m 이내) 중앙에서 수비수 없이 완벽한 1:1 단독 찬스를 맞았을 때만 각도를 좁히기 위해 제한적으로 전진
        let targetX = goalLineX;
        let stepRate = 0.18;
        if (oppCarrier && ballDistToGoal < 10.5 && ballDistToGoal > 3.5 && Math.abs(this.ball.y - 50) < 16) {
            const hasCoverDefender = this.players.some(p =>
                p.teamId === gk.teamId && p.position !== 'GK' &&
                Math.abs(p.x - goalX) < ballDistToGoal + 1.5 &&
                Math.hypot(p.x - oppCarrier.x, p.y - oppCarrier.y) < 5.5
            );
            if (!hasCoverDefender) {
                const rawOut = goalLineX + (this.ball.x - goalLineX) * 0.22;
                targetX = isHome ? clamp(rawOut, 3.2, 7.2) : clamp(rawOut, 92.8, 96.8);
                stepRate = 0.15;
            }
        } else if (ballDistToGoal < 16) {
            targetX = isHome ? 3.8 : 96.2;
        }

        // Y축도 골대 포스트 범위(44~56, 근접 시 41~59) 내에서만 침착하게 각도 유지
        const ySpan = ballDistToGoal < 12 ? 9 : 6;
        const yWeight = ballDistToGoal < 12 ? 0.22 : 0.14;
        const targetY = clamp(50 + (this.ball.y - 50) * yWeight, 50 - ySpan, 50 + ySpan);

        gk.vx *= 0.25; gk.vy *= 0.25;
        gk.x += (targetX - gk.x) * stepRate + gk.vx;
        gk.y += (targetY - gk.y) * 0.20 + gk.vy;
    }

    // ═══════════════════════════════════════════════════════════════
    //  OFF-BALL FW V3 (trigger-based modes: shadow / burst / linkup)
    // ═══════════════════════════════════════════════════════════════
    _offBallFW_V3(p, isHome, fwd, bhv, sf) {
        const tid = p.teamId;
        const tactic = this.getTeamTactic(tid);
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

        //  PHASE-BASED ABS_MIN: 빌드업/전진 시 공격수가 밑으로 내려와 공을 받아줄 수 있도록 하한선 완화
        let ABS_MIN;
        const isDropDeepRole = bhv.dropDeep || p.role === 'F9' || p.role === 'DLF' || p.role === 'CF';
        if (isDropDeepRole) {
            ABS_MIN = isHome ? 40 : 60;
        } else if (phase === 'building') {
            ABS_MIN = isHome ? 44 : 56;
        } else if (phase === 'progressing' || phase === 'counter') {
            ABS_MIN = isHome ? 52 : 48;
        } else {
            ABS_MIN = isHome ? 68 : 32;
        }
        const MID_THRESH = isHome ? (isDropDeepRole ? 40 : 45) : (isDropDeepRole ? 60 : 55);
        const OFFSIDE_BOUND = isHome ? (offX - 5) : (offX + 5);
        ABS_MIN = isHome
            ? Math.max(Math.min(ABS_MIN, OFFSIDE_BOUND), MID_THRESH)
            : Math.min(Math.max(ABS_MIN, OFFSIDE_BOUND), MID_THRESH);

        const carr = (this.ball.owner && this.ball.owner.teamId === tid) ? this.ball.owner : null;
        const distFromBallX = carr ? Math.abs(p.x - carr.x) : Math.abs(p.x - this.ball.x);
        const isCarrierDeep = carr ? (isHome ? carr.x < 56 : carr.x > 44) : (isHome ? this.ball.x < 56 : this.ball.x > 44);

        //  BURST TRIGGER (무조건 침투만 하지 않고, 볼이 충분히 전진했을 때만 선택적 뒷공간 침투)
        if (p._fwMode !== 'burst' && this._fwBurstCooldown <= 0 && isPrimaryRunner && p.role !== 'TM') {
            const rightZone = carr && (
                (isHome && carr.x > 58 && carr.x < 80) || (!isHome && carr.x < 42 && carr.x > 20)
            );
            const burstBiasOk = bhv.runBehind > 0.50;
            const phaseOk = (phase === 'progressing' && !isCarrierDeep) || phase === 'finalThird' || phase === 'counter';
            const highLine = isHome
                ? (defLineX >= 54 && carr && carr.x >= 42)
                : (defLineX <= 46 && carr && carr.x <= 58);
            const highLinePhaseOk = phase === 'progressing' || phase === 'finalThird' || phase === 'counter';
            const laneOpen = !this._numOpponentsAhead(p, 8, 16);
            const isBalanced = this.getTeamTactic(tid) === 'balanced';
            const isTikiTaka = tactic === 'tikitaka';
            const isPossession = tactic === 'possession';
            const burstTacticCheck = isBalanced ? (Math.random() < 0.30) : (Math.random() < 0.65);
            const highLineRun = isTikiTaka && highLine && highLinePhaseOk && burstBiasOk &&
                (!this._isUnderPressure(carr) || this.getRoleBehavior(carr.role).throughBallBias);
            const possessionRun = isPossession && isPrimaryRunner && highLine && highLinePhaseOk &&
                burstBiasOk && laneOpen && Math.random() < 0.28;
            if (carr && burstBiasOk && ((rightZone && phaseOk && laneOpen && burstTacticCheck) || highLineRun || possessionRun)) {
                p._fwMode = 'burst';
                p._comingShort = false;
                p.burstTimer = 26;
                p._timer = 26;
                this._fwBurstCooldown = 20;
            }
        }
        if (this._fwBurstCooldown > 0) this._fwBurstCooldown--;

        //  LINKUP TRIGGER (공격수가 무조건 침투만 하지 않고 밑으로 내려와 공을 받아주는 움직임 대폭 강화!)
        const tSettingsFW = (this.tacticSettings && this.tacticSettings[tid]) ? this.tacticSettings[tid] : {};
        const isClosestFWToBall = teamFWs.length > 0 && teamFWs.slice().sort((a, b) => Math.abs(a.y - this.ball.y) - Math.abs(b.y - this.ball.y))[0] === p;
        if (p._fwMode !== 'linkup' && p._fwMode !== 'burst') {
            const carrUnder = carr ? this._isUnderPressure(carr) : false;
            const shouldCheckShort = (phase === 'building' || phase === 'progressing') && (
                isDropDeepRole ||
                !isPrimaryRunner ||
                (isCarrierDeep && isClosestFWToBall) ||
                distFromBallX > 20 ||
                carrUnder ||
                this._isAttackStuck(tid) ||
                (tactic === 'possession' && isClosestFWToBall)
            );
            if (shouldCheckShort && this._fwLinkupCooldown <= 0) {
                p._fwMode = 'linkup';
                p._comingShort = true;
                p._timer = 32;
                this._fwLinkupCooldown = 8;
            }
        }
        if (this._fwLinkupCooldown > 0) this._fwLinkupCooldown--;

        // Mode timeout
        if (p._timer <= 0 && p._fwMode !== 'shadow') {
            p._fwMode = 'shadow';
            p._comingShort = false;
        }
        if (p._fwMode !== 'linkup') p._comingShort = false;

        let tx, ty, ms = 0.46 * clamp(sf, 0.82, 1.75);

        // ---- Range normalization helpers: ensure lo <= hi before clamp ----
        const hh = (v, lo, hi) => { const L = Math.min(lo, hi), H = Math.max(lo, hi); return clamp(v, L, H); };
        const aa = (v, lo, hi) => { const L = Math.min(lo, hi), H = Math.max(lo, hi); return clamp(v, L, H); };

        const isBoxAttacking = phase === 'finalThird' || (isHome ? this.ball.x > 66 : this.ball.x < 34);
        const nearSign = this.ball.y < 50 ? -1 : 1;
        const isBallSide = (p.slotY < 50 && nearSign < 0) || (p.slotY >= 50 && nearSign > 0);
        const isTeamWide = tSettingsFW.width === 'wide';
        const isTeamNarrow = tSettingsFW.width === 'narrow';

        if (isBoxAttacking) {
            p._comingShort = false;
            // [FLR 이식 & 공격 버프] 파이널 서드 박스 침투 (Box-Wave Pattern)
            if (isPrimaryRunner) {
                // 니어 포스트 / 골문 앞 5~10야드 정면 공간으로 전력 쇄도 (피니시 최우선 타겟)
                tx = isHome ? hh(offX - 0.8, 89.5, 94.5) : aa(offX + 0.8, 5.5, 10.5);
                ty = clamp(50 + nearSign * 3.5, 43, 57);
                ms = 0.95 * clamp(sf, 0.9, 2.0);
            } else if (!isBallSide) {
                // 반대편(Far-side) 공격수: 파 포스트로 깊게 침투하여 크로스/세컨드볼 피니시
                tx = isHome ? hh(offX - 1.0, 88.5, 93.5) : aa(offX + 1.0, 6.5, 11.5);
                ty = nearSign < 0 ? (isTeamWide ? 65 : 59) : (isTeamWide ? 35 : 41);
                ms = 0.92 * clamp(sf, 0.9, 1.95);
            } else {
                // 볼 사이드 윙어/공격수: 롤에 따른 분기 (클래식 윙어 엔드라인 vs 인버티드 윙어 중앙 컷인)
                if (bhv.cutInside || p.role === 'IW' || p.role === 'IF') {
                    // [인버티드 윙어] 하프스페이스 안쪽으로 파고들어 슛 또는 킬패스 각도 선점
                    tx = isHome ? clamp(this.ball.x + 2, 82, 90) : clamp(this.ball.x - 2, 10, 18);
                    ty = clamp(50 + (p.slotY - 50) * 0.40, 26, 74);
                    ms = 0.88 * clamp(sf, 0.9, 1.9);
                } else if (bhv.hugLine || Math.abs(p.slotY - 50) > 20) {
                    // [클래식 윙어] 터치라인 끝까지 치고 달려 엔드라인 크로스/컷백 준비
                    tx = isHome ? clamp(this.ball.x + 3, 85, 94) : clamp(this.ball.x - 3, 6, 15);
                    ty = p.slotY < 50 ? (isTeamWide ? 7 : 12) : (isTeamWide ? 93 : 88);
                    ms = 0.85 * clamp(sf, 0.85, 1.85);
                } else {
                    // 페널티 스팟 컷백/세컨드볼 피니시를 위한 트레일러 침투 (83.5~86.5 정면)
                    tx = isHome ? hh(offX - 2.5, 83.5, 86.5) : aa(offX + 2.5, 13.5, 16.5);
                    ty = clamp(50 + nearSign * 2.0, 46, 54);
                    ms = 0.90 * clamp(sf, 0.85, 1.9);
                }
            }
        } else if (p._fwMode === 'burst') {
            // [패스 타이밍에 맞춘 라인 브레이킹 침투!]
            const isBallAirborne = this.ball.state === BallState.IN_FLIGHT;
            if (isBallAirborne) {
                // 패스가 공중에 떠서 출발한 순간: 수비 라인 뒷공간으로 폭발적인 가속 질주!
                tx = isHome ? clamp(defLineX + 16, 68, 94) : clamp(defLineX - 16, 6, 32);
            } else {
                // 패스가 발을 떠나기 전: 수비수 어깨선 바로 뒤 온사이드(0.8야드 뒤)에서 타이트하게 스프린트 대기!
                tx = isHome ? clamp(offX - 0.8, ABS_MIN, 88) : clamp(offX + 0.8, 12, ABS_MIN);
            }
            const curve = Math.sin(p._timer * 0.35) * (this.getRoleBehavior(p.role).hugLine ? 3 : 6);
            ty = clamp(p.slotY + curve + (50 - p.slotY) * 0.15, p.slotY - 14, p.slotY + 14);
            if (this.getRoleBehavior(p.role).hugLine) ty = p.slotY < 50 ? 8 : 92;
            ms = 1.05 * clamp(sf, 0.95, 2.2); // 폭발적인 가속 침투!
        } else if (p._fwMode === 'linkup') {
            // [밑에서 받으러 오는 움직임 (Check-to-Ball)] 볼 보유자 쪽으로 적극적으로 마중 나와 발밑 패스 연결고리 형성!
            const refX = carr ? carr.x : this.ball.x;
            const dropX = isHome ? hh(refX + 13, 40, 66) : aa(refX - 13, 34, 60);
            tx = dropX;
            ty = clamp(p.slotY * 0.65 + this.ball.y * 0.35, 16, 84);
            ms = 0.66 * clamp(sf, 0.85, 1.75);
        } else if (p.role === 'TM') {
            // [타겟맨 전방 앵커] 너무 멀리 도망가지 않고 볼 앞쪽(16~20m)에서 등지고 포스트 플레이 준비
            const refX = carr ? carr.x : this.ball.x;
            tx = isHome ? clamp(Math.min(offX - 2.5, refX + 18), 52, 82) : clamp(Math.max(offX + 2.5, refX - 18), 18, 48);
            ty = clamp(p.slotY, 42, 58);
            ms = 0.42 * clamp(sf, 0.75, 1.5);
        } else {
            // [밸런스 포지셔닝] 무조건 오프사이드 라인 끝까지 붙어있지 않고, 볼 위치에 맞춰 적절한 간격 유지
            const refX = carr ? carr.x : this.ball.x;
            const targetFollowX = isHome ? Math.min(offX - 1.2, refX + 24) : Math.max(offX + 1.2, refX - 24);
            tx = isHome ? clamp(targetFollowX, ABS_MIN, 86) : clamp(targetFollowX, 14, ABS_MIN);
            const followW = 0.16;
            ty = clamp(p.slotY + (this.ball.y - p.slotY) * followW, p.slotY - 10, p.slotY + 10);
            if (bhv.hugLine) ty = p.slotY < 50 ? 10 : 90;
            ms = 0.45 * clamp(sf, 0.75, 1.55);
        }

        // 빌드업/중원 전진 시 서포트 클램프 (단, linkup 및 burst 침투 모드일 때는 강제로 끌어내리거나 밀어내지 않음!)
        if (!isBoxAttacking && p._fwMode !== 'linkup' && p._fwMode !== 'burst') {
            if (!isPrimaryRunner) {
                const supportX = lines.fwX - fwd * (bhv.linkup >= 0.6 ? 6 : 4);
                tx = isHome ? Math.min(tx, supportX) : Math.max(tx, supportX);
                ty = clamp(ty + (this.ball.y - p.slotY) * 0.12, p.slotY - 12, p.slotY + 12);
            }
            tx = isHome ? Math.max(tx, ABS_MIN) : Math.min(tx, ABS_MIN);
        }

        // [5단계] FW 간격 조정 & 겹침 방지 (단차 배치: 한 명 침투, 한 명 연계 공간 확보)
        const otherFWs = teamFWs.filter(q => q !== p);
        for (const o of otherFWs) {
            const dX = Math.abs(tx - o.x);
            const dY = Math.abs(ty - o.y);
            if (dX < 4.0 && dY < 12.0) {
                if (isPrimaryRunner || bhv.runBehind > this.getRoleBehavior(o.role).runBehind) {
                    tx = isHome ? Math.min(tx + 3.0, offX - 0.8) : Math.max(tx - 3.0, offX + 0.8);
                } else {
                    tx = isHome ? Math.max(tx - 3.5, ABS_MIN) : Math.min(tx + 3.5, ABS_MIN);
                    ty = clamp(ty + (ty >= o.y ? 6 : -6), 12, 88);
                }
            }
        }

        tx = clamp(tx, 4, 96);
        ty = clamp(ty, 4, 96);
        this._physicsStep(p, tx, ty, ms);
    }

    // ═══════════════════════════════════════════════════════════════
    //  OFF-BALL MF V3 (미드필더 최전방 과밀 방지 & 적정 2선/중원 간격 유지 + 마중 나오는 빌드업)
    // ═══════════════════════════════════════════════════════════════
    _offBallMF_V3(p, isHome, fwd, bhv, sf, attackingTeamId) {
        const tid = p.teamId;
        const tactic = this.getTeamTactic(tid);
        const phase = this._phase[tid];
        const lines = this._getTeamBlockLines(tid);
        const centralMFs = this.players
            .filter(q => q.teamId === tid && q.position === 'MF' && Math.abs(q.slotY - 50) <= 22)
            .sort((a, b) => a.slotY - b.slotY);
        const isExplicitDM = ['DM', 'CDM', 'ANC', 'DLP', 'BWM', 'REG', 'HB'].includes(p.role) || ['CDM', 'DM'].includes(p.detailPosition);
        // 명시적 수비형 미드필더가 없더라도 중앙 미드필더 중 최소 1명은 중원 홀딩 역할을 수행해 전원 최전방 돌진을 방지!
        const hasAnyExplicitDM = centralMFs.some(q => ['DM', 'CDM', 'ANC', 'DLP', 'BWM', 'REG', 'HB'].includes(q.role) || ['CDM', 'DM'].includes(q.detailPosition));
        const isDM = isExplicitDM || (!hasAnyExplicitDM && centralMFs[0] === p);
        const isAM = !isDM && (['AP', 'AM', 'SS'].includes(p.role) || ['CAM', 'AM'].includes(p.detailPosition));
        const isWingerRole = ['W', 'IW', 'IF', 'LM', 'RM'].includes(p.role) || ['LW', 'RW', 'LM', 'RM'].includes(p.detailPosition) || bhv.hugLine || bhv.cutInside || Math.abs(p.slotY - 50) > 22;
        const mates = this.players.filter(q => q.teamId === tid && q !== p);
        const offX = this._calcOffsideLineX(isHome);
        const carr = this.ball.owner && this.ball.owner.teamId === tid ? this.ball.owner : null;
        const refX = carr ? carr.x : this.ball.x;
        const refY = carr ? carr.y : this.ball.y;
        const isSameSideAsBall = Math.abs(p.slotY - refY) <= 28;

        // [밑에서 받으러 오는 미드필더/윙어 판정 (Check-to-Ball Support)]
        const nonCarrierCMs = centralMFs.filter(q => q !== carr);
        const isClosestCMToBall = nonCarrierCMs.length > 0 && nonCarrierCMs.slice().sort((a, b) => Math.hypot(a.x - refX, a.y - refY) - Math.hypot(b.x - refX, b.y - refY))[0] === p;
        const carrierInBackOrMid = isHome ? refX < 58 : refX > 42;
        p._comingShort = false;

        let tx = lines.mfX;
        let ms = 0.56 * clamp(sf, 0.8, 1.68);

        // 1. 측면 미드필더 / 윙어 (W, IW, IF, LM, RM): 볼 사이드만 적절히 올라가고 반대편은 중원 밸런스 유지!
        if (isWingerRole) {
            if (phase === 'finalThird') {
                if (isSameSideAsBall) {
                    tx = isHome ? clamp(offX - 2.0, 72, 85) : clamp(offX + 2.0, 15, 28);
                    ms = 0.80 * clamp(sf, 0.85, 1.82);
                } else {
                    // 반대편 측면 미드필더는 최전방까지 무작정 올라가지 않고 2선(60~72)에서 세컨드볼/전환 대기
                    tx = isHome ? clamp(lines.mfX + 6, 58, 72) : clamp(lines.mfX - 6, 28, 42);
                    ms = 0.62 * clamp(sf, 0.80, 1.65);
                }
            } else if (phase === 'building' || (carrierInBackOrMid && carr && carr.position === 'DF' && isSameSideAsBall)) {
                p._comingShort = true;
                tx = isHome ? clamp(refX + 11, 28, 52) : clamp(refX - 11, 48, 72);
                ms = 0.66 * clamp(sf, 0.82, 1.72);
            } else if (phase === 'progressing') {
                if (isSameSideAsBall && (isHome ? p.x > refX + 16 : p.x < refX - 16)) {
                    p._comingShort = true;
                    tx = isHome ? clamp(refX + 12, 40, 66) : clamp(refX - 12, 34, 60);
                    ms = 0.66 * clamp(sf, 0.82, 1.72);
                } else {
                    const leadX = isHome ? Math.min(this.ball.x + 10, offX - 3) : Math.max(this.ball.x - 10, offX + 3);
                    tx = isHome ? clamp(leadX, 44, 68) : clamp(leadX, 32, 56);
                    ms = 0.70 * clamp(sf, 0.80, 1.72);
                }
            } else {
                tx = isHome ? clamp(lines.mfX + 2, 34, 56) : clamp(lines.mfX - 2, 44, 66);
            }
        } else {
            // 2. 중앙 미드필더 (DM / CM / AM): 최전방까지 다 같이 몰려가지 않고 롤별 적정선(3선/2.5선/2선) 엄격 유지!
            if ((phase === 'building' || carrierInBackOrMid) && (isDM || isClosestCMToBall || (carr && carr.position === 'DF' && isSameSideAsBall))) {
                p._comingShort = true;
                const supportDist = isDM ? 8 : 11;
                tx = isHome ? clamp(refX + supportDist, 22, 52) : clamp(refX - supportDist, 48, 78);
                ms = 0.66 * clamp(sf, 0.85, 1.72);
            } else {
                if (phase === 'building') {
                    tx = lines.mfX + fwd * (isDM ? -5 : (isAM ? 3 : -1));
                } else if (phase === 'progressing') {
                    tx = lines.mfX + fwd * (isDM ? -4 : (isAM ? 6 : 1));
                } else if (phase === 'finalThird') {
                    // 파이널 서드에서도 DM은 하프라인 앞(48~57), 일반 CM은 아크 뒤(56~66), AM만 아크 정면(64~74)까지만 전진!
                    tx = lines.mfX + fwd * (isDM ? -6 : (isAM ? 8 : 2));
                } else {
                    tx = lines.mfX + fwd * (isDM ? -2 : 3);
                }
            }

            // 롤별 절대 전진 상한선 (모든 미드필더가 최전방 박스 안으로 올라가는 현상 원천 차단!)
            const maxAllowedHome = isDM ? (phase === 'finalThird' ? 57 : 50) : (isAM ? (phase === 'finalThird' ? 74 : 64) : (phase === 'finalThird' ? 66 : 58));
            const minAllowedAway = 100 - maxAllowedHome;
            tx = isHome ? Math.min(tx, maxAllowedHome) : Math.max(tx, minAllowedAway);

            const fws = mates.filter(q => q.position === 'FW');
            if (fws.length && !p._comingShort) {
                const frontFW = isHome ? Math.max(...fws.map(q => q.x)) : Math.min(...fws.map(q => q.x));
                const gapFromFW = isDM ? 16 : (isAM ? 7 : 11);
                const limit = isHome ? frontFW - gapFromFW : frontFW + gapFromFW;
                tx = isHome ? Math.min(tx, limit) : Math.max(tx, limit);
            }
        }

        // 수비형 미드필더: 센터백 앞 보호
        const cbs = mates.filter(q => q.position === 'DF' && ['CD', 'BPD', 'NCB', 'LIB'].includes(q.role));
        if (isDM && cbs.length && phase === 'building') {
            const hiCB = isHome ? Math.max(...cbs.map(q => q.x)) : Math.min(...cbs.map(q => q.x));
            tx = isHome ? Math.min(tx, hiCB + 8) : Math.max(tx, hiCB - 8);
        }

        // 3. Y축 횡방향 동선 (롤별 고유 무브먼트 + 받으러 올 때 볼 쪽으로 각도 열기)
        let ty = p.slotY;
        if (p._comingShort && !isWingerRole) {
            ty = clamp(p.slotY * 0.65 + refY * 0.35, 16, 84);
        } else if (['IW', 'IF'].includes(p.role) || bhv.cutInside) {
            if (phase === 'progressing' || phase === 'finalThird') {
                ty = clamp(50 + (p.slotY - 50) * 0.38, 28, 72);
            } else {
                ty = p.slotY < 50 ? 14 : 86;
            }
        } else if (['W', 'LM', 'RM'].includes(p.role) || bhv.hugLine) {
            ty = p.slotY < 50 ? 8 : 92;
        } else if (p.role === 'MEZ') {
            ty = p.slotY < 50 ? 24 : 76;
        }

        // [4단계] 전술별 중원 움직임
        // 티키타카는 짧은 삼각형을 만들고, 점유는 공 주변의 재순환 거리를 줄인다.
        // 라볼피아나는 빌드업 초기에 수비 라인과 중원을 연결하고, 역습은 2선의 전진을 허용한다.
        if (!p._comingShort) {
            if (tactic === 'tikitaka') {
                tx += fwd * (isAM ? 3 : (isDM ? -1 : 1));
                if (carr) ty = clamp(ty + (carr.y - ty) * 0.22, 12, 88);
            } else if (tactic === 'possession') {
                tx += fwd * (isDM ? -2 : -1);
                if (carr) {
                    tx = isHome ? Math.min(tx, refX + 16) : Math.max(tx, refX - 16);
                    ty = clamp(ty + (carr.y - ty) * 0.28, 12, 88);
                }
            } else if (tactic === 'lavolpiana' && phase === 'building') {
                if (isDM) {
                    tx = isHome ? clamp(lines.dfX + 2, 22, 44) : clamp(lines.dfX - 2, 56, 78);
                    ty = 50; // 센터백 사이 중앙으로 확실히 하강 (변형 3백 형성)
                } else if (isAM) {
                    tx += fwd * 4;
                }
            } else if ((tactic === 'counter' || tactic === 'longBall') && phase === 'progressing' && !isDM) {
                tx += fwd * (isAM ? 7 : 3);
            }
        }

        // [4단계] 삼각형 유지 오프더볼: 서포트 1/2 역할에 따라 공 소유자 기준 각도 확보
        if (p._isTriangleSupport && carr && !isWingerRole) {
            const roleIdx = p._supportRole || 1;
            const side = (roleIdx === 1 ? (p.y <= refY ? -1 : 1) : (p.y <= refY ? 1 : -1));
            const offsetX = (roleIdx === 1 ? fwd * 4.5 : fwd * -5.0);
            const offsetY = side * (tactic === 'tikitaka' ? 9 : 13);
            tx = (tx * 0.4) + (clamp(refX + offsetX, 6, 94) * 0.6);
            ty = (ty * 0.4) + (clamp(refY + offsetY, 10, 90) * 0.6);
            ms = Math.max(ms, 0.64 * clamp(sf, 0.8, 1.6));
        }

        // 측면 크로스 찬스 시 오직 공격형 미드필더(AM/SS) 단 1명만 페널티 아크/박스 입구(75~80)로 침투 지원
        const isWingerCrossSituation = carr && Math.abs(carr.y - 50) > 20 && (isHome ? carr.x > 74 : carr.x < 26);
        if (!p._comingShort && isWingerCrossSituation && isAM && (p.role === 'SS' || p.role === 'AM')) {
            const lateRunTx = isHome ? clamp(offX - 4.0, 74, 80) : clamp(offX + 4.0, 20, 26);
            const lateRunTy = clamp(50 + (carr ? (carr.y < 50 ? -4 : 4) : 0), 42, 58);
            tx = (tx * 0.4) + (lateRunTx * 0.6);
            ty = (ty * 0.4) + (lateRunTy * 0.6);
            ms = 0.78 * clamp(sf, 0.85, 1.8);
        }

        // [5단계] 수비형 미드필더와 센터백 간격 제어 (CB-DM 최대 12m 간격 제한 & Zone 14 커버)
        if (isDM && cbs.length) {
            const cbX = isHome ? Math.max(...cbs.map(q => q.x)) : Math.min(...cbs.map(q => q.x));
            const maxDmGap = 12.0;
            tx = isHome ? clamp(tx, cbX + 2.0, cbX + maxDmGap) : clamp(tx, cbX - maxDmGap, cbX - 2.0);
        }
        if (isDM && !p._isTriangleSupport) {
            ty = clamp(ty, 34, 66);
        }

        tx = clamp(tx, 4, 96);
        ty = clamp(ty, 4, 96);
        this._physicsStep(p, tx, ty, ms);
    }

    // ═══════════════════════════════════════════════════════════════
    //  OFF-BALL DF V3 (현대 축구 풀백/윙백 오버래핑 & 언더래핑 전술 시스템)
    // ═══════════════════════════════════════════════════════════════
    _offBallDF_V3(p, isHome, fwd, bhv, sf, attackingId) {
        const tid = p.teamId;
        const tactic = this.getTeamTactic(tid);
        const phase = this._phase[tid];
        const lines = this._getTeamBlockLines(tid);
        const isCB = ['CD', 'BPD', 'NCB', 'LIB'].includes(p.role) || ['CB', 'SW'].includes(p.detailPosition);
        const isFB = ['FB', 'WB', 'CWB', 'IWB'].includes(p.role) || ['LB', 'RB', 'LWB', 'RWB'].includes(p.detailPosition);
        const mates = this.players.filter(q => q.teamId === tid && q !== p);
        const offX = this._calcOffsideLineX(isHome);

        // 풀백/윙백 모드 결정 (오버랩, 언더랩, 홀드)
        if (isFB) {
            const sameSide = (p.slotY < 50 && this.ball.y <= 50) || (p.slotY >= 50 && this.ball.y >= 50);
            const otherFB = mates.find(q => q.position === 'DF' && ['FB', 'WB', 'CWB', 'IWB'].includes(q.role));
            const otherOverlapping = otherFB && (otherFB._fbMode === 'overlap' || otherFB._fbMode === 'underlap');

            if (phase === 'building') {
                p._fbMode = (p.role === 'IWB') ? 'underlap' : 'hold';
            } else if (p.role === 'IWB') {
                p._fbMode = 'underlap';
            } else if (p.role === 'CWB') {
                // 공격형 윙백: 같은 사이드면 무조건 전력 오버래핑, 반대 사이드라도 볼이 전진하면 전진 지원
                p._fbMode = sameSide ? 'overlap' : (otherOverlapping ? 'hold' : 'overlap');
            } else if (p.role === 'WB') {
                // 윙백: 같은 사이드 볼 전개 시 과감한 오버래핑
                p._fbMode = sameSide ? 'overlap' : 'hold';
            } else {
                // 일반 풀백(FB): 윙어가 안쪽으로 컷인하거나 파이널 서드 진입 시 오버래핑
                p._fbMode = (sameSide && (phase === 'finalThird' || (phase === 'progressing' && bhv.attackBias >= 0.4))) ? 'overlap' : 'hold';
            }
        }

        if (isCB && tactic === 'lavolpiana' && lines.haveBall && phase === 'building') {
            // 라볼피아나는 센터백을 넓혀 패스 각도를 만들고, 중앙 혼잡을 줄인다.
            p._fbMode = 'hold';
        }

        let tx, ty;
        if (isCB) {
            // [아군 공격 시에도 상대 최전방 공격수 사전 마킹(Rest Defense Man-Marking)]
            // 볼을 소유 중일 때도 센터백이 상대 공격수(oppFW) 근처 골사이드에 미리 붙어있어 역습/침투 시 즉시 밀착 수비!
            if (lines.haveBall || phase === 'progressing' || phase === 'finalThird') {
                tx = isHome ? clamp(lines.dfX, 38, 49) : clamp(lines.dfX, 51, 62);
            } else {
                tx = lines.dfX + fwd * (phase === 'building' ? -2 : 0);
                const teamMFs = mates.filter(q => q.position === 'MF');
                const mfFront = teamMFs.length
                    ? (isHome ? Math.max(...teamMFs.map(q => q.x)) : Math.min(...teamMFs.map(q => q.x)))
                    : (isHome ? 45 : 55);
                const mfCap = isHome ? mfFront - 5 : mfFront + 5;
                tx = isHome ? Math.min(tx, mfCap) : Math.max(tx, mfCap);
            }

            const isLeftCB = p.slotY < 45;
            const isRightCB = p.slotY > 55;
            ty = isLeftCB ? clamp(p.slotY, 36, 46) : (isRightCB ? clamp(p.slotY, 54, 64) : 50);

            const oppFW = this._findMarkTargetForDF(p, 'FW');
            if (oppFW) {
                const shadowX = isHome ? (oppFW.x - 1.4) : (oppFW.x + 1.4);
                tx = isHome ? clamp(Math.min(tx + 3, shadowX), 26, 49) : clamp(Math.max(tx - 3, shadowX), 51, 74);
                ty = clamp(p.slotY * 0.20 + oppFW.y * 0.80, 20, 80);
            }
            if (tactic === 'lavolpiana' && lines.haveBall && phase === 'building') {
                tx = isHome ? clamp(lines.dfX - 1, 22, 44) : clamp(lines.dfX + 1, 56, 78);
                ty = p.slotY < 50 ? 24 : (p.slotY > 50 ? 76 : 50);
            }
            tx = clamp(tx, isHome ? 8 : 20, isHome ? 80 : 92);

            const otherCBs = mates.filter(q => q.position === 'DF' && (['CD', 'BPD', 'NCB', 'LIB'].includes(q.role) || ['CB', 'SW'].includes(q.detailPosition)));
            for (const o of otherCBs) {
                const dY = ty - o.y; const a = Math.abs(dY); const s = dY >= 0 ? 1 : -1;
                if (a < 8) ty = o.y + s * 8;
            }
            const isRetreating = isHome ? (tx < p.x - 2) : (tx > p.x + 2);
            const cbSpd = isRetreating ? 0.66 : 0.58;
            this._physicsStep(p, tx, ty, cbSpd * clamp(sf, 0.82, 1.7)); return;
        }

        if (isFB) {
            let ms = 0.35 * clamp(sf, 0.75, 1.6);
            if (p._fbMode === 'overlap') {
                // [윙백 폭풍 오버래핑] 윙어의 바깥쪽 터치라인을 타고 볼보다 앞서서 엔드라인까지 질주!
                ty = p.slotY < 50 ? 6 : 94; // 완벽한 터치라인 밀착
                if (phase === 'finalThird') {
                    // 상대 박스 엔드라인 근처 (x=84~92)까지 전력 침투하여 크로스/컷백 노림!
                    tx = isHome ? clamp(offX - 1.2, 82, 92) : clamp(offX + 1.2, 8, 18);
                    ms = 0.85 * clamp(sf, 0.85, 1.95);
                } else if (phase === 'progressing') {
                    // 볼 소유자보다 6~10야드 앞서서 질주하는 오버랩 스프린트!
                    const leadX = isHome ? Math.min(this.ball.x + 8, offX - 2) : Math.max(this.ball.x - 8, offX + 2);
                    tx = isHome ? Math.max(leadX, lines.mfX + 6) : Math.min(leadX, lines.mfX - 6);
                    ms = 0.80 * clamp(sf, 0.82, 1.85);
                } else {
                    tx = lines.dfX + fwd * 8;
                    ms = 0.50 * clamp(sf, 0.75, 1.5);
                }
            } else if (p._fbMode === 'underlap') {
                // [인버티드 윙백(IWB) 언더래핑] 터치라인 대신 중앙 하프스페이스/볼란치 옆으로 들어와 3-2 빌드업 대형 형성
                ty = p.slotY < 50 ? 32 : 68;
                tx = lines.mfX + fwd * (phase === 'building' ? -2 : 4);
                ms = 0.55 * clamp(sf, 0.78, 1.6);
            } else {
                // [홀드 풀백] 반대편 풀백은 3백 변형 레스트 디펜스를 위해 후방 밸런스 유지
                ty = p.slotY < 50 ? 12 : 88;
                tx = lines.dfX + fwd * (phase === 'building' ? 2 : 5);
                ms = 0.32 * clamp(sf, 0.7, 1.4);
            }

            tx = clamp(tx, 6, 94);
            ty = clamp(ty, 4, 96);
            this._physicsStep(p, tx, ty, ms); return;
        }

        // Fallback
        this._physicsStep(p, p.baseX, p.slotY, 0.3);
    }

    // ═══════════════════════════════════════════════════════════════
    //  OFF-BALL DEFEND V3 (침투 공격수 대인 마킹 밀착 & 미드필더 적극적 수비 가담)
    // ═══════════════════════════════════════════════════════════════
    _offBallDefend_V3(p, presser, isHome, sf, ms, bhv) {
        const tid = p.teamId;
        const fwd = isHome ? 1 : -1;
        const lines = this._getTeamBlockLines(tid);
        const ballX = this.ball.x, ballY = this.ball.y;
        const inOwnThird = isHome ? ballX < 36 : ballX > 64;
        const dBall = Math.hypot(p.x - ballX, p.y - ballY);
        const pressIsMe = (presser === p);
        const owner = this.ball.owner;
        p._isTrackingRunner = false;

        // [5단계] 실점 직후 / 킥오프 수비 안정화: 전원이 무작정 전진하거나 첫 패스에 덤비지 않고 중앙 블록 정렬 우선
        if (this._postKickoffDefRealignTicks > 0) {
            p._isTrackingRunner = false;
            if (p.position === 'DF') {
                const tx = lines.dfX;
                const ty = p.slotY;
                const s = 0.55 * clamp(sf, 0.8, 1.5);
                this._physicsStep(p, clamp(tx, 4, 96), clamp(ty, 4, 96), s);
                return;
            } else if (p.position === 'MF') {
                const isDM = ['DM', 'CDM', 'ANC', 'DLP', 'BWM', 'REG', 'HB'].includes(p.role) || ['CDM', 'DM'].includes(p.detailPosition);
                const tx = lines.dfX + fwd * (isDM ? 6.0 : 10.0);
                const ty = clamp(p.slotY, 28, 72); // 중앙 복도(Zone 14) 집중 차단
                const s = 0.55 * clamp(sf, 0.8, 1.5);
                this._physicsStep(p, clamp(tx, 4, 96), clamp(ty, 4, 96), s);
                return;
            }
        }

        // 태클 시도: 전담 압박자이거나, 볼 캐리어가 근처(dBall < 4.0, 미드필더/수비수는 4.4)에 들어왔을 때 즉시 경합!
        if (owner && owner.teamId !== tid && p._stealCooldown <= 0) {
            const tackleRange = pressIsMe ? 5.4 : (p.position === 'FW' ? 3.5 : 4.4);
            if (dBall < tackleRange && this._attemptTackle(p, owner)) return;
        }

        // 1) FW DEFENSE (공격수: 전담 압박자만 압박, 나머지는 중앙선 근처에서 대형 유지 및 역습 대기)
        if (p.position === 'FW') {
            p.burstTimer = 0; p._fwMode = 'shadow'; p._comingShort = false;
            const isCentralST = ['ST', 'CF', 'AF', 'P', 'TM', 'DLF'].includes(p.role);
            const inOurHalf = isHome ? ballX < 50 : ballX > 50;
            const baseFWX = isCentralST ? (lines.fwX + fwd * 2) : lines.fwX;
            let tx = isHome ? clamp(baseFWX, 20, 90) : clamp(baseFWX, 10, 80);
            if (inOurHalf) {
                tx = isHome ? Math.min(tx, 52) : Math.max(tx, 48);
            }
            let ty = p.slotY;

            if (pressIsMe || dBall < 3.6) {
                tx = ballX; ty = ballY;
                let s = 0.88 * clamp(sf, 0.85, 1.75);
                this._physicsStep(p, tx, ty, s);
            } else {
                ty += clamp((ballY - ty) * 0.20, -5, 5);
                let s = 0.35 * clamp(sf, 0.75, 1.4);
                this._physicsStep(p, tx, ty, s);
            }
            return;
        }

        // 2) MF DEFENSE (미드필더: 구경만 하지 않고 가장 가까운 미드필더가 볼 보유자를 압박하며, 나머지는 침투하는 상대 미드필더/공격수 밀착 마킹!)
        if (p.position === 'MF') {
            p._comingShort = false;
            const isDM = ['DM', 'BWM', 'A', 'HB', 'DLP', 'ANC', 'REG'].includes(p.role) || ['CDM', 'DM'].includes(p.detailPosition);
            const isAM = ['AP', 'AM', 'SS'].includes(p.role) || ['CAM', 'AM'].includes(p.detailPosition);
            const inOurHalf = isHome ? ballX < 52 : ballX > 48;

            const teamMFs = this.players.filter(q => q.teamId === tid && q.position === 'MF');
            const closestMFToBall = teamMFs.slice().sort((a, b) => Math.hypot(a.x - ballX, a.y - ballY) - Math.hypot(b.x - ballX, b.y - ballY))[0];
            const isClosestMFToBall = closestMFToBall === p;

            // 미드필더 수비 기본선 (Zone 14 2선 블록)
            let baseLineX;
            if (inOwnThird) {
                baseLineX = isDM ? (lines.dfX + fwd * 4.0) : (lines.dfX + fwd * (isAM ? 8.5 : 6.0));
            } else if (inOurHalf) {
                baseLineX = isDM ? (lines.dfX + fwd * 5.5) : (lines.dfX + fwd * (isAM ? 10.5 : 7.5));
            } else {
                baseLineX = isDM ? (lines.mfX - fwd * 3.0) : lines.mfX;
            }

            // 전담 압박자이거나, 볼 근처(11.5m 이내)의 가장 가까운 미드필더는 적극적으로 볼 캐리어를 압박/견제!
            if (pressIsMe || dBall < 4.5 || (isClosestMFToBall && dBall < 11.5)) {
                let tx = ballX - fwd * 0.8;
                let ty = ballY;
                let ms = 0.90 * clamp(sf, 0.85, 1.85);
                this._physicsStep(p, clamp(tx, 4, 96), clamp(ty, 4, 96), ms);
                return;
            }

            // 내 수비 구역 근처로 침투하거나 패스를 받으려는 상대 선수(MF/FW)가 있으면 멍하니 서있지 않고 바짝 붙어서 마킹!
            const oppRunner = this.players.filter(o =>
                o.teamId !== tid && o.position !== 'GK' && o !== owner &&
                Math.abs(o.x - baseLineX) < 13 && Math.abs(o.y - p.slotY) < 14
            ).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];

            if (oppRunner) {
                const tx = isHome ? clamp(oppRunner.x - 1.5, 8, 86) : clamp(oppRunner.x + 1.5, 14, 92);
                const ty = clamp(p.slotY * 0.25 + oppRunner.y * 0.75, 6, 94);
                const isRunnerBursting = oppRunner._fwMode === 'burst' || oppRunner.burstTimer > 0 || oppRunner === this.ball.intendedReceiver;
                const ms = (isRunnerBursting ? 0.88 : 0.68) * clamp(sf, 0.80, 1.75);
                this._physicsStep(p, tx, ty, ms);
                return;
            }

            let tx = baseLineX;
            let ty = p.slotY + clamp((ballY - p.slotY) * 0.30, -8, 8);
            const caughtBehind = isHome ? (p.x > ballX + 3) : (p.x < ballX - 3);
            let moveSpd = (caughtBehind ? 0.86 : (inOurHalf ? 0.60 : 0.46)) * clamp(sf, 0.78, 1.6);
            this._physicsStep(p, clamp(tx, 4, 96), clamp(ty, 4, 96), moveSpd);
            return;
        }

        // 3) DF DEFENSE (침투자를 따라가되, 수비 라인과 커버 공간을 우선)
        if (p.position === 'DF') {
            const isCB = ['CD', 'BPD', 'NCB', 'LIB'].includes(p.role) || ['CB', 'SW'].includes(p.detailPosition);
            const isFB_role = ['FB', 'WB', 'CWB', 'IWB'].includes(p.role) || ['LB', 'RB', 'LWB', 'RWB'].includes(p.detailPosition);
            const tidDFs = this.players.filter(q => q.teamId === tid && q.position === 'DF');
            const oppTid = tid === 'home' ? 'away' : 'home';
            const isOppCounter = this._phase[oppTid] === 'counter';
            const caughtBehind = isHome ? (p.x > ballX + 2) : (p.x < ballX - 2);
            const opponentHasBall = owner && owner.teamId !== tid;
            const defensiveRetreat = opponentHasBall || isOppCounter ||
                (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner && this.ball.lastOwner.teamId !== tid);
            if (defensiveRetreat) p._isTrackingRunner = false;

            let tx = lines.dfX;
            if (isFB_role) tx += fwd * 1.5;
            let ty = p.slotY;
            let ms = 0.56 * clamp(sf, 0.78, 1.6);

            if (isCB) {
                const isLeftCB = p.slotY < 50;
                // 페널티 박스 및 위험 지역에서 볼 캐리어가 가까우면 즉시 압박/차단
                if ((inOwnThird && dBall < 6.5 && pressIsMe) || dBall < 4.2) {
                    p._isTrackingRunner = !defensiveRetreat;
                    tx = ballX - fwd * 1.0;
                    ty = ballY;
                    ms = 0.94 * clamp(sf, 0.88, 1.88);
                } else {
                    const oppFW = this._findMarkTargetForDF(p, 'FW');
                    if (oppFW) {
                        p._isTrackingRunner = !defensiveRetreat;
                        const isReceivingFlight = oppFW === this.ball.intendedReceiver && this.ball.state === BallState.IN_FLIGHT && this.ball.targetPos;
                        const isPenetrating = isReceivingFlight || oppFW._fwMode === 'burst' || oppFW.burstTimer > 0 ||
                            (isHome ? oppFW.x < lines.dfX + 10 : oppFW.x > lines.dfX - 10) ||
                            inOwnThird || isOppCounter;
                        const refX = isReceivingFlight ? (oppFW.x * 0.35 + this.ball.targetPos.x * 0.65) : oppFW.x;
                        const refY = isReceivingFlight ? (oppFW.y * 0.35 + this.ball.targetPos.y * 0.65) : oppFW.y;
                        // 침투자의 좌표를 그대로 복제하지 않고 골사이드 2.8m 간격을 둔다.
                        // 그래야 수비수가 주자를 따라가면서도 패스 받을 공간과 오프사이드 함정이 남는다.
                        const markX = isHome ? (refX - 2.8) : (refX + 2.8);
                        const stepUpCap = isHome ? Math.max(lines.dfX + 16, 52) : Math.min(lines.dfX - 16, 48);
                        // [5단계] 오프사이드 라인 개선: 공과 골대 사이(Goal-side) 우선 확보 및 무작정 맨마킹 방지
                        const isBallAirborne = this.ball.state === BallState.IN_FLIGHT;
                        const attackerIsAheadOfLine = isHome ? (refX < lines.dfX - 1.5) : (refX > lines.dfX + 1.5);

                        if (isPenetrating && isBallAirborne && !defensiveRetreat) {
                            p._isTrackingRunner = true;
                            tx = isHome ? clamp(markX, 4.2, stepUpCap) : clamp(markX, stepUpCap, 95.8);
                            ty = clamp(p.slotY * 0.35 + refY * 0.65, 12, 88);
                            ms = 0.82 * clamp(sf, 0.88, 1.75);
                        } else if (isPenetrating && !attackerIsAheadOfLine && !defensiveRetreat) {
                            p._isTrackingRunner = false;
                            const holdX = isHome ? Math.max(lines.dfX, markX) : Math.min(lines.dfX, markX);
                            tx = isHome ? clamp(holdX, lines.dfX - 3.0, lines.dfX + 4.0) : clamp(holdX, lines.dfX - 4.0, lines.dfX + 3.0);
                            ty = clamp(p.slotY * 0.50 + refY * 0.50, 14, 86);
                            ms = 0.72 * clamp(sf, 0.82, 1.6);
                        } else {
                            p._isTrackingRunner = false;
                            const retreatX = isHome ? Math.min(lines.dfX, ballX - 2.5) : Math.max(lines.dfX, ballX + 2.5);
                            tx = isHome ? clamp(retreatX, 8, 52) : clamp(retreatX, 48, 92);
                            ty = clamp(p.slotY * 0.60 + refY * 0.40, 16, 84);
                            ms = 0.68 * clamp(sf, 0.80, 1.55);
                        }
                    } else {
                        ty = isLeftCB ? clamp(ty, 34, 46) : clamp(ty, 54, 66);
                        if (caughtBehind || isOppCounter) {
                            ms = 0.90 * clamp(sf, 0.85, 1.8);
                        }
                    }
                }

                // 마킹 타겟이 없을 때만 CB 간 기본 간격 유지 (대인 마킹 중에는 억지로 떼어놓지 않음!)
                if (!p._isTrackingRunner) {
                    const otherCB = tidDFs.filter(q => q !== p && (['CD', 'BPD', 'NCB', 'LIB'].includes(q.role) || ['CB', 'SW'].includes(q.detailPosition)));
                    for (const o of otherCB) {
                        const dY = ty - o.y; const a = Math.abs(dY); const s = dY >= 0 ? 1 : -1;
                        if (a < 10) ty = o.y + s * 10;
                    }
                }
            } else if (isFB_role) {
                // [FB 규율] 측면 윙어/공격수가 침투하면 수비라인 제한 없이 끝까지 따라붙어 마킹!
                const sameSide = (p.slotY < 50 && ballY < 44) || (p.slotY > 50 && ballY > 56);
                if ((sameSide && pressIsMe && dBall < 9.0) || dBall < 4.5) {
                    p._isTrackingRunner = true;
                    tx = ballX - fwd * 1.0;
                    ty = clamp(ballY, p.slotY < 50 ? 4 : 58, p.slotY < 50 ? 42 : 96);
                    ms = 0.94 * clamp(sf, 0.86, 1.86);
                } else {
                    const oppW = this._findMarkTargetForDF(p, 'wide');
                    if (oppW) {
                        const isReceivingFlight = oppW === this.ball.intendedReceiver && this.ball.state === BallState.IN_FLIGHT && this.ball.targetPos;
                        const refX = isReceivingFlight ? (oppW.x * 0.35 + this.ball.targetPos.x * 0.65) : oppW.x;
                        const refY = isReceivingFlight ? (oppW.y * 0.35 + this.ball.targetPos.y * 0.65) : oppW.y;
                        const markX = isHome ? (refX - 2.8) : (refX + 2.8);
                        const stepUpCap = isHome ? Math.max(lines.dfX + 16, 52) : Math.min(lines.dfX - 16, 48);
                        const isThreat = isReceivingFlight || oppW._fwMode === 'burst' || oppW.burstTimer > 0 ||
                            (isHome ? oppW.x < lines.dfX + 10 : oppW.x > lines.dfX - 10) ||
                            inOwnThird || isOppCounter;
                        const isBallAirborne = this.ball.state === BallState.IN_FLIGHT;
                        const attackerIsAheadOfLine = isHome ? (refX < lines.dfX - 1.5) : (refX > lines.dfX + 1.5);

                        if ((isThreat || caughtBehind) && isBallAirborne && !defensiveRetreat) {
                            p._isTrackingRunner = true;
                            tx = isHome ? clamp(markX, 4.2, stepUpCap) : clamp(markX, stepUpCap, 95.8);
                            ty = clamp(p.slotY * 0.30 + refY * 0.70, p.slotY < 50 ? 4 : 54, p.slotY < 50 ? 46 : 96);
                            ms = 0.76 * clamp(sf, 0.86, 1.72);
                        } else if ((isThreat || caughtBehind) && !attackerIsAheadOfLine && !defensiveRetreat) {
                            p._isTrackingRunner = false;
                            const holdX = isHome ? Math.max(lines.dfX, markX) : Math.min(lines.dfX, markX);
                            tx = isHome ? clamp(holdX, lines.dfX - 3.0, lines.dfX + 4.0) : clamp(holdX, lines.dfX - 4.0, lines.dfX + 3.0);
                            ty = clamp(p.slotY * 0.45 + refY * 0.55, p.slotY < 50 ? 6 : 56, p.slotY < 50 ? 42 : 94);
                            ms = 0.70 * clamp(sf, 0.82, 1.6);
                        } else {
                            p._isTrackingRunner = false;
                            const retreatX = isHome ? Math.min(lines.dfX, ballX - 2.5) : Math.max(lines.dfX, ballX + 2.5);
                            tx = isHome ? clamp(retreatX, 8, 52) : clamp(retreatX, 48, 92);
                            ty = clamp(p.slotY * 0.55 + refY * 0.45, p.slotY < 50 ? 6 : 56, p.slotY < 50 ? 42 : 94);
                            ms = 0.68 * clamp(sf, 0.80, 1.52);
                        }
                    } else {
                        ty = p.slotY < 50 ? 16 : 84;
                        if (caughtBehind || isOppCounter) {
                            ms = 0.90 * clamp(sf, 0.85, 1.8);
                        }
                    }
                }
            }

            this._physicsStep(p, clamp(tx, 4, 96), clamp(ty, 3, 97), ms);
            return;
        }
    }

    _findMarkTargetForDF(p, kind) {
        const isHome = p.teamId === 'home';
        const lines = this._getTeamBlockLines(p.teamId);
        const opps = this.players.filter(q => q.teamId !== p.teamId && q.position !== 'GK');
        const myFBs = this.players.filter(q => q.teamId === p.teamId && q.position === 'DF' && (['FB', 'WB', 'CWB', 'IWB'].includes(q.role) || ['LB', 'RB', 'LWB', 'RWB'].includes(q.detailPosition)));
        if (kind === 'FW') {
            // 중앙/하프스페이스(y: 18~82)의 상대 FW 및 위협적으로 침투 중인 MF를 위험도 순으로 선별!
            const centralCandidates = opps.filter(o =>
                o.y >= 18 && o.y <= 82 && (
                    o.position === 'FW' ||
                    o._fwMode === 'burst' ||
                    o.burstTimer > 0 ||
                    o === this.ball.intendedReceiver ||
                    (isHome ? o.x < lines.dfX + 10 : o.x > lines.dfX - 10)
                )
            );

            if (!centralCandidates.length) return null;

            const myCBs = this.players
                .filter(q => q.teamId === p.teamId && q.position === 'DF' && (['CD', 'BPD', 'NCB', 'LIB'].includes(q.role) || ['CB', 'SW'].includes(q.detailPosition)))
                .sort((a, b) => a.slotY - b.slotY);
            const cbCount = Math.max(1, myCBs.length);
            const myIdx = Math.max(0, myCBs.indexOf(p));

            // 가장 위험한 중앙/침투 타겟 상위 cbCount명을 먼저 추려내어 중앙 스트라이커(ST)가 누락되는 현상 원천 차단!
            const scored = centralCandidates.slice().sort((a, b) => {
                const scoreOf = (o) => {
                    let s = 0;
                    if (o === this.ball.intendedReceiver) s += 45;
                    if (o._fwMode === 'burst' || o.burstTimer > 0) s += 35;
                    if (o.position === 'FW') s += 28;
                    s += Math.max(0, 32 - Math.abs(o.y - 50) * 0.85); // 중앙 스트라이커 최우선
                    s += isHome ? (100 - o.x) * 0.55 : o.x * 0.55;   // 아군 골문에 가까울수록 위험
                    const fbClose = myFBs.some(fb => Math.hypot(fb.x - o.x, fb.y - o.y) < 5.5 && Math.abs(o.y - 50) > 22);
                    if (fbClose) s -= 26;
                    return s;
                };
                return scoreOf(b) - scoreOf(a);
            });

            const topThreats = scored.slice(0, cbCount).sort((a, b) => a.y - b.y);
            if (topThreats.length === 1) {
                return topThreats[0];
            }
            return topThreats[Math.min(myIdx, topThreats.length - 1)];
        } else {
            // 측면 수비수(FB/WB): 측면 및 하프스페이스로 침투하는 상대 윙어/공격수 전담 마킹!
            return opps.filter(o =>
                ((p.slotY < 50 && o.y < 42) || (p.slotY > 50 && o.y > 58)) &&
                (o.position === 'FW' || o.position === 'MF')
            ).sort((a, b) => {
                const aBurst = (a._fwMode === 'burst' || a.burstTimer > 0 || a === this.ball.intendedReceiver) ? -16 : 0;
                const bBurst = (b._fwMode === 'burst' || b.burstTimer > 0 || b === this.ball.intendedReceiver) ? -16 : 0;
                const aFW = a.position === 'FW' ? -8 : 0;
                const bFW = b.position === 'FW' ? -8 : 0;
                return (Math.hypot(a.x - p.x, a.y - p.y) + aBurst + aFW) - (Math.hypot(b.x - p.x, b.y - p.y) + bBurst + bFW);
            })[0] || null;
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  PHYSICS + COLLISION V3 (REALISTIC SPRINT SPEED & CLEAN TEMPO)
    // ─────────────────────────────────────────────────────────────
    _physicsStep(p, desiredX, desiredY, accel) {
        const accelEff = clamp(accel, 0.15, 2.2);
        const dx = clamp(desiredX - p.x, -24, 24);
        const dy = clamp(desiredY - p.y, -18, 18);
        // [민첩한 달리기 가속도] 선수들이 기민하게 반응하고 시원하게 달림
        const dvx = dx * accelEff * 0.070;
        const dvy = dy * accelEff * 0.070;
        p.vx = p.vx * 0.55 + dvx;
        p.vy = p.vy * 0.55 + dvy;
        // 최고 달리기 속도 정상화: 일반 조깅(0.8), 전력 질주/치달(1.4~1.85)
        const maxSpd = 0.82 + accelEff * 0.65;
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
        // [동네축구 뭉침 방지] 같은 팀 선수 간 최소 4.5 이상 간격 유지 (거리 비례 반발력)
        const MIN = 4.5;
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                const a = this.players[i], b = this.players[j];
                if (a.teamId !== b.teamId) continue;
                const dx = b.x - a.x, dy = b.y - a.y;
                const d = Math.hypot(dx, dy);
                if (d < MIN && d > 0.01) {
                    const overlap = MIN - d;
                    const nx = dx / d, ny = dy / d;
                    // X와 Y 모두 균등하게 밀어내어 겹침 완전 방지
                    a.x -= nx * overlap * 0.45;
                    a.y -= ny * overlap * 0.55;
                    b.x += nx * overlap * 0.45;
                    b.y += ny * overlap * 0.55;
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  DEFENSIVE LINES + OFFSIDE (SMOOTH)
    // ─────────────────────────────────────────────────────────────
    _adjustDefensiveLines() {
        // Defensive line height enforcement for CBs: 침투 공격수를 대인 마킹 중인 CB는 억지로 라인으로 끌어당기거나 떼어놓지 않음!
        for (const tid of ['home', 'away']) {
            const cbs = this.players.filter(p => p.teamId === tid && p.position === 'DF' && (['CD', 'BPD', 'NCB', 'LIB'].includes(p.role) || ['CB', 'SW'].includes(p.detailPosition)));
            if (cbs.length < 2) continue;
            const xs = cbs.map(q => q.x);
            const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
            const maxDev = 5.0; // [5단계] CB 라인 통솔 및 오프사이드 트랩 유지 강화 (8 -> 5)
            const lines = this._getTeamBlockLines(tid);
            for (const cb of cbs) {
                if (cb._isTrackingRunner) continue;
                if (Math.abs(cb.x - mean) > maxDev) {
                    cb.x += (mean - cb.x) * 0.08;
                }
                if (!lines.haveBall) {
                    cb.x += (lines.dfX - cb.x) * 0.08;
                }
            }
            cbs.sort((a, b) => a.y - b.y);
            const cb1 = cbs[0], cb2 = cbs[1];
            if (!cb1._isTrackingRunner && !cb2._isTrackingRunner) {
                const dy = cb2.y - cb1.y;
                if (dy < 12) {
                    const push = (12 - dy) * 0.5;
                    cb1.y -= push * 0.12;
                    cb2.y += push * 0.12;
                }
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
        const isBallInFlight = this.ball.state === BallState.IN_FLIGHT;
        for (const p of this.players) {
            if (p.position !== 'FW' && !['W', 'IW', 'IF'].includes(p.role)) continue;
            const isHomeFW = p.teamId === 'home';
            const lim = this._calcOffsideLineX(isHomeFW);
            const bad = isHomeFW ? p.x > lim : p.x < lim;
            // 패스 직전의 공격 움직임을 매 틱 취소하지 않는다. 명백히 2m 이상
            // 앞선 경우에만 부드럽게 온사이드 라인 뒤로 복귀시킨다.
            const margin = 2.0;
            const clearlyOffside = isHomeFW ? p.x > lim + margin : p.x < lim - margin;
            if (clearlyOffside && (!isBallInFlight || p.burstTimer <= 0)) {
                const t = isHomeFW ? lim - 0.4 : lim + 0.4;
                p.vx += (t - p.x) * 0.08;
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
                            const r = 4 + (i % 3) * 2;
                            const ox = Math.cos(i * 1.7 + this.celebrationState * 0.2) * (r * 0.5);
                            const oy = Math.abs(Math.sin(i * 1.3 + this.celebrationState * 0.2)) * r;
                            this._physicsStep(p, clamp(tx + ox, 4, 96), clamp(ty + oy, 4, 96), 0.7);
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
                        const r = 6 + (i % 5);
                        const ang = (i * 1.15) + (this.celebrationState * 0.15);
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
                if (typeof p.stats[k] === 'number') {
                    p.stats[k] = clamp(p.stats[k] * factor, 15, 99);
                }
            }
        });
    }

    startExitAnimation(winner) {
        this.exitAnimActive = true;
        this.exitAnimTicks = 0;
        this.exitAnimDone = false;
        this.exitWinner = winner;
        this._recoverPlayersAfterMatch();
        
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

    _recoverPlayersAfterMatch() {
        if (this.postMatchRecoveryApplied) return;
        this.postMatchRecoveryApplied = true;

        this.players.forEach(p => {
            const stamina = clamp(p.stamina || 0, 0, 100);
            const recovery = stamina >= 75 ? 100 - stamina : 15 + stamina * 0.12;
            p.stamina = clamp(stamina + recovery, 0, 100);
            if (p.rawPlayer && typeof p.rawPlayer === 'object' && p.rawPlayer.condition !== undefined) {
                const condition = clamp(p.rawPlayer.condition || 0, 0, 100);
                const conditionRecovery = condition >= 75 ? 100 - condition : 15 + condition * 0.12;
                p.rawPlayer.condition = clamp(condition + conditionRecovery, 0, 100);
            }
        });
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RealSoccerEngine,
        DeepTacticManager,
        BallState,
        SimBall,
        SimPlayer
    };
}
