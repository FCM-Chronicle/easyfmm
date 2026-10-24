// scouting.js - 유스 스카우트 시스템

class ScoutingSystem {
    constructor() {
        this.scouts = {
            novice: { name: '초급 스카우터 (1성)', cost: 100, chance: 0.5, playersFound: 1, minRating: 50, maxRating: 65, contract: 5 },
            professional: { name: '프로 스카우터 (2성)', cost: 300, chance: 0.7, playersFound: 1, minRating: 55, maxRating: 70, contract: 5 },
            worldClass: { name: '월드클래스 스카우터 (3성)', cost: 700, chance: 1.0, playersFound: 1, minRating: 60, maxRating: 74, contract: 5 }
        };
        this.namesByNationality = {
            korean: {
                first: ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "송", "유", "한"],
                last: ["민준", "서준", "도윤", "예준", "시우", "하준", "지호", "주원", "건우", "성민", "현우", "정훈", "민규"]
            },
            brazilian: {
                first: ["Gabriel", "Lucas", "Matheus", "Pedro", "Guilherme", "Gustavo", "Rafael", "Felipe", "Bruno", "João"],
                last: ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Carvalho", "Almeida", "Ferreira", "Ribeiro"]
            },
            spanish: {
                first: ["García", "Rodriguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín"],
                last: ["Hugo", "Mateo", "Martín", "Lucas", "Leo", "Daniel", "Alejandro", "Manuel", "Pablo", "Álvaro"]
            },
            english: {
                first: ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Walker", "Robinson", "Thompson", "White", "Green"],
                last: ["Oliver", "George", "Noah", "Arthur", "Harry", "Leo", "Muhammad", "Jack", "Henry", "Charlie", "James", "Freddie"]
            }
        };
    }

    // 스카우터 고용 및 선수 발굴
    scoutForPlayers(tier) {
        const scout = this.scouts[tier];
        if (!scout) {
            return { success: false, message: "존재하지 않는 스카우터입니다." };
        }

        const foundPlayers = [];
        for (let i = 0; i < scout.playersFound; i++) {
            const newPlayer = this.generateYouthPlayer(scout);
            
            // 중복 이름 방지
            while (this.isPlayerNameDuplicate(newPlayer.name)) {
                newPlayer.name = this.generateRandomName();
            }

            gameData.youthSquad.push(newPlayer);
            console.log(`[Scouting] 유망주 발굴 및 gameData.youthSquad에 추가됨: ${newPlayer.name}`, gameData.youthSquad);
            foundPlayers.push(newPlayer);
        }

        return {
            success: true,
            message: `${scout.name}이(가) ${foundPlayers.length}명의 유망주를 발굴했습니다!`,
            players: foundPlayers
        };
    }

    // 스카우터 고용
    hireScout(tier) {
        if (gameData.hiredScout) {
            return { success: false, message: "이미 고용된 스카우터가 있습니다." };
        }

        const scout = this.scouts[tier];
        if (!scout) {
            return { success: false, message: "존재하지 않는 스카우터입니다." };
        }

        if (gameData.teamMoney < scout.cost) {
            return { success: false, message: `자금이 부족합니다. (필요: ${scout.cost}억)` };
        }

        // 확률 기반 스카우트 (월드클래스는 100%)
        if (Math.random() > scout.chance) {
            // 실패 시 비용은 차감하지 않음
            return {
                success: false,
                message: `${scout.name}이(가) 유망주 발굴에 실패했습니다.`,
                noCost: true // 비용 차감 없음을 알리는 플래그
            };
        }

        // 비용 차감
        gameData.teamMoney -= scout.cost;

        // 스카우터 고용 정보 저장
        gameData.hiredScout = {
            tier: tier,
            remainingMatches: scout.contract
        };

        return {
            success: true,
            message: `${scout.name}과(와) ${scout.contract}경기 계약을 체결했습니다.`
        };
    }

    // 유망주 선수 생성
    generateYouthPlayer(scout) {
        const positions = ['GK', 'DF', 'MF', 'FW'];
        const position = positions[Math.floor(Math.random() * positions.length)];
        const rating = Math.floor(Math.random() * (scout.maxRating - scout.minRating + 1)) + scout.minRating;
        const age = Math.floor(Math.random() * 3) + 16; // 16-18세

        return {
            name: this.generateRandomName(),
            position: position,
            rating: rating,
            age: age
        };
    }

    // 랜덤 이름 생성
    generateRandomName() {
        const nationalities = Object.keys(this.namesByNationality);
        const randomNationality = nationalities[Math.floor(Math.random() * nationalities.length)];
        const nameSet = this.namesByNationality[randomNationality];

        const firstName = nameSet.first[Math.floor(Math.random() * nameSet.first.length)];
        const lastName = nameSet.last[Math.floor(Math.random() * nameSet.last.length)];

        if (randomNationality === 'korean') {
            return `${firstName}${lastName}`;
        } else if (randomNationality === 'spanish') {
            // 스페인 이름은 '이름 성'순서
            return `${lastName} ${firstName}`;
        } else {
            return `${firstName} ${lastName}`;
        }
    }

    // 선수 이름 중복 확인
    isPlayerNameDuplicate(name) {
        // 모든 팀, 이적시장, 유스팀에서 이름 확인
        for (const teamKey in teams) {
            if (teams[teamKey].some(p => p.name === name)) return true;
        }
        if (gameData.youthSquad.some(p => p.name === name)) return true;
        if (typeof transferSystem !== 'undefined' && transferSystem.transferMarket.some(p => p.name === name)) return true;
        
        return false;
    }
}

// 전역 스카우팅 시스템 인스턴스
const scoutingSystem = new ScoutingSystem();

// 스카우팅 화면 표시
function displayScoutingScreen() {
    const container = document.getElementById('scoutingSection');
    if (!container) return;

    // 현재 고용된 스카우터 정보 표시 (정적 마크업 참조)
    const hiredScoutInfo = document.getElementById('hiredScoutInfo');
    const hiredScoutName = document.getElementById('hiredScoutName');
    const hiredScoutMatches = document.getElementById('hiredScoutMatches');

    if (hiredScoutInfo && hiredScoutName && hiredScoutMatches) {
        if (gameData.hiredScout) {
            const scout = scoutingSystem.scouts[gameData.hiredScout.tier];
            hiredScoutName.textContent = scout ? scout.name : '';
            hiredScoutMatches.textContent = gameData.hiredScout.remainingMatches;
            hiredScoutInfo.style.display = 'block';
        } else {
            hiredScoutInfo.style.display = 'none';
        }
    }

    // 스카우터 목록 UI 상태 갱신 (index.html 정적 마크업 연동)
    const scoutList = document.getElementById('scoutList');
    if (!scoutList) return;

    const isHired = !!gameData.hiredScout;
    const cards = scoutList.querySelectorAll('.scout-card');
    cards.forEach(card => {
        card.classList.toggle('disabled', isHired);
        const btn = card.querySelector('button');
        if (btn) {
            btn.disabled = isHired;
        }
    });
}

// 스카우터 고용 후 UI 새로고침
function hireScoutAndRefresh(tier) {
    const result = scoutingSystem.hireScout(tier);
    alert(result.message);

    if (result.success) {
        updateDisplay(); // 자금 업데이트
        displayScoutingScreen(); // 스카우트 섹션 UI 새로고침
    }
}

// 발굴된 선수 목록 표시
function displayScoutedPlayers(players) {
    const listContainer = document.getElementById('scoutedPlayerList');
    if (!listContainer) return;

    listContainer.replaceChildren();

    if (!players || players.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.opacity = '0.7';
        emptyMsg.textContent = '발굴된 선수가 없습니다.';
        listContainer.appendChild(emptyMsg);
        return;
    }

    players.forEach(player => {
        const posLower = (player.position || 'mf').toLowerCase();
        const playerCard = document.createElement('div');
        playerCard.className = `player-card fc26-player-card pos-theme-${posLower}`;

        const cardContent = document.createElement('div');
        cardContent.className = 'player-card-content fc26-card-layout';

        const cutoutWrap = document.createElement('div');
        cutoutWrap.className = 'fc26-cutout-wrap';

        const ratingBadge = document.createElement('div');
        ratingBadge.className = 'player-rating fc26-ovr-badge';
        ratingBadge.textContent = `${Math.round(player.rating)}`;

        const posBadge = document.createElement('span');
        posBadge.className = `pos-badge pos-${posLower}`;
        posBadge.textContent = player.position;

        const topBadgeCol = document.createElement('div');
        topBadgeCol.className = 'fc26-badge-stack';
        topBadgeCol.append(ratingBadge, posBadge);

        const img = document.createElement('img');
        img.src = `assets/players/${player.name}.webp`;
        img.className = 'player-card-image fc26-cutout-img';
        img.loading = 'lazy';
        img.alt = player.name;
        img.onerror = function() {
            this.onerror = null;
            this.src = 'assets/players/default.webp';
        };

        cutoutWrap.append(topBadgeCol, img);

        const infoText = document.createElement('div');
        infoText.className = 'player-info-text fc26-card-info';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'name player-name';
        nameDiv.textContent = player.name;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'details';
        detailsDiv.textContent = `${player.age}세 · 발굴 유망주`;

        infoText.append(nameDiv, detailsDiv);
        cardContent.append(cutoutWrap, infoText);
        playerCard.appendChild(cardContent);
        listContainer.appendChild(playerCard);
    });
}

// 전역으로 함수 노출
window.displayScoutingScreen = displayScoutingScreen;
window.hireScoutAndRefresh = hireScoutAndRefresh;