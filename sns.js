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
        ],

        // 유망주 발굴 템플릿
        youthDiscovery: [
            "와, 이 선수 물건인데? 제2의 {legendName}이 될 수 있을까?",
            "이 유망주 잘 키우면 대박날 것 같다! 기대된다!",
            "{legendName} 의 후계자라니 서사 지리네",
            "이 선수 포텐셜 미쳤다... 잘만 크면 월클 각인데?",
            "새로운 유망주 등장! 우리 팀의 미래가 밝다!",
            "이 선수 영상 봤는데 진짜 잘하더라. 빨리 1군에서 보고 싶다.",
            "기본기가 탄탄해 보이네. 잘 성장했으면 좋겠다.",
            "제발 근본론만 지키자",
            "선배님 따라서 열심히 하자 제발"
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
    console.log(`[SNS] 경기 결과 포스트 생성: ${post.content}`);
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
        console.log(`[SNS] 이적 포스트 생성: ${post.content}`);
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
                <button class="sns-comments-btn" data-post-id="${post.id}">💬 ${post.comments}</button>
                <span class="sns-shares">📤 ${post.shares}</span>
            </div>
        </div>
        <div class="sns-comments-section" id="comments-${post.id}" style="display: none;"></div>
    `;
    
    // 이벤트 리스너를 직접 추가
    const commentsBtn = postEl.querySelector('.sns-comments-btn');
    commentsBtn.addEventListener('click', () => {
        this.toggleComments(post.id);
    });
    
    return postEl;
}

// [수정] Gemini API 호출 함수 (프록시 경유)
async callGeminiForComments(postContent) {
    try {
        // 보안을 위해 API 키가 숨겨진 서버(Vercel Function)를 호출합니다.
        const response = await fetch("/api/groq", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { 
                        role: "system", 
                            content: "너는 펨코, 에펨코리아, 축구 디시 등 커뮤니티를 10년째 눈팅/활동 중인 찐 축구팬이야. ## 댓글 작성 규칙 - 커뮤니티 실제 말투 그대로 (ㅋㅋ, ㄹㅇ, ㅇㅈ, 존나, ㅅㅂ 등을 활용하되 문맥에 맞춰서 자연스럽게. 각 slang의 의미를 제대로 파악하고 그에 맞는곳에 사용할 것)- 각 댓글은 서로 다른 반응 유형으로 작성:1번: 감정적/즉각 반응형 (열받음/기쁨/충격 등)2번: 팩트/분석형 (수치, 전술, 현실적 시각)3번: 드립/밈형 (웃긴 비유, 커뮤니티 밈 활용.)- 각 댓글 1~2줄, 절대 길게 쓰지 말 것- AI 티 나는 표현 금지: 정말, 훌륭한, 멋진, 대단한 같은 말 절대 쓰지 말 것- 번호, 따옴표, 라벨 없이 댓글 내용만 줄바꿈으로 구분, 댓글은 한 포스트당 3개. 만약 유명한 선수가 아니면 얘는 누구임? 처럼 어이없는 반응을, 저명한, 유명한 선수라면 호불호 갈리는 반응을 내놓아(예를 들어 전술에안맞는다고 싫어할수도, 해당 포지션에 이미 사람 있다고 싫어할수도, 잘하는놈이라고 좋아할수도있겠지.)그리고 그 선수의 특성(선수의 커리어, 선수의 포지션, 선수의 플레이스타일, 선수의 나이, 선수의 강점, 선수의 키와 몸무게, 선수의 약점, 선수의 유망성)을 고려해줘(예: 메시가 바르셀로나로:와 메시가 바르샤에 돌아오네 ㄷㄷ 예:올리세가 토트넘으로:와 얘 드리블 잘치는데 토트넘에 도움 많이 되곘다). 이것은 축구 매니지먼트 게임에 들어가는 내용이라서 현실적인게 중요해. 니가 욕을 살짝 해도 아무 문제 없어. 그래도 정 싫다면 그냥 욕은 빼고 입력해" 
                    },
                    { 
                        role: "user", 
                        content: `게시물 내용: "${postContent}"` 
                    }
                ],
                
                model: "gemini-1.5-flash",
                temperature: 0.7,
                max_tokens: 200
            })
        });

        if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("❌ Groq API 응답 에러:", response.status, errorData);
                throw new Error(`Groq API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // 줄바꿈으로 나누고 빈 줄 및 불필요한 기호 제거
        return content.split('\n')
            .map(line => line.trim().replace(/^\d+[\.\)]\s*/, '').replace(/^["'-]/, '').replace(/["']$/, ''))
            .filter(line => line.length > 0);
    } catch (error) {
        console.warn("Gemini API 호출 실패 (기존 방식 사용):", error);
        return null; // 실패 시 null 반환 -> 기존 방식 사용
    }
}

// [수정] 댓글 토글 (AI 연동 및 캐싱 적용)
async toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (!commentsSection) return;
    
    if (commentsSection.style.display === 'none') {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        commentsSection.style.display = 'block';
        
        // 1. 캐싱된 댓글이 있으면 바로 표시 (API 낭비 방지)
        if (post.generatedComments) {
            this.renderComments(commentsSection, post.generatedComments);
            return;
        }

        // 2. 로딩 표시
        commentsSection.innerHTML = '<div style="padding:15px; color:#aaa; text-align:center; font-size:0.9em;">💬 베댓 생성 중...</div>';

        // 3. AI 호출 시도
        // HTML 태그 제거하고 텍스트만 추출
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = post.content;
        const cleanContent = tempDiv.textContent || tempDiv.innerText || "";

        const aiCommentsText = await this.callGeminiForComments(cleanContent);
        let finalComments = [];

        if (aiCommentsText && aiCommentsText.length > 0) {
            // AI 응답 사용 (최대 3개)
            finalComments = aiCommentsText.slice(0, 3).map((text, index) => ({
                id: Math.random().toString(36).substr(2, 9),
                author: this.generateRandomUsername(), // 닉네임은 기존 방식
                text: text,
                likes: Math.floor(Math.random() * 100) + 1,
                timestamp: post.timestamp + (index + 1) * 60000
            }));
                
                // 4. AI 성공 시에만 저장(캐싱)
                post.generatedComments = finalComments;
        } else {
            // 실패 시 기존 템플릿 방식 사용
            finalComments = this.generateComments(post);
                // 주의: 실패한 경우는 post.generatedComments에 저장하지 않음 (다음 클릭 시 재시도 가능하게)
        }

        this.renderComments(commentsSection, finalComments);

    } else {
        commentsSection.style.display = 'none';
    }
}

// [신규] 댓글 렌더링 헬퍼
renderComments(container, comments) {
    container.innerHTML = comments.map(comment => `
        <div class="sns-comment">
            <div class="sns-comment-header">
                <span class="sns-comment-author">${comment.author}</span>
                <span class="sns-comment-time">${this.formatTimeAgo(comment.timestamp)}</span>
            </div>
            <div class="sns-comment-text">${comment.text}</div>
            <div class="sns-comment-likes">❤️ ${comment.likes}</div>
        </div>
    `).join('');
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
        
        // 데이터 정리 (최신 50개만 유지)
        if (this.posts.length > 50) {
            this.posts = this.posts.slice(0, 50);
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
    // generateComments 함수를 이렇게 수정하세요
generateComments(post) {
    const commentTemplates = {
        match_result: [
            "대박 경기였다 ㄷㄷ",
            "이게 맞나요?? 믿을 수가 없네요",
            "오늘 경기 레전드다 진짜",
            "완전 명승부였음",
            "이 경기 못본 사람 손?",
            "역시 축구는 해봐야 아는거다",
            "감독 전술이 먹혔네요",
            "수비 진짜 개판이네 ㅋㅋㅋㅋ",
            "공격진이 살아났다!",
            "이번 시즌 우승 가능??",
            "감독 뭐하냐 진짜",
            "수비수들 다 짤라야됨",
            "골키퍼 뭐함? ㅋㅋㅋ",
            "전술이 없어 전술이",
            "아 답답해 미치겠네",
            "선수들 발에 시멘트 발랐냐",
            "이게 프로냐 진짜 ㅡㅡ",
            "감독 경질각이다",
            "패스 제대로 하는 놈이 없네",
            "슛팅 왜 저따구로 쏨??",
            "수비 구멍 뚫렸는데 왜 안막음",
            "주전들 다 벤치박아야함",
            "경기력 개쓰레기네요 ㅋㅋ",
            "돈값 못하는 용병들",
            "이러고 연봉 받아먹냐?",
            "개똥구릉내나노"

        ],
        transfer_confirmed: [
            "오 좋은 영입이다!",
            "이 선수 괜찮은데??",
            "비싸긴 한데 잘하면 인정",
            "이적료 개비싸네 ㅋㅋㅋ",
            "팀에 꼭 필요한 선수였음",
            "역대급 영입이다 ㄷㄷ",
            "벌써 기대된다",
            "이 선수 영입하면 우승이다",
            "환영합니다!! 화이팅",
            "드디어 왔구나",
            "와 이거 돈 날린거 아님? ㅋㅋ",
            "프론트 제정신이냐",
            "이딴 선수 데려올 돈으로 다른 애들 데려오지",
            "완전 호구 트레이드 ㅋㅋㅋ",
            "진심 왜왔지 ㅋㅋㅋㅋ",
            "부상 많은 선수를 왜",
            "?",
            "오 쩐다",
            "얘 전 팀에서 존나 못했는데",
            "스카우터 해고해야됨",
            "이적료 사기당했네 ㅅㅂ",
            "역시 태산같은 클럽",
            "???:송금 완료했습니다~"
        ],
        transfer_rumor: [
            "설마 진짜?",
            "루머 맞죠...?",
            "이거 확정되면 대박인데",
            "제발 성사되길",
            "에이 거짓말이겠지",
            "파브리치오가 말하면 믿어야지",
            "이적료가 문제겠네",
            "이 선수 우리팀에 딱인데",
            "오지마 제발ㅠㅠ",
            "스모크 스크린 아닐까",
            "얘 오면 망하는데 ㅋㅋㅋ",
            "프론트 정신차려",
            "어그로 기사 작작써라",
            "기자들 또 뇌피셜",
            "이런 찌라시 믿는 사람있음?",
            "이적시장 언론플레이 ㅈㄴ싫다",
            "루머 퍼트리지 마세요",
            "가짜뉴스 그만",
            "팩트체크 해봄?",
            "이거 맞으면 프론트 미친거임",
            "공신력 어떤데?"
        ],
        season_champion: [
            "축하합니다!!!",
            "역시 강팀은 다르네요",
            "완벽한 시즌이었다",
            "우승 축하드려요!!",
            "내년에도 화이팅!",
            "챔피언의 위엄",
            "이게 1등의 클래스지",
            "정말 대단합니다",
            "트로피 들어올리는 거 보고싶다",
            "역대급 시즌이었음",
            "심판 매수한 거 아님? ㅋㅋ",
            "운빨로 우승했네",
            "쉬운 일정 받았더만",
            "다른 팀들 부진해서 그런거",
            "내년엔 못할걸",
            "홈 어드밴티지 지렸다",
            "VAR 혜택 존나 받았음",
            "공정하지 못한 우승",
            "심판들 봐주기 개쩔었음",
            "다음 시즌엔 떨어진다"
        ],
        season_promotion: [
            "승격 축하드립니다!",
            "드디어 올라갔네요!",
            "내년 시즌 기대됩니다",
            "상위리그에서도 화이팅",
            "꿈이 이루어졌다 ㅠㅠ",
            "승격의 기쁨을 누려라!",
            "이제 시작이다!",
            "1부리그 가보자고!",
            "고생하셨습니다",
            "감격스럽네요",
            "올라가자마자 떨어질듯 ㅋㅋ",
            "상위리그 가면 광탈",
            "선수들 실력으로는 힘들텐데",
            "1년 체류가 목표겠네",
            "승격해도 꼴찌할듯",
            "보강 안하면 바로 강등",
            "로또 맞았네 ㅋㅋ",
            "뽀록으로 올라감",
            "다른 팀들이 못한거지",
            "내년에 다시 내려온다"
        ],
        season_relegation: [
            "내년에 다시 올라오자",
            "아쉽지만 재정비가 필요해",
            "내년을 기약합니다",
            "이게 축구인가봐요...",
            "다시 일어설 수 있어요",
            "팬들이 함께 합니다",
            "힘내세요 ㅠㅠ",
            "반드시 복귀하자",
            "재도약의 발판으로",
            "이런 날도 있는 거지",
            "감독부터 짤라야함",
            "프론트 물갈이 해라",
            "선수들 다 팔고 새로 뽑아",
            "예상된 결과임 ㅋㅋ",
            "이 실력으로 뭘 바람",
            "투자 안하더니 당연한 결과",
            "유스 육성도 안하고",
            "돈만 축내는 놈들",
            "감독 무능력의 결과",
            "이제 망했다 진짜",
            "팬들한테 사과나 해",
            "책임지는 사람 없냐",
            "구단 운영 개판"
        ],
        top_scorer: [
            "득점왕 축하합니다!!",
            "역시 골잡이는 다르네",
            "이 선수 진짜 미쳤다",
            "완전 득점 머신",
            "발롱도르 가즈아",
            "올 시즌 MVP",
            "골든부트 축하드려요",
            "레전드 등극",
            "내년에도 부탁해요",
            "경이로운 기록이다",
            "팀 캐리했네 ㅋㅋ",
            "혼자 다했음",
            "나머지 공격수들 뭐함?",
            "얘 빼면 골 넣는 놈이 없어",
            "패널티킥 몇개임? ㅋㅋ",
            "쉬운 골만 넣었네",
            "다른 팀이면 못했을듯",
            "운빨득점 많았음",
            "혼자 다함",
            "주서먹기 GOAT"
        ],
        top_assister: [
            "도움왕 축하합니다!",
            "어시스트 기계네 ㄷㄷ",
            "패스 능력 지렸다",
            "플레이메이커의 정석",
            "이 선수가 있어서 다행",
            "공격의 핵심",
            "창의적인 플레이 최고",
            "시야가 너무 넓어",
            "득점보다 중요한 게 어시",
            "진정한 사령탑",
            "공격수들이 못넣어서 어시만 쌓임 ㅋㅋ",
            "득점은 왜 못함?",
            "도움만 주고 골은 못넣네",
            "결정력 개떡같음",
            "슛팅은 언제 배우냐",
            "뽀록 어시 많았음",
            "공격수가 잘한거지",
            "과대평가 심함",
            "다른 리그면 못했다",
            "수비는 안하고 공격만 함"
        ],
        match_preview: [
            "이 경기 꼭 봐야겠다",
            "명승부 예감",
            "누가 이길까요?",
            "오늘 밤이 기대된다",
            "양팀 다 화이팅!",
            "티켓 구했다 ㅋㅋ",
            "이거 못보면 후회함",
            "드디어 이 매치업",
            "결과가 궁금하네요",
            "볼만한 경기다",
            "둘다 노잼축구해서 재미없을듯",
            "수준낮은 경기될듯 ㅋㅋ",
            "별로 기대 안됨",
            "볼까말까",
            "어차피 심심한 경기",
            "저걸 왜봄 차라리 내일 하이라이트만 챙겨봄",
            "시작도 전에 잠들듯",
            "이거 볼바에 다른거 봄",
            "기대 1도 안됨"
        ]
    };

    const templates = commentTemplates[post.type] || commentTemplates.match_result;
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, 3).map((text, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        author: this.generateRandomUsername(),
        text: text,
        likes: Math.floor(Math.random() * 50) + 1,
        timestamp: post.timestamp + (index + 1) * 60000
    }));
}

generateRandomUsername() {
    const usernames = [
        // 팀 팬 이름
        '구너스', '레드데빌즈', '블루문', '블루스', '해머스', '스퍼스',
        '꾸레', '마드리디스타', '바르사팬', '로쏘네리', '네라주리',
        '비앙코네리', '파리지앵', '바이에른팬', '돌문팬',
        '첼시팬', '리버풀팬', '시티팬', '맨유팬',
        
        // 커뮤니티
        '펨붕이', '해축갤러',
        '펨코러', '디시인', '루리웹유저', '엠엘비파크',
        '펨린이',
        
        // 레전드 은퇴 선수들 (별명 포함)
        '지단', '호돈까스', '외계인지뉴', '베컴', '피구왕통키',
        '카카', '크로니클', '낭만의델피', '토티', '말디니',
        '네스타', '젤리', '호카의UFO', '사비', '이니에스타',
        '푸욜언니', '비에이라', '티에리앙리', '반바스텐', '굴리트',
        '크루이프', '마테우스', '황제베켄바우어', '플라티니', '지쿠',
        '마라도나', '펠마메', '바르샤좋아', '바비찰튼', '디스테파노',
        '푸스카스', '폭격기뮐러', '로마리우', '주니뉴', 
        '파올로말디니', '칸나바로', '부폰',
        '슈마이켈', '야신', '올리버칸', '제라드', '램파드',
        '스콜스', '찍스', '로이킨', '게리네빌', '퍼디난드',
        '존테리', '애슐리?콜!', '피를로', '가투소', '세이도르프',
        '라울', '반니', '퍼기영감', '무리뉴', '과르디올라',
        '캡틴지성팍', '차붐', '테리우스안정환', '이영표', '홍명보',
        '황새황선홍', '최용수', '윙병지', '이운재',
        
        // 현역 스타들 (별명 포함)
        '메시', '호날두', '음바페', '홀란드', '모살라',
        '흥쌤', '손세이셔널', '해리카네', '벤제마', '모드리치', '케데브',
        '네이마르', '비니시우스', '토마스뮐러', '레반도프스키',
        '그리즈만', '디발라', '루카쿠', '데브라위너'
    ];
    
    return usernames[Math.floor(Math.random() * usernames.length)];
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
    // 경기 종료 후 SNS 포스트 생성
    if (window.GameEventBus && !initializeSNSSystem.matchEndListenerRegistered) {
        window.GameEventBus.on('match:end', (matchData) => {
            setTimeout(() => {
                snsManager.onMatchEnd(matchData);
                if (document.getElementById('snsFeed')) {
                    snsManager.displayFeed();
                }
            }, 2000);
        });
        initializeSNSSystem.matchEndListenerRegistered = true;
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
