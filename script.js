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
let score = 0;
let level = 1;
let powerMode = false;
let powerModeTime = 0;

const ghostBaseSpeed = 200;

// Initialize pellets and power pellets
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
    { x: tileSize * 10, y: tileSize * 10, dx: tileSize, dy: 0, color: 'red', isScared: false, speed: ghostBaseSpeed },
    { x: tileSize * 15, y: tileSize * 10, dx: tileSize, dy: 0, color: 'pink', isScared: false, speed: ghostBaseSpeed },
    { x: tileSize * 10, y: tileSize * 15, dx: tileSize, dy: 0, color: 'cyan', isScared: false, speed: ghostBaseSpeed },
    { x: tileSize * 15, y: tileSize * 15, dx: tileSize, dy: 0, color: 'orange', isScared: false, speed: ghostBaseSpeed }
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
            score++;
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
        }
        return eaten;
    });

    if (powerMode) {
        powerModeTime--;
        if (powerModeTime <= 0) {
            powerMode = false;
            ghosts.forEach(ghost => ghost.isScared = false);
        }
    }

    // Move ghosts
    ghosts.forEach(ghost => {
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
                score += 10;
            } else {
                resetGame();
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
}

function resetGame() {
    pacMan.x = tileSize * 1;
    pacMan.y = tileSize * 1;
    pacMan.dx = tileSize;
    pacMan.dy = 0;
    score = 0;
    level = 1;
    initializePellets();
    ghosts.forEach(ghost => {
        ghost.x = tileSize * 10;
        ghost.y = tileSize * 10;
        ghost.isScared = false;
    });
}

function levelUp() {
    level++;
    pacMan.speed -= 20;
    ghosts.forEach(ghost => {
        ghost.speed -= 20;
    });
    initializePellets();
}

function gameLoop() {
    clearCanvas();
    drawPellets();
    drawPowerPellets();
    drawPacMan();
    drawGhosts();
    drawScore();
    update();
}

document.addEventListener('keydown', (event) => {
    const { key } = event;
    if (key === 'ArrowUp' && pacMan.dy === 0) {
        pacMan.dx = 0;
        pacMan.dy = -tileSize;
    } else if (key === 'ArrowDown' && pacMan.dy === 0) {
        pacMan.dx = 0;
        pacMan.dy = tileSize;
    } else if (key === 'ArrowLeft' && pacMan.dx === 0) {
        pacMan.dx = -tileSize;
        pacMan.dy = 0;
    } else if (key === 'ArrowRight' && pacMan.dx === 0) {
        pacMan.dx = tileSize;
        pacMan.dy = 0;
    }
});

setInterval(gameLoop, pacMan.speed);
