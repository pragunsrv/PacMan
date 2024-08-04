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
let score = 0;
let level = 1;
let powerMode = false;
let powerModeTime = 0;
let multiplier = 1;

const ghostBaseSpeed = 200;

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

let ghosts = [
    { x: tileSize * 10, y: tileSize * 10, dx: tileSize, dy: 0, color: 'red', isScared: false, speed: ghostBaseSpeed, behavior: 'random' },
    { x: tileSize * 15, y: tileSize * 10, dx: tileSize, dy: 0, color: 'pink', isScared: false, speed: ghostBaseSpeed, behavior: 'chase' },
    { x: tileSize * 10, y: tileSize * 15, dx: tileSize, dy: 0, color: 'cyan', isScared: false, speed: ghostBaseSpeed, behavior: 'scatter' },
    { x: tileSize * 15, y: tileSize * 15, dx: tileSize, dy: 0, color: 'orange', isScared: false, speed: ghostBaseSpeed, behavior: 'random' }
];

initializePellets();

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

function clearCanvas() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function update() {
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
            multiplier = 2; // Double score during power mode
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
            multiplier = 1; // Reset multiplier after power mode
        }
    }

    // Move ghosts
    ghosts.forEach(ghost => {
        if (ghost.behavior === 'random') {
            if (Math.random() < 0.1) {
                const directions = [
                    { dx: tileSize, dy: 0 },
                    { dx: -tileSize, dy: 0 },
                    { dx: 0, dy: tileSize },
                    { dx: 0, dy: -tileSize }
                ];
                const direction = directions[Math.floor(Math.random() * directions.length)];
                ghost.dx = direction.dx;
                ghost.dy = direction.dy;
            }
        } else if (ghost.behavior === 'chase') {
            if (pacMan.x > ghost.x) ghost.dx = tileSize;
            if (pacMan.x < ghost.x) ghost.dx = -tileSize;
            if (pacMan.y > ghost.y) ghost.dy = tileSize;
            if (pacMan.y < ghost.y) ghost.dy = -tileSize;
        } else if (ghost.behavior === 'scatter') {
            if (ghost.x < canvas.width / 2) ghost.dx = tileSize;
            if (ghost.x >= canvas.width / 2) ghost.dx = -tileSize;
            if (ghost.y < canvas.height / 2) ghost.dy = tileSize;
            if (ghost.y >= canvas.height / 2) ghost.dy = -tileSize;
        }

        ghost.x += ghost.dx;
        ghost.y += ghost.dy;

        if (ghost.x >= canvas.width) ghost.x = 0;
        if (ghost.x < 0) ghost.x = canvas.width - tileSize;
        if (ghost.y >= canvas.height) ghost.y = 0;
        if (ghost.y < 0) ghost.y = canvas.height - tileSize;

        // Check for collision with Pac-Man
        if (ghost.x === pacMan.x && ghost.y === pacMan.y) {
            if (ghost.isScared) {
                ghost.x = tileSize * 10;
                ghost.y = tileSize * 10;
                ghost.isScared = false;
                score += 10 * multiplier;
            } else {
                gameOver();
            }
        }
    });

    if (pellets.length === 0 && powerPellets.length === 0) {
        levelUp();
    }
}

function drawScore() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Score: ' + score, 10, 20);
    context.fillText('Level: ' + level, 10, 40);
    context.fillText('Multiplier: x' + multiplier, 10, 60);
}

function resetGame() {
    pacMan.x = tileSize * 1;
    pacMan.y = tileSize * 1;
    pacMan.dx = tileSize;
    pacMan.dy = 0;
    score = 0;
    level = 1;
    powerMode = false;
    powerModeTime = 0;
    multiplier = 1;
    ghosts.forEach(ghost => {
        ghost.x = tileSize * (Math.random() * (cols - 2) + 1);
        ghost.y = tileSize * (Math.random() * (rows - 2) + 1);
        ghost.isScared = false;
        ghost.speed = ghostBaseSpeed;
    });
    initializePellets();
    fruits = [{ x: tileSize * 7, y: tileSize * 7 }];
}

function levelUp() {
    level++;
    pacMan.speed = Math.max(100, pacMan.speed - 10);
    ghosts.forEach(ghost => ghost.speed = Math.max(100, ghost.speed - 10));
    initializePellets();
    fruits.push({ x: tileSize * Math.floor(Math.random() * cols), y: tileSize * Math.floor(Math.random() * rows) });
}

function gameOver() {
    clearInterval(gameLoop);
    context.fillStyle = 'red';
    context.font = '40px Arial';
    context.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 20);
    context.font = '20px Arial';
    context.fillText('Score: ' + score, canvas.width / 2 - 50, canvas.height / 2 + 20);
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
    drawScore();
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
});

resetGame();
let gameLoop = setInterval(gameTick, pacMan.speed);
