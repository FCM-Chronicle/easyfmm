// skillmoves.js - 선수들의 개인기(Skill Moves) 시스템 (능력치 제한 제거 버전)

const SkillMoveData = {
    MARSEILLE_TURN: {
        name: "마르세유 턴",
        staminaCost: 3,
        successBonus: 1.25,
        desc: " 화려한 마르세유 턴으로 수비를 따돌립니다!"
    },
    LA_CROQUETA: {
        name: "라 크로케타",
        staminaCost: 2,
        successBonus: 1.15,
        desc: " 민첩한 라 크로케타로 가볍게 제칩니다."
    },
    ELASTICO: {
        name: "엘라스티코",
        staminaCost: 4,
        successBonus: 1.35,
        desc: " 환상적인 엘라스티코! 수비수가 속수무책입니다."
    },
    DRAG_BACK: {
        name: "드래그백",
        staminaCost: 1.5,
        successBonus: 1.1,
        desc: " 노련한 드래그백으로 압박을 벗어납니다."
    },
    STEPOVER: {
        name: "스텝오버",
        staminaCost: 2,
        successBonus: 1.15,
        desc: " 현란한 스텝오버로 수비의 타이밍을 뺏습니다."
    },
    ROULETTE: {
        name: "룰렛",
        staminaCost: 3,
        successBonus: 1.25,
        desc: " 룰렛 기술을 선보이며 수비를 유연하게 통과합니다."
    },
    RAINBOW_FLICK: {
        name: "사포",
        staminaCost: 5,
        successBonus: 1.5,
        desc: " 대담한 사포! 공이 수비수 머리 위를 지나갑니다!"
    },
    RONALDO_CHOP: {
        name: "호날두 촙",
        staminaCost: 2.5,
        successBonus: 1.25,
        desc: " 강력한 호날두 촙으로 방향을 급격히 바꿉니다!"
    }
};

const SkillMoveManager = {
    attemptSkillMove(attacker, defender) {
        const tech = attacker.stats.passing;
        const availableMoves = Object.values(SkillMoveData);
        
        const selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        attacker.stamina = Math.max(0, attacker.stamina - selectedMove.staminaCost);

        const atkRoll = tech * selectedMove.successBonus * (0.8 + Math.random() * 0.4);
        const defRoll = defender.stats.defense * (0.8 + Math.random() * 0.4);

        return {
            success: atkRoll > defRoll,
            move: selectedMove
        };
    }
};

window.SkillMoveManager = SkillMoveManager;