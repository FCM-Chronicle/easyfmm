// skillMoves.js - 선수들의 개인기(Skill Moves) 시스템

const SkillMoveData = {
    BODY_FEINT: {
        id: 'BODY_FEINT',
        name: '바디 페인트',
        minStars: 1,
        category: 'feint',
        staminaCost: 1.5,
        successBonus: 1.10,
        descs: [
            '{player}, 날카로운 바디 페인트로 {defender}의 무게중심을 무너뜨립니다!',
            '{player}, 상체 페인팅 한 번으로 수비 타이밍을 완벽히 뺏습니다!'
        ]
    },
    BALL_ROLL: {
        id: 'BALL_ROLL',
        name: '볼 롤',
        minStars: 1,
        category: 'cut',
        staminaCost: 1.5,
        successBonus: 1.12,
        descs: [
            '{player}, 침착한 볼 롤로 태클 각도를 피하며 전진합니다!',
            '{player}, 발바닥으로 공을 굴려 {defender}의 발을 가볍게 피해갑니다!'
        ]
    },
    STEP_OVER: {
        id: 'STEP_OVER',
        name: '스텝오버',
        minStars: 2,
        category: 'feint',
        staminaCost: 2.0,
        successBonus: 1.16,
        descs: [
            '{player}, 현란한 헛다리짚기 스텝오버! {defender}을(를) 제치고 치고 나갑니다!',
            '{player}의 빠른 스텝오버! 수비수의 타이밍을 완벽하게 빼앗습니다!'
        ]
    },
    DRAG_BACK: {
        id: 'DRAG_BACK',
        name: '드래그백',
        minStars: 2,
        category: 'turnback',
        staminaCost: 1.8,
        successBonus: 1.14,
        descs: [
            '{player}, 노련한 드래그백으로 {defender}의 압박을 순식간에 벗겨냅니다!',
            '{player}, 공을 뒤로 끌어당기는 드래그백으로 공간을 창출합니다!'
        ]
    },
    HEEL_CHOP: {
        id: 'HEEL_CHOP',
        name: '힐 촙',
        minStars: 2,
        category: 'cut',
        staminaCost: 2.0,
        successBonus: 1.16,
        descs: [
            '{player}, 감각적인 힐 촙으로 {defender}을(를) 따돌리고 방향을 바꿉니다!',
            '{player}, 발뒤꿈치 꺾기로 압박을 벗어납니다!'
        ]
    },
    CRUYFF_TURN: {
        id: 'CRUYFF_TURN',
        name: '크루이프 턴',
        minStars: 3,
        category: 'turnback',
        staminaCost: 2.2,
        successBonus: 1.22,
        descs: [
            '{player}, 슈팅하는 척 접어 들어가는 예술적인 크루이프 턴! {defender}이(가) 완전히 속았습니다!',
            '{player}의 우아한 크루이프 턴! 수비수를 반대 방향으로 날려버립니다!'
        ]
    },
    LA_CROQUETA: {
        id: 'LA_CROQUETA',
        name: '라 크로케타',
        minStars: 3,
        category: 'cut',
        staminaCost: 2.2,
        successBonus: 1.22,
        descs: [
            '{player}, 정교한 라 크로케타! 좁은 틈 사이로 순식간에 빠져나갑니다!',
            '{player}, 양발을 오가는 팬텀 드리블로 {defender}을(를) 완벽히 제칩니다!'
        ]
    },
    ROULETTE: {
        id: 'ROULETTE',
        name: '룰렛',
        minStars: 3,
        category: 'spin',
        staminaCost: 2.8,
        successBonus: 1.25,
        descs: [
            '{player}, 부드러운 360도 룰렛! {defender}의 태클을 유유히 피해갑니다!',
            '{player}, 회전하는 룰렛 동작으로 수비 압박을 허물어뜨립니다!'
        ]
    },
    MARSEILLE_TURN: {
        id: 'MARSEILLE_TURN',
        name: '마르세유 턴',
        minStars: 3,
        category: 'spin',
        staminaCost: 3.0,
        successBonus: 1.26,
        descs: [
            '{player}, 교과서적인 마르세유 턴! {defender}을(를) 완벽하게 요리하며 벗겨냅니다!',
            '{player}, 전매특허 마르세유 턴으로 압박을 한 번에 무력화합니다!'
        ]
    },
    RONALDO_CHOP: {
        id: 'RONALDO_CHOP',
        name: '호날두 촙',
        minStars: 4,
        category: 'cut',
        staminaCost: 2.6,
        successBonus: 1.28,
        descs: [
            '{player}, 폭발적인 호날두 촙! 급격한 컷인에 {defender}이(가) 헛다리를 짚습니다!',
            '{player}, 고속 질주 중 날카로운 촙 동작으로 수비를 완전히 따돌립니다!'
        ]
    },
    BERBATOV_SPIN: {
        id: 'BERBATOV_SPIN',
        name: '베르바토프 스핀',
        minStars: 4,
        category: 'spin',
        staminaCost: 2.8,
        successBonus: 1.28,
        descs: [
            '{player}, 우아한 베르바토프 스핀! {defender}을(를) 등지고 순식간에 돌아섭니다!',
            '{player}, 감각적인 터치 턴으로 터치라인 수비를 완벽히 무너뜨립니다!'
        ]
    },
    MCGEADY_SPIN: {
        id: 'MCGEADY_SPIN',
        name: '맥기디 스핀',
        minStars: 4,
        category: 'spin',
        staminaCost: 3.2,
        successBonus: 1.30,
        descs: [
            '{player}, 고속 맥기디 스핀! 90도 회전 돌파로 {defender}을(를) 제쳐냅니다!',
            '{player}, 눈 깜짝할 새의 맥기디 스핀으로 측면 공간을 열어젖힙니다!'
        ]
    },
    ELASTICO: {
        id: 'ELASTICO',
        name: '엘라스티코',
        minStars: 5,
        category: 'feint',
        staminaCost: 3.6,
        successBonus: 1.36,
        descs: [
            '{player}, 환상적인 엘라스티코! 눈을 의심케 하는 발재간에 {defender}이(가) 얼어붙습니다!',
            '{player}의 전광석화 엘라스티코! 수비수가 중심을 잃고 주저앉습니다!'
        ]
    },
    REVERSE_ELASTICO: {
        id: 'REVERSE_ELASTICO',
        name: '리버스 엘라스티코',
        minStars: 5,
        category: 'feint',
        staminaCost: 3.6,
        successBonus: 1.36,
        descs: [
            '{player}, 안쪽에서 바깥쪽으로 치고 나가는 리버스 엘라스티코! {defender}이(가) 완전히 뚫립니다!',
            '{player}, 예측 불허의 리버스 엘라스티코로 수비 벽을 찢어놓습니다!'
        ]
    },
    RAINBOW_FLICK: {
        id: 'RAINBOW_FLICK',
        name: '사포 (레인보우 플릭)',
        minStars: 5,
        category: 'aerial',
        staminaCost: 4.5,
        successBonus: 1.45,
        descs: [
            '{player}, 믿을 수 없는 사포(레인보우 플릭)!! {defender}의 키를 넘겨버리는 쇼타임!',
            '{player}, 대담한 사포 기술로 수비수 머리 위로 공을 띄워 돌파합니다!'
        ]
    },
    SOMBRERO_FLICK: {
        id: 'SOMBRERO_FLICK',
        name: '솜브레로 플릭',
        minStars: 5,
        category: 'aerial',
        staminaCost: 4.0,
        successBonus: 1.40,
        descs: [
            '{player}, 공을 살짝 띄워 {defender}을(를) 넘기는 솜브레로 플릭! 관중석이 들썩입니다!',
            '{player}, 감각적인 솜브레로 플릭으로 압박을 예술적으로 벗어납니다!'
        ]
    },
    NUTMEG: {
        id: 'NUTMEG',
        name: '알까기 (넛멕)',
        minStars: 4,
        category: 'aerial',
        staminaCost: 2.5,
        successBonus: 1.32,
        descs: [
            '{player}, 치욕적인 알까기(넛멕)!! {defender}의 가랑이 사이로 공을 빼내 돌파합니다!',
            '{player}, 대담하게 {defender}의 다리 사이로 공을 통과시키며 환호를 끌어냅니다!'
        ]
    },
    RABONA_FAKE: {
        id: 'RABONA_FAKE',
        name: '라보나 페이크',
        minStars: 5,
        category: 'turnback',
        staminaCost: 3.2,
        successBonus: 1.34,
        descs: [
            '{player}, 화려한 라보나 페이크! 크로스인 척 접고 들어가 {defender}을(를) 완벽히 속입니다!',
            '{player}, 현란한 라보나 페이크 동작으로 슈팅 각도를 열어냅니다!'
        ]
    }
};

// 하위 호환 별칭 (기존 STEPOVER ID 참조 대비)
SkillMoveData.STEPOVER = SkillMoveData.STEP_OVER;

const SkillMoveManager = {
    getAllMoves() {
        return Object.entries(SkillMoveData)
            .filter(([key]) => key !== 'STEPOVER')
            .map(([, val]) => val);
    },

    getPlayerMaxStars(player) {
        if (!player) return 3;
        let stars = Number(player.skillMoves);
        if (!Number.isFinite(stars) || stars < 1) stars = 3;
        const drib = (player.stats && Number(player.stats.dribble)) ||
            (player.attributes && Number(player.attributes.dribbling)) ||
            Number(player.rating) || 70;
        const traits = Array.isArray(player.traits) ? player.traits : [];
        if (drib >= 88 && stars < 5) stars = Math.min(5, stars + 1);
        if (traits.some(t => t.includes('테크니션') || t.includes('플레어') || t.includes('퍼스트 터치'))) {
            stars = Math.min(5, stars + 1);
        }
        return Math.max(1, Math.min(5, Math.round(stars)));
    },

    pickSkillMove(player, context = {}) {
        const maxStars = this.getPlayerMaxStars(player);
        const allMoves = this.getAllMoves();
        let pool = allMoves.filter(m => m.minStars <= maxStars);
        if (!pool.length) pool = allMoves.filter(m => m.minStars <= 2);

        // 상황별 가중치 풀 구성 (측면/박스/압박 등)
        const isFlank = Boolean(context.isFlank);
        const nearBox = Boolean(context.nearBox);
        const tightPress = Boolean(context.tightPress);

        const weighted = [];
        for (const move of pool) {
            let weight = move.minStars === maxStars ? 3 : (move.minStars >= maxStars - 1 ? 2 : 1);
            if (isFlank && ['STEP_OVER', 'RONALDO_CHOP', 'MCGEADY_SPIN', 'RABONA_FAKE', 'BERBATOV_SPIN', 'ELASTICO'].includes(move.id)) {
                weight += 2;
            }
            if (nearBox && ['LA_CROQUETA', 'NUTMEG', 'ELASTICO', 'REVERSE_ELASTICO', 'RAINBOW_FLICK', 'SOMBRERO_FLICK', 'CRUYFF_TURN'].includes(move.id)) {
                weight += 2;
            }
            if (tightPress && ['DRAG_BACK', 'MARSEILLE_TURN', 'ROULETTE', 'BALL_ROLL', 'LA_CROQUETA', 'BODY_FEINT'].includes(move.id)) {
                weight += 2;
            }
            for (let i = 0; i < weight; i++) weighted.push(move);
        }

        const picked = weighted[Math.floor(Math.random() * weighted.length)] || pool[0];
        const playerName = (player && player.name) ? player.name : '선수';
        const defenderName = (context.defender && context.defender.name) ? context.defender.name : '수비수';
        const templates = Array.isArray(picked.descs) && picked.descs.length
            ? picked.descs
            : [`${playerName}, ${picked.name} 기술로 수비를 제쳐냅니다!`];
        const rawDesc = templates[Math.floor(Math.random() * templates.length)];
        const desc = rawDesc
            .replace(/\{player\}/g, playerName)
            .replace(/\{defender\}/g, defenderName);

        return {
            move: picked,
            skillId: picked.id,
            skillName: picked.name,
            desc
        };
    },

    attemptSkillMove(attacker, defender) {
        const tech = (attacker && attacker.stats && (attacker.stats.dribble || attacker.stats.passing)) || 70;
        const { move } = this.pickSkillMove(attacker, { defender });
        if (attacker && typeof attacker.stamina === 'number') {
            attacker.stamina = Math.max(0, attacker.stamina - move.staminaCost);
        }

        const atkRoll = tech * move.successBonus * (0.8 + Math.random() * 0.4);
        const defStat = (defender && defender.stats && defender.stats.defense) || 70;
        const defRoll = defStat * (0.8 + Math.random() * 0.4);

        return {
            success: atkRoll > defRoll,
            move
        };
    }
};

if (typeof window !== 'undefined') {
    window.SkillMoveData = SkillMoveData;
    window.SkillMoveManager = SkillMoveManager;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkillMoveData, SkillMoveManager };
}
