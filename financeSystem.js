// financeSystem.js - 구단 전체 예산, FFP(재정적 페어플레이), 보드진 평가(성적/재정/종합), 수입·지출 가계부 시스템

(function () {
    function round1(val) {
        const n = Number(val) || 0;
        return Math.round(n * 10) / 10;
    }

    function round2(val) {
        const n = Number(val) || 0;
        return Math.round(n * 100) / 100;
    }

    function getLeagueId() {
        if (typeof gameData === 'undefined' || !gameData || !gameData.selectedTeam) return null;
        if (typeof LeagueManager !== 'undefined' && typeof LeagueManager.getLeagueIdByTeam === 'function') {
            return LeagueManager.getLeagueIdByTeam(gameData.selectedTeam);
        }
        return null;
    }

    function getFFPLimitByLeague() {
        const lid = getLeagueId();
        const limits = {
            premier_league: 550,
            laliga: 480,
            bundesliga: 450,
            serie_a: 450,
            ligue_1: 380,
            efl_championship: 260,
            eredivisie: 260,
            liga_portugal: 260,
            super_lig: 260,
            mls: 220,
            kleague_1: 180
        };
        if (lid && limits[lid]) return limits[lid];
        const div = (typeof gameData !== 'undefined' && gameData) ? (gameData.currentLeague || 1) : 1;
        if (div === 1) return 450;
        if (div === 2) return 280;
        return 180;
    }

    function getBroadcastPerMatchByLeague() {
        const lid = getLeagueId();
        const rates = {
            premier_league: 34,
            laliga: 28,
            bundesliga: 26,
            serie_a: 26,
            ligue_1: 22,
            efl_championship: 15,
            eredivisie: 14,
            liga_portugal: 14,
            super_lig: 13,
            mls: 12,
            kleague_1: 8
        };
        if (lid && rates[lid]) return rates[lid];
        const div = (typeof gameData !== 'undefined' && gameData) ? (gameData.currentLeague || 1) : 1;
        if (div === 1) return 26;
        if (div === 2) return 15;
        return 9;
    }

    function createEmptyBreakdown() {
        return {
            income: {
                matchday: 0,      // 매치데이 티켓/스카이박스/메가스토어
                broadcast: 0,     // TV 중계권 & 경기 수당
                sponsor: 0,       // 스폰서 계약금 및 수당
                transferSales: 0, // 선수 매각 수입
                prizes: 0,        // 리그/컵/승격 상금
                other: 0
            },
            expense: {
                wages: 0,             // 선수단 주급 지출
                operating: 0,         // 구단 운영·유지비
                transferPurchases: 0, // 선수 영입 지출
                infrastructure: 0,    // 구장 증축·시설 투자 (FFP 50% 감면)
                ffpFine: 0,           // FFP 위반 벌금
                other: 0
            }
        };
    }

    function scoreToGrade(score) {
        if (score >= 90) return 'S';
        if (score >= 80) return 'A';
        if (score >= 68) return 'B';
        if (score >= 54) return 'C';
        if (score >= 40) return 'D';
        return 'F';
    }

    class FinanceSystem {
        ensureState() {
            if (typeof gameData === 'undefined' || !gameData) return null;

            if (!gameData.finance || typeof gameData.finance !== 'object') {
                this.initForTeam(gameData.selectedTeam);
                return gameData.finance;
            }

            const f = gameData.finance;
            if (typeof f.clubBalance !== 'number' || !Number.isFinite(f.clubBalance)) {
                const baseMoney = Math.max(0, Number(gameData.teamMoney) || 0);
                const wageBudget = Math.max(Number(gameData.wageBudget) || 0, Number(gameData.totalWeeklyWage) || 0);
                const squadBudget = baseMoney + wageBudget * 52;
                // 실제 구단은 전체 자금의 ~60%만 이적·주급 예산으로 배정하고 나머지는 운영·시설 유보금으로 보유
                f.clubBalance = round1(Math.round(squadBudget * 1.55 + 400));
            }
            if (!f.breakdown || !f.breakdown.income || !f.breakdown.expense) {
                f.breakdown = createEmptyBreakdown();
            } else {
                const empty = createEmptyBreakdown();
                f.breakdown.income = { ...empty.income, ...f.breakdown.income };
                f.breakdown.expense = { ...empty.expense, ...f.breakdown.expense };
            }
            if (!Array.isArray(f.ledger)) f.ledger = [];
            if (!Array.isArray(f.seasonHistory)) f.seasonHistory = [];
            if (typeof f.consecutiveFFPBreaches !== 'number') f.consecutiveFFPBreaches = 0;
            if (typeof f.pendingPointDeduction !== 'number') f.pendingPointDeduction = 0;

            return f;
        }

        initForTeam(teamKey) {
            if (typeof gameData === 'undefined' || !gameData) return null;

            const transferBudget = Math.max(0, Number(gameData.teamMoney) || 0);
            let totalWage = Number(gameData.totalWeeklyWage) || 0;
            if (totalWage <= 0 && typeof calculateTotalWages === 'function' && teamKey) {
                totalWage = calculateTotalWages();
            }
            const wageBudget = Math.max(Number(gameData.wageBudget) || 0, totalWage);
            const squadBudget = transferBudget + wageBudget * 52;

            // 실제 구단은 전체 예산의 약 60% 내외만 선수단(이적+연간주급)에 배정하고 나머지는 운영·시설·비상 유보금으로 보유
            const initialBalance = round1(Math.round(squadBudget * 1.55 + 400));

            gameData.finance = {
                clubBalance: initialBalance,
                seasonStartBalance: initialBalance,
                breakdown: createEmptyBreakdown(),
                ledger: [
                    {
                        round: gameData.currentRound || 1,
                        season: gameData.seasonCount || 1,
                        type: 'info',
                        category: 'other',
                        label: '시즌 개시 구단 전체 예산 확정 (이적 + 연간 주급)',
                        amount: initialBalance,
                        balanceAfter: initialBalance
                    }
                ],
                seasonHistory: [],
                consecutiveFFPBreaches: 0,
                pendingPointDeduction: 0
            };

            return gameData.finance;
        }

        getClubBalance() {
            const f = this.ensureState();
            return f ? round1(f.clubBalance) : 0;
        }

        getSeasonTotals() {
            const f = this.ensureState();
            if (!f) {
                return { totalIncome: 0, totalExpense: 0, netProfit: 0, ffpExemptExpense: 0, ffpNet: 0 };
            }
            const inc = f.breakdown.income;
            const exp = f.breakdown.expense;
            const totalIncome = round1(
                (inc.matchday || 0) +
                (inc.broadcast || 0) +
                (inc.sponsor || 0) +
                (inc.transferSales || 0) +
                (inc.prizes || 0) +
                (inc.other || 0)
            );
            const totalExpense = round1(
                (exp.wages || 0) +
                (exp.operating || 0) +
                (exp.transferPurchases || 0) +
                (exp.infrastructure || 0) +
                (exp.ffpFine || 0) +
                (exp.other || 0)
            );
            const netProfit = round1(totalIncome - totalExpense);
            // UEFA FFP 규정 반영: 구장/인프라/유스 아카데미 투자는 50% FFP 적자 산정에서 감면
            const ffpExemptExpense = round1((exp.infrastructure || 0) * 0.5);
            const ffpNet = round1(netProfit + ffpExemptExpense);

            return { totalIncome, totalExpense, netProfit, ffpExemptExpense, ffpNet };
        }

        // 핵심 원장 기록: 전체 예산(clubBalance)에 수입/지출 반영
        recordTransaction(type, category, amount, label) {
            const f = this.ensureState();
            const val = round1(Math.abs(Number(amount) || 0));
            if (!f || val <= 0) return 0;

            if (type === 'income') {
                f.clubBalance = round1(f.clubBalance + val);
                if (f.breakdown.income[category] !== undefined) {
                    f.breakdown.income[category] = round1(f.breakdown.income[category] + val);
                } else {
                    f.breakdown.income.other = round1(f.breakdown.income.other + val);
                }
            } else {
                f.clubBalance = round1(f.clubBalance - val);
                if (f.breakdown.expense[category] !== undefined) {
                    f.breakdown.expense[category] = round1(f.breakdown.expense[category] + val);
                } else {
                    f.breakdown.expense.other = round1(f.breakdown.expense.other + val);
                }
            }

            f.ledger.unshift({
                round: (typeof gameData !== 'undefined' && gameData) ? (gameData.currentRound || 1) : 1,
                season: (typeof gameData !== 'undefined' && gameData) ? (gameData.seasonCount || 1) : 1,
                type,
                category,
                label: label || (type === 'income' ? '구단 수입' : '구단 지출'),
                amount: type === 'income' ? val : -val,
                balanceAfter: f.clubBalance
            });

            if (f.ledger.length > 40) {
                f.ledger.length = 40;
            }

            return f.clubBalance;
        }

        // FFP 상태 계산
        getFFPStatus() {
            const f = this.ensureState();
            const limit = getFFPLimitByLeague();
            const totals = this.getSeasonTotals();
            const balance = f ? f.clubBalance : 0;

            const weeklyWage = (typeof gameData !== 'undefined' && gameData) ? (Number(gameData.totalWeeklyWage) || 0) : 0;
            const projectedSeasonWages = round1(weeklyWage * 38);
            const matchesPlayed = Math.max(1, (typeof gameData !== 'undefined' && gameData) ? (gameData.matchesPlayed || 0) : 1);
            const projectedRevenue = matchesPlayed >= 3
                ? round1((totals.totalIncome / matchesPlayed) * 38)
                : round1(getBroadcastPerMatchByLeague() * 38 + 450);
            const wageRatio = projectedRevenue > 0 ? Math.round((projectedSeasonWages / projectedRevenue) * 100) : 100;

            // 적자 사용률 (0% ~ 150%+)
            const deficitUsed = Math.max(0, -totals.ffpNet);
            const deficitRatio = limit > 0 ? Math.round((deficitUsed / limit) * 100) : 0;

            let status = 'PASS';
            let label = '준수 (안전)';
            let color = '#10B981';
            let summary = 'FFP 허용 적자 한도 내에서 안정적으로 운영 중입니다.';

            if (totals.ffpNet < -limit || balance < -limit) {
                status = 'BREACH';
                label = '위반 (제재 대상)';
                color = '#EF4444';
                summary = `FFP 허용 적자 한도(-${limit}억)를 초과했습니다. 시즌 종료 시 벌금 및 예산 삭감 제재가 발동됩니다.`;
            } else if (totals.ffpNet < -limit * 0.75 || balance < 0) {
                status = 'WARNING';
                label = '경고 (위반 임박)';
                color = '#F97316';
                summary = '구단 잔고가 적자이거나 FFP 한도에 근접했습니다. 주급 절감 및 선수 매각이 시급합니다.';
            } else if (totals.ffpNet < -limit * 0.4 || wageRatio > 95) {
                status = 'WATCH';
                label = '주의 (감시 대상)';
                color = '#F59E0B';
                summary = '지출 비중이 높아 연맹의 재정 감시 대상입니다. 무리한 영입을 자제하세요.';
            }

            return {
                status,
                label,
                color,
                summary,
                limit,
                ffpNet: totals.ffpNet,
                deficitUsed,
                deficitRatio,
                wageRatio,
                balance,
                consecutiveBreaches: f ? f.consecutiveFFPBreaches : 0
            };
        }

        // 선수 매각 수익 중 이적 자금으로 환원되는 비율 (절대 100% 아님!)
        getTransferRetentionRate() {
            const f = this.ensureState();
            const ffp = this.getFFPStatus();
            const balance = f ? f.clubBalance : 0;

            let rate = 0.60;
            if (ffp.status === 'BREACH' || balance < 0) {
                rate = 0.25;
            } else if (ffp.status === 'WARNING') {
                rate = 0.40;
            } else if (ffp.status === 'WATCH') {
                rate = 0.50;
            } else if (balance >= 4000) {
                rate = 0.70;
            } else {
                rate = 0.60;
            }

            return Math.max(0.25, Math.min(0.75, round2(rate)));
        }

        // 선수 매각 정산: 전체 금액은 clubBalance 입금, 일부(retentionRate)만 teamMoney(이적 자금)로 환원
        recordPlayerSale(playerName, totalFee) {
            const fee = round1(Math.max(0, Number(totalFee) || 0));
            if (fee <= 0) {
                return { totalFee: 0, transferBudgetAdded: 0, clubRetained: 0, retentionPct: Math.round(this.getTransferRetentionRate() * 100) };
            }

            const rate = this.getTransferRetentionRate();
            const transferBudgetAdded = Math.round(fee * rate);
            const clubRetained = round1(fee - transferBudgetAdded);

            // 1. 구단 전체 예산에는 100% 입금
            this.recordTransaction('income', 'transferSales', fee, `선수 매각: ${playerName || '선수'} (이적자금 환원 ${Math.round(rate * 100)}%)`);

            // 2. 이적 자금(teamMoney)에는 환원율만큼만 지급
            if (typeof gameData !== 'undefined' && gameData) {
                gameData.teamMoney = Math.round((Number(gameData.teamMoney) || 0) + transferBudgetAdded);
            }

            return {
                totalFee: fee,
                transferBudgetAdded,
                clubRetained,
                retentionPct: Math.round(rate * 100)
            };
        }

        // 선수 영입 정산: 이적 자금(teamMoney) 차감 + 구단 전체 예산(clubBalance) 실제 현금 지출
        recordPlayerPurchase(playerName, fee) {
            const cost = round1(Math.max(0, Number(fee) || 0));
            if (cost <= 0) return;

            if (typeof gameData !== 'undefined' && gameData) {
                gameData.teamMoney = Math.max(0, Math.round((Number(gameData.teamMoney) || 0) - cost));
            }
            this.recordTransaction('expense', 'transferPurchases', cost, `선수 영입: ${playerName || '선수'}`);
        }

        // 구장 증축·시설 투자: 이적 자금이 아니라 구단 전체 예산(clubBalance)에서 차감!
        spendClubBalanceForInfrastructure(cost, label) {
            const f = this.ensureState();
            const val = round1(Math.max(0, Number(cost) || 0));
            if (!f) return { success: false, message: '구단 재정 정보를 불러올 수 없습니다.' };

            if (f.clubBalance < val) {
                return {
                    success: false,
                    message: `구단 전체 예산이 부족합니다.\n(필요: ${val.toLocaleString()}억원 / 현재 구단 전체 예산: ${f.clubBalance.toLocaleString()}억원)\n※ 구장 증축·시설 투자는 이적 자금이 아닌 '구단 전체 예산'에서 지출됩니다.`
                };
            }

            this.recordTransaction('expense', 'infrastructure', val, label || '구장/시설 투자');
            if (typeof updateDisplay === 'function') updateDisplay();
            if (typeof updateFinanceDisplay === 'function') updateFinanceDisplay();
            return { success: true, remainingBalance: f.clubBalance };
        }

        // 경기 종료 시 통합 재정 정산 (중계권/경기 수당 + 스폰서 수당 - 주급 - 구단 운영비)
        processPostMatchFinance(matchResult, opponentName = '') {
            if (typeof gameData === 'undefined' || !gameData || gameData.isWorldCupMode) return null;
            const f = this.ensureState();
            if (!f) return null;

            // 1. 경기 수당 & TV 중계권 배당 (전체 예산으로 입금)
            const broadcastBase = getBroadcastPerMatchByLeague();
            let resultBonus = 0;
            if (matchResult === 'win') resultBonus = Math.round(broadcastBase * 0.45);
            else if (matchResult === 'draw') resultBonus = Math.round(broadcastBase * 0.18);
            else resultBonus = Math.round(broadcastBase * 0.05);

            const broadcastTotal = round1(broadcastBase + resultBonus);
            const oppLabel = opponentName ? ` (${opponentName}전)` : '';
            this.recordTransaction('income', 'broadcast', broadcastTotal, `중계권 및 경기 수당${oppLabel}`);

            // 2. 스폰서 경기 수당 (전체 예산으로 입금)
            let sponsorPay = 0;
            if (gameData.currentSponsor && gameData.gameMode !== 'longtime') {
                if (matchResult === 'win') sponsorPay = Number(gameData.currentSponsor.payPerWin) || 0;
                else if (matchResult === 'loss') sponsorPay = Number(gameData.currentSponsor.payPerLoss) || 0;
                else sponsorPay = Math.floor((Number(gameData.currentSponsor.payPerWin) || 0) / 2);

                if (sponsorPay > 0) {
                    this.recordTransaction('income', 'sponsor', sponsorPay, `스폰서 수당 (${gameData.currentSponsor.name})`);
                }
            }

            // 3. 선수단 주급 실제 차감 (매 경기 1주분 지출 — 고주급 스쿼드일수록 적자 압박!)
            const weeklyWage = (typeof calculateTotalWages === 'function')
                ? calculateTotalWages()
                : (Number(gameData.totalWeeklyWage) || 0);
            if (weeklyWage > 0) {
                this.recordTransaction('expense', 'wages', weeklyWage, `선수단 주급 지급${oppLabel}`);
            }

            // 4. 구단 운영비 (구장 규모 + 리그 유지비)
            let capacity = 45000;
            if (typeof stadiumSystem !== 'undefined') {
                const stad = stadiumSystem.getUserStadium();
                if (stad && stad.currentCapacity) capacity = stad.currentCapacity;
            }
            const opCost = round1(4 + capacity * 0.00008);
            this.recordTransaction('expense', 'operating', opCost, `구단 운영·스태프·시설 유지비`);

            const netDelta = round1(broadcastTotal + sponsorPay - weeklyWage - opCost);
            return {
                broadcastTotal,
                sponsorPay,
                weeklyWage,
                opCost,
                netDelta,
                clubBalance: f.clubBalance
            };
        }

        // 보드진 평가 계산 (성적 / 재정 / 종합)
        getBoardEvaluation() {
            const f = this.ensureState();
            const ffp = this.getFFPStatus();
            const totals = this.getSeasonTotals();

            // 1. 성적 평가 (Performance)
            let perfScore = 70;
            let currentRank = null;
            let expectedRank = null;
            let totalTeams = 0;
            let matchesPlayed = 0;
            let winRate = 0;

            if (typeof gameData !== 'undefined' && gameData && gameData.selectedTeam) {
                const lid = getLeagueId();
                const divKey = `division${gameData.currentLeague || 1}`;
                const table = (lid && gameData.leagueData && gameData.leagueData[lid])
                    ? gameData.leagueData[lid]
                    : (gameData.leagueData ? gameData.leagueData[divKey] : null);

                if (table && Object.keys(table).length > 0) {
                    const teamKeys = Object.keys(table);
                    totalTeams = teamKeys.length;

                    // 현재 순위 계산
                    const standings = teamKeys.map(k => ({
                        team: k,
                        ...table[k],
                        gd: (table[k].goalsFor || 0) - (table[k].goalsAgainst || 0)
                    })).sort((a, b) => {
                        if (b.points !== a.points) return b.points - a.points;
                        if (b.gd !== a.gd) return b.gd - a.gd;
                        return (b.goalsFor || 0) - (a.goalsFor || 0);
                    });

                    const myEntry = standings.find(e => e.team === gameData.selectedTeam);
                    currentRank = standings.findIndex(e => e.team === gameData.selectedTeam) + 1;
                    matchesPlayed = myEntry ? (myEntry.matches || 0) : 0;
                    if (matchesPlayed > 0 && myEntry) {
                        winRate = Math.round(((myEntry.wins || 0) / matchesPlayed) * 100);
                    }

                    // 팀 OVR 기반 기대 순위 계산
                    const teamOvrs = teamKeys.map(k => {
                        const squad = (typeof teams !== 'undefined' && Array.isArray(teams[k])) ? teams[k] : [];
                        const sorted = [...squad].sort((a, b) => (b.rating || 70) - (a.rating || 70)).slice(0, 14);
                        const avg = sorted.length > 0
                            ? sorted.reduce((s, p) => s + (p.rating || 70), 0) / sorted.length
                            : 70;
                        return { team: k, avg };
                    }).sort((a, b) => b.avg - a.avg);

                    expectedRank = teamOvrs.findIndex(e => e.team === gameData.selectedTeam) + 1;

                    if (matchesPlayed >= 2 && currentRank > 0 && expectedRank > 0) {
                        const rankDiff = expectedRank - currentRank; // 양수면 기대 이상
                        const weight = Math.min(1, matchesPlayed / 10);
                        perfScore = 70 + rankDiff * 4.2 * weight;

                        if (currentRank === 1) perfScore += 10 * weight;
                        else if (currentRank <= Math.max(3, Math.ceil(totalTeams * 0.2))) perfScore += 5 * weight;
                        else if (currentRank >= totalTeams - 2) perfScore -= 12 * weight;

                        // 연패 패널티
                        const streak = Number(gameData.losingStreak) || 0;
                        if (streak >= 2) perfScore -= streak * 4;
                    }
                }

                // 컵/UCL 보너스
                if (gameData.faCup && gameData.faCup.champion === gameData.selectedTeam) perfScore += 12;
                if (gameData.ucl && gameData.ucl.champion === gameData.selectedTeam) perfScore += 15;
            }
            perfScore = Math.max(10, Math.min(100, Math.round(perfScore)));

            // 2. 재정 평가 (Finance)
            let finScore = 74;
            const balance = f ? f.clubBalance : 0;

            if (balance < 0) {
                finScore -= Math.min(35, 12 + Math.round(Math.abs(balance) / 40));
            } else if (balance >= 3000) {
                finScore += 12;
            } else if (balance >= 1200) {
                finScore += 6;
            }

            if (totals.netProfit > 0) {
                finScore += Math.min(12, Math.round(totals.netProfit / 80));
            } else if (totals.netProfit < 0) {
                finScore -= Math.min(24, Math.round(Math.abs(totals.netProfit) / 45));
            }

            if (ffp.status === 'PASS') finScore += 8;
            else if (ffp.status === 'WATCH') finScore -= 5;
            else if (ffp.status === 'WARNING') finScore -= 16;
            else if (ffp.status === 'BREACH') finScore -= 30;

            // 주급 예산 초과 여부 체크
            const wageBudget = Number(gameData && gameData.wageBudget) || 0;
            const totalWage = Number(gameData && gameData.totalWeeklyWage) || 0;
            if (totalWage > wageBudget + 0.1) {
                finScore -= 10;
            }

            finScore = Math.max(5, Math.min(100, Math.round(finScore)));

            // 3. 종합 평가 (Overall: 성적 55% + 재정 45%)
            const overallScore = Math.max(5, Math.min(100, Math.round(perfScore * 0.55 + finScore * 0.45)));

            // 보드진 총평 코멘트
            let comment = '보드진은 현재 구단 운영을 안정적으로 지켜보고 있습니다.';
            if (ffp.status === 'BREACH') {
                comment = '심각한 FFP 위반 상태입니다! 보드진은 즉각적인 선수 매각과 주급 긴축을 명령하고 있습니다.';
            } else if (perfScore >= 82 && finScore >= 80) {
                comment = '성적과 재정 모두 완벽합니다. 보드진이 감독님께 전폭적인 신뢰를 보내고 있습니다.';
            } else if (perfScore >= 78 && finScore < 55) {
                comment = '경기장 위 성적은 훌륭하지만 적자 폭이 커지고 있습니다. 재정 균형에 신경 써야 합니다.';
            } else if (perfScore < 55 && finScore >= 75) {
                comment = '구단 재정은 탄탄하지만 성적이 기대에 못 미치고 있습니다. 전술 개선과 전력 보강이 필요합니다.';
            } else if (overallScore < 45) {
                comment = '성적과 재정 모두 위험 수위입니다. 보드진의 인내심이 한계에 달하고 있습니다.';
            } else if (ffp.status === 'WARNING') {
                comment = 'FFP 경고 단계입니다. 추가 영입보다는 매각과 흑자 전환에 집중하길 바랍니다.';
            }

            return {
                performance: {
                    score: perfScore,
                    grade: scoreToGrade(perfScore),
                    currentRank,
                    expectedRank,
                    totalTeams,
                    matchesPlayed,
                    winRate
                },
                finance: {
                    score: finScore,
                    grade: scoreToGrade(finScore),
                    balance,
                    netProfit: totals.netProfit,
                    ffpStatus: ffp.status
                },
                overall: {
                    score: overallScore,
                    grade: scoreToGrade(overallScore),
                    comment
                }
            };
        }

        // 시즌 종료 정산: FFP 감사 -> 벌금/제재 -> 새 시즌 이적/주급 예산 배정 -> 시즌 결산 아카이브
        processSeasonEnd(seasonReward = 0, silent = false) {
            if (typeof gameData === 'undefined' || !gameData || gameData.isWorldCupMode) return null;
            const f = this.ensureState();
            if (!f) return null;

            // 1. 시즌 상금을 구단 전체 예산에 입금
            if (seasonReward > 0) {
                this.recordTransaction('income', 'prizes', seasonReward, `시즌 최종 순위 및 대회 상금`);
            }

            const ffp = this.getFFPStatus();
            const board = this.getBoardEvaluation();
            const totals = this.getSeasonTotals();

            let ffpFine = 0;
            let ffpPenaltyMsg = '';
            let nextSeasonPointDeduction = 0;

            // 2. FFP 최종 감사
            if (ffp.status === 'BREACH') {
                f.consecutiveFFPBreaches = (f.consecutiveFFPBreaches || 0) + 1;
                const excessDeficit = Math.max(100, Math.abs(ffp.ffpNet) - ffp.limit);
                ffpFine = Math.min(800, Math.max(120, Math.round(excessDeficit * 0.35)));
                this.recordTransaction('expense', 'ffpFine', ffpFine, `FFP 규정 위반 제재 벌금`);

                ffpPenaltyMsg = `🚨 [FFP 위반 제재 발동] 허용 적자 한도(-${ffp.limit}억) 초과로 벌금 ${ffpFine}억원이 부과되었습니다.`;
                if (f.consecutiveFFPBreaches >= 2) {
                    nextSeasonPointDeduction = 6;
                    f.pendingPointDeduction = 6;
                    ffpPenaltyMsg += `\n⚠️ 2시즌 연속 FFP 위반으로 차기 시즌 승점 -6점 삭감 중징계가 확정되었습니다!`;
                }
            } else {
                f.consecutiveFFPBreaches = 0;
                f.pendingPointDeduction = 0;
            }

            // 3. 새 시즌 이적 자금 & 주급 예산 재편성
            // 실제 구단은 전체 예산에서 연간 주급과 구단 필수 유보금(전체 예산의 ~35%)을 제외한 여력에서만 이적 자금을 배정
            const currentBalance = f.clubBalance;
            const totalWage = (typeof calculateTotalWages === 'function') ? calculateTotalWages() : (Number(gameData.totalWeeklyWage) || 0);
            const annualWageNeed = round1(totalWage * 52);
            const clubReserveTarget = Math.max(300, Math.round(currentBalance * 0.35));
            const investableSurplus = currentBalance - annualWageNeed - clubReserveTarget;
            let newTransferBudget = 0;

            if (currentBalance <= 0 || investableSurplus <= 0) {
                // 유보금·주급을 제외하면 여유가 없는 상태: 이적 자금 대폭 긴축
                newTransferBudget = currentBalance <= 0 ? 0 : Math.min(80, Math.round(Math.max(0, currentBalance - annualWageNeed) * 0.15));
            } else {
                // 보드진 종합 평가 & FFP에 따라 가용 잉여금의 일부만 이적 자금으로 배정
                let allocRate = 0.55;
                if (board.overall.score >= 82) allocRate = 0.70;
                else if (board.overall.score >= 68) allocRate = 0.60;
                else if (board.overall.score < 50) allocRate = 0.35;

                if (ffp.status === 'BREACH') allocRate *= 0.35;
                else if (ffp.status === 'WARNING') allocRate *= 0.60;

                newTransferBudget = Math.max(0, Math.round(investableSurplus * allocRate));
            }

            gameData.teamMoney = newTransferBudget;

            // 주급 예산 재조정
            if (ffp.status === 'BREACH' || currentBalance < annualWageNeed + clubReserveTarget) {
                gameData.wageBudget = round2(totalWage); // 긴축: 여유 주급 동결
            } else if (board.overall.score >= 70 && investableSurplus >= 400) {
                gameData.wageBudget = round2(Math.max(gameData.wageBudget || totalWage, totalWage * 1.05));
            } else {
                gameData.wageBudget = round2(Math.max(totalWage, gameData.wageBudget || totalWage));
            }

            // 4. 시즌 결산 아카이빙
            const seasonYear = gameData.startYear || 2025;
            f.seasonHistory.unshift({
                seasonLabel: `${seasonYear}/${seasonYear + 1}`,
                totalIncome: totals.totalIncome,
                totalExpense: round1(totals.totalExpense + ffpFine),
                netProfit: round1(totals.netProfit - ffpFine),
                endingBalance: f.clubBalance,
                ffpStatus: ffp.status,
                boardOverall: board.overall.grade,
                boardPerf: board.performance.grade,
                boardFin: board.finance.grade
            });
            if (f.seasonHistory.length > 10) f.seasonHistory.length = 10;

            // 5. 보드진 시즌 결산 메일 발송
            if (!silent && typeof mailManager !== 'undefined') {
                const reportBody =
                    `[시즌 재정 & 보드진 최종 평가]\n` +
                    `- 성적 평가: ${board.performance.grade} (${board.performance.score}점)\n` +
                    `- 재정 평가: ${board.finance.grade} (${board.finance.score}점)\n` +
                    `- 종합 평가: ${board.overall.grade} (${board.overall.score}점)\n\n` +
                    `[재정 결산]\n` +
                    `- 시즌 총 수입: +${totals.totalIncome.toLocaleString()}억원\n` +
                    `- 시즌 총 지출: -${round1(totals.totalExpense + ffpFine).toLocaleString()}억원\n` +
                    `- 시즌 순손익: ${totals.netProfit - ffpFine >= 0 ? '+' : ''}${round1(totals.netProfit - ffpFine).toLocaleString()}억원\n` +
                    `- 구단 전체 예산: ${f.clubBalance.toLocaleString()}억원\n` +
                    `- FFP 감사 결과: ${ffp.label}\n` +
                    (ffpPenaltyMsg ? `\n${ffpPenaltyMsg}\n` : '') +
                    `\n[차기 시즌 예산 배정]\n` +
                    `- 이적 자금: ${gameData.teamMoney.toLocaleString()}억원\n` +
                    `- 주급 예산 한도: ${gameData.wageBudget}억/주\n` +
                    `- 매각 수익 환원율: ${Math.round(this.getTransferRetentionRate() * 100)}%\n\n` +
                    `보드진 코멘트: "${board.overall.comment}"`;

                mailManager.addMail(
                    `[보드진 결산] ${seasonYear}/${seasonYear + 1} 시즌 재정 감사 및 차기 시즌 예산 통보`,
                    '구단 이사회',
                    reportBody
                );
            }

            // 6. 새 시즌 가계부 초기화
            f.seasonStartBalance = f.clubBalance;
            f.breakdown = createEmptyBreakdown();
            f.ledger.unshift({
                round: 1,
                season: (gameData.seasonCount || 1) + 1,
                type: 'info',
                category: 'other',
                label: `차기 시즌 개시 (이적 자금 ${gameData.teamMoney.toLocaleString()}억 배정)`,
                amount: 0,
                balanceAfter: f.clubBalance
            });

            return {
                ffp,
                board,
                ffpFine,
                ffpPenaltyMsg,
                nextSeasonPointDeduction,
                newTransferBudget: gameData.teamMoney,
                clubBalance: f.clubBalance
            };
        }

        // 차기 시즌 리그 초기화 직후 FFP 승점 삭감 적용
        applyPendingPointDeduction() {
            const f = this.ensureState();
            if (!f || !f.pendingPointDeduction || f.pendingPointDeduction <= 0) return;
            if (typeof gameData === 'undefined' || !gameData || !gameData.selectedTeam) return;

            const lid = getLeagueId();
            const divKey = `division${gameData.currentLeague || 1}`;
            const table = (lid && gameData.leagueData && gameData.leagueData[lid])
                ? gameData.leagueData[lid]
                : (gameData.leagueData ? gameData.leagueData[divKey] : null);

            if (table && table[gameData.selectedTeam]) {
                table[gameData.selectedTeam].points = (table[gameData.selectedTeam].points || 0) - f.pendingPointDeduction;
                f.pendingPointDeduction = 0;
            }
        }
    }

    const instance = new FinanceSystem();
    if (typeof window !== 'undefined') {
        window.financeSystem = instance;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { FinanceSystem, financeSystem: instance };
    }
})();
