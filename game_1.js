
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// adding sprit sheet of main characther

// Load character sprite sheet
const spriteSheet = new Image();
spriteSheet.src = "assets/player.jpg";

let spriteReady = false;
let characterSprites;

spriteSheet.onload = () => {
    // Remove the white background
    characterSprites = document.createElement("canvas");
    characterSprites.width = spriteSheet.width;
    characterSprites.height = spriteSheet.height;

    const spriteCtx = characterSprites.getContext("2d");
    spriteCtx.drawImage(spriteSheet, 0, 0);

    const imageData = spriteCtx.getImageData(
        0, 0,
        characterSprites.width,
        characterSprites.height
    );

    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        if (
            pixels[i] > 240 &&
            pixels[i + 1] > 240 &&
            pixels[i + 2] > 240
        ) {
            pixels[i + 3] = 0;
        }
    }

    spriteCtx.putImageData(imageData, 0, 0);
    spriteReady = true;
};


// Game settings
const gravity = 0.6;
const speed = 5;
const jumpForce = -13;

// Keyboard input
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Player
const player = {
    x: 100,
    y: 100,
    width: 40,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    grounded: false,
    color: "red"
};

// Platforms
const platforms = [
    { x: 0, y: 490, width: 960, height: 50 },
    { x: 250, y: 390, width: 150, height: 20 },
    { x: 500, y: 300, width: 150, height: 20 },
    { x: 750, y: 400, width: 150, height: 20 }
];

// Update player
function update() {

    player.velocityX = 0;

    if (keys["a"] || keys["arrowleft"]) {
        player.velocityX = -speed;
    }

    if (keys["d"] || keys["arrowright"]) {
        player.velocityX = speed;
    }

    if ((keys["w"] || keys["arrowup"] || keys[" "])
        && player.grounded) {
        player.velocityY = jumpForce;
        player.grounded = false;
    }

    // Gravity
    player.velocityY += gravity;

    // Horizontal movement
    player.x += player.velocityX;

    // Vertical movement
    player.y += player.velocityY;

    player.grounded = false;

    // Platform collision
    for (const platform of platforms) {

        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + 15 &&
            player.velocityY >= 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
        }
    }

    // Keep player inside screen
    player.x = Math.max(0, Math.min(
        canvas.width - player.width,
        player.x
    ));

    // Reset if falling
    if (player.y > canvas.height) {
        player.x = 100;
        player.y = 100;
        player.velocityY = 0;
    }
}

// Draw everything
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Platforms
    ctx.fillStyle = "#228B22";

    for (const platform of platforms) {
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );
    }

    // Player
    ctx.fillStyle = player.color;

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
