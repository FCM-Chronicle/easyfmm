/**
 * TeamUtils.js - 팀 전력 계산 및 선수 관리 공통 유틸리티
 */
const TeamUtils = {
    // 1. 특정 팀의 베스트 11 선발 (세부 포지션 밸런스 및 실제 축구 4백/3톱 정밀 선발)
    getBestEleven(teamKey) {
        const teamPlayers = teams[teamKey];
        if (!teamPlayers || !Array.isArray(teamPlayers) || teamPlayers.length === 0) return [];

        const gks = teamPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
        const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
        const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
        const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);

        const best11 = [];
        if (gks.length > 0) best11.push(gks[0]);

        // [스마트 DF 4백 선발: 좌측 풀백(LB) 1명 + 중앙 센터백(CB) 2명 + 우측 풀백(RB) 1명]
        const isLB = p => { const d = (p.detailPosition || '').toUpperCase(); return d === 'LB' || d === 'LWB'; };
        const isRB = p => { const d = (p.detailPosition || '').toUpperCase(); return d === 'RB' || d === 'RWB'; };
        const isCB = p => { const d = (p.detailPosition || '').toUpperCase(); return d === 'CB' || d === 'LCB' || d === 'RCB' || d === 'SW'; };

        const chosenDFs = [];
        const lbCandidate = dfs.find(p => isLB(p));
        if (lbCandidate) chosenDFs.push(lbCandidate);

        const rbCandidate = dfs.find(p => isRB(p) && !chosenDFs.includes(p));
        if (rbCandidate) chosenDFs.push(rbCandidate);

        const cbCandidates = dfs.filter(p => !chosenDFs.includes(p) && isCB(p));
        for (const cb of cbCandidates) {
            if (chosenDFs.length >= 4) break;
            chosenDFs.push(cb);
        }

        // 전용 세부 포지션이 없거나 부족하면 레이팅 순으로 4명 충원
        for (const d of dfs) {
            if (chosenDFs.length >= 4) break;
            if (!chosenDFs.includes(d)) chosenDFs.push(d);
        }
        best11.push(...chosenDFs);

        // [스마트 MF 선발 (3~4명)]
        const chosenMFs = [];
        for (let i = 0; i < 3 && i < mfs.length; i++) {
            chosenMFs.push(mfs[i]);
        }
        best11.push(...chosenMFs);

        // [스마트 FW 선발 (3명: 윙어 + 중앙 스트라이커)]
        const chosenFWs = [];
        for (let i = 0; i < 3 && i < fws.length; i++) {
            chosenFWs.push(fws[i]);
        }
        best11.push(...chosenFWs);

        // 11명이 부족할 경우 나머지 포지션에서 레이팅 순으로 보충
        if (best11.length < 11) {
            const remaining = teamPlayers.filter(p => !best11.includes(p)).sort((a, b) => b.rating - a.rating);
            for (let i = 0; i < remaining.length && best11.length < 11; i++) {
                best11.push(remaining[i]);
            }
        }
        return best11;
    },

    // 선수가 해당 팀의 베스트 11에 포함되는지 확인 (핵심 선수 판별용)
    isPlayerInBest11(teamKey, playerName) {
        if (!teamKey || teamKey === '외부리그' || typeof teams === 'undefined' || !teams[teamKey]) return false;
        const best11 = this.getBestEleven(teamKey);
        return best11.some(p => p.name === playerName);
    },

    // 2. 선수 목록 또는 스쿼드 객체의 평균 능력치 계산
    calculateRating(playersOrSquad) {
        let players = [];
        if (Array.isArray(playersOrSquad)) {
            players = playersOrSquad.filter(p => p);
        } else if (playersOrSquad && typeof playersOrSquad === 'object') {
            // 스쿼드 객체 (gk, df[], mf[], fw[]) 처리
            const s = playersOrSquad;
            if (s.gk) players.push(s.gk);
            if (s.df) players.push(...s.df.filter(p => p));
            if (s.mf) players.push(...s.mf.filter(p => p));
            if (s.fw) players.push(...s.fw.filter(p => p));
        }

        if (players.length === 0) return 0;
        const totalRating = players.reduce((sum, p) => sum + p.rating, 0);
        return totalRating / players.length;
    },

    // 3. 두 팀간의 전력 차이 분석
    getStrengthDifference(userRating, opponentRating) {
        const difference = userRating - opponentRating;
        return {
            userRating,
            opponentRating,
            difference,
            strengthGap: Math.abs(difference),
            userAdvantage: difference > 0
        };
    },

    // 4. 선수가 특정 스쿼드에 포함되어 있는지 확인
    isPlayerInSquad(player, squad) {
        if (!player || !squad) return false;
        if (squad.gk && squad.gk.name === player.name) return true;

        const fieldPositions = ['df', 'mf', 'fw'];
        for (const pos of fieldPositions) {
            if (squad[pos] && squad[pos].some(p => p && p.name === player.name)) {
                return true;
            }
        }
        return false;
    }
};

// 하위 호환성을 위해 전역 변수로 노출 (기존 코드 대응)
window.TeamUtils = TeamUtils;

// [신규] 선수 페이스 사진 설정 헬퍼 (p[선수아이디].png / p[선수아이디].webp 및 선수이름.webp 탐색)
function setPlayerPhoto(img, player) {
    if (!img) return;
    const name = typeof player === 'string' ? player : (player ? player.name : '');
    let id = player && (player.playerid || player.playerId || player.id);

    // player 객체에 id가 없으면 allTeams에서 검색
    if (!id && name && typeof allTeams !== 'undefined') {
        for (const t in allTeams) {
            const found = (allTeams[t].players || []).find(x => x.name === name);
            if (found && (found.playerid || found.id)) {
                id = found.playerid || found.id;
                break;
            }
        }
    }

    const useId = !(typeof gameData !== 'undefined' && gameData.settings && gameData.settings.useIdFacepack === false);

    const candidates = [];
    if (useId && id) {
        const pid = 'p' + String(id).replace(/^p/i, '');
        candidates.push(`assets/players/${pid}.png`, `assets/players/${pid}.webp`);
    }
    if (name) {
        candidates.push(`assets/players/${name}.webp`);
    }
    candidates.push('assets/players/default.webp');

    let idx = 0;
    img.onerror = function () {
        idx++;
        if (idx < candidates.length) {
            this.src = candidates[idx];
        } else {
            this.onerror = null;
            this.src = 'assets/players/default.webp';
        }
    };
    img.src = candidates[0];
}
window.setPlayerPhoto = setPlayerPhoto;
TeamUtils.setPlayerPhoto = setPlayerPhoto;
window.calculateTeamRating = (playersOrSquad) => {
    if (typeof playersOrSquad === 'string') {
        return TeamUtils.calculateRating(TeamUtils.getBestEleven(playersOrSquad));
    }

    if (playersOrSquad !== undefined) {
        return TeamUtils.calculateRating(playersOrSquad);
    }

    if (typeof gameData !== 'undefined' && gameData.squad) {
        return TeamUtils.calculateRating(gameData.squad);
    }

    return 0;
};
window.getBestEleven = TeamUtils.getBestEleven;
window.calculateUserTeamRating = () => TeamUtils.calculateRating(gameData.squad);
window.calculateOpponentTeamRating = (teamKey) => TeamUtils.calculateRating(TeamUtils.getBestEleven(teamKey));
window.isPlayerInSquad = (player) => TeamUtils.isPlayerInSquad(player, gameData.squad);
window.calculateTeamStrengthDifference = () => TeamUtils.getStrengthDifference(window.calculateUserTeamRating(), window.calculateOpponentTeamRating(gameData.currentOpponent));