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
        { x: tileSize * 10, y: tileSize * 10, dx: tileSize, dy: 0, color: 'red', isScared: false, speed: 200, behavior: 'random', specialAbility: 'teleport' },
        { x: tileSize * 15, y: tileSize * 10, dx: tileSize, dy: 0, color: 'pink', isScared: false, speed: 200, behavior: 'chase', specialAbility: 'speed' },
        { x: tileSize * 10, y: tileSize * 15, dx: tileSize, dy: 0, color: 'cyan', isScared: false, speed: 200, behavior: 'scatter', specialAbility: 'wall' },
        { x: tileSize * 15, y: tileSize * 15, dx: tileSize, dy: 0, color: 'orange', isScared: false, speed: 200, behavior: 'random', specialAbility: 'speed' }
    ];
}

function initializeMovingWalls() {
    movingWalls = [
        { x: tileSize * 7, y: tileSize * 7, width: tileSize * 2, height: tileSize, direction: 'horizontal', speed: 1 },
        { x: tileSize * 10, y: tileSize * 10, width: tileSize, height: tileSize * 2, direction: 'vertical', speed: 1 }
    ];
}

function initializeLevel() {
    initializePellets();
    initializeGhosts();
    initializeMovingWalls();
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

function drawUI() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Score: ' + score, 10, 20);
    context.fillText('Level: ' + level, 10, 40);
    context.fillText('Lives: ' + lives, 10, 60);
    context.fillText('Multiplier: x' + multiplier, 10, 80);
    context.fillText('Best Score: ' + bestScore, canvas.width - 150, 20);
    context.fillText('Average Score: ' + avgScore.toFixed(2), canvas.width - 150, 40);
    if (powerMode) {
        context.fillStyle = 'white';
        context.font = '16px Arial';
        context.fillText('Power Mode: ' + powerModeTime, 10, 100);
    }
    drawLeaderboard();
}

function drawLeaderboard() {
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.fillText('Leaderboard:', canvas.width - 150, 60);
    leaderboard.slice(0, 5).forEach((entry, index) => {
        context.fillText(`${index + 1}. ${entry.name}: ${entry.score}`, canvas.width - 150, 80 + index * 20);
    });
}

function clearCanvas() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function update() {
    if (gamePaused) return;

    pacMan.x += pacMan.dx;
    pacMan.y += pacMan.dy;

    if (pacMan.x >= canvas.width) pacMan.x = 0;
    if (pacMan.x < 0) pacMan.x = canvas.width - tileSize;
    if (pacMan.y >= canvas.height) pacMan.y = 0;
    if (pacMan.y < 0) pacMan.y = canvas.height - tileSize;

    // Check for pellet collision
    pellets = pellets.filter(pellet => {
        const eaten = !(pellet.x === pacMan.x && pellet.y === pacMan.y);
        if (!eaten) {
            score += 10 * multiplier;
        }
        return eaten;
    });

    // Check for power pellet collision
    powerPellets = powerPellets.filter(pellet => {
        const eaten = !(pellet.x === pacMan.x && pellet.y === pacMan.y);
        if (!eaten) {
            powerMode = true;
            powerModeTime = 100;
            ghosts.forEach(ghost => ghost.isScared = true);
            multiplier = 2;
        }
        return eaten;
    });

    // Check for fruit collision
    fruits = fruits.filter(fruit => {
        const eaten = !(fruit.x === pacMan.x && fruit.y === pacMan.y);
        if (!eaten) {
            score += 50 * multiplier;
        }
        return eaten;
    });

    if (powerMode) {
        powerModeTime--;
        if (powerModeTime <= 0) {
            powerMode = false;
            ghosts.forEach(ghost => ghost.isScared = false);
            multiplier = 1;
        }
    }

    // Move ghosts with advanced AI and special abilities
    ghosts.forEach(ghost => {
        if (ghost.specialAbility === 'teleport' && Math.random() < 0.01) {
            ghost.x = tileSize * Math.floor(Math.random() * cols);
            ghost.y = tileSize * Math.floor(Math.random() * rows);
        }

        if (ghost.specialAbility === 'speed') {
            ghost.speed = Math.random() < 0.01 ? ghost.speed * 2 : ghost.speed;
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

        // Check for collision with walls
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

    // Check for collision with moving walls
    movingWalls.forEach(wall => {
        if (pacMan.x < wall.x + wall.width &&
            pacMan.x + tileSize > wall.x &&
            pacMan.y < wall.y + wall.height &&
            pacMan.y + tileSize > wall.y) {
            pacMan.x -= pacMan.dx;
            pacMan.y -= pacMan.dy;
        }
    });

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
    drawUI();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        pacMan.dx = 0;
        pacMan.dy = -tileSize;
    }
    if (e.key === 'ArrowDown') {
        pacMan.dx = 0;
        pacMan.dy = tileSize;
    }
    if (e.key === 'ArrowLeft') {
        pacMan.dx = -tileSize;
        pacMan.dy = 0;
    }
    if (e.key === 'ArrowRight') {
        pacMan.dx = tileSize;
        pacMan.dy = 0;
    }
    if (e.key === 'p') {
        gamePaused = !gamePaused;
        if (!gamePaused) {
            gameLoop = setInterval(gameTick, pacMan.speed);
        } else {
            clearInterval(gameLoop);
        }
    }
});

resetGame();
let gameLoop = setInterval(gameTick, pacMan.speed);
