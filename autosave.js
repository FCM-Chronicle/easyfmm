// autosave.js
// 자동 저장 기능 구현

// 전역 객체 초기화 (script.js에서 호출 가능하도록)
window.autoSaveSystem = {
    hookMoney: null
};

document.addEventListener('DOMContentLoaded', () => {
    const autoSaveToggle = document.getElementById('autoSaveToggle');
    const autoSaveStatus = document.getElementById('autoSaveStatus');
    const saveSlotsContainer = document.getElementById('saveSlots');
    
    let isAutoSaveOn = false;
    let targetSlotButton = null; // 자동 저장할 대상 슬롯의 저장 버튼
    let targetSlotNumber = null; // 자동 저장할 대상 슬롯 번호

    // 1. 토글 스위치 이벤트 리스너
    if (autoSaveToggle) {
        autoSaveToggle.addEventListener('change', (e) => {
            isAutoSaveOn = e.target.checked;
            
            // 설정 저장
            if (typeof gameData !== 'undefined') {
                if (!gameData.settings) gameData.settings = {};
                gameData.settings.autoSave = isAutoSaveOn;
                
                // 끄면 슬롯 정보도 초기화 (다시 켤 때 새로운 타겟 설정을 위해)
                if (!isAutoSaveOn) {
                    gameData.settings.autoSaveSlot = null;
                }
            }
            
            // 꺼질 때 타겟 초기화 (다시 켤 때 새로운 '최초'를 설정할 수 있게 함)
            if (!isAutoSaveOn) {
                targetSlotNumber = null;
                targetSlotButton = null;
            }
            
            updateStatusText();
            
            if (isAutoSaveOn && !targetSlotNumber) {
                alert('자동 저장을 활성화했습니다.\n원하는 슬롯에 한 번 "저장"을 하면, 이후 해당 슬롯에 계속 덮어씌워집니다.');
            }
        });
    }

    function updateStatusText() {
        if (!autoSaveStatus) return;
        if (isAutoSaveOn) {
            if (targetSlotNumber) {
                autoSaveStatus.textContent = `✅ 자동 저장 켜짐 (슬롯 ${targetSlotNumber}에 저장 중)`;
                autoSaveStatus.style.color = '#2ecc71';
            } else {
                autoSaveStatus.textContent = '⚠️ 자동 저장 대기 중 (먼저 슬롯에 수동으로 한 번 저장하세요)';
                autoSaveStatus.style.color = '#f1c40f';
            }
        } else {
            autoSaveStatus.textContent = '자동 저장이 꺼져있습니다.';
            autoSaveStatus.style.color = '#aaa';
        }
    }

    // 2. 수동 저장 감지 (슬롯 타겟팅)
    if (saveSlotsContainer) {
        saveSlotsContainer.addEventListener('click', (e) => {
            // 클릭된 요소가 버튼이고, 텍스트에 '저장'이 포함되어 있다면
            if (e.target.tagName === 'BUTTON' && e.target.textContent.includes('저장')) {
                // 이미 타겟 슬롯이 정해져 있다면 변경하지 않음 (최초 저장 슬롯 유지)
                if (targetSlotNumber !== null) return;

                targetSlotButton = e.target;
                
                // onclick 속성에서 슬롯 번호 추출 (예: "saveToSlot(1)")
                const onclickAttr = e.target.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/saveToSlot\((\d+)\)/);
                    if (match) {
                        targetSlotNumber = parseInt(match[1]);
                        
                        // 슬롯 번호도 설정에 저장
                        if (typeof gameData !== 'undefined') {
                            if (!gameData.settings) gameData.settings = {};
                            gameData.settings.autoSaveSlot = targetSlotNumber;
                        }
                    }
                }

                if (isAutoSaveOn) {
                    updateStatusText();
                }
            }
        });
    }

    // 3. 자동 저장 실행 함수
    function triggerAutoSave() {
        if (!isAutoSaveOn || !targetSlotNumber) return;
        
        console.log('🔄 자동 저장 실행...');
        // 조용한 저장 실행 (두 번째 인자로 true 전달)
        if (typeof window.saveToSlot === 'function') {
            window.saveToSlot(targetSlotNumber, true);
        }
    }
    
    // [추가] 외부에서 자동 저장을 호출할 수 있도록 전역 노출
    window.triggerAutoSave = triggerAutoSave;

    // 4. 자금 변동 감지 (gameData.teamMoney Hook)
    function hookMoneyProperty() {
        if (typeof gameData === 'undefined') return;

        let internalMoney = gameData.teamMoney;
        
        // gameData.teamMoney 속성을 재정의하여 변경 감지
        Object.defineProperty(gameData, 'teamMoney', {
            get: function() {
                return internalMoney;
            },
            set: function(newValue) {
                const isChanged = internalMoney !== newValue;
                internalMoney = newValue;
                
                if (isChanged) {
                    triggerAutoSave();
                }
            },
            configurable: true
        });
        console.log('💰 자금 변동 감지기가 설정되었습니다.');
    }

    // 외부에서 호출 가능하도록 연결
    window.autoSaveSystem.hookMoney = hookMoneyProperty;

    // gameData가 로드될 때까지 잠시 대기
    const checkGameDataInterval = setInterval(() => {
        if (typeof gameData !== 'undefined') {
            clearInterval(checkGameDataInterval);
            hookMoneyProperty();
        }
    }, 1000);

    // 5. 경기 종료 감지 Hook
    // records.js의 updateRecordsAfterMatch 함수가 경기 후 호출되므로 이를 감쌈
    const originalUpdateRecords = window.updateRecordsAfterMatch;
    window.updateRecordsAfterMatch = function(...args) {
        if (originalUpdateRecords) originalUpdateRecords.apply(this, args);
        triggerAutoSave(); // 경기 기록 업데이트 후 자동 저장
    };

    // 6. 외부에서 UI 업데이트를 위한 함수 노출
    window.updateAutoSaveUI = function() {
        if (typeof gameData !== 'undefined' && gameData.settings && autoSaveToggle) {
            const savedState = gameData.settings.autoSave;
            const savedSlot = gameData.settings.autoSaveSlot;

            // 저장된 슬롯 번호 복원
            if (savedSlot) {
                targetSlotNumber = savedSlot;
            }

            if (autoSaveToggle.checked !== savedState) {
                autoSaveToggle.checked = savedState;
                // 이벤트 트리거하여 내부 상태 업데이트
                autoSaveToggle.dispatchEvent(new Event('change'));
            } else {
                // 상태가 같더라도 텍스트 업데이트 (슬롯 번호가 복원되었을 수 있으므로)
                isAutoSaveOn = savedState;
                updateStatusText();
            }
        }
    };
});