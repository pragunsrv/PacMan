const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const tileSize = 20;
const cols = canvas.width / tileSize;
const rows = canvas.height / tileSize;

const pacMan = {
    x: tileSize * 1,
    y: tileSize * 1,
    dx: tileSize,
    dy: 0,
    speed: 200,
    color: 'yellow'
};

let score = 0;
let lives = 3;
let level = 1;
let powerMode = false;
let powerModeTime = 0;
let multiplier = 1;
let gamePaused = false;
let gameLoop;
let leaderboard = [];
let avgScore = 0;
let totalGames = 0;
let bestScore = 0;

const pellets = [];
const powerPellets = [];
const fruits = [];
const powerUps = [];
const traps = [];
const obstacles = [];
const destroyableWalls = [];
const movingWalls = [];
const ghosts = [
    { x: tileSize * 5, y: tileSize * 5, speed: 200, color: 'red', behavior: 'chase', isScared: false },
    { x: tileSize * 10, y: tileSize * 10, speed: 200, color: 'pink', behavior: 'scatter', isScared: false }
];

function initializeLevel() {
    pellets.length = 0;
    powerPellets.length = 0;
    fruits.length = 0;
    powerUps.length = 0;
    traps.length = 0;
    obstacles.length = 0;
    destroyableWalls.length = 0;
    movingWalls.length = 0;
    ghosts.length = 0;

    for (let i = 0; i < 50; i++) {
        pellets.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows) });
    }

    for (let i = 0; i < 4; i++) {
        powerPellets.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows) });
    }

    for (let i = 0; i < 3; i++) {
        fruits.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows) });
    }

    for (let i = 0; i < 2; i++) {
        powerUps.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows), type: ['speed', 'invincibility', 'scoreBoost', 'ghostFreeze'][i % 4] });
    }

    for (let i = 0; i < 2; i++) {
        traps.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows), width: tileSize, height: tileSize, effect: ['slow', 'damage'][i % 2] });
    }

    for (let i = 0; i < 2; i++) {
        obstacles.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows), width: tileSize, height: tileSize });
    }

    for (let i = 0; i < 2; i++) {
        destroyableWalls.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows), width: tileSize, height: tileSize, isDestroyed: false });
    }

    for (let i = 0; i < 2; i++) {
        movingWalls.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows), width: tileSize, height: tileSize, direction: ['horizontal', 'vertical'][i % 2], speed: 100 });
    }
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPellets() {
    context.fillStyle = 'white';
    pellets.forEach(pellet => {
        context.beginPath();
        context.arc(pellet.x + tileSize / 2, pellet.y + tileSize / 2, 5, 0, Math.PI * 2);
        context.fill();
    });
}

function drawPowerPellets() {
    context.fillStyle = 'blue';
    powerPellets.forEach(pellet => {
        context.beginPath();
        context.arc(pellet.x + tileSize / 2, pellet.y + tileSize / 2, 10, 0, Math.PI * 2);
        context.fill();
    });
}

function drawFruits() {
    context.fillStyle = 'green';
    fruits.forEach(fruit => {
        context.beginPath();
        context.arc(fruit.x + tileSize / 2, fruit.y + tileSize / 2, 15, 0, Math.PI * 2);
        context.fill();
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        context.fillStyle = powerUp.type === 'speed' ? 'cyan' :
                          powerUp.type === 'invincibility' ? 'magenta' :
                          powerUp.type === 'scoreBoost' ? 'yellow' :
                          'orange';
        context.fillRect(powerUp.x, powerUp.y, tileSize, tileSize);
    });
}

function drawTraps() {
    context.fillStyle = 'red';
    traps.forEach(trap => {
        context.fillRect(trap.x, trap.y, trap.width, trap.height);
    });
}

function drawObstacles() {
    context.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawDestroyableWalls() {
    destroyableWalls.forEach(wall => {
        context.fillStyle = wall.isDestroyed ? 'black' : 'brown';
        context.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

function drawMovingWalls() {
    movingWalls.forEach(wall => {
        context.fillStyle = 'purple';
        context.fillRect(wall.x, wall.y, wall.width, wall.height);
        if (wall.direction === 'horizontal') {
            wall.x += wall.speed / 100;
            if (wall.x > canvas.width) wall.x = -wall.width;
        } else if (wall.direction === 'vertical') {
            wall.y += wall.speed / 100;
            if (wall.y > canvas.height) wall.y = -wall.height;
        }
    });
}

function drawPacMan() {
    context.fillStyle = pacMan.color;
    context.beginPath();
    context.arc(pacMan.x + tileSize / 2, pacMan.y + tileSize / 2, tileSize / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    context.lineTo(pacMan.x + tileSize / 2, pacMan.y + tileSize / 2);
    context.fill();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        context.fillStyle = ghost.color;
        context.beginPath();
        context.arc(ghost.x + tileSize / 2, ghost.y + tileSize / 2, tileSize / 2, 0, Math.PI * 2);
        context.fill();
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

    checkPelletCollision();
    checkPowerPelletCollision();
    checkFruitCollision();
    checkPowerUpCollision();
    checkTrapCollision();
    checkObstacleCollision();
    checkDestroyableWallCollision();
    checkMovingWallCollision();
    updateGhosts();
}

function checkPelletCollision() {
    pellets.forEach((pellet, index) => {
        if (pacMan.x < pellet.x + tileSize &&
            pacMan.x + tileSize > pellet.x &&
            pacMan.y < pellet.y + tileSize &&
            pacMan.y + tileSize > pellet.y) {
            pellets.splice(index, 1);
            score += 10 * multiplier;
        }
    });
}

function checkPowerPelletCollision() {
    powerPellets.forEach((pellet, index) => {
        if (pacMan.x < pellet.x + tileSize &&
            pacMan.x + tileSize > pellet.x &&
            pacMan.y < pellet.y + tileSize &&
            pacMan.y + tileSize > pellet.y) {
            powerPellets.splice(index, 1);
            powerMode = true;
            powerModeTime = Date.now();
        }
    });
}

function checkFruitCollision() {
    fruits.forEach((fruit, index) => {
        if (pacMan.x < fruit.x + tileSize &&
            pacMan.x + tileSize > fruit.x &&
            pacMan.y < fruit.y + tileSize &&
            pacMan.y + tileSize > fruit.y) {
            fruits.splice(index, 1);
            score += 50 * multiplier;
        }
    });
}

function checkPowerUpCollision() {
    powerUps.forEach((powerUp, index) => {
        if (pacMan.x < powerUp.x + tileSize &&
            pacMan.x + tileSize > powerUp.x &&
            pacMan.y < powerUp.y + tileSize &&
            pacMan.y + tileSize > powerUp.y) {
            powerUps.splice(index, 1);
            applyPowerUp(powerUp.type);
        }
    });
}

function applyPowerUp(type) {
    if (type === 'speed') {
        pacMan.speed /= 2;
    } else if (type === 'invincibility') {
        powerMode = true;
    } else if (type === 'scoreBoost') {
        multiplier = 2;
    } else if (type === 'ghostFreeze') {
        ghosts.forEach(ghost => ghost.speed = 0);
    }
}

function checkTrapCollision() {
    traps.forEach((trap, index) => {
        if (pacMan.x < trap.x + trap.width &&
            pacMan.x + tileSize > trap.x &&
            pacMan.y < trap.y + trap.height &&
            pacMan.y + tileSize > trap.y) {
            if (trap.effect === 'slow') {
                pacMan.speed *= 2;
            } else if (trap.effect === 'damage') {
                lives--;
                if (lives <= 0) {
                    endGame();
                }
            }
            traps.splice(index, 1);
        }
    });
}

function checkObstacleCollision() {
    obstacles.forEach(obstacle => {
        if (pacMan.x < obstacle.x + obstacle.width &&
            pacMan.x + tileSize > obstacle.x &&
            pacMan.y < obstacle.y + obstacle.height &&
            pacMan.y + tileSize > obstacle.y) {
            // Collision with obstacles, maybe stop movement
            pacMan.x -= pacMan.dx;
            pacMan.y -= pacMan.dy;
        }
    });
}

function checkDestroyableWallCollision() {
    destroyableWalls.forEach((wall, index) => {
        if (pacMan.x < wall.x + wall.width &&
            pacMan.x + tileSize > wall.x &&
            pacMan.y < wall.y + wall.height &&
            pacMan.y + tileSize > wall.y) {
            if (wall.isDestroyed) {
                destroyableWalls.splice(index, 1);
            } else {
                wall.isDestroyed = true;
            }
        }
    });
}

function checkMovingWallCollision() {
    movingWalls.forEach(wall => {
        if (pacMan.x < wall.x + wall.width &&
            pacMan.x + tileSize > wall.x &&
            pacMan.y < wall.y + wall.height &&
            pacMan.y + tileSize > wall.y) {
            // Collision with moving walls, maybe stop movement
            pacMan.x -= pacMan.dx;
            pacMan.y -= pacMan.dy;
        }
    });
}

function updateGhosts() {
    ghosts.forEach(ghost => {
        ghost.x += ghost.speed / 100;
        ghost.y += ghost.speed / 100;

        if (ghost.x >= canvas.width) ghost.x = 0;
        if (ghost.x < 0) ghost.x = canvas.width - tileSize;
        if (ghost.y >= canvas.height) ghost.y = 0;
        if (ghost.y < 0) ghost.y = canvas.height - tileSize;

        if (powerMode && !ghost.isScared) {
            ghost.isScared = true;
            ghost.color = 'blue';
        } else if (!powerMode && ghost.isScared) {
            ghost.isScared = false;
            ghost.color = ghost.color === 'blue' ? 'red' : ghost.color;
        }
    });
}

function endGame() {
    clearInterval(gameLoop);
    leaderboard.push(score);
    totalGames++;
    avgScore = (avgScore * (totalGames - 1) + score) / totalGames;
    bestScore = Math.max(bestScore, score);
    alert('Game Over! Your score: ' + score);
    initializeLevel();
    pacMan.x = tileSize * 1;
    pacMan.y = tileSize * 1;
    score = 0;
    lives = 3;
    level = 1;
    powerMode = false;
    powerModeTime = 0;
    multiplier = 1;
    gamePaused = false;
    gameLoop = setInterval(gameLoopFunction, pacMan.speed);
}

function gameLoopFunction() {
    clearCanvas();
    update();
    drawPellets();
    drawPowerPellets();
    drawFruits();
    drawPowerUps();
    drawTraps();
    drawObstacles();
    drawDestroyableWalls();
    drawMovingWalls();
    drawPacMan();
    drawGhosts();
    drawUI();
}

document.addEventListener('keydown', event => {
    if (event.code === 'ArrowUp') {
        pacMan.dy = -tileSize;
        pacMan.dx = 0;
    } else if (event.code === 'ArrowDown') {
        pacMan.dy = tileSize;
        pacMan.dx = 0;
    } else if (event.code === 'ArrowLeft') {
        pacMan.dy = 0;
        pacMan.dx = -tileSize;
    } else if (event.code === 'ArrowRight') {
        pacMan.dy = 0;
        pacMan.dx = tileSize;
    } else if (event.code === 'Space') {
        gamePaused = !gamePaused;
        if (!gamePaused) gameLoop = setInterval(gameLoopFunction, pacMan.speed);
        else clearInterval(gameLoop);
    } else if (event.code === 'KeyR') {
        endGame();
    }
});

initializeLevel();
gameLoop = setInterval(gameLoopFunction, pacMan.speed);
