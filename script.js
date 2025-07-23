class Minesweeper {
    constructor() {
        this.grid = document.getElementById('grid');
        this.gameBtn = document.getElementById('gameBtn');
        this.mineCountEl = document.getElementById('mineCount');
        this.messageEl = document.getElementById('message');
        this.timerEl = document.getElementById('timer');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
        // 統計関連の要素
        this.statsElements = {
            gamesPlayed: document.getElementById('gamesPlayed'),
            gamesWon: document.getElementById('gamesWon'),
            winRate: document.getElementById('winRate'),
            bestTime: document.getElementById('bestTime')
        };
        this.resetStatsBtn = document.getElementById('resetStats');
        this.soundToggle = document.getElementById('soundToggle');
        this.themeSelect = document.getElementById('themeSelect');
        this.keyboardHelpBtn = document.getElementById('keyboardHelpBtn');
        this.helpModal = document.getElementById('helpModal');
        this.modalClose = document.querySelector('.modal-close');
        
        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 5 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 20, cols: 30, mines: 99 }
        };
        
        this.currentDifficulty = 'easy';
        this.rows = 9;
        this.cols = 9;
        this.mineCount = 5;
        this.cells = [];
        this.mines = new Set();
        this.flags = new Set();
        this.opened = new Set();
        this.firstClick = true;
        this.gameOver = false;
        this.startTime = null;
        this.timerInterval = null;
        this.elapsedTime = 0;
        
        // キーボードナビゲーション用
        this.focusedRow = 0;
        this.focusedCol = 0;
        this.keyboardEnabled = false;
        
        // 統計データ
        this.stats = this.loadStats();
        
        // サウンド設定
        this.setupSounds();
        
        this.init();
    }
    
    init() {
        // 難易度ボタンのイベントリスナー
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentDifficulty = e.target.dataset.level;
                this.updateDifficulty();
            });
        });
        
        // ゲームボタンのイベントリスナー
        this.gameBtn.addEventListener('click', () => {
            this.startGame();
        });
        
        // 右クリックメニューを無効化
        this.grid.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // 初期設定（ゲームは開始しない）
        this.updateDifficultyWithoutStart();
        
        // 統計を表示
        this.updateStatsDisplay();
        
        // 統計リセットボタン
        this.resetStatsBtn.addEventListener('click', () => {
            if (confirm('統計をリセットしますか？')) {
                this.resetStats();
            }
        });
        
        // サウンドトグル
        this.soundToggle.checked = localStorage.getItem('soundEnabled') === 'true';
        this.soundToggle.addEventListener('change', (e) => {
            localStorage.setItem('soundEnabled', e.target.checked);
        });
        
        // キーボードイベント
        this.setupKeyboardControls();
        
        // テーマ設定
        this.setupTheme();
        
        // キーボードヘルプボタン
        this.keyboardHelpBtn.addEventListener('click', () => {
            this.showKeyboardHelp();
        });
        
        // モーダルを閉じる
        this.modalClose.addEventListener('click', () => {
            this.hideKeyboardHelp();
        });
        
        // モーダル外をクリックしたら閉じる
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) {
                this.hideKeyboardHelp();
            }
        });
    }
    
    updateDifficultyWithoutStart() {
        // アクティブな難易度ボタンを更新
        this.difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === this.currentDifficulty);
        });
        
        const diff = this.difficulties[this.currentDifficulty];
        this.rows = diff.rows;
        this.cols = diff.cols;
        this.mineCount = diff.mines;
        
        // グリッドのサイズを調整
        this.grid.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        this.grid.style.gridTemplateRows = `repeat(${this.rows}, 30px)`;
        
        // 地雷カウンターを更新
        this.mineCountEl.textContent = this.mineCount;
    }
    
    updateDifficulty() {
        // アクティブな難易度ボタンを更新
        this.difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === this.currentDifficulty);
        });
        
        const diff = this.difficulties[this.currentDifficulty];
        this.rows = diff.rows;
        this.cols = diff.cols;
        this.mineCount = diff.mines;
        
        // グリッドのサイズを調整
        this.grid.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        this.grid.style.gridTemplateRows = `repeat(${this.rows}, 30px)`;
        
        // 難易度変更時に自動的にゲームを開始
        this.startGame();
        
        // 統計表示を更新（難易度別のベストタイム）
        this.updateStatsDisplay();
    }
    
    startGame() {
        // ゲーム数を増やす
        this.stats.gamesPlayed++;
        this.saveStats();
        this.updateStatsDisplay();
        
        // ゲームをリセット
        this.cells = [];
        this.mines.clear();
        this.flags.clear();
        this.opened.clear();
        this.firstClick = true;
        this.gameOver = false;
        this.messageEl.textContent = '';
        this.messageEl.className = 'message';
        
        // タイマーをリセット
        this.stopTimer();
        this.elapsedTime = 0;
        this.updateTimerDisplay();
        
        // グリッドを作成
        this.createGrid();
        
        // 地雷カウンターを更新
        this.updateMineCounter();
        
        // キーボードナビゲーションを有効化
        this.keyboardEnabled = true;
        this.focusedRow = Math.floor(this.rows / 2);
        this.focusedCol = Math.floor(this.cols / 2);
        this.updateFocusedCell();
        
        // ボタンテキストを更新
        this.gameBtn.textContent = 'リトライ';
    }
    
    createGrid() {
        this.grid.innerHTML = '';
        
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // イベントリスナーを追加
                cell.addEventListener('click', (e) => this.handleLeftClick(e));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e));
                
                this.grid.appendChild(cell);
                this.cells[row][col] = cell;
            }
        }
    }
    
    handleLeftClick(e) {
        if (this.gameOver) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const key = `${row},${col}`;
        
        // フラグが立っているマスはクリックできない
        if (this.flags.has(key)) return;
        
        // 既に開いているマスはクリックできない
        if (this.opened.has(key)) return;
        
        // 最初のクリックの場合、地雷を配置とタイマー開始
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        // マスを開く
        this.openCell(row, col);
        this.playSound('click');
    }
    
    handleRightClick(e) {
        e.preventDefault();
        if (this.gameOver) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const key = `${row},${col}`;
        const cell = this.cells[row][col];
        
        // 既に開いているマスには旗を立てられない
        if (this.opened.has(key)) return;
        
        // フラグの切り替え
        if (this.flags.has(key)) {
            this.flags.delete(key);
            cell.classList.remove('flag');
            this.playSound('unflag');
        } else {
            this.flags.add(key);
            cell.classList.add('flag');
            this.playSound('flag');
        }
        
        // 地雷カウンターを更新
        this.updateMineCounter();
    }
    
    placeMines(excludeRow, excludeCol) {
        const positions = [];
        
        // 除外する位置以外のすべての位置を配列に追加
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (row !== excludeRow || col !== excludeCol) {
                    positions.push(`${row},${col}`);
                }
            }
        }
        
        // シャッフルして最初のn個を地雷として選択
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        for (let i = 0; i < this.mineCount; i++) {
            this.mines.add(positions[i]);
        }
    }
    
    openCell(row, col) {
        const key = `${row},${col}`;
        
        // 範囲外または既に開いている場合はスキップ
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
        if (this.opened.has(key)) return;
        if (this.flags.has(key)) return;
        
        this.opened.add(key);
        const cell = this.cells[row][col];
        cell.classList.add('opened');
        
        // 地雷の場合
        if (this.mines.has(key)) {
            this.revealMine(row, col);
            this.playSound('explosion');
            this.endGame(false);
            return;
        }
        
        // 周囲の地雷数を数える
        const mineCount = this.countAdjacentMines(row, col);
        
        if (mineCount > 0) {
            cell.textContent = mineCount;
            cell.classList.add(`num-${mineCount}`);
        } else {
            // 周囲に地雷がない場合、隣接するマスを自動的に開く
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    this.openCell(row + dr, col + dc);
                }
            }
        }
        
        // ゲームクリアチェック
        if (this.checkWin()) {
            this.endGame(true);
        }
    }
    
    countAdjacentMines(row, col) {
        let count = 0;
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                const key = `${newRow},${newCol}`;
                
                if (this.mines.has(key)) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    revealMine(row, col) {
        const cell = this.cells[row][col];
        cell.classList.add('mine', 'exploded');
        cell.textContent = '💣';
        
        // すべての地雷を表示
        setTimeout(() => {
            this.mines.forEach(key => {
                const [r, c] = key.split(',').map(Number);
                const mineCell = this.cells[r][c];
                if (r !== row || c !== col) {
                    mineCell.classList.add('mine', 'opened');
                    mineCell.textContent = '💣';
                }
            });
        }, 300);
    }
    
    checkWin() {
        // 地雷以外のすべてのマスが開かれたかチェック
        const totalCells = this.rows * this.cols;
        const nonMineCells = totalCells - this.mineCount;
        return this.opened.size === nonMineCells;
    }
    
    endGame(won) {
        this.gameOver = true;
        this.stopTimer();
        
        if (won) {
            this.messageEl.textContent = 'クリア！おめでとうございます！';
            this.messageEl.classList.add('win');
            this.playSound('win');
            
            // 統計を更新
            this.stats.gamesWon++;
            
            // ベストタイムを更新
            const currentTime = this.elapsedTime;
            if (!this.stats.bestTimes[this.currentDifficulty] || 
                currentTime < this.stats.bestTimes[this.currentDifficulty]) {
                this.stats.bestTimes[this.currentDifficulty] = currentTime;
            }
            
            this.saveStats();
            this.updateStatsDisplay();
            
            // すべての地雷に旗を立てる
            this.mines.forEach(key => {
                if (!this.flags.has(key)) {
                    const [r, c] = key.split(',').map(Number);
                    const cell = this.cells[r][c];
                    cell.classList.add('flag');
                }
            });
        } else {
            this.messageEl.textContent = 'ゲームオーバー';
            this.messageEl.classList.add('lose');
        }
        
        // すべてのセルをクリック不可にする
        this.grid.classList.add('game-over');
    }
    
    updateMineCounter() {
        const remaining = this.mineCount - this.flags.size;
        this.mineCountEl.textContent = remaining;
        
        // 残り地雷数に応じて視覚的フィードバック
        const mineCounterBox = document.querySelector('.mine-counter');
        mineCounterBox.classList.remove('warning', 'danger');
        
        if (remaining === 0) {
            mineCounterBox.classList.add('danger');
        } else if (remaining <= 3) {
            mineCounterBox.classList.add('warning');
        }
    }
    
    startTimer() {
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateTimerDisplay();
        }, 100);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimerDisplay() {
        const totalSeconds = Math.floor(this.elapsedTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 統計関連のメソッド
    loadStats() {
        const saved = localStorage.getItem('minesweeperStats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            bestTimes: {
                easy: null,
                medium: null,
                hard: null
            }
        };
    }
    
    saveStats() {
        localStorage.setItem('minesweeperStats', JSON.stringify(this.stats));
    }
    
    updateStatsDisplay() {
        this.statsElements.gamesPlayed.textContent = this.stats.gamesPlayed;
        this.statsElements.gamesWon.textContent = this.stats.gamesWon;
        
        const winRate = this.stats.gamesPlayed > 0 
            ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) 
            : 0;
        this.statsElements.winRate.textContent = winRate + '%';
        
        const bestTime = this.stats.bestTimes[this.currentDifficulty];
        if (bestTime) {
            const totalSeconds = Math.floor(bestTime / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            this.statsElements.bestTime.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            this.statsElements.bestTime.textContent = '--:--';
        }
    }
    
    resetStats() {
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            bestTimes: {
                easy: null,
                medium: null,
                hard: null
            }
        };
        this.saveStats();
        this.updateStatsDisplay();
    }
    
    // サウンド関連のメソッド
    setupSounds() {
        // Web Audio APIを使って簡単な効果音を生成
        this.audioContext = null;
        this.sounds = {
            click: { frequency: 800, duration: 50 },
            flag: { frequency: 1000, duration: 100 },
            unflag: { frequency: 600, duration: 100 },
            explosion: { frequency: 150, duration: 300 },
            win: { frequency: 1200, duration: 200 }
        };
    }
    
    playSound(type) {
        // 音を鳴らすかどうかの設定（デフォルトではオフ）
        const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
        if (!soundEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const sound = this.sounds[type];
            if (!sound) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = sound.frequency;
            oscillator.type = type === 'explosion' ? 'sawtooth' : 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration / 1000);
        } catch (e) {
            // 音声再生に失敗しても、ゲームは続行
            console.log('Sound playback failed:', e);
        }
    }
    
    // キーボードコントロール
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // ヘルプ関連のキーは常に有効
            switch(e.key) {
                case 'h':
                case 'H':
                case '?':
                    e.preventDefault();
                    this.showKeyboardHelp();
                    return;
                case 'Escape':
                    e.preventDefault();
                    this.hideKeyboardHelp();
                    return;
                case 's':
                case 'S':
                    e.preventDefault();
                    this.startGame();
                    return;
                case '1':
                    e.preventDefault();
                    this.selectDifficulty('easy');
                    return;
                case '2':
                    e.preventDefault();
                    this.selectDifficulty('medium');
                    return;
                case '3':
                    e.preventDefault();
                    this.selectDifficulty('hard');
                    return;
            }
            
            // ゲーム関連のキーはゲーム中のみ有効
            if (!this.keyboardEnabled || this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.moveFocus(-1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveFocus(1, 0);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveFocus(0, -1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveFocus(0, 1);
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.handleKeyboardOpen();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.handleKeyboardFlag();
                    break;
            }
        });
    }
    
    moveFocus(dRow, dCol) {
        const newRow = this.focusedRow + dRow;
        const newCol = this.focusedCol + dCol;
        
        if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
            this.focusedRow = newRow;
            this.focusedCol = newCol;
            this.updateFocusedCell();
        }
    }
    
    updateFocusedCell() {
        // 前のフォーカスを削除
        document.querySelectorAll('.cell.focused').forEach(cell => {
            cell.classList.remove('focused');
        });
        
        // 新しいフォーカスを設定
        if (this.cells[this.focusedRow] && this.cells[this.focusedRow][this.focusedCol]) {
            this.cells[this.focusedRow][this.focusedCol].classList.add('focused');
        }
    }
    
    handleKeyboardOpen() {
        const key = `${this.focusedRow},${this.focusedCol}`;
        if (!this.flags.has(key) && !this.opened.has(key)) {
            if (this.firstClick) {
                this.placeMines(this.focusedRow, this.focusedCol);
                this.firstClick = false;
                this.startTimer();
            }
            this.openCell(this.focusedRow, this.focusedCol);
            this.playSound('click');
        }
    }
    
    handleKeyboardFlag() {
        const key = `${this.focusedRow},${this.focusedCol}`;
        const cell = this.cells[this.focusedRow][this.focusedCol];
        
        if (!this.opened.has(key)) {
            if (this.flags.has(key)) {
                this.flags.delete(key);
                cell.classList.remove('flag');
                this.playSound('unflag');
            } else {
                this.flags.add(key);
                cell.classList.add('flag');
                this.playSound('flag');
            }
            this.updateMineCounter();
        }
    }
    
    showKeyboardHelp() {
        this.helpModal.classList.add('show');
    }
    
    hideKeyboardHelp() {
        this.helpModal.classList.remove('show');
    }
    
    // テーマ関連のメソッド
    setupTheme() {
        // 保存されたテーマを読み込み
        const savedTheme = localStorage.getItem('theme') || 'default';
        this.themeSelect.value = savedTheme;
        this.applyTheme(savedTheme);
        
        // テーマ変更イベント
        this.themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            this.applyTheme(theme);
            localStorage.setItem('theme', theme);
        });
    }
    
    applyTheme(theme) {
        // すべてのテーマクラスを削除
        document.body.className = document.body.className.replace(/theme-\w+/, '');
        // 新しいテーマを適用
        document.body.classList.add(`theme-${theme}`);
    }
    
    // 難易度選択メソッド
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.updateDifficulty();
    }
}

// ゲームを開始
const game = new Minesweeper();