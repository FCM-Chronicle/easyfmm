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
            const players = positionMap[pos].filter(p => p);
            players.forEach((player, index) => {
                const total = players.length;
                const x = (100 / (total + 1)) * (index + 1);
                const y = 50; 
                this.createPlayerElement(player, pos, x, y);
            });
        });
    }
    
    createPlayerElement(player, positionType, x, y) {
        if (!player) return;

        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.style.left = x + '%';
        slot.style.top = y + '%';
        slot.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-rating">${player.rating}</div>
        `;
        slot.dataset.playerName = player.name;
        slot.dataset.positionType = positionType;

        // 수정 모드가 아닐 때 교체 모달을 열도록 이벤트 추가
        // player는 이미 전체 선수 객체이므로 그대로 전달
        slot.addEventListener('click', (e) => {
            if (!this.isEditMode) {
                this.openSwapModal(player, positionType);
            }
        });

        this.areas[positionType].appendChild(slot);
        return slot;
    }
    
    setupDragEvents() {
        this.field.addEventListener('mousedown', e => this.onDragStart(e));
        this.field.addEventListener('touchstart', e => this.onDragStart(e.touches[0]), { passive: false });

        document.addEventListener('mousemove', e => this.onDragMove(e));
        document.addEventListener('touchmove', e => this.onDragMove(e.touches[0]), { passive: false });

        document.addEventListener('mouseup', e => this.onDragEnd(e));
        document.addEventListener('touchend', e => this.onDragEnd(e.changedTouches[0]));
    }
    
    onDragStart(e) {
        if (!this.isEditMode) return;
        const target = e.target.closest('.player-slot');
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
        this.draggedPlayer.style.left = `${rect.left - fieldRect.left}px`;
        this.draggedPlayer.style.top = `${rect.top - fieldRect.top}px`;
        
        // 부모를 field로 옮겨서 영역의 제약에서 벗어남
        this.field.appendChild(this.draggedPlayer);
        this.draggedPlayer.classList.add('dragging');
        
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;

        e.preventDefault();
    }
    
    onDragMove(e) {
        if (!this.draggedPlayer) return;
        e.preventDefault();

        const fieldRect = this.field.getBoundingClientRect();
        let x = e.clientX - fieldRect.left - this.offsetX;
        let y = e.clientY - fieldRect.top - this.offsetY;

        // 필드 경계 제한
        x = Math.max(0, Math.min(x, fieldRect.width - this.draggedPlayer.offsetWidth));
        y = Math.max(0, Math.min(y, fieldRect.height - this.draggedPlayer.offsetHeight));

        this.draggedPlayer.style.left = `${x}px`;
        this.draggedPlayer.style.top = `${y}px`;
    }
    
    onDragEnd(e) {
        if (!this.draggedPlayer) return;

        const dropX = e.clientX;
        const dropY = e.clientY;

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
                const playerObj = teams[gameData.selectedTeam].find(p => p.name === this.originalDraggedPlayerInfo.name);
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
                    // 2. 드래그된 원본 DOM 요소를 제거하여 복제 문제 방지
                    this.draggedPlayer.remove();
                    // 3. 화면 전체를 다시 그려서 데이터와 동기화 (자동 정렬 포함)
                    this.displayCurrentSquad();
                }
            } else { // 같은 포지션 내에서 위치만 변경된 경우
                targetArea.appendChild(this.draggedPlayer);
                const areaRect = targetArea.getBoundingClientRect();
                const newLeft = (e.clientX - this.offsetX) - areaRect.left;
                const newTop = (e.clientY - this.offsetY) - areaRect.top;
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
        const currentSquad = this.getCurrentFieldSquad();
        const finalSquad = {
            gk: currentSquad.GK[0] || null,
            df: [...currentSquad.DF],
            mf: [...currentSquad.MF],
            fw: [...currentSquad.FW]
        };

        // 모든 포지션 영역을 순회
        for (const positionType of ['GK', 'DF', 'MF', 'FW']) {
            const playersInArea = currentSquad[positionType];
            const correctedPlayers = [];

            for (const player of playersInArea) {
                const originalPosition = allTeams[gameData.selectedTeam].players.find(p => p.name === player.name)?.position;

                if (originalPosition !== positionType) {
                    changesMade = true;
                    console.log(`- ${player.name}(원래 ${originalPosition})가 ${positionType} 자리에 잘못 배치됨.`);

                    // 교체 선수 찾기
                    const replacement = this.findBestReplacement(positionType, finalSquad);
                    if (replacement) {
                        console.log(`  -> ${replacement.name}(${replacement.rating})으로 자동 교체.`);
                        correctedPlayers.push(replacement);
                        // 교체된 선수는 더 이상 후보가 아님
                        this.addToTempSquad(finalSquad, replacement);
                    } else {
                        console.log(`  -> 교체할 ${positionType} 선수가 없어 빈자리로 둡니다.`);
                        // 교체 선수가 없으면 null로 처리되도록 correctedPlayers에 추가하지 않음
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
            gameData.squad = finalSquad;
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

        // 현재 화면의 선수들 기준으로 카운트
        for (const pos in this.areas) {
            const count = this.areas[pos].querySelectorAll('.player-slot').length;
            counts[pos] = count;
            total += count;
        }

        let message = '';

        if (total !== 11) {
            message = `선발 인원은 11명이어야 합니다. (현재 ${total}명)`;
        }
        if (counts.GK !== 1) {
            message = '골키퍼(GK)는 반드시 1명이어야 합니다.';
        }
        if (counts.DF < 2) {
            message = '수비수(DF)는 최소 2명 이상이어야 합니다.';
        }
        if (counts.MF < 2) {
            message = '미드필더(MF)는 최소 2명 이상이어야 합니다.';
        }
        if (counts.FW < 2) {
            message = '공격수(FW)는 최소 2명 이상이어야 합니다.';
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
            return originalPosition === positionType && !this.isPlayerInSquad(p);
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

// CSS
const style = document.createElement('style');
style.textContent = `
.field-wrapper {
    width: 100%;
    padding-top: 65%; /* 100 / (가로/세로 비율) */
    position: relative;
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
.player-area {
    position: relative;
    border: 1px dashed rgba(255, 255, 255, 0.1);
}
#fw-area { flex-grow: 3.3; } /* 상단 1/3 */
#mf-area { flex-grow: 3.3; } /* 중간 1/3 */
#df-area { flex-grow: 3.3; } /* 하단 1/3 */
#gk-area { flex-grow: 1; }   /* 최하단 */

.field.edit-mode .player-area {
    border-color: rgba(46, 204, 113, 0.5);
}

.player-slot {
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
    transform: translate(-50%, -50%);
    color: white;
    user-select: none;
    cursor: default;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 10;
}

.player-slot:hover {
    /* 호버 시 위치는 유지하고 크기만 확대 */
    transform: translate(-50%, -50%) scale(1.05);
    z-index: 20;
}

.field.edit-mode .player-slot {
    cursor: grab;
}
.field.edit-mode .player-slot.dragging {
    /* 드래그 중에는 transform을 사용하지 않도록 수정 */
    cursor: grabbing;
    z-index: 1000; /* 다른 요소들 위로 올라오도록 */
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    background: linear-gradient(135deg, #f1c40f, #f39c12);
    border-color: #f1c40f;
    width: 88px; /* scale(1.1) 효과 대체 */
    height: 55px; /* scale(1.1) 효과 대체 */
}

.player-name {
    font-size: 0.75rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 70px;
}

.player-rating {
    font-size: 1rem;
    margin-top: 2px;
}

#editFormationBtn.confirm {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
}

@media (max-width: 768px) {
    .player-slot {
        width: 60px;
        height: 40px;
    }
    .player-name {
        font-size: 0.6rem;
        max-width: 55px;
    }
    .player-rating {
        font-size: 0.8rem;
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