// playerGrowth.js
// 선수 성장 시스템 구현

class PlayerGrowthSystem {
    constructor() {
        this.growthData = new Map(); // 선수별 성장 데이터 저장
    }

    // 게임 시작 시 25세 이하 선수들에게 성장 가능성 부여
    initializePlayerGrowth() {
        if (!gameData.selectedTeam) return;

        const teamPlayers = teams[gameData.selectedTeam];
        
        teamPlayers.forEach(player => {
            if (player.age <= 25 && !this.growthData.has(player.name)) {
                const growthPotential = this.calculateGrowthPotential(player);
                
                // [수정] 성장 속도 둔화: 12개월 -> 36개월 (3년) 기준으로 변경
                // 월별 성장을 최소 0.05 이상으로 보장 (기존 0.34에서 대폭 하향)
                let monthlyGrowth = Math.max(0.2, growthPotential / 13); 
                
                // 성장 기간 계산 (총 성장량 / 월별 성장)
                const monthsToGrow = Math.ceil(growthPotential / monthlyGrowth);
                
                this.growthData.set(player.name, {
                    currentRating: player.rating, // 소수점 유지
                    maxGrowth: growthPotential,
                    remainingGrowth: growthPotential,
                    monthsToGrow: monthsToGrow,
                    monthlyGrowth: monthlyGrowth,
                    lastGrowthCheck: Date.now()
                });

                console.log(`${player.name}: 성장 가능성 ${Math.round(growthPotential)}, 월별 성장 ${monthlyGrowth.toFixed(2)}, 성장 기간 ${monthsToGrow}개월`);
            }
        });
    }

    // 성장 가능성 계산 (3-15 사이의 랜덤 값)
    calculateGrowthPotential(player) {
        // [사용자 설정] 고정 포텐셜 명단 (이름: 목표 오버롤)
        // 여기에 원하는 선수를 "이름": 오버롤 형식으로 추가하세요.
        const fixedPotentials = {
            "오현규": 94,
            "김민수": 98,
            "배준호": 93,
            "프란치스코 카마르다": 99,
            "제라르 마르틴": 90,
            "마르크 베르날": 91,
            "루니 바르다그지": 89,
            "파우 쿠바르시": 100,
            "엔드릭": 92,
            "리코 루이스": 89,
            "코비 마이누": 95,
            "아론 바우만": 98,
            "요르디 무키오": 90,
            "부바 상가레": 97,
            "루카 부슈코비치": 100,
            "에단 은와네리": 93,
            "조시 아체암퐁": 92,
            "맥스 다우먼": 99,
            "리오 응구모하": 94,
            "레나르트 칼": 99,
            "배승균": 95,
            "윤도영": 94,
            "강상윤": 99,
            "디스 얀서": 88
            // 추후 추가할것.
        };

        if (fixedPotentials.hasOwnProperty(player.name)) {
            const targetRating = fixedPotentials[player.name];
            const growthNeeded = Math.max(0, targetRating - player.rating);
            console.log(`🔒 ${player.name}: 고정 포텐셜 적용 (목표: ${targetRating}, 필요 성장: ${growthNeeded.toFixed(1)})`);
            return growthNeeded;
        }

        const baseGrowth = 3 + Math.random() * 10; // 3-13 사이
        
        // 나이에 따른 보정
        let ageModifier = 1;
        if (player.age <= 18) {
            ageModifier = 1.5; // 18세 이하는 50% 더 성장
        } else if (player.age <= 21) {
            ageModifier = 1.3; // 21세 이하는 30% 더 성장
        } else if (player.age <= 23) {
            ageModifier = 1.1; // 23세 이하는 10% 더 성장
        }
        else if (player.age <= 25) {
            ageModifier = 0.8; // 25세 이하는 -20% 더 성장
        }
        // 현재 능력치에 따른 보정 (낮은 능력치는 성장 여지가 더 많음)
        let ratingModifier = 1;
        const currentRating = Math.round(player.rating); // 반올림된 능력치로 계산
        if (currentRating < 70) {
            ratingModifier = 1.7;
        } else if (currentRating < 80) {
            ratingModifier = 1.4;
        } else if (currentRating >= 90) {
            ratingModifier = 0.8; // 이미 높은 선수는 성장 제한
        }

        // 세륜중학교 특별 보너스 (1.5배 ~ 2.5배)
         let teamModifier = 1;
         if (gameData.selectedTeam === 'seryu3') {
             teamModifier = 1.5 + Math.random() * 1.0; // 1.5 ~ 2.5배
             console.log(`세륜중학교 ${player.name}에게 특별 성장 보너스 적용: x${teamModifier.toFixed(2)}`);
         }


        // [추가] 아이콘 선수 특별 보너스 (전설적인 잠재력)
        if (player.isIcon) {
            teamModifier = 1.5; // 1.5배 성장
            console.log(`⭐ 아이콘 ${player.name}에게 전설적인 성장 보너스 적용`);
        }   

        // [추가] 커스텀 선수 특별 보너스 (105까지 성장 가능하도록 잠재력 대폭 부여)
        if (player.isCustom) {
            teamModifier = 2; // 2배 성장
            console.log(`🛠️ 커스텀 ${player.name}에게 한계 돌파 성장 보너스 적용`);
        }

        const finalGrowth = Math.round(baseGrowth * ageModifier * ratingModifier * teamModifier);
        
        // 세륜중학교 선수들은 최소 성장 보장
        if (gameData.selectedTeam === 'seryu3') {
            return Math.max(finalGrowth, 15); // 최소 15 성장 보장
         }

        // [추가] 아이콘 선수는 최소 18 성장 보장 (99 찍을 수 있게)
        if (player.isIcon) {
            return Math.max(finalGrowth, 16);
        }

        // [추가] 커스텀 선수는 105까지 크기 위해 충분한 잠재력 부여
        if (player.isCustom) {
            // 현재 오버롤에서 98까지의 차이만큼은 최소한 보장 + 랜덤 알파
            const gap = 98 - player.rating;
            return Math.max(finalGrowth, gap + Math.random() * 5);
        }

        return finalGrowth;
    }

    // 선수 성장 처리 (매월 또는 경기마다 호출)
    processPlayerGrowth() {
        if (!gameData.selectedTeam) return;

        const teamPlayers = teams[gameData.selectedTeam];
        let growthOccurred = false;

        teamPlayers.forEach(player => {
            if (this.growthData.has(player.name)) {
                const growthInfo = this.growthData.get(player.name);
                
                // 성장 조건 확인
                if (this.shouldPlayerGrow(player, growthInfo)) {
                    const growthAmount = this.calculateGrowthAmount(player, growthInfo);
                    
                    if (growthAmount > 0) {
                        this.applyGrowth(player, growthAmount, growthInfo);
                        growthOccurred = true;
                    }
                }
            }
        });

        if (growthOccurred) {
            this.updateSquadDisplay();
        }
    }

    // 성장 조건 확인
    shouldPlayerGrow(player, growthInfo) {
        // 아직 성장 여지가 있는 경우에만
        if (growthInfo.remainingGrowth <= 0) {
            return false;
        }

        // 세륜중학교는 더 자주 성장 (3경기마다)
        if (gameData.selectedTeam === 'seryu3') {
            return gameData.matchesPlayed > 0 && gameData.matchesPlayed % 3 === 0;
        }

        // 일반 팀은 5경기마다 성장 체크
        return gameData.matchesPlayed > 0 && gameData.matchesPlayed % 5   === 0;
    }

    // 성장량 계산
    calculateGrowthAmount(player, growthInfo) {
        // [수정] 기본 월별 성장량 (최소 0.05 보장)
        let baseGrowth = Math.max(0.2, growthInfo.monthlyGrowth);

        // 팀 사기에 따른 보정
        const moraleModifier = gameData.teamMorale / 100;
        baseGrowth *= moraleModifier;

        // 경기 출전에 따른 보정 (스쿼드에 포함된 선수는 더 빨리 성장)
        if (this.isPlayerInSquad(player)) {
            baseGrowth *= 1.3; // [수정] 2.0배 -> 1.3배로 하향 조정
        }

        // 세륜중학교 추가 성장 보너스
        if (gameData.selectedTeam === 'seryun') {
            baseGrowth *= 2.5; // 80% 빠른 성장
            
            // 세륜중학교는 벤치 선수도 성장 (젊은 선수들이라서)
            if (!this.isPlayerInSquad(player)) {
                baseGrowth *= 0.8; // 벤치여도 80% 성장
            }
        }

        // 랜덤 요소 추가 (80% ~ 120%)
        const randomFactor = 0.8 + Math.random() * 0.4;
        baseGrowth *= randomFactor;

        // [수정] 성장량 소수점 둘째자리까지 계산 (최소 0.05)
        const roundedGrowth = Math.max(0.05, Math.round(baseGrowth * 100) / 100);
        return Math.min(roundedGrowth, growthInfo.remainingGrowth);
    }

    // 선수가 현재 스쿼드에 포함되어 있는지 확인
    isPlayerInSquad(player) {
        const squad = gameData.squad;
        
        if (squad.gk && squad.gk.name === player.name) return true;
        
        for (let df of squad.df) {
            if (df && df.name === player.name) return true;
        }
        
        for (let mf of squad.mf) {
            if (mf && mf.name === player.name) return true;
        }
        
        for (let fw of squad.fw) {
            if (fw && fw.name === player.name) return true;
        }
        
        return false;
    }

    // 성장 적용
    applyGrowth(player, growthAmount, growthInfo) {
        const oldRating = Math.floor(player.rating); // 정수부 비교를 위해 내림
        
        // [수정] 성장 한계 설정 (커스텀 선수는 105, 그 외는 99)
        const maxRating = player.isCustom ? 105 : 104;
        player.rating = Math.min(maxRating, player.rating + growthAmount);
        
        const newRating = Math.floor(player.rating); // 성장 후 정수부
        
        // 남은 성장량 차감
        growthInfo.remainingGrowth = Math.max(0, growthInfo.remainingGrowth - growthAmount);
        growthInfo.lastGrowthCheck = Date.now();

        // 성장 알림
        if (newRating > oldRating) {
            this.showGrowthNotification(player, oldRating, newRating);
        }

        // 성장 데이터 업데이트
        this.growthData.set(player.name, growthInfo);

        // 성장이 완료되면 성장 데이터에서 제거
        if (growthInfo.remainingGrowth <= 0) {
            this.growthData.delete(player.name);
            console.log(`${player.name}의 성장이 완료되어 성장 데이터에서 제거되었습니다.`);
        }
    }

    // 성장 알림 표시
    showGrowthNotification(player, oldRating, newRating) {
        const growthAmount = newRating - oldRating;
        let message = `🌟 ${player.name}의 능력치가 상승했습니다!\n${oldRating} → ${newRating} (+${growthAmount})`;
        
       
        
        // 알림을 게임 화면에 표시
        setTimeout(() => {
            alert(message);
        }, 1000);

        console.log(message);
    }

    // playerGrowth.js - processAllTeamsGrowth() 수정
processAllTeamsGrowth() {
    Object.keys(teams).forEach(teamKey => {
        if (teamKey !== gameData.selectedTeam) {
            const teamPlayers = teams[teamKey];
            
            teamPlayers.forEach(player => {
                if (player.age <= 25) {
                    // 5경기마다 100% 확률로 0.1~0.5 성장 (AI 경쟁력 유지를 위해 고점 상향)
                    const growthInterval = 5;
                    let growthAmount = 0.1 + Math.random() * 0.4; 
                    
                    if (gameData.matchesPlayed % growthInterval === 0) {
                        // AI 프레스티지 선수(환생) 성장 보너스
                        const isPrestigePlayer = gameData.aiPrestige && gameData.aiPrestige[teamKey] && gameData.aiPrestige[teamKey].includes(player.name);
                        
                        if (isPrestigePlayer) {
                            const prestigeBonus = 0.2 + Math.random() * 0.2; // 0.2 ~ 0.4 추가 성장
                            growthAmount += prestigeBonus;
                            console.log(`👑 AI 프레스티지 성장: ${player.name} (${teamNames[teamKey]}) +${prestigeBonus.toFixed(2)} 보너스!`);
                        }

                        // AI 선수도 소수점 성장 반영
                        const newRating = Math.min(99, player.rating + growthAmount);
                        player.rating = newRating;
                        
                        console.log(`🤖 AI 성장: ${player.name} (${teamNames[teamKey]}) +${growthAmount.toFixed(2)} → ${newRating.toFixed(1)}`);
                    }
                }
            });
        }
    });
}

    advancePlayerAges() {
    Object.keys(teams).forEach(teamKey => {
        teams[teamKey].forEach(player => {
            player.age++;
            
            // 성장 완료된 선수만 삭제 (로그 추가)
            if (this.growthData.has(player.name)) {
                const growthInfo = this.growthData.get(player.name);
                
                // [수정] 포텐셜 재갱신 방지: 성장이 끝났어도 25세 이하이면 데이터를 유지하여 initializePlayerGrowth에서 다시 잡히지 않도록 함
                // 26세 이상이 되면 더 이상 성장 대상이 아니므로 삭제해도 됨
                if (growthInfo.remainingGrowth <= 0 && player.age > 25) {
                    console.log(`${player.name}의 성장 완료 및 나이 초과 - 데이터 삭제`);
                    this.growthData.delete(player.name);
                } else if (growthInfo.remainingGrowth <= 0) {
                    console.log(`${player.name}의 성장 완료 (데이터 유지 - 포텐셜 고정)`);
                } else {
                    console.log(`${player.name}는 아직 성장 중 - 남은 성장량: ${growthInfo.remainingGrowth.toFixed(1)}`);
                }
            }
        });
    });
    
    console.log(`✅ 시즌 종료 후 남은 성장 중인 선수: ${this.growthData.size}명`);
}

    // 스쿼드 화면 업데이트
    updateSquadDisplay() {
        if (document.getElementById('squad').classList.contains('active')) {
            displayTeamPlayers();
            updateFormationDisplay();
        }
    }

    // 특정 선수에게 성장 가능성 부여 (유스 콜업 시 사용)
    grantPotentialToPlayer(player) {
        if (player.age <= 25 && !this.growthData.has(player.name)) {
            let growthPotential = this.calculateGrowthPotential(player);
            
            // 유스 콜업 보너스: 5~8 사이의 랜덤 수치 추가
            const callUpBonus = Math.floor(Math.random() * 4) + 2;
            growthPotential += callUpBonus;

            // [수정] 유스 콜업 선수도 3년 기준 성장
            let monthlyGrowth = Math.max(0.05, growthPotential / 36);
            
            const monthsToGrow = Math.ceil(growthPotential / monthlyGrowth);
            
            this.growthData.set(player.name, {
                currentRating: Math.round(player.rating),
                maxGrowth: Math.round(growthPotential),
                remainingGrowth: Math.round(growthPotential),
                monthsToGrow: monthsToGrow,
                monthlyGrowth: monthlyGrowth,
                lastGrowthCheck: Date.now()
            });

            console.log(`🌟 유망주 콜업: ${player.name}에게 성장 가능성 ${Math.round(growthPotential)} 부여 완료 (기본 포텐셜 + 콜업 보너스 ${callUpBonus}).`);
            return true;
        }
        return false;
    }

    // 선수 성장 정보 조회
    getPlayerGrowthInfo(playerName) {
        return this.growthData.get(playerName) || null;
    }

    // 팀의 모든 선수 성장 정보 조회
    getTeamGrowthSummary() {
        if (!gameData.selectedTeam) return [];

        const teamPlayers = teams[gameData.selectedTeam];
        const summary = [];

        teamPlayers.forEach(player => {
            if (this.growthData.has(player.name)) {
                const growthInfo = this.growthData.get(player.name);
                const currentRating = Math.round(player.rating); // 현재 능력치 반올림
                const maxPotential = Math.round(currentRating + growthInfo.remainingGrowth); // 최대 포텐셜 반올림
                
                summary.push({
                    name: player.name,
                    position: player.position,
                    age: player.age,
                    currentRating: currentRating,
                    maxPotential: maxPotential,
                    remainingGrowth: Math.round(growthInfo.remainingGrowth * 10) / 10, // 남은 성장량도 반올림
                    monthlyGrowth: Math.round(growthInfo.monthlyGrowth * 100) / 100 // 월별 성장량 표시
                });
            }
        });

        return summary.sort((a, b) => b.maxPotential - a.maxPotential);
    }

    // 성장 시스템 리셋
    resetGrowthSystem() {
        this.growthData.clear();
    }

    // 저장 데이터 준비
    getSaveData() {
        const saveData = {};
        this.growthData.forEach((value, key) => {
            // 저장할 때도 모든 수치를 반올림 처리
            const roundedValue = {
                ...value,
                currentRating: Math.round(value.currentRating),
                maxGrowth: Math.round(value.maxGrowth * 10) / 10,
                remainingGrowth: Math.round(value.remainingGrowth * 10) / 10,
                monthlyGrowth: Math.round(value.monthlyGrowth * 100) / 100
            };
            saveData[key] = roundedValue;
        });
        return saveData;
    }

    // 저장 데이터 로드
    loadSaveData(saveData) {
        this.growthData.clear();
        Object.entries(saveData).forEach(([key, value]) => {
            // 로드할 때도 모든 수치를 반올림 처리
            const roundedValue = {
                ...value,
                currentRating: Math.round(value.currentRating),
                maxGrowth: Math.round(value.maxGrowth * 10) / 10,
                remainingGrowth: Math.round(value.remainingGrowth * 10) / 10,
                monthlyGrowth: Math.round(value.monthlyGrowth * 100) / 100
            };
            this.growthData.set(key, roundedValue);
        });
    }
}

// 전역 성장 시스템 인스턴스
const playerGrowthSystem = new PlayerGrowthSystem();

// 게임 초기화 시 성장 시스템 초기화
function initializePlayerGrowth() {
    playerGrowthSystem.initializePlayerGrowth();
}

// 경기 후 성장 처리
function processPostMatchGrowth() {
    playerGrowthSystem.processPlayerGrowth();
    playerGrowthSystem.processAllTeamsGrowth();
}

// 시즌 종료 시 나이 증가
function advancePlayerAges() {
    playerGrowthSystem.advancePlayerAges();
}

// 성장 정보 표시 함수 - 수정된 부분
function showGrowthSummary() {
    const summary = playerGrowthSystem.getTeamGrowthSummary();
    
    if (summary.length === 0) {
        alert("현재 성장 중인 선수가 없습니다.");
        return;
    }
    
    let message = `📈 선수 성장 현황\n\n`;
    
    summary.forEach((player, index) => {
        message += `${index + 1}. ${player.name}: ${player.currentRating}→${player.maxPotential} (남은: ${player.remainingGrowth}, 월 +${player.monthlyGrowth})\n`;
    });
    
    alert(message);
}

// 경기 종료 후 성장 처리를 전역으로 노출
window.processPostMatchGrowth = processPostMatchGrowth;
window.showGrowthSummary = showGrowthSummary;
window.playerGrowthSystem = playerGrowthSystem;
