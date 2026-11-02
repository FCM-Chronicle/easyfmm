# make_test_runner.ps1
$utf8 = [System.Text.Encoding]::UTF8
$indexHtml = [System.IO.File]::ReadAllText("easyfmm\index.html", $utf8)

$testScript = @"
<div id="test-results" style="position:fixed; top:0; left:0; width:100%; height:100%; background:black; color:lime; font-family:monospace; z-index:999999; padding:20px; overflow:auto; font-size:16px; white-space:pre-wrap;">RUNNING TESTS...</div>
<script>
    const logs = [];
    function log(msg) { logs.push(msg); console.log(msg); }

    try {
        log("1. Checking teamsData.js...");
        const teamKeys = Object.keys(allTeams);
        log("Loaded " + teamKeys.length + " teams.");
        if (teamKeys.length < 170) throw new Error("Expected at least 170 teams!");

        log("2. Initializing LeagueManager...");
        LeagueManager.initializeAllLeagueData();
        const leagueIds = Object.keys(LEAGUES_CONFIG);
        log("Leagues configured: " + leagueIds.join(", "));

        log("3. Testing Team Selection (Arsenal - Premier League)...");
        selectTeam("\uC544\uC2A4\uB110");
        log("User Team: " + gameData.selectedTeam);
        log("Current Opponent: " + gameData.currentOpponent);
        log("User Transfer Budget: " + gameData.teamMoney + "억");
        log("User Weekly Wage: " + gameData.totalWeeklyWage + "억");
        log("Current Round: " + gameData.currentRound);
        if (!gameData.currentOpponent) throw new Error("Failed to set opponent for Arsenal!");

        log("4. Simulating Round 1 across all 9 leagues...");
        recordsSystem.simulateAllLeaguesMatches();
        
        // Check that standings exist for each league
        leagueIds.forEach(lId => {
            const table = gameData.leagueData[lId];
            const teamCount = Object.keys(table).length;
            const playedMatches = Object.values(table).reduce((sum, t) => sum + t.matches, 0);
            log("League " + lId + ": " + teamCount + " teams, " + playedMatches + " team-match entries.");
        });

        log("5. Testing Team Selection (Real Madrid - La Liga)...");
        selectTeam("\uB808\uC54C_\uB9C8\uB4DC\uB9AC\uB4DC");
        log("User Team: " + gameData.selectedTeam);
        log("Current Opponent: " + gameData.currentOpponent);
        log("Current League: " + LeagueManager.getLeagueIdByTeam(gameData.selectedTeam));

        log("6. Testing Team Selection (FC Seoul - K League 1)...");
        selectTeam("FC_\uC11C\uC6B8");
        log("User Team: " + gameData.selectedTeam);
        log("Current Opponent: " + gameData.currentOpponent);
        log("Current League: " + LeagueManager.getLeagueIdByTeam(gameData.selectedTeam));

        log("7. Testing UI Standings render...");
        LeagueManager.renderLeagueStandingsUI();
        const renderedTable = document.getElementById('leagueTable').querySelector('table');
        log("Standings Table rendered successfully: " + (!!renderedTable));

        log("ALL TESTS PASSED SUCCESSFULLY!");
        document.getElementById('test-results').textContent = "SUCCESS:\n" + logs.join("\n");
    } catch (err) {
        log("TEST FAILED: " + err.message + "\n" + err.stack);
        document.getElementById('test-results').textContent = "ERROR:\n" + logs.join("\n");
    }
</script>
"@

$runnerHtml = $indexHtml.Replace("</body>", $testScript + "`r`n</body>")
[System.IO.File]::WriteAllText("easyfmm\test_runner.html", $runnerHtml, $utf8)
Write-Host "test_runner.html generated for sync run."
