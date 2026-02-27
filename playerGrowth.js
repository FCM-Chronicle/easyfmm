// playerGrowth.js
// 선수 성장 시스템 구현 (12개월 기준 성장)

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
                
                // [수정] 포텐셜에 따라 성장 기간을 3~12개월로 다르게 설정
                const growthMonths = Math.max(3, Math.min(12, Math.round(growthPotential / 2.5)));
                const monthlyGrowth = growthPotential / growthMonths;
                
                this.growthData.set(player.name, {
                    currentRating: Math.round(player.rating),
                    maxGrowth: growthPotential,
                    remainingGrowth: growthPotential,
                    monthlyGrowth: monthlyGrowth,
                    growthMonths: growthMonths,
                    lastGrowthCheck: Date.now()
                });

                console.log(`${player.name}: 성장 가능성 ${growthPotential}, 성장 기간 ${growthMonths}개월, 월별 성장 ${monthlyGrowth.toFixed(2)}`);
            }
        });
    }

    // 성장 가능성 계산 (3-15 사이의 랜덤 값)
    calculateGrowthPotential(player) {
        // [사용자 설정] 고정 포텐셜 명단 (이름: 목표 오버롤)
        const fixedPotentials = {
            "오현규": 95,
            "김민수": 99,
            "배준호": 97,
            "앙제요안 보니": 95,
            "조반니 레오니": 99,
            "트레이 뇨니": 93,
            "프란치스코 카마르다": 100,
            "옌스 카스트로프": 95,
            "제라르 마르틴": 90,
            "마르크 베르날": 91,
            "루니 바르다그지": 89,
            "파우 쿠바르시": 100,
            "엔드릭": 97,
            "리코 루이스": 89,
            "코비 마이누": 95,
            "아론 바우만": 98,
            "요르디 무키오": 90,
            "부바 상가레": 97,
            "루카 부슈코비치": 100,
            "에단 은와네리": 93,
            "조시 아체암퐁": 97,
            "맥스 다우먼": 99,
            "리오 응구모하": 94,
            "레나르트 칼": 101,
            "배승균": 99,
            "윤도영": 94,
            "강상윤": 99,
            "디스 얀서": 88,
            "켄드리 파에스": 96,
            "아산 우에드라오고": 99,
            "백인우": 94,
            "대릴 바콜라": 93,
            "파트리크 도르구":99,
            "파쿤도 부오나오테":94
        };

        if (fixedPotentials.hasOwnProperty(player.name)) {
            const targetRating = fixedPotentials[player.name];
            const growthNeeded = Math.max(0, targetRating - Math.round(player.rating));
            console.log(`🔒 ${player.name}: 고정 포텐셜 적용 (목표: ${targetRating}, 필요 성장: ${growthNeeded})`);
            return growthNeeded;
        }

        const baseGrowth = 3 + Math.random() * 10; // 3-13 사이
        
        // 나이에 따른 보정
        let ageModifier = 1;
        if (player.age <= 18) {
            ageModifier = 1.5;
        } else if (player.age <= 21) {
            ageModifier = 1.3;
        } else if (player.age <= 23) {
            ageModifier = 1.1;
        } else if (player.age <= 25) {
            ageModifier = 0.8;
        }
        
        // 현재 능력치에 따른 보정
        let ratingModifier = 1;
        const currentRating = Math.round(player.rating);
        if (currentRating < 70) {
            ratingModifier = 1.7;
        } else if (currentRating < 80) {
            ratingModifier = 1.4;
        } else if (currentRating >= 90) {
            ratingModifier = 0.8;
        }

        // 세륜중학교 특별 보너스
        let teamModifier = 1;
        if (gameData.selectedTeam === 'seryu3') {
            teamModifier = 1.5 + Math.random() * 1.0; // 1.5 ~ 2.5배
            console.log(`세륜중학교 ${player.name}에게 특별 성장 보너스 적용: x${teamModifier.toFixed(2)}`);
        }

        // 아이콘 선수 특별 보너스
        if (player.isIcon) {
            teamModifier = 1.5;
            console.log(`⭐ 아이콘 ${player.name}에게 전설적인 성장 보너스 적용`);
        }   

        // 커스텀 선수 특별 보너스
        if (player.isCustom) {
            teamModifier = 2;
            console.log(`🛠️ 커스텀 ${player.name}에게 한계 돌파 성장 보너스 적용`);
        }

        let finalGrowth = Math.round(baseGrowth * ageModifier * ratingModifier * teamModifier);
        
        // 세륜중학교 선수들은 최소 성장 보장
        if (gameData.selectedTeam === 'seryu3') {
            finalGrowth = Math.max(finalGrowth, 15);
        }

        // 아이콘 선수는 최소 16 성장 보장
        if (player.isIcon) {
            finalGrowth = Math.max(finalGrowth, 16);
        }

        // 커스텀 선수는 105까지 크기 위해 충분한 잠재력 부여
        if (player.isCustom) {
            const gap = 98 - Math.round(player.rating);
            finalGrowth = Math.max(finalGrowth, gap + Math.floor(Math.random() * 5));
        }

        return finalGrowth;
    }

    // 선수 성장 처리 (5경기 = 1개월마다 호출)
    processPlayerGrowth() {
        if (!gameData.selectedTeam) return;

        const teamPlayers = teams[gameData.selectedTeam];
        let growthOccurred = false;

        teamPlayers.forEach(player => {
            if (this.growthData.has(player.name)) {
                const growthInfo = this.growthData.get(player.name);
                
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

    // [수정] 성장 조건 확인 (3경기마다로 단축)
    shouldPlayerGrow(player, growthInfo) {
        if (growthInfo.remainingGrowth <= 0) {
            return false;
        }

        // 3경기마다 성장
        return gameData.matchesPlayed > 0 && gameData.matchesPlayed % 3 === 0;
    }

    // 성장량 계산 (월별 성장량 그대로 사용)
    calculateGrowthAmount(player, growthInfo) {
        // 12개월로 나눈 월별 성장량 그대로 사용
        let growthAmount = growthInfo.monthlyGrowth;

        // 남은 성장량을 초과하지 않도록
        growthAmount = Math.min(growthAmount, growthInfo.remainingGrowth);
        
        // [수정] 소수점 단위 성장도 누락 없이 반영되도록 반올림 제거
        return growthAmount;
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

    // [수정] 성장 적용 (소수점 유지)
    applyGrowth(player, growthAmount, growthInfo) {
        // [수정] UI 표시 기준(내림)으로 변경하여 실제 수치가 바뀔 때만 알림
        const oldRating = Math.floor(player.rating);
        
        // 성장 한계 설정
        const maxRating = player.isCustom ? 105 : 104;
        player.rating = Math.min(maxRating, player.rating + growthAmount); // 소수점 유지
        
        const newRating = Math.floor(player.rating); // 표시는 정수로
        
        // 남은 성장량 차감
        growthInfo.remainingGrowth = Math.max(0, growthInfo.remainingGrowth - growthAmount);
        growthInfo.currentRating = newRating;
        growthInfo.lastGrowthCheck = Date.now();

        // 성장 알림 (실제로 올랐을 때만)
        if (newRating > oldRating) {
            this.showGrowthNotification(player, oldRating, newRating);
        }

        // 성장 데이터 업데이트
        this.growthData.set(player.name, growthInfo);

        // 성장 완료 시 데이터 제거
        if (growthInfo.remainingGrowth <= 0) {
            this.growthData.delete(player.name);
            console.log(`${player.name}의 성장이 완료되어 성장 데이터에서 제거되었습니다.`);
        }
    }

    // 성장 알림 표시
    showGrowthNotification(player, oldRating, newRating) {
        const growthAmount = newRating - oldRating;
        let message = `🌟 ${player.name}의 능력치가 상승했습니다!\n${oldRating} → ${newRating} (+${growthAmount})`;
        
        setTimeout(() => {
            alert(message);
        }, 1000);

        console.log(message);
    }

    // 우리 팀 평균 오버롤 계산
    calculateTeamAverageRating() {
        if (!gameData.selectedTeam) return 75;
        
        const teamPlayers = teams[gameData.selectedTeam]; // Best 11 로직은 아님 (전체 평균)
        const totalRating = teamPlayers.reduce((sum, player) => sum + Math.round(player.rating), 0);
        return Math.round(totalRating / teamPlayers.length);
    }

    // [수정] AI 팀 성장 처리 (독립적 성장 시스템으로 변경)
    processAllTeamsGrowth() {
        // 5경기마다 성장 처리
        if (gameData.matchesPlayed % 5 !== 0) return;

        console.log("🤖 AI 선수 성장 프로세스 시작...");
        
        // 유저 팀 평균 오버롤 계산 (비교용)
        const userTeamAvg = this.calculateTeamAverageRating();
        
        Object.keys(teams).forEach(teamKey => {
            if (teamKey !== gameData.selectedTeam) {
                const teamPlayers = teams[teamKey];
                
                // AI 팀 평균 오버롤 계산
                const aiTeamAvg = Math.round(teamPlayers.reduce((sum, p) => sum + p.rating, 0) / teamPlayers.length);
                
                // 밸런싱 계수 (유저 팀과의 격차에 따라 성장 속도 조절)
                let balanceFactor = 1.0;
                const diff = aiTeamAvg - userTeamAvg;
                
                // [수정] 5시즌 내 유저 최강팀 등극을 위한 밸런싱 (압도적 차이는 방지)
                if (diff > 2) {
                    balanceFactor = 0.4; // AI가 유저보다 강하면 성장 대폭 둔화 (유저 추격 지원)
                } else if (diff < -6) {
                    balanceFactor = 1.3; // 격차가 너무 벌어지면(6 이상) AI 부스트 (압도적 차이 방지)
                } else if (diff < 0) {
                    balanceFactor = 0.9; // 유저가 우위일 때는 AI 성장 소폭 둔화 (유저 우위 유지)
                }

                teamPlayers.forEach(player => {
                    // 25세 이하 선수만 성장
                    if (player.age <= 25) {
                        // 기본 성장치 (5경기당 0.3 ~ 0.7)
                        let growthAmount = 0.3 + Math.random() * 0.4;

                        // 1. 나이 보정 (어릴수록 빠름)
                        if (player.age <= 20) growthAmount *= 1.5;
                        else if (player.age <= 23) growthAmount *= 1.2;
                        
                        // 2. 현재 능력치 보정 (낮을수록 빨리 큼 - 캐치업)
                        if (player.rating < 70) growthAmount *= 1.3;
                        else if (player.rating > 90) growthAmount *= 0.5; // 고능력치는 성장 둔화
                        
                        // 3. 밸런싱 계수 적용 (신규)
                        growthAmount *= balanceFactor;
                        
                        // AI 프레스티지 선수 보너스
                        const isPrestigePlayer = gameData.aiPrestige && gameData.aiPrestige[teamKey] && gameData.aiPrestige[teamKey].includes(player.name);
                        
                        if (isPrestigePlayer) {
                            growthAmount += 0.5; // 프레스티지 추가 보너스
                        }

                        // 소수점 1자리까지 허용
                        growthAmount = Math.round(growthAmount * 10) / 10;
                        
                        // AI 선수 성장 적용
                        const oldRating = player.rating;
                        const newRating = Math.min(99, player.rating + growthAmount);
                        player.rating = Math.round(newRating * 10) / 10; // 소수점 1자리
                        
                        // 로그 출력 (성장폭이 0.5 이상일 때만)
                        if (growthAmount >= 0.5) {
                            console.log(`📈 ${player.name} (${teamNames[teamKey] || teamKey}): ${oldRating.toFixed(1)} -> ${player.rating.toFixed(1)} (+${growthAmount}) [밸런스: x${balanceFactor}]`);
                        }
                    }
                });
            }
        });
    }

    // 시즌 종료 시 나이 증가
    advancePlayerAges() {
        Object.keys(teams).forEach(teamKey => {
            teams[teamKey].forEach(player => {
                player.age++;
                
                // 26세 이상이 되면 성장 데이터 제거
                if (this.growthData.has(player.name) && player.age > 25) {
                    const growthInfo = this.growthData.get(player.name);
                    if (growthInfo.remainingGrowth <= 0) {
                        console.log(`${player.name}의 성장 완료 및 나이 초과 - 데이터 삭제`);
                        this.growthData.delete(player.name);
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

    // 유스 콜업 시 성장 가능성 부여
    grantPotentialToPlayer(player) {
        if (player.age <= 25 && !this.growthData.has(player.name)) {
            let growthPotential = this.calculateGrowthPotential(player);
            
            // 유스 콜업 보너스: 3~6 추가
            const callUpBonus = 3 + Math.floor(Math.random() * 4);
            growthPotential += callUpBonus;
            
            // [수정] 포텐셜에 따라 성장 기간을 3~12개월로 다르게 설정
            const growthMonths = Math.max(3, Math.min(12, Math.round(growthPotential / 2.5)));
            const monthlyGrowth = growthPotential / growthMonths;
            
            this.growthData.set(player.name, {
                currentRating: Math.round(player.rating),
                maxGrowth: growthPotential,
                remainingGrowth: growthPotential,
                monthlyGrowth: monthlyGrowth,
                growthMonths: growthMonths,
                lastGrowthCheck: Date.now()
            });

            console.log(`🌟 유망주 콜업: ${player.name}에게 성장 가능성 ${growthPotential} 부여 완료 (성장 기간 ${growthMonths}개월, 콜업 보너스 +${callUpBonus})`);
            return true;
        }
        return false;
    }

    // [수정] 우리 팀 선수 오버롤 정수 처리 (삭제 또는 비활성화)
    normalizeOurTeamRatings() {
        // 소수점 유지를 위해 기능 비활성화
        // console.log("🔧 오버롤 정수화 기능이 비활성화되었습니다 (소수점 유지).");
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
                const currentRating = Math.round(player.rating);
                const maxPotential = currentRating + growthInfo.remainingGrowth;
                
                summary.push({
                    name: player.name,
                    position: player.position,
                    age: player.age,
                    currentRating: currentRating,
                    maxPotential: Math.round(maxPotential),
                    remainingGrowth: Math.round(growthInfo.remainingGrowth),
                    monthlyGrowth: Math.round(growthInfo.monthlyGrowth * 10) / 10 // 소수점 1자리
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
            saveData[key] = {
                currentRating: value.currentRating,
                maxGrowth: value.maxGrowth,
                remainingGrowth: value.remainingGrowth,
                monthlyGrowth: value.monthlyGrowth,
                lastGrowthCheck: value.lastGrowthCheck
            };
        });
        return saveData;
    }

    // 저장 데이터 로드
    loadSaveData(saveData) {
        this.growthData.clear();
        Object.entries(saveData).forEach(([key, value]) => {
            this.growthData.set(key, value);
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
    // playerGrowthSystem.normalizeOurTeamRatings(); // [수정] 소수점 유지를 위해 주석 처리

    // [추가] 성장 후 DNA 포인트 재계산 (실시간 반영)
    if (typeof DNAManager !== 'undefined') {
        DNAManager.recalculateLineOVRs();
    }
}

// 시즌 종료 시 나이 증가
function advancePlayerAges() {
    playerGrowthSystem.advancePlayerAges();
}

// 성장 정보 표시 함수
function showGrowthSummary() {
    const summary = playerGrowthSystem.getTeamGrowthSummary();
    
    if (summary.length === 0) {
        alert("현재 성장 중인 선수가 없습니다.");
        return;
    }
    
    let message = `📈 선수 성장 현황\n\n`;
    
    summary.forEach((player, index) => {
        message += `${index + 1}. ${player.name} (${player.age}세)\n`;
        message += `   현재: ${player.currentRating} → 최대: ${player.maxPotential}\n`;
        message += `   남은 성장: ${player.remainingGrowth} (월 +${player.monthlyGrowth})\n\n`;
    });
    
    alert(message);
}

// 경기 종료 후 성장 처리를 전역으로 노출
window.processPostMatchGrowth = processPostMatchGrowth;
window.showGrowthSummary = showGrowthSummary;
window.playerGrowthSystem = playerGrowthSystem;
