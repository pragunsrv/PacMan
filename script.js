const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const tileSize = 40;
const pacMan = {
    x: tileSize * 1,
    y: tileSize * 1,
    size: tileSize,
    dx: 0,
    dy: 0,
    speed: 200,
    color: 'yellow'
};

let pellets = [];
let powerPellets = [];
let fruits = [];
let powerUps = [];
let traps = [];
let obstacles = [];
let destroyableWalls = [];
let movingWalls = [];
let ghosts = [];
let score = 0;
let lives = 3;
let level = 1;
let multiplier = 1;
let powerMode = false;
let powerModeTime = 0;
let bestScore = 0;
let avgScore = 0;
let totalGames = 0;
let gamePaused = false;

function initializeLevel() {
    pellets = [];
    powerPellets = [];
    fruits = [];
    powerUps = [];
    traps = [];
    obstacles = [];
    destroyableWalls = [];
    movingWalls = [];
    ghosts = [];
    
    // Example initialization, you can customize
    for (let i = 0; i < 10; i++) {
        pellets.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
    }
    for (let i = 0; i < 2; i++) {
        powerPellets.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
    }
    for (let i = 0; i < 1; i++) {
        fruits.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
    }
    for (let i = 0; i < 1; i++) {
        powerUps.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, type: 'speed' });
    }
    for (let i = 0; i < 1; i++) {
        traps.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, width: tileSize, height: tileSize, effect: 'slow' });
    }
    for (let i = 0; i < 1; i++) {
        obstacles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, width: tileSize, height: tileSize });
    }
    for (let i = 0; i < 1; i++) {
        destroyableWalls.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, width: tileSize, height: tileSize, isDestroyed: false });
    }
    for (let i = 0; i < 1; i++) {
        movingWalls.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, width: tileSize, height: tileSize, direction: 'right', speed: 2 });
    }
    ghosts.push({ x: canvas.width / 2, y: canvas.height / 2, size: tileSize, color: 'red', speed: 2, behavior: 'chase' });
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPellets() {
    context.fillStyle = 'white';
    pellets.forEach(pellet => {
        context.beginPath();
        context.arc(pellet.x, pellet.y, tileSize / 4, 0, 2 * Math.PI);
        context.fill();
    });
}

function drawPowerPellets() {
    context.fillStyle = 'cyan';
    powerPellets.forEach(pellet => {
        context.beginPath();
        context.arc(pellet.x, pellet.y, tileSize / 2, 0, 2 * Math.PI);
        context.fill();
    });
}

function drawFruits() {
    context.fillStyle = 'orange';
    fruits.forEach(fruit => {
        context.beginPath();
        context.arc(fruit.x, fruit.y, tileSize / 3, 0, 2 * Math.PI);
        context.fill();
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        if (powerUp.type === 'speed') {
            context.fillStyle = 'green';
        } else if (powerUp.type === 'invincibility') {
            context.fillStyle = 'blue';
        } else if (powerUp.type === 'scoreBoost') {
            context.fillStyle = 'yellow';
        } else if (powerUp.type === 'ghostFreeze') {
            context.fillStyle = 'purple';
        }
        context.fillRect(powerUp.x, powerUp.y, tileSize / 2, tileSize / 2);
    });
}

function drawTraps() {
    traps.forEach(trap => {
        if (trap.effect === 'slow') {
            context.fillStyle = 'brown';
        } else if (trap.effect === 'damage') {
            context.fillStyle = 'red';
        }
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
    context.fillStyle = 'purple';
    destroyableWalls.forEach(wall => {
        if (!wall.isDestroyed) {
            context.fillRect(wall.x, wall.y, wall.width, wall.height);
        }
    });
}

function drawMovingWalls() {
    context.fillStyle = 'pink';
    movingWalls.forEach(wall => {
        context.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

function drawPacMan() {
    context.fillStyle = pacMan.color;
    context.beginPath();
    context.arc(pacMan.x, pacMan.y, pacMan.size / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    context.lineTo(pacMan.x, pacMan.y);
    context.fill();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        context.fillStyle = ghost.color;
        context.beginPath();
        context.arc(ghost.x, ghost.y, ghost.size / 2, 0, 2 * Math.PI);
        context.fill();
    });
}

function drawUI() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Score: ' + score, 10, 20);
    context.fillText('Lives: ' + lives, 10, 40);
    context.fillText('Level: ' + level, 10, 60);
    context.fillText('Best Score: ' + bestScore, 10, 80);
    context.fillText('Average Score: ' + Math.round(avgScore), 10, 100);
}

function update() {
    if (gamePaused) return;

    pacMan.x += pacMan.dx;
    pacMan.y += pacMan.dy;

    if (pacMan.x < 0) pacMan.x = canvas.width - pacMan.size;
    if (pacMan.x >= canvas.width) pacMan.x = 0;
    if (pacMan.y < 0) pacMan.y = canvas.height - pacMan.size;
    if (pacMan.y >= canvas.height) pacMan.y = 0;

    checkPelletCollision();
    checkPowerPelletCollision();
    checkFruitCollision();
    checkPowerUpCollision();
    checkTrapCollision();
    checkObstacleCollision();
    checkDestroyableWallCollision();
    checkMovingWallCollision();
    updateGhosts();

    if (powerMode && Date.now() - powerModeTime > 10000) {
        powerMode = false;
        ghosts.forEach(ghost => ghost.isScared = false);
    }
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
            if (powerUp.type === 'speed') {
                pacMan.speed /= 2;
            } else if (powerUp.type === 'invincibility') {
                // Implement invincibility
            } else if (powerUp.type === 'scoreBoost') {
                multiplier *= 2;
            } else if (powerUp.type === 'ghostFreeze') {
                ghosts.forEach(ghost => ghost.speed = 0);
            }
        }
    });
}

function checkTrapCollision() {
    traps.forEach((trap, index) => {
        if (pacMan.x < trap.x + trap.width &&
            pacMan.x + pacMan.size > trap.x &&
            pacMan.y < trap.y + trap.height &&
            pacMan.y + pacMan.size > trap.y) {
            if (trap.effect === 'slow') {
                pacMan.speed *= 2;
            } else if (trap.effect === 'damage') {
                lives--;
            }
        }
    });
}

function checkObstacleCollision() {
    obstacles.forEach(obstacle => {
        if (pacMan.x < obstacle.x + obstacle.width &&
            pacMan.x + pacMan.size > obstacle.x &&
            pacMan.y < obstacle.y + obstacle.height &&
            pacMan.y + pacMan.size > obstacle.y) {
            // Handle collision with obstacle
        }
    });
}

function checkDestroyableWallCollision() {
    destroyableWalls.forEach(wall => {
        if (!wall.isDestroyed &&
            pacMan.x < wall.x + wall.width &&
            pacMan.x + pacMan.size > wall.x &&
            pacMan.y < wall.y + wall.height &&
            pacMan.y + pacMan.size > wall.y) {
            wall.isDestroyed = true;
        }
    });
}

function checkMovingWallCollision() {
    movingWalls.forEach(wall => {
        if (pacMan.x < wall.x + wall.width &&
            pacMan.x + pacMan.size > wall.x &&
            pacMan.y < wall.y + wall.height &&
            pacMan.y + pacMan.size > wall.y) {
            // Handle collision with moving wall
        }
    });
}

function updateGhosts() {
    ghosts.forEach(ghost => {
        // Simple movement logic for ghosts
        if (ghost.behavior === 'chase') {
            if (pacMan.x < ghost.x) ghost.x -= ghost.speed;
            if (pacMan.x > ghost.x) ghost.x += ghost.speed;
            if (pacMan.y < ghost.y) ghost.y -= ghost.speed;
            if (pacMan.y > ghost.y) ghost.y += ghost.speed;
        }
        // Collision detection with Pac-Man
        if (pacMan.x < ghost.x + ghost.size &&
            pacMan.x + pacMan.size > ghost.x &&
            pacMan.y < ghost.y + ghost.size &&
            pacMan.y + pacMan.size > ghost.y) {
            if (powerMode) {
                ghosts = ghosts.filter(g => g !== ghost);
                score += 200 * multiplier;
            } else {
                lives--;
                if (lives <= 0) {
                    gameOver();
                } else {
                    resetLevel();
                }
            }
        }
    });
}

function gameOver() {
    clearInterval(gameLoop);
    if (score > bestScore) bestScore = score;
    avgScore = (avgScore * totalGames + score) / (totalGames + 1);
    totalGames++;
    alert('Game Over! Final Score: ' + score);
}

function resetLevel() {
    pacMan.x = tileSize * 1;
    pacMan.y = tileSize * 1;
    pacMan.dx = 0;
    pacMan.dy = 0;
    initializeLevel();
}

function gameLoopFunction() {
    if (!gamePaused) {
        update();
        clearCanvas();
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
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') pacMan.dy = -pacMan.speed;
    if (e.key === 'ArrowDown') pacMan.dy = pacMan.speed;
    if (e.key === 'ArrowLeft') pacMan.dx = -pacMan.speed;
    if (e.key === 'ArrowRight') pacMan.dx = pacMan.speed;
    if (e.key === 'p') gamePaused = !gamePaused;
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') pacMan.dy = 0;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') pacMan.dx = 0;
});

initializeLevel();
const gameLoop = setInterval(gameLoopFunction, pacMan.speed);
