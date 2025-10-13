// sns.js - SNS 시스템 구현

class SNSManager {
    constructor() {
        this.posts = [];
        this.postIdCounter = 1;
        this.templates = this.initializeTemplates();
        this.lastUpdateTime = Date.now();
    }

  // initializeTemplates 함수에서 템플릿 수정
initializeTemplates() {
    return {
        // 이적 확정 템플릿
        transferConfirmed: [
            "[오피셜] {playerName}, {transferFee}에 {newTeam} 이적 확정!",
            "[오피셜] {playerName}, {transferFee}에 {newTeam} 합류!",
            "[오피셜] {playerName}, **{newTeam}**과 계약! 새로운 도전 시작!",
            "[오피셜] {playerName}, {transferFee}로 {newTeam} 이적 '충격'!",
            "[오피셜] {playerName}, **{newTeam}**과 동행!",
            "[오피셜] {playerName}, {transferFee}에 {newTeam} 이적!",
            "[오피셜] {playerName}, **{newTeam}**과 계약!",
            "[오피셜] {playerName}, {transferFee}에 {newTeam} 이적 '전격'!",
            "[오피셜] {playerName}, **{newTeam}**으로 '유턴'!",
            "[오피셜] {playerName}, {newTeam} 이적! '이변'의 주인공!",
            "HERE WE GO! {playerName}, {newTeam} 이적 확정! by 파브리치오 로마노"
        ],
        
        // 이적 루머 템플릿
        transferRumor: [
            "[이적 루머] {playerName}, {newTeam} 이적설 솔솔... {transferFee} 거론",
            "[이적설] {playerName}, {newTeam}으로 깜짝 이적하나?",
            "[이적시장] {playerName}, {newTeam} 이적 임박?",
            "[루머] {playerName}, {newTeam} '러브콜' 받았다!",
            "[이적 가십] {playerName}, {newTeam} 이적 '가능성' 제기!"
        ],

        // 경기 결과 템플릿 - 이변/충격 (약팀이 강팀을 이김)
        matchResultShocking: [
            "[경기 결과] 충격! {winTeam}이 {loseTeam}을 {score}로 격파!",
            "[경기 결과] 이변! {winTeam}, {loseTeam}을 {score}로 잡았다!",
            "[경기 결과] 믿을 수 없는 패배! {loseTeam}, {winTeam}에 {score} 패!",
            "[경기 결과] 대이변! {winTeam}, {loseTeam} 격침시키며 {score} 승리!",
            "[경기 결과] 센세이션! {winTeam}의 {loseTeam} {score} 격파!"
        ],
        
        // 경기 결과 템플릿 - 예상된 결과 (강팀이 약팀을 이김)
        matchResultExpected: [
            "[경기 결과] 예상대로! {winTeam}, {loseTeam}을 {score}로 완파!",
            "[경기 결과] 압도적인 승리! {winTeam}, {loseTeam}에 {score} 승리!",
            "[경기 결과] 순조로운 출발! {winTeam}, {loseTeam}에 {score} 승!",
            "[경기 결과] 무난한 승리! {winTeam}, {loseTeam} {score}로 제압!",
            "[경기 결과] {winTeam}, {loseTeam} 상대로 {score} 완승!"
        ],
        
        // 경기 결과 템플릿 - 일반적인 승부 결과 (winTeam/loseTeam 사용)
        matchResultNormal: [
            "[경기 결과] {winTeam}, {loseTeam}에 {score} 승리!",
            "[경기 결과] {winTeam}, {loseTeam} 꺾고 귀중한 승점 3점 획득!",
            "[경기 결과] {winTeam}, {loseTeam} 상대로 {score} 승리!",
            "[경기 결과] {winTeam}이 {loseTeam}을 {score}로 이겼습니다!"
        ],

        // 경기 결과 템플릿 - 일반적인 무승부 (homeTeam/awayTeam 사용)
        matchResultDraw: [
            "[경기 결과] {homeTeam}와 {awayTeam}, {score} 무승부!",
            "[경기 결과] {homeTeam}과 {awayTeam}이 {score}로 비겼습니다!",
            "[경기 결과] {homeTeam} vs {awayTeam}, {score} 스코어리스 드로우!",
            "[경기 결과] 박빙의 승부! {homeTeam}과 {awayTeam} {score} 무승부!"
        ],

        // 무승부 - 충격적인 결과 (강팀이 약팀과 비김)
        matchResultDrawShocking: [
            "[경기 결과] 충격적인 무승부! {strongTeam}, {weakTeam}과 {score} 무승부!",
            "[경기 결과] 이변! {strongTeam}, {weakTeam}에 발목 잡혀 {score} 무승부!",
            "[경기 결과] {strongTeam}, {weakTeam} 상대로 {score} 무승부... 충격!"
        ],

        // 시즌 결과 - 우승
        seasonChampion: [
            "🏆 [시즌 종료] {team}, {league}부 리그 우승! 최종 {points}점으로 정상 등극!",
            "🏆 [시즌 종료] 우승! {team}이 {league}부 리그를 제패했습니다!",
            "🏆 [시즌 종료] {team}, {league}부 리그 챔피언 등극! {points}점 획득!",
            "👑 [시즌 종료] {team}의 시대! {league}부 리그 우승 달성!",
            "🎉 [시즌 종료] 완벽한 시즌! {team}, {league}부 리그 우승!"
        ],
        
        // 시즌 결과 - 승격
        seasonPromotion: [
            "⬆️ [시즌 종료] {team}, {newLeague}부 리그 승격 확정! 축하합니다!",
            "🎊 [시즌 종료] 승격의 주역! {team}, {newLeague}부 리그로!",
            "⬆️ [시즌 종료] {team}, {newLeague}부 리그 승격! 새로운 도전!",
            "🚀 [시즌 종료] {team}, {newLeague}부 리그 승격 성공!",
            "✨ [시즌 종료] 꿈의 승격! {team}, {newLeague}부 리그로 올라간다!"
        ],
        
        // 시즌 결과 - 강등
        seasonRelegation: [
            "⬇️ [시즌 종료] {team}, {newLeague}부 리그 강등... 재기를 노린다",
            "😢 [시즌 종료] {team}, {newLeague}부 리그 강등 확정...",
            "⬇️ [시즌 종료] 아쉬운 강등... {team}, {newLeague}부 리그로",
            "💔 [시즌 종료] {team}, {newLeague}부 리그 강등... 내년을 기약",
            "⬇️ [시즌 종료] {team}, {newLeague}부 리그로... 재도약 다짐"
        ],
        
        // 득점왕
        topScorer: [
            "⚽👑 [시즌 종료] 득점왕은 {playerName}({team})! {goals}골로 득점왕 수상!",
            "⚽ [시즌 종료] 골 제조기 {playerName}({team}), {goals}골로 득점왕!",
            "👟 [시즌 종료] {playerName}({team}), {goals}골로 {league}부 리그 득점왕 등극!",
            "⚽ [시즌 종료] 득점왕의 탄생! {playerName}({team}) {goals}골!",
            "🎯 [시즌 종료] {playerName}({team}), {goals}골로 득점왕 차지!"
        ],
        
        // 도움왕
        topAssister: [
            "🅰️👑 [시즌 종료] 도움왕은 {playerName}({team})! {assists}도움으로 도움왕!",
            "🅰️ [시즌 종료] 어시스트 머신 {playerName}({team}), {assists}도움!",
            "🎯 [시즌 종료] {playerName}({team}), {assists}도움으로 {league}부 리그 도움왕!",
            "🅰️ [시즌 종료] 도움왕 등극! {playerName}({team}) {assists}도움!",
            "✨ [시즌 종료] {playerName}({team}), {assists}도움으로 도움왕 차지!"
        ],
        
        // 시즌 종합 결과
        seasonSummary: [
            "📊 [시즌 종료] {league}부 리그 시즌 종료! 우승: {champion}, 득점왕: {topScorer}, 도움왕: {topAssister}",
            "🏁 [시즌 종료] {league}부 리그 막 내렸다! 챔피언 {champion} 등극!",
            "📋 [시즌 종료] {league}부 리그 최종 결과 발표! 우승팀은 {champion}!"
        ]

    };
}
    
// SNSManager 클래스 내부에 추가

// 시즌 우승 포스트 생성
generateSeasonChampionPost(teamKey, league, points) {
    const template = this.getRandomTemplate('seasonChampion');
    const templateData = {
        team: this.getTeamName(teamKey),
        league: league,
        points: points
    };

    const post = {
        id: this.postIdCounter++,
        type: 'season_champion',
        content: this.fillTemplate(template, templateData),
        hashtags: [`#${league}부리그`, `#우승`, `#${this.sanitizeHashtag(teamKey)}`, '#챔피언'],
        timestamp: Date.now(),
        likes: Math.floor(Math.random() * 2000) + 1000,
        comments: Math.floor(Math.random() * 500) + 100,
        shares: Math.floor(Math.random() * 200) + 50
    };

    this.posts.unshift(post);
    return post;
}

// 시즌 승격 포스트 생성
generateSeasonPromotionPost(teamKey, oldLeague, newLeague) {
    const template = this.getRandomTemplate('seasonPromotion');
    const templateData = {
        team: this.getTeamName(teamKey),
        newLeague: newLeague
    };

    const post = {
        id: this.postIdCounter++,
        type: 'season_promotion',
        content: this.fillTemplate(template, templateData),
        hashtags: [`#${newLeague}부리그`, `#승격`, `#${this.sanitizeHashtag(teamKey)}`],
        timestamp: Date.now(),
        likes: Math.floor(Math.random() * 800) + 200,
        comments: Math.floor(Math.random() * 150) + 30,
        shares: Math.floor(Math.random() * 80) + 20
    };

    this.posts.unshift(post);
    return post;
}

// 시즌 강등 포스트 생성
generateSeasonRelegationPost(teamKey, oldLeague, newLeague) {
    const template = this.getRandomTemplate('seasonRelegation');
    const templateData = {
        team: this.getTeamName(teamKey),
        newLeague: newLeague
    };

    const post = {
        id: this.postIdCounter++,
        type: 'season_relegation',
        content: this.fillTemplate(template, templateData),
        hashtags: [`#${newLeague}부리그`, `#강등`, `#${this.sanitizeHashtag(teamKey)}`],
        timestamp: Date.now(),
        likes: Math.floor(Math.random() * 400) + 100,
        comments: Math.floor(Math.random() * 100) + 20,
        shares: Math.floor(Math.random() * 30) + 5
    };

    this.posts.unshift(post);
    return post;
}

// 득점왕 포스트 생성
generateTopScorerPost(playerName, teamKey, goals, league) {
    const template = this.getRandomTemplate('topScorer');
    const templateData = {
        playerName: playerName,
        team: this.getTeamName(teamKey),
        goals: goals,
        league: league
    };

    const post = {
        id: this.postIdCounter++,
        type: 'top_scorer',
        content: this.fillTemplate(template, templateData),
        hashtags: [`#득점왕`, `#${this.sanitizeHashtag(playerName)}`, `#${league}부리그`, `#${this.sanitizeHashtag(teamKey)}`],
        timestamp: Date.now(),
        likes: Math.floor(Math.random() * 1500) + 500,
        comments: Math.floor(Math.random() * 300) + 50,
        shares: Math.floor(Math.random() * 100) + 30
    };

    this.posts.unshift(post);
    return post;
}

// 도움왕 포스트 생성
generateTopAssisterPost(playerName, teamKey, assists, league) {
    const template = this.getRandomTemplate('topAssister');
    const templateData = {
        playerName: playerName,
        team: this.getTeamName(teamKey),
        assists: assists,
        league: league
    };

    const post = {
        id: this.postIdCounter++,
        type: 'top_assister',
        content: this.fillTemplate(template, templateData),
        hashtags: [`#도움왕`, `#${this.sanitizeHashtag(playerName)}`, `#${league}부리그`, `#${this.sanitizeHashtag(teamKey)}`],
        timestamp: Date.now(),
        likes: Math.floor(Math.random() * 1200) + 400,
        comments: Math.floor(Math.random() * 250) + 40,
        shares: Math.floor(Math.random() * 80) + 20
    };

    this.posts.unshift(post);
    return post;
}

// 시즌 종료 이벤트 핸들러 (endSeason.js에서 호출)
onSeasonEnd(seasonData) {
    console.log('📢 SNS: 시즌 종료 이벤트 처리 시작');
    
    // 1. 각 리그 우승팀 포스트
    if (seasonData.champions) {
        seasonData.champions.forEach(champion => {
            this.generateSeasonChampionPost(champion.team, champion.league, champion.points);
        });
    }
    
    // 2. 승격팀 포스트
    if (seasonData.promotions) {
        seasonData.promotions.forEach(promo => {
            this.generateSeasonPromotionPost(promo.team, promo.from, promo.to);
        });
    }
    
    // 3. 강등팀 포스트
    if (seasonData.relegations) {
        seasonData.relegations.forEach(rel => {
            this.generateSeasonRelegationPost(rel.team, rel.from, rel.to);
        });
    }
    
    // 4. 각 리그 득점왕 포스트
    if (seasonData.topScorers) {
        seasonData.topScorers.forEach(scorer => {
            this.generateTopScorerPost(scorer.playerName, scorer.team, scorer.goals, scorer.league);
        });
    }
    
    // 5. 각 리그 도움왕 포스트
    if (seasonData.topAssisters) {
        seasonData.topAssisters.forEach(assister => {
            this.generateTopAssisterPost(assister.playerName, assister.team, assister.assists, assister.league);
        });
    }
    
    console.log('✅ SNS: 시즌 종료 이벤트 처리 완료');
}

  // 수정된 generateMatchPost 함수
generateMatchPost(matchData) {
    if (!matchData || !gameData) return;

    const homeTeam = matchData.homeTeam;
    const awayTeam = matchData.awayTeam;
    const homeScore = matchData.homeScore;
    const awayScore = matchData.awayScore;
    const score = `${homeScore}-${awayScore}`;

    // 팀 전력 차이 계산
    const homeRating = this.calculateTeamRating(homeTeam);
    const awayRating = this.calculateTeamRating(awayTeam);
    const strengthDiff = Math.abs(homeRating - awayRating);
    
    let template;
    let templateData = {};

    if (homeScore === awayScore) {
        // 무승부 처리
        if (strengthDiff > 10) {
            // 전력차가 큰 경우의 무승부는 강팀에게 불리한 결과
            template = this.getRandomTemplate('matchResultDrawShocking');
            templateData = {
                strongTeam: homeRating > awayRating ? this.getTeamName(homeTeam) : this.getTeamName(awayTeam),
                weakTeam: homeRating < awayRating ? this.getTeamName(homeTeam) : this.getTeamName(awayTeam),
                score: score
            };
        } else {
            // 일반적인 무승부 - 새로운 템플릿 사용
            template = this.getRandomTemplate('matchResultDraw');
            templateData = {
                homeTeam: this.getTeamName(homeTeam),
                awayTeam: this.getTeamName(awayTeam),
                score: score
            };
        }
    } else {
        // 승부가 결정된 경우만 winTeam/loseTeam 계산
        const winTeam = homeScore > awayScore ? homeTeam : awayTeam;
        const loseTeam = homeScore > awayScore ? awayTeam : homeTeam;
        const winnerRating = homeScore > awayScore ? homeRating : awayRating;
        const loserRating = homeScore > awayScore ? awayRating : homeRating;
        
        // 기본 템플릿 데이터 (모든 경우에 공통)
        templateData = {
            winTeam: this.getTeamName(winTeam),
            loseTeam: this.getTeamName(loseTeam),
            homeTeam: this.getTeamName(homeTeam),
            awayTeam: this.getTeamName(awayTeam),
            score: score
        };

        // 이변 여부 판단: 약한 팀이 강한 팀을 이겼는가?
        const isUpset = winnerRating < loserRating;

        if (isUpset && strengthDiff > 10) {
            // 이변! 약팀이 강팀을 이kim
            template = this.getRandomTemplate('matchResultShocking');
        } else if (!isUpset && strengthDiff > 15) {
            // 예상된 결과: 강팀이 약팀을 큰 차이로 이김
            template = this.getRandomTemplate('matchResultExpected');
        } else {
            // 일반적인 결과
            template = this.getRandomTemplate('matchResultNormal');
        }
    }

    // 득점자 정보 추가
    const goalScorers = this.extractGoalScorers(matchData.events);
    let goalInfo = '';
    if (goalScorers.length > 0) {
        goalInfo = `\n득점: ${goalScorers.join(', ')}`;
    }

    // 해시태그 생성
    const hashtags = this.generateHashtags(homeTeam, awayTeam, matchData);

    const post = {
        id: this.postIdCounter++,
        type: 'match_result',
        content: this.fillTemplate(template, templateData) + goalInfo,
        hashtags: hashtags,
        timestamp: Date.now(),
        likes: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 200) + 10,
        shares: Math.floor(Math.random() * 50) + 5
    };

    this.posts.unshift(post);
    return post;
}

    // 이적 포스트 생성
    generateTransferPost(playerName, fromTeam, toTeam, transferFee, isRumor = false) {
        const templateType = isRumor ? 'transferRumor' : 'transferConfirmed';
        const template = this.getRandomTemplate(templateType);
        
        const templateData = {
            playerName: playerName,
            newTeam: this.getTeamName(toTeam),
            originalTeam: this.getTeamName(fromTeam),
            transferFee: transferFee ? `${transferFee}억원` : '비공개 금액'
        };

        const hashtags = [
            `#transfer`,
            `#${this.sanitizeHashtag(fromTeam)}`,
            `#${this.sanitizeHashtag(toTeam)}`,
            `#${this.sanitizeHashtag(playerName)}`
        ];

        const post = {
            id: this.postIdCounter++,
            type: isRumor ? 'transfer_rumor' : 'transfer_confirmed',
            content: this.fillTemplate(template, templateData),
            hashtags: hashtags,
            timestamp: Date.now(),
            likes: Math.floor(Math.random() * 500) + 50,
            comments: Math.floor(Math.random() * 100) + 5,
            shares: Math.floor(Math.random() * 30) + 2
        };

        this.posts.unshift(post);
        return post;
    }

    // 랜덤 AI 소식 생성 (이적 루머 제외)
    generateRandomAINews() {
        if (Math.random() < 0.2) { // 20% 확률
            this.generateAIMatchPreview();
        }
    }

    // AI 경기 미리보기 생성 (같은 디비전끼리만)
generateAIMatchPreview() {
    // 현재 선택된 팀의 디비전 확인
    const currentDivision = gameData.currentLeague;
    
    // 같은 디비전의 다른 팀들만 필터링
    const sameLeagueTeams = Object.keys(allTeams).filter(teamKey => {
        // 현재 선택된 팀 제외
        if (teamKey === gameData.selectedTeam) return false;
        
        // 같은 리그(디비전)인지 확인
        const teamLeague = allTeams[teamKey].league || 1; // 기본값 1
        return teamLeague === currentDivision;
    });
    
    console.log(`현재 디비전: ${currentDivision}`);
    console.log('같은 디비전 팀들:', sameLeagueTeams);
    
    if (sameLeagueTeams.length >= 2) {
        const team1 = sameLeagueTeams[Math.floor(Math.random() * sameLeagueTeams.length)];
        const team2 = sameLeagueTeams.filter(t => t !== team1)[Math.floor(Math.random() * (sameLeagueTeams.length - 1))];
        
        const previews = [
            `🔥 주목할 만한 경기! ${this.getTeamName(team1)} vs ${this.getTeamName(team2)} 오늘 밤 대격돌!`,
            `⚡ 빅 매치 예고! ${this.getTeamName(team1)}과 ${this.getTeamName(team2)}의 운명적 대결`,
            `🎯 클래시코! ${this.getTeamName(team1)} 대 ${this.getTeamName(team2)}, 승자는?`,
            `⚽ 리그 주요 경기! ${this.getTeamName(team1)} vs ${this.getTeamName(team2)} 예상!`,
            `🏆 ${currentDivision}부 리그 경기! ${this.getTeamName(team1)} 대 ${this.getTeamName(team2)}`
        ];

        const post = {
            id: this.postIdCounter++,
            type: 'match_preview',
            content: previews[Math.floor(Math.random() * previews.length)],
            hashtags: [`#${this.sanitizeHashtag(team1)}`, `#${this.sanitizeHashtag(team2)}`, '#preview', `#${currentDivision}부리그`],
            timestamp: Date.now(),
            likes: Math.floor(Math.random() * 300) + 30,
            comments: Math.floor(Math.random() * 80) + 5,
            shares: Math.floor(Math.random() * 20) + 1
        };

        this.posts.unshift(post);
        console.log('같은 디비전 경기 미리보기 생성:', post.content);
    } else {
        console.log('같은 디비전에 충분한 팀이 없어 경기 미리보기를 생성하지 않음');
    }
}

    // 유틸리티 함수들
    getRandomTemplate(templateType) {
        const templates = this.templates[templateType];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    fillTemplate(template, data) {
        let result = template;
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            result = result.replace(regex, data[key]);
        });
        return result;
    }

    getTeamName(teamKey) {
        if (typeof teamNames !== 'undefined' && teamNames[teamKey]) {
            return teamNames[teamKey];
        }
        if (typeof allTeams !== 'undefined' && allTeams[teamKey]) {
            return teamKey.replace(/_/g, ' ');
        }
        return teamKey;
    }

    calculateTeamRating(teamKey) {
        if (teamKey === gameData.selectedTeam) {
            return window.calculateTeamRating ? window.calculateTeamRating() : 75;
        }
        return window.calculateOpponentTeamRating ? window.calculateOpponentTeamRating(teamKey) : 75;
    }

    extractGoalScorers(events) {
        if (!events) return [];
        
        return events
            .filter(event => event.type === 'goal')
            .map(event => event.scorer)
            .filter(scorer => scorer);
    }

    generateHashtags(homeTeam, awayTeam, matchData) {
        const hashtags = [
            `#${this.sanitizeHashtag(homeTeam)}`,
            `#${this.sanitizeHashtag(awayTeam)}`
        ];
        
        if (matchData.homeScore === matchData.awayScore) {
            hashtags.push('#무승부');
        } else {
            hashtags.push('#승부');
        }
        
        return hashtags;
    }

    sanitizeHashtag(text) {
        return text.replace(/[^a-zA-Z0-9가-힣]/g, '');
    }

    estimateTransferFee(player) {
        let base = 500;
        const ratingFactor = Math.pow(player.rating / 70, 2);
        base *= ratingFactor;
        
        if (player.age <= 25) base *= 1.2;
        else if (player.age >= 30) base *= 0.8;
        
        return Math.round(base * (0.8 + Math.random() * 0.4));
    }

    // SNS 피드 표시
    displayFeed(containerId = 'snsFeed', limit = 10) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        
        const postsToShow = this.posts.slice(0, limit);
        
        if (postsToShow.length === 0) {
            container.innerHTML = '<div class="sns-empty">아직 소식이 없습니다.</div>';
            return;
        }

        postsToShow.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const postEl = document.createElement('div');
        postEl.className = `sns-post sns-post-${post.type}`;
        
        const timeAgo = this.formatTimeAgo(post.timestamp);
        
        postEl.innerHTML = `
            <div class="sns-post-content">
                ${post.content}
            </div>
            <div class="sns-post-hashtags">
                ${post.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join(' ')}
            </div>
            <div class="sns-post-footer">
                <span class="sns-time">${timeAgo}</span>
                <div class="sns-interactions">
                    <span class="sns-likes">❤️ ${post.likes}</span>
                    <span class="sns-comments">💬 ${post.comments}</span>
                    <span class="sns-shares">📤 ${post.shares}</span>
                </div>
            </div>
        `;
        
        return postEl;
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}일 전`;
        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    }

    // 정기적 업데이트
    update() {
        const now = Date.now();
        if (now - this.lastUpdateTime > 300000) { // 5분마다
            this.generateRandomAINews();
            this.lastUpdateTime = now;
        }
    }

    // 게임 이벤트 연동
    onMatchEnd(matchData) {
        this.generateMatchPost(matchData);
    }

    onPlayerTransfer(playerName, fromTeam, toTeam, transferFee) {
        this.generateTransferPost(playerName, fromTeam, toTeam, transferFee, false);
    }

    // 저장/불러오기
    getSaveData() {
        return {
            posts: this.posts,
            postIdCounter: this.postIdCounter,
            lastUpdateTime: this.lastUpdateTime
        };
    }

    loadSaveData(saveData) {
        if (saveData.posts) this.posts = saveData.posts;
        if (saveData.postIdCounter) this.postIdCounter = saveData.postIdCounter;
        if (saveData.lastUpdateTime) this.lastUpdateTime = saveData.lastUpdateTime;
    }

    // 초기화
    reset() {
        this.posts = [];
        this.postIdCounter = 1;
        this.lastUpdateTime = Date.now();
    }
}

// 전역 SNS 매니저 인스턴스
const snsManager = new SNSManager();

// SNS 탭 표시 함수
function showSNSTab() {
    // SNS 피드가 표시될 컨테이너가 있는지 확인
    const feedContainer = document.getElementById('snsFeed');
    if (feedContainer && typeof snsManager !== 'undefined') {
        // 최신 피드 표시 (15개 제한)
        snsManager.displayFeed('snsFeed', 15);
    } else {
        console.log('SNS 시스템이 아직 초기화되지 않았습니다.');
    }
}

// 기존 게임과의 연동 함수들
function initializeSNSSystem() {
    // 기존 경기 종료 함수 확장
    if (typeof window.endMatch === 'function') {
        const originalEndMatch = window.endMatch;
        window.endMatch = function(matchData) {
            originalEndMatch.call(this, matchData);
            // 경기 후 SNS 포스트 생성
            setTimeout(() => {
                snsManager.onMatchEnd(matchData);
                if (document.getElementById('snsFeed')) {
                    snsManager.displayFeed();
                }
            }, 2000);
        };
    }

    // 기존 이적 함수 확장
    if (typeof window.transferSystem !== 'undefined') {
        const originalSignPlayer = window.transferSystem.signPlayer;
        window.transferSystem.signPlayer = function(player) {
            const result = originalSignPlayer.call(this, player);
            if (result.success) {
                snsManager.onPlayerTransfer(
                    player.name, 
                    player.originalTeam, 
                    gameData.selectedTeam, 
                    player.price
                );
                if (document.getElementById('snsFeed')) {
                    snsManager.displayFeed();
                }
            }
            return result;
        };
    }

    // 정기 업데이트 시작
    setInterval(() => {
        snsManager.update();
        if (document.getElementById('snsFeed')) {
            snsManager.displayFeed();
        }
    }, 60000); // 1분마다 체크
}

// 게임 저장/불러오기에 SNS 데이터 포함
function extendSaveSystem() {
    if (typeof window.gameData !== 'undefined') {
        const originalSaveGame = window.saveGame;
        if (originalSaveGame) {
            window.saveGame = function() {
                window.gameData.snsData = snsManager.getSaveData();
                originalSaveGame.call(this);
            };
        }

        const originalLoadGame = window.loadGame;
        if (originalLoadGame) {
            window.loadGame = function(event) {
                const result = originalLoadGame.call(this, event);
                if (window.gameData.snsData) {
                    snsManager.loadSaveData(window.gameData.snsData);
                }
                return result;
            };
        }
    }
}

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeSNSSystem();
        extendSaveSystem();
    }, 1000);
});

// 전역으로 노출
window.snsManager = snsManager;
window.showSNSTab = showSNSTab;
window.initializeSNSSystem = initializeSNSSystem;
