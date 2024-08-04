const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const tileSize = 20;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

let pacMan = {
    x: tileSize * 1,
    y: tileSize * 1,
    dx: tileSize,
    dy: 0,
    size: tileSize - 2,
    speed: 200
};

let pellets = [];
let powerPellets = [];
let fruits = [];
let ghosts = [];
let movingWalls = [];
let destroyableWalls = [];
let powerUps = [];
let traps = [];
let obstacles = [];
let score = 0;
let level = 1;
let powerMode = false;
let powerModeTime = 0;
let multiplier = 1;
let lives = 3;
let gamePaused = false;
let bestScore = 0;
let avgScore = 0;
let totalGames = 0;
let leaderboard = [];
let difficulty = 1; // Difficulty levels: 1 (Easy), 2 (Medium), 3 (Hard)

function initializePellets() {
    pellets = [];
    powerPellets = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if ((row === 5 && col === 5) || (row === 5 && col === 15) || (row === 15 && col === 5) || (row === 15 && col === 15)) {
                powerPellets.push({ x: col * tileSize, y: row * tileSize });
            } else {
                pellets.push({ x: col * tileSize, y: row * tileSize });
            }
        }
    }
}

function initializeGhosts() {
    ghosts = [
        { x: tileSize * 10, y: tileSize * 10, dx: tileSize, dy: 0, color: 'red', isScared: false, speed: 200, behavior: 'random', specialAbility: 'teleport', difficulty: 'easy' },
        { x: tileSize * 15, y: tileSize * 10, dx: tileSize, dy: 0, color: 'pink', isScared: false, speed: 200, behavior: 'chase', specialAbility: 'speed', difficulty: 'medium' },
        { x: tileSize * 10, y: tileSize * 15, dx: tileSize, dy: 0, color: 'cyan', isScared: false, speed: 200, behavior: 'scatter', specialAbility: 'wall', difficulty: 'hard' },
        { x: tileSize * 15, y: tileSize * 15, dx: tileSize, dy: 0, color: 'orange', isScared: false, speed: 200, behavior: 'random', specialAbility: 'speed', difficulty: 'easy' }
    ];
}

function initializeMovingWalls() {
    movingWalls = [
        { x: tileSize * 7, y: tileSize * 7, width: tileSize * 2, height: tileSize, direction: 'horizontal', speed: 1 },
        { x: tileSize * 10, y: tileSize * 10, width: tileSize, height: tileSize * 2, direction: 'vertical', speed: 1 }
    ];
}

function initializeDestroyableWalls() {
    destroyableWalls = [
        { x: tileSize * 3, y: tileSize * 3, width: tileSize * 3, height: tileSize, isDestroyed: false },
        { x: tileSize * 10, y: tileSize * 10, width: tileSize, height: tileSize * 3, isDestroyed: false }
    ];
}

function initializePowerUps() {
    powerUps = [
        { x: tileSize * 8, y: tileSize * 8, type: 'speed', duration: 10 },
        { x: tileSize * 12, y: tileSize * 12, type: 'invincibility', duration: 10 },
        { x: tileSize * 4, y: tileSize * 4, type: 'scoreBoost', duration: 10 },
        { x: tileSize * 16, y: tileSize * 16, type: 'ghostFreeze', duration: 10 }
    ];
}

function initializeTraps() {
    traps = [
        { x: tileSize * 9, y: tileSize * 9, width: tileSize, height: tileSize, effect: 'slow' },
        { x: tileSize * 13, y: tileSize * 13, width: tileSize, height: tileSize, effect: 'damage' }
    ];
}

function initializeObstacles() {
    obstacles = [
        { x: tileSize * 6, y: tileSize * 6, width: tileSize * 2, height: tileSize },
        { x: tileSize * 12, y: tileSize * 12, width: tileSize * 3, height: tileSize }
    ];
}

function initializeLevel() {
    initializePellets();
    initializeGhosts();
    initializeMovingWalls();
    initializeDestroyableWalls();
    initializePowerUps();
    initializeTraps();
    initializeObstacles();
    fruits = [{ x: tileSize * 7, y: tileSize * 7 }];
}

initializeLevel();

function drawPacMan() {
    context.fillStyle = 'yellow';
    context.beginPath();
    context.arc(pacMan.x + pacMan.size / 2, pacMan.y + pacMan.size / 2, pacMan.size / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    context.lineTo(pacMan.x + pacMan.size / 2, pacMan.y + pacMan.size / 2);
    context.fill();
}

function drawPellets() {
    context.fillStyle = 'white';
    pellets.forEach(pellet => {
        context.beginPath();
        context.arc(pellet.x + tileSize / 2, pellet.y + tileSize / 2, 3, 0, 2 * Math.PI);
        context.fill();
    });
}

function drawPowerPellets() {
    context.fillStyle = 'blue';
    powerPellets.forEach(pellet => {
        context.beginPath();
        context.arc(pellet.x + tileSize / 2, pellet.y + tileSize / 2, 6, 0, 2 * Math.PI);
        context.fill();
    });
}

function drawFruits() {
    context.fillStyle = 'red';
    fruits.forEach(fruit => {
        context.beginPath();
        context.arc(fruit.x + tileSize / 2, fruit.y + tileSize / 2, 6, 0, 2 * Math.PI);
        context.fill();
    });
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        context.fillStyle = ghost.isScared ? 'blue' : ghost.color;
        context.beginPath();
        context.arc(ghost.x + tileSize / 2, ghost.y + tileSize / 2, pacMan.size / 2, 0, 2 * Math.PI);
        context.fill();
    });
}

function drawMovingWalls() {
    context.fillStyle = 'grey';
    movingWalls.forEach(wall => {
        context.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

function drawDestroyableWalls() {
    context.fillStyle = 'brown';
    destroyableWalls.forEach(wall => {
        if (!wall.isDestroyed) {
            context.fillRect(wall.x, wall.y, wall.width, wall.height);
        }
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        switch (powerUp.type) {
            case 'speed':
                context.fillStyle = 'green';
                break;
            case 'invincibility':
                context.fillStyle = 'purple';
                break;
            case 'scoreBoost':
                context.fillStyle = 'orange';
                break;
            case 'ghostFreeze':
                context.fillStyle = 'cyan';
                break;
        }
        context.beginPath();
        context.arc(powerUp.x + tileSize / 2, powerUp.y + tileSize / 2, 6, 0, 2 * Math.PI);
        context.fill();
    });
}

function drawTraps() {
    context.fillStyle = 'red';
    traps.forEach(trap => {
        context.fillRect(trap.x, trap.y, trap.width, trap.height);
    });
}

function drawObstacles() {
    context.fillStyle = 'grey';
    obstacles.forEach(obstacle => {
        context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawUI() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Score: ' + score, 10, 20);
    context.fillText('Lives: ' + lives, 10, 40);
    context.fillText('Level: ' + level, 10, 60);
    context.fillText('Power Mode: ' + (powerMode ? 'On' : 'Off'), 10, 80);
    context.fillText('Difficulty: ' + ['Easy', 'Medium', 'Hard'][difficulty - 1], 10, 100);
    context.fillText('Average Score: ' + Math.round(avgScore), 10, 120);
    context.fillText('Best Score: ' + bestScore, 10, 140);
    context.fillText('Total Games: ' + totalGames, 10, 160);
}

function update() {
    if (gamePaused) return;

    pacMan.x += pacMan.dx;
    pacMan.y += pacMan.dy;

    if (pacMan.x >= canvas.width) pacMan.x = 0;
    if (pacMan.x < 0) pacMan.x = canvas.width - tileSize;
    if (pacMan.y >= canvas.height) pacMan.y = 0;
    if (pacMan.y < 0) pacMan.y = canvas.height - tileSize;

    pellets = pellets.filter(pellet => {
        if (pacMan.x < pellet.x + tileSize &&
            pacMan.x + tileSize > pellet.x &&
            pacMan.y < pellet.y + tileSize &&
            pacMan.y + tileSize > pellet.y) {
            score += 10 * multiplier;
            return false;
        }
        return true;
    });

    powerPellets = powerPellets.filter(pellet => {
        if (pacMan.x < pellet.x + tileSize &&
            pacMan.x + tileSize > pellet.x &&
            pacMan.y < pellet.y + tileSize &&
            pacMan.y + tileSize > pellet.y) {
            powerMode = true;
            powerModeTime = 10;
            multiplier = 2;
            return false;
        }
        return true;
    });

    fruits = fruits.filter(fruit => {
        if (pacMan.x < fruit.x + tileSize &&
            pacMan.x + tileSize > fruit.x &&
            pacMan.y < fruit.y + tileSize &&
            pacMan.y + tileSize > fruit.y) {
            score += 50 * multiplier;
            return false;
        }
        return true;
    });

    powerUps.forEach(powerUp => {
        if (pacMan.x < powerUp.x + tileSize &&
            pacMan.x + tileSize > powerUp.x &&
            pacMan.y < powerUp.y + tileSize &&
            pacMan.y + tileSize > powerUp.y) {
            switch (powerUp.type) {
                case 'speed':
                    pacMan.speed = 100;
                    break;
                case 'invincibility':
                    powerMode = true;
                    powerModeTime = 20;
                    break;
                case 'scoreBoost':
                    multiplier = 3;
                    break;
                case 'ghostFreeze':
                    ghosts.forEach(ghost => ghost.speed = 0);
                    setTimeout(() => ghosts.forEach(ghost => ghost.speed = 200), 10000);
                    break;
            }
            powerUps = powerUps.filter(p => p !== powerUp);
        }
    });

    traps.forEach(trap => {
        if (pacMan.x < trap.x + trap.width &&
            pacMan.x + tileSize > trap.x &&
            pacMan.y < trap.y + trap.height &&
            pacMan.y + tileSize > trap.y) {
            if (trap.effect === 'slow') {
                pacMan.speed = 400;
            } else if (trap.effect === 'damage') {
                loseLife();
            }
        }
    });

    obstacles.forEach(obstacle => {
        if (pacMan.x < obstacle.x + obstacle.width &&
            pacMan.x + tileSize > obstacle.x &&
            pacMan.y < obstacle.y + obstacle.height &&
            pacMan.y + tileSize > obstacle.y) {
            pacMan.x -= pacMan.dx;
            pacMan.y -= pacMan.dy;
        }
    });

    ghosts.forEach(ghost => {
        if (powerMode) {
            ghost.isScared = true;
        } else {
            ghost.isScared = false;
        }

        // Ghost AI behavior
        switch (ghost.behavior) {
            case 'random':
                ghost.x += (Math.random() < 0.5 ? ghost.speed : -ghost.speed);
                ghost.y += (Math.random() < 0.5 ? ghost.speed : -ghost.speed);
                break;
            case 'chase':
                if (pacMan.x > ghost.x) ghost.x += ghost.speed;
                if (pacMan.x < ghost.x) ghost.x -= ghost.speed;
                if (pacMan.y > ghost.y) ghost.y += ghost.speed;
                if (pacMan.y < ghost.y) ghost.y -= ghost.speed;
                break;
            case 'scatter':
                ghost.x += Math.sin(ghost.x / 10) * ghost.speed;
                ghost.y += Math.cos(ghost.y / 10) * ghost.speed;
                break;
        }

        // Check for collision with moving walls
        movingWalls.forEach(wall => {
            if (ghost.x < wall.x + wall.width &&
                ghost.x + tileSize > wall.x &&
                ghost.y < wall.y + wall.height &&
                ghost.y + tileSize > wall.y) {
                if (wall.direction === 'horizontal') {
                    ghost.x -= ghost.speed;
                } else if (wall.direction === 'vertical') {
                    ghost.y -= ghost.speed;
                }
            }
        });

        // Ghost wrap-around
        if (ghost.x >= canvas.width) ghost.x = 0;
        if (ghost.x < 0) ghost.x = canvas.width - tileSize;
        if (ghost.y >= canvas.height) ghost.y = 0;
        if (ghost.y < 0) ghost.y = canvas.height - tileSize;

        // Check for collision with ghosts
        if (pacMan.x === ghost.x && pacMan.y === ghost.y) {
            if (powerMode) {
                ghosts = ghosts.filter(g => g !== ghost);
                score += 100 * multiplier;
            } else {
                loseLife();
            }
        }
    });

    // Check for collision with destroyable walls
    destroyableWalls.forEach(wall => {
        if (pacMan.x < wall.x + wall.width &&
            pacMan.x + tileSize > wall.x &&
            pacMan.y < wall.y + wall.height &&
            pacMan.y + tileSize > wall.y) {
            if (wall.isDestroyed) return;
            wall.isDestroyed = true;
            score += 100;
        }
    });

    // Update power mode time
    if (powerMode) {
        powerModeTime -= 0.1;
        if (powerModeTime <= 0) {
            powerMode = false;
            multiplier = 1;
        }
    }

    // Check for win condition
    if (pellets.length === 0 && powerPellets.length === 0) {
        levelUp();
    }
}

function loseLife() {
    lives--;
    if (lives <= 0) {
        gameOver();
    } else {
        resetGame();
    }
}

function resetGame() {
    pacMan.x = tileSize * 1;
    pacMan.y = tileSize * 1;
    pacMan.dx = tileSize;
    pacMan.dy = 0;
    powerMode = false;
    powerModeTime = 0;
    multiplier = 1;
    initializeLevel();
}

function levelUp() {
    level++;
    pacMan.speed = Math.max(100, pacMan.speed - 10);
    ghosts.forEach(ghost => ghost.speed = Math.max(100, ghost.speed - 10));
    initializeLevel();
    fruits.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows) });
}

function gameOver() {
    clearInterval(gameLoop);
    context.fillStyle = 'red';
    context.font = '40px Arial';
    context.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 20);
    context.font = '20px Arial';
    context.fillText('Score: ' + score, canvas.width / 2 - 50, canvas.height / 2 + 20);
    context.fillText('Lives: ' + lives, canvas.width / 2 - 50, canvas.height / 2 + 50);

    // Update game statistics
    avgScore = (avgScore * totalGames + score) / (totalGames + 1);
    totalGames++;
    bestScore = Math.max(bestScore, score);

    // Update leaderboard
    let playerName = prompt('Enter your name for the leaderboard:');
    leaderboard.push({ name: playerName, score: score });
    leaderboard.sort((a, b) => b.score - a.score);

    setTimeout(() => {
        if (confirm('Game Over! Do you want to play again?')) {
            resetGame();
            gameLoop = setInterval(gameTick, pacMan.speed);
        }
    }, 1000);
}

function gameTick() {
    update();
    clearCanvas();
    drawPellets();
    drawPowerPellets();
    drawFruits();
    drawPacMan();
    drawGhosts();
    drawMovingWalls();
    drawDestroyableWalls();
    drawPowerUps();
    drawTraps();
    drawObstacles();
    drawUI();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        pacMan.dx = 0;
        pacMan.dy = -pacMan.speed;
    } else if (e.key === 'ArrowDown') {
        pacMan.dx = 0;
        pacMan.dy = pacMan.speed;
    } else if (e.key === 'ArrowLeft') {
        pacMan.dx = -pacMan.speed;
        pacMan.dy = 0;
    } else if (e.key === 'ArrowRight') {
        pacMan.dx = pacMan.speed;
        pacMan.dy = 0;
    } else if (e.key === 'p') {
        gamePaused = !gamePaused;
        if (!gamePaused) gameLoop = setInterval(gameTick, pacMan.speed);
        else clearInterval(gameLoop);
    } else if (e.key === 'r') {
        resetGame();
    }
});

initializeLevel();
gameLoop = setInterval(gameTick, pacMan.speed);
