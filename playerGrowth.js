// playerGrowth.js
// 선수 성장 시스템 구현 (14개월 기준 성장)

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
                
                // 성장량에 따라 기간 조정 (10 이하면 빠르게)
                let growthMonths;
                if (growthPotential <= 10) {
                    growthMonths = Math.max(5, growthPotential);
                } else {
                    growthMonths = 14;
                }
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
            "레나르트 칼": 101,
            "배승균": 95,
            "윤도영": 94,
            "강상윤": 99,
            "디스 얀서": 88,
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

    // 성장 조건 확인 (5경기마다)
    shouldPlayerGrow(player, growthInfo) {
        if (growthInfo.remainingGrowth <= 0) {
            return false;
        }

        // 세륜중학교는 3경기마다
        if (gameData.selectedTeam === 'seryu3') {
            return gameData.matchesPlayed > 0 && gameData.matchesPlayed % 3 === 0;
        }

        // 일반 팀은 5경기마다
        return gameData.matchesPlayed > 0 && gameData.matchesPlayed % 5 === 0;
    }

    // 성장량 계산 (월별 성장량 그대로 사용)
    calculateGrowthAmount(player, growthInfo) {
        // 14개월로 나눈 월별 성장량 그대로 사용
        let growthAmount = growthInfo.monthlyGrowth;

        // 남은 성장량을 초과하지 않도록
        growthAmount = Math.min(growthAmount, growthInfo.remainingGrowth);
        
        // 정수로 반올림
        return Math.round(growthAmount);
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

    // 성장 적용 (정수로만)
    applyGrowth(player, growthAmount, growthInfo) {
        const oldRating = Math.round(player.rating);
        
        // 성장 한계 설정
        const maxRating = player.isCustom ? 105 : 104;
        player.rating = Math.min(maxRating, Math.round(player.rating) + growthAmount);
        
        const newRating = Math.round(player.rating);
        
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
        
        const teamPlayers = teams[gameData.selectedTeam];
        const totalRating = teamPlayers.reduce((sum, player) => sum + Math.round(player.rating), 0);
        return Math.round(totalRating / teamPlayers.length);
    }

    // AI 팀 성장 처리 (우리 팀 평균 오버롤 기반)
    processAllTeamsGrowth() {
        // 우리 팀 평균 오버롤이 1 오를 때마다 계산
        const currentTeamAvg = this.calculateTeamAverageRating();
        
        // 초기 평균 저장 (처음 호출 시)
        if (!gameData.initialTeamAvg) {
            gameData.initialTeamAvg = currentTeamAvg;
        }
        
        // 우리 팀이 몇 오버롤 성장했는지 계산
        const teamGrowth = currentTeamAvg - gameData.initialTeamAvg;
        
        Object.keys(teams).forEach(teamKey => {
            if (teamKey !== gameData.selectedTeam) {
                const teamPlayers = teams[teamKey];
                
                teamPlayers.forEach(player => {
                    if (player.age <= 25 && gameData.matchesPlayed % 5 === 0) {
                        // 우리 팀이 1 오버롤 성장할 때마다 AI는 0.8~1.4 성장
                        let growthAmount = teamGrowth * (0.8 + Math.random() * 0.6);
                        
                        // AI 프레스티지 선수 보너스
                        const isPrestigePlayer = gameData.aiPrestige && gameData.aiPrestige[teamKey] && gameData.aiPrestige[teamKey].includes(player.name);
                        
                        if (isPrestigePlayer) {
                            growthAmount += 0.3; // +0.3 보너스
                            console.log(`👑 AI 프레스티지 성장: ${player.name} (${teamNames[teamKey]}) +${growthAmount.toFixed(1)}`);
                        }

                        // 소수점 1자리까지 허용
                        growthAmount = Math.round(growthAmount * 10) / 10;
                        
                        // AI 선수 성장 적용
                        const newRating = Math.min(99, player.rating + growthAmount);
                        player.rating = Math.round(newRating * 10) / 10; // 소수점 1자리
                        
                        console.log(`🤖 AI 성장: ${player.name} (${teamNames[teamKey]}) +${growthAmount.toFixed(1)} → ${player.rating.toFixed(1)}`);
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
            
            // 성장량에 따라 기간 조정 (10 이하면 빠르게)
            let growthMonths;
            if (growthPotential <= 10) {
                growthMonths = Math.max(5, growthPotential);
            } else {
                growthMonths = 14;
            }
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

    // 우리 팀 선수 오버롤 정수 처리 (소수점 버림)
    normalizeOurTeamRatings() {
        if (!gameData.selectedTeam) return;
        
        const teamPlayers = teams[gameData.selectedTeam];
        teamPlayers.forEach(player => {
            if (player.rating % 1 !== 0) { // 소수점이 있는 경우
                const oldRating = player.rating;
                player.rating = Math.floor(player.rating); // 소수점 버림
                console.log(`🔧 ${player.name} 오버롤 정수화: ${oldRating.toFixed(1)} → ${player.rating}`);
            }
        });
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
    playerGrowthSystem.normalizeOurTeamRatings(); // 우리 팀 선수 오버롤 정수화
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
