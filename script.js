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
    size: tileSize - 2
};

function drawPacMan() {
    context.fillStyle = 'yellow';
    context.beginPath();
    context.arc(pacMan.x + pacMan.size / 2, pacMan.y + pacMan.size / 2, pacMan.size / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    context.lineTo(pacMan.x + pacMan.size / 2, pacMan.y + pacMan.size / 2);
    context.fill();
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
}

function gameLoop() {
    clearCanvas();
    drawPacMan();
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

setInterval(gameLoop, 200);
