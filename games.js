// Mindflayer Chase Game Logic

const canvas = document.getElementById('mindflayer-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-game-btn');

// Responsive Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = 500;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let gameInterval;
let isGameRunning = false;
let score = 0;
let speed = 6;
let gameTime = 0;

// Assets
const player = { x: 100, y: 250, width: 60, height: 30, color: '#00FFFF', dy: 0 };
const obstacles = [];
const particles = [];

// Controls
const keys = {};
document.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    keys[e.code] = true;
});
document.addEventListener('keyup', e => keys[e.code] = false);

if (startBtn) {
    startBtn.addEventListener('click', startGame);
}

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    score = 0;
    speed = 6;
    gameTime = 0;
    obstacles.length = 0;
    particles.length = 0;
    player.y = canvas.height / 2;
    player.x = 100;
    startBtn.innerText = "RUNNING...";
    startBtn.disabled = true;

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(update, 1000 / 60);
}

function spawnObstacle() {
    const size = 30 + Math.random() * 40;
    obstacles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - size),
        width: size,
        height: size,
        color: Math.random() > 0.5 ? '#E71D36' : '#555', // Red rocks or grey debris
        type: Math.random() > 0.8 ? 'moving' : 'static',
        dy: (Math.random() - 0.5) * 2
    });
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: color
        });
    }
}

function update() {
    gameTime++;

    // Clear with trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Road/Ground Lines (Perspective effect)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }
    ctx.stroke();

    // Player Movement (Free movement in full width)
    if (keys['ArrowUp'] && player.y > 0) player.y -= 7;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += 7;
    if (keys['ArrowLeft'] && player.x > 0) player.x -= 5;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += 5;

    // Spawn Obstacles
    if (gameTime % Math.max(20, 60 - Math.floor(score / 50)) === 0) spawnObstacle();

    // Update Obstacles
    obstacles.forEach((obs, index) => {
        obs.x -= speed;
        if (obs.type === 'moving') obs.y += obs.dy;

        // Collision
        if (rectIntersect(player, obs)) {
            createParticles(player.x, player.y, '#00FFFF', 20);
            gameOver();
        }

        // Remove off-screen
        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
            score += 10;
            if (score % 200 === 0) speed += 0.5;
        }

        // Draw Obstacle
        ctx.fillStyle = obs.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 0;
    });

    // Update Particles
    particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) particles.splice(index, 1);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1.0;
    });

    // Draw Player (Car)
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00FFFF';
    // Car Body
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Cabin
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 10, player.y + 5, 20, 20);
    ctx.shadowBlur = 0;

    // Headlights
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width, player.y + 5);
    ctx.lineTo(player.x + 300, player.y - 50);
    ctx.lineTo(player.x + 300, player.y + player.height + 50);
    ctx.lineTo(player.x + player.width, player.y + player.height - 5);
    ctx.fill();

    // The Mindflayer (Background Presence)
    // A giant shadow storm that gets closer if you are too far left
    const threatLevel = Math.max(0, (300 - player.x) / 300); // 0 to 1
    if (threatLevel > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${threatLevel * 0.8})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Dim the world

        // Storm clouds
        ctx.fillStyle = `rgba(100, 0, 0, ${threatLevel * 0.5})`;
        ctx.beginPath();
        ctx.arc(0, canvas.height / 2, 400 * threatLevel, 0, Math.PI * 2);
        ctx.fill();
    }

    // UI
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Roboto Mono"';
    ctx.fillText(`DISTANCE: ${score}m`, 20, 40);
    ctx.fillText(`SPEED: ${Math.floor(speed * 10)} MPH`, 20, 70);
}

function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.width ||
        r2.x + r2.width < r1.x ||
        r2.y > r1.y + r1.height ||
        r2.y + r2.height < r1.y);
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#E71D36';
    ctx.font = '60px "Creepster"';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#E71D36';
    ctx.fillText('YOU DIED', canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = '24px "Roboto Mono"';
    ctx.fillText(`Final Distance: ${score}m`, canvas.width / 2, canvas.height / 2 + 60);

    startBtn.innerText = "TRY AGAIN";
    startBtn.disabled = false;
}
