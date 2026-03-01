// deepenTactic.js
// 세부 전술 관리 및 UI 처리

const DeepTacticManager = {
    init() {
        // 데이터 초기화
        if (!gameData.deepTactics) {
            gameData.deepTactics = {
                attackFocus: 'mixed', // center, wing, mixed
                passStyle: { shortRatio: 7, longRatio: 3 }, // 0~10
                pressIntensity: 'mid', // low, mid, high
                defensiveLine: 'standard' // deep, standard, high
            };
        }
        this.renderUI();
    },

    // UI 렌더링 (전술 탭 하단에 추가)
    renderUI() {
        const container = document.getElementById('deepTacticsContainer');
        if (!container) {
            // tactics 탭 내부에 컨테이너가 없으면 생성
            const tacticsTab = document.getElementById('tactics');
            if (!tacticsTab) return;

            const newContainer = document.createElement('div');
            newContainer.id = 'deepTacticsContainer';
            newContainer.style.cssText = `
                margin-top: 20px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            tacticsTab.appendChild(newContainer);
        }

        const dt = gameData.deepTactics;
        const el = document.getElementById('deepTacticsContainer');
        
        el.innerHTML = `
            <h4 style="color: #ffd700; margin-top: 0;">⚙️ 세부 전술 설정</h4>
            
            <div style="margin-bottom: 15px;">
                <label style="display:block; color:#aaa; margin-bottom:5px;">공격 방향 (Attack Focus)</label>
                <select id="dt-attackFocus" style="width:100%; padding:8px; background:#333; color:white; border:1px solid #555;">
                    <option value="center" ${dt.attackFocus === 'center' ? 'selected' : ''}>중앙 집중 (Through Ball ↑)</option>
                    <option value="mixed" ${dt.attackFocus === 'mixed' ? 'selected' : ''}>혼합 (기본)</option>
                    <option value="wing" ${dt.attackFocus === 'wing' ? 'selected' : ''}>측면 집중 (Cross ↑)</option>
                </select>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display:block; color:#aaa; margin-bottom:5px;">
                    패스 스타일 (숏패스 <span id="dt-passVal">${dt.passStyle.shortRatio * 10}</span>%)
                </label>
                <input type="range" id="dt-passStyle" min="0" max="10" value="${dt.passStyle.shortRatio}" style="width:100%;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#888;">
                    <span>롱볼 위주</span>
                    <span>티키타카</span>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display:block; color:#aaa; margin-bottom:5px;">압박 강도 (Press Intensity)</label>
                <select id="dt-pressIntensity" style="width:100%; padding:8px; background:#333; color:white; border:1px solid #555;">
                    <option value="low" ${dt.pressIntensity === 'low' ? 'selected' : ''}>낮음 (지역 방어/텐백)</option>
                    <option value="mid" ${dt.pressIntensity === 'mid' ? 'selected' : ''}>보통</option>
                    <option value="high" ${dt.pressIntensity === 'high' ? 'selected' : ''}>높음 (전방 압박)</option>
                </select>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display:block; color:#aaa; margin-bottom:5px;">수비 라인 (Defensive Line)</label>
                <select id="dt-defensiveLine" style="width:100%; padding:8px; background:#333; color:white; border:1px solid #555;">
                    <option value="deep" ${dt.defensiveLine === 'deep' ? 'selected' : ''}>내림 (Deep)</option>
                    <option value="standard" ${dt.defensiveLine === 'standard' ? 'selected' : ''}>보통</option>
                    <option value="high" ${dt.defensiveLine === 'high' ? 'selected' : ''}>올림 (High)</option>
                </select>
            </div>
        `;

        // 이벤트 리스너 연결
        document.getElementById('dt-attackFocus').addEventListener('change', (e) => {
            gameData.deepTactics.attackFocus = e.target.value;
        });

        document.getElementById('dt-passStyle').addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            gameData.deepTactics.passStyle.shortRatio = val;
            gameData.deepTactics.passStyle.longRatio = 10 - val;
            document.getElementById('dt-passVal').textContent = val * 10;
        });

        document.getElementById('dt-pressIntensity').addEventListener('change', (e) => {
            gameData.deepTactics.pressIntensity = e.target.value;
        });

        document.getElementById('dt-defensiveLine').addEventListener('change', (e) => {
            gameData.deepTactics.defensiveLine = e.target.value;
        });
    }
};

// 전역 노출 및 초기화
window.DeepTacticManager = DeepTacticManager;

document.addEventListener('DOMContentLoaded', () => {
    // 탭 전환 시 UI가 사라질 수 있으므로, 탭 버튼 클릭 시 재렌더링 훅 추가
    const tacticsBtn = document.querySelector('[data-tab="tactics"]');
    if (tacticsBtn) {
        tacticsBtn.addEventListener('click', () => {
            setTimeout(() => DeepTacticManager.init(), 100);
        });
    }
    // 초기 로드
    setTimeout(() => DeepTacticManager.init(), 1000);
});
