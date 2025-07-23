class Minesweeper {
    constructor() {
        this.grid = document.getElementById('grid');
        this.gameBtn = document.getElementById('gameBtn');
        this.mineCountEl = document.getElementById('mineCount');
        this.messageEl = document.getElementById('message');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
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
    }
    
    startGame() {
        // ゲームをリセット
        this.cells = [];
        this.mines.clear();
        this.flags.clear();
        this.opened.clear();
        this.firstClick = true;
        this.gameOver = false;
        this.messageEl.textContent = '';
        this.messageEl.className = 'message';
        
        // グリッドを作成
        this.createGrid();
        
        // 地雷カウンターを更新
        this.updateMineCounter();
        
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
        
        // 最初のクリックの場合、地雷を配置
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
        }
        
        // マスを開く
        this.openCell(row, col);
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
        } else {
            this.flags.add(key);
            cell.classList.add('flag');
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
        
        if (won) {
            this.messageEl.textContent = 'クリア！おめでとうございます！';
            this.messageEl.classList.add('win');
            
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
    }
}

// ゲームを開始
const game = new Minesweeper();