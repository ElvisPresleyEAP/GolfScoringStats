// PGA Swindle - Golf Scoring App JavaScript

// Debug function for GitHub Pages
function debugLog(message, data = null) {
    if (console && console.log) {
        console.log('[PGA Swindle]', message, data || '');
    }
}

// Error handling wrapper
function safeExecute(fn, context = 'unknown') {
    try {
        return fn();
    } catch (error) {
        debugLog(`Error in ${context}:`, error);
        return null;
    }
}

class PGASwindle {
    constructor() {
        this.players = 50;
        this.weeks = 25;
        this.scores = {}; // Store all scores
        this.dates = {}; // Store dates for each week
        this.playerNames = {}; // Store custom player names
        this.customHeaders = {}; // Store custom header names
        this.mainTitle = '🏌️ PGA Swindle'; // Store custom main title
        this.moneyWon = {}; // Store money won data for players
        this.bestScoreCount = 10; // Default to highlighting top 10 scores
        this.prizeValues = {}; // Store prize values for different categories
        this.prizeWinners = {}; // Store winner names for different prize categories
        this.weeklyPrizeData = {}; // Store weekly prize distribution data
        this.scorecardData = {}; // Store detailed scorecard data for each player/week
        this.weeklyWins = {}; // Store weekly wins for leaderboard tracking - START EMPTY
        this.currentWeek = this.getCurrentWeek(); // Current week for leaderboard
        this.cellColors = {}; // Store custom cell colors
        
        this.init();
    }

    init() {
        this.createTable();
        this.createMoneyTable();
        this.createWeeklyPrizeTable();
        this.attachEventListeners();
        this.loadData(); // Load saved data if available
        this.updateAllCalculations();
    }

    createTable() {
        this.createHeaderRow();
        this.createPlayerRows();
        this.createFooterRow();
    }

    createHeaderRow() {
        const weekRow = document.querySelector('.week-row');
        const dateRow = document.querySelector('.date-row');
        
        // Clear existing content completely and rebuild both rows
        weekRow.innerHTML = '';
        if (dateRow) {
            dateRow.innerHTML = '';
        }
        
        // Add the Date header first (for date row)
        if (dateRow) {
            const dateTh = document.createElement('th');
            dateTh.innerHTML = `<span style="color:white;font-weight:bold;font-size:11px;">Date</span>`;
            dateTh.style.backgroundColor = '#2c5530';
            dateTh.style.padding = '8px';
            dateRow.appendChild(dateTh);
        }
        
        // Add the Player header first (now editable)
        const playerTh = document.createElement('th');
        const playerHeaderText = this.customHeaders['player'] || 'Player';
        playerTh.innerHTML = `<input type="text" class="header-input" data-header="player" value="${playerHeaderText}" style="width:80px;font-size:11px;text-align:center;background:transparent;border:none;color:white;font-weight:bold;">`;
        weekRow.appendChild(playerTh);
        
        // Add date inputs for each week (if dateRow exists)
        if (dateRow) {
            for (let week = 1; week <= this.weeks; week++) {
                const dateTh = document.createElement('th');
                dateTh.className = 'date-header';
                const currentDate = this.dates[week] || '';
                dateTh.innerHTML = `<input type="date" class="date-input" data-week="${week}" value="${currentDate}" style="width:60px;font-size:8px;text-align:center;background:transparent;border:1px solid #666;color:white;font-weight:normal;" title="Set date for WK${week}">`;
                dateTh.style.backgroundColor = '#1a3319';
                dateTh.style.padding = '4px';
                dateRow.appendChild(dateTh);
            }
            
            // Add empty cells for summary columns in date row
            const datePlayedGamesTh = document.createElement('th');
            datePlayedGamesTh.style.backgroundColor = '#1a3319';
            dateRow.appendChild(datePlayedGamesTh);
            
            const dateTotalPointsTh = document.createElement('th');
            dateTotalPointsTh.style.backgroundColor = '#1a3319';
            dateRow.appendChild(dateTotalPointsTh);
            
            const dateBestScoresTh = document.createElement('th');
            dateBestScoresTh.style.backgroundColor = '#1a3319';
            dateRow.appendChild(dateBestScoresTh);
        }
        
        // Add editable week headers
        for (let week = 1; week <= this.weeks; week++) {
            const weekTh = document.createElement('th');
            weekTh.className = 'week-header';
            const weekHeaderText = this.customHeaders[`week-${week}`] || `WK${week}`;
            weekTh.innerHTML = `<input type="text" class="week-header-input" data-week="${week}" value="${weekHeaderText}" style="width:30px;font-size:8px;text-align:center;background:transparent;border:none;color:white;font-weight:bold;">`;
            weekRow.appendChild(weekTh);
        }
        
        // Add Played Games summary column
        const playedGamesTh = document.createElement('th');
        const playedGamesHeaderText = this.customHeaders['played-games'] || 'Played Games';
        playedGamesTh.innerHTML = `<input type="text" class="header-input" data-header="played-games" value="${playedGamesHeaderText}" style="width:80px;font-size:11px;text-align:center;background:transparent;border:none;color:white;font-weight:bold;">`;
        playedGamesTh.className = 'summary-header';
        playedGamesTh.style.backgroundColor = '#2c5530';
        playedGamesTh.style.fontWeight = 'bold';
        weekRow.appendChild(playedGamesTh);
        
        // Add Total Points summary column
        const totalPointsTh = document.createElement('th');
        const totalPointsHeaderText = this.customHeaders['total-points'] || 'Total Points';
        totalPointsTh.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;">
                <input type="text" class="header-input" data-header="total-points" value="${totalPointsHeaderText}" style="width:60px;font-size:11px;text-align:center;background:transparent;border:none;color:white;font-weight:bold;">
                <button id="sortByTotalPoints" style="background:transparent;border:1px solid white;color:white;font-size:6px;padding:1px 3px;cursor:pointer;border-radius:2px;" title="Sort players by total points">⬇️</button>
            </div>
        `;
        totalPointsTh.className = 'summary-header total-points-header';
        totalPointsTh.style.backgroundColor = '#2c5530';
        totalPointsTh.style.fontWeight = 'bold';
        weekRow.appendChild(totalPointsTh);
        
        // Add Best N Scores summary column (dynamic based on dropdown)
        const bestNScoresTh = document.createElement('th');
        const bestScoresHeaderText = this.customHeaders['best-scores'] || `Best ${this.bestScoreCount} Scores`;
        bestNScoresTh.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;">
                <input type="text" class="header-input" data-header="best-scores" value="${bestScoresHeaderText}" style="width:60px;font-size:11px;text-align:center;background:transparent;border:none;color:white;font-weight:bold;">
                <button id="sortByBestScores" style="background:transparent;border:1px solid white;color:white;font-size:6px;padding:1px 3px;cursor:pointer;border-radius:2px;" title="Sort players by best scores (highest first)">⬇️</button>
            </div>
        `;
        bestNScoresTh.className = 'summary-header best-scores-header';
        bestNScoresTh.style.backgroundColor = '#2c5530';
        bestNScoresTh.style.fontWeight = 'bold';
        weekRow.appendChild(bestNScoresTh);
        
    }

    createPlayerRows() {
        const tbody = document.getElementById('scoreTableBody');
        tbody.innerHTML = '';
        
        for (let player = 1; player <= this.players; player++) {
            const row = document.createElement('tr');
            row.innerHTML = this.createPlayerRowHTML(player);
            tbody.appendChild(row);
        }
    }

    createPlayerRowHTML(playerNum) {
        const playerName = this.playerNames[playerNum] || `Player ${playerNum}`;
        let html = `
            <td class="player-number">
                <input type="text" 
                       class="player-name-input" 
                       data-player="${playerNum}"
                       value="${playerName}"
                       placeholder="Player ${playerNum}">
            </td>
        `;
        
        // Score input cells for each week
        for (let week = 1; week <= this.weeks; week++) {
            const scoreKey = `${playerNum}-${week}`;
            const currentScore = this.scores[scoreKey] || '';
            html += `
                <td>
                    <input type="number" 
                           class="score-input" 
                           data-player="${playerNum}" 
                           data-week="${week}"
                           value="${currentScore}"
                           placeholder="Score"
                           min="0"
                           max="200">
                </td>
            `;
        }
        
        // Add Played Games summary column
        html += `
            <td class="played-games-cell" style="background-color:#2c5530;text-align:center;font-weight:bold;color:white;">
                <span class="played-games-count" data-player="${playerNum}">0</span>
            </td>
        `;
        
        // Add Total Points summary column
        html += `
            <td class="total-points-cell" style="background-color:#2c5530;text-align:center;font-weight:bold;color:white;">
                <span class="total-points-count" data-player="${playerNum}">0</span>
            </td>
        `;
        
        // Add Best 10 Scores summary column
        html += `
            <td class="best-10-scores-cell" style="background-color:#2c5530;text-align:center;font-weight:bold;color:white;">
                <span class="best-10-scores-count" data-player="${playerNum}">0</span>
            </td>
        `;
        
        
        return html;
    }

    createFooterRow() {
        // Remove the footer row entirely
        const tfoot = document.querySelector('tfoot');
        if (tfoot) {
            tfoot.style.display = 'none';
        }
    }

    createWeeklyPrizeTable() {
        const tbody = document.getElementById('weeklyPrizeTableBody');
        if (!tbody) return; // Exit if table body doesn't exist
        
        tbody.innerHTML = '';
        
        for (let week = 1; week <= 50; week++) {
            const row = document.createElement('tr');
            row.innerHTML = this.createWeeklyPrizeRowHTML(week);
            tbody.appendChild(row);
        }
        
        // Update all totals after creating the table
        for (let week = 1; week <= 50; week++) {
            this.updateWeeklyPrizeTotal(week);
        }
    }

    createWeeklyPrizeRowHTML(week) {
        const weekData = this.weeklyPrizeData[week] || { prizePot: 0, first: 0, second: 0, third: 0, fourth: 0, fifth: 0 };
        
        return `
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; background-color: #f8f9fa;">${week}</td>
            <td style="padding: 4px; border: 1px solid #ddd;"><input type="text" class="weekly-prize-input" data-week="${week}" data-position="prizePot" value="" placeholder="£0.00" style="width: 100%; border: none; padding: 6px; text-align: center; font-size: 12px;"></td>
            <td style="padding: 4px; border: 1px solid #ddd;"><input type="text" class="weekly-prize-input" data-week="${week}" data-position="first" value="" placeholder="£0.00" style="width: 100%; border: none; padding: 6px; text-align: center; font-size: 12px;"></td>
            <td style="padding: 4px; border: 1px solid #ddd;"><input type="text" class="weekly-prize-input" data-week="${week}" data-position="second" value="" placeholder="£0.00" style="width: 100%; border: none; padding: 6px; text-align: center; font-size: 12px;"></td>
            <td style="padding: 4px; border: 1px solid #ddd;"><input type="text" class="weekly-prize-input" data-week="${week}" data-position="third" value="" placeholder="£0.00" style="width: 100%; border: none; padding: 6px; text-align: center; font-size: 12px;"></td>
            <td style="padding: 4px; border: 1px solid #ddd;"><input type="text" class="weekly-prize-input" data-week="${week}" data-position="fourth" value="" placeholder="£0.00" style="width: 100%; border: none; padding: 6px; text-align: center; font-size: 12px;"></td>
            <td style="padding: 4px; border: 1px solid #ddd;"><input type="text" class="weekly-prize-input" data-week="${week}" data-position="fifth" value="" placeholder="£0.00" style="width: 100%; border: none; padding: 6px; text-align: center; font-size: 12px;"></td>
            <td class="weekly-total" data-week="${week}" style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; background-color: #e8f5e8; color: #2c5530;">£0.00</td>
        `;
    }

    handleWeeklyPrizeInput(input) {
        const week = input.dataset.week;
        const position = input.dataset.position;
        const inputValue = input.value.trim();
        
        // Parse amount by removing currency symbols and non-numeric characters (except decimal point)
        const cleanValue = inputValue.replace(/[£$€,]/g, '').replace(/[^0-9.]/g, '');
        const amount = parseFloat(cleanValue);
        
        // Initialize week data if it doesn't exist
        if (!this.weeklyPrizeData[week]) {
            this.weeklyPrizeData[week] = { prizePot: 0, first: 0, second: 0, third: 0, fourth: 0, fifth: 0 };
        }
        
        // Check for valid number or empty input
        if (inputValue === '' || cleanValue === '') {
            // Remove the prize value if input is empty
            this.weeklyPrizeData[week][position] = 0;
            input.value = '';
        } else if (!isNaN(amount) && amount >= 0) {
            // Store the valid amount
            this.weeklyPrizeData[week][position] = amount;
            
            // Format the display with £ symbol
            const formattedValue = `£${amount.toFixed(2)}`;
            input.value = formattedValue;
        } else {
            // Invalid input, revert to previous value or clear
            const previousValue = this.weeklyPrizeData[week][position] || 0;
            input.value = previousValue > 0 ? `£${previousValue.toFixed(2)}` : '';
            return;
        }
        
        // Update the total for this week
        this.updateWeeklyPrizeTotal(week);
        
        // Auto-save
        this.saveData();
    }

    updateWeeklyPrizeTotal(week) {
        const weekData = this.weeklyPrizeData[week] || { prizePot: 0, first: 0, second: 0, third: 0, fourth: 0, fifth: 0 };
        
        // Calculate total from 1st to 5th place prizes (not including prize pot)
        const total = weekData.first + weekData.second + weekData.third + weekData.fourth + weekData.fifth;
        
        // Update the total display
        const totalCell = document.querySelector(`.weekly-total[data-week="${week}"]`);
        if (totalCell) {
            totalCell.textContent = `£${total.toFixed(2)}`;
        }
    }

    populateWeeklyPrizeData() {
        // Populate weekly prize inputs from saved data
        Object.keys(this.weeklyPrizeData).forEach(week => {
            const weekData = this.weeklyPrizeData[week];
            Object.keys(weekData).forEach(position => {
                const value = weekData[position];
                const input = document.querySelector(`input[data-week="${week}"][data-position="${position}"]`);
                if (input && value > 0) {
                    input.value = `£${value.toFixed(2)}`;
                }
            });
        });
        
        // Update all totals
        for (let week = 1; week <= 50; week++) {
            this.updateWeeklyPrizeTotal(week);
        }
    }

    attachEventListeners() {
        // Score input change events
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('score-input')) {
                this.handleScoreInput(e.target);
            } else if (e.target.classList.contains('player-name-input')) {
                this.handlePlayerNameInput(e.target);
            } else if (e.target.classList.contains('header-input')) {
                this.handleHeaderInput(e.target);
            } else if (e.target.classList.contains('week-header-input')) {
                this.handleWeekHeaderInput(e.target);
            } else if (e.target.classList.contains('main-title-input')) {
                this.handleMainTitleInput(e.target);
            } else if (e.target.classList.contains('winner-input')) {
                this.handleWinnerInput(e.target);
            }
        });

        // Best score count dropdown
        document.getElementById('bestScoreCount').addEventListener('change', (e) => {
            this.bestScoreCount = parseInt(e.target.value);
            this.updateBestScoresHeader();
            this.highlightBestScores();
        });

        // Control buttons
        document.getElementById('saveData').addEventListener('click', () => this.saveData());
        document.getElementById('loadData').addEventListener('click', () => this.loadData());
        document.getElementById('clearData').addEventListener('click', () => this.clearAllData());
        document.getElementById('shareButton').addEventListener('click', () => this.downloadImage());
        
        // Individual clear buttons
        document.getElementById('clearScoresData').addEventListener('click', () => this.clearScoresData());
        document.getElementById('clearMoneyData').addEventListener('click', () => this.clearMoneyData());
        document.getElementById('clearPrizesData').addEventListener('click', () => this.clearPrizesData());
        
        // Export/Import buttons for prizes
        document.getElementById('exportPrizesData').addEventListener('click', () => this.exportPrizesData());
        document.getElementById('importPrizesData').addEventListener('click', () => this.importPrizesData());
        
        // File input change event for import
        document.getElementById('importPrizesFile').addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleImportFile(e.target.files[0]);
                // Reset file input for repeated imports
                e.target.value = '';
            }
        });
        
        // Sort buttons (using event delegation since they're created dynamically)
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'sortByBestScores') {
                this.sortPlayersByBestScores();
            } else if (e.target && e.target.id === 'sortByTotalPoints') {
                this.sortPlayersByTotalPoints();
            } else if (e.target && e.target.id === 'sortByMoneyWon') {
                this.sortPlayersByMoneyWon();
            }
        });

        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // Money input events - only process on Enter key or when leaving the field
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('money-input') && e.key === 'Enter') {
                this.handleMoneyInput(e.target);
            }
        });
        
        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('money-input')) {
                this.handleMoneyInput(e.target);
            }
        });

        // Prize input events - only process when leaving the field
        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('prize-input')) {
                this.handlePrizeInput(e.target);
            } else if (e.target.classList.contains('weekly-prize-input')) {
                this.handleWeeklyPrizeInput(e.target);
            }
        }, true); // Use capture phase to ensure it fires

        // Date input change events
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('date-input')) {
                this.handleDateInput(e.target);
            }
        });

        // Cell color customization - right-click context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('score-input')) {
                e.preventDefault();
                this.showColorPicker(e.target, e.pageX, e.pageY);
            }
        });

        // Hide color picker when clicking elsewhere
        document.addEventListener('click', (e) => {
            const colorPicker = document.getElementById('colorPicker');
            if (colorPicker && !colorPicker.contains(e.target) && !e.target.classList.contains('score-input')) {
                colorPicker.remove();
            }
        });

        // Scorecard event listeners removed
    }


    handleDateInput(input) {
        const week = input.dataset.week;
        const dateValue = input.value;
        
        if (dateValue === '') {
            delete this.dates[week];
        } else {
            this.dates[week] = dateValue;
        }
        
        this.saveData(); // Auto-save date changes
    }

    handleScoreInput(input) {
        const player = input.dataset.player;
        const week = input.dataset.week;
        const score = input.value;
        const scoreKey = `${player}-${week}`;
        
        if (score === '' || score === null) {
            delete this.scores[scoreKey];
        } else {
            this.scores[scoreKey] = parseInt(score);
        }
        
        this.updatePlayerCalculations(player);
        this.updateWeeklyTotal(week);
        this.updateGrandTotals();
        this.highlightBestScores();
        
        // Update money table to reflect new money invested calculation
        this.createMoneyTable();
        this.updateAllMoneyTotals();
        
        this.saveData(); // Auto-save on each change
    }

    handlePlayerNameInput(input) {
        const player = input.dataset.player;
        const name = input.value.trim();
        
        if (name === '' || name === `Player ${player}`) {
            delete this.playerNames[player];
        } else {
            this.playerNames[player] = name;
        }
        
        // Update money table to reflect new player name
        this.createMoneyTable();
        this.updateAllMoneyTotals();
        
        this.saveData(); // Auto-save player name changes
    }

    handleHeaderInput(input) {
        const headerKey = input.dataset.header;
        const headerText = input.value.trim();
        
        // Get default text for comparison
        const defaultTexts = {
            'player': 'Player',
            'played-games': 'Played Games',
            'total-points': 'Total Points',
            'best-scores': `Best ${this.bestScoreCount} Scores`
        };
        
        if (headerText === '' || headerText === defaultTexts[headerKey]) {
            delete this.customHeaders[headerKey];
        } else {
            this.customHeaders[headerKey] = headerText;
        }
        
        this.saveData(); // Auto-save header changes
    }

    handleWeekHeaderInput(input) {
        const week = input.dataset.week;
        const headerText = input.value.trim();
        
        if (headerText === '' || headerText === `WK${week}`) {
            delete this.customHeaders[`week-${week}`];
        } else {
            this.customHeaders[`week-${week}`] = headerText;
        }
        
        this.saveData(); // Auto-save week header changes
    }

    handleMainTitleInput(input) {
        const titleText = input.value.trim();
        
        if (titleText === '' || titleText === '🏌️ PGA Swindle') {
            this.mainTitle = '🏌️ PGA Swindle';
        } else {
            this.mainTitle = titleText;
        }
        
        this.saveData(); // Auto-save main title changes
    }

    handleWinnerInput(input) {
        const prizeType = input.dataset.winner;
        const winnerName = input.value.trim();
        
        if (winnerName === '') {
            delete this.prizeWinners[prizeType];
        } else {
            this.prizeWinners[prizeType] = winnerName;
        }
        
        this.saveData(); // Auto-save winner name changes
    }

    updateBestScoresHeader() {
        // Update the best scores header to reflect the current dropdown value
        const bestScoresHeaderInput = document.querySelector('input[data-header="best-scores"]');
        if (bestScoresHeaderInput) {
            // Check if user has a custom header set
            if (!this.customHeaders['best-scores']) {
                // If no custom header, update to the new default based on dropdown
                bestScoresHeaderInput.value = `Best ${this.bestScoreCount} Scores`;
            }
            // If user has a custom header, we don't automatically change it
        }
        
        this.saveData(); // Save the updated header
    }

    sortPlayersByBestScores() {
        // Calculate best N scores total for each player
        const playerStats = [];
        
        for (let player = 1; player <= this.players; player++) {
            let allScores = [];
            
            // Collect all scores for this player
            for (let week = 1; week <= this.weeks; week++) {
                const scoreKey = `${player}-${week}`;
                const score = this.scores[scoreKey];
                
                if (score !== undefined && score !== null && score !== '') {
                    allScores.push(parseInt(score));
                }
            }
            
            // Calculate best N scores total (highest scores for this context)
            let bestScoresTotal = 0;
            if (allScores.length > 0) {
                const sortedScores = allScores.sort((a, b) => b - a); // Sort descending (highest first)
                const bestNScores = sortedScores.slice(0, Math.min(this.bestScoreCount, allScores.length));
                bestScoresTotal = bestNScores.reduce((sum, score) => sum + score, 0);
            }
            
            playerStats.push({
                player: player,
                bestScoresTotal: bestScoresTotal,
                hasScores: allScores.length > 0
            });
        }
        
        // Sort players by their best scores total (highest first)
        playerStats.sort((a, b) => {
            // Players with no scores go to the bottom
            if (!a.hasScores && !b.hasScores) return a.player - b.player; // Keep original order for players with no scores
            if (!a.hasScores) return 1;
            if (!b.hasScores) return -1;
            
            // Sort by best scores total (highest first)
            if (b.bestScoresTotal !== a.bestScoresTotal) {
                return b.bestScoresTotal - a.bestScoresTotal;
            }
            
            // If tied, maintain original player number order
            return a.player - b.player;
        });
        
        // Reorder the table rows based on the sorted players
        this.reorderTableRows(playerStats);
        
        // Show sort confirmation
        const sortBtn = document.getElementById('sortByBestScores');
        if (sortBtn) {
            const originalText = sortBtn.innerHTML;
            sortBtn.innerHTML = '✅';
            sortBtn.style.background = '#28a745';
            
            setTimeout(() => {
                sortBtn.innerHTML = originalText;
                sortBtn.style.background = 'transparent';
            }, 1000);
        }
    }

    sortPlayersByTotalPoints() {
        // Get current sort state to toggle between ascending/descending
        const sortBtn = document.getElementById('sortByTotalPoints');
        const currentState = sortBtn.dataset.sortState || 'desc'; // Default to descending first
        const newState = currentState === 'desc' ? 'asc' : 'desc';
        
        // Calculate total points for each player
        const playerStats = [];
        
        for (let player = 1; player <= this.players; player++) {
            let totalPoints = 0;
            let hasScores = false;
            
            // Collect all scores for this player and sum them
            for (let week = 1; week <= this.weeks; week++) {
                const scoreKey = `${player}-${week}`;
                const score = this.scores[scoreKey];
                
                if (score !== undefined && score !== null && score !== '') {
                    totalPoints += parseInt(score);
                    hasScores = true;
                }
            }
            
            playerStats.push({
                player: player,
                totalPoints: totalPoints,
                hasScores: hasScores
            });
        }
        
        // Sort players by their total points
        playerStats.sort((a, b) => {
            // Players with no scores go to the bottom
            if (!a.hasScores && !b.hasScores) return a.player - b.player;
            if (!a.hasScores) return 1;
            if (!b.hasScores) return -1;
            
            // Sort by total points based on current state
            if (newState === 'desc') {
                // Highest first (descending)
                if (b.totalPoints !== a.totalPoints) {
                    return b.totalPoints - a.totalPoints;
                }
            } else {
                // Lowest first (ascending)
                if (a.totalPoints !== b.totalPoints) {
                    return a.totalPoints - b.totalPoints;
                }
            }
            
            // If tied, maintain original player number order
            return a.player - b.player;
        });
        
        // Reorder the table rows based on the sorted players
        this.reorderTableRows(playerStats);
        
        // Update button state and appearance
        sortBtn.dataset.sortState = newState;
        const originalText = sortBtn.innerHTML;
        
        // Update button icon and show confirmation
        if (newState === 'desc') {
            sortBtn.innerHTML = '⬇️'; // High to low
            sortBtn.title = 'Sort players by total points (high to low)';
        } else {
            sortBtn.innerHTML = '⬆️'; // Low to high
            sortBtn.title = 'Sort players by total points (low to high)';
        }
        
        // Show confirmation briefly
        setTimeout(() => {
            sortBtn.innerHTML = '✅';
            sortBtn.style.background = '#28a745';
            
            setTimeout(() => {
                if (newState === 'desc') {
                    sortBtn.innerHTML = '⬇️';
                } else {
                    sortBtn.innerHTML = '⬆️';
                }
                sortBtn.style.background = 'transparent';
            }, 1000);
        }, 100);
    }

    sortPlayersByMoneyWon() {
        // Get current sort state to toggle between ascending/descending
        const sortBtn = document.getElementById('sortByMoneyWon');
        const currentState = sortBtn.dataset.sortState || 'desc'; // Default to descending first
        const newState = currentState === 'desc' ? 'asc' : 'desc';
        
        // Calculate total money won for each player
        const playerStats = [];
        
        for (let player = 1; player <= this.players; player++) {
            const moneyData = this.moneyWon[player] || { weeklyWins: 0, tournamentPrizes: 0 };
            const totalWon = moneyData.weeklyWins + moneyData.tournamentPrizes;
            const hasWinnings = totalWon > 0;
            
            playerStats.push({
                player: player,
                totalWon: totalWon,
                hasWinnings: hasWinnings
            });
        }
        
        // Sort players by their total money won
        playerStats.sort((a, b) => {
            // Players with no winnings go to the bottom
            if (!a.hasWinnings && !b.hasWinnings) return a.player - b.player;
            if (!a.hasWinnings) return 1;
            if (!b.hasWinnings) return -1;
            
            // Sort by total money won based on current state
            if (newState === 'desc') {
                // Highest first (descending)
                if (b.totalWon !== a.totalWon) {
                    return b.totalWon - a.totalWon;
                }
            } else {
                // Lowest first (ascending)
                if (a.totalWon !== b.totalWon) {
                    return a.totalWon - b.totalWon;
                }
            }
            
            // If tied, maintain original player number order
            return a.player - b.player;
        });
        
        // Reorder the money table rows based on the sorted players
        this.reorderMoneyTableRows(playerStats);
        
        // Update button state and appearance
        sortBtn.dataset.sortState = newState;
        
        // Update button icon and show confirmation
        if (newState === 'desc') {
            sortBtn.innerHTML = '⬇️'; // High to low
            sortBtn.title = 'Sort players by money won (highest first)';
        } else {
            sortBtn.innerHTML = '⬆️'; // Low to high
            sortBtn.title = 'Sort players by money won (lowest first)';
        }
        
        // Show confirmation briefly
        setTimeout(() => {
            sortBtn.innerHTML = '✅';
            sortBtn.style.background = '#28a745';
            
            setTimeout(() => {
                if (newState === 'desc') {
                    sortBtn.innerHTML = '⬇️';
                } else {
                    sortBtn.innerHTML = '⬆️';
                }
                sortBtn.style.background = 'transparent';
            }, 1000);
        }, 100);
    }

    reorderTableRows(sortedPlayerStats) {
        const tbody = document.getElementById('scoreTableBody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Clear the tbody
        tbody.innerHTML = '';
        
        // Add rows back in the new order
        sortedPlayerStats.forEach(playerStat => {
            const playerNum = playerStat.player;
            const row = rows.find(row => {
                const playerInput = row.querySelector('.player-name-input');
                return playerInput && playerInput.dataset.player == playerNum;
            });
            
            if (row) {
                tbody.appendChild(row);
            }
        });
        
        // Re-highlight scores after reordering
        this.highlightBestScores();
    }

    reorderMoneyTableRows(sortedPlayerStats) {
        const tbody = document.getElementById('moneyTableBody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Clear the tbody
        tbody.innerHTML = '';
        
        // Add rows back in the new order
        sortedPlayerStats.forEach(playerStat => {
            const playerNum = playerStat.player;
            const row = rows.find(row => {
                const playerNameCell = row.querySelector('.money-player-name');
                if (playerNameCell) {
                    // Check if this row belongs to the current player by comparing player names
                    const expectedPlayerName = this.playerNames[playerNum] || `Player ${playerNum}`;
                    return playerNameCell.textContent.trim() === expectedPlayerName;
                }
                return false;
            });
            
            if (row) {
                tbody.appendChild(row);
            }
        });
    }

    updatePlayerCalculations(player) {
        // Calculate played games, total points, and best 10 scores for this player
        let playedGames = 0;
        let totalPoints = 0;
        let allScores = [];
        
        for (let week = 1; week <= this.weeks; week++) {
            const scoreKey = `${player}-${week}`;
            const score = this.scores[scoreKey];
            
            if (score !== undefined && score !== null && score !== '') {
                playedGames++;
                const scoreValue = parseInt(score) || 0;
                totalPoints += scoreValue;
                allScores.push(scoreValue);
            }
        }
        
        // Calculate best N scores (lowest scores in golf) based on dropdown selection
        const sortedScores = allScores.sort((a, b) => a - b); // Sort ascending (best to worst in golf)
        const bestNScores = sortedScores.slice(0, this.bestScoreCount); // Take the best (lowest) N scores
        const bestNTotal = bestNScores.reduce((sum, score) => sum + score, 0);
        
        // Update the played games display
        const playedGamesSpan = document.querySelector(`.played-games-count[data-player="${player}"]`);
        if (playedGamesSpan) {
            playedGamesSpan.textContent = playedGames;
        }
        
        // Update the total points display
        const totalPointsSpan = document.querySelector(`.total-points-count[data-player="${player}"]`);
        if (totalPointsSpan) {
            totalPointsSpan.textContent = totalPoints;
        }
        
        // Update the best N scores display
        const bestNScoresSpan = document.querySelector(`.best-10-scores-count[data-player="${player}"]`);
        if (bestNScoresSpan) {
            bestNScoresSpan.textContent = bestNTotal;
        }
    }

    updateWeeklyTotal(week) {
        // This function is no longer needed since we removed the footer totals
        // Keeping it empty to avoid breaking existing code references
    }

    updateGrandTotals() {
        // This function is no longer needed since we removed the footer totals
        // Keeping it empty to avoid breaking existing code references
    }

    updateAllCalculations() {
        // Update all player calculations
        for (let player = 1; player <= this.players; player++) {
            this.updatePlayerCalculations(player);
        }
        
        // Update all weekly totals
        for (let week = 1; week <= this.weeks; week++) {
            this.updateWeeklyTotal(week);
        }
        
        this.updateGrandTotals();
        this.highlightBestScores();
        this.applyCellColors(); // Apply custom cell colors after calculations
    }

    highlightBestScores() {
        // Clear existing highlights
        document.querySelectorAll('.score-input').forEach(input => {
            input.classList.remove('best-score', 'other-score');
        });
        
        // Highlight scores for each player individually
        for (let player = 1; player <= this.players; player++) {
            const playerScores = [];
            
            // Collect all scores for this player
            for (let week = 1; week <= this.weeks; week++) {
                const scoreKey = `${player}-${week}`;
                const score = this.scores[scoreKey];
                
                if (score !== undefined && score !== null && score !== '') {
                    playerScores.push({
                        score: parseInt(score),
                        week: week,
                        input: document.querySelector(`input[data-player="${player}"][data-week="${week}"]`)
                    });
                }
            }
            
            if (playerScores.length > 0) {
                // Sort by score (highest first for highlighting top scores)
                playerScores.sort((a, b) => b.score - a.score);
                
                // Highlight the top N scores for this player in red (based on dropdown)
                const topScores = playerScores.slice(0, Math.min(this.bestScoreCount, playerScores.length));
                const otherScores = playerScores.slice(Math.min(this.bestScoreCount, playerScores.length));
                
                // Apply red highlighting to top 10 scores
                topScores.forEach(scoreData => {
                    if (scoreData.input) {
                        scoreData.input.classList.add('best-score');
                    }
                });
                
                // Apply bold black to other scores
                otherScores.forEach(scoreData => {
                    if (scoreData.input) {
                        scoreData.input.classList.add('other-score');
                    }
                });
            }
        }
    }

    saveData() {
        const data = {
            scores: this.scores,
            dates: this.dates,
            playerNames: this.playerNames,
            customHeaders: this.customHeaders,
            mainTitle: this.mainTitle,
            moneyWon: this.moneyWon,
            bestScoreCount: this.bestScoreCount,
            prizeValues: this.prizeValues,
            prizeWinners: this.prizeWinners,
            weeklyPrizeData: this.weeklyPrizeData,
            weeklyWins: this.weeklyWins,
            currentWeek: this.currentWeek,
            cellColors: this.cellColors
        };
        
        localStorage.setItem('pgaSwindleData', JSON.stringify(data));
        
        // Show save confirmation
        const saveBtn = document.getElementById('saveData');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✅ Saved!';
        saveBtn.style.background = '#28a745';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '#4a7c4e';
        }, 2000);
    }

    loadData() {
        const data = localStorage.getItem('pgaSwindleData');
        
        if (data) {
            const parsed = JSON.parse(data);
            this.scores = parsed.scores || {};
            this.dates = parsed.dates || {};
            this.playerNames = parsed.playerNames || {};
            this.customHeaders = parsed.customHeaders || {};
            this.mainTitle = parsed.mainTitle || '🏌️ PGA Swindle';
            this.moneyWon = parsed.moneyWon || {};
            this.bestScoreCount = parsed.bestScoreCount || 10;
            this.prizeValues = parsed.prizeValues || {};
            this.prizeWinners = parsed.prizeWinners || {};
            this.weeklyPrizeData = parsed.weeklyPrizeData || {};
            this.cellColors = parsed.cellColors || {};
            // Keep leaderboard empty - don't load weeklyWins from saved data
            this.weeklyWins = {};
            this.currentWeek = this.getCurrentWeek(); // Always use current week, not saved
            
            // Update UI with loaded data
            this.populateScoreInputs();
            this.populateDateInputs();
            this.populatePlayerNames();
            this.populateHeaders();
            this.populateMainTitle();
            this.populateMoneyData();
            this.populatePrizeValues();
            this.populatePrizeWinners();
            this.populateWeeklyPrizeData();
            document.getElementById('bestScoreCount').value = this.bestScoreCount;
            this.updateAllCalculations();
            
            // Show load confirmation
            const loadBtn = document.getElementById('loadData');
            const originalText = loadBtn.textContent;
            loadBtn.textContent = '✅ Loaded!';
            loadBtn.style.background = '#28a745';
            
            setTimeout(() => {
                loadBtn.textContent = originalText;
                loadBtn.style.background = '#4a7c4e';
            }, 2000);
        } else {
            alert('No saved data found!');
        }
    }

    populateScoreInputs() {
        Object.keys(this.scores).forEach(scoreKey => {
            const [player, week] = scoreKey.split('-');
            const input = document.querySelector(`input[data-player="${player}"][data-week="${week}"]`);
            if (input) {
                input.value = this.scores[scoreKey];
            }
        });
    }

    populateMoneyData() {
        // Recreate money table with loaded data
        this.createMoneyTable();
        this.updateAllMoneyTotals();
    }

    populateMainTitle() {
        const mainTitleInput = document.getElementById('mainTitle');
        if (mainTitleInput) {
            mainTitleInput.value = this.mainTitle;
        }
    }

    populateDateInputs() {
        Object.keys(this.dates).forEach(week => {
            const dateInput = document.querySelector(`input.date-input[data-week="${week}"]`);
            if (dateInput) {
                dateInput.value = this.dates[week];
            }
        });
    }

    populatePlayerNames() {
        Object.keys(this.playerNames).forEach(player => {
            const nameInput = document.querySelector(`input[data-player="${player}"]`);
            if (nameInput && nameInput.classList.contains('player-name-input')) {
                nameInput.value = this.playerNames[player];
            }
        });
    }

    populateHeaders() {
        // Populate summary header inputs
        Object.keys(this.customHeaders).forEach(headerKey => {
            if (headerKey.startsWith('week-')) {
                const week = headerKey.replace('week-', '');
                const weekInput = document.querySelector(`input[data-week="${week}"]`);
                if (weekInput && weekInput.classList.contains('week-header-input')) {
                    weekInput.value = this.customHeaders[headerKey];
                }
            } else {
                const headerInput = document.querySelector(`input[data-header="${headerKey}"]`);
                if (headerInput && headerInput.classList.contains('header-input')) {
                    headerInput.value = this.customHeaders[headerKey];
                }
            }
        });
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
            this.scores = {};
            this.dates = {};
            this.playerNames = {};
            this.customHeaders = {};
            this.mainTitle = '🏌️ PGA Swindle';
            this.moneyWon = {};
            this.bestScoreCount = 10;
            this.prizeValues = {};
            this.prizeWinners = {};
            this.weeklyPrizeData = {};
            this.weeklyWins = {};
            this.currentWeek = this.getCurrentWeek();
            this.cellColors = {};
            
            // Clear all inputs and cell colors
            document.querySelectorAll('.score-input').forEach(input => {
                input.value = '';
                input.classList.remove('best-score', 'other-score');
                input.style.backgroundColor = ''; // Clear custom background colors
            });
            
            document.querySelectorAll('.date-input').forEach(input => {
                input.value = '';
            });
            
            document.querySelectorAll('.player-name-input').forEach(input => {
                const player = input.dataset.player;
                input.value = `Player ${player}`;
            });
            
            // Reset header inputs to default values
            document.querySelectorAll('.header-input').forEach(input => {
                const headerKey = input.dataset.header;
                const defaultTexts = {
                    'player': 'Player',
                    'played-games': 'Played Games',
                    'total-points': 'Total Points',
                    'best-scores': `Best ${this.bestScoreCount} Scores`,
                    'money-invested': 'Money'
                };
                input.value = defaultTexts[headerKey] || input.value;
            });
            
            document.querySelectorAll('.week-header-input').forEach(input => {
                const week = input.dataset.week;
                input.value = `WK${week}`;
            });
            
            document.getElementById('bestScoreCount').value = 10;
            
            // Reset main title
            document.getElementById('mainTitle').value = '🏌️ PGA Swindle';
            
            // Clear money inputs
            document.querySelectorAll('.money-input').forEach(input => {
                input.value = '';
            });
            
            // Clear prize inputs
            document.querySelectorAll('.prize-input').forEach(input => {
                input.value = '';
            });
            
            // Clear weekly prize inputs
            document.querySelectorAll('.weekly-prize-input').forEach(input => {
                input.value = '';
            });
            
            // Reset all weekly totals
            document.querySelectorAll('.weekly-total').forEach(cell => {
                cell.textContent = '£0.00';
            });
            
            // Update calculations
            this.updateAllCalculations();
            
            // Refresh money table to reset Money Invested and Total Won columns
            this.createMoneyTable();
            this.updateAllMoneyTotals();
            
            // Clear localStorage
            localStorage.removeItem('pgaSwindleData');
            
            alert('All data cleared!');
        }
    }

    // Clear only scores-related data
    clearScoresData() {
        if (confirm('Are you sure you want to clear all scores data? This will clear scores, dates, player names, headers, and cell colors only. Money and prize data will be preserved.')) {
            // Clear scores-related data
            this.scores = {};
            this.dates = {};
            this.playerNames = {};
            this.customHeaders = {};
            this.bestScoreCount = 10;
            this.cellColors = {};
            
            // Clear score inputs and cell colors
            document.querySelectorAll('.score-input').forEach(input => {
                input.value = '';
                input.classList.remove('best-score', 'other-score');
                input.style.backgroundColor = ''; // Clear custom background colors
            });
            
            // Clear date inputs
            document.querySelectorAll('.date-input').forEach(input => {
                input.value = '';
            });
            
            // Reset player name inputs
            document.querySelectorAll('.player-name-input').forEach(input => {
                const player = input.dataset.player;
                input.value = `Player ${player}`;
            });
            
            // Reset header inputs to default values
            document.querySelectorAll('.header-input').forEach(input => {
                const headerKey = input.dataset.header;
                const defaultTexts = {
                    'player': 'Player',
                    'played-games': 'Played Games',
                    'total-points': 'Total Points',
                    'best-scores': `Best ${this.bestScoreCount} Scores`
                };
                input.value = defaultTexts[headerKey] || input.value;
            });
            
            // Reset week header inputs
            document.querySelectorAll('.week-header-input').forEach(input => {
                const week = input.dataset.week;
                input.value = `WK${week}`;
            });
            
            // Reset best score count dropdown
            document.getElementById('bestScoreCount').value = 10;
            
            // Update calculations
            this.updateAllCalculations();
            
            // Refresh money table to update Money Invested calculations
            this.createMoneyTable();
            this.updateAllMoneyTotals();
            
            // Save the changes
            this.saveData();
            
            alert('Scores data cleared! Money and prize data preserved.');
        }
    }

    // Clear only money-related data
    clearMoneyData() {
        if (confirm('Are you sure you want to clear all money won data? This will only clear money data and preserve scores and prize data.')) {
            // Clear money-related data
            this.moneyWon = {};
            
            // Refresh money table to show cleared data
            this.createMoneyTable();
            this.updateAllMoneyTotals();
            
            // Save the changes
            this.saveData();
            
            alert('Money data cleared! Scores and prize data preserved.');
        }
    }

    // Clear only prize-related data
    clearPrizesData() {
        if (confirm('Are you sure you want to clear all prize data? This will clear prize values and winner names only. Weekly Prize Distribution Tracker data will be preserved.')) {
            // Clear prize-related data (but preserve weeklyPrizeData)
            this.prizeValues = {};
            this.prizeWinners = {};
            // NOTE: weeklyPrizeData is NOT cleared to maintain permanent tracking
            
            // Clear prize inputs
            document.querySelectorAll('.prize-input').forEach(input => {
                input.value = '';
            });
            
            // Clear winner inputs
            document.querySelectorAll('.winner-input').forEach(input => {
                input.value = '';
            });
            
            // DO NOT clear weekly prize inputs - they should remain permanent
            // DO NOT reset weekly totals - they should remain permanent
            
            // Save the changes
            this.saveData();
            
            alert('Prize data cleared! Weekly Prize Distribution Tracker and all other data preserved.');
        }
    }

    // Export prizes data to JSON file
    exportPrizesData() {
        const prizesData = {
            prizeValues: this.prizeValues,
            prizeWinners: this.prizeWinners,
            weeklyPrizeData: this.weeklyPrizeData,
            exportDate: new Date().toISOString(),
            exportVersion: '1.1'
        };
        
        // Create and download JSON file
        const dataStr = JSON.stringify(prizesData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `swindle-prizes-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show export confirmation
        const exportBtn = document.getElementById('exportPrizesData');
        const originalText = exportBtn.textContent;
        const originalBg = exportBtn.style.background;
        exportBtn.textContent = '✅ Exported!';
        exportBtn.style.background = '#20c997';
        
        setTimeout(() => {
            exportBtn.textContent = originalText;
            exportBtn.style.background = originalBg;
        }, 2000);
    }

    // Import prizes data from JSON file
    importPrizesData() {
        const fileInput = document.getElementById('importPrizesFile');
        fileInput.click();
    }

    // Handle file selection for import
    handleImportFile(file) {
        if (!file) {
            alert('No file selected!');
            return;
        }
        
        if (file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) {
            alert('Please select a valid JSON file!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate imported data structure
                if (!importedData.prizeValues && !importedData.prizeWinners && !importedData.weeklyPrizeData) {
                    throw new Error('Invalid file format: Missing prize data');
                }
                
                // Confirm import with user
                const confirmMessage = `Import prizes data from ${file.name}?\n\nThis will replace current prize values, winner names, and Weekly Prize Distribution Tracker data.`;
                
                if (confirm(confirmMessage)) {
                    // Import prize values
                    if (importedData.prizeValues) {
                        this.prizeValues = { ...importedData.prizeValues };
                    }
                    
                    // Import prize winners
                    if (importedData.prizeWinners) {
                        this.prizeWinners = { ...importedData.prizeWinners };
                    }
                    
                    // Import weekly prize data
                    if (importedData.weeklyPrizeData) {
                        this.weeklyPrizeData = { ...importedData.weeklyPrizeData };
                    }
                    
                    // Update UI with imported data
                    this.populatePrizeValues();
                    this.populatePrizeWinners();
                    this.populateWeeklyPrizeData();
                    
                    // Save the imported data
                    this.saveData();
                    
                    // Show import confirmation
                    const importBtn = document.getElementById('importPrizesData');
                    const originalText = importBtn.textContent;
                    const originalBg = importBtn.style.background;
                    importBtn.textContent = '✅ Imported!';
                    importBtn.style.background = '#20c997';
                    
                    setTimeout(() => {
                        importBtn.textContent = originalText;
                        importBtn.style.background = originalBg;
                    }, 2000);
                    
                    alert('Prizes data imported successfully!');
                } else {
                    alert('Import cancelled.');
                }
                
            } catch (error) {
                alert(`Error importing file: ${error.message}`);
                console.error('Import error:', error);
            }
        };
        
        reader.onerror = () => {
            alert('Error reading file!');
        };
        
        reader.readAsText(file);
    }

    // Tab switching functionality
    switchTab(tabName) {
        // Remove active class from all tab buttons and content
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to clicked tab and corresponding content
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}Tab`);
        
        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeContent.classList.add('active');
            
            // Initialize golf scorecard when scorecard tab is activated
            if (tabName === 'scorecard' && typeof window.initializeGolfScorecard === 'function') {
                window.initializeGolfScorecard();
            }
        }
    }

    // Create money table
    createMoneyTable() {
        const tbody = document.getElementById('moneyTableBody');
        tbody.innerHTML = '';
        
        for (let player = 1; player <= this.players; player++) {
            const row = document.createElement('tr');
            row.innerHTML = this.createMoneyRowHTML(player);
            tbody.appendChild(row);
        }
    }

    createMoneyRowHTML(playerNum) {
        const playerName = this.playerNames[playerNum] || `Player ${playerNum}`;
        const moneyData = this.moneyWon[playerNum] || { weeklyWins: 0, tournamentPrizes: 0 };
        const totalWon = moneyData.weeklyWins + moneyData.tournamentPrizes;
        
        // Calculate money invested (£5 per week played)
        let playedGames = 0;
        for (let week = 1; week <= this.weeks; week++) {
            const scoreKey = `${playerNum}-${week}`;
            const score = this.scores[scoreKey];
            if (score !== undefined && score !== null && score !== '') {
                playedGames++;
            }
        }
        const moneyInvested = playedGames * 5;
        
        return `
            <tr>
                <td class="money-player-name">${playerName}</td>
                <td class="money-invested-cell" style="background-color:#d4a853;text-align:center;font-weight:bold;color:white;">£${moneyInvested}</td>
                <td>
                    <input type="text" 
                           class="money-input" 
                           data-player="${playerNum}" 
                           data-category="weeklyWins"
                           value=""
                           placeholder="${moneyData.weeklyWins > 0 ? `Total: £${moneyData.weeklyWins.toFixed(2)}` : 'Enter amount (e.g. 20, -10 for correction)'}"
                </td>
                <td>
                    <input type="text" 
                           class="money-input" 
                           data-player="${playerNum}" 
                           data-category="tournamentPrizes"
                           value=""
                           placeholder="${moneyData.tournamentPrizes > 0 ? `Total: £${moneyData.tournamentPrizes.toFixed(2)}` : 'Enter amount (e.g. 50, -25 for correction)'}"
                </td>
                <td class="money-total">£${totalWon.toFixed(2)}</td>
            </tr>
        `;
    }

    // Handle money input changes
    handleMoneyInput(input) {
        const player = input.dataset.player;
        const category = input.dataset.category;
        const inputValue = input.value.trim();
        
        // If input is empty, just return (allow typing)
        if (inputValue === '') {
            return;
        }
        
        // Parse amount - handle negative values for corrections
        // Remove currency symbols but keep minus sign and decimal point
        const cleanValue = inputValue.replace(/[£$€,]/g, '').replace(/[^0-9.-]/g, '');
        const amount = parseFloat(cleanValue);
        
        // Check for valid number (including negative values)
        if (isNaN(amount) || cleanValue === '') {
            input.value = ''; // Clear invalid input
            return;
        }
        
        // Initialize player money data if it doesn't exist
        if (!this.moneyWon[player]) {
            this.moneyWon[player] = { weeklyWins: 0, tournamentPrizes: 0 };
        }
        
        if (amount !== 0) {
            // Add the amount to the existing total (can be positive or negative)
            this.moneyWon[player][category] += amount;
            
            // Ensure the total doesn't go below zero
            if (this.moneyWon[player][category] < 0) {
                this.moneyWon[player][category] = 0;
            }
            
            // Clear the input field for next entry
            input.value = '';
            
            // Update placeholder to show current total
            input.placeholder = `Total: £${this.moneyWon[player][category].toFixed(2)}`;
            
            // Show brief confirmation with different colors for positive/negative amounts
            const originalBg = input.style.backgroundColor;
            const originalBorder = input.style.border;
            
            if (amount > 0) {
                // Positive amount - green confirmation
                input.style.backgroundColor = '#d4edda';
                input.style.border = '2px solid #28a745';
            } else {
                // Negative amount - orange/yellow confirmation for correction
                input.style.backgroundColor = '#fff3cd';
                input.style.border = '2px solid #ffc107';
            }
            
            setTimeout(() => {
                input.style.backgroundColor = originalBg;
                input.style.border = originalBorder;
            }, 1000);
        } else {
            // amount === 0: Reset the total to 0
            this.moneyWon[player][category] = 0;
            input.value = '';
            input.placeholder = 'Total: £0.00';
        }
        
        // Update the total display for this player
        this.updateMoneyTotal(player);
        
        // Auto-save
        this.saveData();
    }

    // Update money total for a specific player
    updateMoneyTotal(player) {
        const moneyData = this.moneyWon[player] || { weeklyWins: 0, tournamentPrizes: 0 };
        const totalWon = moneyData.weeklyWins + moneyData.tournamentPrizes;
        
        const totalCell = document.querySelector(`tr:nth-child(${player}) .money-total`);
        if (totalCell) {
            totalCell.textContent = `£${totalWon.toFixed(2)}`;
        }
    }

    // Update all money totals
    updateAllMoneyTotals() {
        for (let player = 1; player <= this.players; player++) {
            this.updateMoneyTotal(player);
        }
    }

    // Handle prize input changes
    handlePrizeInput(input) {
        const prizeType = input.dataset.prize;
        const inputValue = input.value.trim();
        
        // Parse amount by removing currency symbols and non-numeric characters (except decimal point)
        const cleanValue = inputValue.replace(/[£$€,]/g, '').replace(/[^0-9.]/g, '');
        const amount = parseFloat(cleanValue);
        
        // Check for valid number or empty input
        if (inputValue === '' || cleanValue === '') {
            // Remove the prize value if input is empty
            delete this.prizeValues[prizeType];
        } else if (!isNaN(amount) && amount >= 0) {
            // Store the valid amount
            this.prizeValues[prizeType] = amount;
            
            // Format the display with £ symbol
            const formattedValue = `£${amount.toFixed(2)}`;
            input.value = formattedValue;
        } else {
            // Invalid input, revert to previous value or clear
            const previousValue = this.prizeValues[prizeType] || '';
            input.value = previousValue ? `£${previousValue.toFixed(2)}` : '';
            return;
        }
        
        // Auto-save
        this.saveData();
    }

    // Populate prize values from saved data
    populatePrizeValues() {
        const prizeInputs = document.querySelectorAll('.prize-input');
        prizeInputs.forEach(input => {
            const prizeType = input.dataset.prize;
            const value = this.prizeValues[prizeType];
            if (value !== undefined && value !== null) {
                input.value = `£${value.toFixed(2)}`;
            }
        });
    }

    // Populate prize winner names from saved data
    populatePrizeWinners() {
        const winnerInputs = document.querySelectorAll('.winner-input');
        winnerInputs.forEach(input => {
            const prizeType = input.dataset.winner;
            const winnerName = this.prizeWinners[prizeType];
            if (winnerName !== undefined && winnerName !== null) {
                input.value = winnerName;
            }
        });
    }


    // Function to find and remove a week column with specific scores
    findAndRemoveWeekWithScores(targetScores) {
        // targetScores should be an array like [10, 35, 35, 35, 35, 35, 35, 35, 35, 36]
        for (let week = 1; week <= this.weeks; week++) {
            const weekScores = [];
            
            // Collect scores for this week (first 10 players)
            for (let player = 1; player <= Math.min(10, this.players); player++) {
                const scoreKey = `${player}-${week}`;
                const score = this.scores[scoreKey];
                if (score !== undefined && score !== null) {
                    weekScores.push(score);
                } else {
                    weekScores.push(null); // No score
                }
            }
            
            // Check if this week's scores match the target pattern
            if (this.arraysMatch(weekScores, targetScores)) {
                console.log(`Found matching week: WK${week}`);
                if (confirm(`Found matching scores in WK${week}. Do you want to remove this entire week column?`)) {
                    this.removeWeekColumn(week);
                    return true;
                }
            }
        }
        
        alert('No matching week column found with those specific scores.');
        return false;
    }
    
    // Helper function to compare arrays
    arraysMatch(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
    
    // Function to remove a specific week column
    removeWeekColumn(weekToRemove) {
        // Remove all scores for this week
        for (let player = 1; player <= this.players; player++) {
            const scoreKey = `${player}-${weekToRemove}`;
            delete this.scores[scoreKey];
        }
        
        // Remove the date for this week
        delete this.dates[weekToRemove];
        
        // Update all calculations
        this.updateAllCalculations();
        
        // Save the changes
        this.saveData();
        
        alert(`WK${weekToRemove} column has been removed successfully!`);
    }
    
    // Export functionality for future use
    exportToCSV() {
        let csv = 'Player';
        
        // Add week headers
        for (let week = 1; week <= this.weeks; week++) {
            const date = this.dates[week] || '';
            csv += `,WK${week} (${date})`;
        }
        csv += '\n';
        
        // Add player data
        for (let player = 1; player <= this.players; player++) {
            // Get player name if available
            const playerName = this.playerNames[player] || `Player ${player}`;
            csv += `${playerName}`;
            
            // Add scores for each week
            for (let week = 1; week <= this.weeks; week++) {
                const scoreKey = `${player}-${week}`;
                const score = this.scores[scoreKey] || '';
                csv += `,${score}`;
            }
            
            csv += '\n';
        }
        
        return csv;
    }
    
    // Simple download image function
    async downloadImage() {
        try {
            const shareBtn = document.getElementById('shareButton');
            const originalText = shareBtn.textContent;
            
            shareBtn.textContent = 'Capturing...';
            shareBtn.disabled = true;
            
            const { blob, filename } = await this.captureTableImage();
            
            // Download the image
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            shareBtn.textContent = '✅ Downloaded!';
            shareBtn.style.background = '#28a745';
            
            setTimeout(() => {
                shareBtn.textContent = originalText;
                shareBtn.style.background = '#4a7c4e';
                shareBtn.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('Error capturing table:', error);
            alert('Error capturing table screenshot. Please try again.');
            
            const shareBtn = document.getElementById('shareButton');
            shareBtn.textContent = '📥 Download Image';
            shareBtn.disabled = false;
        }
    }
    
    
    // Helper function to capture table image
    async captureTableImage() {
        const tableElement = document.getElementById('scoreTable');
        
        if (!tableElement) {
            throw new Error('Score table not found');
        }
        
        const canvas = await html2canvas(tableElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: false,
            scrollX: 0,
            scrollY: 0,
            width: tableElement.scrollWidth,
            height: tableElement.scrollHeight
        });
        
        return new Promise(resolve => {
            canvas.toBlob((blob) => {
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
                const filename = `PGA-Swindle-Scores-${timestamp}.png`;
                resolve({ blob, filename });
            }, 'image/png', 0.95);
        });
    }
    
    // Share table functionality - captures screenshot and provides sharing options
    async shareTable() {
        try {
            const shareBtn = document.getElementById('shareButton');
            const originalText = shareBtn.textContent;
            
            // Show loading state
            shareBtn.textContent = 'Capturing...';
            shareBtn.disabled = true;
            
            // Get the table element to capture
            const tableElement = document.getElementById('scoreTable');
            
            if (!tableElement) {
                throw new Error('Score table not found');
            }
            
            // Configure html2canvas options for better quality
            const canvas = await html2canvas(tableElement, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher resolution
                useCORS: true,
                allowTaint: false,
                scrollX: 0,
                scrollY: 0,
                width: tableElement.scrollWidth,
                height: tableElement.scrollHeight
            });
            
            // Convert canvas to blob for sharing/downloading
            canvas.toBlob(async (blob) => {
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
                const filename = `PGA-Swindle-Scores-${timestamp}.png`;
                
                // Try to use Web Share API first (mobile-friendly)
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] })) {
                    try {
                        const file = new File([blob], filename, { type: 'image/png' });
                        await navigator.share({
                            title: 'PGA Swindle - Golf Scores',
                            text: 'Check out our golf scores!',
                            files: [file]
                        });
                        
                        // Reset button on successful share
                        shareBtn.textContent = '✅ Shared!';
                        shareBtn.style.background = '#28a745';
                        
                        setTimeout(() => {
                            shareBtn.textContent = originalText;
                            shareBtn.style.background = '#4a7c4e';
                            shareBtn.disabled = false;
                        }, 2000);
                        return;
                    } catch (shareError) {
                        console.log('Web Share API failed, falling back to other options');
                    }
                }
                
                // Fallback: Show modal with multiple sharing options
                this.showShareModal(blob, filename);
                
                // Reset button
                shareBtn.textContent = originalText;
                shareBtn.disabled = false;
                
            }, 'image/png', 0.95);
            
        } catch (error) {
            console.error('Error capturing table:', error);
            alert('Error capturing table screenshot. Please try again.');
            
            // Reset button on error
            const shareBtn = document.getElementById('shareButton');
            shareBtn.textContent = 'Share Table';
            shareBtn.disabled = false;
        }
    }
    
    // Show modal with sharing options when Web Share API is not available
    showShareModal(blob, filename) {
        // Create modal HTML
        const modalHTML = `
            <div id="shareModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                ">
                    <h3 style="margin-top: 0; color: #2c5530;">Share Golf Scores</h3>
                    <p style="color: #666; margin-bottom: 20px;">Choose how you'd like to share your golf scores:</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button id="downloadBtn" style="
                            background: #4a7c4e;
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 14px;
                        ">📥 Download Image</button>
                        
                        <button id="copyBtn" style="
                            background: #5cb85c;
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 14px;
                        ">📋 Copy to Clipboard</button>
                        
                        <button id="whatsappBtn" style="
                            background: #25D366;
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 14px;
                        ">💬 Share via WhatsApp</button>
                        
                        <button id="emailBtn" style="
                            background: #337ab7;
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 14px;
                        ">📧 Share via Email</button>
                    </div>
                    
                    <button id="closeModalBtn" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                        margin-top: 15px;
                    ">Close</button>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('shareModal');
        const downloadBtn = document.getElementById('downloadBtn');
        const copyBtn = document.getElementById('copyBtn');
        const whatsappBtn = document.getElementById('whatsappBtn');
        const emailBtn = document.getElementById('emailBtn');
        const closeModalBtn = document.getElementById('closeModalBtn');
        
        // Download functionality
        downloadBtn.addEventListener('click', () => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            downloadBtn.textContent = '✅ Downloaded!';
            downloadBtn.style.background = '#28a745';
        });
        
        // Copy to clipboard functionality
        copyBtn.addEventListener('click', async () => {
            try {
                if (navigator.clipboard && window.ClipboardItem) {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    copyBtn.textContent = '✅ Copied!';
                    copyBtn.style.background = '#28a745';
                } else {
                    throw new Error('Clipboard API not supported');
                }
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                copyBtn.textContent = '❌ Copy failed';
                copyBtn.style.background = '#d9534f';
                
                // Show fallback message
                setTimeout(() => {
                    alert('Copy to clipboard not supported. Please use the download option instead.');
                }, 500);
            }
        });
        
        // WhatsApp share - copy to clipboard for easy pasting
        whatsappBtn.addEventListener('click', async () => {
            whatsappBtn.textContent = '✅ Copying to clipboard...';
            whatsappBtn.style.background = '#28a745';
            
            try {
                // First try to copy image to clipboard
                if (navigator.clipboard && window.ClipboardItem) {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    
                    // Also download as backup
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    whatsappBtn.textContent = '✅ Ready to paste!';
                    
                    // Show success message with clipboard instructions
                    setTimeout(() => {
                        alert('✅ Image copied to clipboard and downloaded!\n\n🚀 EASY METHOD:\n1. Open WhatsApp (desktop or web)\n2. Go to any chat\n3. Press Ctrl+V to paste the image directly!\n\n📎 OR use the downloaded file:\n- File saved as: ' + filename);
                        
                        // Try to open WhatsApp Web as a convenience
                        if (confirm('Would you like me to open WhatsApp Web for you?')) {
                            window.open('https://web.whatsapp.com', '_blank');
                        }
                    }, 500);
                    
                } else {
                    throw new Error('Clipboard API not supported');
                }
                
            } catch (error) {
                console.error('Clipboard failed, falling back to download:', error);
                
                // Fallback: just download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                whatsappBtn.textContent = '✅ Image Downloaded!';
                
                setTimeout(() => {
                    alert('📥 Image downloaded!\n\n📱 To share via WhatsApp:\n1. Open WhatsApp\n2. Go to a chat or create a new one\n3. Click the attachment/paperclip icon\n4. Select "Photos & Videos" or "Gallery"\n5. Choose the downloaded image: ' + filename);
                    
                    // Offer to open WhatsApp Web
                    if (confirm('Would you like me to open WhatsApp Web for you?')) {
                        window.open('https://web.whatsapp.com', '_blank');
                    }
                }, 500);
            }
        });
        
        // Email share
        emailBtn.addEventListener('click', () => {
            // Download image first
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            emailBtn.textContent = '✅ Image Downloaded!';
            emailBtn.style.background = '#28a745';
            
            // Show instructions for email
            setTimeout(() => {
                alert('📥 Image downloaded!\n\n📧 To share via Email:\n1. Open your email client\n2. Create a new email\n3. Attach the downloaded image: ' + filename + '\n4. Add subject: "PGA Swindle - Golf Scores"\n5. Send to your recipients!');
            }, 500);
        });
        
        // Close modal
        const closeModal = () => {
            modal.remove();
        };
        
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // === LEADERBOARD FUNCTIONALITY ===
    
    getCurrentWeek() {
        const now = new Date();
        const year = now.getFullYear();
        const week = Math.ceil(((now - new Date(year, 0, 1)) / 86400000 + 1) / 7);
        return `${year}-W${week}`;
    }
    
    createLeaderboard() {
        // Populate current week selector
        this.populateWeekSelector();
        
        // Populate history filters
        this.populateHistoryFilters();
        
        // Set up leaderboard event listeners
        this.attachLeaderboardListeners();
    }
    
    populateWeekSelector() {
        const weekSelect = document.getElementById('currentWeek');
        if (!weekSelect) return;
        
        weekSelect.innerHTML = '';
        
        // Generate week options for current year
        const currentYear = new Date().getFullYear();
        for (let week = 1; week <= 52; week++) {
            const weekId = `${currentYear}-W${week}`;
            const option = document.createElement('option');
            option.value = weekId;
            option.textContent = `Week ${week} (${currentYear})`;
            
            if (weekId === this.currentWeek) {
                option.selected = true;
            }
            
            weekSelect.appendChild(option);
        }
    }
    
    populateHistoryFilters() {
        // Populate player filter
        const playerSelect = document.getElementById('historyPlayerFilter');
        if (playerSelect) {
            // Clear existing options except "All Players"
            playerSelect.innerHTML = '<option value="all">All Players</option>';
            
            // Add options for players with custom names
            Object.entries(this.playerNames).forEach(([playerNum, playerName]) => {
                const option = document.createElement('option');
                option.value = playerNum;
                option.textContent = playerName;
                playerSelect.appendChild(option);
            });
        }
        
        // Populate week filter
        const weekSelect = document.getElementById('historyWeekFilter');
        if (weekSelect) {
            weekSelect.innerHTML = '<option value="all">All Weeks</option>';
            
            // Add weeks that have recorded wins
            const weeksWithWins = new Set();
            Object.values(this.weeklyWins).forEach(playerData => {
                Object.keys(playerData.weekly || {}).forEach(week => {
                    weeksWithWins.add(week);
                });
            });
            
            Array.from(weeksWithWins).sort().forEach(week => {
                const option = document.createElement('option');
                option.value = week;
                option.textContent = week;
                weekSelect.appendChild(option);
            });
        }
    }
    
    attachLeaderboardListeners() {
        // Record win button
        const recordWinBtn = document.getElementById('recordWin');
        if (recordWinBtn) {
            recordWinBtn.addEventListener('click', () => this.recordTopScorerWin());
        }
        
        // Clear leaderboard button
        const clearBtn = document.getElementById('clearLeaderboard');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllWins());
        }
        
        // Week selector change
        const weekSelect = document.getElementById('currentWeek');
        if (weekSelect) {
            weekSelect.addEventListener('change', (e) => {
                this.currentWeek = e.target.value;
                this.updateLeaderboard();
                this.saveData();
            });
        }
        
        // History filters
        const playerFilter = document.getElementById('historyPlayerFilter');
        if (playerFilter) {
            playerFilter.addEventListener('change', () => this.updateWinHistory());
        }
        
        const weekFilter = document.getElementById('historyWeekFilter');
        if (weekFilter) {
            weekFilter.addEventListener('change', () => this.updateWinHistory());
        }
    }
    
    recordTopScorerWin() {
        // Find the player with the highest score this week
        const topScorer = this.getTopScorerForCurrentWeek();
        
        if (!topScorer) {
            alert('No scores recorded for this week yet!');
            return;
        }
        
        if (confirm(`Record a win for ${topScorer.name} (${topScorer.score} points this week)?`)) {
            this.recordWin(topScorer.name);
        }
    }
    
    getTopScorerForCurrentWeek() {
        let topScore = -1;
        let topScorer = null;
        
        // Check which week number we should look at (extract from currentWeek format)
        const weekMatch = this.currentWeek.match(/W(\d+)/);
        if (!weekMatch) return null;
        
        const weekNumber = parseInt(weekMatch[1]);
        
        // Find player with highest score for this week
        for (let player = 1; player <= this.players; player++) {
            const scoreKey = `${player}-${weekNumber}`;
            const score = this.scores[scoreKey];
            
            if (score !== undefined && score !== null && score !== '') {
                const numericScore = parseInt(score);
                if (numericScore > topScore) {
                    topScore = numericScore;
                    topScorer = {
                        name: this.playerNames[player] || `Player ${player}`,
                        score: numericScore,
                        playerNum: player
                    };
                }
            }
        }
        
        return topScorer;
    }
    
    recordWin(playerName) {
        // Initialize weekly wins structure if not exists
        if (!this.weeklyWins[playerName]) {
            this.weeklyWins[playerName] = {
                total: 0,
                weekly: {}
            };
        }
        
        // Add win for current week
        if (!this.weeklyWins[playerName].weekly[this.currentWeek]) {
            this.weeklyWins[playerName].weekly[this.currentWeek] = 1;
        } else {
            this.weeklyWins[playerName].weekly[this.currentWeek] += 1;
        }
        
        // Update total (cumulative as per rules)
        this.weeklyWins[playerName].total = Object.values(this.weeklyWins[playerName].weekly)
            .reduce((sum, weekWins) => sum + weekWins, 0);
        
        // Update leaderboard display
        this.updateLeaderboard();
        this.updateWinHistory();
        
        // Save data
        this.saveData();
        
        alert(`🏆 Win recorded for ${playerName}! Total wins: ${this.weeklyWins[playerName].total}`);
    }
    
    recordWinForPlayer(playerName) {
        if (confirm(`Record a win for ${playerName} this week (${this.currentWeek})?`)) {
            this.recordWin(playerName);
        }
    }
    
    clearAllWins() {
        if (confirm('Are you sure you want to clear ALL weekly wins data? This cannot be undone!')) {
            this.weeklyWins = {};
            this.updateLeaderboard();
            this.updateWinHistory();
            this.saveData();
            alert('All wins data cleared!');
        }
    }
    
    updateLeaderboard() {
        this.updateLeaderboardStats();
        this.updateLeaderboardTable();
    }
    
    updateLeaderboardStats() {
        // Update this week's winner
        const weekWinnerEl = document.getElementById('weekWinner');
        if (weekWinnerEl) {
            const thisWeekWinner = this.getThisWeeksWinner();
            weekWinnerEl.textContent = thisWeekWinner || 'TBD';
        }
        
        // Update overall leader
        const overallLeaderEl = document.getElementById('overallLeader');
        if (overallLeaderEl) {
            const overallLeader = this.getOverallLeader();
            overallLeaderEl.textContent = overallLeader || 'TBD';
        }
        
        // Update total games
        const totalGamesEl = document.getElementById('totalGames');
        if (totalGamesEl) {
            const totalGames = Object.values(this.weeklyWins)
                .reduce((sum, playerData) => sum + playerData.total, 0);
            totalGamesEl.textContent = totalGames;
        }
    }
    
    getThisWeeksWinner() {
        let maxWins = 0;
        let winner = null;
        
        Object.entries(this.weeklyWins).forEach(([playerName, data]) => {
            const thisWeekWins = data.weekly[this.currentWeek] || 0;
            if (thisWeekWins > maxWins) {
                maxWins = thisWeekWins;
                winner = playerName;
            }
        });
        
        return winner;
    }
    
    getOverallLeader() {
        let maxWins = 0;
        let leader = null;
        
        Object.entries(this.weeklyWins).forEach(([playerName, data]) => {
            if (data.total > maxWins) {
                maxWins = data.total;
                leader = playerName;
            }
        });
        
        return leader;
    }
    
    updateLeaderboardTable() {
        const tbody = document.getElementById('leaderboardTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Get sorted player data
        const leaderboardData = this.getLeaderboardData();
        
        leaderboardData.forEach((playerData, index) => {
            const row = document.createElement('tr');
            
            // Rank
            const rankCell = document.createElement('td');
            rankCell.style.textAlign = 'center';
            rankCell.style.fontWeight = 'bold';
            
            if (index === 0) {
                rankCell.innerHTML = '🥇 1';
                rankCell.style.color = '#FFD700';
            } else if (index === 1) {
                rankCell.innerHTML = '🥈 2';
                rankCell.style.color = '#C0C0C0';
            } else if (index === 2) {
                rankCell.innerHTML = '🥉 3';
                rankCell.style.color = '#CD7F32';
            } else {
                rankCell.textContent = index + 1;
            }
            row.appendChild(rankCell);
            
            // Player name
            const nameCell = document.createElement('td');
            nameCell.textContent = playerData.name;
            nameCell.style.fontWeight = 'bold';
            row.appendChild(nameCell);
            
            // Total wins
            const totalWinsCell = document.createElement('td');
            totalWinsCell.textContent = playerData.totalWins;
            totalWinsCell.style.textAlign = 'center';
            totalWinsCell.style.fontWeight = 'bold';
            row.appendChild(totalWinsCell);
            
            // This week wins
            const thisWeekCell = document.createElement('td');
            thisWeekCell.textContent = playerData.thisWeekWins;
            thisWeekCell.style.textAlign = 'center';
            row.appendChild(thisWeekCell);
            
            // Win rate
            const winRateCell = document.createElement('td');
            winRateCell.textContent = playerData.winRate;
            winRateCell.style.textAlign = 'center';
            row.appendChild(winRateCell);
            
            // Last win
            const lastWinCell = document.createElement('td');
            lastWinCell.textContent = playerData.lastWin || 'Never';
            lastWinCell.style.textAlign = 'center';
            row.appendChild(lastWinCell);
            
            // Actions
            const actionsCell = document.createElement('td');
            const recordWinBtn = document.createElement('button');
            recordWinBtn.textContent = '🏆 +1';
            recordWinBtn.className = 'record-win-btn-small';
            recordWinBtn.style.cssText = 'background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;';
            recordWinBtn.onclick = () => this.recordWinForPlayer(playerData.name);
            actionsCell.appendChild(recordWinBtn);
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
    }
    
    getLeaderboardData() {
        // Get all players who have wins or are in playerNames
        const allPlayerNames = new Set();
        
        // Add players with recorded wins
        Object.keys(this.weeklyWins).forEach(name => allPlayerNames.add(name));
        
        // Add players with custom names (in case they don't have wins yet)
        Object.values(this.playerNames).forEach(name => allPlayerNames.add(name));
        
        const leaderboardData = Array.from(allPlayerNames).map(playerName => {
            const winData = this.weeklyWins[playerName] || { total: 0, weekly: {} };
            const thisWeekWins = winData.weekly[this.currentWeek] || 0;
            
            // Calculate win rate (assuming total possible games)
            const totalGamesPlayed = Math.max(1, Object.keys(winData.weekly).length);
            const winRate = ((winData.total / totalGamesPlayed) * 100).toFixed(1) + '%';
            
            // Find last win week
            let lastWin = null;
            if (winData.weekly) {
                const weekKeys = Object.keys(winData.weekly).sort();
                if (weekKeys.length > 0) {
                    lastWin = weekKeys[weekKeys.length - 1];
                }
            }
            
            return {
                name: playerName,
                totalWins: winData.total,
                thisWeekWins: thisWeekWins,
                winRate: winRate,
                lastWin: lastWin
            };
        });
        
        // Sort by total wins (descending), then by this week's wins
        return leaderboardData.sort((a, b) => {
            if (b.totalWins !== a.totalWins) {
                return b.totalWins - a.totalWins;
            }
            return b.thisWeekWins - a.thisWeekWins;
        });
    }
    
    updateWinHistory() {
        const historyGrid = document.getElementById('winHistoryGrid');
        if (!historyGrid) return;
        
        const playerFilter = document.getElementById('historyPlayerFilter')?.value || 'all';
        const weekFilter = document.getElementById('historyWeekFilter')?.value || 'all';
        
        historyGrid.innerHTML = '';
        
        // Collect all win records
        const winRecords = [];
        
        Object.entries(this.weeklyWins).forEach(([playerName, data]) => {
            Object.entries(data.weekly || {}).forEach(([week, wins]) => {
                // Apply filters
                if (playerFilter !== 'all' && this.playerNames[playerFilter] !== playerName) {
                    return;
                }
                if (weekFilter !== 'all' && week !== weekFilter) {
                    return;
                }
                
                for (let i = 0; i < wins; i++) {
                    winRecords.push({
                        playerName: playerName,
                        week: week,
                        timestamp: `${week} - Win ${i + 1}`
                    });
                }
            });
        });
        
        // Sort by week (newest first)
        winRecords.sort((a, b) => b.week.localeCompare(a.week));
        
        if (winRecords.length === 0) {
            historyGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No wins recorded yet.</p>';
            return;
        }
        
        // Display win records
        winRecords.forEach(record => {
            const winItem = document.createElement('div');
            winItem.className = 'win-history-item';
            winItem.style.cssText = 'background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;';
            
            winItem.innerHTML = `
                <div>
                    <strong style="color: #2c5530;">${record.playerName}</strong>
                    <div style="font-size: 12px; color: #666;">${record.timestamp}</div>
                </div>
                <div style="font-size: 18px;">🏆</div>
            `;
            
            historyGrid.appendChild(winItem);
        });
    }
    
    // === END LEADERBOARD FUNCTIONALITY ===

    // === CELL COLOR CUSTOMIZATION ===
    
    showColorPicker(inputElement, x, y) {
        // Remove any existing color picker
        const existingPicker = document.getElementById('colorPicker');
        if (existingPicker) {
            existingPicker.remove();
        }
        
        const player = inputElement.dataset.player;
        const week = inputElement.dataset.week;
        const cellKey = `${player}-${week}`;
        
        // Get current cell color or default
        const currentColor = this.cellColors[cellKey] || '#ffffff';
        
        // Create color picker HTML
        const colorPickerHTML = `
            <div id="colorPicker" style="
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                background: white;
                border: 2px solid #ccc;
                border-radius: 8px;
                padding: 10px;
                z-index: 1000;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                font-family: Arial, sans-serif;
                min-width: 180px;
            ">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #333;">
                    Cell Color for Player ${player}, Week ${week}
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
                    <div class="color-option" data-color="#ffffff" style="width: 25px; height: 25px; background: #ffffff; border: 2px solid #ccc; cursor: pointer; border-radius: 4px;" title="White (Default)"></div>
                    <div class="color-option" data-color="#ffeb3b" style="width: 25px; height: 25px; background: #ffeb3b; border: 2px solid #ccc; cursor: pointer; border-radius: 4px;" title="Yellow"></div>
                    <div class="color-option" data-color="#4caf50" style="width: 25px; height: 25px; background: #4caf50; border: 2px solid #ccc; cursor: pointer; border-radius: 4px;" title="Green"></div>
                    <div class="color-option" data-color="#2196f3" style="width: 25px; height: 25px; background: #2196f3; border: 2px solid #ccc; cursor: pointer; border-radius: 4px;" title="Blue"></div>
                    <div class="color-option" data-color="#ff9800" style="width: 25px; height: 25px; background: #ff9800; border: 2px solid #ccc; cursor: pointer; border-radius: 4px;" title="Orange"></div>
                    <div class="color-option" data-color="#f44336" style="width: 25px; height: 25px; background: #f44336; border: 2px solid #ccc; cursor: pointer; border-radius: 4px;" title="Red"></div>
                    <div class="color-option" data-color="#e91e63" style="width: 25px; height: 25px; background: #e91e63; border: 2px solid #ccc; cursor: pointer; border-radius: 4px;" title="Pink"></div>
                    <div class="color-option" data-color="#9c27b0" style="width: 25px; height: 25px; background: #9c27b0; border: 2px solid #ccc; cursor: pointer; border-radius: 4px;" title="Purple"></div>
                </div>
                
                <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 10px;">
                    <label style="font-size: 11px; color: #666;">Custom:</label>
                    <input type="color" id="customColorInput" value="${currentColor}" style="width: 30px; height: 25px; border: none; cursor: pointer;">
                </div>
                
                <div style="display: flex; gap: 5px; justify-content: space-between;">
                    <button id="clearCellColor" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 5px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 10px;
                    ">Clear</button>
                    <button id="applyCellColor" style="
                        background: #4caf50;
                        color: white;
                        border: none;
                        padding: 5px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 10px;
                    ">Apply</button>
                </div>
            </div>
        `;
        
        // Add color picker to page
        document.body.insertAdjacentHTML('beforeend', colorPickerHTML);
        
        const colorPicker = document.getElementById('colorPicker');
        const customColorInput = document.getElementById('customColorInput');
        let selectedColor = currentColor;
        
        // Highlight current color
        this.highlightSelectedColor(selectedColor);
        
        // Color option click handlers
        colorPicker.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                selectedColor = option.dataset.color;
                customColorInput.value = selectedColor;
                this.highlightSelectedColor(selectedColor);
            });
        });
        
        // Custom color input handler
        customColorInput.addEventListener('input', () => {
            selectedColor = customColorInput.value;
            this.highlightSelectedColor(selectedColor);
        });
        
        // Clear button handler
        document.getElementById('clearCellColor').addEventListener('click', () => {
            delete this.cellColors[cellKey];
            inputElement.style.backgroundColor = '';
            colorPicker.remove();
            this.saveData();
        });
        
        // Apply button handler
        document.getElementById('applyCellColor').addEventListener('click', () => {
            console.log('Applying color:', selectedColor, 'to cell:', cellKey);
            console.log('Input element:', inputElement);
            console.log('Current element classes:', inputElement.className);
            console.log('Current element style before:', inputElement.style.cssText);
            
            if (selectedColor === '#ffffff' || selectedColor === '#FFFFFF') {
                // If white (default), remove the custom color
                delete this.cellColors[cellKey];
                inputElement.style.backgroundColor = '';
                inputElement.style.removeProperty('background-color');
                inputElement.removeAttribute('data-custom-color');
                console.log('Removed color for cell:', cellKey);
            } else {
                this.cellColors[cellKey] = selectedColor;
                // Use multiple approaches to ensure the color is set
                inputElement.style.setProperty('background-color', selectedColor, 'important');
                inputElement.setAttribute('data-custom-color', 'true');
                console.log('Set background-color to:', selectedColor, 'for cell:', cellKey);
                console.log('Element style after setting:', inputElement.style.cssText);
                console.log('Computed style:', getComputedStyle(inputElement).backgroundColor);
            }
            
            colorPicker.remove();
            this.saveData();
        });
        
        // Position the color picker to stay within viewport
        this.positionColorPicker(colorPicker, x, y);
    }
    
    highlightSelectedColor(selectedColor) {
        // Remove previous highlights
        document.querySelectorAll('.color-option').forEach(option => {
            option.style.border = '2px solid #ccc';
        });
        
        // Highlight the selected color
        const selectedOption = document.querySelector(`[data-color="${selectedColor}"]`);
        if (selectedOption) {
            selectedOption.style.border = '2px solid #000';
        }
    }
    
    positionColorPicker(colorPicker, x, y) {
        const rect = colorPicker.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let newX = x;
        let newY = y;
        
        // Adjust X position if picker would go off-screen
        if (x + rect.width > windowWidth) {
            newX = windowWidth - rect.width - 10;
        }
        
        // Adjust Y position if picker would go off-screen
        if (y + rect.height > windowHeight) {
            newY = y - rect.height - 10;
        }
        
        // Ensure picker doesn't go off the top or left
        newX = Math.max(10, newX);
        newY = Math.max(10, newY);
        
        colorPicker.style.left = newX + 'px';
        colorPicker.style.top = newY + 'px';
    }
    
    applyCellColors() {
        // Apply saved cell colors to score inputs
        Object.entries(this.cellColors).forEach(([cellKey, color]) => {
            const [player, week] = cellKey.split('-');
            const input = document.querySelector(`input[data-player="${player}"][data-week="${week}"]`);
            if (input && input.classList.contains('score-input')) {
                input.style.setProperty('background-color', color, 'important');
                input.setAttribute('data-custom-color', 'true');
                console.log('Applied saved color:', color, 'to cell:', cellKey);
            }
        });
    }
    
    // === END CELL COLOR CUSTOMIZATION ===

    // Scorecard functionality removed
    
    getCurrentWeek() {
        const now = new Date();
        const year = now.getFullYear();
        const week = Math.ceil(((now - new Date(year, 0, 1)) / 86400000 + 1) / 7);
        return `${year}-W${week}`;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    safeExecute(() => {
        debugLog('Initializing PGA Swindle app');
        window.pgaSwindle = new PGASwindle();
        debugLog('PGA Swindle app initialized successfully');
    }, 'app initialization');
});
