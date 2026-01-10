// formation.js - 새로운 자유 포메이션 시스템

class FormationSystem {
    constructor() {
        this.field = null;
        this.areas = {};
        this.isEditMode = false;
        this.draggedPlayer = null;
        this.originalDraggedPlayerInfo = null; // 드래그 시작 시 선수 정보 저장
        
        this.init();
    }
    
    init() {
        this.field = document.querySelector('.field');
        if (!this.field) return;

        this.areas = {
            FW: document.getElementById('fw-area'),
            MF: document.getElementById('mf-area'),
            DF: document.getElementById('df-area'),
            GK: document.getElementById('gk-area'),
        };
        
        this.createEditButton();
        this.displayCurrentSquad();
        this.setupDragEvents();
    }
    
    createEditButton() {
        const btn = document.createElement('button');
        btn.id = 'editFormationBtn';
        btn.className = 'btn primary';
        btn.textContent = '⚙️ 포메이션 수정';
        btn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            z-index: 100;
        `;
        
        btn.onclick = () => this.toggleEditMode();
        
        const container = document.querySelector('.formation-container');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(btn);
        }
    }
    
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const btn = document.getElementById('editFormationBtn');
        
        if (this.isEditMode) {
            btn.textContent = '✅ 수정 완료';
            btn.classList.add('confirm');
            this.field.classList.add('edit-mode');
            alert('포메이션 수정 모드가 활성화되었습니다. 선수를 드래그하여 위치를 자유롭게 변경하세요.');
        } else {
            // 1. 포지션 검사 및 자동 교체 먼저 실행
            this.validateAndAutoCorrect();

            // 2. 자동 교체 후 최종 포메이션으로 유효성 검사
            if (this.validate(true)) {
                this.saveFormation();
                btn.textContent = '⚙️ 포메이션 수정';
                btn.classList.remove('confirm');
                this.field.classList.remove('edit-mode');
            } else {
                // 검증 실패 시 편집 모드 유지
                this.isEditMode = true;
            }
        }
    }
    
    displayCurrentSquad() {
        Object.values(this.areas).forEach(area => area.innerHTML = '');
        
        const squad = gameData.squad;
        const positions = ['GK', 'DF', 'MF', 'FW'];
        const positionMap = { GK: [squad.gk], DF: squad.df, MF: squad.mf, FW: squad.fw };
    
        positions.forEach(pos => {
            // null 값을 포함하여 전체 선수 배열을 가져옵니다.
            const playersWithNulls = positionMap[pos];
            if (!playersWithNulls) return;
    
            const total = playersWithNulls.length;
    
            playersWithNulls.forEach((player, index) => {
                const x = (100 / (total + 1)) * (index + 1);
                const y = 50;
                // player가 null이면 빈 슬롯을, 아니면 선수 슬롯을 생성합니다.
                this.createPlayerElement(player, pos, x, y, index);
            });
        });
    }
    
    createPlayerElement(player, positionType, x, y, index) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.style.left = x + '%';
        slot.style.top = y + '%';
    
        if (player) {
            // 선수가 있는 경우
            slot.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-rating">${player.rating}</div>
            `;
            slot.dataset.playerName = player.name;
            slot.dataset.positionType = positionType;
            slot.classList.add('filled');
    
            // 수정 모드가 아닐 때 교체 모달을 열도록 이벤트 추가
            slot.addEventListener('click', (e) => {
                if (!this.isEditMode) {
                    this.openSwapModal(player, positionType);
                }
            });
        } else {
            // 선수가 없는 경우 (공석)
            slot.innerHTML = `
                <div class="player-name" style="opacity: 0.5;">공석</div>
                <div class="player-rating" style="opacity: 0.5;">-</div>
            `;
            slot.dataset.positionType = positionType;
            slot.dataset.index = index; // 교체를 위해 인덱스 정보 저장
            slot.classList.add('empty');
    
            // 공석 클릭 시 교체 모달 열기
            slot.addEventListener('click', (e) => {
                if (!this.isEditMode) {
                    this.openSwapModalForEmptySlot(positionType, index);
                }
            });
        }
    
        this.areas[positionType].appendChild(slot);
        return slot;
    }
    
    setupDragEvents() {
        this.field.addEventListener('mousedown', e => this.onDragStart(e));
        this.field.addEventListener('touchstart', e => this.onDragStart(e), { passive: false });

        document.addEventListener('mousemove', e => this.onDragMove(e));
        document.addEventListener('touchmove', e => this.onDragMove(e), { passive: false });

        document.addEventListener('mouseup', e => this.onDragEnd(e));
        document.addEventListener('touchend', e => this.onDragEnd(e.changedTouches[0]));
    }
    
    onDragStart(e) {
        if (!this.isEditMode) return;

        const touch = e.touches ? e.touches[0] : e;
        const target = touch.target.closest('.player-slot');

        if (!target) return;

        // GK는 움직일 수 없음
        if (target.dataset.positionType === 'GK' && this.areas.GK.contains(target)) {
            alert('골키퍼는 교체만 가능하며, 필드 내에서 위치를 변경할 수 없습니다.');
            return;
        }

        // 드래그 시작 시 원래 선수 정보 저장
        this.originalDraggedPlayerInfo = {
            name: target.dataset.playerName,
            positionType: target.dataset.positionType
        };

        this.draggedPlayer = target;
        const rect = this.draggedPlayer.getBoundingClientRect();
        const fieldRect = this.field.getBoundingClientRect();

        // 드래그 시작 시 field를 기준으로 절대 위치 설정
        this.draggedPlayer.style.left = `${touch.clientX - fieldRect.left - (this.draggedPlayer.offsetWidth / 2)}px`;
        this.draggedPlayer.style.top = `${touch.clientY - fieldRect.top - (this.draggedPlayer.offsetHeight / 2)}px`;
        
        // 부모를 field로 옮겨서 영역의 제약에서 벗어남 (기존 로직 유지)
        this.field.appendChild(this.draggedPlayer);
        this.draggedPlayer.classList.add('dragging');
        
        this.offsetX = touch.clientX - rect.left;
        this.offsetY = touch.clientY - rect.top;

        e.preventDefault();
        this.offsetX = this.draggedPlayer.offsetWidth / 2;
        this.offsetY = this.draggedPlayer.offsetHeight / 2;
    }
    
    onDragMove(e) {
        if (!this.draggedPlayer) return;
        
        // passive: false가 제대로 동작하지 않는 브라우저를 위해 추가
        if (e.cancelable) {
            e.preventDefault();
        }

        const touch = e.touches ? e.touches[0] : e;
        const fieldRect = this.field.getBoundingClientRect();
        let x = touch.clientX - fieldRect.left - this.offsetX;
        let y = touch.clientY - fieldRect.top - this.offsetY;

        // 필드 경계 제한
        x = Math.max(0, Math.min(x, fieldRect.width - this.draggedPlayer.offsetWidth));
        y = Math.max(0, Math.min(y, fieldRect.height - this.draggedPlayer.offsetHeight));

        this.draggedPlayer.style.left = `${x}px`;
        this.draggedPlayer.style.top = `${y}px`;
    }
    
    onDragEnd(e) {
        if (!this.draggedPlayer) return;

        const touch = e.touches ? e.touches[0] : e;
        const dropX = touch.clientX;
        const dropY = touch.clientY;

        let targetArea = null;
        for (const pos in this.areas) {
            const areaRect = this.areas[pos].getBoundingClientRect();
            if (dropX >= areaRect.left && dropX <= areaRect.right &&
                dropY >= areaRect.top && dropY <= areaRect.bottom) {
                targetArea = this.areas[pos];
                break;
            }
        }

        const newPositionType = targetArea ? targetArea.dataset.positionType : null;
        const oldPositionType = this.originalDraggedPlayerInfo.positionType;

        // 유효한 드롭 영역인지 확인 (필드 플레이어는 GK 영역으로 이동 불가)
        if (targetArea && (newPositionType !== 'GK' || oldPositionType === 'GK')) {
            // 포지션이 변경된 경우
            if (newPositionType !== oldPositionType) {
                const playerName = this.originalDraggedPlayerInfo.name;

                if (playerName) { // 실제 선수를 옮기는 경우
                    const playerObj = teams[gameData.selectedTeam].find(p => p.name === playerName);
                    if (playerObj) {
                        // 1. gameData에서 선수 이동
                        const oldPosKey = oldPositionType.toLowerCase();
                        if (oldPosKey === 'gk') {
                            gameData.squad.gk = null;
                        } else {
                            gameData.squad[oldPosKey] = gameData.squad[oldPosKey].filter(p => p && p.name !== playerObj.name);
                        }
                        const newPosKey = newPositionType.toLowerCase();
                        if (newPosKey === 'gk') {
                            gameData.squad.gk = playerObj;
                        } else {
                            gameData.squad[newPosKey].push(playerObj);
                        }
                    }
                } else { // 공석을 옮기는 경우
                    // 1. 이전 포지션에서 null 제거
                    const oldPosKey = oldPositionType.toLowerCase();
                    const nullIndex = gameData.squad[oldPosKey].indexOf(null);
                    if (nullIndex > -1) {
                        gameData.squad[oldPosKey].splice(nullIndex, 1);
                    }
                    // 2. 새로운 포지션에 null 추가
                    const newPosKey = newPositionType.toLowerCase();
                    gameData.squad[newPosKey].push(null);
                }
                // 2. 드래그된 원본 DOM 요소를 제거하여 복제 문제 방지
                this.draggedPlayer.remove();
                // 3. 화면 전체를 다시 그려서 데이터와 동기화 (자동 정렬 포함)
                this.displayCurrentSquad();
            } else { // 같은 포지션 내에서 위치만 변경된 경우
                targetArea.appendChild(this.draggedPlayer);
                const areaRect = targetArea.getBoundingClientRect();
                // Calculate newLeft and newTop relative to the targetArea's top-left corner.
                // These should be the coordinates of the *center* of the player slot, as transform: translate(-50%, -50%) will be applied.
                const newLeft = touch.clientX - areaRect.left;
                const newTop = touch.clientY - areaRect.top;
                this.draggedPlayer.style.left = `${(newLeft / areaRect.width) * 100}%`;
                this.draggedPlayer.style.top = `${(newTop / areaRect.height) * 100}%`;
            }
        } else {
            // 유효하지 않은 영역에 드롭 시, 드래그했던 DOM 요소를 제거하고 화면을 다시 그림
            // 이렇게 하면 선수가 복제되지 않고 원래 상태로 돌아감
            this.draggedPlayer.remove();
            this.displayCurrentSquad();
            if (targetArea && targetArea.id === 'gk-area') {
                alert('필드 플레이어는 GK 영역으로 이동할 수 없습니다.');
            }
        }

        this.originalDraggedPlayerInfo = null; // 드래그 정보 초기화
        this.draggedPlayer.classList.remove('dragging');
        this.draggedPlayer = null;
    }
    
    // 포지션 검증 및 자동 교체 함수
    validateAndAutoCorrect() {
        console.log("🔍 포지션 검증 및 자동 교체 시작");
        let changesMade = false;
        const currentSquadOnField = this.getCurrentFieldSquad();
        const finalSquad = {
            gk: currentSquadOnField.GK[0] || null,
            df: [...currentSquadOnField.DF],
            mf: [...currentSquadOnField.MF],
            fw: [...currentSquadOnField.FW]
        };

        // 모든 포지션 영역을 순회
        for (const positionType of ['GK', 'DF', 'MF', 'FW']) {
            const playersInArea = currentSquadOnField[positionType];
            const originalCount = playersInArea.length;
            const correctedPlayers = []; // 수정된 선수 목록

            for (const player of playersInArea) {
                const originalPosition = allTeams[gameData.selectedTeam].players.find(p => p.name === player.name)?.position;

                if (originalPosition !== positionType) {
                    changesMade = true;
                    console.log(`- ${player.name}(원래 ${originalPosition})가 ${positionType} 자리에 잘못 배치되었습니다.`);

                    // 교체 선수 찾기
                    const replacement = this.findBestReplacement(positionType, finalSquad);
                    if (replacement) {
                        console.log(`  -> ${replacement.name}(${replacement.rating})으로 자동 교체합니다.`);
                        correctedPlayers.push(replacement);
                        // 교체된 선수는 더 이상 후보가 아님
                        this.addToTempSquad(finalSquad, replacement);
                    } else {
                        console.log(`  -> 교체할 ${positionType} 선수가 없어 공석으로 처리합니다.`);
                        correctedPlayers.push(null); // 자리를 비우기 위해 null 추가
                    }
                } else {
                    // 포지션이 맞는 선수는 그대로 유지
                    correctedPlayers.push(player);
                }
            }

            // 최종 스쿼드 업데이트
            if (positionType === 'GK') {
                finalSquad.gk = correctedPlayers[0] || null;
            } else {
                finalSquad[positionType.toLowerCase()] = correctedPlayers;
            }
        }

        if (changesMade) {
            console.log("✅ 자동 교체 완료. 최종 스쿼드를 반영합니다.");
            gameData.squad = finalSquad; // 선수 교체 및 공석이 반영된 스쿼드로 업데이트
            this.displayCurrentSquad(); // 변경된 스쿼드를 화면에 다시 그림
            displayTeamPlayers(); // 선수 목록도 새로고침
            alert('포지션에 맞지 않는 선수들이 자동으로 교체되었습니다.');
        } else {
            console.log("✅ 모든 선수가 올바른 포지션에 있습니다.");
        }
    }

    // 현재 필드 위의 선수들을 객체로 반환하는 헬퍼 함수
    getCurrentFieldSquad() {
        const squad = { GK: [], DF: [], MF: [], FW: [] };
        for (const pos in this.areas) {
            const area = this.areas[pos];
            area.querySelectorAll('.player-slot').forEach(slot => {
                const player = allTeams[gameData.selectedTeam].players.find(p => p.name === slot.dataset.playerName);
                if (player) squad[pos].push(player);
            });
        }
        return squad;
    }

    // 최고의 교체 선수를 찾는 헬퍼 함수
    findBestReplacement(positionType, currentFinalSquad) {
        const allTeamPlayers = allTeams[gameData.selectedTeam].players;
        
        // 현재 최종 스쿼드에 포함된 선수들의 이름 목록
        const squadPlayerNames = new Set();
        if (currentFinalSquad.gk) squadPlayerNames.add(currentFinalSquad.gk.name);
        ['df', 'mf', 'fw'].forEach(posKey => {
            currentFinalSquad[posKey].forEach(p => squadPlayerNames.add(p.name));
        });

        const candidates = allTeamPlayers.filter(p =>
            p.position === positionType && !squadPlayerNames.has(p.name)
        ).sort((a, b) => b.rating - a.rating);

        return candidates[0] || null;
    }

    // 임시 스쿼드에 선수를 추가하는 헬퍼 함수
    addToTempSquad(squad, player) {
        const posKey = player.position.toLowerCase();
        if (posKey === 'gk') {
            squad.gk = player;
        } else {
            squad[posKey].push(player);
        }
    }

    saveFormation() {
        // onDragEnd에서 gameData.squad가 이미 업데이트되었으므로, 여기서는 유효성 검사만 수행하고 저장 메시지를 표시합니다.
        alert(`포메이션이 저장되었습니다.\n(${gameData.squad.df.length}-${gameData.squad.mf.length}-${gameData.squad.fw.length})`);
        console.log('💾 포메이션 저장 완료:', gameData.squad);
    }
    
    validate(isSaving = false) {
        const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
        let total = 0;

        // gameData.squad의 실제 선수(null이 아닌) 수를 기준으로 카운트
        if (gameData.squad.gk) {
            counts.GK++;
            total++;
        }
        ['df', 'mf', 'fw'].forEach(posKey => {
            const players = gameData.squad[posKey].filter(p => p !== null);
            counts[posKey.toUpperCase()] = players.length;
            total += players.length;
        });

        let message = '';

        if (total !== 11) {
            message = `선발 인원은 11명이어야 합니다. (현재 ${total}명)`;
        }

        if (message) {
            if (isSaving) alert('❌ 포메이션 저장 실패!\n' + message);
            return { valid: false, message: message };
        }
        
        return { valid: true, message: '포메이션 검증 완료' };
    }

    // 선수 교체 모달 열기
    openSwapModal(currentPlayer, positionType) {
        const modal = document.getElementById('playerModal');
        const modalPlayerList = document.getElementById('modalPlayerList');
        document.querySelector('#playerModal .modal-title').textContent = `🔁 ${currentPlayer.name} 선수 교체`;
        
        modalPlayerList.innerHTML = '';

        // 후보 선수 목록: 현재 스쿼드에 없으면서, 교체 대상이 있는 필드 포지션(positionType)과
        // 동일한 '원래' 포지션을 가진 선수들을 필터링합니다.
        const teamPlayers = teams[gameData.selectedTeam];
        const candidates = teamPlayers.filter(p => {
            const originalPosition = allTeams[gameData.selectedTeam].players.find(pl => pl.name === p.name)?.position;
            const isInjured = typeof injurySystem !== 'undefined' && injurySystem.isInjured(gameData.selectedTeam, p.name);
            // 교체 대상의 포지션(positionType)과 원래 포지션이 같고, 현재 스쿼드에 없는 선수만 필터링
            return originalPosition === positionType && !this.isPlayerInSquad(p) && !isInjured;
        });

        if (candidates.length === 0) {
            modalPlayerList.innerHTML = '<p style="text-align: center; padding: 20px 0;">교체 가능한 선수가 없습니다.</p>';
        } else {
            candidates.forEach(candidate => {
                const playerCard = document.createElement('div');
                playerCard.className = 'player-card';
                playerCard.innerHTML = `
                    <div class="name">${candidate.name}</div>
                    <div class="details">능력치: ${candidate.rating} | 나이: ${candidate.age}</div>
                `;
                playerCard.onclick = () => {
                    this.swapPlayers(currentPlayer, candidate, positionType);
                    closeModal();
                };
                modalPlayerList.appendChild(playerCard);
            });
        }

        modal.style.display = 'block';
    }

    // 선수 교체 실행
    swapPlayers(playerOut, playerIn, positionType) {
        const posKey = positionType.toLowerCase();

        if (posKey === 'gk') {
            gameData.squad.gk = playerIn;
        } else {
            // 이름, 나이, 포지션을 모두 비교하여 더 정확하게 선수를 찾음
            const index = gameData.squad[posKey].findIndex(p => 
                p && p.name === playerOut.name && p.age === playerOut.age && p.position === playerOut.position);
            if (index !== -1) {
                gameData.squad[posKey][index] = playerIn;
            }
        }

        // 화면 및 선수 목록 새로고침
        this.displayCurrentSquad();
        if (typeof displayTeamPlayers === 'function') {
            displayTeamPlayers();
        }
    }

    // 선수가 스쿼드에 있는지 확인하는 헬퍼 함수
    isPlayerInSquad(player) {
        const { gk, df, mf, fw } = gameData.squad;
        if (gk && gk.name === player.name) return true;
        const fieldPlayers = [...df, ...mf, ...fw].filter(p => p);
        return fieldPlayers.some(p => p.name === player.name);
    }
}

// CSS 추가 (기존 style 태그 내용에 추가)
const newStyle = `
.player-slot.empty {
    background: rgba(100, 100, 100, 0.3);
    border: 2px dashed rgba(255, 255, 255, 0.3);
    cursor: pointer;
}
.player-slot.empty:hover {
    background: rgba(120, 120, 120, 0.5);
    border-color: #ffd700;
}
`;

// 기존 스타일 태그를 찾아 새 스타일을 추가하거나, 없으면 새로 만듭니다.
let styleTag = document.querySelector('style');
if (styleTag) {
    styleTag.textContent += newStyle;
} else {
    styleTag = document.createElement('style');
    styleTag.textContent = newStyle;
    document.head.appendChild(styleTag);
}

// FormationSystem 클래스에 openSwapModalForEmptySlot 메서드 추가
FormationSystem.prototype.openSwapModalForEmptySlot = function(positionType, index) {
    // 임시 선수 객체를 만들어 openSwapModal 재사용
    const tempPlayer = { name: `공석 (${positionType})`, isDummy: true };
    this.openSwapModal(tempPlayer, positionType);
};

// FormationSystem 클래스의 swapPlayers 메서드 수정
const originalSwapPlayers = FormationSystem.prototype.swapPlayers;
FormationSystem.prototype.swapPlayers = function(playerOut, playerIn, positionType) {
    if (playerOut.isDummy) {
        // 공석 채우기
        if (positionType === 'GK') {
            // 골키퍼 공석 채우기
            gameData.squad.gk = playerIn;
        } else {
            // 필드 플레이어 공석 채우기
            const posKey = positionType.toLowerCase();
            const emptyIndex = gameData.squad[posKey].findIndex(p => p === null);
            if (emptyIndex !== -1) {
                gameData.squad[posKey][emptyIndex] = playerIn;
            }
        }
    } else {
        // 기존 선수 교체 로직
        originalSwapPlayers.call(this, playerOut, playerIn, positionType);
    }

    // 화면 새로고침
    this.displayCurrentSquad();
    if (typeof displayTeamPlayers === 'function') {
        displayTeamPlayers();
    }
};

// CSS
const style = document.createElement('style');
style.textContent = `
.field-wrapper {
    width: 100%;
    padding-top: 23%; /* 필드 세로 비율 대폭 축소 (3/5 수준) */
    position: relative;
    margin: 0 auto; /* 수평 가운데 정렬 */
}
.field {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
}
.formation-container {
    /* 컨테이너 자체의 여백을 줄여 박스 크기 조절 */
    padding: 0; 
}
.player-area {
    position: relative;
    border: 1px dashed rgba(255, 255, 255, 0.1);
}
#fw-area { flex-grow: 3.3; } /* 상단 1/3 */
#mf-area { flex-grow: 3.3; } /* 중간 1/3 */
#df-area { flex-grow: 3.4; } /* 하단 1/3 */
#gk-area { flex-grow: 1; }   /* 최하단 */

.field .player-area {
    border-color: rgba(46, 204, 113, 0.5);
}

.formation-container .player-slot {
    position: absolute;
    width: 80px;
    height: 50px;
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    border: 2px solid #2ecc71;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center; 
    justify-content: center; 
    transform: translate(-50%, -50%); /* 드래그 시작 시 JS로 위치를 재계산하므로 유지 */
    color: white;
    user-select: none;
    cursor: default;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 10;
}

.formation-container .player-slot:hover {
    /* 호버 시 위치는 유지하고 크기만 확대 (transform은 그대로 둠) */
    transform: translate(-50%, -50%) scale(1.05);
    z-index: 20;
}

.formation-container .field .player-slot {
    cursor: grab;
}
.formation-container .field .player-slot.dragging {
    transform: none; /* 드래그 중에는 transform을 비활성화하여 좌표 계산 오류 방지 */
    cursor: grabbing;
    z-index: 1000; /* 다른 요소들 위로 올라오도록 */
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    background: linear-gradient(135deg, #f1c40f, #f39c12);
    border-color: #f1c40f;
    width: 88px; /* scale(1.1) 효과 대체 */
    height: 55px; /* scale(1.1) 효과 대체 */
}

.formation-container .player-slot .player-name {
    font-size: 0.75rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 70px;
}
.formation-container .player-slot .player-rating {
    font-size: 1rem;
    margin-top: 2px;
}


#editFormationBtn.confirm {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
}

@media (max-width: 768px) {
    .formation-container .player-slot {
        width: 70px;
        height: 45px;
    }
    .formation-container .player-slot .player-name {
        font-size: 0.65rem;
        max-width: 60px;
    }
    .formation-container .player-slot .player-rating {
        font-size: 0.8rem;
    }
    .field-wrapper {
        /* 모바일에서 필드 세로 길이를 약간 늘려 선수들이 겹치지 않게 함 */
        padding-top: 65%;
    }
}
`;
document.head.appendChild(style);

let formationSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        formationSystem = new FormationSystem();
        window.formationSystem = formationSystem;
    }, 100);
});

window.refreshFormation = function() {
    if (formationSystem) {
        formationSystem.displayCurrentSquad();
    } else {
        formationSystem = new FormationSystem();
    }
};

window.validateFormationBeforeMatch = function() {
    if (!formationSystem) {
        alert('포메이션 시스템 오류!');
        return false;
    }
    
    // 저장하지 않고 현재 상태만 검증
    const result = formationSystem.validate(false);
    
    if (!result.valid) {
        alert('❌ ' + result.message);
        return false;
    }
    
    return true;
};

window.FormationSystem = FormationSystem;