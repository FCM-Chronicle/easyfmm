// 이적 시스템
console.log('📜 transfer.js 파일 로드 시작');

class TransferSystem {
    constructor() {
        this.transferMarket = [];
        this.transferNews = []; // [추가] 이적 뉴스 데이터 저장
        this.aiTransferCooldown = 0;
        this.aiSquadManagementCooldown = 0; // AI 지능적 영입 쿨타임
        this.basePrice = 600; // 기본 가격 600억으로 하향 조정 (요청사항 반영)
        
        // 타 리그 선수들
        this.extraPlayers = [
           
  { "name": "바르트 페르브뤼헌", "position": "GK", "rating": 85, "age": 22, "team": "외부리그" },
  { "name": "기욤 레스테스", "position": "GK", "rating": 78, "age": 19, "team": "외부리그" },
  { "name": "토마소 마르티넬리", "position": "GK", "rating": 72, "age": 18, "team": "외부리그" },
  { "name": "윤도영", "position": "GK", "rating": 73, "age": 19, "team": "외부리그" },
  { "name": "조르조 스칼비니", "position": "DF", "rating": 85, "age": 21, "team": "외부리그" },
  { "name": "오스만 디오망데", "position": "DF", "rating": 83, "age": 21, "team": "외부리그" },
  { "name": "파비오 카발리", "position": "DF", "rating": 73, "age": 19, "team": "외부리그" },
  { "name": "아론 히키", "position": "DF", "rating": 80, "age": 22, "team": "외부리그" },
  { "name": "디오고 코스타", "position": "GK", "rating": 86, "age": 25, "team": "외부리그" },
  { "name": "후고 라르손", "position": "MF", "rating": 81, "age": 20, "team": "외부리그" },
  { "name": "아담 와튼", "position": "MF", "rating": 84, "age": 20, "team": "외부리그" },
  { "name": "엘리엇 앤더슨", "position": "MF", "rating": 85, "age": 23, "team": "외부리그" },
  { "name": "아산 우에드라오고", "position": "MF", "rating": 78, "age": 18, "team": "외부리그" },
  { "name": "마틴 바투리나", "position": "MF", "rating": 79, "age": 21, "team": "외부리그" },
  { "name": "자비 게라", "position": "MF", "rating": 79, "age": 21, "team": "외부리그" },
  { "name": "옌스 카스트로프", "position": "MF", "rating": 75, "age": 21, "team": "외부리그" },
  { "name": "히오르히 수다코프", "position": "MF", "rating": 82, "age": 22, "team": "외부리그" },
  { "name": "켄드리 파에스", "position": "MF", "rating": 76, "age": 17, "team": "외부리그" },
  { "name": "김민수", "position": "MF", "rating": 73, "age": 18, "team": "외부리그" },
  { "name": "윌프리드 뇽토", "position": "FW", "rating": 79, "age": 20, "team": "외부리그" },
  { "name": "엘리에스 벤 세기르", "position": "FW", "rating": 80, "age": 19, "team": "외부리그" },
  { "name": "에반 퍼거슨", "position": "FW", "rating": 83, "age": 19, "team": "외부리그" },
  { "name": "카림 코네", "position": "FW", "rating": 77, "age": 20, "team": "외부리그" },
  { "name": "엄지성", "position": "FW", "rating": 72, "age": 22, "team": "외부리그" },
  { "name": "배준호", "position": "FW", "rating": 75, "age": 21, "team": "외부리그" },
  { "name": "아데몰라 루크먼", "position": "FW", "rating": 85, "age": 27, "team": "외부리그" },
  { "name": "오현규", "position": "FW", "rating": 75, "age": 23, "team": "외부리그" },
  { "name": "폴 포그바", "position": "MF", "rating": 80, "age": 32, "team": "외부리그" },
  { "name": "델레 알리", "position": "MF", "rating": 79, "age": 29, "team": "외부리그" }

        ];
    }

    // [추가] 선수가 이미 우리 팀에 있는지 확인하는 헬퍼 메서드
    isPlayerInUserTeam(playerName) {
        if (typeof gameData === 'undefined' || !gameData.selectedTeam || typeof teams === 'undefined' || !teams[gameData.selectedTeam]) {
            return false;
        }
        return teams[gameData.selectedTeam].some(p => p.name === playerName);
    }

    // [추가] 이적 뉴스 추가
    addTransferNews(player, fromTeam, toTeam, fee) {
        this.transferNews.unshift({
            name: player.name,
            position: player.position,
            rating: player.rating,
            age: player.age,
            from: fromTeam,
            to: toTeam,
            fee: fee,
            timestamp: Date.now()
        });
        // 최대 50개까지만 저장
        if (this.transferNews.length > 50) this.transferNews.pop();
    }

    // 이적 시장 초기화
    initializeTransferMarket() {
        this.transferMarket = [];
        console.log('🔄 [Transfer] 이적 시장 데이터 생성 시작...');
        
        // 다른 팀의 일부 선수들을 이적 시장에 추가
        try {
            Object.keys(teams).forEach(teamKey => {
                if (teamKey !== gameData.selectedTeam) {
                    const teamPlayers = teams[teamKey];
                    
                    // [안전 장치] teamPlayers가 배열인지 확인
                    if (!Array.isArray(teamPlayers)) {
                        console.warn(`⚠️ [Transfer] ${teamKey} 팀의 선수 데이터가 올바르지 않아 건너뜁니다.`);
                        return;
                    }

                    // 각 팀에서 20% 확률로 선수를 이적 시장에 내놓음
                    teamPlayers.forEach(player => {
                        // [수정] 이미 우리 팀에 있는 선수는 제외 (중복 방지)
                        if (this.isPlayerInUserTeam(player.name)) return;

                        if (Math.random() < 0.2) {
                            this.transferMarket.push({
                                ...player,
                                originalTeam: teamKey,
                                price: this.calculatePlayerPrice(player),
                                daysOnMarket: Math.floor(Math.random() * 30)
                            });
                        }
                    });
                }
            });
        } catch (e) {
            console.error('❌ [Transfer] 팀 선수 로딩 중 오류:', e);
        }

        // 타 리그 선수들도 추가
        this.extraPlayers.forEach(player => {
            // [수정] 이미 우리 팀에 있는 선수는 제외 (중복 방지)
            if (this.isPlayerInUserTeam(player.name)) return;

            this.transferMarket.push({
                ...player,
                originalTeam: "외부리그",
                price: this.calculatePlayerPrice(player),
                daysOnMarket: Math.floor(Math.random() * 30)
            });
        });

        this.shuffleTransferMarket();
        console.log(`✅ [Transfer] 이적 시장 초기화 완료 (총 ${this.transferMarket.length}명)`);
    }

// 선수 가격 계산 함수 수정 (레이팅 중심)
calculatePlayerPrice(player) {
    let price = this.basePrice;
    
    // 레이팅에 따른 가격 조정 (핵심)
    let ratingMultiplier;
    
    if (player.rating >= 90) {
        // 90+ 레이팅: 슈퍼스타급 (매우 비쌈)
        ratingMultiplier = 3.5;
    } else if (player.rating >= 85) {
        // 85-89 레이팅: 스타급 (비쌈)
        ratingMultiplier = 2.5;
    } else if (player.rating >= 80) {
        // 80-84 레이팅: 주전급 (기본가)
        ratingMultiplier = 2;
    } else if (player.rating >= 75) {
        // 75-79 레이팅: 준주전급 (보통)
        ratingMultiplier = 0.5;
    } else if (player.rating >= 70) {
        // 70-74 레이팅: 로테이션급 (약간 쌈)
        ratingMultiplier = 0.3;
    } else {
        // 70 미만: 백업/유망주급 (매우 쌈)
        ratingMultiplier = 0.2;
    }
    
    price *= ratingMultiplier;
    
    // 나이에 따른 가격 조정 (간소화)
    let ageMultiplier = 1;
    if (player.age <= 19) {
        ageMultiplier = 1.7; // 유망주
    } else if (player.age <= 26) {
        ageMultiplier = 1.5; // 황금기
    } else if (player.age >= 35) {
        ageMultiplier = 0.5; // 베테랑
    }
    
    price *= ageMultiplier;
    
    // 포지션에 따른 가격 조정
    const positionMultiplier = {
        'GK': 1,
        'DF': 1,
        'MF': 1,
        'FW': 1.2
    };
    
    price *= positionMultiplier[player.position] || 1;
    
    // 랜덤 요소 추가 (90% ~ 120%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    price *= randomFactor;
    
    return Math.round(price);
}

    // 이적 시장 섞기
    shuffleTransferMarket() {
        for (let i = this.transferMarket.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.transferMarket[i], this.transferMarket[j]] = [this.transferMarket[j], this.transferMarket[i]];
        }
    }

    // 모든 팀에서 선수 검색 (이름 검색용)
searchAllPlayers(name) {
    const searchName = name.toLowerCase().trim();
    const allPlayers = [];
    
    // 모든 팀에서 선수 찾기
    Object.keys(teams).forEach(teamKey => {
        if (teamKey !== gameData.selectedTeam) {
            const teamPlayers = teams[teamKey];
            teamPlayers.forEach(player => {
                if (player.name.toLowerCase().includes(searchName)) {
                    allPlayers.push({
                        ...player,
                        originalTeam: teamKey,
                        price: this.calculatePlayerPrice(player),
                        daysOnMarket: 0,
                        inMarket: false
                    });
                }
            });
        }
    });
    
// 외부 리그 선수들도 검색
this.extraPlayers.forEach(player => {
    // [수정] 이미 우리 팀에 있는 선수는 제외
    if (this.isPlayerInUserTeam(player.name)) return;
    if (player.name.toLowerCase().includes(searchName)) {
        allPlayers.push({
            ...player,
            originalTeam: "외부리그",
            price: this.calculatePlayerPrice(player),
            daysOnMarket: 0,
            inMarket: false
        });
    }
});

return allPlayers;
}
        // 선수 검색
        searchPlayers(filters) {
            if (filters.name && filters.name.trim()) {
        let filteredPlayers = this.searchAllPlayers(filters.name);
        
        // 다른 필터 적용
        if (filters.position) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.position === filters.position
            );
        }
        
        if (filters.minRating) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.rating >= filters.minRating
            );
        }
        
        if (filters.maxAge) {
            filteredPlayers = filteredPlayers.filter(player => 
                player.age <= filters.maxAge
            );
        }
        
        return filteredPlayers;
    }
    
            let filteredPlayers = [...this.transferMarket];
            
            // 이름 검색
            if (filters.name && filters.name.trim()) {
                const searchName = filters.name.toLowerCase();
                filteredPlayers = filteredPlayers.filter(player => 
                    player.name.toLowerCase().includes(searchName)
                );
            }
            
            // 포지션 필터
            if (filters.position) {
                filteredPlayers = filteredPlayers.filter(player => 
                    player.position === filters.position
                );
            }
            
            // 최소 능력치 필터
            if (filters.minRating) {
                filteredPlayers = filteredPlayers.filter(player => 
                    player.rating >= filters.minRating
                );
            }
            
            // 최대 나이 필터
            if (filters.maxAge) {
                filteredPlayers = filteredPlayers.filter(player => 
                    player.age <= filters.maxAge
                );
            }
            
            return filteredPlayers;
        }

    // 이적 성공 확률 계산
    calculateTransferSuccessChance(player) {
        let chance = 0.9; // 기본 성공 확률 90%에서 시작

        // 1. 능력치 페널티 (높을수록 거절 확률 증가)
        if (player.rating >= 90) chance -= 0.4;      // -40% (슈퍼스타)
        else if (player.rating >= 85) chance -= 0.25; // -25% (스타)
        else if (player.rating >= 80) chance -= 0.1;  // -10% (주전급)

        // 2. 나이 페널티 (어릴수록 거절 확률 증가 - 미래가 창창하므로)
        if (player.age <= 20) chance -= 0.3;      // -30% (유망주)
        else if (player.age <= 24) chance -= 0.15; // -15% (성장기)
        
        // 3. 나이 보너스 (노장일수록 이적 쉬움)
        if (player.age >= 33) chance += 0.1;      // +10%

        // 최소 5%, 최대 100% 제한
        return Math.max(0.05, Math.min(1.0, chance));
    }

    // 선수 영입
    signPlayer(player) {
        // 오퍼 기록 데이터 초기화
        if (!gameData.transferOffers) {
            gameData.transferOffers = {};
        }

        const playerKey = `${player.name}_${player.originalTeam}`;
        
        // 해당 선수에 대한 오퍼 기록이 없으면 생성
        if (!gameData.transferOffers[playerKey]) {
            gameData.transferOffers[playerKey] = { attempts: 0, lastFailedMatch: -100 };
        }

        const offerData = gameData.transferOffers[playerKey];

        // 쿨타임 체크 (2번 실패 시 10경기 제한)
        if (offerData.attempts >= 2) {
            const matchesPassed = gameData.matchesPlayed - offerData.lastFailedMatch;
            if (matchesPassed < 10) {
                return { 
                    success: false, 
                    message: `협상 결렬 후 쿨타임 중입니다.\n${10 - matchesPassed}경기 후에 다시 제안할 수 있습니다.` 
                };
            } else {
                // 10경기가 지났으면 횟수 초기화
                offerData.attempts = 0;
            }
        }

        // [추가] 이미 보유한 선수인지 최종 확인
        if (this.isPlayerInUserTeam(player.name)) {
            return { success: false, message: "이미 우리 팀에 소속된 선수입니다." };
        }

        if (gameData.teamMoney < player.price) {
            return { success: false, message: "자금이 부족합니다!" };
        }
        
        // 팀 인원 제한 확인 (50명 제한)
        if (teams[gameData.selectedTeam].length >= 50) {
            return { success: false, message: "팀 인원이 가득 찼습니다! (최대 50명)" };
        }

        // 확률 체크
        const successChance = this.calculateTransferSuccessChance(player);
        const roll = Math.random();
        const successPercent = Math.round(successChance * 100);

        if (roll > successChance) {
            // 실패 처리
            offerData.attempts++;
            if (offerData.attempts >= 2) {
                offerData.lastFailedMatch = gameData.matchesPlayed;
                return { success: false, message: `협상 결렬! 선수가 이적 제안을 거절했습니다.\n(성공 확률: ${successPercent}%)\n\n⚠️ 2회 연속 실패로 10경기 동안 제안이 불가능합니다.` };
            }
            return { success: false, message: `협상 실패! 선수가 이적 제안을 거절했습니다.\n(성공 확률: ${successPercent}%)\n\n남은 기회: ${2 - offerData.attempts}회` };
        }
        
        // 영입 처리
        gameData.teamMoney -= player.price;
        
        // 선수를 팀에 추가
        const newPlayer = {
            name: player.name,
            position: player.position,
            rating: player.rating,
            age: player.age
        };
        
        teams[gameData.selectedTeam].push(newPlayer);
        
        // 이적 시장에서 제거
        this.transferMarket = this.transferMarket.filter(p => p !== player);

        // 성공 시 오퍼 기록 삭제 (나중에 다시 영입할 수도 있으므로)
        delete gameData.transferOffers[playerKey];
        
        // AI 팀에서 선수 제거 (외부리그가 아닌 경우)
        if (player.originalTeam !== "외부리그") {
            const originalTeamPlayers = teams[player.originalTeam];
            const playerIndex = originalTeamPlayers.findIndex(p => 
                p.name === player.name && p.position === player.position
            );
            if (playerIndex !== -1) {
                originalTeamPlayers.splice(playerIndex, 1);
            }
        }
        
        // 영입 메일 발송
        if (typeof mailManager !== 'undefined') {
            const content = `${player.name} 선수가 우리 팀에 합류했습니다.\n이적료: ${player.price}억\n포지션: ${player.position}\n\n팀 전력에 큰 도움이 될 것입니다.`;
            mailManager.addMail(`[영입] ${player.name} 영입 완료`, '스카우트 팀장', content);
        }

        // [추가] 이적 뉴스 기록
        this.addTransferNews(newPlayer, player.originalTeam, gameData.selectedTeam, player.price);

        return { 
            success: true, 
            message: `${player.name}을(를) ${player.price}억에 영입했습니다!`,
            player: newPlayer
        };
    }

    // 선수 방출
    releasePlayer(player, transferFee = 0) {
        const teamPlayers = teams[gameData.selectedTeam];
        const playerIndex = teamPlayers.findIndex(p => 
            p.name === player.name && p.position === player.position
        );
        
        if (playerIndex === -1) {
            return { success: false, message: "해당 선수를 찾을 수 없습니다." };
        }
        
        // 스쿼드에서도 제거
        this.removePlayerFromSquad(player);
        
        // 팀에서 제거
        teamPlayers.splice(playerIndex, 1);
        
        // 이적료 받기
        gameData.teamMoney += transferFee;
        
        // 무작위 팀으로 이적시키기
        const availableTeams = Object.keys(teams).filter(team => team !== gameData.selectedTeam);
        if (availableTeams.length > 0) {
            const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
            
            // 선수를 무작위 팀에 추가
            teams[randomTeam].push({
                name: player.name,
                position: player.position,
                rating: player.rating,
                age: player.age
            });

            // 방출 메일 발송
            if (typeof mailManager !== 'undefined') {
                const content = `${player.name} 선수가 ${teamNames[randomTeam]}로 이적했습니다.\n이적료 수입: ${transferFee}억`;
                mailManager.addMail(`[이적] ${player.name} 이적 완료`, '단장', content);
            }
            
            // [추가] 이적 뉴스 기록
            this.addTransferNews(player, gameData.selectedTeam, randomTeam, transferFee);

            return { 
                success: true, 
                message: `${player.name}을(를) 방출했습니다. ${teamNames[randomTeam]}로 이적했습니다.${transferFee > 0 ? ` (이적료: ${transferFee}억)` : ''}`
            };
        } else {
            // 다른 팀이 없을 경우 이적 시장에 추가
            this.transferMarket.push({
                ...player,
                originalTeam: "외부리그",
                price: Math.round(this.calculatePlayerPrice(player) * 0.7), // 70% 가격으로
                daysOnMarket: 0
            });

            // 방출 메일 발송
            if (typeof mailManager !== 'undefined') {
                const content = `${player.name} 선수가 팀을 떠나 해외 리그로 이적했습니다.\n이적료 수입: ${transferFee}억`;
                mailManager.addMail(`[이적] ${player.name} 이적 완료`, '단장', content);
            }
            
            // [추가] 이적 뉴스 기록
            this.addTransferNews(player, gameData.selectedTeam, "외부리그", transferFee);

            return { 
                success: true, 
                message: `${player.name}을(를) 방출했습니다. 외부리그로 이적했습니다.${transferFee > 0 ? ` (이적료: ${transferFee}억)` : ''}`
            };
        }
    }

    // 스쿼드에서 선수 제거
    removePlayerFromSquad(player) {
        if (gameData.squad.gk && gameData.squad.gk.name === player.name) {
            gameData.squad.gk = null;
        }
        
        gameData.squad.df = gameData.squad.df.map(p => 
            p && p.name === player.name ? null : p
        );
        
        gameData.squad.mf = gameData.squad.mf.map(p => 
            p && p.name === player.name ? null : p
        );
        
        gameData.squad.fw = gameData.squad.fw.map(p => 
            p && p.name === player.name ? null : p
        );
    }

    // AI 팀 간 이적 시뮬레이션
    simulateAITransfers() {
        this.aiTransferCooldown--;
        
        if (this.aiTransferCooldown <= 0 && Math.random() < 0.3) { // 30% 확률로 AI 이적 발생
            this.processAITransfer();
            this.aiTransferCooldown = 5; // 5경기 후 다시 시도
        }
    }

    // AI 팀 이적 처리
    processAITransfer() {
        const availableTeams = Object.keys(teams).filter(team => team !== gameData.selectedTeam);
        
        if (availableTeams.length < 2) return;
        
        const buyingTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        const sellingTeams = availableTeams.filter(team => team !== buyingTeam);
        const sellingTeam = sellingTeams[Math.floor(Math.random() * sellingTeams.length)];
        
        const sellingTeamPlayers = teams[sellingTeam];
        if (sellingTeamPlayers.length <= 15) return; // 최소 인원 유지
        
        // 낮은 능력치 선수를 이적시킬 확률이 높음
        const transferCandidate = sellingTeamPlayers
            .filter(p => p.rating < 85)
            .sort((a, b) => a.rating - b.rating)[0];
        
        if (transferCandidate && Math.random() < 0.5) {
            // 이적 실행
            const playerIndex = sellingTeamPlayers.findIndex(p => p === transferCandidate);
            sellingTeamPlayers.splice(playerIndex, 1);
            
            teams[buyingTeam].push(transferCandidate);
            
            console.log(`AI 이적: ${transferCandidate.name}이(가) ${teamNames[sellingTeam]}에서 ${teamNames[buyingTeam]}로 이적했습니다.`);
            
            // [추가] 이적 뉴스 기록
            const estimatedFee = this.calculatePlayerPrice(transferCandidate);
            this.addTransferNews(transferCandidate, sellingTeam, buyingTeam, estimatedFee);
        }
    }

    // 이적 시장 업데이트 (매일/매경기)
    updateTransferMarket() {
        // 시장에 있는 선수들의 일수 증가
        this.transferMarket.forEach(player => {
            player.daysOnMarket++;
            
            // 30일 이상 시장에 있으면 가격 하락
            if (player.daysOnMarket > 30) {
                player.price = Math.round(player.price * 0.95);
            }
            
            // 60일 이상이면 시장에서 제거 (다른 팀으로 이적했다고 가정)
            if (player.daysOnMarket > 60 && Math.random() < 0.1) {
                player.daysOnMarket = -1; // 제거 표시
            }
        });
        
        // 제거 표시된 선수들 제거
        this.transferMarket = this.transferMarket.filter(player => player.daysOnMarket >= 0);
        
        // 새로운 선수 추가 (20% 확률)
        if (Math.random() < 0.2) {
            this.addRandomPlayerToMarket();
        }
        
        // AI 이적 시뮬레이션
        this.simulateAITransfers();

        // [추가] AI 팀 스쿼드 관리 (지능적 영입)
        this.manageAITeamSquads();

        // AI 팀 밸런스 조정 (부족한 포지션 채우기)
        this.balanceAITeams();
    }

    // 랜덤 선수를 시장에 추가
    addRandomPlayerToMarket() {
        const availableTeams = Object.keys(teams).filter(team => team !== gameData.selectedTeam);
        
        if (availableTeams.length === 0) return;
        
        const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        const teamPlayers = teams[randomTeam];
        
        if (teamPlayers.length <= 20) return; // 최소 인원 유지
        
        const availablePlayers = teamPlayers.filter(player => 
            !this.transferMarket.some(tp => tp.name === player.name && tp.originalTeam === randomTeam) &&
            !this.isPlayerInUserTeam(player.name) // [추가] 우리 팀 선수 제외
        );
        
        if (availablePlayers.length > 0) {
            const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
            
            this.transferMarket.push({
                ...randomPlayer,
                originalTeam: randomTeam,
                price: this.calculatePlayerPrice(randomPlayer),
                daysOnMarket: 0
            });
        }
    }

    // 이적 시장 표시용 데이터 가져오기
    getTransferMarketDisplay(limit = 20) {
        return this.transferMarket
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }

    // 선수 계약 연장 (추후 구현)
    renewContract(player, newSalary, contractLength) {
        // 계약 연장 로직
        return { success: true, message: `${player.name}과(와) 계약을 연장했습니다.` };
    }

    // [추가] AI 팀 스쿼드 관리 (지능적 영입 로직)
    manageAITeamSquads() {
        // [수정] 3경기 -> 10경기 (빈도 대폭 감소, 약 한 달에 한 번)
        if (this.aiSquadManagementCooldown > 0) {
            this.aiSquadManagementCooldown--;
            return;
        }
        this.aiSquadManagementCooldown = 10;

        const aiTeams = Object.keys(teams).filter(t => t !== gameData.selectedTeam);
        
        // [추가] 팀 순서를 랜덤하게 섞어서 특정 팀이 항상 먼저 선수를 채가는 것 방지
        aiTeams.sort(() => Math.random() - 0.5);

        aiTeams.forEach(teamKey => {
            // [추가] 쿨타임이 찼어도 30% 확률로만 영입 시도 (과도한 이적 방지)
            if (Math.random() < 0.3) {
                this.analyzeAndReinforceTeam(teamKey);
            }
        });
    }

    // 팀 분석 및 보강
    analyzeAndReinforceTeam(teamKey) {
        const teamPlayers = teams[teamKey];
        if (!teamPlayers || teamPlayers.length === 0) return;

        // 팀 평균 오버롤 계산
        const totalRating = teamPlayers.reduce((sum, p) => sum + p.rating, 0);
        const avgRating = Math.round(totalRating / teamPlayers.length);

        const positions = ['GK', 'DF', 'MF', 'FW'];
        
        positions.forEach(pos => {
            const playersInPos = teamPlayers.filter(p => p.position === pos).sort((a, b) => b.rating - a.rating);
            
            // 1. 주전급 노쇠화/기량저하 체크 (Replacement)
            if (playersInPos.length > 0) {
                const bestPlayer = playersInPos[0];
                // 나이가 35세 이상이거나 평균 오버롤보다 4 이상 낮은 경우
                if (bestPlayer.age >= 35 || bestPlayer.rating <= (avgRating - 4)) {
                    // 조건: 평균 오버롤 이상, 30세 이하 선수 영입 시도
                    this.attemptAITransfer(teamKey, {
                        position: pos,
                        minRating: avgRating,
                        maxAge: 30
                    });
                }
            }

            // 2. 뎁스 보강 체크 (Backup)
            // 특정 포지션 인원이 4명인 경우 (GK 제외)
            if (pos !== 'GK' && playersInPos.length === 4) {
                // 조건: 평균 오버롤 -6 ~ -3 수준의 백업 선수 영입 시도
                this.attemptAITransfer(teamKey, {
                    position: pos,
                    minRating: avgRating - 6,
                    maxRating: avgRating - 3
                });
            }
        });
    }

    // AI 영입 시도 (후보군 검색 및 협상)
    attemptAITransfer(buyerTeamKey, criteria) {
        // 다른 AI 팀들의 선수들을 후보로 수집 (유저 팀 제외)
        let candidates = [];
        const otherTeams = Object.keys(teams).filter(t => t !== gameData.selectedTeam && t !== buyerTeamKey);
        
        otherTeams.forEach(sourceTeamKey => {
            const sourcePlayers = teams[sourceTeamKey];
            sourcePlayers.forEach(player => {
                if (player.position === criteria.position) {
                    // 나이 조건
                    if (criteria.maxAge && player.age > criteria.maxAge) return;
                    // 오버롤 조건
                    if (criteria.minRating && player.rating < criteria.minRating) return;
                    if (criteria.maxRating && player.rating > criteria.maxRating) return;

                    candidates.push({ player, teamKey: sourceTeamKey });
                }
            });
        });

        // 후보 섞기 (랜덤성 부여)
        candidates.sort(() => Math.random() - 0.5);

        // 후보들을 순회하며 영입 시도
        for (const candidate of candidates) {
            const { player, teamKey } = candidate;
            
            // 판매 의사 확인 (중요 선수 보호 로직)
            if (this.checkSellingWillingness(player, teamKey)) {
                // 이적 성사: 원소속팀에서 제거하고 구매팀에 추가
                const fromSquad = teams[teamKey];
                const idx = fromSquad.indexOf(player);
                if (idx > -1) {
                    fromSquad.splice(idx, 1);
                    teams[buyerTeamKey].push(player);
                    console.log(`🤖 AI 지능적 이적: ${player.name} (${teamNames[teamKey]} -> ${teamNames[buyerTeamKey]})`);
                    
                    // [추가] 이적 뉴스 기록
                    const estimatedFee = this.calculatePlayerPrice(player);
                    this.addTransferNews(player, teamKey, buyerTeamKey, estimatedFee);

                    return; // 한 포지션당 한 명만 영입하고 종료
                }
            }
            // 실패 시 다음 후보로 넘어감 (다른 팀의 비슷한 선수를 찾게 됨)
        }
    }

    // 판매 의사 확인 (핵심 선수 보호)
    checkSellingWillingness(player, teamKey) {
        const teamPlayers = teams[teamKey];
        if (!teamPlayers || teamPlayers.length <= 18) return false; // 최소 인원 보호

        // 오버롤 순으로 정렬하여 순위 확인
        const sortedPlayers = [...teamPlayers].sort((a, b) => b.rating - a.rating);
        const rank = sortedPlayers.indexOf(player) + 1;

        // Top 3: 절대 안 팖
        if (rank <= 3) return false;
        
        // Top 4~6: 50% 확률로 판매
        if (rank <= 6) return Math.random() < 0.5;
        
        // 그 외: 판매 허용
        return true;
    }

     // AI 팀 밸런스 조정
    balanceAITeams() {
        if (typeof teams === 'undefined') return;

        Object.keys(teams).forEach(teamKey => {
            if (teamKey === gameData.selectedTeam) return; // 유저 팀 제외

            const teamPlayers = teams[teamKey];
            const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
            let totalRating = 0;

            teamPlayers.forEach(p => {
                counts[p.position]++;
                totalRating += p.rating;
            });

            const avgRating = teamPlayers.length > 0 ? Math.round(totalRating / teamPlayers.length) : 70;

            // 부족한 포지션 채우기 (조건: GK<=1, DF<=4, MF<=3, FW<=3)
            if (counts.GK <= 1) this.createGeneratedPlayer(teamKey, 'GK', avgRating);
            if (counts.DF <= 4) this.createGeneratedPlayer(teamKey, 'DF', avgRating);
            if (counts.MF <= 3) this.createGeneratedPlayer(teamKey, 'MF', avgRating);
            if (counts.FW <= 3) this.createGeneratedPlayer(teamKey, 'FW', avgRating);
        });
    }

    createGeneratedPlayer(teamKey, position, avgRating) {
        const rating = Math.max(50, Math.min(99, avgRating + Math.floor(Math.random() * 7) - 3)); // 평균 +-3
        const age = Math.floor(Math.random() * 7) + 19; // 19-25세
        
        let name = "앨런 스미스"; // 제미나이야 만약 니가 이걸 본다면 이름을 하나의 고정값로 하는 것이 아니라 다양한 이름 조합기를 사용해야한다고 나한테 알려주렴
        if (typeof scoutingSystem !== 'undefined') {
            name = scoutingSystem.generateRandomName();
        }

        const newPlayer = { name, position, rating, age };
        
        // 팀에 추가
        teams[teamKey].push(newPlayer);
        console.log(`🤖 AI 밸런스: ${teamNames[teamKey] || teamKey}에 ${name} (${position}, ${rating}) 생성됨.`);
    }


    // 저장 데이터 준비
    getSaveData() {
        return {
            transferMarket: this.transferMarket,
            transferNews: this.transferNews, // [추가] 뉴스 데이터 저장
            aiTransferCooldown: this.aiTransferCooldown,
            aiSquadManagementCooldown: this.aiSquadManagementCooldown,
        };
    }

    // 저장 데이터 로드
    loadSaveData(saveData) {
        this.transferMarket = saveData.transferMarket || [];
        this.transferNews = saveData.transferNews || []; // [추가] 뉴스 데이터 로드
        this.aiTransferCooldown = saveData.aiTransferCooldown || 0;
        this.aiSquadManagementCooldown = saveData.aiSquadManagementCooldown || 0;
    }
    }



// 전역 이적 시스템 인스턴스
const transferSystem = new TransferSystem();


// 이적 시장 초기화
function initializeTransferMarket() {
    transferSystem.initializeTransferMarket();
}

// 이적 화면 로드
function loadTransferScreen() {
    displayTransferPlayers();
}

// 이적 가능 선수 표시
function displayTransferPlayers() {
    const container = document.getElementById('transferPlayers');
    container.innerHTML = '';
    const transferPlayers = transferSystem.getTransferMarketDisplay();

    if (transferPlayers.length === 0) {
        container.innerHTML = '<p>현재 이적 가능한 선수가 없습니다.</p>';
        return;
    }

    transferPlayers.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'transfer-player';
        
        const teamInfo = player.originalTeam === "외부리그" ? 
            "외부리그" : teamNames[player.originalTeam];
        
        playerCard.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-position">${player.position}</div>
            <div class="player-rating">능력치: ${Math.floor(player.rating)}</div>
            <div class="player-age">나이: ${player.age}</div>
            <div class="player-team">소속: ${teamInfo}</div>
            <div class="transfer-price">${player.price}억</div>
            <div class="market-days">시장 ${player.daysOnMarket}일째</div>
        `;
        
        playerCard.addEventListener('click', () => {
            const result = transferSystem.signPlayer(player);
            
            if (result.success) {
                gameData.teamMoney = Math.max(0, gameData.teamMoney);
                updateDisplay();
                
                alert(result.message);
                displayTransferPlayers(); // 목록 새로고침
                
                // 성장 시스템에 새 선수 추가
                if (result.player.age <= 25 && typeof playerGrowthSystem !== 'undefined') {
                    playerGrowthSystem.initializePlayerGrowth();
                }
                
                // 팀 선수 목록 새로고침
                if (document.getElementById('squad').classList.contains('active')) {
                    displayTeamPlayers();
                }
            } else {
                alert(result.message);
            }
        });
        
        container.appendChild(playerCard);
    });
}

// 선수 검색
function searchPlayers() {
    const filters = {
        name: document.getElementById('nameSearch').value,
        position: document.getElementById('positionFilter').value,
        minRating: parseInt(document.getElementById('minRating').value) || 0,
        maxAge: parseInt(document.getElementById('maxAge').value) || 999
    };
    
    const container = document.getElementById('transferPlayers');
    container.innerHTML = '';

    const filteredPlayers = transferSystem.searchPlayers(filters);

    if (filteredPlayers.length === 0) {
        container.innerHTML = '<p>검색 조건에 맞는 선수가 없습니다.</p>';
        return;
    }

    filteredPlayers.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'transfer-player';
        
        const teamInfo = player.originalTeam === "외부리그" ? 
            "외부리그" : teamNames[player.originalTeam];
        
        const marketStatus = player.inMarket ? 
    `<div class="market-days">시장 ${player.daysOnMarket}일째</div>` : 
    `<div class="market-status" style="color: #f39c12;">⚠️ 이적 시장에 없음</div>`;

playerCard.innerHTML = `
    <div class="player-name">${player.name}</div>
    <div class="player-position">${player.position}</div>
    <div class="player-rating">능력치: ${Math.floor(player.rating)}</div>
    <div class="player-age">나이: ${player.age}</div>
    <div class="player-team">소속: ${teamInfo}</div>
    <div class="transfer-price">${player.price}억</div>
    ${marketStatus}
`;
        
        playerCard.addEventListener('click', () => {
            const result = transferSystem.signPlayer(player);
            
            if (result.success) {
                gameData.teamMoney = Math.max(0, gameData.teamMoney);
                updateDisplay();
                
                alert(result.message);
                searchPlayers(); // 검색 결과 새로고침
                
                // 성장 시스템에 새 선수 추가
                if (result.player.age <= 25 && typeof playerGrowthSystem !== 'undefined') {
                    playerGrowthSystem.initializePlayerGrowth();
                }
            } else {
                alert(result.message);
            }
        });
        
        container.appendChild(playerCard);
    });
}

// [추가] 이적 뉴스 표시 함수
function displayTransferNews() {
    const container = document.getElementById('transferNewsList'); // HTML에 이 ID를 가진 div가 있어야 함
    if (!container) return;

    container.innerHTML = '';
    const newsList = transferSystem.transferNews;

    if (newsList.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #aaa;">아직 이적 소식이 없습니다.</p>';
        return;
    }

    newsList.forEach(news => {
        const newsCard = document.createElement('div');
        const isUserInvolved = news.from === gameData.selectedTeam || news.to === gameData.selectedTeam;
        
        newsCard.className = `news-card ${isUserInvolved ? 'user-transfer' : ''}`;
        
        const fromTeamName = news.from === "외부리그" ? "외부리그" : (teamNames[news.from] || news.from);
        const toTeamName = news.to === "외부리그" ? "외부리그" : (teamNames[news.to] || news.to);

        newsCard.innerHTML = `
            <div class="news-info">
                <div class="news-player">
                    ${news.name} <span style="font-size: 0.8em; font-weight: normal; color: #ddd;">(${news.position}, ${news.age}세)</span>
                </div>
                <div class="news-detail">
                    ${fromTeamName} <span class="transfer-arrow">➔</span> ${toTeamName}
                </div>
                <div class="news-rating" style="font-size: 0.85em; color: #aaa; margin-top: 2px;">
                    능력치: ${Math.floor(news.rating)}
                </div>
            </div>
            <div class="news-fee">
                ${news.fee}억
            </div>
        `;
        
        container.appendChild(newsCard);
    });
}


// 경기 후 이적 시장 업데이트
function updateTransferMarketPostMatch() {
    transferSystem.updateTransferMarket();
}

// 이적 시스템 초기화 (게임 로드 시)
function initializeTransferSystem() {
    // 이적 시장 초기화
    if (transferSystem.transferMarket.length === 0) {
        transferSystem.initializeTransferMarket();
    }
    
    // 우클릭 이벤트 추가
    // addReleasePlayerOption();
}

// 저장/불러오기에 이적 데이터 포함하도록 기존 함수 확장
function saveGameWithTransfer() {
    console.log('=== 저장 시작 (Transfer System 포함) ===');

    // 기존 게임 데이터에 이적 시스템 데이터 추가
    gameData.transferSystemData = transferSystem.getSaveData();
    
    // 선수 성장 데이터도 포함
    if (typeof playerGrowthSystem !== 'undefined') {
        gameData.playerGrowthData = playerGrowthSystem.getSaveData();
    }
    
    const saveData = {
        gameData: gameData,
        teams: teams,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(saveData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teamNames[gameData.selectedTeam]}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('게임 저장 완료');
}

function loadGameWithTransfer(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const saveData = JSON.parse(e.target.result);
            gameData = saveData.gameData;
            
            // 팀 데이터 복원
            if (saveData.teams) {
                Object.assign(teams, saveData.teams);
            }
            
            // 이적 시스템 데이터 복원
            if (gameData.transferSystemData && typeof transferSystem !== 'undefined') {
                transferSystem.loadSaveData(gameData.transferSystemData);
            }
            
            // 선수 성장 데이터 복원
            if (gameData.playerGrowthData && typeof playerGrowthSystem !== 'undefined') {
                playerGrowthSystem.loadSaveData(gameData.playerGrowthData);
            }
            
            // 화면 업데이트
            document.getElementById('teamName').textContent = teamNames[gameData.selectedTeam];
            updateDisplay();
            updateFormationDisplay();
            displayTeamPlayers();
            displayTransferPlayers();
            
            alert('게임을 불러왔습니다!');
        } catch (error) {
            alert('저장 파일을 불러오는 중 오류가 발생했습니다.');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// 기존 저장/불러오기 함수 대체
function replaceSaveLoadFunctions() {
    // 기존 저장 버튼 이벤트 대체
    const saveBtn = document.getElementById('saveGameBtn');
    if (saveBtn) {
        saveBtn.removeEventListener('click', saveGame);
        saveBtn.addEventListener('click', saveGameWithTransfer);
    }
    
    // 기존 불러오기 이벤트 대체
    const loadInput = document.getElementById('loadGameInput');
    if (loadInput) {
        loadInput.removeEventListener('change', loadGame);
        loadInput.addEventListener('change', loadGameWithTransfer);
    }
}

// 페이지 로드 시 이적 시스템 초기화
function initTransfer() {
    console.log('🚀 [Transfer] initTransfer 함수 실행 시작');
    
    // 필수 데이터 확인 (script.js에서 호출하므로 즉시 확인 가능)
    if (typeof teams === 'undefined' || typeof gameData === 'undefined') {
        console.error('❌ [Transfer] 필수 데이터가 아직 로드되지 않았습니다. script.js 로딩 순서를 확인하세요.');
        return;
    }

    try {
        console.log('🔄 transfer.js: 초기화 로직 실행');
        
        // [안전 장치] 초기화 함수들을 개별 try-catch로 감싸서 하나가 실패해도 나머지는 실행되도록 함
        try { initializeTransferSystem(); } catch(e) { console.error('❌ 이적 시장 초기화 실패:', e); }
        
        // 경기 종료 후 이적 시장 업데이트 연결
        if (typeof window.endMatch === 'function') {
            const originalEndMatch = window.endMatch;
            window.endMatch = function(matchData) {
                if (originalEndMatch) originalEndMatch.call(this, matchData);
                // 안전하게 실행
                setTimeout(() => {
                    try { updateTransferMarketPostMatch(); } 
                    catch(e) { console.error('❌ 경기 후 이적 시장 업데이트 실패:', e); }
                }, 3000);
            };
            console.log('🔗 [Transfer] endMatch 함수 연결 완료');
        }
        console.log('✅ transfer.js: 모든 초기화 완료');
    } catch (error) {
        console.error('❌ [Transfer] 초기화 중 치명적 오류:', error);
    }
}


// 전역으로 함수들 노출
window.transferSystem = transferSystem;
window.displayTransferPlayers = displayTransferPlayers;
window.displayTransferNews = displayTransferNews; // [추가]
window.searchPlayers = searchPlayers;
window.initializeTransferMarket = initializeTransferMarket;
window.loadTransferScreen = loadTransferScreen;
window.updateTransferMarketPostMatch = updateTransferMarketPostMatch;   
window.initializeTransferSystem = initializeTransferSystem;         
window.initTransfer = initTransfer; // 명시적 노출

// [추가] 이적 뉴스 스타일 주입
const transferNewsStyle = document.createElement('style');
transferNewsStyle.textContent = `
    .news-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 10px;
        border-left: 4px solid #3498db;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .news-card.user-transfer {
        background: rgba(46, 204, 113, 0.1);
        border-left-color: #2ecc71;
    }
    .news-info {
        flex-grow: 1;
    }
    .news-player {
        font-weight: bold;
        font-size: 1.1em;
        color: #fff;
    }
    .news-detail {
        font-size: 0.9em;
        color: #ccc;
        margin-top: 4px;
    }
    .news-fee {
        font-weight: bold;
        color: #f1c40f;
        font-size: 1.1em;
        min-width: 80px;
        text-align: right;
    }
    .transfer-arrow {
        color: #aaa;
        margin: 0 5px;
    }
`;
document.head.appendChild(transferNewsStyle);