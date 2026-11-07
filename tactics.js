// tactics.js

/**
 * @file tactics.js
 * '마스터 가이드라인'에 명시된 새로운 전술 시스템의 핵심 로직을 구현합니다.
 * - 역할(Role)에 따른 스탯 가중치 데이터 (RoleData)
 * - 라인별 스탯(DNA)과 역할을 결합하여 최종 파워를 계산하는 로직
 * - 체력 소모율 데이터
 */

// 1. FM 전문 역할(Role) 데이터 시스템
// 가이드라인에 명시된 6대 스탯 가중치를 그대로 객체로 구현합니다.
const RoleData = {
	// 1. 공격진 (ST, SS, LW, RW)
	attack: {
		AF: { name: "전진형 포워드", attack: 0.20, technique: -0.05, mobility: 0.20, defense: -0.20, physical: 0.05, mentality: 0.05, stamina: 'high' },
		CF: { name: "센터 포워드", attack: 0.15, technique: 0.15, mobility: 0.10, defense: 0.05, physical: 0.15, mentality: 0.10, stamina: 'very_high' },
		P:  { name: "포처", attack: 0.50, technique: -0.20, mobility: 0.10, defense: -0.35, physical: -0.05, mentality: 0.10, stamina: 'low' },
		DLF:{ name: "딥라잉 포워드", attack: 0.05, technique: 0.25, mobility: -0.10, defense: 0.05, physical: 0.15, mentality: 0.10, stamina: 'normal' },
		TM: { name: "타겟맨", attack: 0.10, technique: -0.15, mobility: -0.25, defense: 0.05, physical: 0.35, mentality: 0.10, stamina: 'normal' },
		F9: { name: "펄스 나인", attack: -0.05, technique: 0.30, mobility: 0.05, defense: 0, physical: -0.20, mentality: 0.25, stamina: 'high' },
		PF: { name: "압박형 포워드", attack: -0.05, technique: -0.05, mobility: 0.20, defense: 0.25, physical: 0.20, mentality: 0.15, stamina: 'very_high' },
		RD: { name: "라움도이터", attack: 0.25, technique: -0.10, mobility: -0.10, defense: -0.20, physical: -0.10, mentality: 0.35, stamina: 'low' },
		W:  { name: "윙어", attack: 0.05, technique: 0.20, mobility: 0.25, defense: -0.10, physical: -0.05, mentality: 0, stamina: 'high' },
		WP: { name: "와이드 플레이메이커", attack: 0.05, technique: 0.35, mobility: -0.10, defense: -0.10, physical: -0.10, mentality: 0.20, stamina: 'normal' },
		IW: { name: "인버티드 윙어", attack: 0.20, technique: 0.20, mobility: 0.10, defense: -0.10, physical: 0, mentality: 0.05, stamina: 'high' }
	},
	// 2. 미드필더진 (AM, CM, DM)
	midfield: {
		BBM: { name: "박스 투 박스", attack: 0.10, technique: 0.05, mobility: 0.15, defense: 0.10, physical: 0.15, mentality: 0.10, stamina: 'very_high' },
		MEZ: { name: "메짤라", attack: 0.25, technique: 0.20, mobility: 0.15, defense: -0.20, physical: -0.10, mentality: 0.05, stamina: 'very_high' },
		DLP: { name: "딥라잉 플레이메이커", attack: -0.10, technique: 0.30, mobility: -0.15, defense: 0.15, physical: 0.05, mentality: 0.25, stamina: 'low' },
		BWM: { name: "볼 위닝 미드필더", attack: -0.20, technique: -0.20, mobility: 0.15, defense: 0.35, physical: 0.25, mentality: 0.10, stamina: 'very_high' },
		AP:  { name: "전진형 플레이메이커", attack: 0.15, technique: 0.30, mobility: 0, defense: -0.25, physical: -0.15, mentality: 0.25, stamina: 'normal' },
		REG: { name: "레지스타", attack: 0.05, technique: 0.40, mobility: -0.15, defense: -0.25, physical: -0.20, mentality: 0.35, stamina: 'normal' },
		CAR: { name: "카릴레로", attack: -0.15, technique: 0.05, mobility: 0.05, defense: 0.20, physical: 0.10, mentality: 0.15, stamina: 'high' },
		EG:  { name: "엔간체", attack: 0.15, technique: 0.35, mobility: -0.60, defense: -0.30, physical: -0.20, mentality: 0.35, stamina: 'low' },
		SS:  { name: "섀도우 스트라이커", attack: 0.30, technique: 0.15, mobility: 0.15, defense: -0.25, physical: -0.05, mentality: 0.15, stamina: 'high' },
		ANC: { name: "앵커맨", attack: -0.20, technique: -0.10, mobility: -0.20, defense: 0.30, physical: 0.25, mentality: 0.25, stamina: 'low' },
		DM:  { name: "수비형 미드필더", attack: -0.10, technique: 0, mobility: 0.05, defense: 0.25, physical: 0.15, mentality: 0.10, stamina: 'high' },
		SV:  { name: "세군도 볼란테", attack: 0.15, technique: 0.10, mobility: 0.15, defense: 0.10, physical: 0.15, mentality: 0.10, stamina: 'very_high' },
		CM:  { name: "중앙 미드필더", attack: 0.05, technique: 0.10, mobility: 0.05, defense: 0.10, physical: 0.10, mentality: 0.10, stamina: 'normal' },
	},
	// 3. 수비진 (FB, WB, CB)
	defense: {
		BPD: { name: "볼 플레잉 수비수", attack: 0.05, technique: 0.25, mobility: 0, defense: 0.15, physical: 0.05, mentality: 0.20, stamina: 'normal' },
		CD:  { name: "중앙 수비수", attack: 0, technique: -0.05, mobility: 0, defense: 0.25, physical: 0.25, mentality: 0.10, stamina: 'normal' },
		NCB: { name: "안정형 수비수", attack: -0.30, technique: -0.30, mobility: -0.10, defense: 0.45, physical: 0.35, mentality: 0.15, stamina: 'low' },
		IWB: { name: "인버티드 윙백", attack: 0.05, technique: 0.25, mobility: 0.05, defense: 0.10, physical: 0, mentality: 0.20, stamina: 'high' },
		CWB: { name: "완성형 윙백", attack: 0.25, technique: 0.20, mobility: 0.20, defense: -0.20, physical: 0, mentality: 0.05, stamina: 'very_high' },
		LIB: { name: "리베로", attack: 0.15, technique: 0.30, mobility: 0.10, defense: 0.15, physical: 0, mentality: 0.25, stamina: 'high' },
		FB:  { name: "풀백", attack: -0.05, technique: 0.05, mobility: 0.10, defense: 0.20, physical: 0.10, mentality: 0.05, stamina: 'normal' },
		WB:  { name: "윙백", attack: 0.15, technique: 0.15, mobility: 0.20, defense: 0, physical: 0.05, mentality: 0.05, stamina: 'high' },
		GK:  { name: "골키퍼", attack: -0.4, technique: -0.2, mobility: -0.2, defense: 0.4, physical: 0.2, mentality: 0.2, stamina: 'low' }
	}
};

// 2. 체력(Stamina) 소모율 데이터
const StaminaConsumption = {
	low: 0.12,       // 분당 소모율 추가 하향
	normal: 0.20,
	high: 0.28,
	very_high: 0.35
};

// [신규] 체력 소모 대비 효율성 데이터 (체력을 덜 쓰면 효율이 떨어짐)
const StaminaEfficiency = {
	low: 0.9,       // [수정] 0.75 -> 0.9 (페널티 완화)
	normal: 1.0,     // 보통 -> 기준점
	high: 1.05,       // 높음 -> 효율 5% 증가 (보너스)
	very_high: 1.1   // 매우 높음 -> 효율 10% 증가 (보너스)
};

// 3. 전술 관련 로직을 관리하는 객체 (매니저)
// 이 객체는 나중에 게임의 메인 로직과 연결되어 사용됩니다.
const TacticsManager = {
    
    /**
     * 특정 역할(Role)에 대한 모든 스탯 가중치를 가져옵니다.
     * @param {string} roleKey - 역할 키 (예: 'AF', 'BBM')
     * @returns {object|null} 해당 역할의 가중치 객체 또는 null
     */
    getRoleData(roleKey) {
        for (const line in RoleData) {
            if (RoleData[line][roleKey]) {
                return RoleData[line][roleKey];
            }
        }
        console.warn(`[TacticsManager] '${roleKey}'에 해당하는 역할 데이터를 찾을 수 없습니다.`);
        return null;
    },

    /**
     * 라인별 기본 스탯과 역할을 기반으로 최종 파워를 계산합니다.
     * @param {number} baseStat - 라인의 기본 스탯 (예: 미드필더진의 기술 스탯 100)
     * @param {string} roleKey - 해당 라인에 적용된 역할 키 (예: 'REG')
     * @param {string} statType - 계산할 스탯 타입 (예: 'technique', 'attack')
     * @returns {number} 최종 계산된 파워 값
     */
    calculateFinalPower(baseStat, roleKey, statType) {
        // [신규] 밸런스 패치: 스탯 효율 체감/페널티 시스템 (몰빵 방지)
        let effectiveStat = baseStat;
        const overloadThreshold = 110; // 이 수치를 넘으면 효율 감소
        const weaknessThreshold = 40;  // 이 수치보다 낮으면 페널티 강화

        if (baseStat > overloadThreshold) {
            const excess = baseStat - overloadThreshold;
            // 110을 초과하는 스탯은 효율이 50%만 적용됨 (예: 130 -> 110 + 20*0.5 = 120)
            effectiveStat = overloadThreshold + (excess * 0.5);
        } else if (baseStat < weaknessThreshold) {
            const deficit = weaknessThreshold - baseStat;
            // 40 미만인 스탯은 페널티가 1.5배로 적용됨 (예: 20 -> 40 - 20*1.5 = 10)
            effectiveStat = weaknessThreshold - (deficit * 1.5);
        }

        const role = this.getRoleData(roleKey);
        if (!role) {
            return Math.round(effectiveStat); // 역할이 없으면 보정된 스탯 반환
        }

        // 가이드라인의 6대 스탯과 라인별 4대 핵심 스탯을 매핑합니다.
        // 'mobility'는 'speed'로 간주합니다.
        const statMap = {
            speed: 'mobility'
        };
        const mappedStatType = statMap[statType] || statType;

        // 해당 역할에 스탯 가중치가 정의되어 있는지 확인
        if (role[mappedStatType] === undefined) {
            // console.warn(`[TacticsManager] 역할 '${roleKey}'에 '${mappedStatType}'스탯 가중치가 없습니다.`);
            return Math.round(effectiveStat);
        }

        const weight = role[mappedStatType];
        
        // [수정] 효율성 반영
		// 최종 파워 계산 공식: (라인 기본 스탯 * (1 + 롤 가중치)) * 체력 효율
		const staminaKey = role.stamina || 'normal';
		const efficiency = StaminaEfficiency[staminaKey] || 1.0;

		const finalPower = effectiveStat * (1 + weight) * efficiency;
        
		return Math.round(finalPower); // 계산 결과는 정수로 반환
	},

    /**
     * 특정 역할의 체력 소모 키를 반환합니다.
     * @param {string} roleKey - 역할 키
     * @returns {string|null} 체력 소모 키 ('low', 'normal', 'high', 'very_high')
     */
    getStaminaConsumptionKey(roleKey) {
        const role = this.getRoleData(roleKey);
        return role ? role.stamina : 'normal';
    },

    /**
     * 체력 소모 키에 해당하는 분당 소모율을 반환합니다.
     * @param {string} staminaKey - 체력 소모 키
     * @returns {number} 분당 체력 소모율
     */
    getStaminaConsumptionRate(staminaKey) {
		return StaminaConsumption[staminaKey] || StaminaConsumption.normal;
    },

    /**
     * [신규] 체력 소모 키에 해당하는 효율성을 반환합니다.
     * @param {string} staminaKey - 체력 소모 키
     * @returns {number} 효율성 계수 (예: 0.85, 1.0, 1.2)
     */
    getStaminaEfficiency(staminaKey) {
		return StaminaEfficiency[staminaKey] || 1.0;
    }
};

// [신규] DNA 프리셋 데이터
const DNAPresets = {
    balanced: {
        name: "기본 전술",
        description: "모든 스탯에 균등하게 투자하여 약점이 없는 만능형입니다.",
        ratios: { attack: 1, speed: 1, technique: 1, physical: 1, defense: 1, mentality: 1 }
    },
    gegenpress: {
        name: "게겐프레싱",
        description: "강한 압박과 빠른 공수 전환을 위해 스피드와 피지컬을 강화합니다.",
        ratios: { attack: 1.05, speed: 1.1, technique: 0.9, physical: 1.1, defense: 1.0, mentality: 0.95 }
    },
    twoLine: {
        name: "다이렉트 축구",
        description: "직선적인 공격을 위해 스피드와 피지컬에 집중합니다.",
        ratios: { attack: 1.1, speed: 1.1, technique: 0.85, physical: 1.1, defense: 0.9, mentality: 0.95 }
    },
    lavolpiana: {
        name: "라볼피아나",
        description: "후방 빌드업과 측면 전개를 위해 기술과 스피드를 높입니다.",
        ratios: { attack: 1.0, speed: 1.05, technique: 1.15, physical: 0.85, defense: 0.9, mentality: 1.05 }
    },
    longBall: {
        name: "롱볼 축구",
        description: "공중볼 경합과 탄탄한 수비를 위해 피지컬과 수비력을 극대화합니다.",
        ratios: { attack: 0.9, speed: 0.9, technique: 0.8, physical: 1.15, defense: 1.15, mentality: 0.9 }
    },
    possession: {
        name: "점유율 축구",
        description: "공을 오래 소유하기 위해 기술과 정신력에 집중합니다.",
        ratios: { attack: 0.95, speed: 0.85, technique: 1.15, physical: 0.9, defense: 1.0, mentality: 1.15 }
    },
    parkBus: {
        name: "역습 축구",
        description: "극단적인 수비벽을 세우고 역습 한 방을 노리기 위해 수비와 스피드를 올립니다.",
        ratios: { attack: 0.85, speed: 1.1, technique: 0.8, physical: 1.05, defense: 1.25, mentality: 0.9 }
    },
    catenaccio: {
        name: "카테나치오",
        description: "대인 방어 기반의 끈적한 수비를 위해 정신력과 수비력을 강화합니다.",
        ratios: { attack: 0.8, speed: 0.9, technique: 0.85, physical: 1.1, defense: 1.2, mentality: 1.15 }
    },
    totalFootball: {
        name: "토탈 풋볼",
        description: "전원 공격 전원 수비를 위해 기술, 정신력, 스피드를 두루 올립니다.",
        ratios: { attack: 1.05, speed: 1.05, technique: 1.1, physical: 0.85, defense: 0.95, mentality: 1.1 }
    },
    tikitaka: {
        name: "티키타카",
        description: "짧은 패스 위주의 점유율 축구를 위해 기술과 정신력을 극대화합니다.",
        ratios: { attack: 0.95, speed: 0.9, technique: 1.2, physical: 0.8, defense: 0.95, mentality: 1.1 }
    }
};


// 4. DNA (라인별 스탯) 관리자
const DNAManager = {
    charts: {}, // 차트 인스턴스 저장용

    // 라인별 기본 스탯 정의 (한글 표시명 매핑 - 12시 공격부터 시계방향 통일)
    statDefinitions: {
        attack: {
            attack: "공격",
            speed: "스피드",
            technique: "기술",
            physical: "피지컬",
            defense: "수비",
            mentality: "정신력"
        },
        midfield: {
            attack: "공격",
            speed: "스피드",
            technique: "기술",
            physical: "피지컬",
            defense: "수비",
            mentality: "정신력"
        },
        defense: {
            attack: "공격",
            speed: "스피드",
            technique: "기술",
            physical: "피지컬",
            defense: "수비",
            mentality: "정신력"
        }
    },

    // [수정] 팀 선택 시 초기화 (베스트 11 기반)
    initialize(teamPlayers) {
        console.log('[DNAManager] initialize() called.');
        if (!gameData.lineStats) {
            gameData.lineStats = {
                attack: { ovr: 0, totalPoints: 0, usedPoints: 0, stats: { attack: 0, speed: 0, technique: 0, physical: 0, defense: 0, mentality: 0 }, stamina: 100, lastUpdate: 0 },
                midfield: { ovr: 0, totalPoints: 0, usedPoints: 0, stats: { attack: 0, speed: 0, technique: 0, physical: 0, defense: 0, mentality: 0 }, stamina: 100, lastUpdate: 0 },
                defense: { ovr: 0, totalPoints: 0, usedPoints: 0, stats: { attack: 0, speed: 0, technique: 0, physical: 0, defense: 0, mentality: 0 }, stamina: 100, lastUpdate: 0 }
            };
        }

        this.recalculateLineOVRs(teamPlayers);

        // 3. 초기 스탯 자동 분배 (균등하게) - 이미 분배된 적이 없으면 실행
        if (gameData.lineStats.attack.usedPoints === 0) this.autoDistribute('attack');
        if (gameData.lineStats.midfield.usedPoints === 0) this.autoDistribute('midfield');
        if (gameData.lineStats.defense.usedPoints === 0) this.autoDistribute('defense');
    },

    // [신규] 라인별 OVR 재계산 (베스트 11 기준)
    recalculateLineOVRs(teamPlayers) {
        // [수정] 현재 스쿼드(gameData.squad)가 있으면 그것을 기준으로 계산
        if (gameData.squad) {
            const fws = gameData.squad.fw.filter(p => p);
            const mfs = gameData.squad.mf.filter(p => p);
            const dfs = gameData.squad.df.filter(p => p);
            const gks = gameData.squad.gk ? [gameData.squad.gk] : [];

            // 스쿼드에 선수가 배치되어 있다면 스쿼드 기준 계산
            if (fws.length + mfs.length + dfs.length + gks.length > 0) {
                const calcAvg = (players) => players.length > 0 ? Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length) : 0;

                this.setLinePoints('attack', calcAvg(fws));
                this.setLinePoints('midfield', calcAvg(mfs));
                this.setLinePoints('defense', calcAvg([...dfs, ...gks]));
                
                console.log('[DNAManager] DNA 포인트 재계산 완료 (현재 스쿼드 기준)');
                return;
            }
        }

        // 스쿼드가 비어있을 경우(초기화 전 등) 기존 로직(전체 선수 중 베스트) 사용
        if (!teamPlayers) teamPlayers = teams[gameData.selectedTeam];
        if (!teamPlayers) return;

        // 포지션별 상위 선수 추출 (베스트 11 기준: FW 3, MF 3, DF 4, GK 1)
        const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating).slice(0, 3);
        const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating).slice(0, 3);
        const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating).slice(0, 4);
        const gks = teamPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating).slice(0, 1);

        const fwPlayers = fws;
        const mfPlayers = mfs;
        const dfPlayers = [...dfs, ...gks]; // 수비진은 DF + GK 평균

        const calcAvg = (players) => players.length > 0 ? Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length) : 70;

        const attackOVR = calcAvg(fwPlayers);
        const midfieldOVR = calcAvg(mfPlayers);
        const defenseOVR = calcAvg(dfPlayers);

        // 총 포인트 설정 (OVR * 4)
        this.setLinePoints('attack', attackOVR);
        this.setLinePoints('midfield', midfieldOVR);
        this.setLinePoints('defense', defenseOVR);
    },

    setLinePoints(line, ovr) {
        gameData.lineStats[line].ovr = ovr;
        // [수정] 6개 스탯 기준으로 총 포인트 변경 (OVR * 6)
        gameData.lineStats[line].totalPoints = ovr * 6;
    },

    // 포인트를 균등하게 자동 분배 (초기화용)
    autoDistribute(line) {
        const lineData = gameData.lineStats[line];
        const total = lineData.totalPoints;
        const statKeys = Object.keys(lineData.stats); // 6개 스탯 키
        const baseValue = Math.floor(total / statKeys.length);
        let remainder = total % statKeys.length;

        statKeys.forEach(key => {
            lineData.stats[key] = baseValue;
            if (remainder > 0) {
                lineData.stats[key]++;
                remainder--;
            }
        });
        lineData.usedPoints = total;
    },

    // [수정] 스탯 변경 (UI에서 호출) - 밸런스 제한 추가
    updateStat(line, statKey, change) {
        const lineData = gameData.lineStats[line];
        const currentVal = lineData.stats[statKey];
        const newTotalUsed = lineData.usedPoints + change;

        // 유효성 검사
        if (currentVal + change < 0) return false; // 0 미만 불가
        if (newTotalUsed > lineData.totalPoints) {
            alert(`총 포인트(${lineData.totalPoints})를 초과할 수 없습니다.`);
            return false;
        }

        // [추가] 밸런스 붕괴 방지 (최소/최대 제한)
        // [수정] 최소값: 평균(OVR)에서 30포인트 이상 낮출 수 없음
        const minLimit = Math.max(0, lineData.ovr - 30);
        if (currentVal + change < minLimit) {
            alert(`특정 스탯을 평균(${lineData.ovr})보다 30포인트 이상 낮게 설정할 수 없습니다. (최소 ${minLimit})`);
            return false;
        }
        // 최대값: 평균(OVR)의 170% 초과할 수 없음
        const maxLimit = Math.ceil(lineData.ovr * 1.7);
        if (currentVal + change > maxLimit) {
            alert(`특정 스탯을 너무 높게 설정할 수 없습니다. (최대 ${maxLimit})`);
            return false;
        }

        // 값 적용
        lineData.stats[statKey] += change;
        lineData.usedPoints += change;
        return true;
    },

    // [신규] 프리셋 적용 함수
    applyPreset(line, presetKey) {
        const preset = DNAPresets[presetKey];
        if (!preset) return;

        const lineData = gameData.lineStats[line];
        const totalPoints = lineData.totalPoints;
        const ratios = preset.ratios;

        // 비율 총합 계산
        const totalRatio = Object.values(ratios).reduce((sum, ratio) => sum + ratio, 0);

        let distributedPoints = 0;
        const statKeys = Object.keys(lineData.stats);

        // 비율에 따라 포인트 분배
        statKeys.forEach(key => {
            const points = Math.round((totalPoints * ratios[key]) / totalRatio);
            lineData.stats[key] = points;
            distributedPoints += points;
        });

        // 반올림 오차 보정 (가장 높은 비율의 스탯에 나머지 추가)
        const remainder = totalPoints - distributedPoints;
        const mainStat = Object.keys(ratios).reduce((a, b) => ratios[a] > ratios[b] ? a : b);
        lineData.stats[mainStat] += remainder;
        lineData.usedPoints = totalPoints;
    },

    // UI 렌더링
    renderUI() {
        console.log('[DNAManager] renderUI() called.');
        const container = document.getElementById('tacticsContent');
        if (!container) {
            console.error('Error: #tacticsContent element not found!');
            return;
        }

        // [수정] 스크롤 위치 저장 (UI 갱신 시 스크롤 초기화 방지)
        const scrollPos = container.scrollTop;
        const parentScrollPos = container.parentElement ? container.parentElement.scrollTop : 0;

        // 데이터 유효성 검사 추가
        if (!gameData || !gameData.lineStats) {
            container.replaceChildren();
            const errP = document.createElement('p');
            errP.style.cssText = 'color: #EF4444; text-align: center; padding: 20px;';
            errP.textContent = '팀 DNA 데이터가 초기화되지 않았습니다. 팀 선택 화면으로 돌아가 다시 팀을 선택해주세요.';
            container.appendChild(errP);
            console.error('Error: gameData.lineStats is not initialized. Cannot render DNA UI.');
            return;
        }

        container.replaceChildren();

        // ─────────────────────────────────────────────────────────────
        // [신규] 6대 코어 전술 컨트롤 보드 (Modern Tactical Board)
        // ─────────────────────────────────────────────────────────────
        if (!gameData.tacticSettings) {
            const curTactic = gameData.currentTactic || 'balanced';
            gameData.tacticSettings = (typeof getDefaultTacticSettings === 'function')
                ? getDefaultTacticSettings(curTactic)
                : { buildUp: 'short', defensiveLine: 'mid', pressIntensity: 'balanced', offensiveTrans: 'counter', defensiveTrans: 'regroup', passLength: 'mixed', tempo: 'standard', width: 'standard' };
        }
        const ts = gameData.tacticSettings;

        const boardCard = document.createElement('div');
        boardCard.className = 'tactical-board-card';
        boardCard.style.cssText = 'background: linear-gradient(180deg, #161F30 0%, #0F172A 100%); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 20px; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);';

        const boardHeader = document.createElement('div');
        boardHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;';

        const bTitle = document.createElement('h3');
        bTitle.style.cssText = 'margin: 0; color: #F8FAFC; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px;';
        if (typeof window.createIcon === 'function') bTitle.appendChild(window.createIcon('clipboard'));
        bTitle.appendChild(document.createTextNode('감독 6대 코어 전술 설정'));

        // 프리셋 간편 선택 셀렉트
        const presetWrap = document.createElement('div');
        presetWrap.style.cssText = 'display: flex; align-items: center; gap: 8px;';
        const presetLabel = document.createElement('span');
        presetLabel.style.cssText = 'font-size: 0.8rem; color: #94A3B8;';
        presetLabel.textContent = '기본 프리셋:';
        const tacticSelect = document.createElement('select');
        tacticSelect.id = 'dnaTacticSelect';
        tacticSelect.style.cssText = 'padding: 6px 12px; background: #0B1120; color: #F8FAFC; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-size: 0.82rem; font-weight: 700; cursor: pointer;';

        const tacticSystem = new TacticSystem();
        const allTactics = tacticSystem.getAllTactics();
        allTactics.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.key;
            opt.textContent = t.name;
            if (gameData.currentTactic === t.key) opt.selected = true;
            tacticSelect.appendChild(opt);
        });

        tacticSelect.addEventListener('change', function() {
            gameData.currentTactic = this.value;
            if (typeof getDefaultTacticSettings === 'function') {
                gameData.tacticSettings = getDefaultTacticSettings(this.value);
            }
            if (typeof window.triggerAutoSave === 'function') window.triggerAutoSave();
            DNAManager.renderUI();
        });

        presetWrap.append(presetLabel, tacticSelect);
        boardHeader.append(bTitle, presetWrap);
        boardCard.appendChild(boardHeader);

        // 6대 전술 버튼 그리드
        const tacticFields = [
            {
                key: 'buildUp',
                title: '1. 빌드업 구조',
                desc: '후방에서 공격 진영으로 볼을 전개하는 방식',
                options: [
                    { value: 'short', label: '숏패스 빌드업', tip: '골키퍼/센터백부터 차근차근 짧은 패스로 전개' },
                    { value: 'back3', label: '변형 3백 (라볼피아나)', tip: '수미가 CB 사이로 내려와 수적 우위로 안정적 탈압박' },
                    { value: 'direct', label: '다이렉트 롱볼', tip: '상대 중원 압박을 우회하여 전방 윙어/타겟맨으로 즉시 롱킥' }
                ]
            },
            {
                key: 'defensiveLine',
                title: '2. 수비 라인',
                desc: '수비 블록을 형성하는 필드 위의 높이',
                options: [
                    { value: 'high', label: '하이 라인', tip: '하프라인까지 라인을 올려 상대 진영에서 전방 압박' },
                    { value: 'mid', label: '미들 블록', tip: '중앙선 부근에서 공수 밸런스를 잡고 패스 길 차단' },
                    { value: 'low', label: '로우 블록 (텐백)', tip: '페널티 박스 앞까지 내려앉아 밀집 수비 구축' }
                ]
            },
            {
                key: 'pressIntensity',
                title: '3. 압박 강도',
                desc: '상대 선수가 공을 잡았을 때 포위 및 경합 강도',
                options: [
                    { value: 'cautious', label: '거리 유지', tip: '무리한 돌진을 자제하고 패스 각도 차단 (체력 안배)' },
                    { value: 'balanced', label: '균형', tip: '적절한 거리에서 협력 수비 진행' },
                    { value: 'aggressive', label: '맹렬한 압박', tip: '볼 소유자에게 2~3명이 즉각 달려들어 탈취 시도 (체력 소모↑)' }
                ]
            },
            {
                key: 'offensiveTrans',
                title: '4. 공격 전환 (볼 탈취 시)',
                desc: '공을 빼앗은 직후 첫 5초간의 행동',
                options: [
                    { value: 'counter', label: '즉시 역습', tip: '볼 탈취 즉시 공격수와 윙어가 전방 뒷공간으로 스프린트 침투' },
                    { value: 'hold', label: '소유권 유지/지공', tip: '서두르지 않고 안전하게 공을 돌리며 전열 재정비' }
                ]
            },
            {
                key: 'defensiveTrans',
                title: '5. 수비 전환 (볼 상실 시)',
                desc: '공을 빼앗긴 직후 첫 5초간의 행동',
                options: [
                    { value: 'counterpress', label: '즉시 재압박', tip: '뺏긴 지점 주변 선수들이 즉각 달라붙어 5초 내 재탈취 시도' },
                    { value: 'regroup', label: '진형 복귀', tip: '무리한 압박 없이 전원 신속하게 자기 수비 블록으로 후퇴' }
                ]
            },
            {
                key: 'passLength',
                title: '6. 패스 길이',
                desc: '팀의 패스 평균 거리 및 궤적',
                options: [
                    { value: 'short', label: '짧게', tip: '안전한 10~15m 짧은 연결 위주 (티키타카형)' },
                    { value: 'mixed', label: '혼합', tip: '상황에 맞춰 숏패스와 전진패스 혼용' },
                    { value: 'direct', label: '다이렉트', tip: '전방 공간을 찌르는 롱 스루패스 및 반대 전환 롱패스' }
                ]
            },
            {
                key: 'tempo',
                title: '7. 전개 템포',
                desc: '볼을 잡았을 때 처리 속도',
                options: [
                    { value: 'slow', label: '느리게 (지공)', tip: '상대 수비 빈틈이 열릴 때까지 여유롭게 볼 소유' },
                    { value: 'standard', label: '보통', tip: '상황에 맞춘 유연한 속도 조절' },
                    { value: 'fast', label: '빠르게 (속공)', tip: '원터치/투터치 위주의 번개 같은 빠른 전개' }
                ]
            },
            {
                key: 'width',
                title: '8. 팀 너비',
                desc: '공격 시 좌우 공간 활용 폭',
                options: [
                    { value: 'narrow', label: '좁게 (중앙 집약)', tip: '하프스페이스와 중앙에 밀집하여 수적 우위 확보' },
                    { value: 'standard', label: '보통', tip: '공수 균형 잡힌 간격 유지' },
                    { value: 'wide', label: '넓게 (측면 우회)', tip: '윙어/풀백이 터치라인까지 벌려서 상대 중원 압박을 우회' }
                ]
            }
        ];

        const gridDiv = document.createElement('div');
        gridDiv.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 18px;';

        tacticFields.forEach(f => {
            const fCard = document.createElement('div');
            fCard.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px;';

            const fHead = document.createElement('div');
            fHead.style.cssText = 'margin-bottom: 8px;';
            const fName = document.createElement('div');
            fName.style.cssText = 'font-size: 0.86rem; font-weight: 700; color: #E2E8F0; margin-bottom: 2px;';
            fName.textContent = f.title;
            const fDesc = document.createElement('div');
            fDesc.style.cssText = 'font-size: 0.72rem; color: #64748B;';
            fDesc.textContent = f.desc;
            fHead.append(fName, fDesc);

            const btnGroup = document.createElement('div');
            btnGroup.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap;';

            f.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.type = 'button';
                const isSelected = ts[f.key] === opt.value;
                btn.style.cssText = `flex: 1; min-width: 75px; padding: 7px 8px; font-size: 0.76rem; font-weight: 700; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; border: 1px solid ${isSelected ? '#38BDF8' : 'rgba(255,255,255,0.1)'}; background: ${isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)'}; color: ${isSelected ? '#38BDF8' : '#94A3B8'}; text-align: center;`;
                btn.textContent = opt.label;
                btn.title = opt.tip;

                btn.addEventListener('click', () => {
                    ts[f.key] = opt.value;
                    if (typeof migrateDeepTactics === 'function') migrateDeepTactics();
                    if (typeof window.triggerAutoSave === 'function') window.triggerAutoSave();
                    DNAManager.renderUI();
                });
                btnGroup.appendChild(btn);
            });

            fCard.append(fHead, btnGroup);
            gridDiv.appendChild(fCard);
        });

        boardCard.appendChild(gridDiv);

        // 인과관계 전술 팁 & 스쿼드 분석 배너
        const guideBanner = document.createElement('div');
        guideBanner.style.cssText = 'background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 12px 16px; display: flex; gap: 12px; align-items: flex-start;';

        const guideIcon = document.createElement('span');
        guideIcon.style.cssText = 'color: #38BDF8; font-size: 1.2rem; flex-shrink: 0;';
        guideIcon.textContent = '💡';

        const guideContent = document.createElement('div');
        const gTitle = document.createElement('div');
        gTitle.style.cssText = 'font-weight: 800; color: #38BDF8; font-size: 0.84rem; margin-bottom: 4px;';
        gTitle.textContent = '인과관계 전술 가이드:';

        const gText = document.createElement('div');
        gText.style.cssText = 'font-size: 0.78rem; color: #CBD5E1; line-height: 1.45;';

        // 현재 설정에 따른 실시간 분석
        let tipText = '';
        if (ts.buildUp === 'direct' && ts.width === 'wide') {
            tipText = '【중원 우회 & 측면 공략】 상대 중원이 우리보다 강하더라도, 중앙을 건너뛰고 측면 윙어에게 다이렉트 롱볼을 보내 상대 미드필더의 압박을 무력화합니다. 측면에서 풀백-윙어의 3자 패스로 박스를 허물어 득점 찬스를 창출합니다!';
        } else if (ts.defensiveLine === 'low' && ts.offensiveTrans === 'counter') {
            tipText = '【텐백 로우블록 & 번개 역습】 페널티 박스 앞을 두텁게 잠그고, 볼 탈취 즉시 발 빠른 윙어와 포처가 뒷공간으로 스프린트하여 1:1 찬스를 노립니다.';
        } else if (ts.buildUp === 'short' && ts.width === 'narrow' && ts.passLength === 'short') {
            tipText = '【중앙 티키타카】 중앙에 수적 우위를 두고 짧은 패스로 썰어 들어갑니다. 상대 중원이 약할 때는 완벽한 지배가 가능하지만, 상대 중원이 강할 경우 중앙 턴오버에 유의하세요!';
        } else {
            tipText = '선수들의 포지션별 롤(Role)과 세부 스탯(속도, 패스, 피지컬 등)에 맞춰 6대 전술을 세팅하세요. 약팀도 전술적 인과관계에 따라 강팀의 약점을 찔러 승리할 수 있습니다!';
        }
        gText.textContent = tipText;

        guideContent.append(gTitle, gText);
        guideBanner.append(guideIcon, guideContent);
        boardCard.appendChild(guideBanner);

        container.appendChild(boardCard);

        // [신규] DNA 프리셋 선택 UI
        const presetContainer = document.createElement('div');
        presetContainer.className = 'dna-preset-container';
        presetContainer.style.cssText = 'background: #111827; padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px;';

        const presetTitle = document.createElement('h4');
        presetTitle.style.cssText = 'color: #F8FAFC; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; font-weight: 800; letter-spacing: -0.03em;';
        if (typeof window.createIcon === 'function') {
            presetTitle.appendChild(window.createIcon('lightbulb'));
        }
        presetTitle.appendChild(document.createTextNode('추천 DNA 분배 (프리셋)'));

        const presetBtnRow = document.createElement('div');
        presetBtnRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 10px;';

        for (const [key, preset] of Object.entries(DNAPresets)) {
            const pBtn = document.createElement('button');
            pBtn.className = 'btn btn-sm';
            pBtn.title = preset.description;
            pBtn.textContent = preset.name;
            pBtn.addEventListener('click', () => DNAManager.handlePresetApply(key));
            presetBtnRow.appendChild(pBtn);
        }

        const presetDesc = document.createElement('p');
        presetDesc.style.cssText = 'font-size: 0.8rem; color: #aaa; margin-top: 10px;';
        presetDesc.textContent = '* 프리셋을 적용하면 모든 라인(공격/미드/수비)의 포인트가 해당 컨셉에 맞게 재분배됩니다.';

        presetContainer.append(presetTitle, presetBtnRow, presetDesc);
        container.appendChild(presetContainer);

        ['attack', 'midfield', 'defense'].forEach(line => {
            const lineData = gameData.lineStats[line];
            if (!lineData) {
                console.error(`Error: gameData.lineStats for '${line}'is missing.`);
                return;
            }
            const definitions = this.statDefinitions[line];
            const lineName = line === 'attack' ? '공격진 (FW)' : line === 'midfield' ? '미드필더진 (MF)' : '수비진 (DF/GK)';
            
            const section = document.createElement('div');
            section.className = 'dna-section';

            const header = document.createElement('div');
            header.className = 'dna-header';

            const h4 = document.createElement('h4');
            h4.style.marginBottom = '5px';
            h4.textContent = `${lineName} - OVR: ${lineData.ovr}`;

            const pointsDiv = document.createElement('div');
            pointsDiv.className = 'dna-points';
            const usedSpan = document.createElement('span');
            usedSpan.className = lineData.usedPoints === lineData.totalPoints ? 'text-green' : 'text-red';
            usedSpan.textContent = lineData.usedPoints;
            pointsDiv.append(document.createTextNode('사용 포인트: '), usedSpan, document.createTextNode(` / ${lineData.totalPoints}`));

            header.append(h4, pointsDiv);

            const body = document.createElement('div');
            body.className = 'dna-body';

            const chartContainer = document.createElement('div');
            chartContainer.className = 'dna-chart-container';
            const canvas = document.createElement('canvas');
            canvas.id = `chart-${line}`;
            chartContainer.appendChild(canvas);

            const grid = document.createElement('div');
            grid.className = 'dna-stats-grid';

            Object.keys(definitions).forEach(statKey => {
                const statName = definitions[statKey];
                const statValue = lineData.stats[statKey];

                const row = document.createElement('div');
                row.className = 'dna-stat-row';

                const label = document.createElement('div');
                label.className = 'stat-label';
                label.textContent = statName;

                const controls = document.createElement('div');
                controls.className = 'stat-controls';

                [-10, -1].forEach(delta => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-control';
                    btn.textContent = `${delta}`;
                    btn.addEventListener('click', () => DNAManager.handleUpdate(line, statKey, delta));
                    controls.appendChild(btn);
                });

                const valSpan = document.createElement('span');
                valSpan.className = 'stat-value';
                valSpan.textContent = statValue;
                controls.appendChild(valSpan);

                [1, 10].forEach(delta => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-control';
                    btn.textContent = `+${delta}`;
                    btn.addEventListener('click', () => DNAManager.handleUpdate(line, statKey, delta));
                    controls.appendChild(btn);
                });

                row.append(label, controls);
                grid.appendChild(row);
            });

            body.append(chartContainer, grid);
            section.append(header, body);
            container.appendChild(section);

            // DOM에 추가 후 차트 생성
            this.createOrUpdateChart(line);
        });

        // [수정] 스크롤 위치 복원
        if (scrollPos > 0) container.scrollTop = scrollPos;
        if (parentScrollPos > 0 && container.parentElement) container.parentElement.scrollTop = parentScrollPos;
    },

    createOrUpdateChart(line) {
        const lineData = gameData.lineStats[line];
        const ctx = document.getElementById(`chart-${line}`);
        if (!ctx) return;

        const labels = Object.values(this.statDefinitions[line]);
        const data = Object.keys(this.statDefinitions[line]).map(statKey => lineData.stats[statKey]);

        // 기존 차트가 있으면 파괴
        if (this.charts[line]) {
            this.charts[line].destroy();
        }

        this.charts[line] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: '스탯 분포',
                    data: data,
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderColor: '#38BDF8',
                    borderWidth: 2,
                    pointBackgroundColor: '#38BDF8',
                    pointBorderColor: '#F8FAFC',
                    pointHoverBackgroundColor: '#F8FAFC',
                    pointHoverBorderColor: '#38BDF8'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        startAngle: 0,
                        angleLines: { color: 'rgba(255, 255, 255, 0.12)' },
                        grid: { color: 'rgba(255, 255, 255, 0.12)' },
                        pointLabels: {
                            color: '#F8FAFC',
                            font: { family: "'Pretendard Variable', Pretendard, sans-serif", size: 12, weight: '700' }
                        },
                        ticks: {
                            color: '#94A3B8',
                            backdropColor: 'rgba(9, 13, 22, 0.6)',
                            stepSize: 25,
                            display: false
                        },
                        suggestedMin: 0
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    handleUpdate(line, statKey, change) {
        if (this.updateStat(line, statKey, change)) {
            this.renderUI(); // 성공 시 UI 갱신
            // [추가] 스탯 변경 시 자동 저장 트리거
            if (typeof window.triggerAutoSave === 'function') {
                window.triggerAutoSave();
            }
        }
    },

    // [신규] 프리셋 적용 핸들러
    handlePresetApply(presetKey) {
        if (confirm(`'${DNAPresets[presetKey].name}'프리셋을 모든 라인에 적용하시겠습니까?\n기존에 설정한 포인트는 초기화됩니다.`)) {
            ['attack', 'midfield', 'defense'].forEach(line => {
                this.applyPreset(line, presetKey);
            });

            // [추가] 프리셋 적용 시 메인 전술 드롭다운도 자동으로 동기화 (사용자 편의성)
            const tacticMapping = { 'parkTheBus': 'parkBus', 'direct': 'twoLine' };
            const mappedTactic = tacticMapping[presetKey] || presetKey;
            
            const ts = new TacticSystem();
            if (ts.tactics[mappedTactic]) {
                gameData.currentTactic = mappedTactic;
            }

            this.renderUI(); // UI 전체 새로고침 (차트 및 수치 반영)
            
            // [추가] 변경 사항 즉시 저장
            if (typeof window.triggerAutoSave === 'function') {
                window.triggerAutoSave();
            }
        }
    },

    // [추가] 역할 설명 텍스트 생성
    getRoleDescription(line, roleKey) {
        const role = RoleData[line][roleKey];
        if (!role) return '';

        const displayNames = {
            attack: "공격",
            technique: "기술",
            mobility: "스피드",
            defense: "수비",
            physical: "피지컬",
            mentality: "정신력"
        };

        const bonuses = [];
        for (const [key, value] of Object.entries(role)) {
            if (typeof value === 'number' && value !== 0 && displayNames[key]) {
                const sign = value > 0 ? '+' : '';
                bonuses.push(`${displayNames[key]} ${sign}${Math.round(value * 100)}%`);
            }
        }
        return bonuses.join(', ');
    }
};

// 이 파일을 다른 스크립트에서 사용할 수 있도록 전역으로 노출 (필요 시)
window.RoleData = RoleData;
window.TacticsManager = TacticsManager;
window.DNAManager = DNAManager;