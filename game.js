
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ======================================
// GAME SETTINGS
// ======================================

const GRAVITY = 0.6;
const MOVE_SPEED = 4;
const JUMP_FORCE = -13;

// ======================================
// LOAD CHARACTER SPRITE SHEET
// ======================================


const spriteSheet = new Image();
spriteSheet.src = "assets/player.jpg";

let spriteReady = false;
let transparentSprite = document.createElement("canvas");

spriteSheet.onload = () => {
    transparentSprite.width = spriteSheet.width;
    transparentSprite.height = spriteSheet.height;

    const spriteCtx = transparentSprite.getContext("2d");

    spriteCtx.drawImage(spriteSheet, 0, 0);

    const imageData = spriteCtx.getImageData(
        0, 0,
        spriteSheet.width,
        spriteSheet.height
    );

    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        if (
            pixels[i] > 250 &&
            pixels[i + 1] > 250 &&
            pixels[i + 2] > 250
        ) {
            pixels[i + 3] = 0;
        }
    }

    spriteCtx.putImageData(imageData, 0, 0);

    spriteReady = true;
};


spriteSheet.onerror = () => {
    console.error("Could not load player sprite sheet!");
};

// Sprite sheet dimensions:
// 48 x 72 pixels per frame
// 9 columns, 4 rows

const FRAME_WIDTH = 48;
const FRAME_HEIGHT = 72;

// ======================================
// PLAYER
// ======================================

const player = {
    x: 100,
    y: 300,

    width: 36,
    height: 48,

    velocityX: 0,
    velocityY: 0,

    grounded: false,
    facing: 1,

    animationFrame: 0,
    animationTimer: 0,
    animationSpeed: 8,

    state: "idle"
};

// ======================================
// KEYBOARD CONTROLS
// ======================================

const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;

    if (
        [" ", "arrowup", "arrowleft", "arrowright"]
        .includes(e.key.toLowerCase())
    ) {
        e.preventDefault();
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// ======================================
// LEVEL PLATFORMS
// ======================================

const platforms = [
    { x: 0, y: 490, width: 960, height: 50 },
    { x: 200, y: 400, width: 150, height: 20 },
    { x: 420, y: 330, width: 150, height: 20 },
    { x: 650, y: 390, width: 150, height: 20 },
    { x: 800, y: 270, width: 120, height: 20 }
];

// ======================================
// UPDATE PLAYER
// ======================================

function update() {

    player.velocityX = 0;

    // Movement
    if (keys["a"] || keys["arrowleft"]) {
        player.velocityX = -MOVE_SPEED;
        player.facing = -1;
    }

    if (keys["d"] || keys["arrowright"]) {
        player.velocityX = MOVE_SPEED;
        player.facing = 1;
    }

    // Jump
    if (
        (keys["w"] || keys["arrowup"] || keys[" "])
        && player.grounded
    ) {
        player.velocityY = JUMP_FORCE;
        player.grounded = false;
    }

    // Gravity
    player.velocityY += GRAVITY;

    // Horizontal movement
    player.x += player.velocityX;

    // Screen boundaries
    player.x = Math.max(
        0,
        Math.min(canvas.width - player.width, player.x)
    );

    // Vertical movement
    const previousY = player.y;

    player.y += player.velocityY;

    player.grounded = false;

    // Platform collision
    for (const platform of platforms) {

        const wasAbove =
            previousY + player.height <= platform.y;

        const isBelow =
            player.y + player.height >= platform.y;

        const overlaps =
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width;

        if (
            wasAbove &&
            isBelow &&
            overlaps &&
            player.velocityY >= 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
        }
    }

    // Fall reset
    if (player.y > canvas.height + 100) {
        player.x = 100;
        player.y = 300;
        player.velocityY = 0;
    }

    // Animation state
    if (!player.grounded) {
        player.state = "jump";
    } else if (player.velocityX !== 0) {
        player.state = "walk";
    } else {
        player.state = "idle";
    }

   // Animation frames
const walkFrames = [0, 1, 2, 3, 4, 5, 6];

if (player.state === "walk") {
    player.animationTimer++;

    if (player.animationTimer >= 10) {
        player.animationFrame =
            (player.animationFrame + 1) % walkFrames.length;

        player.animationTimer = 0;
    }
} else {
    player.animationFrame = 0;
    player.animationTimer = 0;
}
}

// ======================================
// DRAW BACKGROUND
// ======================================

function drawBackground() {

    // Sky
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.8)";

    ctx.beginPath();
    ctx.arc(150, 100, 25, 0, Math.PI * 2);
    ctx.arc(180, 100, 35, 0, Math.PI * 2);
    ctx.arc(215, 100, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(600, 150, 25, 0, Math.PI * 2);
    ctx.arc(635, 150, 35, 0, Math.PI * 2);
    ctx.arc(670, 150, 25, 0, Math.PI * 2);
    ctx.fill();
}

// ======================================
// DRAW PLATFORMS
// ======================================

function drawPlatforms() {

    for (const platform of platforms) {

        // Dirt
        ctx.fillStyle = "#87552F";

        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );

        // Grass
        ctx.fillStyle = "#42A83D";

        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            7
        );

        // Grass details
        ctx.fillStyle = "#75D65A";

        for (let x = platform.x; x < platform.x + platform.width; x += 25) {
            ctx.fillRect(x, platform.y, 12, 3);
        }
    }
}

// ======================================
// DRAW CHARACTER
// ======================================


function drawPlayer() {

    if (!spriteReady) return;

    const frameWidth = 48;
    const frameHeight = 72;

    // Front-facing idle uses the first frame
    // Side-facing walking uses frames from row 2
    const sourceRow = player.state === "walk" ? 1 : 0;
    const sourceColumn = player.state === "walk"
        ? player.animationFrame
        : 0;

    const sourceX = sourceColumn * frameWidth;
    const sourceY = sourceRow * frameHeight;

    const drawWidth = 64;
    const drawHeight = 84;

    ctx.save();

    if (player.facing === -1) {
        ctx.translate(
            player.x + player.width / 2,
            0
        );

        ctx.scale(-1, 1);

        ctx.translate(
            -(player.x + player.width / 2),
            0
        );
    }

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
        transparentSprite,
        sourceX,
        sourceY,
        frameWidth,
        frameHeight,
        player.x - 14,
        player.y + player.height - drawHeight,
        drawWidth,
        drawHeight
    );

    ctx.restore();
}


// ======================================
// DRAW GAME
// ======================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBackground();

    drawPlatforms();

    drawPlayer();

}

// ======================================
// MAIN GAME LOOP
// ======================================

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
