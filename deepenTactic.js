// deepenTactic.js
// [PART 1] 湲곗〈 UI 愿由ъ옄 (DeepTacticManager) - ?좎?
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
        // ... (湲곗〈 UI 肄붾뱶 ?좎? - ?꾨옒??媛꾨왂?? ...
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
            <h4 style="color: #ffd700; margin-top: 0;">?숋툘 ?몃? ?꾩닠 ?ㅼ젙</h4>
            <div style="margin-bottom: 10px;">
                <label>?섎퉬 ?쇱씤</label>
                <select id="dt-defensiveLine" style="width:100%; padding:5px; background:#333; color:white;">
                    <option value="deep" ${dt.defensiveLine === 'deep' ? 'selected' : ''}>?대┝ (Deep)</option>
                    <option value="standard" ${dt.defensiveLine === 'standard' ? 'selected' : ''}>蹂댄넻</option>
                    <option value="high" ${dt.defensiveLine === 'high' ? 'selected' : ''}>?щ┝ (High)</option>
                </select>
            </div>
            <div style="color: #aaa; font-size: 0.8rem;">* ?섎㉧吏???먮룞 ?곸슜?⑸땲??</div>
        `;
        document.getElementById('dt-defensiveLine').addEventListener('change', (e) => {
            gameData.deepTactics.defensiveLine = e.target.value;
        });
    }
};

// [?좉퇋] ??????뺤쓽
const RUN_TYPE = {
    STRIKER_RUN: 'striker_run',    // 怨⑤Ц ?ν빐 源딆닕??移⑦닾
    SUPPORT_RUN: 'support_run',    // 怨??뚯쑀??媛源뚯씠 ?쇨컖???뺤꽦
    CHANNEL_RUN: 'channel_run',    // ?섎퉬 ?쇱씤 ?ъ씠 怨듦컙 ?뚭퀬?ㅺ린
    WIDE_RUN:    'wide_run',       // 痢〓㈃?쇰줈 ?볧???怨듦컙 李쎌텧
    UNDERLAP_RUN:'underlap_run',   // ?덉쑝濡??뚭퀬?ㅺ린 (IF, IWB)
    HOLD_POSITION:'hold_position', // ?꾩튂 ?좎? + 誘몄꽭 議곗젙留?
};

// [?좉퇋] ??븷蹂??????留ㅽ븨
const ROLE_RUN_TYPE = {
    // 怨듦꺽吏?
    AF: RUN_TYPE.STRIKER_RUN, CF: RUN_TYPE.SUPPORT_RUN, P: RUN_TYPE.STRIKER_RUN,
    DLF: RUN_TYPE.SUPPORT_RUN, TM: RUN_TYPE.HOLD_POSITION, F9: RUN_TYPE.SUPPORT_RUN,
    PF: RUN_TYPE.CHANNEL_RUN, RD: RUN_TYPE.CHANNEL_RUN, W: RUN_TYPE.WIDE_RUN, IF: RUN_TYPE.UNDERLAP_RUN,
    WP: RUN_TYPE.SUPPORT_RUN, IW: RUN_TYPE.UNDERLAP_RUN,
    
    // 誘몃뱶?꾨뜑
    BBM: RUN_TYPE.STRIKER_RUN, MEZ: RUN_TYPE.UNDERLAP_RUN, DLP: RUN_TYPE.HOLD_POSITION,
    BWM: RUN_TYPE.HOLD_POSITION, AP: RUN_TYPE.SUPPORT_RUN, REG: RUN_TYPE.HOLD_POSITION,
    CAR: RUN_TYPE.SUPPORT_RUN, EG: RUN_TYPE.HOLD_POSITION, SS: RUN_TYPE.STRIKER_RUN,
    ANC: RUN_TYPE.HOLD_POSITION, DM: RUN_TYPE.HOLD_POSITION, SV: RUN_TYPE.STRIKER_RUN,
    
    // ?섎퉬吏?(鍮뚮뱶?????吏곸엫)
    BPD: RUN_TYPE.SUPPORT_RUN, CD: RUN_TYPE.HOLD_POSITION, NCB: RUN_TYPE.HOLD_POSITION,
    IWB: RUN_TYPE.UNDERLAP_RUN, CWB: RUN_TYPE.WIDE_RUN, LIB: RUN_TYPE.SUPPORT_RUN,
    FB: RUN_TYPE.HOLD_POSITION, WB: RUN_TYPE.WIDE_RUN,
    GK: RUN_TYPE.HOLD_POSITION
};

// [?좉퇋] ?ы띁: 媛곷룄濡?醫뚰몴 援ы븯湲?
function getPosByAngle(x, y, angleDeg, dist) {
    const rad = angleDeg * (Math.PI / 180);
    return {
        x: Math.max(2, Math.min(98, x + Math.cos(rad) * dist)),
        y: Math.max(2, Math.min(98, y + Math.sin(rad) * dist))
    };
}

// =========================================================================================
// [PART 2] 由ъ뼹 ?ъ빱 ?붿쭊 (RealSoccerEngine) - ?듭떖 濡쒖쭅
// =========================================================================================

// 1. 怨??곹깭 癒몄떊 ?뺤쓽
const BallState = {
    LOOSE: 0,       // ?꾧뎄???뚯쑀???꾨떂 (寃쏀빀, ?먮Ⅴ??怨?
    CONTROLLED: 1,  // ?좎닔媛 ?뚯쑀 以?(?쒕━釉? ?ㅽ븨)
    IN_FLIGHT: 2,   // ?⑥뒪/?덊똿?쇰줈 ?좎븘媛??以?
    DEAD: 3         // ?꾩썐, 怨? ?뚯슱 ???뺤? ?곹깭
};

class SimBall {
    constructor() {
        this.x = 50;
        this.y = 50;
        this.z = 0; // ?믪씠
        this.state = BallState.DEAD;
        this.owner = null; // ?뚯쑀??SimPlayer 媛앹껜
        this.intendedReceiver = null; // [?좉퇋] ?⑥뒪 ?섏떊 ?덉젙??
        this.lastOwner = null; // [?좉퇋] 吏곸쟾 ?뚯쑀??(?⑥뒪 猷⑦봽 諛⑹???
        this.targetPos = { x: 50, y: 50 }; // ?⑥뒪/??紐⑺몴 吏??
        this.velocity = { x: 0, y: 0 };
    }
}

class SimPlayer {
    constructor(data, teamId, role, lineStats, morale = 50, tacticMultiplier = 1.0) {
        this.id = data.name; // 怨좎쑀 ?앸퀎??
        this.name = data.name;
        this.position = data.position; // GK, DF, MF, FW
        this.rating = data.rating;
        this.teamId = teamId; // 'home' or 'away'
        this.role = role; // ?꾩닠 ??븷

        // ?쒕??덉씠???곹깭
        this.x = 0;
        this.y = 0;
        // [?좉퇋] ?붿쭊 ?대? 臾쇰━ 怨꾩궛???꾪븳 ?띾룄 ?곗씠??
        this.vx = 0;
        this.vy = 0;

        this.baseX = 0; // ?щ찓?댁뀡 湲곗? ?꾩튂 (X)
        this.baseY = 0; // ?щ찓?댁뀡 湲곗? ?꾩튂 (Y)
        this.stamina = (data.condition !== undefined) ? data.condition : 100;

        // ?λ젰移?留ㅽ븨 (0~100)
        this.stats = this.mapDNAStats(data, role, lineStats, morale, tacticMultiplier);
    }

    mapDNAStats(playerData, role, lineStats, morale, tacticMultiplier) {
        if (!lineStats || !lineStats.attack) { // ?곗씠???좏슚??寃??
            // Fallback to rating if lineStats are not available
            return { speed: playerData.rating, passing: playerData.rating, shooting: playerData.rating, defense: playerData.rating, decision: playerData.rating };
        }

        // [?섏젙] ?ш린(Morale)???곕Ⅸ ?λ젰移?蹂댁젙 議곗젙 (?좎? ?댁젏 ?쒓굅)
        // 湲곗〈: 10??2% (?ш린 100?????ㅽ꺈 +10% 六ν?湲?-> ?좎?媛 ?덈Т ?좊━??
        // 蹂寃? 10??0.5% (?ш린 100?????ㅽ꺈 +2.5% -> ?⑸━?곸씤 ?섏??쇰줈 議곗젙)
        const moraleFactor = 1 + ((morale - 50) * 0.0005);

        let line;
        if (playerData.position === 'FW') line = 'attack';
        else if (playerData.position === 'MF') line = 'midfield';
        else line = 'defense'; // DF and GK

        const baseStats = lineStats[line].stats;

        const finalStats = {};
        const statMapping = {
            'passing': 'technique', 'shooting': 'attack', 'defense': 'defense', 'speed': 'speed', 'decision': 'mentality',
            'physical': 'physical' // [?좉퇋] ?쇱?而??ㅽ꺈 留ㅽ븨 異붽?
        };

        for (const [simStat, dnaStat] of Object.entries(statMapping)) {
            const baseStatValue = baseStats[dnaStat] || playerData.rating; // DNA ?ㅽ꺈 ?놁쑝硫?OVR濡??泥?
            
            let statVal = TacticsManager.calculateFinalPower(baseStatValue, role, dnaStat);
            
            // [?곸슜] ?ш린 蹂대꼫??諛섏쁺
            statVal = statVal * moraleFactor;
            
            // [?곸슜] ?꾩닠 ?꾩꽦??諛섏쁺 (balanced??寃쎌슦 ?섎꼸??
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
        this.eventsQueue = []; // ?뚮뜑???쒖뒪?쒖쑝濡?蹂대궪 ?대깽??
        this.pendingShot = null; // [?좉퇋] ??寃곌낵 ?湲?
        this.celebrationTimer = 0; // [?좉퇋] ?몃젅癒몃땲 ??대㉧
        this.celebrationActor = null; // ?몃젅癒몃땲 二쇱씤怨?
        this.celebrationTarget = null; // ?몃젅癒몃땲 紐⑺몴 吏??
        this.celebrationType = null; // 'celebrate' or 'quick_restart'
        this.lastScorerTeam = null;
        this.homeScore = 0; // [?좉퇋] ?붿쭊 ?대? ?ㅼ퐫??異붿쟻
        this.awayScore = 0;
        this.userStats = null;
        this.aiStats = null;
        this.teamTactics = { home: homeTactic, away: awayTactic };

        // ?좎닔 珥덇린??
        this.initTeam(homeSquad, 'home', homeTactic);
        this.initTeam(awaySquad, 'away', awayTactic);
        
        // ?μ삤???명똿
        this.resetPositions('home');
    }

    // [?좉퇋] 泥대젰??諛섏쁺???ㅼ떆媛??ㅽ꺈 怨꾩궛 ?ы띁
    getEffectiveStat(player, statName) {
        let val = player.stats[statName];
        if (val === undefined) return 50;

        // 泥대젰???곕Ⅸ ?섎꼸???곸슜
        // 30 誘몃쭔: ?ш컖?????(50%)
        // 50 誘몃쭔: ???(75%)
        // 70 誘몃쭔: ?쎄컙 ???(90%)
        let factor = 1.0;
        if (player.stamina < 50) factor = 0.5;
        else if (player.stamina < 60) factor = 0.75;
        else if (player.stamina < 70) factor = 0.9;

        return val * factor;
    }

    // [?좉퇋] AI ????꾪븳 DNA ?ㅽ꺈 ?앹꽦
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
        // [?섏젙] 媛濡?紐⑤뱶 ?щ찓?댁뀡 醫뚰몴 ?ㅼ젙 (Left <-> Right)
        // Home(Red): ?쇱そ(0) 吏꾩쁺 -> ?ㅻⅨ履?100)?쇰줈 怨듦꺽
        // Away(Blue): ?ㅻⅨ履?100) 吏꾩쁺 -> ?쇱そ(0)?쇰줈 怨듦꺽
        
        // [?좉퇋] ?꾩닠??'balanced'(湲곕낯)??寃쎌슦 議곗쭅???섎꼸??遺??
        // ?꾩닠??吏쒖? ?딆쑝硫??좎닔?ㅼ씠 ?곗솗醫뚯솗?쒕떎??而⑥뀎 (?λ젰移?15% ?섑뼢)
        const tacticMultiplier = tactic === 'balanced' ? 0.85 : 1.0;

        const setupLine = (list, baseX) => {
            const height = 100; // Y異??믪씠

            // [?좉퇋] DNA ?ㅽ꺈 諛??ш린 ?ㅼ젙
            const isUserTeam = (teamId === 'home' && gameData.isHomeGame) || (teamId === 'away' && !gameData.isHomeGame);
            let lineStats;
            let teamMorale = 50; // AI 湲곕낯 ?ш린

            if (isUserTeam) {
                lineStats = gameData.lineStats;
                this.userStats = lineStats;
                teamMorale = gameData.teamMorale; // ?좎? ?? ?꾩옱 ?ш린 諛섏쁺 (?꾩닠 ?곸꽦 ?ы븿??
            } else {
                lineStats = this.aiStats || this.generateAIStats(squad);
                this.aiStats = lineStats;
                // [?섏젙] AI 湲곕낯 ?ш린 ?섑뼢 (?덈Т 媛뺥븿)
                // 85~100 -> 60~90 (?곷떦??醫뗭? ?곹깭)
                teamMorale = 60 + Math.floor(Math.random() * 31);
            }

            list.forEach((p, i) => {
                if (!p) return;
                
                // [?섏젙] ??븷 ?좊떦 (?좎? ?ㅼ젙 ?곗꽑 -> ?놁쑝硫??꾩닠 留욎땄???먮룞 諛곗젙)
                let role = null;
                if (gameData.playerRoles && gameData.playerRoles[p.name]) {
                    role = gameData.playerRoles[p.name];
                } 
                
                if (!role) {
                    // AI ?먮뒗 ?ㅼ젙 ?????좎? ?좎닔???꾩닠??留욌뒗 ??븷 ?먮룞 遺??
                    role = this.getBestRoleForTactic(tactic, p.position, i);
                }

                const simP = new SimPlayer(p, teamId, role, lineStats, teamMorale, tacticMultiplier);
                simP.baseX = baseX;
                // Y異??곹븯) 洹좊벑 諛곗튂 (5~95 ?ъ씠)
                simP.baseY = (height / (list.length + 1)) * (i + 1);
                simP.x = simP.baseX;
                simP.y = simP.baseY;
                this.players.push(simP);
            });
        };

        if (teamId === 'home') {
            // Home Formation (Left Side)
            if (squad.gk) setupLine([squad.gk], 5); // GK
            setupLine(squad.df, 20); // DF
            setupLine(squad.mf, 45); // MF
            setupLine(squad.fw, 80); // FW [?섏젙] 70 -> 80 (怨듦꺽??湲곕낯 ?꾩튂 ?곹뼢)
        } else {
            // Away Formation (Right Side)
            if (squad.gk) setupLine([squad.gk], 95);
            setupLine(squad.df, 80);
            setupLine(squad.mf, 55);
            setupLine(squad.fw, 20); // FW [?섏젙] 30 -> 20 (怨듦꺽??湲곕낯 ?꾩튂 ?곹뼢)
        }
    }

    // [?좉퇋] ?꾩닠蹂?理쒖쟻 ??븷 諛섑솚 ?ы띁
    getBestRoleForTactic(tactic, position, index) {
        if (position === 'GK') return 'GK';

        // ?꾩닠蹂?異붿쿇 ??븷 由ъ뒪??(?쒗솚 諛곗젙)
        const roleMap = {
            // ?먯쑀??以묒떖: ?곌퀎??怨듦꺽?? ?뚮젅?대찓?댁빱, 蹂??뚮젅???섎퉬??
            'tikitaka': { FW: ['F9', 'DLF'], MF: ['DLP', 'AP', 'MEZ'], DF: ['BPD', 'IWB'] },
            'possession': { FW: ['DLF', 'CF'], MF: ['DLP', 'AP', 'CAR'], DF: ['BPD', 'WB'] },
            'lavolpiana': { FW: ['F9', 'W'], MF: ['DLP', 'REG', 'MEZ'], DF: ['BPD', 'IWB'] },
            
            // ?뺣컯/怨듦꺽 以묒떖: 移⑦닾??怨듦꺽?? ?쒕룞??留롮? 誘몃뱶?꾨뜑
            'gegenpress': { FW: ['PF', 'AF'], MF: ['BBM', 'BWM', 'MEZ'], DF: ['CD', 'CWB'] },
            'totalFootball': { FW: ['CF', 'F9'], MF: ['BBM', 'MEZ', 'AP'], DF: ['BPD', 'CWB', 'LIB'] },
            
            // ?섎퉬/??뒿 以묒떖: 鍮좊Ⅸ 怨듦꺽?? ?섎퉬??誘몃뱶?꾨뜑, ?덉젙???섎퉬??
            'counter': { FW: ['AF', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'FB'] },
            'longBall': { FW: ['TM', 'AF'], MF: ['BWM', 'CM'], DF: ['NCB', 'CD'] },
            'twoLine': { FW: ['AF', 'P'], MF: ['BWM', 'CAR'], DF: ['CD', 'FB'] },
            'parkBus': { FW: ['P', 'TM'], MF: ['BWM', 'DLP'], DF: ['NCB', 'CD'] },
            'catenaccio': { FW: ['TM', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'LIB'] }
        };

        // 湲곕낯媛?(諛몃윴??
        const defaultRoles = { FW: ['AF', 'CF'], MF: ['BBM', 'AP'], DF: ['CD', 'FB'] };

        // 留ㅽ븨????븷???놁쑝硫?'counter' ?깆쓣 湲곕낯媛믪쑝濡?泥섎━?섍굅??defaultRoles ?ъ슜
        // tacticSystem???꾩닠紐낃낵 留ㅼ묶 (counter ?깆? 洹몃９?쇰줈 臾띠씪 ???덉쓬)
        let selectedMap = roleMap[tactic];
        if (!selectedMap) {
            // twoLine, longBall ?깆? ??留듭뿉 ?덉쑝誘濡?留ㅼ묶??
            // 留ㅼ묶 ???섎뒗 寃쎌슦(?ㅽ? ?? ?鍮?
            selectedMap = defaultRoles;
        }

        const candidates = selectedMap[position] || defaultRoles[position];
        // ?좎닔 ?쒖꽌(index)???곕씪 ??븷 ?쒗솚 諛곗젙 (?? MF媛 3紐낆씠硫?DLP, AP, MEZ 怨④퀬猷?
        return candidates[index % candidates.length];
    }

    resetPositions(kickoffTeamId = null) {
        this.ball.x = 50; this.ball.y = 50;
        this.ball.lastOwner = null; // [?좉퇋] 珥덇린??
        
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
                // [?섏젙] ?μ삤?????섑봽?쇱씤(50)???섏? ?딅룄濡??먭린 吏꾩쁺?쇰줈 蹂듦?
                p.y = p.baseY;
                // [異붽?] ?μ삤?????띾룄 珥덇린??
                p.vx = 0; p.vy = 0;
                
                if (p.teamId === 'home') {
                    // ?덊?(?쇱そ, 0~50)? 48???섏? ?딄쾶 (FW???섑봽?쇱씤 ?ㅻ줈)
                    // [?섏젙] 誘몃뱶?꾨뜑???쇳꽣 ?쒗겢(??10m 諛섍꼍) 諛뽰씤 40源뚯? 臾쇰윭?섍쾶 ??
                    const maxLine = p.position === 'MF' ? 40 : 48;
                    p.x = Math.min(p.baseX, maxLine);
                } else {
                    // ?먯젙?(?ㅻⅨ履? 50~100)? 52蹂대떎 ?묒븘吏吏 ?딄쾶
                    // [?섏젙] 誘몃뱶?꾨뜑???쇳꽣 ?쒗겢 諛뽰씤 60源뚯? 臾쇰윭?섍쾶 ??
                    const minLine = p.position === 'MF' ? 60 : 52;
                    p.x = Math.max(p.baseX, minLine);
                }
            }
        });
    }

    // ============================================================
    // ?윢 [?듭떖] 硫붿씤 ???낅뜲?댄듃 ?⑥닔 (1??= 1遺??먮쫫 ?쒕??덉씠??
    // ============================================================
    update(minute, isNewMinute) {
        this.eventsQueue = []; // ?대깽??珥덇린??

        // [?좉퇋] 留?遺꾨쭏??泥대젰 ?뚮え 濡쒖쭅 ?ㅽ뻾
        if (isNewMinute) {
            this.consumeStamina();
        }

        // [?좉퇋] ?앹젏 ???몃젅癒몃땲/由ы뵆?덉씠 ?쒕젅??泥섎━ (怨듭씠 怨⑤쭩??癒몃Т由?
        if (this.celebrationTimer > 0) {
            this.processCelebrationMovement(); // [?좉퇋] ?몃젅癒몃땲 ?吏곸엫 泥섎━
            this.celebrationTimer--;
            if (this.celebrationTimer <= 0) {
                // ??대㉧ 醫낅즺 ???μ삤???꾩튂濡?由ъ뀑
                const nextKickoff = this.lastScorerTeam === 'home' ? 'away' : 'home';
                this.resetPositions(nextKickoff);
            }
            // ?몃젅癒몃땲 以묒뿉???곹깭 ?좎? (怨??좎닔 硫덉땄)
            return this.getSnapshot();
        }

        // 1. 怨??곹깭 泥섎━
        if (this.ball.state === BallState.IN_FLIGHT) {
            // [?섏젙] 怨??대룞 ?띾룄 ?쒕??덉씠??(利됱떆 ?꾩갑 諛⑹?)
            const ballSpeed = 4.2; // [?섏젙] ?⑥뒪 ?띾룄 ?섑뼢 (7 -> 4.2)
            const dx = this.ball.targetPos.x - this.ball.x;
            const dy = this.ball.targetPos.y - this.ball.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= ballSpeed) {
                // [?꾩갑] 紐⑺몴 吏???꾨떖
                this.ball.x = this.ball.targetPos.x;
                this.ball.y = this.ball.targetPos.y;
                this.ball.state = BallState.LOOSE; // ?꾩갑 ??猷⑥쫰蹂??곹깭

                // ??寃곌낵 泥섎━
                if (this.pendingShot) {
                    this.handleShotResult();
                    return this.getSnapshot();
                }
            } else {
                // [?대룞 以? 紐⑺몴 諛⑺뼢?쇰줈 ?대룞
                const ratio = ballSpeed / dist;
                this.ball.x += dx * ratio;
                this.ball.y += dy * ratio;

                // ?대룞 以??명꽣?됲듃 泥댄겕
                this.checkInterception();
            }
        }

        // 2. 怨??뚯쑀沅??먯젙 (LOOSE ?곹깭????
        if (this.ball.state === BallState.LOOSE) {
            // 媛??媛源뚯슫 ?좎닔 李얘린
            let nearest = null;
            let minDst = 999;
            
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < minDst) { minDst = d; nearest = p; }
            });

            // [?섏젙] ?뚯쑀 ?띾뱷 嫄곕━ 異뺤냼 (10 -> 2.5): ?좎닔媛 怨듭뿉 "?우븘?? ?뚯쑀 ?몄젙
            if (nearest && minDst < 4.0) {
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = nearest;
                this.ball.intendedReceiver = null; // ?뚯쑀 ???섏떊 ?곹깭 ?댁젣
                this.ball.x = nearest.x; // 怨듭쓣 諛쒕컩?쇰줈
                this.ball.y = nearest.y;
            }
        }

        // 3. ?좎닔 AI ?됰룞 (?뚯쑀??vs 鍮꾩냼?좎옄)
        if (this.ball.state === BallState.CONTROLLED && this.ball.owner) {
            this.processBallCarrierAI(this.ball.owner);
        }
        // [?섏젙] 怨??뚯쑀 ?щ?? ?곴??놁씠 ?섎㉧吏 ?좎닔?ㅼ쓽 ?ㅽ봽?붾낵 ?吏곸엫? ??긽 ?ㅽ뻾
        this.processOffBallAI();

        // 4. ?섎퉬 ?쇱씤 議곗젙
        this.adjustDefensiveLines();

        return this.getSnapshot();
    }

    // [?좉퇋] ?붿쭊 ?대? 泥대젰 ?뚮え 濡쒖쭅
    consumeStamina() {
        const rates = { 'FW': 0.6, 'MF': 0.7, 'DF': 0.4, 'GK': 0.1 };
        this.players.forEach(p => {
            const rate = rates[p.position] || 0.5;
            // ?쒕뜡 蹂??짹20% ?곸슜?섏뿬 泥대젰 ?뚮え???ㅼ뼇??遺??
            p.stamina = Math.max(0, p.stamina - (rate * (0.8 + Math.random() * 0.4)));
        });
    }

    // [?좉퇋] ?꾩옱 ?곹깭 ?ㅻ깄??諛섑솚 ?ы띁 (以묐났 肄붾뱶 ?쒓굅)
    getSnapshot() {
        return {
            ball: { x: this.ball.x, y: this.ball.y, z: this.ball.z, state: this.ball.state },
            players: this.players.map(p => ({
                id: p.id, x: p.x, y: p.y, team: p.teamId, hasBall: (this.ball.owner === p)
            })),
            events: [...this.eventsQueue],
            isCelebration: this.celebrationTimer > 0 // [?좉퇋] ?몃젅癒몃땲 以묒씤吏 ?щ? ?꾨떖
        };
    }

    // ?윝 [AI] 怨?媛吏??좎닔 ?됰룞 ?곗꽑?쒖쐞
    processBallCarrierAI(player) {
        const isHome = player.teamId === 'home';
        const goalX = isHome ? 100 : 0; // [?섏젙] 媛濡?紐⑤뱶: ??>100, ?먯젙->0
        const distToGoal = Math.abs(player.x - goalX);
        const behavior = this.getRoleBehavior(player.role);
        const tacticProfile = this.getTacticProfile(player.teamId);
        
        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const isOnFlank = player.y < 25 || player.y > 75;
        const distFromCenterY = Math.abs(player.y - 50);
        const isBadWideShotAngle = isOnFlank && distFromCenterY > 24 && distToGoal > 7;

        const nearestOpp = this.findNearestDefender(player);
        const pressureDist = nearestOpp ? nearestOpp.dist : 999;
        const underPressure = pressureDist < 8; // 8m ?대궡???곸씠 ?덉쑝硫??뺣컯諛쏆쓬
        const moveDir = isHome ? 1 : -1;

        // [?좉퇋] ?곷? ?섎퉬????띾룄 寃쎌웳??怨꾩궛 (移섎떖/?뚰뙆 ?먮떒??
        const effectiveSpeed = this.getEffectiveStat(player, 'speed');
        const oppSpeed = nearestOpp ? this.getEffectiveStat(nearestOpp.player, 'speed') : 0;
        const canOutrun = effectiveSpeed > oppSpeed + 5; 

        if (player.position === 'GK') {
            this.processGoalkeeperAI(player, underPressure);
            return;
        }

        // [?좉퇋] ?덊똿 媛곷룄 遊됱뇙 ?щ? 怨꾩궛 (吏꾩쭨 寃쎄린 媛숈? ?먮떒??
        let isAngleBlocked = false;
        if (distToGoal < 35) {
            isAngleBlocked = this.players.some(opp => {
                if (opp.teamId === player.teamId) return false;
                const d = Math.hypot(opp.x - player.x, opp.y - player.y);
                if (d > 10) return false; // 10m ?댁긽 ?⑥뼱吏??섎퉬?섎뒗 媛곷룄瑜?紐?留됱쓬

                // ???꾩튂?먯꽌 怨⑤? 以묒븰(goalX, 50)?쇰줈 媛??踰≫꽣? ?섎퉬?섎줈 媛??踰≫꽣 ?ъ씠??媛곷룄 怨꾩궛
                const dot = (goalX - player.x) * (opp.x - player.x) + (50 - player.y) * (opp.y - player.y);
                const mag1 = Math.hypot(goalX - player.x, 50 - player.y);
                const mag2 = Math.hypot(opp.x - player.x, opp.y - player.y);
                const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
                
                return angle < 0.28; // ??16???대궡???섎퉬?섍? ?덉쑝硫?'媛곸씠 留됲삍??怨??먮떒
            });
        }

        if (isBadWideShotAngle && distToGoal < 35) {
            const centralOption = this.players
                .filter(p => p.teamId === player.teamId && p !== player && p.position !== 'GK')
                .filter(p => p.y > 28 && p.y < 72)
                .filter(p => isHome ? p.x > player.x - 4 : p.x < player.x + 4)
                .sort((a, b) => {
                    const aGoal = Math.abs(a.x - goalX);
                    const bGoal = Math.abs(b.x - goalX);
                    const aCenter = Math.abs(a.y - 50);
                    const bCenter = Math.abs(b.y - 50);
                    return (aGoal + aCenter * 0.35) - (bGoal + bCenter * 0.35);
                })[0];
            if (centralOption && Math.random() < 0.9) {
                this.executePass(player, centralOption);
                return;
            }
        }

        if ((behavior.hugLine || isOnFlank) && distToGoal < 36 && distToGoal > 5) {
            const crossTarget = this.players
                .filter(p => p.teamId === player.teamId && p !== player && p.position !== 'GK')
                .filter(p => (isHome ? p.x > 76 : p.x < 24) && p.y > 24 && p.y < 76)
                .sort((a, b) => {
                    const aRole = this.getRoleBehavior(a.role);
                    const bRole = this.getRoleBehavior(b.role);
                    const aScore = (a.position === 'FW' ? 80 : 35) + (aRole.runBehind ? 25 : 0) - Math.abs(a.y - 50);
                    const bScore = (b.position === 'FW' ? 80 : 35) + (bRole.runBehind ? 25 : 0) - Math.abs(b.y - 50);
                    return bScore - aScore;
                })[0];
            if (crossTarget && Math.random() < 0.46 + tacticProfile.directness * 0.18) {
                this.executeCross(player, crossTarget);
                return;
            }
        }

        let shootThreshold = 30;
        if (isAI) shootThreshold = 32;

        if (isAngleBlocked && distToGoal > 12 && Math.random() < 0.8) {
            shootThreshold = 0; // ???깆뿉?쒕뒗 ?쏆쓣 ????
        }
        if (isBadWideShotAngle) {
            shootThreshold = Math.min(shootThreshold, 10);
        }

        if (distToGoal < shootThreshold) { 
            let shootChance = 0.15; 
            if (distToGoal < 20) shootChance = 0.7;
            if (distToGoal < 12) shootChance = 0.95;
            if (isAI) shootChance += 0.05;
            if (isBadWideShotAngle) shootChance *= 0.12;
            if (behavior.hugLine && isOnFlank && distFromCenterY > 28) shootChance *= 0.15;
            if (Math.random() < shootChance) {
                this.attemptShoot(player, goalX);
                return;
            }
        }

        let passProb = 0.5; // 湲곕낯媛?

        const isBlocked = this.checkFrontalBlock(player, goalX);

        if (isBlocked) {
            passProb = underPressure ? 0.75 : 0.05;
        } else {
            if (player.position === 'DF' || player.position === 'GK') {
                passProb = underPressure ? 0.98 : 0.4; 
            } else {
                passProb = 0.08;
                if (isAngleBlocked) {
                    passProb = 0.85; 
                }
                // [?섏젙] ?숈뼱???щ줈???먮떒: 諛뺤뒪 ?덉쓽 紐⑤뱺 ?꾧뎔(FW, MF)????곸쑝濡?踰붿쐞瑜??볧? ?먯깋
                if (behavior.hugLine && isOnFlank && distToGoal < 38) {
                    const targetInBox = this.players.find(p => 
                        p.teamId === player.teamId && p !== player &&
                        (isHome ? p.x > 68 : p.x < 32) && Math.abs(p.y - 50) < 28
                    );
                    if (targetInBox && Math.random() < 0.62) {
                        this.ball.lastOwner = player; // ?댁떆?ㅽ듃 湲곕줉???꾪빐 ?뚯쑀?????
                        if (Math.random() < 0.55) this.executeCross(player, targetInBox);
                        else this.executePass(player, targetInBox);
                        return;
                    }
                }
                if (behavior.hugLine && isOnFlank && distToGoal > 25) {
                    passProb = isAngleBlocked ? 0.80 : 0.58; 
                }
                if (typeof gameData !== 'undefined' && gameData.currentTactic === 'tikitaka') {
                    passProb = 0.25;
                }
                if (isAI && !isBlocked) {
                    passProb = Math.max(0.05, passProb - 0.15); 
                }
            }
        }

        // [?좉퇋] 二쇰???移⑦닾 以묒씤 ?숇즺媛 ?덈뒗吏 ?뺤씤 (?ㅻ（?⑥뒪 湲고쉶 ?ъ갑)
        // ?쇰컲?곸씤 ?먮떒(?쒕━釉?怨듦컙 ??蹂대떎 移⑦닾?섎뒗 ?숇즺瑜?諛쒓껄?덉쓣 ?뚯쓽 ?⑥뒪 ?섏?媛 ??媛뺣젰??
        const runner = this.players.find(p => p.teamId === player.teamId && p.burstTimer > 10);
        if (runner && distToGoal > 30) {
            passProb = Math.max(passProb, 0.72 + tacticProfile.directness * 0.18);
        }
        passProb = Math.max(0.05, Math.min(0.96, passProb * (0.86 + tacticProfile.directness * 0.22)));

        let bestPassTarget = null;
        if (player.position === 'GK') {
            if (Math.random() < 0.5) { // GK??媛湲됱쟻 硫由?蹂대궡?꾨줉 議곗젙
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

        // 3. ?쒕━釉?(?꾩쭊)
        // [?좉퇋] ?섎퉬?섍? ?욎뿉 ?덉쑝硫??뚰뙆 ?쒕룄 or 類뤾?
        const nearestDef = this.findNearestDefender(player);
        if (nearestDef && nearestDef.dist < 7) { // 媛먯? 嫄곕━ ?뺣? (5m -> 7m)
            // ?섎퉬?섍? 媛源뚯씠 遺숈뿀???뚯쓽 泥섎━
            // 媛쒖씤湲?濡쒖쭅 ?쒓굅: 遺?먯뿰?ㅻ윭???붾뱾由?諛⑹?
            
            if (Math.random() < 0.4) { // 40% ?뺣쪧濡??쒗겢 ?뱁븿
                this.attemptTackle(nearestDef.player, player);
                return;
            }
        }

        // [?섏젙] ?ㅽ뵾???ㅽ꺈 諛섏쁺 (湲곕낯 ?띾룄 + ?ㅽ뵾???ㅽ꺈 蹂댁젙)
        // [泥대젰 諛섏쁺] 泥대젰???⑥뼱吏??띾룄濡?怨꾩궛
        // effectiveSpeed???꾩뿉???대? ?좎뼵??(SyntaxError ?닿껐)
        const speedFactor = effectiveSpeed / 75; // ?됯퇏 75 湲곗?
        let moveSpeed = 1.0 * Math.max(0.7, Math.min(1.4, speedFactor)) * tacticProfile.tempo; 
        
        // [?섏젙] ?섎퉬?섎뒗 ?쒕━釉?嫄곕━ 吏㏐쾶 (?덉쟾 ?쒖씪)
        let moveDist = (0.8 + Math.random() * 0.8) * speedFactor * tacticProfile.tempo; // [諛몃윴?? ?쒕━釉?蹂댄룺 異뺤냼 (2.0 -> 0.8)
        if (player.position === 'DF') moveDist = (0.5 + Math.random() * 0.5); 

        // [?좉퇋] 痢〓㈃ ?뚰뙆 媛?띾룄: ?숈뼱/?諛깆씠 痢〓㈃?먯꽌 移섍퀬 ?섍컝 ??蹂댄룺 ????곹뼢
        if (behavior.hugLine && isOnFlank) {
            moveDist *= 1.8; 
            moveSpeed = 1.6;
        } else {
            // [AI 踰꾪봽] AI 怨듦꺽吏꾩? ?쒕━釉???????컻?곸쑝濡??꾩쭊
            if (isAI && (player.position === 'FW' || player.position === 'MF')) {
                moveDist *= 1.1; 
            }

            // [?좉퇋] 怨듦컙???대젮?덉뼱???쒕━釉붿쓣 ?좏깮??寃쎌슦(passProb媛 ??쓬), 怨쇨컧?섍쾶 移섍퀬 ?щ┝
            if (passProb <= 0.1 && (player.position === 'FW' || player.position === 'MF')) {
                moveDist += 0.25; // [?섏젙] ?꾨젰 吏덉＜ 異붽? 蹂댄룺 ?섑뼢 (1.0 -> 0.25)
                moveSpeed = 0.55;
            }
        }

        if (behavior.hugLine && isOnFlank) {
            // [?좉퇋] 痢〓㈃ ?뚰뙆 ?꾩슜 ?吏곸엫: ?섎퉬媛 ?덉뼱???쇱씤???怨??띾룄濡??쒖튂湲?
            const forceDir = isBlocked ? 0.7 : 1.0;
            player.x += moveDir * moveDist * forceDir;
            
            // ?곗튂?쇱씤(Y=4 or Y=96)??諛李⑺븯???섎퉬?섍? 媛곷룄瑜?醫곹엳湲??대졄寃???
            const touchlineY = player.y < 50 ? 4 : 96;
            player.y += (touchlineY - player.y) * 0.25;
        } else if (isBlocked && !underPressure) {
            // [?좉퇋] ?욎씠 留됲삍吏留??뺣컯???놁쑝硫??〓뱶由щ툝 (怨듦컙 李쎌텧)
            player.x += moveDir * (Math.random() * 0.8); // 2 -> 0.8
            player.y += (Math.random() < 0.5 ? 6.5 : -6.5) + (Math.random() * 2.0);
        } else {
            // 湲곕낯 ?꾩쭊 ?쒕━釉?
            player.x += moveDir * moveDist; 
            player.y += (Math.random() - 0.5) * 4; // [?섏젙] 臾댁옉???붾뱾由????異뺤냼 (18 -> 4)
        }

        // ?쒕━釉붿쓣 ?덉쑝誘濡??댁떆?ㅽ듃 泥댁씤 珥덇린??
        this.ball.lastOwner = null;
        
        // 寃쎄린??諛뽰쑝濡??섍?吏 ?딄쾶
        player.x = Math.max(5, Math.min(95, player.x));
        player.y = Math.max(2, Math.min(98, player.y));

        // 怨듬룄 媛숈씠 ?대룞
        this.ball.x = player.x;
        this.ball.y = player.y;
        
        // ?쒕━釉??대깽??(?띿뒪?몄슜)
        if (Math.random() < 0.2) {
            this.eventsQueue.push({ type: 'dribble', player: player.name });
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

    processGoalkeeperAI(gk, underPressure) {
        this.keepGoalkeeperHome(gk);

        const safeTarget = this.findBestPassTarget(gk, 'safe');
        const aggressiveTarget = this.findBestPassTarget(gk, 'aggressive');
        const target = underPressure
            ? (safeTarget || aggressiveTarget)
            : ((safeTarget && Math.random() < 0.75) ? safeTarget : (aggressiveTarget || safeTarget));

        if (target && (underPressure || Math.random() < 0.72)) {
            this.executePass(gk, target);
            return;
        }

        if (underPressure && !target) {
            this.clearBall(gk);
            return;
        }

        if (Math.random() < 0.08) {
            this.eventsQueue.push({ type: 'hold', player: gk.name, desc: `${gk.name}, 공을 안정적으로 소유합니다.` });
        }
    }

    // ?윞 [怨듦컙 怨꾩궛] ?⑥뒪 ????좎젙 ?뚭퀬由ъ쬁
    findBestPassTarget(player, mode = 'aggressive') { // mode: 'aggressive'(?꾩쭊) or 'safe'(?먯쑀)
        const teamates = this.players.filter(p => p.teamId === player.teamId && p !== player);
        let bestTarget = null;
        // [?섏젙] ?꾩쭊 ?⑥뒪 ?쒕룄 臾명꽦 ??땄 (10 -> 0): 議곌툑?대씪???꾩쭊 媛?ν븯硫?李뚮쫫
        let maxScore = -Infinity;

        // [?좉퇋] AI ?щ? ?뺤씤
        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const isHome = player.teamId === 'home';
        const forwardX = isHome ? 100 : 0; // [?섏젙] 怨듦꺽 諛⑺뼢 X醫뚰몴
        const passerOnFlank = player.y < 25 || player.y > 75;
        const passerIsWide = passerOnFlank || this.getRoleBehavior(player.role).hugLine;

        // [?좉퇋] ?꾩옱 援ъ뿭??諛吏묐룄 怨꾩궛 (諛섎? ?꾪솚 ?먮떒??
        const nearbyOppsCount = this.players.filter(p => 
            p.teamId !== player.teamId && 
            Math.hypot(p.x - player.x, p.y - player.y) < 15
        ).length;

        teamates.forEach(tm => {
            // 1. ?꾩쭊 ?먯닔 (怨듦꺽 諛⑺뼢??媛源뚯슱?섎줉 ?믪쓬)
            const distBefore = Math.abs(player.x - forwardX);
            const distAfter = Math.abs(tm.x - forwardX);
            let forwardScore = (distBefore - distAfter); 
            const isCentralProgression = tm.y > 28 && tm.y < 72 && distAfter <= distBefore + 4;
            const isCentralBoxThreat = isCentralProgression && (isHome ? tm.x > 68 : tm.x < 32);
            const tmBehavior = this.getRoleBehavior(tm.role);
            const targetIsWide = tm.y < 25 || tm.y > 75 || tmBehavior.hugLine;
            const isWideToWide = passerIsWide && targetIsWide && Math.abs(player.y - tm.y) > 30;
            const isCentralForward = tm.position === 'FW' && !tmBehavior.hugLine && tm.y > 24 && tm.y < 76;

            // [?좉퇋] 移⑦닾 ??대컢 蹂대꼫?? burstTimer媛 ?쒖꽦?붾맂 ?좎닔?먭쾶 ?⑥뒪 ?뺣쪧 洹밸???
            if (tm.burstTimer > 0) {
                forwardScore += 240; // [踰꾪봽] ?ㅻ（?⑥뒪 理쒖슦???쒖쐞 媛뺥솕 (120 -> 150)
            }
            if (player.position === 'MF' && tm.position === 'FW' && tm.burstTimer > 0) {
                forwardScore += 220;
            }

            // [?좉퇋] 移⑦닾 以묒씤 ?좎닔?먭쾶 ?ㅻ（?⑥뒪 媛?곗젏 (鍮뚮뱶???꾩꽦??
            const isPenetrating = tm.position === 'FW' && (isHome ? tm.vx > 0.1 : tm.vx < -0.1);
            if (isPenetrating) forwardScore += 80;

            // [?좉퇋] 諛섎? ?꾪솚 蹂대꼫??(?뺣컯???ы븷 ??諛섎????볦? 怨듦컙?쇰줈 ?⑥뒪)
            let switchBonus = 0;
            // [?섏젙] 諛섎? ?꾪솚 議곌굔 ?꾪솕 (?쒖썝???꾧컻 ?좊룄)
            if (nearbyOppsCount >= 1 && Math.abs(player.y - tm.y) > 35) {
                switchBonus = 40; // ?쒓컖?곸쑝濡??쒖썝??濡깊뙣???좊룄
            }
            if (passerOnFlank && isCentralProgression) switchBonus += isCentralBoxThreat ? 220 : 140;
            if (isWideToWide) switchBonus -= 420;
            
            // ?덉쟾 紐⑤뱶(鍮뚮뱶???먯꽌???꾩쭊 媛以묒튂瑜???떠????諛깊뙣?ㅻ룄 ?먯닔瑜?諛쏄쾶 ??
            if (mode === 'safe') {
                forwardScore *= 0.5;
            } else {
                forwardScore *= 8.0; // [踰꾪봽] ?꾩쭊 媛以묒튂 異붽? ?곹뼢 (6.0 -> 8.0)
                // [?섏젙] 諛깊뙣??怨⑤?? 硫?댁????⑥뒪)??????섎꼸??媛뺥솕
                if (distAfter > distBefore) forwardScore -= 40; // [?섏젙] 諛깊뙣???섎꼸?????媛뺥솕 (15 -> 40)
                
                // [AI 踰꾪봽] AI???꾩쭊 ?⑥뒪?????믪? 媛?곗젏??以?(怨듦꺽???댁쁺)
                if (isAI && forwardScore > 0) {
                    forwardScore *= 1.5; // [?섏젙] AI ?꾩쭊 怨듦꺽??蹂듦뎄
                }
            }

            // 2. 嫄곕━ ?먯닔 (?덈Т 硫嫄곕굹 ?덈Т 媛源뚯슦硫?媛먯젏)
            const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
            let distScore = 0;
            if (dist < 10) distScore = -50; // ?덈Т 媛源뚯?
            else if (dist > 25) distScore = -(dist - 25) * 2.0; // [?섏젙] 25m ?댁긽?대㈃ ?먯닔 ???媛먯젏 (吏㏃? ?⑥뒪 ?좏샇)
            else distScore = 40; // [踰꾪봽] ?꾩쭊 ?⑥뒪 蹂댁긽 利앷? (30 -> 40)
            if (passerOnFlank && isCentralProgression && dist < 36) distScore += 95;
            if (isWideToWide && dist > 22) distScore -= 260;

            // [?좉퇋] 濡깊뙣??20m ?댁긽)?대㈃??諛깊뙣?ㅼ씤 寃쎌슦 ?먯닔 ?????컧 (?붿껌 諛섏쁺)
            // distAfter(諛쏅뒗?щ엺 怨④굅由? > distBefore(??怨④굅由? => 怨⑤??먯꽌 硫?댁쭚 (諛깊뙣??
            if (dist > 20 && distAfter > distBefore) {
                distScore -= 200; // [?섏젙] ?꾨갑 濡깊뙣??媛뺣젰 湲덉?
            }

            // [?좉퇋] ?섎퉬??-> 怨듦꺽???ㅼ씠?됲듃 濡깊뙣???듭젣 (鍮뚮뱶???λ젮)
            if (player.position === 'DF' && tm.position === 'FW' && dist > 35) {
                distScore -= 40; // 六μ텞援?諛⑹? (誘몃뱶?꾨뜑 嫄곗퀜媛?꾨줉 ?좊룄)
            }

            // [?좉퇋] 理쒖쟾諛?怨듦꺽?섏쓽 理쒗썑諛?諛깊뙣??媛뺣젰 ?듭젣 (寃쎄린 猷⑥쫰??諛⑹?)
            if (player.position === 'FW' && distAfter > distBefore) {
                if (tm.position === 'GK') {
                    distScore -= 500; // GK?먭쾶 諛깊뙣??湲덉?
                } else if (tm.position === 'DF' && dist > 15) {
                    distScore -= 150; // ?섎퉬?섏뿉寃?15m ?댁긽 諛깊뙣??湲덉?
                }
            }

            // 3. ?뺣컯 ?먯닔 (二쇰????곸씠 ?놁뼱????
            let pressureScore = 0;
            this.players.forEach(opp => {
                if (opp.teamId !== player.teamId) {
                    const d = Math.hypot(tm.x - opp.x, tm.y - opp.y);
                    if (d < 15) pressureScore -= (15 - d) * 3; // ?곸씠 媛源뚯슦硫?媛먯젏
                }
            });
            
            // ?덉쟾 紐⑤뱶?먯꽌???뺣컯 ?뚰뵾媛 理쒖슦??(類뤾린硫??덈맖)
            if (mode === 'safe') pressureScore *= 2.0;

            // [?좉퇋] 4. ?⑥뒪 猷⑦봽 諛⑹? (吏곸쟾 ?⑥뒪?댁? ?щ엺?먭쾶 ?ㅼ떆 二쇰뒗 寃?媛먯젏)
            let loopPenalty = 0;
            if (this.ball.lastOwner === tm) {
                // 怨듦꺽 紐⑤뱶?????꾩쭊?댁빞 ?섎?濡?由ы꽩 ?⑥뒪 ???媛먯젏 (-60)
                // ?덉쟾 紐⑤뱶????以?怨??놁쑝硫?由ы꽩 以??섎룄 ?덉쑝???뚰룺 媛먯젏 (-20)
                loopPenalty = mode === 'aggressive' ? 60 : 20;
            }
            if (isWideToWide) loopPenalty += 260;

            // [?좉퇋] 5. 鍮뚮뱶??蹂대꼫??(DF -> MF ?곌껐 ?λ젮)
            let positionBonus = 0;
            if (player.position === 'DF') {
                if (tm.position === 'MF') positionBonus = 5; // 誘몃뱶?꾨뜑?먭쾶 二쇰뒗 ?꾩쭊 ?⑥뒪 (媛???좏샇)
                else if (tm.position === 'DF') positionBonus = 3; // [?섏젙] 媛숈? ?섎퉬??CB?봃B) 媛??곌껐???λ젮
            }
            if (player.position === 'GK' && tm.position === 'DF') positionBonus = 5;
            if (passerOnFlank && tm.position === 'FW' && isCentralProgression) positionBonus += 120;
            if (passerOnFlank && tm.position === 'MF' && isCentralProgression) positionBonus += 70;
            if (isCentralForward) positionBonus += isCentralBoxThreat ? 260 : 150;
            if (player.position !== 'GK' && tm.position === 'FW' && isCentralForward) positionBonus += 90;
            if (player.position === 'MF' && tm.position === 'FW' && isCentralForward) positionBonus += 180;
            if (tm.position === 'MF' && (isHome ? tm.x > 78 : tm.x < 22)) positionBonus -= 180;

            const totalScore = forwardScore + distScore + pressureScore - loopPenalty + positionBonus + switchBonus;
            
            if (totalScore > maxScore) {
                maxScore = totalScore;
                bestTarget = tm;
            }
        });

        return bestTarget;
    }

    // [?좉퇋] 怨?嫄룹뼱?닿린 (Clearance) - GK???섎퉬?섍? ?꾧툒?????ъ슜
    clearBall(player) {
        const isHome = player.teamId === 'home';
        const forwardDir = isHome ? 1 : -1;
        
        // 以묒븰??50) 遺洹? 醫뚯슦 ?쒕뜡?섍쾶 嫄룹뼱??
        const targetX = 50 + (forwardDir * (Math.random() * 10)); 
        const targetY = 20 + Math.random() * 60; // ?곗튂?쇱씤 諛뽰쑝濡??섍?吏 ?딄쾶 ?덉そ?쇰줈
        
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null;
        this.ball.lastOwner = player; // [?섏젙] 嫄룹뼱?닿린 ?쒖뿉??留덉?留??뚯쑀??湲곕줉 (?꾧뎔 ?명꽣?됲듃 諛⑹???
        this.ball.targetPos = { x: targetX, y: targetY };
        this.eventsQueue.push({ type: 'pass', from: player.name, to: '걷어내기', desc: `${player.name}, 위험 지역을 벗어나게 걷어냅니다.` });
    }

    executePass(from, to) {
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.lastOwner = from; // [?좉퇋] ?⑥뒪???щ엺 湲곗뼲 (?ㅼ쓬 ?댁뿉 ???щ엺?쒗뀒 諛붾줈 ??二쇨쾶 ??
        this.ball.intendedReceiver = to; // [?좉퇋] ?섏떊 ?덉젙???깅줉
        this.ball.owner = null;
        
        // [?좉퇋] ?⑥뒪 ?깃났瑜?怨꾩궛 濡쒖쭅
        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        let accuracy = from.stats.passing;

        // [?좉퇋] ?ㅻ（?⑥뒪 ?뺥솗??蹂댁젙: 移⑦닾 以묒씤 ?좎닔?먭쾶?????뺥솗?섍쾶 以?(?곌퀎 ?뚮젅??蹂댁긽)
        if (to.burstTimer > 0) {
            accuracy += 30; // [?섏젙] 蹂대꼫??媛뺥솕 (15 -> 30)
        }

        // [?좉퇋] ?ㅻ（?⑥뒪 ?щ? ?먮떒 (?꾨갑?쇰줈 湲멸쾶 李뚮Ⅴ???⑥뒪)
        const forwardX = from.teamId === 'home' ? 100 : 0;
        const distToGoalFrom = Math.abs(from.x - forwardX);
        const distToGoalTo = Math.abs(to.x - forwardX);
        const isThroughPass = (distToGoalFrom - distToGoalTo > 5) && dist > 10 && distToGoalFrom < 60; // 5m ?댁긽 ?꾩쭊, 10m ?댁긽 嫄곕━, ?곷? 吏꾩쁺
        
        // 嫄곕━ ?섎꼸?? 20m源뚯???愿쒖갖怨? 洹??댄썑 1m???뺥솗??媛먯냼
        const distPenalty = Math.max(0, (dist - 20) * 0.8);
        let successChance = accuracy - distPenalty;
        
        // 怨⑦궎??濡깊궏? ?쒕뜡??異붽? (媛???묒궗由?
        if (from.position === 'GK' && dist > 50) successChance -= 15;

        // [?좉퇋] ?ㅻ（?⑥뒪 蹂댁젙 (?ㅻ쾭濡??곹뼢??媛뺥솕)
        let eventType = 'pass';
        let eventDesc = `${from.name}, ${to.name}에게 연결합니다.`;

        if (isThroughPass) {
            eventType = 'throughpass';
            // [?섏젙] ?ㅻ（?⑥뒪 ?쒖씠???섎꼸???쒓굅 (-20 -> 0)
            // ?ㅻ쾭濡?Passing ?ㅽ꺈)???곕Ⅸ 蹂대꼫?? 75 ?댁긽遺???깃났瑜?湲됱긽??
            if (accuracy > 75) {
                successChance += (accuracy - 75) * 1.5; 
            }
            eventDesc = `${from.name}, ${to.name}에게 스루패스를 찔러 넣습니다!`;
        }

        // 二쇱궗??援대━湲?(?깃났 ?뺣쪧 0~100)
        const roll = Math.random() * 100;
        const isBadPass = roll > successChance;

        if (isBadPass) {
            // [?ㅽ뙣] 紐⑺몴 吏?먯뿉??鍮쀫굹媛?(嫄곕━ 鍮꾨? ?ㅼ감)
            const errorMargin = dist * 0.25; // 嫄곕━??25%留뚰겮 鍮쀫굹媛????덉쓬
            const angle = Math.random() * Math.PI * 2;
            const errorDist = Math.random() * errorMargin + 5; // 理쒖냼 5m ?댁긽 鍮쀫굹媛?
            
            // ?됰슧??怨녹쑝濡?怨듭씠 ?좎븘媛?-> ?곷?媛 ?↔굅??猷⑥쫰蹂?寃쏀빀
            const targetX = Math.max(2, Math.min(98, to.x + Math.cos(angle) * errorDist));
            const targetY = Math.max(2, Math.min(98, to.y + Math.sin(angle) * errorDist));
            
            this.ball.targetPos = { x: targetX, y: targetY };
            const failDesc = isThroughPass ? `${from.name}의 스루패스가 차단됩니다.` : `${from.name}, 패스가 빗나갑니다.`;
            this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: failDesc });
        } else {
            // [?깃났] ?뺥솗?섍쾶 諛곕떖
            this.ball.targetPos = { x: to.x, y: to.y };
            this.eventsQueue.push({ type: eventType, from: from.name, to: to.name, desc: eventDesc });
        }
    }

    executeCross(from, to) {
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.lastOwner = from;
        this.ball.intendedReceiver = to;
        this.ball.owner = null;

        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        const accuracy = this.getEffectiveStat(from, 'passing') + ((from.role === 'W' || from.role === 'WB' || from.role === 'CWB') ? 12 : 0);
        const targetBonus = to.position === 'FW' ? 12 : 0;
        const successChance = accuracy + targetBonus - Math.max(0, (dist - 24) * 0.9);

        if (Math.random() * 100 > successChance) {
            const missY = Math.max(8, Math.min(92, to.y + (Math.random() - 0.5) * 28));
            const missX = Math.max(2, Math.min(98, to.x + (from.teamId === 'home' ? -6 : 6)));
            this.ball.targetPos = { x: missX, y: missY };
            this.eventsQueue.push({ type: 'cross', from: from.name, to: to.name, desc: `${from.name}의 크로스가 부정확합니다.` });
        } else {
            this.ball.targetPos = { x: to.x, y: to.y };
            this.eventsQueue.push({ type: 'cross', from: from.name, to: to.name, desc: `${from.name}, ${to.name}을 향해 크로스를 올립니다!` });
        }
    }

    // ?뵷 [李ъ뒪 ?뚯씠?꾨씪?? ???쒕룄
    attemptShoot(shooter, goalX) {
        // [?섏젙] ?곷? GK 李얘린 諛??λ젰移?諛섏쁺
        const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
        const gk = this.players.find(p => p.teamId === opponentTeamId && p.position === 'GK');
        const gkRating = gk ? gk.stats.defense : 60; // GK媛 ?놁쑝硫?60?쇰줈 媛??

        // 嫄곕━ 蹂댁젙 (怨⑤?? 媛源뚯슱?섎줉 ?좊━)
        const dist = Math.abs(shooter.x - goalX);
        const distFactor = Math.max(0.7, 1.3 - (dist / 40)); // 媛源뚯슦硫?1.3諛? 硫硫?0.7諛?

        // [?좉퇋] ?덊똿 媛곷룄 蹂댁젙 (鍮꾪쁽?ㅼ쟻 媛곷룄 ??諛⑹?)
        const distY = Math.abs(shooter.y - 50); // 怨⑤? 以묒떖(50)?쇰줈遺?곗쓽 Y異?嫄곕━
        let angleFactor = 1.0;
        
        // 怨⑤? ????10)??踰쀬뼱??寃쎌슦 媛곷룄 怨꾩궛
        if (distY > 8) {
            // 怨⑤?? 媛源뚯슱?섎줉(dist媛 ?묒쓣?섎줉), 痢〓㈃?쇱닔濡?distY媛 ?댁닔濡? 媛곷룄媛 醫곸븘吏?
            // atan2(y, x) -> ?쇰뵒??媛?諛섑솚 (0 ~ PI/2)
            const angle = Math.atan2(distY, Math.max(1, dist)); 
            
            // 媛곷룄媛 ?댁닔濡?痢〓㈃?쇱닔濡? ?섎꼸??遺??
            if (angle > 1.2) angleFactor = 0.15; // ??68???댁긽 (?ш컖吏?) -> 15% ?뚯썙
            else if (angle > 0.9) angleFactor = 0.4; // ??51???댁긽 -> 40% ?뚯썙
            else if (angle > 0.6) angleFactor = 0.7; // ??34???댁긽 -> 70% ?뚯썙
            else angleFactor = 0.9;
        }

        // ?덊똿 ?뚯썙: ?λ젰移?80~120% 蹂?? * 嫄곕━蹂댁젙 * 媛곷룄蹂댁젙
        // [泥대젰 諛섏쁺] ?덊똿 ?뚯썙??泥대젰 諛섏쁺
        const effectiveShooting = this.getEffectiveStat(shooter, 'shooting');
        const shotPower = effectiveShooting * (0.8 + Math.random() * 0.4) * distFactor * angleFactor;
        // [?섏젙] ?좊갑 ?뚯썙 ?ъ“??(GK 踰꾪봽): 0.7 -> 0.8 怨꾩닔 ?곹뼢 諛?湲곕낯媛?+5 異붽?
        const savePower = gkRating * (0.8 + Math.random() * 0.5) + 5; 

        // [諛몃윴???섏젙] 怨?寃곗젙 濡쒖쭅 蹂寃?(?뺣쪧 湲곕컲)
        // 湲곗〈: isGoal = shotPower > savePower; (?덈Т 洹밸떒??
        // 蹂寃? ?ㅽ꺈 李⑥씠???곕씪 ?뺣쪧??怨꾩궛?섏뿬, ?댁쓽 ?붿냼瑜?異붽??섍퀬 洹밸떒?곸씤 寃곌낵瑜??꾪솕
        const powerDiff = shotPower - savePower;
        
        // [諛몃윴?? ?앹젏瑜?異붽? ?섑뼢: 湲곕낯 ?뺣쪧 12%, ?ㅽ꺈 諛섏쁺瑜?0.25%濡?議곗젙 (?ㅻ뱷??諛⑹?)
        let goalChance = 0.22 + (powerDiff * 0.004);
        
        // [諛몃윴?? 理쒖냼/理쒕? ?뺣쪧 異붽? 議곗젙 (理쒖냼 1%, 理쒕? 55%)
        goalChance = Math.max(0.03, Math.min(0.68, goalChance));

        let isGoal = Math.random() < goalChance;
        
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null;
        this.ball.targetPos = { x: goalX, y: 45 + Math.random() * 10 }; // [?섏젙] 怨⑤Ц 援ъ꽍???몃━?꾨줉 Y醫뚰몴 遺꾩궛 (45~55)

        // [?섏젙] 利됱떆 寃곌낵瑜?泥섎━?섏? ?딄퀬 ?덉빟 (怨듭씠 ?좎븘媛???쒓컙???뺣낫)
        this.pendingShot = {
            isGoal: isGoal,
            shooter: shooter,
            goalX: goalX
        };
        // 李멸퀬: ?ш린??諛붾줈 'goal' ?대깽?몃? 蹂대궡吏 ?딆쓬
    }

    // [?좉퇋] 怨듭씠 怨⑤????꾩갑?덉쓣 ??寃곌낵 泥섎━
    handleShotResult() {
        const { isGoal, shooter, goalX } = this.pendingShot;
        this.pendingShot = null;

        if (isGoal) {
            // [?좉퇋] ?ㅼ퐫???낅뜲?댄듃 諛??몃젅癒몃땲 ???寃곗젙
            if (shooter.teamId === 'home') this.homeScore++;
            else this.awayScore++;

            this.ball.intendedReceiver = null;
            const isHome = shooter.teamId === 'home';
            const myScore = isHome ? this.homeScore : this.awayScore;
            const oppScore = isHome ? this.awayScore : this.homeScore;
            
            // [?좉퇋] ?댁떆?ㅽ듃 湲곕줉 濡쒖쭅
            let assister = null;
            // 吏곸쟾 ?뚯쑀?먭? ?덇퀬, ?앹젏?먯? 媛숈? ??대ŉ, ?ㅻⅨ ?좎닔??寃쎌슦 ?댁떆?ㅽ듃濡??몄젙
            if (this.ball.lastOwner && this.ball.lastOwner.teamId === shooter.teamId && this.ball.lastOwner.name !== shooter.name) {
                assister = this.ball.lastOwner.name;
            }
            
            // 吏怨??덉쑝硫?鍮⑤━ 蹂듦?(Quick Restart), ?꾨땲硫??몃젅癒몃땲
            this.celebrationType = (myScore < oppScore) ? 'quick_restart' : 'celebrate';
            this.celebrationActor = shooter;
            
            // 紐⑺몴 吏???ㅼ젙
            if (this.celebrationType === 'quick_restart') {
                this.celebrationTarget = { x: 50, y: 50 }; // ?쇳꽣 ?쒗겢
            } else {
                // 肄붾꼫 ?뚮옒洹?履?(怨??ｌ? 吏꾩쁺??媛源뚯슫 肄붾꼫)
                const goalX = isHome ? 100 : 0;
                const cornerY = (shooter.y < 50) ? 0 : 100; 
                this.celebrationTarget = { x: goalX, y: cornerY };
            }

            this.eventsQueue.push({ type: 'goal', scorer: shooter.name, team: shooter.teamId, assister: assister });
            this.lastScorerTeam = shooter.teamId;
            this.celebrationTimer = 40; // [?섏젙] ?몃젅癒몃땲 ?쒓컙 ?뺣? (??2.4珥? - ?대룞 蹂댁뿬二쇨린 ?꾪빐
            this.ball.state = BallState.DEAD;

            // 怨⑥씠 ?ㅼ뼱媛붿쑝誘濡??댁떆?ㅽ듃 泥댁씤 珥덇린??
            this.ball.lastOwner = null;
        } else {
            this.ball.intendedReceiver = null;
            // [?섏젙] ?덊똿 ?ㅽ뙣 ???ㅼ뼇???곹솴 ?곗텧 (?섎퉬 釉붾줉, ?移? 罹먯묶)
            const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
            const isHomeAttacking = shooter.teamId === 'home';

            // 1. ?섎퉬 釉붾줉 泥댄겕 (?덊꽣 洹쇱쿂???섎퉬?섍? ?덈뒗吏)
            const defenders = this.players.filter(p => 
                p.teamId === opponentTeamId && p.position !== 'GK' &&
                Math.abs(p.x - shooter.x) < 15 && Math.abs(p.y - shooter.y) < 5
            );
            
            // ?덊꽣蹂대떎 怨⑤? 履쎌뿉 ?덈뒗 ?섎퉬???꾪꽣留?
            const blockingDefenders = defenders.filter(p => isHomeAttacking ? (p.x > shooter.x) : (p.x < shooter.x));

            if (blockingDefenders.length > 0 && Math.random() < 0.35) { // 35% ?뺣쪧濡??섎퉬 釉붾줉
                const blocker = blockingDefenders[0];
                this.eventsQueue.push({ type: 'block', shooter: shooter.name, blocker: blocker.name, desc: `${blocker.name}, 몸을 던져 슈팅을 막아냅니다!` });
                
                // ?뺢꺼?섏삩 怨?(猷⑥쫰蹂?
                this.ball.state = BallState.LOOSE;
                this.ball.owner = null;
                this.ball.x = blocker.x + (isHomeAttacking ? -5 : 5); // ?뺢꺼 ?섏샂
                this.ball.y = blocker.y + (Math.random() - 0.5) * 15;
                return;
            }

            // 2. GK ?좊갑 泥섎━ (罹먯묶 vs ?移?
            const enemyGk = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');
            if (enemyGk) {
                if (Math.random() < 0.5) { // 50% ?뺣쪧濡??移?(猷⑥쫰蹂?
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: enemyGk.name, desc: `${enemyGk.name}, 슈팅을 쳐냅니다!` });
                    this.ball.state = BallState.LOOSE;
                    this.ball.owner = null;
                    this.ball.x = enemyGk.x + (isHomeAttacking ? -10 : 10);
                    this.ball.y = enemyGk.y + (Math.random() - 0.5) * 30;
                } else { // 50% ?뺣쪧濡?罹먯묶 (?뚯쑀沅??띾뱷)
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: enemyGk.name, desc: `${enemyGk.name}, 안정적으로 공을 잡아냅니다.` });
                    this.ball.state = BallState.CONTROLLED;
                    this.ball.owner = enemyGk;
                    this.ball.x = enemyGk.x;
                    this.ball.y = enemyGk.y;
                }
            } else {
                // GK媛 ?놁쑝硫?怨⑤? ??猷⑥쫰蹂?
                this.eventsQueue.push({ type: 'miss', shooter: shooter.name, desc: `${shooter.name}의 슈팅이 골문을 벗어납니다.` });
                this.ball.state = BallState.LOOSE;
                this.ball.x = goalX === 0 ? 5 : 95;
                this.ball.y = 50;
            }
        }
    }

    // [?좉퇋] ?몃젅癒몃땲 ?吏곸엫 泥섎━
    processCelebrationMovement() {
        if (!this.celebrationActor || !this.celebrationTarget) return;

        const p = this.celebrationActor;
        const target = this.celebrationTarget;
        
        // 1. ?앹젏???대룞
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 1) {
            const speed = 1.2; // 鍮좊Ⅴ寃??대룞
            p.x += (dx / dist) * speed;
            p.y += (dy / dist) * speed;
        }

        // 2. 怨??대룞 (吏怨??덉쓣 ?뚮쭔 怨듭쓣 ?ㅺ퀬 ?)
        if (this.celebrationType === 'quick_restart') {
            this.ball.x = p.x;
            this.ball.y = p.y;
        }

        // 3. ?숇즺???대룞
        this.players.forEach(tm => {
            if (tm.teamId === p.teamId && tm !== p) {
                if (this.celebrationType === 'celebrate') {
                    // 異뺥븯?섎윭 ?앹젏?먯뿉寃?紐⑥엫
                    const ddx = p.x - tm.x;
                    const ddy = p.y - tm.y;
                    const d = Math.hypot(ddx, ddy);
                    if (d > 3) {
                        tm.x += (ddx / d) * 0.9;
                        tm.y += (ddy / d) * 0.9;
                    }
                } else {
                    // 鍮⑤━ ?먭린 吏꾩쁺?쇰줈 蹂듦?
                    const ddx = tm.baseX - tm.x;
                    const ddy = tm.baseY - tm.y;
                    const d = Math.hypot(ddx, ddy);
                    if (d > 1) {
                        tm.x += (ddx / d) * 1.0;
                        tm.y += (ddy / d) * 1.0;
                    }
                }
            }
        });
    }

    // ?ㅽ봽 ??蹂??吏곸엫 (媛꾨떒??
    processOffBallAI() {
        // [?섏젙] 怨듦꺽 ?곹솴 ?뺤쓽: 怨듭쓣 ?뚯쑀 以묒씠嫄곕굹, ?⑥뒪/?덊똿??吏꾪뻾 以묒씪 ?뚮룄 怨듦꺽 ?먮쫫???좎?
        // 怨듭씠 ?좎븘媛??1~2珥??숈븞 ? ??뺤씠 臾대꼫吏??'?숇꽕 異뺢뎄' ?꾩긽??諛⑹??⑸땲??
        let attackingTeam = null;
        if (this.ball.owner) {
            attackingTeam = this.ball.owner.teamId;
        } else if (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner) {
            attackingTeam = this.ball.lastOwner.teamId;
        }
        
        // [?좉퇋] AI ??몄? ?뺤씤
        let isAttackingAI = false;
        if (attackingTeam && typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAttackingAI = (attackingTeam !== userSide);
        }

        const isLooseBall = !this.ball.owner && this.ball.state === BallState.LOOSE;
        
        // [?좉퇋] 怨??뚯쑀?먭? ?덉쓣 ??媛??媛源뚯슫 ?섎퉬??李얘린 (?뺣컯 ?대떦)
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

        // [?섏젙] 猷⑥쫰蹂쇱씪 ??媛??蹂꾨줈 媛??媛源뚯슫 ?좎닔 1紐낆뵫 李얘린
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
            if (p === this.ball.owner) return; // 怨?媛吏??щ엺? processBallCarrierAI?먯꽌 泥섎━

            // [?좉퇋] ??븷蹂??됰룞 ?뱀꽦 誘몃━ 媛?몄삤湲?
            const behavior = this.getRoleBehavior(p.role);
            const tacticProfile = this.getTacticProfile(p.teamId);

            let targetX = p.x;
            let targetY = p.y;
            
            // [?좉퇋] ?대룞 ?띾룄??'?ㅽ뵾?? ?ㅽ꺈 諛섏쁺
            // 湲곕낯 0.15 * (?ㅽ뵾??/ 75) -> ?ㅽ뵾??100?대㈃ ??0.2 (33% 鍮좊쫫)
            // [泥대젰 諛섏쁺] ?ㅽ봽?붾낵 ?吏곸엫?먮룄 泥대젰 諛섏쁺
            const effectiveSpeed = this.getEffectiveStat(p, 'speed');
            const speedFactor = effectiveSpeed / 75;
            let moveSpeed = 0.22 * Math.max(0.7, Math.min(1.4, speedFactor)); // [?섏젙] ?ㅽ봽?붾낵 湲곕낯 ?띾룄 ?섑뼢 (0.35 -> 0.22)

            // ------------------------------------
            // ?곹솴 1: 猷⑥쫰蹂?(怨듭씠 二쇱씤 ?놁쓣 ?? - 紐⑤몢媛 怨듭쓣 ?ν빐 ?
            // ------------------------------------
            if (isLooseBall) {
                // [?섏젙] ?숇꽕 異뺢뎄 諛⑹?: 媛???먯꽌 媛??媛源뚯슫 ?좎닔留?怨듭쓣 已볦쓬
                const isNearest = (p === nearestHome || p === nearestAway);
                
                if (isNearest) {
                    targetX = this.ball.x;
                    targetY = this.ball.y;
                    moveSpeed = 1.1; // [諛몃윴?? 猷⑥쫰蹂?異붽꺽 ?띾룄 ?곹뼢
                } else {
                    // ?섎㉧吏???먭린 ?щ찓?댁뀡 ?꾩튂瑜?吏?ㅻ릺, 怨?履쎌쓣 二쇱떆 (?쎄컙 ?대룞)
                    const ballInfluence = 0.15; // 15% ?뺣룄留?怨?履쎌쑝濡??좊┝
                    targetX = p.baseX + (this.ball.x - p.baseX) * ballInfluence;
                    targetY = p.baseY + (this.ball.y - p.baseY) * ballInfluence;
                    moveSpeed = 0.15; // 泥쒖쿇???대룞
                }
            } 
            // ------------------------------------
            // ?곹솴 2: ?곕━ ???怨듦꺽 以?(怨듦꺽 ?ㅽ봽?붾낵)
            // ------------------------------------
            else if (p.teamId === attackingTeam) {
                // [怨듦꺽 ?? 移⑦닾, 吏?? ?ㅻ쾭?섑븨
                const isHome = p.teamId === 'home';
                const forwardDir = isHome ? 1 : -1; // [?섏젙] ??1), ?댁썾??-1)
                
                // [?좉퇋] 吏묐떒 移⑦닾 濡쒖쭅 (Flood the Box): 怨듭씠 ?곷? 諛뺤뒪 洹쇱쿂硫?媛?ν븳 留롮? ?몄썝??諛뺤뒪濡??꾨룄
                const isFinalThird = isHome ? (this.ball.x > 72) : (this.ball.x < 28);
                const isAttackMinded = p.position === 'FW' || (p.position === 'MF' && (behavior.attackBias || 0) > 0.15);

                // 1. ?⑥뒪 ?섏떊??濡쒖쭅 (理쒖슦??
                if (this.ball.state === BallState.IN_FLIGHT && p === this.ball.intendedReceiver) {
                    targetX = this.ball.targetPos.x;
                    targetY = this.ball.targetPos.y;
                    moveSpeed = 0.7; // [踰꾪봽] 怨듭쓣 諛쏆쑝??媛???理쒖냽 吏덉＜ (0.65 -> 0.7)
                } else if (isFinalThird && isAttackMinded) {
                    // 2. 諛뺤뒪 ?꾨룄 (李⑥꽑): 怨듭씠 源딆닕?섎㈃ 諛뺤뒪 ?덉쑝濡??뚯쭊
                    if (p.position === 'FW') {
                        targetX = isHome ? (84 + Math.random() * 12) : (16 - Math.random() * 12);
                        targetY = behavior.hugLine ? (p.baseY < 50 ? 12 : 88) : 50 + (p.baseY - 50) * 0.28;
                        moveSpeed = 0.58 * tacticProfile.tempo;
                    } else {
                        targetX = isHome ? Math.min(74, this.ball.x + 8) : Math.max(26, this.ball.x - 8);
                        const laneSpread = 0.70 + (tacticProfile.width - 0.9) * 0.35;
                        targetY = 50 + (p.baseY - 50) * laneSpread + (this.ball.y - 50) * 0.12;
                        targetY = Math.max(18, Math.min(82, targetY));
                        moveSpeed = 0.36 * tacticProfile.tempo;
                    }
                } else {
                // [?좉퇋] Give & Go ?吏곸엫 (?⑥뒪?섍퀬 ?꾨갑 移⑦닾)
                // 諛⑷툑 ?⑥뒪???좎닔(lastOwner)??媛留뚰엳 ?덉? ?딄퀬 ?욎쑝濡??щ젮??由ы꽩 ?⑥뒪瑜??몃┝
                const isLastPasser = (p === this.ball.lastOwner);
                // ?쇳꽣諛?CD, BPD, NCB)?대굹 怨⑦궎?쇰뒗 ?먮━ 吏??
                const isRearDefender = p.position === 'GK' || (p.position === 'DF' && ['CD', 'BPD', 'NCB'].includes(p.role));

                if (isLastPasser && !isRearDefender) {
                    // ?⑥뒪 ???? ?꾩옱 ?꾩튂?먯꽌 ?꾨갑 15m 吏?먯쑝濡?移⑦닾
                    targetX = p.x + (forwardDir * 15);
                    // Y異뺤? 怨?諛⑺뼢?쇰줈 ?쎄컙 醫곹? ?ㅼ뼱媛?(吏??
                    targetY = p.y + (this.ball.y - p.y) * 0.3;
                    moveSpeed = 0.4; // [諛몃윴?? Give & Go 移⑦닾 ?띾룄 ?곹뼢
                } 
                // 湲곕낯 ?꾩튂 濡쒖쭅
                else if (p.position === 'FW') {
                    // 怨듦꺽?? ?섎퉬 ?쇱씤 源④린 ?쒕룄 or 鍮?怨듦컙 李얠븘媛湲?
                    if (!p.burstTimer) p.burstTimer = 0;
                    const oppDefLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
                    
                    const isCentralFW = !behavior.hugLine;
                    const finalThirdLine = isHome ? 78 : 22;
                    const boxEntryX = isHome ? 86 : 14;

                    if (p.burstTimer > 0) {
                        // [移⑦닾 以?
                        targetX = oppDefLineX + (forwardDir * (isCentralFW ? 8 : 6));
                        moveSpeed = 0.52;
                        p.burstTimer--;
                    } else {
                    let ballPushX = this.ball.x + (forwardDir * 20);
                    targetX = isHome ? Math.min(oppDefLineX - 1.5, ballPushX) : Math.max(oppDefLineX + 1.5, ballPushX);
                    targetX = isHome ? Math.max(targetX, 55) : Math.min(targetX, 35); 

                    const ballCarrier = this.ball.owner;
                    const hasFriendlyBall = ballCarrier && ballCarrier.teamId === p.teamId;
                    let burstChance = (hasFriendlyBall && ballCarrier.position !== 'FW') ? 0.24 : 0.08;
                    if (isCentralFW && hasFriendlyBall && ballCarrier.position !== 'FW' && Math.random() < 0.45) {
                        p.burstTimer = Math.max(p.burstTimer, 24);
                    } else if ((behavior.runBehind || isCentralFW) && Math.random() < burstChance) {
                        p.burstTimer = 45;
                    }

                    if (p.burstTimer === 0) {
                        targetX = isHome ? Math.min(targetX, oppDefLineX - 2) : Math.max(targetX, oppDefLineX + 2);
                    }
                }

                // [?섏젙] ?꾨옒 濡쒖쭅? FW ?꾩슜?대?濡?釉붾줉 ?대?濡??ы븿?섏뿬 蹂???ㅼ퐫??臾몄젣 ?닿껐
                const nearestOppInAttack = this.findNearestDefender(p);
                let avoidY = 0;
                if (nearestOppInAttack && nearestOppInAttack.dist < 4) avoidY = (p.y > nearestOppInAttack.player.y) ? 4 : -4;
                targetY = p.baseY + avoidY;
                
                if (p.burstTimer > 0) targetX = oppDefLineX + (forwardDir * (isCentralFW ? 8 : 6));

                if (isCentralFW) {
                    const advancedSupportX = isHome
                        ? Math.max(70, Math.min(boxEntryX, this.ball.x + 14))
                        : Math.min(30, Math.max(boxEntryX, this.ball.x - 14));
                    targetX = isHome ? Math.max(targetX, advancedSupportX) : Math.min(targetX, advancedSupportX);
                    if (isHome ? this.ball.x > 70 : this.ball.x < 30) {
                        targetX = isHome ? Math.max(targetX, finalThirdLine) : Math.min(targetX, finalThirdLine);
                    }
                    targetY = 50 + (p.baseY - 50) * 0.25 + avoidY;
                }

                if (behavior.hugLine) {
                    targetY = p.baseY < 50 ? 5 : 95;
                    targetX += (forwardDir * 8);
                }
                // ... (?댄븯 ?숈씪)
                    
                    if (p.burstTimer === 0 && !behavior.runBehind && !behavior.hugLine && nearestOppInAttack) {
                        const holdLineX = isHome
                            ? Math.max(nearestOppInAttack.player.x - 2, 72)
                            : Math.min(nearestOppInAttack.player.x + 2, 28);
                        targetX = isHome ? Math.max(targetX, holdLineX) : Math.min(targetX, holdLineX);
                    }
                    
                    // [?섏젙] 怨듦꺽??移⑦닾 ?띾룄 ?곹뼢
                    moveSpeed = Math.max(moveSpeed, (p.burstTimer > 0 ? 0.58 : 0.34) * speedFactor);
                } else if (p.position === 'MF') {
                    // 誘몃뱶?꾨뜑: 怨?二쇰??먯꽌 ?⑥뒪 諛쏆쓣 以鍮?(?쇨컖??????좎?)
                    // [?섏젙] ??븷 ?깊뼢(attackBias/defenseBias) 諛섏쁺
                    const attackBias = behavior.attackBias || 0;
                    const defenseBias = behavior.defenseBias || 0;

                    // 湲곕낯 媛以묒튂 (怨?60%, 踰좎씠??40%) -> 怨듦꺽?곸씪?섎줉 怨듭뿉 ???좊┝
                    let ballWeight = 0.45 + (attackBias * 0.22) - (defenseBias * 0.25);
                    ballWeight = Math.max(0.15, Math.min(0.72, ballWeight));

                    targetX = (p.baseX * (1 - ballWeight)) + (this.ball.x * ballWeight);
                    const laneSpread = 0.72 + (tacticProfile.width - 0.9) * 0.35;
                    targetY = 50 + (p.baseY - 50) * laneSpread + (this.ball.y - 50) * 0.16;
                    targetY = Math.max(16, Math.min(84, targetY));

                    // [媛쒖꽑] 誘몃뱶?꾨뜑??怨쇰룄??諛뺤뒪 吏꾩엯 諛⑹? (X異??쒓퀎???ㅼ젙)
                    // 誘몃뱶?꾨뜑??怨듦꺽??吏?먯쓣 ?꾪빐 ?꾩쭊?섎릺, 諛뺤뒪 ??80m ?댁긽)源뚯? 移⑤쾾?섏? ?딆쓬
                    targetX = isHome ? Math.min(targetX, 70) : Math.max(targetX, 30);

                    // 怨듦꺽?곸씤 誘몃뱶?꾨뜑??怨듦꺽?섏쿂???꾨갑 移⑦닾 ?쒕룄
                    if (attackBias > 0.3) targetX += (forwardDir * attackBias * 6);
                    targetX = isHome ? Math.min(targetX, 74) : Math.max(targetX, 26);
                    
                    // ?덈Т 萸됱튂吏 ?딄쾶 ?곌컻 (Y異?湲곗?)
                    if (Math.abs(p.y - this.ball.y) < 3) targetY += (p.y > 50 ? 4 : -4);
                } else {
                    // ?섎퉬?? ?쇱씤 ?щ━湲?(?섑봽?쇱씤 洹쇱쿂源뚯?)
                    // [?섏젙] 怨듦꺽 ???섎퉬 ?쇱씤???⑥뵮 ??怨듦꺽?곸쑝濡??щ┝
                    const lineTactic = gameData.deepTactics?.defensiveLine || 'standard';
                    let safetyDist = 22; // 怨듦낵??媛꾧꺽 (醫곸쓣?섎줉 ?쇱씤???믪쓬)
                    if (lineTactic === 'high') safetyDist = 14;
                    else if (lineTactic === 'deep') safetyDist = 32;

                    // 理쒕? ?꾩쭊 ?쒓퀎?좎쓣 ?섑봽?쇱씤(50)?먯꽌 ?곷? 吏꾩쁺 源딆닕??75)源뚯? ?곹뼢
                    if (isHome) {
                        targetX = Math.max(p.baseX, this.ball.x - safetyDist);
                        targetX = Math.min(targetX, 75); 
                    } else {
                        targetX = Math.min(p.baseX, this.ball.x + safetyDist);
                        targetX = Math.max(targetX, 25);
                    }

                    // [?좉퇋] 吏꾩쭨 媛숈? 鍮뚮뱶?? ?곕━ ? ?뚯쑀 ???섎퉬???덈퉬 ?뺣낫
                    // ?꾨갑?먯꽌 鍮뚮뱶?낇븷 ???쇳꽣諛깃낵 ?諛깆씠 醫뚯슦濡??볤쾶 踰뚮젮 ?⑥뒪 ?좏깮吏瑜?留뚮벊?덈떎.
                    if (Math.abs(this.ball.x - (isHome ? 0 : 100)) < 45) {
                        targetY = p.baseY < 50 ? 12 : 88; // ?곗튂?쇱씤 洹쇱쿂濡??곌컻
                    } else {
                        targetY = p.baseY; 
                    }
                }

                // Y異??대룞 (踰뚮━湲?醫곹엳湲?- Cut Inside / Hug Line)
                if (behavior.cutInside && p.position !== 'MF') {
                    targetY = 50 + (p.baseY - 50) * 0.5; // 以묒븰?쇰줈 醫곹옒
                } else if (behavior.cutInside && p.position === 'MF') {
                    targetY = 50 + (p.baseY - 50) * 0.68;
                } else if (behavior.hugLine) {
                    targetY = p.baseY < 50 ? 5 : 95; // ?곗튂?쇱씤?쇰줈 踰뚮┝
                }
                }

            } else {
                // ------------------------------------
                // ?곹솴 3: ?곷? ???怨듦꺽 以?(?섎퉬 ?ㅽ봽?붾낵)
                // ------------------------------------
                const isHomeDef = p.teamId === 'home';
                const isGegenpressing = this.isGegenpressTeam(p.teamId);
                if (!isGegenpressing && p.burstTimer) p.burstTimer = 0;
                // 1. 湲곕낯 ?섎퉬 釉붾줉 ?뺤꽦 (怨??꾩튂???곕씪 ?꾩껜 ?대룞)
                // [?섏젙] ?쇱씤 媛꾧꺽 議곗젙???꾪븳 ?대룞 怨꾩닔 李⑤벑 ?곸슜 (Compactness)
                let shiftFactor = 0.7;
                // [?좉퇋] Y異??? ?대룞 怨꾩닔: ?섎퉬?섎뒗 ????좎?瑜??꾪빐 怨?履쎌쑝濡????좊━寃???
                let yShiftFactor = 0.2;
                
                // ?섎퉬 ??誘몃뱶?꾨뜑?????곴레?곸쑝濡??대젮????섎퉬 ?쇱씤怨?媛꾧꺽??醫곹옒
                if (p.position === 'MF') {
                    const defenseBias = behavior.defenseBias || 0;
                    const attackBias = behavior.attackBias || 0;
                    
                    // [媛쒖꽑] ?섎퉬 ??誘몃뱶?꾨뜑 ?꾩튂 怨좎닔 (0.75 -> 0.5)
                    shiftFactor = isGegenpressing ? 0.5 + (defenseBias * 0.1) - (attackBias * 0.2) : 0.35 + (defenseBias * 0.08);
                    shiftFactor = Math.max(0.25, Math.min(0.65, shiftFactor));
                    moveSpeed = (isGegenpressing ? 0.22 : 0.34) * (1 + defenseBias);
                } else if (p.position === 'FW') {
                    // [媛쒖꽑] 怨듦꺽???꾩쟾 怨좊┰ (0.2 -> 0.1): ?섎퉬 ??嫄곗쓽 ?대젮?ㅼ? ?딆쓬
                    shiftFactor = isGegenpressing ? 0.28 : 0.05; 
                    moveSpeed = isGegenpressing ? 0.28 : 0.42;
                } else if (p.position === 'DF') {
                    // [媛쒖꽑] ?섎퉬 ?쇱씤 怨좎젙??媛뺥솕 (0.6 -> 0.45): ?먮룞臾??꾩긽 諛⑹?
                    shiftFactor = isGegenpressing ? 0.45 : 0.30; 
                    yShiftFactor = isGegenpressing ? 0.05 : 0.025;
                    moveSpeed = isGegenpressing ? moveSpeed : 0.32;
                }

                // [?섏젙] ?섎퉬 ?쇱씤 怨좎젙 濡쒖쭅 媛뺥솕: ?덊똿 以묒씠嫄곕굹 ?ㅽ띁 ?뚯쑀 ???쇱씤 ?좎?
                const isGKPossession = this.ball.owner && this.ball.owner.position === 'GK';
                // 怨듭씠 ?덈Т 源딆닕??25m 誘몃쭔) 媛???섎퉬 ?쇱씤? 理쒖냼?쒖쓽 ?꾩튂瑜?吏??(collapsed 諛⑹?)
                const refBallX = (this.pendingShot || isGKPossession) ? 50 : Math.max(30, Math.min(70, this.ball.x));
                const refBallY = this.pendingShot ? 50 : this.ball.y;

                const isSpecialCase = (this.pendingShot || isGKPossession);
                const ballXShift = (refBallX - 50) * shiftFactor; 
                let formationX = p.baseX + ballXShift;
                let formationY = p.baseY + (refBallY - 50) * yShiftFactor; 

                // [?섏젙] formationX ?좎뼵 ?댄썑濡?濡쒖쭅 ?대룞 (Cannot access before initialization ?먮윭 ?닿껐)
                if (p.position === 'FW') {
                    const oppDefLineX = this.getDefensiveLineX(p.teamId === 'home' ? 'away' : 'home');
                    const isAtBack = isHomeDef ? (formationX > oppDefLineX - 1) : (formationX < oppDefLineX + 1);
                    if (isAtBack) {
                        formationX = isHomeDef ? oppDefLineX - 3 : oppDefLineX + 3;
                    }
                }

                let markTarget = null;
                let minMarkDist = 30;
                
                // [?섏젙] ?뱀닔 ?곹솴(???ㅽ띁?뚯쑀)?먯꽌?????留덊겕 諛??뺣컯 濡쒖쭅??臾댁떆?섍퀬 ?쇱씤 怨좎닔
                if (!isSpecialCase && (p.position === 'DF' || isGegenpressing)) {
                this.players.forEach(opp => {
                    if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                        const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                        const oppThreatX = isHomeDef ? opp.x < 42 : opp.x > 58;
                        const runnerThreat = opp.position === 'FW' || (isHomeDef ? opp.vx < -0.08 : opp.vx > 0.08);
                        if (p.position !== 'DF' && Math.abs(p.baseY - opp.y) > 18) return;
                        if (p.position === 'DF' && !oppThreatX && d > 18) return;

                        const threatScore = d - (runnerThreat ? 10 : 0) - (oppThreatX ? 8 : 0);
                        if (threatScore < minMarkDist) {
                            minMarkDist = threatScore;
                            markTarget = opp;
                        }
                    }
                });
                }

                if (markTarget && p.position !== 'GK') {
                    // 留덊겕 ??곴낵 怨⑤? ?ъ씠瑜?留됱븘?쒕뒗 ?꾩튂
                    const goalX = p.teamId === 'home' ? 0 : 100; // ??怨⑤? (Home defends 0)
                    // ?곷?? ??怨⑤? ?ъ씠 8:2 吏??
                    targetX = markTarget.x + (goalX - markTarget.x) * 0.1; 
                    
                    // [媛쒖꽑] ???留덊겕 ??Y異??쒕━?꾪듃 ?쒗븳 (以묒븰 怨좎냽?꾨줈 諛⑹?)
                    let driftY = (markTarget.y - p.baseY) * 0.4;
                    driftY = Math.max(-7.5, Math.min(7.5, driftY)); // [議곗젙] ?덉슜 踰붿쐞 異뺤냼 (12 -> 7.5)
                    targetY = p.baseY + driftY;

                    moveSpeed = 0.06; // [?섏젙] 0.15 -> 0.06

                    // [?좉퇋] ?섎퉬 ?쇱씤 ?뺣젹 (Line Discipline)
                    // ?섎퉬??DF)?????留덊겕 ?쒖뿉???쇱씤 ?좎?瑜?理쒖슦?좎쑝濡???
                    if (p.position === 'DF') {
                        const isHome = p.teamId === 'home';
                        // 移⑦닾 ?щ? ?먮떒: 留덊겕?댁빞 ???꾩튂媛 ???щ찓?댁뀡 ?쇱씤蹂대떎 ??源딆?媛(怨⑤? 履쎌씤媛)?
                        // Home(0 ?섎퉬): targetX < formationX ?대㈃ 移⑦닾
                        // Away(100 ?섎퉬): targetX > formationX ?대㈃ 移⑦닾
                        const isPenetrating = isHome ? (targetX < formationX) : (targetX > formationX);

                        if (!isPenetrating) {
                            // ?곷?媛 ?쇱씤 ?욎뿉???吏곸씠嫄곕굹 ?대젮???諛쏆쓣 ?뚮뒗(Non-penetrating),
                            // ?곕씪?섍?吏 ?딄퀬 吏??諛⑹뼱(Zone Defense) ?뺥깭濡??쇱씤??怨좎닔??
                            // formationX(?쇱씤 ?꾩튂) 媛以묒튂瑜?80%濡??믪뿬???쇱옄 ?쇱씤 ?좎?
                            targetX = (targetX * 0.2) + (formationX * 0.8);
                        } else {
                            // ?룰났媛?移⑦닾 ?쒖뿉???곕씪媛????(Man Marking)
                            // ?? ?꾩쟾??媛쒕퀎 ?됰룞?섍린蹂대떎 ?쇱씤怨쇱쓽 ?좉린???吏곸엫???꾪빐 ?쎄컙 蹂댁젙
                            targetX = (targetX * 0.95) + (formationX * 0.05);
                        }
                    }
                } else {
                    targetX = formationX;
                    targetY = formationY;
                }

                // [?좉퇋] 怨⑦궎???꾩튂 怨좎젙 (怨⑤? ???ъ닔)
                if (p.position === 'GK') {
                    targetX = p.baseX;
                    targetY = Math.max(42, Math.min(58, 50 + (this.ball.y - 50) * 0.08));
                    moveSpeed = 0.18;
                }

                if (this.ball.owner && p.position !== 'GK' && !isSpecialCase) {
                    const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    const isDangerousZone = isHomeDef ? (this.ball.x < 35) : (this.ball.x > 65);
                    const isBoxThreat = isHomeDef ? (this.ball.x < 22) : (this.ball.x > 78);
                    const canDefendBox = p.position === 'DF' && isBoxThreat && distToBall < 18;
                    
                    // [媛쒖꽑] 紐⑤뱺 ?섎퉬?섍? ??대굹媛??'?숇꽕 異뺢뎄' 諛⑹?: 媛??媛源뚯슫 ?뺣컯 ?대떦??presser)留??꾩쭊
                    const shouldStepOut = (
                        isGegenpressing && (
                            (p === presser && distToBall < 18) ||
                            ((behavior.pressBias || 0) > 0.2 && distToBall < 12 && Math.random() < 0.35)
                        )
                    ) || (
                        p.position === 'DF' && p === presser && isDangerousZone && distToBall < 15
                    ) || (
                        canDefendBox && (p === presser || Math.random() < 0.38 * tacticProfile.boxPress)
                    );

                    if (shouldStepOut) {
                        // [諛몃윴???섏젙] ?섎퉬???뺣컯 ?대룞 濡쒖쭅 蹂寃?(蹂닿컙 -> 吏곸젒 ?대룞)
                        // 怨듦꺽?섏쓽 ?쒕━釉??띾룄(1.0)????묓븯湲??꾪빐 ?섎퉬?섏쓽 ?꾨젰 吏덉＜ ?띾룄瑜??ㅼ젙?⑸땲??
                        
                        // [吏?? 怨듭쓣 ?ν빐 吏곸젒 媛湲곕낫??'怨⑤?? 怨??ъ씠'??湲몃ぉ??李⑤떒?섎뒗 ?꾩튂濡??대룞
                        const interceptX = (this.ball.x * 0.9) + (isHomeDef ? 0 : 100) * 0.1;
                        const dx = interceptX - p.x;
                        const dy = (this.ball.y * 0.9 + 50 * 0.1) - p.y;
                        const dist = Math.hypot(dx, dy);
                        const sprintSpeed = (canDefendBox ? 2.9 : 2.4) * speedFactor * Math.max(0.85, tacticProfile.press); // [諛몃윴?? ?뺣컯 ?띾룄 ?ъ“??(2.5 -> 2.8) - ?섎퉬 媛뺥솕

                        if (dist > 0) {
                            p.x += (dx / dist) * sprintSpeed;
                            p.y += (dy / dist) * sprintSpeed;
                        }
                        
                        // ?쒗겢 ?쒕룄
                        // [踰꾪봽] ?뺣컯 ???쒗겢 鍮덈룄 異붽? ?섑뼢
                        let tackleChance = 0.07 + (this.getEffectiveStat(p, 'defense') / 1200);
                        if (canDefendBox) tackleChance += 0.08;
                        if (distToBall < 2) tackleChance += 0.12;
                        tackleChance = Math.min(canDefendBox ? 0.42 : 0.28, tackleChance);

                        if (distToBall < 5 && Math.random() < tackleChance) {
                            this.attemptTackle(p, this.ball.owner);
                        }
                        
                        return; 
                    }
                }

                const isBeaten = p.position === 'DF' && !isSpecialCase && 
                                (isHomeDef ? (this.ball.x < p.x - 2) : (this.ball.x > p.x + 2));

                if (isBeaten && !isSpecialCase) {
                    // [諛몃윴???섏젙] ?섎퉬??蹂듦? ?대룞 濡쒖쭅 蹂寃?(蹂닿컙 -> 吏곸젒 ?대룞)
                    const retreatTargetX = this.ball.x + (isHomeDef ? -12 : 12); 
                    const retreatTargetY = p.baseY + (this.ball.y - p.baseY) * 0.5; // [媛쒖꽑] 臾댁“嫄?怨듭쓽 Y濡?媛吏 ?딄퀬 ?먭린 ?쇱씤 ?좎?
                    
                    const dx = retreatTargetX - p.x;
                    const dy = retreatTargetY - p.y;
                    const dist = Math.hypot(dx, dy);
                    const retreatSpeed = 2.7 * speedFactor;

                    if (dist > 0) {
                        p.x += (dx / dist) * retreatSpeed;
                        p.y += (dy / dist) * retreatSpeed;
                    }
                    return; // [異붽?] 蹂듦?媛 理쒖슦?좎씠誘濡??ㅻⅨ ?吏곸엫 濡쒖쭅 嫄대꼫?곌린
                }
            }

            const isLooseBallChaser = isLooseBall && (p === nearestHome || p === nearestAway);

            if (isLooseBallChaser) {
                targetX = Math.max(2, Math.min(98, targetX));
                targetY = Math.max(2, Math.min(98, targetY));
                const accelX = (targetX - p.x) * moveSpeed * 0.16;
                const accelY = (targetY - p.y) * moveSpeed * 0.16;
                p.vx = (p.vx + accelX) * 0.75;
                p.vy = (p.vy + accelY) * 0.75;
                p.x += p.vx;
                p.y += p.vy;
                return;
            }

            if (p.position === 'GK') {
                targetX = p.baseX;
                targetY = Math.max(42, Math.min(58, targetY));
            } else {
                const teamHasBall = p.teamId === attackingTeam;
                const teamIsDefending = attackingTeam && p.teamId !== attackingTeam;
                let holdStrength = 0.18;
                if (teamIsDefending) holdStrength = this.isGegenpressTeam(p.teamId) ? 0.20 : 0.40;
                else if (teamHasBall) {
                    if (p.position === 'DF') holdStrength = 0.36;
                    else if (p.position === 'MF') holdStrength = 0.16;
                    else holdStrength = 0.02;
                } else {
                    holdStrength = 0.32;
                }
                targetX = (targetX * (1 - holdStrength)) + (p.baseX * holdStrength);
                targetY = (targetY * (1 - holdStrength)) + (p.baseY * holdStrength);
            }

            const teammates = this.players.filter(tm => tm.teamId === p.teamId && tm !== p);
            for (const tm of teammates) {
                const dist = Math.hypot(targetX - tm.x, targetY - tm.y);
                
                let separationDist = 4;
                // [媛쒖꽑] ?섎퉬??媛?媛꾧꺽 ?ъ“??(3.8 -> 5.5): ?덈Т 寃뱀튂吏 ?딆쑝硫댁꽌 湲몃ぉ 李⑤떒
                if (p.position === 'DF' && tm.position === 'DF') {
                    const pIsCB = ['CD', 'BPD', 'NCB'].includes(p.role);
                    const tmIsCB = ['CD', 'BPD', 'NCB'].includes(tm.role);
                    separationDist = (pIsCB && tmIsCB) ? 3.0 : 5.0;
                }

                if (dist < separationDist) {
                    const angle = Math.atan2(targetY - tm.y, targetX - tm.x);
                    const push = (separationDist - dist) * 0.5; // 諛?대궡????
                    targetX += Math.cos(angle) * push;
                    targetY += Math.sin(angle) * push;
                }
            }

            targetY = Math.max(2, Math.min(98, targetY));
            targetX = Math.max(2, Math.min(98, targetX));

            const accelX = (targetX - p.x) * moveSpeed * 0.1;
            const accelY = (targetY - p.y) * moveSpeed * 0.1;

            p.vx = (p.vx + accelX) * 0.7;
            p.vy = (p.vy + accelY) * 0.7;

            p.x += p.vx;
            p.y += p.vy;
        });
    }

    // [?좉퇋] ?꾨갑 ?섎퉬踰?媛먯? (?쒕━釉?vs ?⑥뒪 ?먮떒??
    checkFrontalBlock(player, goalX) {
        const forwardDir = player.teamId === 'home' ? 1 : -1; // ??100諛⑺뼢), ?댁썾??0諛⑺뼢)
        const checkDist = 8; // [?섏젙] 媛먯? 嫄곕━ 異뺤냼 (10 -> 8): ?щ쭔???섎퉬???リ퀬 ?꾩쭊 ?쒕룄
        const checkWidth = 4; // [?섏젙] 媛먯? ??異뺤냼 (6 -> 4): ??醫곸? ?덈룄 湲몃줈 ?몄떇

        // ???욎쓽 ?ш컖???곸뿭 ?뺤쓽
        const minY = player.y - checkWidth;
        const maxY = player.y + checkWidth;
        const minX = forwardDir === 1 ? player.x : player.x - checkDist;
        const maxX = forwardDir === 1 ? player.x + checkDist : player.x;

        // ???곸뿭 ?덉뿉 ?곸씠 ?덈뒗吏 寃??
        return this.players.some(opp => {
            if (opp.teamId === player.teamId) return false; // ?꾧뎔? ?듦낵
            
            return (
                opp.x >= minX && opp.x <= maxX &&
                opp.y >= minY && opp.y <= maxY
            );
        });
    }

    // [?좉퇋] ????낅퀎 紐⑺몴 ?꾩튂 怨꾩궛
    calcOffBallTarget(player, runType, roleStats) {
        const isHome = player.teamId === 'home';
        const forwardDir = isHome ? 1 : -1;
        const attackBonus = (roleStats.attack || 0) * 10; // 怨듦꺽 媛以묒튂 -> 移⑦닾 源딆씠

        // 1. ?ㅽ듃?쇱씠而???(移⑦닾)
        if (runType === RUN_TYPE.STRIKER_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            // ?섎퉬 ?쇱씤 諛붾줈 ??+ 怨듦꺽?깅쭔????源딆씠
            const penetrationDepth = 5 + attackBonus; 
            return {
                x: defLineX + (forwardDir * penetrationDepth),
                y: this.ball.y + (Math.random() - 0.5) * 20 // 怨?洹쇱쿂 Y
            };
        }
        
        // 2. ?쒗룷????(?쇨컖??
        else if (runType === RUN_TYPE.SUPPORT_RUN) {
            // 怨??뚯쑀??湲곗? ?媛곸꽑 ?ㅼそ (?덉쟾???⑥뒪 ?듭뀡)
            const side = player.baseY < 50 ? 'top' : 'bottom';
            const backDirX = -forwardDir;
            const sideDirY = side === 'top' ? -1 : 1;
            
            return {
                x: this.ball.x + (backDirX * 10),
                y: this.ball.y + (sideDirY * 10)
            };
        }
        
        // 3. 梨꾨꼸 ??(?섎퉬 ?ъ씠)
        else if (runType === RUN_TYPE.CHANNEL_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            // 怨듦낵 諛섎?履??섑봽?ㅽ럹?댁뒪 李얘린
            const targetY = this.ball.y < 50 ? 70 : 30; 
            return { x: defLineX + (forwardDir * 2), y: targetY }; 
        }
        
        // 4. ??대뱶 ??(踰뚮━湲?
        else if (runType === RUN_TYPE.WIDE_RUN) {
            // ?곗튂?쇱씤 履쎌쑝濡?踰뚮┝ (Y=5 or Y=95)
            const sideY = player.baseY < 50 ? 5 : 95;
            return { x: this.ball.x + (forwardDir * 5), y: sideY };
        }
        
        // 5. ?몃뜑????(?덉쑝濡?
        else if (runType === RUN_TYPE.UNDERLAP_RUN) {
            const halfSpaceY = player.baseY < 50 ? 30 : 70;
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            return { x: defLineX + (forwardDir * 5), y: halfSpaceY };
        }
        
        // 6. ????ъ???(?먮━ 吏?ㅺ린)
        else {
            const ballInfluence = 0.2; // 怨?履쎌쑝濡??쎄컙 ?좊┝
            return {
                x: player.baseX + (this.ball.x - player.baseX) * ballInfluence,
                y: player.baseY + (this.ball.y - player.baseY) * ballInfluence
            };
        }
    }

    // [?좉퇋] ?곷? ?섎퉬 ?쇱씤 Y醫뚰몴 援ы븯湲?
    getDefensiveLineX(opposingTeamId) {
        let relevantPlayers = this.players.filter(p => p.teamId === opposingTeamId && p.position !== 'GK');
        
        // Home defends 0. Away defends 100.
        if (opposingTeamId === 'away') {
            // Away defends 100. Attackers come from 0.
            // Defenders are at X=80.
            // Line closest to attackers is min X of defenders.
            const xs = relevantPlayers.map(p => p.x);
            return Math.min(...xs); 
        } else {
            // Home defends 0. Attackers come from 100.
            // Defenders are at X=20.
            // Line closest to attackers is max X of defenders.
            const xs = relevantPlayers.map(p => p.x);
            return Math.max(...xs);
        }
    }

    // [?좉퇋] ?ㅽ봽?ъ씠??泥댄겕 (紐⑺몴 ?꾩튂 蹂댁젙)
    applyOffsideCheck(targetPos, player) {
        const opposingTeamId = player.teamId === 'home' ? 'away' : 'home';
        const opponents = this.players.filter(p => p.teamId === opposingTeamId);
        
        // 怨⑤씪??湲곗? 2踰덉㎏濡?媛源뚯슫 ?좎닔 李얘린 (?ㅽ봽?ъ씠???쇱씤)
        if (player.teamId === 'home') {
            // Home attacks 100. Opponent(Away) defends 100.
            // Sort by X descending (closest to 100).
            opponents.sort((a, b) => b.x - a.x);
            if (opponents.length < 2) return targetPos;
            
            const offsideLineX = opponents[1].x; 
            const ballX = this.ball.x;
            const limitX = Math.max(offsideLineX, ballX); // Can't go beyond (greater than) this
            
            if (targetPos.x > limitX) {
                targetPos.x = limitX - 2; 
            }
        } else {
            // Away attacks 0. Opponent(Home) defends 0.
            // Sort by X ascending (closest to 0).
            opponents.sort((a, b) => a.x - b.x);
            if (opponents.length < 2) return targetPos;
            
            const offsideLineX = opponents[1].x;
            const ballX = this.ball.x;
            const limitX = Math.min(offsideLineX, ballX); // Can't go below this
            if (targetPos.x < limitX) {
                targetPos.x = limitX + 2;
            }
        }
        return targetPos;
    }

    // [?좉퇋] 媛??媛源뚯슫 ?섎퉬??李얘린 (嫄곕━ ?ы븿 諛섑솚)
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

    // [?좉퇋] ?⑥뒪 李⑤떒 濡쒖쭅
    checkInterception() {
        // 怨??꾩튂 洹쇱쿂???섎퉬?섍? ?덈뒗吏 ?뺤씤
        this.players.forEach(p => {
            // 二쇱씤???녾퀬(?좎븘媛??以?, 怨듦낵 留ㅼ슦 媛源뚯슫 ?섎퉬??
            // [?섏젙] ???쒕룄 以묒뿉???명꽣?됲듃 遺덇? (GK ?좊갑 濡쒖쭅 蹂꾨룄 議댁옱)
            if (!this.ball.owner && this.ball.state === BallState.IN_FLIGHT && !this.pendingShot) {
                // [?섏젙] ?⑥뒪???좎닔? 媛숈? ??대㈃ ?명꽣?됲듃 ?쒕룄 ????(?뺤긽?곸씤 ?⑥뒪 由ъ떆釉뚮뒗 ?꾩갑 ??泥섎━??
                if (this.ball.lastOwner && p.teamId === this.ball.lastOwner.teamId) return;

                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                
                // [?섏젙] 嫄곕━ 3m ?대궡, ?λ젰移?湲곕컲 ?뺣쪧 泥댄겕 (?깅쭏???ㅽ뻾?섎?濡??뺣쪧 議곗젙)
                if (d < 3) {
                    // [泥대젰 諛섏쁺] ?섎퉬?μ뿉 泥대젰 諛섏쁺
                    const effectiveDefense = this.getEffectiveStat(p, 'defense');
                    // [踰꾪봽] ?명꽣?됲듃 ?뺣쪧 異붽? ?섑뼢 (800 -> 1000)
                    const interceptChance = 0.02 + (effectiveDefense / 1000); 
                    if (Math.random() < interceptChance) {
                        this.ball.state = BallState.CONTROLLED;
                        this.ball.owner = p;
                        this.ball.intendedReceiver = null; // 李⑤떒 ???섏떊 ?곹깭 ?댁젣
                        // [異붽?] ?명꽣?됲듃 ???댁떆?ㅽ듃 泥댁씤 珥덇린??
                        this.ball.lastOwner = null;
                        this.eventsQueue.push({ type: 'tackle', player: p.name, desc: `${p.name}, 패스를 읽고 차단합니다!` });
                    }
                }
            }
        });
    }

    // [?좉퇋] ??븷蹂??됰룞 ?뱀꽦 諛섑솚 ?ы띁
    getRoleBehavior(role) {
        const behaviors = {
            // 怨듦꺽??
            'AF': { runBehind: true, shootBias: 0.2, dribbleBias: 0.1 }, // 移⑦닾, ??
            'P':  { runBehind: true, shootBias: 0.3, passBias: -0.2 }, // 移⑦닾, ?먯슃
            'DLF':{ comeShort: true, passBias: 0.1 }, // ?곌퀎
            'F9': { comeShort: true, dribbleBias: 0.1, passBias: 0.1 }, // ?대젮????곌퀎
            'TM': { comeShort: true, holdUp: true }, // ?깅뵳
            
            // ?숈뼱
            'W':  { hugLine: true, dribbleBias: 0.2, crossBias: 0.2 }, // 痢〓㈃ ?뚰뙆
            'IF': { cutInside: true, shootBias: 0.1, dribbleBias: 0.2 }, // 以묒븰 移⑦닾
            
            // 誘몃뱶?꾨뜑
            'BBM': { runBehind: false, pressBias: 0.1, attackBias: 0.3, defenseBias: 0.3 }, // 諛뺤뒪?щ컯??
            'MEZ': { cutInside: true, attackBias: 0.5, defenseBias: 0.1 }, // 硫붿ℓ??(怨듦꺽??
            'DLP': { comeShort: true, passBias: 0.3, defenseBias: 0.4 }, // ?꾨갑 ?뚮젅?대찓?댁빱
            'AP':  { comeShort: true, passBias: 0.2, dribbleBias: 0.1, attackBias: 0.4, defenseBias: 0.1 }, // ?꾩쭊 ?뚮젅?대찓?댁빱
            'BWM': { pressBias: 0.3, passBias: -0.1, defenseBias: 0.5 }, // 蹂??꾨떇 (?섎퉬??
            'REG': { passBias: 0.4, defenseBias: 0.3 },
            'CAR': { comeShort: true, defenseBias: 0.4 },
            'EG':  { comeShort: true, attackBias: 0.3 },
            'SS':  { runBehind: true, attackBias: 0.6 },
            'ANC': { defenseBias: 0.6 },
            'DM':  { defenseBias: 0.5 },
            'SV':  { runBehind: true, attackBias: 0.4, defenseBias: 0.3 },
            
            // ?섎퉬??
            'BPD': { passBias: 0.1 }, // 鍮뚮뱶??
            'CD':  { passBias: -0.1 }, // ?덉쟾 ?쒖씪
            'WB':  { overlap: true, dribbleBias: 0.1 }, // ?숇갚 (?ㅻ쾭?섑븨)
            'FB':  { overlap: false }, // ?諛?(?섎퉬??
            'NCB': { passBias: -0.3 } // 嫄룹뼱?닿린 ?꾩＜
        };
        
        return behaviors[role] || {}; // 湲곕낯媛?
    }

    attemptTackle(defender, attacker) {
        // [泥대젰 諛섏쁺] ?쒗겢 ??泥대젰 諛섏쁺???ㅽ꺈 ?ъ슜
        const defStat = this.getEffectiveStat(defender, 'defense');
        const atkStat = this.getEffectiveStat(attacker, 'decision');

        // [?좉퇋] ?뚰뙆 以묒씤 怨듦꺽?섏쓽 ?띾룄 媛以묒튂 諛섏쁺 (移섎떖 以묒씤 ?좎닔???쒗겢?섍린 ?섎벀)
        const atkSpeed = this.getEffectiveStat(attacker, 'speed');
        const speedBonus = (atkSpeed / 100) * 20; // 理쒕? 20??蹂대꼫??(?띾룄媛 ?믪쓣?섎줉 ?뚯슱 ?좊룄???뚰뙆 ?깃났 利앷?)

        const defRoll = defStat * Math.random();
        const atkRoll = (atkStat + speedBonus) * Math.random();

        if (attacker && defRoll > atkRoll) {
            // ?쒗겢 ?깃났 -> ?뚯쑀沅??꾪솚
            this.ball.owner = defender;
            // [異붽?] ?쒗겢 ?깃났 ???댁떆?ㅽ듃 泥댁씤 珥덇린??
            this.ball.lastOwner = null;
            this.eventsQueue.push({ type: 'tackle', player: defender.name, desc: `${defender.name}의 태클 성공!` });
            return true; // ?깃났 諛섑솚
        }
        return false; // ?ㅽ뙣 諛섑솚
    }

    adjustDefensiveLines() {
        // processOffBallAI?먯꽌 ?대? 怨??꾩튂 湲곕컲 ?쇱씤 議곗젙???섑뻾??
        // 異붽??곸씤 ?꾩닠???쇱씤 議곗젙(Deep/High)? ?ш린??媛??
        const lineShift = gameData.deepTactics.defensiveLine === 'high' ? -10 : (gameData.deepTactics.defensiveLine === 'deep' ? 10 : 0);
        // (援ы쁽 ?앸왂 - ??濡쒖쭅???ы븿??
    }

    // [?좉퇋] 寃쎄린 醫낅즺 ???댁옣 ?좊땲硫붿씠???쒖옉
    startExitAnimation(winnerId = null) {
        this.winningTeamId = winnerId;
        this.lapAngle = 0; // ?몃젅癒몃땲 ?뚯쟾 媛곷룄

        // ?덊? ?밸━ ?쒖뿉留?以꾩꽌???쒕컮??(Phase 1 吏꾩엯)
        if (winnerId === 'home') {
            this.postMatchPhase = 1; // 吏묎껐 ?④퀎
            
            const homePlayers = this.players.filter(p => p.teamId === 'home');
            
            homePlayers.forEach((p, i) => {
                // "?덈Т ?쇱옄硫??댁깋?섎땲源? -> ?쎄컙???쒕뜡?깃낵 媛꾧꺽??二쇱뼱 ?먯뿰?ㅻ읇寃?諛곗튂
                p.lapOrder = i * 0.2; // ?좎닔 媛?媛꾧꺽 (?쇰뵒??
                p.radiusNoise = (Math.random() - 0.5) * 6; // 諛섏?由꾩뿉 ?쎄컙??遺덇퇋移숈꽦 (짹3m)
                
                // 寃쎄린???섎떒 以묒븰(90??諛⑺뼢) 遺洹쇱쑝濡?吏묎껐 紐⑺몴 ?ㅼ젙
                const startAngle = Math.PI / 2 + p.lapOrder; 
                p.exitTargetX = 50 + Math.cos(startAngle) * (35 + p.radiusNoise);
                p.exitTargetY = 50 + Math.sin(startAngle) * (30 + p.radiusNoise);
            });

            // 吏??(?먯젙?)? 諛붾줈 ?댁옣
            const awayPlayers = this.players.filter(p => p.teamId !== 'home');
            awayPlayers.forEach(p => {
                p.exitTargetX = 50 + (Math.random() - 0.5) * 40;
                p.exitTargetY = -20; // ?꾩そ?쇰줈 ?댁옣
            });

        } else {
            // ?덊? ?⑤같(?먮뒗 臾댁듅遺) ??紐⑤몢 諛붾줈 ?댁옣
            this.initExitMovement();
        }
    }

    // [?좉퇋] ?댁옣 ?대룞 寃쎈줈 ?ㅼ젙 (蹂꾨룄 遺꾨━)
    initExitMovement() {
        this.postMatchPhase = 3; // ?댁옣 ?④퀎 (湲곗〈 2?먯꽌 3?쇰줈 蹂寃?
        const exitY = Math.random() < 0.5 ? -20 : 120; // ?댁옣 諛⑺뼢
        
        this.players.forEach(p => {
            p.exitTargetX = 50 + (Math.random() - 0.5) * 10;
            p.exitTargetY = exitY;
        });
    }

    // [?좉퇋] ?댁옣 ?좊땲硫붿씠???낅뜲?댄듃
    updatePostMatch() {
        // Phase 1: ?덊? 吏묎껐 (吏??? ?댁옣)
        if (this.postMatchPhase === 1) {
            let allAligned = true;
            
            // ?덊?: ?쒖옉 吏???섎떒)?쇰줈 ?대룞
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    const dx = p.exitTargetX - p.x;
                    const dy = p.exitTargetY - p.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 3) { // ?異?洹쇱쿂???ㅻ㈃ ??(?덈Т 移쇨컳??留욎텧 ?꾩슂 ?놁쓬)
                        p.x += (dx / dist) * 0.8;
                        p.y += (dy / dist) * 0.8;
                        allAligned = false; 
                    }
                } else {
                    // ?먯젙?: 怨꾩냽 ?댁옣
                    p.y -= 0.8;
                }
            });

            if (allAligned) {
                this.postMatchPhase = 2; // ?뚭린 ?쒖옉
                this.lapAngle = Math.PI / 2; // ?섎떒(90???먯꽌 ?쒖옉
            }
        }
        // Phase 2: 寃쎄린???멸낸 ?ш쾶 ?뚭린 (Lap of Honor)
        else if (this.postMatchPhase === 2) {
            this.lapAngle -= 0.015; // 諛섏떆怨?諛⑺뼢?쇰줈 泥쒖쿇???뚯쟾
            
            // ?덊?: ???沅ㅻ룄 ?대룞
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    // ?꾩옱 媛곷룄 + 媛쒖씤 ?ㅽ봽??
                    const currentAngle = this.lapAngle + p.lapOrder;
                    
                    // 寃쎄린???멸낸???꾨뒗 ???沅ㅻ룄 (媛濡?40, ?몃줈 35 + 媛쒖씤李?
                    const radiusX = 40 + p.radiusNoise;
                    const radiusY = 35 + p.radiusNoise;
                    
                    const targetX = 50 + Math.cos(currentAngle) * radiusX;
                    const targetY = 50 + Math.sin(currentAngle) * radiusY;
                    
                    // 遺?쒕읇寃??곕씪媛湲?
                    p.x += (targetX - p.x) * 0.1;
                    p.y += (targetY - p.y) * 0.1;
                } else {
                    // ?먯젙?? 怨꾩냽 ?댁옣 ?대룞
                    p.y -= 0.8; 
                }
            });

            // ??諛뷀????뚮㈃ ?댁옣 (?쒖옉 媛곷룄 PI/2, 諛섏떆怨꾨줈 ?뚯븘??-3PI/2源뚯?)
            if (this.lapAngle < -Math.PI * 1.5) { 
                this.initExitMovement(); 
            }
        }
        // Phase 3: 紐⑤몢 ?댁옣 ?대룞
        else if (this.postMatchPhase === 3) {
            this.players.forEach(p => {
                const dx = p.exitTargetX - p.x;
                const dy = p.exitTargetY - p.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist > 1) {
                    const speed = 0.7; 
                    p.x += (dx / dist) * speed;
                    p.y += (dy / dist) * speed;
                }
            });
        }
        
        return this.getSnapshot();
    }

    isExitAnimationDone() {
        // ?댁옣 ?④퀎(3)?닿퀬 紐⑤뱺 ?좎닔媛 ?붾㈃ 諛뽰쑝濡??섍컮?붿? ?뺤씤
        if (this.postMatchPhase !== 3) return false;
        return this.players.every(p => p.y < -10 || p.y > 110);
    }
}

// ?꾩뿭 ?몄텧
window.RealSoccerEngine = RealSoccerEngine;
window.DeepTacticManager = DeepTacticManager;

// 珥덇린??
document.addEventListener('DOMContentLoaded', () => {
    const tacticsBtn = document.querySelector('[data-tab="tactics"]');
    if (tacticsBtn) {
        tacticsBtn.addEventListener('click', () => setTimeout(() => DeepTacticManager.init(), 100));
    }
    setTimeout(() => DeepTacticManager.init(), 1000);
});
